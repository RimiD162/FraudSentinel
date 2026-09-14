"""
Tests for all 9 FraudSentinel ORM models.

Covers:
  - CRUD operations for each model
  - Foreign key relationships
  - Unique constraint enforcement
  - Relationship chain: roles → users, customers → transactions → fraud_alerts → investigations
"""

import uuid
from datetime import datetime, timezone

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

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


# ─── Role Tests ───────────────────────────────────────────────────────

class TestRole:
    def test_create_role(self, db_session: Session):
        role = Role(name="viewer", description="Read-only access")
        db_session.add(role)
        db_session.commit()

        fetched = db_session.query(Role).filter_by(name="viewer").first()
        assert fetched is not None
        assert fetched.name == "viewer"
        assert fetched.description == "Read-only access"
        assert fetched.id is not None

    def test_role_unique_name(self, db_session: Session):
        role1 = Role(name="admin", description="Admin")
        db_session.add(role1)
        db_session.commit()

        role2 = Role(name="admin", description="Duplicate")
        db_session.add(role2)
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_role_repr(self, sample_role: Role):
        assert "analyst" in repr(sample_role)


# ─── User Tests ───────────────────────────────────────────────────────

class TestUser:
    def test_create_user(self, db_session: Session, sample_role: Role):
        user = User(
            id=uuid.uuid4(),
            email="test@example.com",
            hashed_password="$2b$12$hash",
            full_name="Test User",
            role_id=sample_role.id,
        )
        db_session.add(user)
        db_session.commit()

        fetched = db_session.query(User).filter_by(email="test@example.com").first()
        assert fetched is not None
        assert fetched.full_name == "Test User"
        assert fetched.is_active is True
        assert fetched.role.name == "analyst"

    def test_user_unique_email(self, db_session: Session, sample_role: Role):
        user1 = User(
            id=uuid.uuid4(),
            email="dup@example.com",
            hashed_password="hash1",
            full_name="User 1",
            role_id=sample_role.id,
        )
        db_session.add(user1)
        db_session.commit()

        user2 = User(
            id=uuid.uuid4(),
            email="dup@example.com",
            hashed_password="hash2",
            full_name="User 2",
            role_id=sample_role.id,
        )
        db_session.add(user2)
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_user_role_relationship(self, sample_user: User, sample_role: Role):
        assert sample_user.role.name == "analyst"
        assert sample_user in sample_role.users

    def test_user_timestamps(self, sample_user: User):
        assert sample_user.created_at is not None
        assert sample_user.updated_at is not None


# ─── Customer Tests ───────────────────────────────────────────────────

class TestCustomer:
    def test_create_customer(self, db_session: Session):
        customer = Customer(
            id="C9999",
            total_transactions=5,
            total_amount=1000.50,
            fraud_count=0,
            risk_score=0.0,
        )
        db_session.add(customer)
        db_session.commit()

        fetched = db_session.get(Customer, "C9999")
        assert fetched is not None
        assert fetched.total_amount == 1000.50
        assert fetched.fraud_count == 0

    def test_customer_repr(self, sample_customer: Customer):
        assert "C0001" in repr(sample_customer)


# ─── Transaction Tests ───────────────────────────────────────────────

class TestTransaction:
    def test_create_transaction(self, sample_transaction: Transaction):
        assert sample_transaction.id == "T000001"
        assert sample_transaction.amount == 250.00
        assert sample_transaction.is_fraud is True

    def test_transaction_customer_relationship(
        self, sample_transaction: Transaction, sample_customer: Customer
    ):
        assert sample_transaction.customer.id == "C0001"
        assert sample_transaction in sample_customer.transactions

    def test_transaction_requires_customer(self, db_session: Session):
        """Transaction with invalid customer_id should fail FK constraint."""
        txn = Transaction(
            id="T999999",
            customer_id="NONEXISTENT",
            amount=100.0,
            transaction_type="payment",
            transaction_time=datetime(2025, 1, 1, tzinfo=timezone.utc),
        )
        db_session.add(txn)
        with pytest.raises(IntegrityError):
            db_session.commit()


# ─── FraudAlert Tests ────────────────────────────────────────────────

class TestFraudAlert:
    def test_create_fraud_alert(self, sample_fraud_alert: FraudAlert):
        assert sample_fraud_alert.severity == "high"
        assert sample_fraud_alert.status == "flagged"
        assert sample_fraud_alert.alert_type == "ml_detection"

    def test_fraud_alert_transaction_relationship(
        self, sample_fraud_alert: FraudAlert, sample_transaction: Transaction
    ):
        assert sample_fraud_alert.transaction.id == "T000001"
        assert sample_fraud_alert in sample_transaction.fraud_alerts

    def test_update_fraud_alert_status(
        self, db_session: Session, sample_fraud_alert: FraudAlert
    ):
        sample_fraud_alert.status = "confirmed"
        sample_fraud_alert.resolved_at = datetime.now(timezone.utc)
        db_session.commit()
        db_session.refresh(sample_fraud_alert)
        assert sample_fraud_alert.status == "confirmed"
        assert sample_fraud_alert.resolved_at is not None


# ─── ModelPrediction Tests ───────────────────────────────────────────

class TestModelPrediction:
    def test_create_model_prediction(
        self, db_session: Session, sample_transaction: Transaction
    ):
        pred = ModelPrediction(
            id=uuid.uuid4(),
            transaction_id=sample_transaction.id,
            model_name="logistic_regression",
            model_version="1.0.0",
            fraud_probability=0.87,
            predicted_label=True,
            threshold_used=0.1,
            features_json='{"amount": 250.0}',
        )
        db_session.add(pred)
        db_session.commit()

        fetched = db_session.query(ModelPrediction).first()
        assert fetched is not None
        assert fetched.model_name == "logistic_regression"
        assert fetched.fraud_probability == 0.87
        assert fetched.predicted_label is True
        assert fetched in sample_transaction.model_predictions


# ─── Investigation Tests ─────────────────────────────────────────────

class TestInvestigation:
    def test_create_investigation(
        self,
        db_session: Session,
        sample_fraud_alert: FraudAlert,
        sample_user: User,
    ):
        investigation = Investigation(
            id=uuid.uuid4(),
            alert_id=sample_fraud_alert.id,
            assigned_to=sample_user.id,
            status="open",
            notes="Initial review of suspicious transfer",
            priority=1,
        )
        db_session.add(investigation)
        db_session.commit()

        fetched = db_session.query(Investigation).first()
        assert fetched is not None
        assert fetched.status == "open"
        assert fetched.priority == 1
        assert fetched.fraud_alert.id == sample_fraud_alert.id
        assert fetched.assigned_user.email == "analyst@test.com"

    def test_investigation_without_assignee(
        self, db_session: Session, sample_fraud_alert: FraudAlert
    ):
        """Investigations can be unassigned (assigned_to is nullable)."""
        investigation = Investigation(
            id=uuid.uuid4(),
            alert_id=sample_fraud_alert.id,
            assigned_to=None,
            status="open",
            priority=3,
        )
        db_session.add(investigation)
        db_session.commit()

        fetched = db_session.query(Investigation).first()
        assert fetched.assigned_to is None
        assert fetched.assigned_user is None


# ─── AuditLog Tests ──────────────────────────────────────────────────

class TestAuditLog:
    def test_create_audit_log(self, db_session: Session, sample_user: User):
        log = AuditLog(
            id=uuid.uuid4(),
            user_id=sample_user.id,
            action="LOGIN",
            resource_type="session",
            resource_id=str(sample_user.id),
            details='{"ip": "192.168.1.1"}',
            ip_address="192.168.1.1",
        )
        db_session.add(log)
        db_session.commit()

        fetched = db_session.query(AuditLog).first()
        assert fetched is not None
        assert fetched.action == "LOGIN"
        assert fetched.user.email == "analyst@test.com"

    def test_audit_log_without_user(self, db_session: Session):
        """System-level audit logs can have no user (user_id is nullable)."""
        log = AuditLog(
            id=uuid.uuid4(),
            user_id=None,
            action="SYSTEM_STARTUP",
            resource_type="system",
        )
        db_session.add(log)
        db_session.commit()

        fetched = db_session.query(AuditLog).first()
        assert fetched.user_id is None
        assert fetched.user is None


# ─── Forecast Tests ──────────────────────────────────────────────────

class TestForecast:
    def test_create_forecast(self, db_session: Session, sample_user: User):
        forecast = Forecast(
            id=uuid.uuid4(),
            forecast_type="fraud_volume",
            target_date=datetime(2025, 7, 1, tzinfo=timezone.utc),
            predicted_value=42.5,
            confidence_lower=35.0,
            confidence_upper=50.0,
            model_used="arima",
            parameters='{"order": [1, 1, 1]}',
            created_by=sample_user.id,
        )
        db_session.add(forecast)
        db_session.commit()

        fetched = db_session.query(Forecast).first()
        assert fetched is not None
        assert fetched.forecast_type == "fraud_volume"
        assert fetched.predicted_value == 42.5
        assert fetched.confidence_lower == 35.0
        assert fetched.created_by_user.email == "analyst@test.com"

    def test_forecast_without_user(self, db_session: Session):
        """Forecasts can be system-generated (created_by is nullable)."""
        forecast = Forecast(
            id=uuid.uuid4(),
            forecast_type="transaction_volume",
            target_date=datetime(2025, 8, 1, tzinfo=timezone.utc),
            predicted_value=1500.0,
            created_by=None,
        )
        db_session.add(forecast)
        db_session.commit()

        fetched = db_session.query(Forecast).first()
        assert fetched.created_by is None


# ─── Full Chain Test ─────────────────────────────────────────────────

class TestFullChain:
    def test_complete_fraud_detection_chain(self, db_session: Session):
        """Test the full chain: role → user → customer → transaction → alert → investigation."""
        # Create role
        role = Role(name="analyst", description="Analyst role")
        db_session.add(role)
        db_session.flush()

        # Create user
        user = User(
            id=uuid.uuid4(),
            email="chain@test.com",
            hashed_password="hash",
            full_name="Chain Tester",
            role_id=role.id,
        )
        db_session.add(user)
        db_session.flush()

        # Create customer
        customer = Customer(id="C_CHAIN", total_transactions=1, total_amount=999.99)
        db_session.add(customer)
        db_session.flush()

        # Create transaction
        txn = Transaction(
            id="T_CHAIN",
            customer_id=customer.id,
            amount=999.99,
            transaction_type="withdrawal",
            transaction_time=datetime(2025, 6, 15, tzinfo=timezone.utc),
            is_fraud=True,
        )
        db_session.add(txn)
        db_session.flush()

        # Create alert
        alert = FraudAlert(
            id=uuid.uuid4(),
            transaction_id=txn.id,
            severity="critical",
            status="flagged",
        )
        db_session.add(alert)
        db_session.flush()

        # Create investigation
        inv = Investigation(
            id=uuid.uuid4(),
            alert_id=alert.id,
            assigned_to=user.id,
            status="in_progress",
            priority=1,
        )
        db_session.add(inv)
        db_session.commit()

        # Verify the full chain
        fetched_inv = db_session.query(Investigation).first()
        assert fetched_inv.fraud_alert.transaction.customer.id == "C_CHAIN"
        assert fetched_inv.assigned_user.role.name == "analyst"
        assert fetched_inv.fraud_alert.transaction.amount == 999.99
        assert fetched_inv.fraud_alert.severity == "critical"
