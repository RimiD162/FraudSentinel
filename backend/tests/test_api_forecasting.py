"""Tests for Forecasting API endpoints (/api/v1/forecasts)."""

import pytest
from fastapi.testclient import TestClient


def test_get_forecast_summary(client: TestClient, analyst_headers: dict[str, str]):
    response = client.get("/api/v1/forecasts", headers=analyst_headers)
    assert response.status_code == 200
    data = response.json()

    assert "dataset" in data
    assert "total_historical_days" in data
    assert "available_horizons" in data
    assert "projections" in data


@pytest.mark.parametrize("horizon", ["7", "14", "30", "7d", "14d"])
def test_get_forecast_valid_horizons(client: TestClient, horizon: str, analyst_headers: dict[str, str]):
    response = client.get(f"/api/v1/forecasts/{horizon}", headers=analyst_headers)
    assert response.status_code == 200
    data = response.json()

    assert "horizon_days" in data
    assert "metrics" in data
    assert "total_transactions" in data["metrics"]
    assert "fraud_count" in data["metrics"]
    assert "fraud_amount" in data["metrics"]
    assert "fraud_rate" in data["metrics"]
    assert len(data["metrics"]["fraud_count"]["values"]) == data["horizon_days"]


def test_get_forecast_invalid_horizon(client: TestClient, analyst_headers: dict[str, str]):
    response = client.get("/api/v1/forecasts/99", headers=analyst_headers)
    assert response.status_code == 404
