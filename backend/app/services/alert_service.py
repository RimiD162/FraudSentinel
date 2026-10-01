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

    def update_alert(
        self, db: Session, alert_id: UUID, status: Optional[str] = None, severity: Optional[str] = None, description: Optional[str] = None
    ) -> Optional[FraudAlertResponse]:
        """Update status or severity of an alert."""
        alert = db.get(FraudAlert, alert_id)
        if not alert:
            return None

        if status:
            alert.status = status.lower()
            if alert.status in ["cleared", "resolved"]:
                alert.resolved_at = datetime.utcnow()
        if severity:
            alert.severity = severity.lower()
        if description:
            alert.description = description

        db.commit()
        db.refresh(alert)
        return self.get_alert_by_id(db, alert_id)

    def resolve_alert(self, db: Session, alert_id: UUID) -> Optional[FraudAlertResponse]:
        """Mark an alert as cleared / resolved."""
        return self.update_alert(db, alert_id, status="cleared")

    def bulk_resolve(self, db: Session, severity: Optional[str] = None) -> int:
        """Bulk resolve all active / flagged alerts."""
        stmt = select(FraudAlert).where(FraudAlert.status.in_(["flagged", "under_review"]))
        if severity and severity.lower() != "all":
            stmt = stmt.where(FraudAlert.severity == severity.lower())

        alerts = db.scalars(stmt).all()
        now = datetime.utcnow()
        for a in alerts:
            a.status = "cleared"
            a.resolved_at = now

        db.commit()
        return len(alerts)


def get_alert_service() -> AlertService:
    return AlertService()
