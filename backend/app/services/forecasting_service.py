"""Forecasting Service for FraudSentinel.

Provides multi-horizon time-series projections and evaluation metrics.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from app.schemas.forecasting import (
    ForecastHorizonResponse,
    ForecastListResponse,
    MetricForecast,
)

ROOT_DIR = Path(__file__).resolve().parents[3]
RESULTS_JSON = ROOT_DIR / "models" / "forecasting" / "forecast_results.json"


class ForecastingService:
    """Service for time-series forecasting queries."""

    def __init__(self):
        self._data: Optional[Dict[str, Any]] = None

    def _load_data(self) -> Dict[str, Any]:
        if self._data is None:
            if RESULTS_JSON.exists():
                try:
                    with open(RESULTS_JSON, "r", encoding="utf-8") as f:
                        self._data = json.load(f)
                except Exception:
                    self._data = {}
            else:
                self._data = {}
        return self._data or {}

    def get_summary(self) -> ForecastListResponse:
        """Get summary of forecasting pipeline outputs."""
        data = self._load_data()
        meta = data.get("metadata", {})
        holdout_eval = data.get("holdout_evaluation", {})

        return ForecastListResponse(
            dataset=meta.get("dataset", "fraud_detection_20k.csv"),
            total_historical_days=meta.get("total_days", 30),
            date_range=meta.get("date_range", "2025-01-01 to 2025-01-30"),
            available_horizons=meta.get("horizons", [7, 14, 30]),
            evaluation_summary=holdout_eval,
            projections=data.get("forecasts", {}),
        )

    def get_horizon_forecast(self, horizon: int) -> Optional[ForecastHorizonResponse]:
        """Fetch forecasts for a specific horizon (7, 14, or 30 days)."""
        data = self._load_data()
        forecasts = data.get("forecasts", {})
        key = f"{horizon}_day"

        if key not in forecasts:
            return None

        horizon_data = forecasts[key]
        metrics_dict: Dict[str, MetricForecast] = {}
        all_dates = []

        for metric_name, model_results in horizon_data.items():
            hw_res = model_results.get("holt_winters", {})
            dates = hw_res.get("dates", [])
            values = hw_res.get("values", [])
            trend = hw_res.get("trend_direction", "stable")
            if not all_dates and dates:
                all_dates = dates

            # Confidence bounds from parameters
            std = float(hw_res.get("parameters", {}).get("residual_std", 1.0))
            lower = [round(max(0.0, v - std), 4) for v in values]
            upper = [round(v + std, 4) for v in values]

            metrics_dict[metric_name] = MetricForecast(
                metric_name=metric_name,
                model_name="Holt-Winters Triple Exponential Smoothing",
                trend_direction=trend,
                dates=dates,
                values=values,
                confidence_lower=lower,
                confidence_upper=upper,
            )

        start_date = all_dates[0] if all_dates else ""
        end_date = all_dates[-1] if all_dates else ""

        return ForecastHorizonResponse(
            horizon_days=horizon,
            horizon_label=f"{horizon}-Day Projection",
            start_date=start_date,
            end_date=end_date,
            metrics=metrics_dict,
            evaluation=data.get("holdout_evaluation"),
        )


def get_forecasting_service() -> ForecastingService:
    return ForecastingService()
