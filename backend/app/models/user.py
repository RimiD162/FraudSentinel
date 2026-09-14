"""User model for authentication and audit tracking."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    hashed_password: Mapped[str] = mapped_column(Text, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.id"), nullable=False, index=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    role: Mapped["Role"] = relationship("Role", back_populates="users")
    audit_logs: Mapped[list["AuditLog"]] = relationship("AuditLog", back_populates="user")
    investigations: Mapped[list["Investigation"]] = relationship(
        "Investigation", back_populates="assigned_user"
    )
    forecasts: Mapped[list["Forecast"]] = relationship("Forecast", back_populates="created_by_user")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}')>"
