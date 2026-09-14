"""Alert Service for FraudSentinel.

Handles querying, filtering, and retrieval of FraudAlerts.
"""

from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session, joinedload

from app.models.fraud_alert import FraudAlert
from app.models.transaction import Transaction
from app.schemas.alert import AlertListResponse, FraudAlertResponse
from app.schemas.transaction import TransactionResponse


class AlertService:
    """Service for managing fraud alerts."""

    def get_alerts(
        self,
        db: Session,
        page: int = 1,
        page_size: int = 50,
        severity: Optional[str] = None,
        status: Optional[str] = None,
        alert_type: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> AlertListResponse:
        """Fetch paginated fraud alerts with optional filters."""
        stmt = select(FraudAlert).options(joinedload(FraudAlert.transaction))

        if severity:
            stmt = stmt.where(FraudAlert.severity == severity.lower())
        if status:
            stmt = stmt.where(FraudAlert.status == status.lower())
        if alert_type:
            stmt = stmt.where(FraudAlert.alert_type == alert_type.lower())
        if start_date:
            stmt = stmt.where(FraudAlert.created_at >= start_date)
        if end_date:
            stmt = stmt.where(FraudAlert.created_at <= end_date)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.scalar(count_stmt) or 0

        offset = (page - 1) * page_size
        stmt = stmt.order_by(desc(FraudAlert.created_at)).offset(offset).limit(page_size)

        rows = db.scalars(stmt).unique().all()
        total_pages = max(1, (total + page_size - 1) // page_size)

        items = []
        for r in rows:
            tx_resp = TransactionResponse.model_validate(r.transaction) if r.transaction else None
            item = FraudAlertResponse(
                id=r.id,
                transaction_id=r.transaction_id,
                alert_type=r.alert_type,
                severity=r.severity,
                status=r.status,
                description=r.description,
                created_at=r.created_at,
                resolved_at=r.resolved_at,
                transaction=tx_resp,
            )
            items.append(item)

        return AlertListResponse(
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            items=items,
        )

    def get_alert_by_id(self, db: Session, alert_id: UUID) -> Optional[FraudAlertResponse]:
        """Fetch alert by primary key ID."""
        stmt = (
            select(FraudAlert)
            .options(joinedload(FraudAlert.transaction))
            .where(FraudAlert.id == alert_id)
        )
        alert = db.scalars(stmt).unique().first()
        if not alert:
            return None

        tx_resp = (
            TransactionResponse.model_validate(alert.transaction)
            if alert.transaction
            else None
        )
        return FraudAlertResponse(
            id=alert.id,
            transaction_id=alert.transaction_id,
            alert_type=alert.alert_type,
            severity=alert.severity,
            status=alert.status,
            description=alert.description,
            created_at=alert.created_at,
            resolved_at=alert.resolved_at,
            transaction=tx_resp,
        )


def get_alert_service() -> AlertService:
    return AlertService()
