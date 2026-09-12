"""
Answer Extraction Module for FraudSentinel Expert System.

Implements Green's classical answer extraction methodology to extract variable bindings,
minimal supporting evidence, and natural language audit justifications from proof paths.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set

from backend.ml.reasoning.backward_chaining import BackwardChainingResult, ProofNode
from backend.ml.reasoning.forward_chaining import ForwardChainingResult
from backend.ml.reasoning.knowledge_base import Fact


@dataclass
class ExtractedAnswer:
    conclusion: str
    is_fraud: bool
    confidence: float
    variable_bindings: Dict[str, Any]
    answering_rules: List[str]
    supporting_evidence: List[str]
    audit_trail: List[str]
    natural_language_explanation: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "conclusion": self.conclusion,
            "is_fraud": self.is_fraud,
            "confidence": self.confidence,
            "variable_bindings": self.variable_bindings,
            "answering_rules": self.answering_rules,
            "supporting_evidence": self.supporting_evidence,
            "audit_trail": self.audit_trail,
            "natural_language_explanation": self.natural_language_explanation,
        }


class AnswerExtractor:
    """
    Extracts answers, bindings, and analyst justifications from reasoning results.
    """

    @staticmethod
    def extract_from_forward_chaining(
        fc_result: ForwardChainingResult,
        tx_data: Dict[str, Any],
    ) -> ExtractedAnswer:
        conclusion = fc_result.verdict
        is_fraud = fc_result.is_fraud

        # Extract variable bindings
        bindings = {
            "transaction_id": str(tx_data.get("transaction_id", "N/A")),
            "customer_id": str(tx_data.get("customer_id", "N/A")),
            "amount": float(tx_data.get("transaction_amount", 0.0)),
            "hour": tx_data.get("transaction_hour"),
            "location_change": bool(int(tx_data.get("customer_location_change", 0))),
            "device_change": bool(int(tx_data.get("customer_device_change", 0))),
            "velocity_last_1h": int(tx_data.get("customer_transactions_last_1h", 0)),
            "velocity_last_24h": int(tx_data.get("customer_transactions_last_24h", 0)),
        }

        answering_rules = [r.name for r in fc_result.triggered_rules]
        supporting_evidence = [str(f) for f in sorted(fc_result.initial_facts, key=lambda x: x.name)]

        audit_trail: List[str] = []
        for step in fc_result.reasoning_chain:
            audit_trail.append(
                f"Step {step.step_number}: Applied {step.rule_name} "
                f"[{', '.join(step.antecedents)}] => Derived {step.consequent}. "
                f"Reason: {step.explanation}"
            )

        # Build natural language narrative
        if is_fraud:
            rule_summaries = " -> ".join([r.name for r in fc_result.triggered_rules])
            narrative = (
                f"Transaction {bindings['transaction_id']} for Customer {bindings['customer_id']} "
                f"has been classified as FRAUD. The inference engine triggered the following rule chain: "
                f"[{rule_summaries}]. Key risk indicators include: {', '.join(supporting_evidence)}."
            )
            confidence = 0.95 if len(fc_result.triggered_rules) > 1 else 0.85
        elif fc_result.is_legitimate:
            narrative = (
                f"Transaction {bindings['transaction_id']} for Customer {bindings['customer_id']} "
                f"has been cleared as LEGITIMATE. Observed characteristics ({', '.join(supporting_evidence)}) "
                f"satisfy normal baseline behavioral rules with zero fraud anomalies."
            )
            confidence = 0.92
        else:
            narrative = (
                f"Transaction {bindings['transaction_id']} status is {conclusion}. "
                f"Partial risk patterns observed ({', '.join(supporting_evidence)}), "
                f"recommending secondary review."
            )
            confidence = 0.60

        return ExtractedAnswer(
            conclusion=conclusion,
            is_fraud=is_fraud,
            confidence=confidence,
            variable_bindings=bindings,
            answering_rules=answering_rules,
            supporting_evidence=supporting_evidence,
            audit_trail=audit_trail,
            natural_language_explanation=narrative,
        )

    @staticmethod
    def extract_from_backward_chaining(
        bc_result: BackwardChainingResult,
        tx_data: Dict[str, Any],
    ) -> ExtractedAnswer:
        goal_str = str(bc_result.target_goal)
        proven = bc_result.proven
        is_fraud = (goal_str == "fraud" and proven)

        bindings = {
            "transaction_id": str(tx_data.get("transaction_id", "N/A")),
            "customer_id": str(tx_data.get("customer_id", "N/A")),
            "target_hypothesis": goal_str,
            "hypothesis_proven": proven,
        }

        # Traverse proof tree to collect supporting ground facts
        supporting_facts: List[str] = []

        def collect_facts(node: ProofNode):
            if node.is_ground_fact:
                supporting_facts.append(node.goal)
            for ch in node.children:
                collect_facts(ch)

        collect_facts(bc_result.proof_tree)

        if is_fraud:
            conclusion = "FRAUD"
            narrative = (
                f"Goal '{goal_str}' was formally PROVEN via backward chaining. "
                f"Sub-goal decomposition validated the hypothesis using ground facts: "
                f"{', '.join(supporting_facts)}."
            )
            confidence = 0.95
        elif goal_str == "fraud" and not proven:
            conclusion = "LEGITIMATE"
            narrative = (
                f"Goal '{goal_str}' could NOT be proven via backward chaining. "
                f"None of the required fraud rule preconditions were satisfied by the transaction facts."
            )
            confidence = 0.90
        else:
            conclusion = "PROVEN" if proven else "UNPROVEN"
            narrative = f"Hypothesis '{goal_str}' evaluation: {'Proven' if proven else 'Refuted'}."
            confidence = 0.80

        return ExtractedAnswer(
            conclusion=conclusion,
            is_fraud=is_fraud,
            confidence=confidence,
            variable_bindings=bindings,
            answering_rules=bc_result.rules_used,
            supporting_evidence=supporting_facts,
            audit_trail=[bc_result.proof_tree.format_tree()],
            natural_language_explanation=narrative,
        )
