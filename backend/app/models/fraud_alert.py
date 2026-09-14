"""Fraud alert model for ML-triggered alerts on suspicious transactions."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class FraudAlert(Base):
    __tablename__ = "fraud_alerts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    transaction_id: Mapped[str] = mapped_column(
        ForeignKey("transactions.id"), nullable=False, index=True
    )
    alert_type: Mapped[str] = mapped_column(
        String(50), nullable=False, default="ml_detection"
    )  # ml_detection, rule_based, manual
    severity: Mapped[str] = mapped_column(
        String(20), nullable=False, default="medium"
    )  # low, medium, high, critical
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="flagged"
    )  # flagged, under_review, cleared, confirmed
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    transaction: Mapped["Transaction"] = relationship(
        "Transaction", back_populates="fraud_alerts"
    )
    investigations: Mapped[list["Investigation"]] = relationship(
        "Investigation", back_populates="fraud_alert"
    )

    def __repr__(self) -> str:
        return f"<FraudAlert(id={self.id}, severity='{self.severity}', status='{self.status}')>"
