"""Tests for Transaction API endpoints (/api/v1/transactions)."""

import pytest
from fastapi.testclient import TestClient


def test_analyze_legitimate_transaction(client: TestClient, analyst_headers: dict[str, str]):
    payload = {
        "id": "T_TEST_LEGIT_1",
        "customer_id": "C_TEST_1",
        "amount": 45.50,
        "transaction_type": "payment",
        "transaction_time": "2025-01-15T14:30:00Z",
        "location": "New York",
        "device_type": "mobile",
        "previous_transactions_count": 10,
    }
    response = client.post("/api/v1/transactions/analyze", json=payload, headers=analyst_headers)
    assert response.status_code == 200
    data = response.json()

    assert data["transaction_id"] == "T_TEST_LEGIT_1"
    assert data["customer_id"] == "C_TEST_1"
    assert "is_fraud" in data
    assert "risk_score" in data
    assert "risk_level" in data
    assert "logistic_regression" in data
    assert "random_forest" in data
    assert "tensorflow_mlp" in data
    assert "rule_based_reasoning" in data
    assert "bayesian_probability" in data
    assert "explanations" in data
    assert data["persisted"] is True

    # Check model prediction details
    assert "fraud_probability" in data["logistic_regression"]
    assert "predicted_label" in data["logistic_regression"]
    assert "fraud_probability" in data["random_forest"]
    assert "fraud_probability" in data["tensorflow_mlp"]


def test_analyze_suspicious_fraud_transaction(client: TestClient, analyst_headers: dict[str, str]):
    payload = {
        "id": "T_TEST_FRAUD_1",
        "customer_id": "C_TEST_FRAUD",
        "amount": 4500.00,
        "transaction_type": "transfer",
        "transaction_time": "2025-01-15T03:15:00Z",  # night
        "location": "California",
        "device_type": "POS",
        "previous_transactions_count": 0,
    }
    response = client.post("/api/v1/transactions/analyze", json=payload, headers=analyst_headers)
    assert response.status_code == 200
    data = response.json()

    assert data["transaction_id"] == "T_TEST_FRAUD_1"
    assert data["is_fraud"] is True or data["risk_score"] > 0.3
    assert data["risk_level"] in ["HIGH", "CRITICAL", "MEDIUM"]
    assert len(data["explanations"]) > 0


def test_list_transactions_empty(client: TestClient, analyst_headers: dict[str, str]):
    response = client.get("/api/v1/transactions", headers=analyst_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["items"] == []


def test_list_transactions_with_data(client: TestClient, analyst_headers: dict[str, str]):
    # Insert 2 transactions via analyze
    for i in range(2):
        client.post(
            "/api/v1/transactions/analyze",
            json={
                "id": f"T_LIST_{i}",
                "customer_id": f"C_LIST_{i}",
                "amount": 100.0 * (i + 1),
                "transaction_type": "payment",
                "transaction_time": "2025-01-15T12:00:00Z",
                "location": "New York",
                "device_type": "mobile",
                "previous_transactions_count": i,
            },
            headers=analyst_headers,
        )

    response = client.get("/api/v1/transactions?page=1&page_size=10", headers=analyst_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2
    assert data["page"] == 1
