"""Model prediction model storing ML inference results for transactions."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ModelPrediction(Base):
    __tablename__ = "model_predictions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    transaction_id: Mapped[str] = mapped_column(
        ForeignKey("transactions.id"), nullable=False, index=True
    )
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    model_version: Mapped[str | None] = mapped_column(String(50), nullable=True)
    fraud_probability: Mapped[float] = mapped_column(Float, nullable=False)
    predicted_label: Mapped[bool] = mapped_column(Boolean, nullable=False)
    threshold_used: Mapped[float] = mapped_column(Float, nullable=False, default=0.5)
    features_json: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    transaction: Mapped["Transaction"] = relationship(
        "Transaction", back_populates="model_predictions"
    )

    def __repr__(self) -> str:
        return (
            f"<ModelPrediction(id={self.id}, model='{self.model_name}', "
            f"prob={self.fraud_probability})>"
        )
