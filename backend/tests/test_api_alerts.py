"""Tests for Fraud Alerts API endpoints (/api/v1/alerts)."""

import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.fraud_alert import FraudAlert
from app.models.transaction import Transaction


def test_list_alerts_empty(client: TestClient, analyst_headers: dict[str, str]):
    response = client.get("/api/v1/alerts", headers=analyst_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["items"] == []


def test_list_alerts_with_sample(client: TestClient, sample_fraud_alert: FraudAlert, analyst_headers: dict[str, str]):
    response = client.get("/api/v1/alerts", headers=analyst_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["transaction_id"] == sample_fraud_alert.transaction_id
    assert data["items"][0]["severity"] == "high"


def test_get_alert_by_id(client: TestClient, sample_fraud_alert: FraudAlert, analyst_headers: dict[str, str]):
    response = client.get(f"/api/v1/alerts/{sample_fraud_alert.id}", headers=analyst_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(sample_fraud_alert.id)
    assert data["transaction_id"] == sample_fraud_alert.transaction_id
    assert data["transaction"] is not None


def test_get_alert_not_found(client: TestClient, analyst_headers: dict[str, str]):
    random_id = uuid.uuid4()
    response = client.get(f"/api/v1/alerts/{random_id}", headers=analyst_headers)
    assert response.status_code == 404
