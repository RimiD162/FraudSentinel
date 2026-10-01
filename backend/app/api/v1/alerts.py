"""Fraud Alerts API Endpoints."""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session

from app.core.auth import require_analyst, require_viewer
from app.core.database import get_db
from app.models.user import User
from app.schemas.alert import (
    AlertListResponse,
    AlertUpdate,
    BulkResolveResponse,
    FraudAlertResponse,
)
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
    current_user: User = Depends(require_viewer),
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


@router.post(
    "/bulk-resolve",
    response_model=BulkResolveResponse,
    summary="Bulk Resolve Fraud Alerts",
    description="Bulk resolve all currently flagged / under review fraud alerts.",
)
def bulk_resolve_alerts(
    severity: Optional[str] = Query(None, description="Optional severity filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst),
    service: AlertService = Depends(get_alert_service),
) -> BulkResolveResponse:
    count = service.bulk_resolve(db=db, severity=severity)
    return BulkResolveResponse(
        resolved_count=count,
        message=f"Successfully marked {count} alerts as resolved.",
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
    current_user: User = Depends(require_viewer),
    service: AlertService = Depends(get_alert_service),
) -> FraudAlertResponse:
    alert = service.get_alert_by_id(db=db, alert_id=alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fraud alert '{alert_id}' not found",
        )
    return alert


@router.patch(
    "/{alert_id}",
    response_model=FraudAlertResponse,
    summary="Update Fraud Alert Status",
    description="Update the status or severity of a fraud alert.",
)
def update_alert(
    payload: AlertUpdate,
    alert_id: UUID = Path(..., description="Unique UUID of the fraud alert"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst),
    service: AlertService = Depends(get_alert_service),
) -> FraudAlertResponse:
    updated = service.update_alert(
        db=db,
        alert_id=alert_id,
        status=payload.status,
        severity=payload.severity,
        description=payload.description,
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fraud alert '{alert_id}' not found",
        )
    return updated


@router.post(
    "/{alert_id}/resolve",
    response_model=FraudAlertResponse,
    summary="Resolve Fraud Alert",
    description="Mark an individual fraud alert as cleared / resolved.",
)
def resolve_alert(
    alert_id: UUID = Path(..., description="Unique UUID of the fraud alert"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst),
    service: AlertService = Depends(get_alert_service),
) -> FraudAlertResponse:
    updated = service.resolve_alert(db=db, alert_id=alert_id)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fraud alert '{alert_id}' not found",
        )
    return updated
