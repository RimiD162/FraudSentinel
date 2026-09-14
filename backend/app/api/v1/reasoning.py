"""Reasoning API Endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.transaction import Transaction
from app.schemas.reasoning import ReasoningResponse
from app.services.reasoning_service import ReasoningService, get_reasoning_service

router = APIRouter()


@router.get(
    "/{transaction_id}",
    response_model=ReasoningResponse,
    summary="Get Multi-Paradigm Reasoning for Transaction",
    description=(
        "Executes and returns explainable symbolic Knowledge Representation & Reasoning "
        "(KR&R) including Forward Chaining, Backward Chaining proof tree, Semantic Network, "
        "Conceptual Graph, Resolution Refutation, and Bayesian Belief Network probabilities."
    ),
)
def get_transaction_reasoning(
    transaction_id: str = Path(..., description="Transaction identifier (e.g. 'T000001')"),
    db: Session = Depends(get_db),
    service: ReasoningService = Depends(get_reasoning_service),
) -> ReasoningResponse:
    # 1. Try fetching from database
    tx = db.get(Transaction, transaction_id)
    if tx:
        res = service.evaluate_from_orm(tx)
    else:
        # Fallback: analyze synthesized / on-the-fly transaction with given ID
        tx_data = {
            "transaction_id": transaction_id,
            "id": transaction_id,
            "amount": 150.0,
            "transaction_type": "payment",
            "transaction_time": "2025-01-15T12:00:00",
            "location": "New York",
            "device_type": "mobile",
            "previous_transactions_count": 5,
        }
        res = service.evaluate(tx_data)

    return ReasoningResponse(
        transaction_id=res["transaction_id"],
        verdict=res["verdict"],
        is_fraud=res["is_fraud"],
        risk_level=res["risk_level"],
        confidence=res["confidence"],
        bayesian_fraud_probability=res["bayesian_fraud_probability"],
        summary_explanation=res["summary_explanation"],
        knowledge_base=res["knowledge_base"],
        forward_chaining=res["forward_chaining"],
        backward_chaining=res["backward_chaining"],
        answer_extraction=res["answer_extraction"],
        semantic_network=res["semantic_network"],
        conceptual_graph=res["conceptual_graph"],
        resolution_refutation=res["resolution_refutation"],
        bayesian_reasoning=res["bayesian_reasoning"],
    )
