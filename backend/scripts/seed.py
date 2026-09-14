"""
FraudSentinel Database Seed Script
===================================
Run from the backend/ directory:
    python -m scripts.seed

Steps:
  1. Create the 'fraudsentinel' database if it doesn't exist
  2. Run Alembic migrations (upgrade head)
  3. Seed roles (admin, analyst, viewer)
  4. Seed a default admin user
  5. Load 20K transactions from CSV → customers + transactions
  6. Generate fraud_alerts for all is_fraud=1 transactions
  7. Generate sample model_predictions for fraud transactions
  8. Print summary statistics
"""

import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

# Fix Windows console encoding for Unicode output
if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
if sys.stderr.encoding != "utf-8":
    sys.stderr.reconfigure(encoding="utf-8")

import pandas as pd
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

# Ensure backend/ is on the path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv

load_dotenv()

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.models import (
    AuditLog,
    Customer,
    Forecast,
    FraudAlert,
    Investigation,
    ModelPrediction,
    Role,
    Transaction,
    User,
)

# Path to raw CSV dataset
CSV_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "raw" / "banking_fraud" / "fraud_detection_20k.csv"

# Default admin credentials (hashed with passlib bcrypt)
DEFAULT_ADMIN_EMAIL = "admin@fraudsentinel.com"
DEFAULT_ADMIN_PASSWORD_HASH = (
    "$2b$12$LJ3m4ys3Lk0Zg7Ey7VJxXOhJvGQz5.Wq8y7dN1Yl1vK3pB4Kq6Wy"  # "admin123"
)


def create_database_if_not_exists() -> None:
    """Connect to the default 'postgres' database and create 'fraudsentinel' if needed."""
    # Parse the target database name from the URL
    db_url = settings.DATABASE_URL
    base_url = db_url.rsplit("/", 1)[0]
    db_name = db_url.rsplit("/", 1)[1].split("?")[0]

    admin_engine = create_engine(f"{base_url}/postgres", isolation_level="AUTOCOMMIT")
    with admin_engine.connect() as conn:
        result = conn.execute(
            text("SELECT 1 FROM pg_database WHERE datname = :db_name"),
            {"db_name": db_name},
        )
        if not result.fetchone():
            conn.execute(text(f'CREATE DATABASE "{db_name}"'))
            print(f"✅ Created database '{db_name}'")
        else:
            print(f"✅ Database '{db_name}' already exists")
    admin_engine.dispose()


def run_migrations() -> None:
    """Run Alembic migrations programmatically."""
    from alembic import command
    from alembic.config import Config

    alembic_ini = Path(__file__).resolve().parent.parent / "alembic.ini"
    alembic_cfg = Config(str(alembic_ini))

    # Override the URL from environment
    alembic_cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

    command.upgrade(alembic_cfg, "head")
    print("✅ Alembic migrations applied (upgrade head)")


def seed_roles(db: Session) -> dict[str, Role]:
    """Create the 3 predefined roles if they don't exist."""
    roles_data = [
        {"name": "admin", "description": "Full system access — manage users, settings, all data"},
        {"name": "analyst", "description": "Investigate fraud alerts, view analytics, run models"},
        {"name": "viewer", "description": "Read-only access to dashboards and reports"},
    ]
    roles = {}
    for data in roles_data:
        role = db.query(Role).filter(Role.name == data["name"]).first()
        if not role:
            role = Role(**data)
            db.add(role)
        roles[data["name"]] = role
    db.flush()
    print(f"✅ Seeded {len(roles)} roles: {list(roles.keys())}")
    return roles


def seed_default_users(db: Session, roles: dict[str, Role]) -> list[User]:
    """Create default admin, analyst, and viewer users if they don't exist."""
    from app.core.security import get_password_hash

    users_data = [
        {
            "email": "admin@fraudsentinel.com",
            "password": "admin123",
            "full_name": "System Administrator",
            "role": roles["admin"],
        },
        {
            "email": "analyst@fraudsentinel.com",
            "password": "analyst123",
            "full_name": "Senior Fraud Analyst",
            "role": roles["analyst"],
        },
        {
            "email": "viewer@fraudsentinel.com",
            "password": "viewer123",
            "full_name": "Auditor & Compliance Viewer",
            "role": roles["viewer"],
        },
    ]
    created = []
    for udata in users_data:
        user = db.query(User).filter(User.email == udata["email"]).first()
        if not user:
            user = User(
                id=uuid.uuid4(),
                email=udata["email"],
                hashed_password=get_password_hash(udata["password"]),
                full_name=udata["full_name"],
                role_id=udata["role"].id,
                is_active=True,
            )
            db.add(user)
            created.append(user)
            print(f"✅ Created default user: {udata['email']} ({udata['role'].name})")
        else:
            print(f"✅ User already exists: {udata['email']}")
    db.flush()
    return created


def seed_transactions_from_csv(db: Session) -> tuple[int, int, int]:
    """Load the 20K CSV dataset into customers + transactions tables.

    Returns:
        Tuple of (customers_count, transactions_count, fraud_count)
    """
    if not CSV_PATH.exists():
        print(f"❌ CSV not found at {CSV_PATH}")
        sys.exit(1)

    print(f"📂 Loading CSV: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH)
    print(f"   Rows: {len(df)}, Columns: {list(df.columns)}")

    # Parse transaction_time to datetime
    df["transaction_time"] = pd.to_datetime(df["transaction_time"], utc=True)

    # --- Seed Customers ---
    existing_customer_ids = {c.id for c in db.query(Customer.id).all()}
    customer_agg = (
        df.groupby("customer_id")
        .agg(
            total_transactions=("transaction_id", "count"),
            total_amount=("transaction_amount", "sum"),
            fraud_count=("is_fraud", "sum"),
            first_seen=("transaction_time", "min"),
            last_seen=("transaction_time", "max"),
        )
        .reset_index()
    )

    new_customers = []
    for _, row in customer_agg.iterrows():
        cid = row["customer_id"]
        if cid not in existing_customer_ids:
            fraud_ct = int(row["fraud_count"])
            total_txn = int(row["total_transactions"])
            risk = round(fraud_ct / total_txn, 4) if total_txn > 0 else 0.0
            new_customers.append(
                Customer(
                    id=cid,
                    total_transactions=total_txn,
                    total_amount=round(float(row["total_amount"]), 2),
                    fraud_count=fraud_ct,
                    risk_score=risk,
                    first_seen=row["first_seen"].to_pydatetime(),
                    last_seen=row["last_seen"].to_pydatetime(),
                )
            )
    if new_customers:
        db.bulk_save_objects(new_customers)
        db.flush()
    customers_count = len(customer_agg)
    print(f"✅ Seeded {len(new_customers)} new customers ({customers_count} total unique)")

    # --- Seed Transactions ---
    existing_txn_ids = {t.id for t in db.query(Transaction.id).all()}
    new_transactions = []
    for _, row in df.iterrows():
        tid = row["transaction_id"]
        if tid not in existing_txn_ids:
            new_transactions.append(
                Transaction(
                    id=tid,
                    customer_id=row["customer_id"],
                    amount=float(row["transaction_amount"]),
                    transaction_type=row["transaction_type"],
                    transaction_time=row["transaction_time"].to_pydatetime(),
                    location=row.get("transaction_location"),
                    device_type=row.get("device_type"),
                    previous_transactions_count=int(row.get("previous_transactions_count", 0)),
                    is_fraud=bool(row["is_fraud"]),
                )
            )

    if new_transactions:
        # Insert in batches for performance
        batch_size = 2000
        for i in range(0, len(new_transactions), batch_size):
            db.bulk_save_objects(new_transactions[i : i + batch_size])
            db.flush()
            print(f"   Inserted transactions batch {i // batch_size + 1}/"
                  f"{(len(new_transactions) + batch_size - 1) // batch_size}")

    fraud_count = int(df["is_fraud"].sum())
    print(f"✅ Seeded {len(new_transactions)} new transactions ({len(df)} total in CSV)")
    print(f"   Fraudulent: {fraud_count} ({fraud_count / len(df) * 100:.2f}%)")

    return customers_count, len(df), fraud_count


def seed_fraud_alerts(db: Session) -> int:
    """Generate fraud alerts for all transactions marked as fraud that don't already have one."""
    # Get fraud transactions that don't have an alert yet
    fraud_txns = (
        db.query(Transaction)
        .outerjoin(FraudAlert)
        .filter(Transaction.is_fraud.is_(True))
        .filter(FraudAlert.id.is_(None))
        .all()
    )

    import random

    random.seed(42)

    alerts = []
    for txn in fraud_txns:
        severity = random.choice(["medium", "high", "critical"])
        status = random.choice(["flagged", "under_review", "confirmed"])
        alerts.append(
            FraudAlert(
                id=uuid.uuid4(),
                transaction_id=txn.id,
                alert_type="ml_detection",
                severity=severity,
                status=status,
                description=f"Automated ML detection: suspicious {txn.transaction_type} "
                f"of ${txn.amount:.2f} from {txn.location or 'unknown location'}",
                created_at=txn.transaction_time,
            )
        )

    if alerts:
        db.bulk_save_objects(alerts)
        db.flush()

    print(f"✅ Created {len(alerts)} fraud alerts")
    return len(alerts)


def seed_model_predictions(db: Session) -> int:
    """Generate sample model predictions for fraud transactions."""
    import random

    random.seed(42)

    # Get fraud transactions without predictions
    fraud_txns = (
        db.query(Transaction)
        .outerjoin(ModelPrediction)
        .filter(Transaction.is_fraud.is_(True))
        .filter(ModelPrediction.id.is_(None))
        .all()
    )

    predictions = []
    for txn in fraud_txns:
        # Logistic regression prediction
        prob = round(random.uniform(0.4, 0.95), 4)
        predictions.append(
            ModelPrediction(
                id=uuid.uuid4(),
                transaction_id=txn.id,
                model_name="logistic_regression",
                model_version="1.0.0",
                fraud_probability=prob,
                predicted_label=prob >= 0.1,  # threshold from model_registry
                threshold_used=0.1,
                created_at=txn.transaction_time,
            )
        )

    if predictions:
        db.bulk_save_objects(predictions)
        db.flush()

    print(f"✅ Created {len(predictions)} model predictions")
    return len(predictions)


def print_summary(db: Session) -> None:
    """Print database table row counts."""
    print("\n" + "=" * 50)
    print("📊 DATABASE SUMMARY")
    print("=" * 50)
    tables = [
        ("roles", Role),
        ("users", User),
        ("customers", Customer),
        ("transactions", Transaction),
        ("fraud_alerts", FraudAlert),
        ("model_predictions", ModelPrediction),
        ("investigations", Investigation),
        ("audit_logs", AuditLog),
        ("forecasts", Forecast),
    ]
    for name, model in tables:
        count = db.query(model).count()
        print(f"  {name:.<30} {count:>8} rows")
    print("=" * 50)


def main() -> None:
    """Execute the full seed pipeline."""
    print("🚀 FraudSentinel Database Seed Script")
    print("=" * 50)

    # Step 1: Create database
    create_database_if_not_exists()

    # Step 2: Run migrations
    run_migrations()

    # Steps 3-7: Seed data within a single transaction
    db = SessionLocal()
    try:
        roles = seed_roles(db)
        default_users = seed_default_users(db, roles)
        seed_transactions_from_csv(db)
        seed_fraud_alerts(db)
        seed_model_predictions(db)
        db.commit()
        print("\n✅ All data committed successfully!")

        # Summary
        print_summary(db)
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error during seeding: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
