"""Transaction model storing individual banking transactions."""

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[str] = mapped_column(String(20), primary_key=True)  # e.g. "T000000"
    customer_id: Mapped[str] = mapped_column(
        ForeignKey("customers.id"), nullable=False, index=True
    )
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    transaction_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # deposit, payment, transfer, withdrawal
    transaction_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    location: Mapped[str | None] = mapped_column(String(100), nullable=True)
    device_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    previous_transactions_count: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    is_fraud: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    customer: Mapped["Customer"] = relationship("Customer", back_populates="transactions")
    fraud_alerts: Mapped[list["FraudAlert"]] = relationship(
        "FraudAlert", back_populates="transaction"
    )
    model_predictions: Mapped[list["ModelPrediction"]] = relationship(
        "ModelPrediction", back_populates="transaction"
    )

    def __repr__(self) -> str:
        return f"<Transaction(id='{self.id}', amount={self.amount}, is_fraud={self.is_fraud})>"
