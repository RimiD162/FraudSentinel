"""
Forward Chaining Inference Engine for FraudSentinel Expert System.

Implements data-driven forward reasoning with conflict resolution (priority ordering),
working memory state tracking, and chronological inference logging.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set

from backend.ml.reasoning.knowledge_base import Fact, KnowledgeBase, Rule


@dataclass
class ForwardChainingStep:
    step_number: int
    rule_name: str
    antecedents: List[str]
    consequent: str
    description: str
    explanation: str


@dataclass
class ForwardChainingResult:
    initial_facts: Set[Fact]
    final_facts: Set[Fact]
    derived_facts: Set[Fact]
    triggered_rules: List[Rule]
    reasoning_chain: List[ForwardChainingStep]
    is_fraud: bool
    is_legitimate: bool
    verdict: str


class ForwardChainingEngine:
    """
    Data-driven inference engine matching facts against rule antecedents.
    """

    def __init__(self, kb: KnowledgeBase):
        self.kb = kb

    def run(
        self,
        initial_facts: Set[Fact],
        stop_on_fraud: bool = False,
        stop_on_conclusion: bool = False,
    ) -> ForwardChainingResult:
        """
        Execute forward chaining until a fixed-point is reached (saturation)
        or a stopping condition is met.
        """
        working_memory: Set[Fact] = set(initial_facts)
        triggered_rules: List[Rule] = []
        reasoning_chain: List[ForwardChainingStep] = []
        derived_facts: Set[Fact] = set()

        step_counter = 1
        fired_rule_names: Set[str] = set()

        while True:
            # 1. Match: find candidate rules whose antecedents are satisfied
            # but whose consequent hasn't been added yet or rule hasn't fired
            conflict_set: List[Rule] = []
            for rule in self.kb.rules:
                if rule.name in fired_rule_names:
                    continue
                if rule.matches(working_memory):
                    conflict_set.append(rule)

            if not conflict_set:
                break  # Fixed-point reached

            # 2. Conflict Resolution: sort by rule priority (descending), then name
            conflict_set.sort(key=lambda r: (-r.priority, r.name))
            selected_rule = conflict_set[0]

            # 3. Fire: assert consequent into working memory
            fired_rule_names.add(selected_rule.name)
            triggered_rules.append(selected_rule)

            if selected_rule.consequent not in working_memory:
                derived_facts.add(selected_rule.consequent)
                working_memory.add(selected_rule.consequent)

            reasoning_chain.append(
                ForwardChainingStep(
                    step_number=step_counter,
                    rule_name=selected_rule.name,
                    antecedents=[str(a) for a in selected_rule.antecedents],
                    consequent=str(selected_rule.consequent),
                    description=selected_rule.description,
                    explanation=selected_rule.explanation_template or selected_rule.description,
                )
            )
            step_counter += 1

            if stop_on_fraud and Fact("fraud") in working_memory:
                break

            if stop_on_conclusion and (Fact("fraud") in working_memory or Fact("legitimate") in working_memory):
                break

        is_fraud = Fact("fraud") in working_memory
        is_legitimate = Fact("legitimate") in working_memory

        if is_fraud:
            verdict = "FRAUD"
        elif is_legitimate:
            verdict = "LEGITIMATE"
        elif any("suspicious" in f.name for f in working_memory):
            verdict = "SUSPICIOUS"
        else:
            verdict = "INDETERMINATE"

        return ForwardChainingResult(
            initial_facts=initial_facts,
            final_facts=working_memory,
            derived_facts=derived_facts,
            triggered_rules=triggered_rules,
            reasoning_chain=reasoning_chain,
            is_fraud=is_fraud,
            is_legitimate=is_legitimate,
            verdict=verdict,
        )
