"""Tests for Reasoning API endpoints (/api/v1/reasoning)."""

import pytest
from fastapi.testclient import TestClient

from app.models.transaction import Transaction


def test_get_reasoning_for_transaction(client: TestClient, sample_transaction: Transaction, analyst_headers: dict[str, str]):
    response = client.get(f"/api/v1/reasoning/{sample_transaction.id}", headers=analyst_headers)
    assert response.status_code == 200
    data = response.json()

    assert data["transaction_id"] == sample_transaction.id
    assert "verdict" in data
    assert "is_fraud" in data
    assert "risk_level" in data
    assert "bayesian_fraud_probability" in data
    assert "knowledge_base" in data
    assert "forward_chaining" in data
    assert "backward_chaining" in data
    assert "answer_extraction" in data
    assert "semantic_network" in data
    assert "conceptual_graph" in data
    assert "resolution_refutation" in data
    assert "bayesian_reasoning" in data


def test_get_reasoning_for_unknown_transaction_fallback(client: TestClient, analyst_headers: dict[str, str]):
    response = client.get("/api/v1/reasoning/TX_NEW_123", headers=analyst_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["transaction_id"] == "TX_NEW_123"
    assert "verdict" in data
