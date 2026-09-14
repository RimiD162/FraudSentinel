"""
Pytest fixtures for FraudSentinel database tests.

Uses SQLite in-memory database — no PostgreSQL required for test runs.
"""

import uuid
from datetime import datetime, timezone

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session

from app.core.database import Base
from app.models import (  # noqa: F401 — importing registers models with Base.metadata
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


# SQLite in-memory engine for testing
# We enable check_same_thread=False for SQLite compatibility with sessionmaker
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False,
)

# Enable foreign key enforcement in SQLite (off by default)
@event.listens_for(test_engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session() -> Session:
    """Create all tables, yield a session, then tear down after each test."""
    Base.metadata.create_all(bind=test_engine)
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def sample_role(db_session: Session) -> Role:
    """Create and return a sample 'analyst' role."""
    role = Role(name="analyst", description="Investigate fraud alerts")
    db_session.add(role)
    db_session.commit()
    db_session.refresh(role)
    return role


@pytest.fixture
def sample_admin_role(db_session: Session) -> Role:
    """Create and return a sample 'admin' role."""
    role = Role(name="admin", description="Full system access")
    db_session.add(role)
    db_session.commit()
    db_session.refresh(role)
    return role


@pytest.fixture
def sample_user(db_session: Session, sample_role: Role) -> User:
    """Create and return a sample user with analyst role."""
    user = User(
        id=uuid.uuid4(),
        email="analyst@test.com",
        hashed_password="$2b$12$fakehash",
        full_name="Test Analyst",
        role_id=sample_role.id,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def sample_customer(db_session: Session) -> Customer:
    """Create and return a sample customer."""
    customer = Customer(
        id="C0001",
        total_transactions=10,
        total_amount=5000.00,
        fraud_count=1,
        risk_score=0.1,
        first_seen=datetime(2025, 1, 1, tzinfo=timezone.utc),
        last_seen=datetime(2025, 6, 1, tzinfo=timezone.utc),
    )
    db_session.add(customer)
    db_session.commit()
    db_session.refresh(customer)
    return customer


@pytest.fixture
def sample_transaction(db_session: Session, sample_customer: Customer) -> Transaction:
    """Create and return a sample transaction linked to a customer."""
    txn = Transaction(
        id="T000001",
        customer_id=sample_customer.id,
        amount=250.00,
        transaction_type="transfer",
        transaction_time=datetime(2025, 3, 15, 14, 30, tzinfo=timezone.utc),
        location="California",
        device_type="mobile",
        previous_transactions_count=5,
        is_fraud=True,
    )
    db_session.add(txn)
    db_session.commit()
    db_session.refresh(txn)
    return txn


@pytest.fixture
def sample_fraud_alert(
    db_session: Session, sample_transaction: Transaction
) -> FraudAlert:
    """Create and return a sample fraud alert linked to a transaction."""
    alert = FraudAlert(
        id=uuid.uuid4(),
        transaction_id=sample_transaction.id,
        alert_type="ml_detection",
        severity="high",
        status="flagged",
        description="Suspicious transfer detected",
    )
    db_session.add(alert)
    db_session.commit()
    db_session.refresh(alert)
    return alert
