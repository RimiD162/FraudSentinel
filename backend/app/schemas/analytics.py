"""Pydantic schemas for Analytics and Trends endpoints."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AlertSeverityBreakdown(BaseModel):
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0


class AlertStatusBreakdown(BaseModel):
    flagged: int = 0
    under_review: int = 0
    cleared: int = 0
    confirmed: int = 0


class AnalyticsSummaryResponse(BaseModel):
    """Aggregate KPI statistics for the system."""

    total_transactions: int
    total_fraud_transactions: int
    total_legitimate_transactions: int
    total_amount_processed: float
    total_fraud_amount: float
    fraud_rate_percentage: float
    alerts_by_severity: AlertSeverityBreakdown
    alerts_by_status: AlertStatusBreakdown
    transactions_by_type: Dict[str, int]
    transactions_by_device: Dict[str, int]
    generated_at: str


class DailyTrendItem(BaseModel):
    """Daily aggregated metric entry."""

    date: str
    total_transactions: int
    fraud_count: int
    fraud_amount: float
    fraud_rate: float


class AnalyticsTrendsResponse(BaseModel):
    """Time-series trend data."""

    total_days: int
    start_date: str
    end_date: str
    trends: List[DailyTrendItem]
