"""
Backward Chaining Inference Engine for FraudSentinel Expert System.

Implements goal-driven recursive reasoning to prove or refute candidate hypotheses
(e.g., goal: fraud(Tx)) and construct formal hierarchical proof trees.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple

from backend.ml.reasoning.knowledge_base import Fact, KnowledgeBase, Rule


@dataclass
class ProofNode:
    """Represents a node in the backward chaining proof tree."""
    goal: str
    proven: bool
    is_ground_fact: bool = False
    rule_name: Optional[str] = None
    children: List["ProofNode"] = field(default_factory=list)
    explanation: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "goal": self.goal,
            "proven": self.proven,
            "is_ground_fact": self.is_ground_fact,
            "rule_name": self.rule_name,
            "explanation": self.explanation,
            "children": [child.to_dict() for child in self.children],
        }

    def format_tree(self, prefix: str = "", is_last: bool = True) -> str:
        marker = "└── " if is_last else "├── "
        status = "✓ [PROVEN]" if self.proven else "✗ [FAILED]"
        source = f"(Fact)" if self.is_ground_fact else f"(Rule: {self.rule_name})" if self.rule_name else ""
        expl = f" [{self.explanation}]" if (not self.proven and self.explanation) else ""
        res = f"{prefix}{marker}{self.goal} {status} {source}{expl}\n"

        child_prefix = prefix + ("    " if is_last else "│   ")
        for i, child in enumerate(self.children):
            res += child.format_tree(child_prefix, i == len(self.children) - 1)
        return res


@dataclass
class BackwardChainingResult:
    target_goal: Fact
    proven: bool
    proof_tree: ProofNode
    rules_used: List[str]


class BackwardChainingEngine:
    """
    Goal-driven backward chainer for hypothesis verification.
    """

    def __init__(self, kb: KnowledgeBase):
        self.kb = kb

    def prove_goal(
        self,
        goal: Fact,
        initial_facts: Set[Fact],
    ) -> BackwardChainingResult:
        """
        Prove whether a candidate goal is true given initial facts and rules.
        """
        visited: Set[Fact] = set()
        rules_used: List[str] = []

        proven, proof_tree = self._prove(goal, initial_facts, visited, rules_used)
        return BackwardChainingResult(
            target_goal=goal,
            proven=proven,
            proof_tree=proof_tree,
            rules_used=list(dict.fromkeys(rules_used)),
        )

    def _prove(
        self,
        goal: Fact,
        known_facts: Set[Fact],
        visited: Set[Fact],
        rules_used: List[str],
    ) -> Tuple[bool, ProofNode]:
        # 1. Base case: Goal is already a known ground fact
        if goal in known_facts:
            return True, ProofNode(
                goal=str(goal),
                proven=True,
                is_ground_fact=True,
                explanation=f"Directly observed ground transaction fact: {goal}",
            )

        # 2. Cycle detection
        if goal in visited:
            return False, ProofNode(
                goal=str(goal),
                proven=False,
                explanation=f"Cycle detected for sub-goal {goal}",
            )

        visited.add(goal)

        # 3. Find candidate rules matching this goal as consequent
        candidate_rules = [r for r in self.kb.rules if r.consequent == goal]
        candidate_rules.sort(key=lambda r: (-r.priority, r.name))

        attempted_children: List[ProofNode] = []
        for rule in candidate_rules:
            rule_proven = True
            child_nodes: List[ProofNode] = []

            for antecedent in rule.antecedents:
                sub_proven, sub_node = self._prove(
                    antecedent, known_facts, set(visited), rules_used
                )
                child_nodes.append(sub_node)
                if not sub_proven:
                    rule_proven = False
                    break  # Short-circuit conjunctive clause

            if rule_proven:
                rules_used.append(rule.name)
                return True, ProofNode(
                    goal=str(goal),
                    proven=True,
                    is_ground_fact=False,
                    rule_name=rule.name,
                    children=child_nodes,
                    explanation=rule.explanation_template or rule.description,
                )
            else:
                attempted_children.extend(child_nodes)

        # 4. If no rule could prove the goal
        return False, ProofNode(
            goal=str(goal),
            proven=False,
            is_ground_fact=False,
            children=attempted_children,
            explanation=f"No matching rule or facts could establish {goal}",
        )
