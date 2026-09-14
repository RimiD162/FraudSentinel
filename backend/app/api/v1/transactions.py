"""Transaction API Endpoints."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import require_analyst, require_viewer
from app.core.database import get_db
from app.models.user import User
from app.schemas.transaction import (
    TransactionAnalyzeResponse,
    TransactionCreate,
    TransactionListResponse,
)
from app.services.transaction_service import TransactionService, get_transaction_service

router = APIRouter()


@router.post(
    "/analyze",
    response_model=TransactionAnalyzeResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Transaction for Fraud",
    description=(
        "Executes multi-paradigm fraud detection on a transaction: Logistic Regression, "
        "Random Forest, TensorFlow MLP, Rule-Based KR&R (Forward/Backward Chaining), "
        "and Bayesian Probabilistic Belief Networks. Persists results to the database."
    ),
)
def analyze_transaction(
    payload: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst),
    service: TransactionService = Depends(get_transaction_service),
) -> TransactionAnalyzeResponse:
    try:
        return service.analyze_transaction(db=db, payload=payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze transaction: {str(e)}",
        )


@router.get(
    "",
    response_model=TransactionListResponse,
    summary="List Transactions",
    description="Retrieve paginated transactions with optional filtering.",
)
def list_transactions(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(50, ge=1, le=500, description="Items per page"),
    customer_id: Optional[str] = Query(None, description="Filter by customer ID"),
    is_fraud: Optional[bool] = Query(None, description="Filter by fraud status"),
    transaction_type: Optional[str] = Query(
        None, description="Filter by type (deposit, payment, transfer, withdrawal)"
    ),
    location: Optional[str] = Query(None, description="Filter by location state/name"),
    min_amount: Optional[float] = Query(None, ge=0.0, description="Minimum amount"),
    max_amount: Optional[float] = Query(None, ge=0.0, description="Maximum amount"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer),
    service: TransactionService = Depends(get_transaction_service),
) -> TransactionListResponse:
    return service.get_transactions(
        db=db,
        page=page,
        page_size=page_size,
        customer_id=customer_id,
        is_fraud=is_fraud,
        transaction_type=transaction_type,
        location=location,
        min_amount=min_amount,
        max_amount=max_amount,
    )
