"""Tests for Analytics API endpoints (/api/v1/analytics)."""

import pytest
from fastapi.testclient import TestClient


def test_get_analytics_summary(client: TestClient):
    response = client.get("/api/v1/analytics/summary")
    assert response.status_code == 200
    data = response.json()

    assert "total_transactions" in data
    assert "total_fraud_transactions" in data
    assert "total_amount_processed" in data
    assert "fraud_rate_percentage" in data
    assert "alerts_by_severity" in data
    assert "alerts_by_status" in data
    assert "transactions_by_type" in data
    assert "transactions_by_device" in data
    assert "generated_at" in data


def test_get_analytics_trends(client: TestClient):
    response = client.get("/api/v1/analytics/trends")
    assert response.status_code == 200
    data = response.json()

    assert "total_days" in data
    assert "start_date" in data
    assert "end_date" in data
    assert "trends" in data
    assert len(data["trends"]) > 0
    assert "fraud_rate" in data["trends"][0]
    assert "fraud_count" in data["trends"][0]
