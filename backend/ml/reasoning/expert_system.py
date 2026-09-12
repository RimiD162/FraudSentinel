"""
Master Expert System Coordinator Module for FraudSentinel.

Unifies Knowledge Base, Forward Chaining, Backward Chaining, Answer Extraction,
Semantic Network, Conceptual Graph, and Resolution Refutation into a cohesive
explainable banking fraud reasoning engine.
"""

from typing import Any, Dict, List, Optional, Set

from backend.ml.reasoning.answer_extraction import AnswerExtractor, ExtractedAnswer
from backend.ml.reasoning.backward_chaining import BackwardChainingEngine, BackwardChainingResult
from backend.ml.reasoning.conceptual_graph import ConceptualGraph
from backend.ml.reasoning.forward_chaining import ForwardChainingEngine, ForwardChainingResult
from backend.ml.reasoning.knowledge_base import (
    Fact,
    KnowledgeBase,
    extract_facts_from_transaction,
)
from backend.ml.reasoning.resolution import ResolutionRefutationEngine, ResolutionRefutationResult
from backend.ml.reasoning.semantic_network import SemanticNetwork


class FraudExpertSystem:
    """
    Unified Rule-Based Expert System for explainable fraud detection.
    """

    def __init__(self, kb: Optional[KnowledgeBase] = None):
        self.kb = kb or KnowledgeBase.create_default_fraud_kb()
        self.fc_engine = ForwardChainingEngine(self.kb)
        self.bc_engine = BackwardChainingEngine(self.kb)
        self.resolution_engine = ResolutionRefutationEngine(self.kb)

    def evaluate_transaction(self, tx_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute full multi-paradigm symbolic reasoning on an incoming transaction.

        Returns explainable results across all 8 KR&R components:
        - Fact assertions and Working Memory
        - Forward Chaining chronological reasoning steps
        - Backward Chaining goal proof tree
        - Green's Answer Extraction (bindings, audit narrative, confidence)
        - Semantic Network relational graph & risk paths
        - Sowa Conceptual Graph with linear form
        - Propositional Resolution Refutation theorem proof (deriving □)
        """
        # 1. Fact Extraction & Working Memory Population
        initial_facts = extract_facts_from_transaction(tx_data)

        # 2. Forward Chaining (Data-Driven Inference)
        fc_result: ForwardChainingResult = self.fc_engine.run(initial_facts)

        # 3. Backward Chaining (Goal-Driven Hypothesis Verification)
        bc_fraud_result: BackwardChainingResult = self.bc_engine.prove_goal(
            goal=Fact("fraud"),
            initial_facts=initial_facts,
        )

        # 4. Resolution Refutation (Theorem Proving via Contradiction)
        resolution_result: ResolutionRefutationResult = self.resolution_engine.prove_hypothesis(
            goal="fraud",
            initial_facts=initial_facts,
        )

        # 5. Answer Extraction (Synthesizing bindings, justifications, and confidence)
        extracted_answer: ExtractedAnswer = AnswerExtractor.extract_from_forward_chaining(
            fc_result=fc_result,
            tx_data=tx_data,
        )

        # 6. Semantic Network (Relational and Topological Knowledge Graph)
        semantic_net: SemanticNetwork = SemanticNetwork.build_for_transaction(
            tx_data=tx_data,
            derived_facts={f.name for f in fc_result.final_facts},
        )
        tx_id = str(tx_data.get("transaction_id", "TX_CURRENT"))
        risk_paths = semantic_net.find_paths(tx_id, "Conclusion:FraudAlert")

        # 7. Conceptual Graph (Sowa Bipartite Formalism)
        conceptual_graph: ConceptualGraph = ConceptualGraph.build_for_transaction(
            tx_data=tx_data,
            derived_facts={f.name for f in fc_result.final_facts},
        )

        # Determine consolidated risk level
        if fc_result.is_fraud or bc_fraud_result.proven or resolution_result.refutation_successful:
            risk_level = "CRITICAL" if len(fc_result.triggered_rules) > 1 else "HIGH"
            is_fraud_verdict = True
        elif fc_result.is_legitimate:
            risk_level = "LOW"
            is_fraud_verdict = False
        elif any("suspicious" in f.name for f in fc_result.final_facts):
            risk_level = "MEDIUM"
            is_fraud_verdict = False
        else:
            risk_level = "EVALUATING"
            is_fraud_verdict = False

        return {
            "transaction_id": tx_id,
            "verdict": "FRAUD" if is_fraud_verdict else ("LEGITIMATE" if fc_result.is_legitimate else "INCONCLUSIVE"),
            "is_fraud": is_fraud_verdict,
            "risk_level": risk_level,
            "confidence": extracted_answer.confidence,
            "summary_explanation": extracted_answer.natural_language_explanation,
            # Component 1 & 2: Knowledge Base & Facts
            "knowledge_base": {
                "total_rules": len(self.kb.rules),
                "initial_facts": [str(f) for f in sorted(initial_facts, key=lambda x: x.name)],
                "derived_facts": [str(f) for f in sorted(fc_result.derived_facts, key=lambda x: x.name)],
                "final_working_memory": [str(f) for f in sorted(fc_result.final_facts, key=lambda x: x.name)],
            },
            # Component 3: Forward Chaining
            "forward_chaining": {
                "triggered_rules": [r.name for r in fc_result.triggered_rules],
                "steps": [
                    {
                        "step": s.step_number,
                        "rule": s.rule_name,
                        "antecedents": s.antecedents,
                        "consequent": s.consequent,
                        "explanation": s.explanation,
                    }
                    for s in fc_result.reasoning_chain
                ],
            },
            # Component 4: Backward Chaining
            "backward_chaining": {
                "goal": "fraud",
                "proven": bc_fraud_result.proven,
                "rules_applied": bc_fraud_result.rules_used,
                "proof_tree_text": bc_fraud_result.proof_tree.format_tree(),
                "proof_tree": bc_fraud_result.proof_tree.to_dict(),
            },
            # Component 5: Answer Extraction
            "answer_extraction": extracted_answer.to_dict(),
            # Component 6: Semantic Network
            "semantic_network": {
                "graph": semantic_net.to_dict(),
                "risk_paths": risk_paths,
                "has_fraud_path": len(risk_paths) > 0,
            },
            # Component 7: Conceptual Graph
            "conceptual_graph": {
                "linear_notation": conceptual_graph.linear_form(),
                "graph": conceptual_graph.to_dict(),
            },
            # Component 8: Resolution Refutation
            "resolution_refutation": {
                "goal": "fraud",
                "refutation_successful": resolution_result.refutation_successful,
                "total_resolutions": resolution_result.total_resolutions,
                "steps": [
                    {
                        "step": s.step_id,
                        "clause_1": s.clause1,
                        "clause_2": s.clause2,
                        "resolved_on": s.resolved_on,
                        "resolvent": s.resolvent,
                    }
                    for s in resolution_result.steps
                ],
                "final_clause": resolution_result.final_clause,
            },
        }
