"""Pydantic schemas for Fraud Alerts."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.transaction import TransactionResponse


class FraudAlertBase(BaseModel):
    """Base fields for fraud alert."""

    transaction_id: str
    alert_type: str = Field(
        default="ml_detection", description="Alert trigger source (ml_detection, rule_based, manual)"
    )
    severity: str = Field(
        default="medium", description="Severity level: low, medium, high, critical"
    )
    status: str = Field(
        default="flagged", description="Status: flagged, under_review, cleared, confirmed"
    )
    description: Optional[str] = None


class FraudAlertCreate(FraudAlertBase):
    """Schema for creating a fraud alert manually or via system."""

    pass


class FraudAlertResponse(FraudAlertBase):
    """Schema for returning fraud alert details."""

    id: UUID
    created_at: datetime
    resolved_at: Optional[datetime] = None
    transaction: Optional[TransactionResponse] = None

    model_config = {"from_attributes": True}


class AlertListResponse(BaseModel):
    """Paginated fraud alert list."""

    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[FraudAlertResponse]
