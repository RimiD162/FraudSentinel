"""Customer model representing bank customers."""

from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[str] = mapped_column(String(20), primary_key=True)  # e.g. "C2757"
    total_transactions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    fraud_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    first_seen: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_seen: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction", back_populates="customer"
    )

    def __repr__(self) -> str:
        return f"<Customer(id='{self.id}', fraud_count={self.fraud_count})>"
