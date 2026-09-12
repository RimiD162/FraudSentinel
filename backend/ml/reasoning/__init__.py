"""
Rule-Based Expert System and Knowledge Representation & Reasoning (KR&R) Package for FraudSentinel.

Exposes:
1. FraudExpertSystem (Master Coordinator)
2. KnowledgeBase, Fact, Rule, extract_facts_from_transaction
3. ForwardChainingEngine, ForwardChainingResult
4. BackwardChainingEngine, BackwardChainingResult, ProofNode
5. AnswerExtractor, ExtractedAnswer
6. SemanticNetwork, SemanticNode, SemanticEdge
7. ConceptualGraph, ConceptNode, ConceptualRelationNode
8. ResolutionRefutationEngine, ResolutionRefutationResult, Clause, Literal
"""

from backend.ml.reasoning.answer_extraction import AnswerExtractor, ExtractedAnswer
from backend.ml.reasoning.backward_chaining import BackwardChainingEngine, BackwardChainingResult, ProofNode
from backend.ml.reasoning.bayesian_network import (
    CPT,
    BayesianInferenceResult,
    BayesianNetwork,
    DiscreteVariable,
    FactorContribution,
    FraudBayesianNetwork,
    extract_evidence_from_transaction,
)
from backend.ml.reasoning.conceptual_graph import ConceptNode, ConceptualGraph, ConceptualRelationNode
from backend.ml.reasoning.expert_system import FraudExpertSystem
from backend.ml.reasoning.forward_chaining import ForwardChainingEngine, ForwardChainingResult
from backend.ml.reasoning.knowledge_base import (
    Fact,
    KnowledgeBase,
    Rule,
    extract_facts_from_transaction,
)
from backend.ml.reasoning.resolution import (
    Clause,
    Literal,
    ResolutionRefutationEngine,
    ResolutionRefutationResult,
    ResolutionStep,
)
from backend.ml.reasoning.semantic_network import SemanticEdge, SemanticNetwork, SemanticNode

__all__ = [
    "FraudExpertSystem",
    "KnowledgeBase",
    "Fact",
    "Rule",
    "extract_facts_from_transaction",
    "ForwardChainingEngine",
    "ForwardChainingResult",
    "BackwardChainingEngine",
    "BackwardChainingResult",
    "ProofNode",
    "AnswerExtractor",
    "ExtractedAnswer",
    "SemanticNetwork",
    "SemanticNode",
    "SemanticEdge",
    "ConceptualGraph",
    "ConceptNode",
    "ConceptualRelationNode",
    "ResolutionRefutationEngine",
    "ResolutionRefutationResult",
    "Clause",
    "Literal",
    "ResolutionStep",
    "BayesianNetwork",
    "FraudBayesianNetwork",
    "BayesianInferenceResult",
    "FactorContribution",
    "extract_evidence_from_transaction",
    "CPT",
    "DiscreteVariable",
]
