import sys
from pathlib import Path

# Ensure backend and project root are in sys.path
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_PROJECT_ROOT = _BACKEND_DIR.parent
for _p in [str(_BACKEND_DIR), str(_PROJECT_ROOT)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

import uuid
from datetime import datetime, timezone

import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.core.database import Base
from app.core.security import create_access_token, get_password_hash
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
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
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
def sample_viewer_role(db_session: Session) -> Role:
    """Create and return a sample 'viewer' role."""
    role = Role(name="viewer", description="Read-only access")
    db_session.add(role)
    db_session.commit()
    db_session.refresh(role)
    return role


@pytest.fixture
def admin_user(db_session: Session, sample_admin_role: Role) -> User:
    """Create and return an admin user with hashed password."""
    user = User(
        id=uuid.uuid4(),
        email="admin@test.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Admin User",
        role_id=sample_admin_role.id,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def analyst_user(db_session: Session, sample_role: Role) -> User:
    """Create and return an analyst user with hashed password."""
    user = User(
        id=uuid.uuid4(),
        email="analyst@test.com",
        hashed_password=get_password_hash("analyst123"),
        full_name="Analyst User",
        role_id=sample_role.id,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def viewer_user(db_session: Session, sample_viewer_role: Role) -> User:
    """Create and return a viewer user with hashed password."""
    user = User(
        id=uuid.uuid4(),
        email="viewer@test.com",
        hashed_password=get_password_hash("viewer123"),
        full_name="Viewer User",
        role_id=sample_viewer_role.id,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def sample_user(analyst_user: User) -> User:
    """Alias for backwards compatibility with existing test fixtures."""
    return analyst_user


@pytest.fixture
def admin_token(admin_user: User) -> str:
    """Generate signed JWT token for admin user."""
    return create_access_token({
        "sub": str(admin_user.id),
        "user_id": str(admin_user.id),
        "email": admin_user.email,
        "role": "admin",
    })


@pytest.fixture
def analyst_token(analyst_user: User) -> str:
    """Generate signed JWT token for analyst user."""
    return create_access_token({
        "sub": str(analyst_user.id),
        "user_id": str(analyst_user.id),
        "email": analyst_user.email,
        "role": "analyst",
    })


@pytest.fixture
def viewer_token(viewer_user: User) -> str:
    """Generate signed JWT token for viewer user."""
    return create_access_token({
        "sub": str(viewer_user.id),
        "user_id": str(viewer_user.id),
        "email": viewer_user.email,
        "role": "viewer",
    })


@pytest.fixture
def admin_headers(admin_token: str) -> dict[str, str]:
    """HTTP headers for admin authentication."""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def analyst_headers(analyst_token: str) -> dict[str, str]:
    """HTTP headers for analyst authentication."""
    return {"Authorization": f"Bearer {analyst_token}"}


@pytest.fixture
def viewer_headers(viewer_token: str) -> dict[str, str]:
    """HTTP headers for viewer authentication."""
    return {"Authorization": f"Bearer {viewer_token}"}


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


@pytest.fixture
def client(db_session: Session):
    """FastAPI TestClient fixture with overridden DB session."""
    from fastapi.testclient import TestClient
    from app.core.database import get_db
    from app.main import app

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
