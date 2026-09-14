"""Transaction Service for FraudSentinel.

Handles analysis execution, risk scoring, ML inference orchestration,
symbolic reasoning handoff, and database persistence.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.fraud_alert import FraudAlert
from app.models.model_prediction import ModelPrediction
from app.models.transaction import Transaction
from app.schemas.transaction import (
    ModelScoreResult,
    RuleReasoningSummary,
    TransactionAnalyzeResponse,
    TransactionCreate,
    TransactionListResponse,
    TransactionResponse,
)
from app.services.ml_service import get_ml_service
from app.services.reasoning_service import get_reasoning_service


class TransactionService:
    """Service for managing transaction workflows, analysis, and queries."""

    def __init__(self):
        self.ml_service = get_ml_service()
        self.reasoning_service = get_reasoning_service()

    def analyze_transaction(
        self, db: Session, payload: TransactionCreate
    ) -> TransactionAnalyzeResponse:
        """Execute full end-to-end ML, DL, KR&R, and Bayesian analysis and persist records."""
        tx_dict = payload.model_dump()

        # 1. Feature Extraction & Classical / Deep Learning Predictions
        df_feats = self.ml_service.extract_features(tx_dict)
        lr_pred = self.ml_service.predict_logistic_regression(df_feats)
        rf_pred = self.ml_service.predict_random_forest(df_feats)
        mlp_pred = self.ml_service.predict_tensorflow_mlp(df_feats)

        # 2. Symbolic KR&R & Bayesian Reasoning
        reasoning_res = self.reasoning_service.evaluate(tx_dict)
        bayesian_prob = reasoning_res.get("bayesian_fraud_probability", 0.0)

        # 3. Consolidated Risk Score Calculation
        # Ensemble weight: 30% LR + 35% RF + 20% MLP + 15% Bayesian
        ml_prob_weighted = (
            0.30 * lr_pred["fraud_probability"]
            + 0.35 * rf_pred["fraud_probability"]
            + 0.20 * mlp_pred["fraud_probability"]
            + 0.15 * bayesian_prob
        )
        max_prob = max(
            lr_pred["fraud_probability"],
            rf_pred["fraud_probability"],
            mlp_pred["fraud_probability"],
            bayesian_prob,
        )
        consolidated_risk = round(0.60 * max_prob + 0.40 * ml_prob_weighted, 4)

        # Classification & Verdict determination
        rule_triggered = reasoning_res.get("forward_chaining", {}).get(
            "triggered_rules", []
        )
        rule_is_fraud = reasoning_res.get("is_fraud", False)
        rule_risk_level = reasoning_res.get("risk_level", "LOW")

        ml_flags_count = sum(
            [lr_pred["predicted_label"], rf_pred["predicted_label"], mlp_pred["predicted_label"]]
        )

        is_fraud_decision = (
            rule_is_fraud
            or (ml_flags_count >= 2)
            or (consolidated_risk >= 0.50)
            or (rf_pred["predicted_label"] and lr_pred["predicted_label"])
        )

        if consolidated_risk >= 0.75 or (is_fraud_decision and len(rule_triggered) > 1):
            risk_level = "CRITICAL"
        elif consolidated_risk >= 0.40 or is_fraud_decision:
            risk_level = "HIGH"
        elif consolidated_risk >= 0.15 or rule_risk_level == "MEDIUM":
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # 4. Explanations
        explanations = self.ml_service.generate_explanations(
            tx_dict, df_feats, lr_pred, rf_pred, mlp_pred
        )
        summary_exp = reasoning_res.get(
            "summary_explanation", "Transaction processed by FraudSentinel engine."
        )
        if summary_exp and summary_exp not in explanations:
            explanations.insert(0, summary_exp)

        # 5. Database Persistence
        # Ensure Customer exists
        customer = db.get(Customer, payload.customer_id)
        if not customer:
            customer = Customer(
                id=payload.customer_id,
                total_transactions=1,
                total_amount=payload.amount,
                fraud_count=1 if is_fraud_decision else 0,
                risk_score=consolidated_risk,
                first_seen=payload.transaction_time,
                last_seen=payload.transaction_time,
            )
            db.add(customer)
            db.flush()
        else:
            customer.total_transactions += 1
            customer.total_amount += payload.amount
            if is_fraud_decision:
                customer.fraud_count += 1
            customer.risk_score = max(customer.risk_score, consolidated_risk)
            customer.last_seen = payload.transaction_time

        # Create or update Transaction
        existing_tx = db.get(Transaction, payload.id)
        if existing_tx:
            existing_tx.amount = payload.amount
            existing_tx.transaction_type = payload.transaction_type
            existing_tx.transaction_time = payload.transaction_time
            existing_tx.location = payload.location
            existing_tx.device_type = payload.device_type
            existing_tx.previous_transactions_count = payload.previous_transactions_count
            existing_tx.is_fraud = is_fraud_decision
            db_tx = existing_tx
        else:
            db_tx = Transaction(
                id=payload.id,
                customer_id=payload.customer_id,
                amount=payload.amount,
                transaction_type=payload.transaction_type,
                transaction_time=payload.transaction_time,
                location=payload.location,
                device_type=payload.device_type,
                previous_transactions_count=payload.previous_transactions_count,
                is_fraud=is_fraud_decision,
            )
            db.add(db_tx)
            db.flush()

        # Persist Model Predictions
        predictions_to_save = [
            ModelPrediction(
                transaction_id=payload.id,
                model_name=lr_pred["model_name"],
                model_version="1.0.0",
                fraud_probability=lr_pred["fraud_probability"],
                predicted_label=lr_pred["predicted_label"],
                threshold_used=lr_pred["operating_threshold"],
            ),
            ModelPrediction(
                transaction_id=payload.id,
                model_name=rf_pred["model_name"],
                model_version="1.0.0",
                fraud_probability=rf_pred["fraud_probability"],
                predicted_label=rf_pred["predicted_label"],
                threshold_used=rf_pred["operating_threshold"],
            ),
            ModelPrediction(
                transaction_id=payload.id,
                model_name=mlp_pred["model_name"],
                model_version="1.0.0",
                fraud_probability=mlp_pred["fraud_probability"],
                predicted_label=mlp_pred["predicted_label"],
                threshold_used=mlp_pred["operating_threshold"],
            ),
        ]
        db.add_all(predictions_to_save)

        # Persist FraudAlert if suspicious or fraud
        fraud_alert_id: Optional[uuid.UUID] = None
        if is_fraud_decision or risk_level in ["HIGH", "CRITICAL"]:
            alert = FraudAlert(
                transaction_id=payload.id,
                alert_type="ml_detection" if ml_flags_count > 0 else "rule_based",
                severity=risk_level.lower(),
                status="flagged",
                description=f"Risk score {consolidated_risk:.2f} ({risk_level}). Triggered: {', '.join(rule_triggered) if rule_triggered else 'ML Models'}",
            )
            db.add(alert)
            db.flush()
            fraud_alert_id = alert.id

        db.commit()

        # 6. Construct Pydantic Response
        rule_summary = RuleReasoningSummary(
            verdict=reasoning_res.get("verdict", "UNKNOWN"),
            is_fraud=rule_is_fraud,
            risk_level=rule_risk_level,
            confidence=float(reasoning_res.get("confidence", 0.5)),
            triggered_rules=rule_triggered,
            forward_chaining_steps=len(
                reasoning_res.get("forward_chaining", {}).get("steps", [])
            ),
            backward_chaining_proven=reasoning_res.get("backward_chaining", {}).get(
                "proven", False
            ),
            resolution_refuted=reasoning_res.get("resolution_refutation", {}).get(
                "refutation_successful", False
            ),
            bayesian_fraud_probability=bayesian_prob,
            summary_explanation=summary_exp,
        )

        return TransactionAnalyzeResponse(
            transaction_id=payload.id,
            customer_id=payload.customer_id,
            amount=payload.amount,
            transaction_type=payload.transaction_type,
            transaction_time=payload.transaction_time,
            location=payload.location,
            device_type=payload.device_type,
            is_fraud=is_fraud_decision,
            risk_score=consolidated_risk,
            risk_level=risk_level,
            triggered_rules=rule_triggered,
            explanations=explanations,
            logistic_regression=ModelScoreResult(**lr_pred),
            random_forest=ModelScoreResult(**rf_pred),
            tensorflow_mlp=ModelScoreResult(**mlp_pred),
            rule_based_reasoning=rule_summary,
            bayesian_probability=bayesian_prob,
            persisted=True,
            fraud_alert_id=fraud_alert_id,
            created_at=datetime.now(timezone.utc),
        )

    def get_transactions(
        self,
        db: Session,
        page: int = 1,
        page_size: int = 50,
        customer_id: Optional[str] = None,
        is_fraud: Optional[bool] = None,
        transaction_type: Optional[str] = None,
        location: Optional[str] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
    ) -> TransactionListResponse:
        """Query paginated transactions with dynamic filters."""
        stmt = select(Transaction)

        if customer_id:
            stmt = stmt.where(Transaction.customer_id == customer_id)
        if is_fraud is not None:
            stmt = stmt.where(Transaction.is_fraud == is_fraud)
        if transaction_type:
            stmt = stmt.where(Transaction.transaction_type == transaction_type)
        if location:
            stmt = stmt.where(Transaction.location.ilike(f"%{location}%"))
        if min_amount is not None:
            stmt = stmt.where(Transaction.amount >= min_amount)
        if max_amount is not None:
            stmt = stmt.where(Transaction.amount <= max_amount)

        # Total count query
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.scalar(count_stmt) or 0

        # Pagination & Ordering
        offset = (page - 1) * page_size
        stmt = stmt.order_by(desc(Transaction.transaction_time)).offset(offset).limit(page_size)

        rows = db.scalars(stmt).all()
        total_pages = max(1, (total + page_size - 1) // page_size)

        items = [TransactionResponse.model_validate(r) for r in rows]
        return TransactionListResponse(
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            items=items,
        )

    def get_transaction_by_id(self, db: Session, tx_id: str) -> Optional[Transaction]:
        """Fetch a single transaction by ID."""
        return db.get(Transaction, tx_id)


def get_transaction_service() -> TransactionService:
    return TransactionService()
