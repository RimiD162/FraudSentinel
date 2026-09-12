"""
Resolution Refutation Automated Theorem Prover for FraudSentinel Expert System.

Implements Robinson's (1965) Resolution Principle on Conjunctive Normal Form (CNF) clauses
to prove fraud hypotheses through proof by contradiction (deriving the empty clause □).
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple

from backend.ml.reasoning.knowledge_base import Fact, KnowledgeBase, Rule


@dataclass(frozen=True)
class Literal:
    """A propositional literal: positive (P) or negated (~P)."""
    name: str
    is_negated: bool = False

    def negate(self) -> "Literal":
        return Literal(name=self.name, is_negated=not self.is_negated)

    def is_complement(self, other: "Literal") -> bool:
        return self.name == other.name and self.is_negated != other.is_negated

    def __str__(self) -> str:
        return f"~{self.name}" if self.is_negated else self.name


@dataclass(frozen=True)
class Clause:
    """A disjunctive clause of literals {L1 v L2 v ... v Lk}."""
    literals: frozenset[Literal] = field(default_factory=frozenset)

    def is_empty(self) -> bool:
        """Returns True if this is the empty clause □ (contradiction)."""
        return len(self.literals) == 0

    def __str__(self) -> str:
        if self.is_empty():
            return "□ (Empty Clause / Contradiction)"
        return " ∨ ".join(sorted(str(lit) for lit in self.literals))

    @classmethod
    def from_literals(cls, *literals: Literal) -> "Clause":
        return cls(frozenset(literals))

    @classmethod
    def from_fact(cls, fact: Fact, is_negated: bool = False) -> "Clause":
        return cls(frozenset([Literal(fact.name, is_negated)]))

    @classmethod
    def from_rule(cls, rule: Rule) -> "Clause":
        """
        Convert Horn rule (A1 ∧ A2 ∧ ... ∧ An -> C) into CNF:
        (~A1 ∨ ~A2 ∨ ... ∨ ~An ∨ C)
        """
        lits = [Literal(ant.name, is_negated=True) for ant in rule.antecedents]
        lits.append(Literal(rule.consequent.name, is_negated=False))
        return cls(frozenset(lits))


@dataclass
class ResolutionStep:
    step_id: int
    clause1: str
    clause2: str
    resolved_on: str
    resolvent: str


@dataclass
class ResolutionRefutationResult:
    goal: str
    refutation_successful: bool  # True if contradiction □ was derived
    steps: List[ResolutionStep]
    final_clause: str
    total_resolutions: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "goal": self.goal,
            "refutation_successful": self.refutation_successful,
            "steps": [
                {
                    "step": s.step_id,
                    "clause_1": s.clause1,
                    "clause_2": s.clause2,
                    "resolved_on": s.resolved_on,
                    "resolvent": s.resolvent,
                }
                for s in self.steps
            ],
            "final_clause": self.final_clause,
            "total_resolutions": self.total_resolutions,
        }


class ResolutionRefutationEngine:
    """
    Propositional Resolution Refutation theorem prover.
    """

    def __init__(self, kb: KnowledgeBase):
        self.kb = kb

    def resolve_clauses(self, c1: Clause, c2: Clause) -> List[Tuple[Clause, Literal]]:
        """
        Perform pairwise resolution on two clauses.
        Returns list of (resolvent, resolved_literal).
        """
        resolvents: List[Tuple[Clause, Literal]] = []
        for lit1 in c1.literals:
            for lit2 in c2.literals:
                if lit1.is_complement(lit2):
                    # Form resolvent: (C1 \ {lit1}) ∪ (C2 \ {lit2})
                    new_lits = (c1.literals - {lit1}) | (c2.literals - {lit2})
                    # Eliminate tautologies (P v ~P) in resolvent
                    has_tautology = any(
                        l.negate() in new_lits for l in new_lits
                    )
                    if not has_tautology:
                        resolvents.append((Clause(new_lits), lit1))
        return resolvents

    def prove_hypothesis(
        self,
        goal: str,
        initial_facts: Set[Fact],
        max_steps: int = 100,
    ) -> ResolutionRefutationResult:
        """
        Prove hypothesis α by refutation:
        1. Base set = KB rules (in CNF) ∪ initial ground facts (unit clauses)
        2. Negate goal: {~α}
        3. Iteratively resolve until □ is derived or no new resolvents
        """
        clauses: Set[Clause] = set()

        # 1. Add KB rules converted to CNF
        for rule in self.kb.rules:
            clauses.add(Clause.from_rule(rule))

        # 2. Add initial ground facts as unit clauses
        for fact in initial_facts:
            clauses.add(Clause.from_fact(fact, is_negated=False))

        # 3. Add negated goal: {~goal}
        negated_goal_clause = Clause.from_literals(Literal(name=goal, is_negated=True))
        clauses.add(negated_goal_clause)

        steps: List[ResolutionStep] = []
        clause_list = list(clauses)
        step_id = 1

        # We prioritize unit resolution and set of support (resolving with negated goal / derived clauses)
        derived_set: Set[Clause] = set(clause_list)
        found_contradiction = False
        final_clause_str = "None"

        # Resolution loop
        outer_break = False
        while not outer_break and step_id <= max_steps:
            new_clauses_this_round: List[Clause] = []

            # Pairwise combinations, prioritizing smaller clauses
            clause_list.sort(key=lambda c: len(c.literals))

            for i in range(len(clause_list)):
                for j in range(i + 1, len(clause_list)):
                    c1 = clause_list[i]
                    c2 = clause_list[j]

                    resolvents = self.resolve_clauses(c1, c2)
                    for resolvent, resolved_lit in resolvents:
                        if resolvent not in derived_set:
                            derived_set.add(resolvent)
                            new_clauses_this_round.append(resolvent)

                            steps.append(
                                ResolutionStep(
                                    step_id=step_id,
                                    clause1=str(c1),
                                    clause2=str(c2),
                                    resolved_on=str(resolved_lit),
                                    resolvent=str(resolvent),
                                )
                            )
                            step_id += 1

                            if resolvent.is_empty():
                                found_contradiction = True
                                final_clause_str = str(resolvent)
                                outer_break = True
                                break

                    if outer_break or step_id > max_steps:
                        break
                if outer_break or step_id > max_steps:
                    break

            if not new_clauses_this_round or outer_break:
                break

            clause_list.extend(new_clauses_this_round)

        return ResolutionRefutationResult(
            goal=goal,
            refutation_successful=found_contradiction,
            steps=steps,
            final_clause=final_clause_str if found_contradiction else (str(clause_list[-1]) if clause_list else "None"),
            total_resolutions=len(steps),
        )
