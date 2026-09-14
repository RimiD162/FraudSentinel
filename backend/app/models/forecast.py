"""Forecast model for time-series fraud volume predictions."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Forecast(Base):
    __tablename__ = "forecasts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    forecast_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # fraud_volume, transaction_volume, risk_score
    target_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    predicted_value: Mapped[float] = mapped_column(Float, nullable=False)
    confidence_lower: Mapped[float | None] = mapped_column(Float, nullable=True)
    confidence_upper: Mapped[float | None] = mapped_column(Float, nullable=True)
    model_used: Mapped[str | None] = mapped_column(String(100), nullable=True)
    parameters: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    created_by_user: Mapped["User | None"] = relationship(
        "User", back_populates="forecasts"
    )

    def __repr__(self) -> str:
        return (
            f"<Forecast(id={self.id}, type='{self.forecast_type}', "
            f"value={self.predicted_value})>"
        )
