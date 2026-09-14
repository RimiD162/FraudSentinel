"""Investigation model for tracking fraud alert case management."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Investigation(Base):
    __tablename__ = "investigations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    alert_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("fraud_alerts.id"), nullable=False, index=True
    )
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="open"
    )  # open, in_progress, closed, escalated
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    priority: Mapped[int] = mapped_column(Integer, default=3, nullable=False)  # 1=highest
    opened_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    closed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    fraud_alert: Mapped["FraudAlert"] = relationship(
        "FraudAlert", back_populates="investigations"
    )
    assigned_user: Mapped["User | None"] = relationship(
        "User", back_populates="investigations"
    )

    def __repr__(self) -> str:
        return f"<Investigation(id={self.id}, status='{self.status}', priority={self.priority})>"
