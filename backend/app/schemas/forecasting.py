"""Pydantic schemas for Time-Series Forecasting endpoints."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class MetricForecast(BaseModel):
    """Forecast series for an individual metric."""

    metric_name: str
    model_name: str
    trend_direction: str  # rising, falling, stable
    dates: List[str]
    values: List[float]
    confidence_lower: Optional[List[float]] = None
    confidence_upper: Optional[List[float]] = None


class ForecastHorizonResponse(BaseModel):
    """Projections for a specific horizon (7, 14, or 30 days)."""

    horizon_days: int
    horizon_label: str
    start_date: str
    end_date: str
    metrics: Dict[str, MetricForecast]
    evaluation: Optional[Dict[str, Any]] = None


class ForecastListResponse(BaseModel):
    """Summary of all available forecasts."""

    dataset: str
    total_historical_days: int
    date_range: str
    available_horizons: List[int]
    evaluation_summary: Dict[str, Any]
    projections: Dict[str, Any]
