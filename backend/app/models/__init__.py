"""SQLAlchemy ORM models for FraudSentinel.

Import all models here so that Base.metadata is fully populated
when Alembic (or create_all) inspects it.
"""

from app.models.role import Role  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.customer import Customer  # noqa: F401
from app.models.transaction import Transaction  # noqa: F401
from app.models.fraud_alert import FraudAlert  # noqa: F401
from app.models.model_prediction import ModelPrediction  # noqa: F401
from app.models.investigation import Investigation  # noqa: F401
from app.models.audit_log import AuditLog  # noqa: F401
from app.models.forecast import Forecast  # noqa: F401

__all__ = [
    "Role",
    "User",
    "Customer",
    "Transaction",
    "FraudAlert",
    "ModelPrediction",
    "Investigation",
    "AuditLog",
    "Forecast",
]
