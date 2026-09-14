"""Pydantic schemas for Transaction models and Analysis endpoints."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class TransactionBase(BaseModel):
    """Base fields for a transaction."""

    id: str = Field(..., description="Unique transaction ID (e.g. 'T100000')")
    customer_id: str = Field(..., description="Customer ID associated with transaction")
    amount: float = Field(..., gt=0, description="Monetary amount in USD")
    transaction_type: str = Field(
        ..., description="Transaction type: deposit, payment, transfer, withdrawal"
    )
    transaction_time: datetime = Field(
        ..., description="ISO 8601 timestamp of transaction occurrence"
    )
    location: Optional[str] = Field(None, description="Geographic location or state")
    device_type: Optional[str] = Field(
        None, description="Device used: ATM, POS, desktop, mobile"
    )
    previous_transactions_count: int = Field(
        0, ge=0, description="Count of previous transactions by customer"
    )


class TransactionCreate(TransactionBase):
    """Payload for submitting or analyzing a transaction."""

    features: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional pre-extracted engineered features dictionary",
    )


class ModelScoreResult(BaseModel):
    """Inference output from a single ML/DL model."""

    model_name: str
    model_type: str
    fraud_probability: float = Field(..., ge=0.0, le=1.0)
    predicted_label: bool
    operating_threshold: float
    features_used_count: int = 44


class RuleReasoningSummary(BaseModel):
    """Summary of symbolic knowledge-based reasoning."""

    verdict: str
    is_fraud: bool
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    confidence: float
    triggered_rules: List[str]
    forward_chaining_steps: int
    backward_chaining_proven: bool
    resolution_refuted: bool
    bayesian_fraud_probability: float
    summary_explanation: str


class TransactionAnalyzeResponse(BaseModel):
    """Consolidated response for POST /api/v1/transactions/analyze."""

    transaction_id: str
    customer_id: str
    amount: float
    transaction_type: str
    transaction_time: datetime
    location: Optional[str]
    device_type: Optional[str]

    # Consolidated Decision & Risk
    is_fraud: bool
    risk_score: float = Field(
        ..., ge=0.0, le=1.0, description="Consolidated risk score (0.0=safe, 1.0=critical fraud)"
    )
    risk_level: str = Field(
        ..., description="Risk category: LOW, MEDIUM, HIGH, CRITICAL"
    )
    triggered_rules: List[str]
    explanations: List[str]

    # Individual Model Predictions
    logistic_regression: ModelScoreResult
    random_forest: ModelScoreResult
    tensorflow_mlp: ModelScoreResult

    # Symbolic KR&R & Bayesian Summary
    rule_based_reasoning: RuleReasoningSummary
    bayesian_probability: float

    # Persistence Status
    persisted: bool = True
    fraud_alert_id: Optional[UUID] = None
    created_at: datetime


class TransactionResponse(TransactionBase):
    """Response schema for GET /api/v1/transactions/{id}."""

    is_fraud: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TransactionListResponse(BaseModel):
    """Paginated list of transactions."""

    total: int
    page: int
    page_size: int
    total_pages: int
    items: List[TransactionResponse]
