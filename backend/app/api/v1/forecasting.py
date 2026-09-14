"""Forecasting API Endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Path, status

from app.core.auth import require_viewer
from app.models.user import User
from app.schemas.forecasting import ForecastHorizonResponse, ForecastListResponse
from app.services.forecasting_service import (
    ForecastingService,
    get_forecasting_service,
)

router = APIRouter()


@router.get(
    "",
    response_model=ForecastListResponse,
    summary="Get Forecasting Metadata & Horizons",
    description="Returns metadata on available forecasting horizons, model evaluation summaries, and projections.",
)
def get_forecasts(
    current_user: User = Depends(require_viewer),
    service: ForecastingService = Depends(get_forecasting_service),
) -> ForecastListResponse:
    return service.get_summary()


@router.get(
    "/{horizon}",
    response_model=ForecastHorizonResponse,
    summary="Get Forecasts for Specific Horizon",
    description="Returns daily point forecasts, confidence intervals, and trend directions for a specific horizon (7, 14, or 30 days).",
)
def get_horizon_forecast(
    horizon: str = Path(..., description="Horizon length: '7', '14', '30' (or '7d', '14d', '30d')"),
    current_user: User = Depends(require_viewer),
    service: ForecastingService = Depends(get_forecasting_service),
) -> ForecastHorizonResponse:
    # Clean string format
    clean_h = horizon.lower().replace("d", "").replace("day", "").replace("days", "").strip()
    try:
        h_int = int(clean_h)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid horizon '{horizon}'. Must be 7, 14, or 30.",
        )

    res = service.get_horizon_forecast(h_int)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Forecast for horizon '{h_int}' days not found. Available horizons: 7, 14, 30.",
        )
    return res
