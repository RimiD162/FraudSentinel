"""Fraud Alerts API Endpoints."""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.alert import AlertListResponse, FraudAlertResponse
from app.services.alert_service import AlertService, get_alert_service

router = APIRouter()


@router.get(
    "",
    response_model=AlertListResponse,
    summary="List Fraud Alerts",
    description="Retrieve paginated fraud alerts with optional severity and status filters.",
)
def list_alerts(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=500, description="Items per page"),
    severity: Optional[str] = Query(
        None, description="Filter by severity (low, medium, high, critical)"
    ),
    status_filter: Optional[str] = Query(
        None, alias="status", description="Filter by status (flagged, under_review, cleared, confirmed)"
    ),
    alert_type: Optional[str] = Query(
        None, description="Filter by source (ml_detection, rule_based, manual)"
    ),
    start_date: Optional[datetime] = Query(None, description="Start date filter"),
    end_date: Optional[datetime] = Query(None, description="End date filter"),
    db: Session = Depends(get_db),
    service: AlertService = Depends(get_alert_service),
) -> AlertListResponse:
    return service.get_alerts(
        db=db,
        page=page,
        page_size=page_size,
        severity=severity,
        status=status_filter,
        alert_type=alert_type,
        start_date=start_date,
        end_date=end_date,
    )


@router.get(
    "/{alert_id}",
    response_model=FraudAlertResponse,
    summary="Get Fraud Alert Details",
    description="Retrieve details of a single fraud alert by its UUID.",
)
def get_alert(
    alert_id: UUID = Path(..., description="Unique UUID of the fraud alert"),
    db: Session = Depends(get_db),
    service: AlertService = Depends(get_alert_service),
) -> FraudAlertResponse:
    alert = service.get_alert_by_id(db=db, alert_id=alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fraud alert '{alert_id}' not found",
        )
    return alert
