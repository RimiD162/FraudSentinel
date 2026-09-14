"""Pydantic schemas for Knowledge Representation & Reasoning (KR&R) and Bayesian outputs."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ForwardChainingStep(BaseModel):
    step: int
    rule: str
    antecedents: List[str]
    consequent: str
    explanation: str


class ResolutionStepSchema(BaseModel):
    step: int
    clause_1: str
    clause_2: str
    resolved_on: str
    resolvent: str


class ReasoningResponse(BaseModel):
    """Complete symbolic KR&R and Bayesian reasoning output."""

    transaction_id: str
    verdict: str
    is_fraud: bool
    risk_level: str
    confidence: float
    bayesian_fraud_probability: float
    summary_explanation: str

    # Component 1 & 2: Knowledge Base & Facts
    knowledge_base: Dict[str, Any]

    # Component 3: Forward Chaining
    forward_chaining: Dict[str, Any]

    # Component 4: Backward Chaining
    backward_chaining: Dict[str, Any]

    # Component 5: Answer Extraction
    answer_extraction: Dict[str, Any]

    # Component 6: Semantic Network
    semantic_network: Dict[str, Any]

    # Component 7: Conceptual Graph
    conceptual_graph: Dict[str, Any]

    # Component 8: Resolution Refutation
    resolution_refutation: Dict[str, Any]

    # Component 9: Bayesian Probabilistic Reasoning
    bayesian_reasoning: Dict[str, Any]
