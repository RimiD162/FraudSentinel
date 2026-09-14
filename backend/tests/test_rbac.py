"""Role-Based Access Control (RBAC) permission tests across FraudSentinel endpoints."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.user import User


def test_unauthenticated_request_rejected(client: TestClient):
    """Verify that unauthenticated requests to protected endpoints return 401 Unauthorized."""
    # Transactions
    res1 = client.get("/api/v1/transactions")
    assert res1.status_code == 401

    # Alerts
    res2 = client.get("/api/v1/alerts")
    assert res2.status_code == 401

    # Analytics
    res3 = client.get("/api/v1/analytics/summary")
    assert res3.status_code == 401

    # Analyze
    res4 = client.post("/api/v1/transactions/analyze", json={})
    assert res4.status_code == 401

    # Investigations
    res5 = client.post("/api/v1/investigations/search", json={})
    assert res5.status_code == 401


def test_admin_has_full_access(
    client: TestClient,
    admin_headers: dict[str, str],
):
    """Verify admin role has access to all operational and analytical endpoints."""
    # 1. Analyze transaction (write/execute)
    payload = {
        "id": "T_ADMIN_TEST",
        "customer_id": "C_ADMIN",
        "amount": 120.00,
        "transaction_type": "payment",
        "transaction_time": "2025-01-15T12:00:00Z",
        "location": "New York",
        "device_type": "mobile",
        "previous_transactions_count": 5,
    }
    res_analyze = client.post("/api/v1/transactions/analyze", json=payload, headers=admin_headers)
    assert res_analyze.status_code == 200

    # 2. List transactions (read)
    res_tx = client.get("/api/v1/transactions", headers=admin_headers)
    assert res_tx.status_code == 200

    # 3. List alerts (read)
    res_alerts = client.get("/api/v1/alerts", headers=admin_headers)
    assert res_alerts.status_code == 200

    # 4. Search investigation (write/execute)
    search_payload = {
        "source_account": "ACC_1001",
        "target_account": "HUB_ALPHA",
        "algorithm": "astar",
    }
    res_search = client.post("/api/v1/investigations/search", json=search_payload, headers=admin_headers)
    assert res_search.status_code == 200

    # 5. Analytics summary
    res_analytics = client.get("/api/v1/analytics/summary", headers=admin_headers)
    assert res_analytics.status_code == 200

    # 6. Forecasting
    res_forecast = client.get("/api/v1/forecasts", headers=admin_headers)
    assert res_forecast.status_code == 200


def test_analyst_has_operational_and_read_access(
    client: TestClient,
    analyst_headers: dict[str, str],
):
    """Verify analyst role can execute analysis, search investigations, and read data."""
    # 1. Analyze transaction
    payload = {
        "id": "T_ANALYST_TEST",
        "customer_id": "C_ANALYST",
        "amount": 350.00,
        "transaction_type": "transfer",
        "transaction_time": "2025-01-15T14:00:00Z",
        "location": "California",
        "device_type": "web",
        "previous_transactions_count": 2,
    }
    res_analyze = client.post("/api/v1/transactions/analyze", json=payload, headers=analyst_headers)
    assert res_analyze.status_code == 200

    # 2. Graph Search
    res_search = client.post(
        "/api/v1/investigations/search",
        json={"source_account": "ACC_1001", "target_account": "HUB_ALPHA", "algorithm": "bfs"},
        headers=analyst_headers,
    )
    assert res_search.status_code == 200

    # 3. Read transactions & alerts
    res_tx = client.get("/api/v1/transactions", headers=analyst_headers)
    assert res_tx.status_code == 200
    res_alerts = client.get("/api/v1/alerts", headers=analyst_headers)
    assert res_alerts.status_code == 200


def test_viewer_has_read_only_access(
    client: TestClient,
    viewer_headers: dict[str, str],
):
    """Verify viewer role can read analytics, transactions, alerts, and forecasts."""
    res_tx = client.get("/api/v1/transactions", headers=viewer_headers)
    assert res_tx.status_code == 200

    res_alerts = client.get("/api/v1/alerts", headers=viewer_headers)
    assert res_alerts.status_code == 200

    res_analytics = client.get("/api/v1/analytics/summary", headers=viewer_headers)
    assert res_analytics.status_code == 200

    res_trends = client.get("/api/v1/analytics/trends", headers=viewer_headers)
    assert res_trends.status_code == 200

    res_forecasts = client.get("/api/v1/forecasts", headers=viewer_headers)
    assert res_forecasts.status_code == 200


def test_viewer_denied_execution_endpoints(
    client: TestClient,
    viewer_headers: dict[str, str],
    viewer_user: User,
    db_session: Session,
):
    """Verify viewer role is rejected with 403 Forbidden on action endpoints and audit log is created."""
    # 1. Attempt to analyze transaction -> 403 Forbidden
    payload = {
        "id": "T_VIEWER_BLOCKED",
        "customer_id": "C_VIEWER",
        "amount": 99.00,
        "transaction_type": "payment",
        "transaction_time": "2025-01-15T12:00:00Z",
    }
    res_analyze = client.post("/api/v1/transactions/analyze", json=payload, headers=viewer_headers)
    assert res_analyze.status_code == 403
    assert "Insufficient role permissions" in res_analyze.json()["detail"]

    # 2. Attempt to run graph search -> 403 Forbidden
    search_payload = {
        "source_account": "ACC_1001",
        "target_account": "HUB_ALPHA",
        "algorithm": "astar",
    }
    res_search = client.post("/api/v1/investigations/search", json=search_payload, headers=viewer_headers)
    assert res_search.status_code == 403
    assert "Insufficient role permissions" in res_search.json()["detail"]

    # Verify RBAC_ACCESS_DENIED audit log recorded
    denied_log = (
        db_session.query(AuditLog)
        .filter(AuditLog.action == "RBAC_ACCESS_DENIED")
        .filter(AuditLog.user_id == viewer_user.id)
        .first()
    )
    assert denied_log is not None
    assert "viewer" in denied_log.details
