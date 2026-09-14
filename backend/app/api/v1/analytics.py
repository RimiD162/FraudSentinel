"""Analytics API Endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import require_viewer
from app.core.database import get_db
from app.models.user import User
from app.schemas.analytics import AnalyticsSummaryResponse, AnalyticsTrendsResponse
from app.services.analytics_service import AnalyticsService, get_analytics_service

router = APIRouter()


@router.get(
    "/summary",
    response_model=AnalyticsSummaryResponse,
    summary="Get System Analytics Summary",
    description="Returns aggregate KPI metrics, fraud rates, and alert breakdowns by severity and status.",
)
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer),
    service: AnalyticsService = Depends(get_analytics_service),
) -> AnalyticsSummaryResponse:
    return service.get_summary(db=db)


@router.get(
    "/trends",
    response_model=AnalyticsTrendsResponse,
    summary="Get Fraud & Volume Time-Series Trends",
    description="Returns daily historical trends for transaction volume, fraud count, fraud amount, and fraud rate.",
)
def get_analytics_trends(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer),
    service: AnalyticsService = Depends(get_analytics_service),
) -> AnalyticsTrendsResponse:
    return service.get_trends(db=db)
