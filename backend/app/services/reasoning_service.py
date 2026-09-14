"""Reasoning Service for FraudSentinel.

Integrates Symbolic Knowledge Representation & Reasoning (KR&R) and
Bayesian Probabilistic Belief Networks.
"""

from __future__ import annotations

from typing import Any, Dict, Optional

from app.models.transaction import Transaction

try:
    from backend.ml.reasoning.expert_system import FraudExpertSystem
except ImportError:
    from ml.reasoning.expert_system import FraudExpertSystem


class ReasoningService:
    """Service wrapping symbolic reasoning engines and Bayesian networks."""

    _instance: Optional[ReasoningService] = None

    def __init__(self):
        self.expert_system = FraudExpertSystem()

    @classmethod
    def get_instance(cls) -> ReasoningService:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def evaluate(self, tx_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute full KR&R and Bayesian reasoning over a transaction payload."""
        # Ensure transaction format matches KR&R expectations
        formatted_tx = {
            "transaction_id": tx_data.get("id", tx_data.get("transaction_id", "TX_CURRENT")),
            "customer_id": tx_data.get("customer_id", "CUST_UNKNOWN"),
            "transaction_amount": float(tx_data.get("amount", tx_data.get("transaction_amount", 100.0))),
            "transaction_type": str(tx_data.get("transaction_type", "payment")),
            "transaction_time": str(tx_data.get("transaction_time", "2025-01-15T12:00:00")),
            "transaction_location": str(tx_data.get("location", tx_data.get("transaction_location", "New York"))),
            "device_type": str(tx_data.get("device_type", "mobile")),
            "previous_transactions_count": int(tx_data.get("previous_transactions_count", 0)),
        }

        # Include custom features if present
        if "features" in tx_data and isinstance(tx_data["features"], dict):
            formatted_tx.update(tx_data["features"])

        return self.expert_system.evaluate_transaction(formatted_tx)

    def evaluate_from_orm(self, tx: Transaction) -> Dict[str, Any]:
        """Evaluate an existing ORM transaction instance."""
        tx_data = {
            "id": tx.id,
            "transaction_id": tx.id,
            "customer_id": tx.customer_id,
            "amount": tx.amount,
            "transaction_amount": tx.amount,
            "transaction_type": tx.transaction_type,
            "transaction_time": tx.transaction_time.isoformat() if tx.transaction_time else "",
            "location": tx.location or "New York",
            "transaction_location": tx.location or "New York",
            "device_type": tx.device_type or "mobile",
            "previous_transactions_count": tx.previous_transactions_count,
        }
        return self.evaluate(tx_data)


def get_reasoning_service() -> ReasoningService:
    return ReasoningService.get_instance()
