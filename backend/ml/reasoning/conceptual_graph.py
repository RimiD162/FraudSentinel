"""
Conceptual Graph Knowledge Representation Module for FraudSentinel Expert System.

Implements Sowa's (1984) Conceptual Graph formalism using a bipartite structure of
Concepts [Type: Referent] and Conceptual Relations (relation), with standard linear form serialization.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple


@dataclass
class ConceptNode:
    """Represents a Concept box [ConceptType: Referent] in Sowa's formalism."""
    id: str
    concept_type: str  # e.g., CUSTOMER, TRANSACTION, AMOUNT, TIME, LOCATION
    referent: str      # e.g., 'C104', 'TX992', '$5,000', 'NightHours', '*'

    def __str__(self) -> str:
        if self.referent and self.referent != "*":
            return f"[{self.concept_type}: {self.referent}]"
        return f"[{self.concept_type}]"


@dataclass
class ConceptualRelationNode:
    """Represents a Conceptual Relation circle (relation_name) linking concepts."""
    id: str
    relation_name: str  # e.g., 'initiates', 'has_amount', 'occurs_during', 'originates_from'
    from_concept_id: str
    to_concept_id: str

    def __str__(self) -> str:
        return f"({self.relation_name})"


class ConceptualGraph:
    """
    Sowa (1984) Conceptual Graph bipartite structure.
    """

    def __init__(self):
        self.concepts: Dict[str, ConceptNode] = {}
        self.relations: List[ConceptualRelationNode] = []
        self._counter = 0

    def _next_id(self, prefix: str) -> str:
        self._counter += 1
        return f"{prefix}_{self._counter}"

    def add_concept(self, concept_type: str, referent: str = "*", concept_id: Optional[str] = None) -> ConceptNode:
        c_id = concept_id or self._next_id("C")
        concept = ConceptNode(id=c_id, concept_type=concept_type.upper(), referent=str(referent))
        self.concepts[c_id] = concept
        return concept

    def add_relation(self, relation_name: str, from_concept_id: str, to_concept_id: str) -> ConceptualRelationNode:
        if from_concept_id not in self.concepts:
            raise KeyError(f"Source concept '{from_concept_id}' not found in conceptual graph.")
        if to_concept_id not in self.concepts:
            raise KeyError(f"Target concept '{to_concept_id}' not found in conceptual graph.")

        rel_id = self._next_id("R")
        rel = ConceptualRelationNode(
            id=rel_id,
            relation_name=relation_name.lower(),
            from_concept_id=from_concept_id,
            to_concept_id=to_concept_id,
        )
        self.relations.append(rel)
        return rel

    def linear_form(self) -> str:
        """
        Render the Conceptual Graph into standard Sowa Linear Notation:
        [CONCEPT_A: referent] -> (relation) -> [CONCEPT_B: referent]
        """
        lines = []
        for rel in self.relations:
            from_c = self.concepts[rel.from_concept_id]
            to_c = self.concepts[rel.to_concept_id]
            lines.append(f"{from_c} -> {rel} -> {to_c}")
        return "\n".join(lines)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize conceptual graph to dictionary."""
        return {
            "concepts": [
                {
                    "id": c.id,
                    "type": c.concept_type,
                    "referent": c.referent,
                    "formatted": str(c),
                }
                for c in self.concepts.values()
            ],
            "relations": [
                {
                    "id": r.id,
                    "name": r.relation_name,
                    "from_concept": str(self.concepts[r.from_concept_id]),
                    "to_concept": str(self.concepts[r.to_concept_id]),
                    "linear_step": f"{self.concepts[r.from_concept_id]} -> ({r.relation_name}) -> {self.concepts[r.to_concept_id]}",
                }
                for r in self.relations
            ],
            "linear_notation": self.linear_form(),
        }

    @classmethod
    def build_for_transaction(
        cls,
        tx_data: Dict[str, Any],
        derived_facts: Optional[Set[str]] = None,
    ) -> "ConceptualGraph":
        """
        Build a domain conceptual graph modeling the transactional act, actor,
        temporal envelope, spatial origin, and risk conclusions.
        """
        cg = cls()
        tx_id = str(tx_data.get("transaction_id", "TX_9001"))
        cust_id = str(tx_data.get("customer_id", "CUST_4001"))
        amount = float(tx_data.get("transaction_amount", 0.0))
        device = str(tx_data.get("device_type", "Mobile"))
        location = str(tx_data.get("transaction_location", "New York"))
        hour = tx_data.get("transaction_hour", 12)

        # Primary Concepts
        c_cust = cg.add_concept("CUSTOMER", cust_id, "c_cust")
        c_tx = cg.add_concept("TRANSACTION", tx_id, "c_tx")
        c_amt = cg.add_concept("MONETARY_AMOUNT", f"${amount:,.2f}", "c_amt")
        c_dev = cg.add_concept("DEVICE", device, "c_dev")
        c_loc = cg.add_concept("LOCATION", location, "c_loc")
        c_time = cg.add_concept("TIME_OF_DAY", f"{hour:02d}:00", "c_time")

        # Primary Relations
        cg.add_relation("initiates", c_cust.id, c_tx.id)
        cg.add_relation("has_amount", c_tx.id, c_amt.id)
        cg.add_relation("utilizes_device", c_tx.id, c_dev.id)
        cg.add_relation("originates_from", c_tx.id, c_loc.id)
        cg.add_relation("executed_at", c_tx.id, c_time.id)

        facts = derived_facts or set()

        # Risk-specific Conceptual Subgraphs
        if "high_amount" in facts or amount >= 2500.0:
            c_high = cg.add_concept("RISK_ASSESSMENT", "HighFinancialExposure")
            cg.add_relation("evaluated_as", c_amt.id, c_high.id)

        if "night_transaction" in facts or int(tx_data.get("is_night_transaction", 0)) == 1:
            c_nocturnal = cg.add_concept("ANOMALY", "NocturnalWindow")
            cg.add_relation("violates_normalcy", c_time.id, c_nocturnal.id)

        if "device_change" in facts or int(tx_data.get("customer_device_change", 0)) == 1:
            c_dev_anom = cg.add_concept("ANOMALY", "UnrecognizedHardware")
            cg.add_relation("flags_irregularity", c_dev.id, c_dev_anom.id)

        if "location_change" in facts or int(tx_data.get("customer_location_change", 0)) == 1:
            c_loc_anom = cg.add_concept("ANOMALY", "GeographicalDiscrepancy")
            cg.add_relation("flags_irregularity", c_loc.id, c_loc_anom.id)

        if "fraud" in facts:
            c_verdict = cg.add_concept("VERDICT", "FRAUD_ALERT")
            cg.add_relation("triggers_verdict", c_tx.id, c_verdict.id)
        elif "legitimate" in facts:
            c_verdict = cg.add_concept("VERDICT", "CLEARED_LEGITIMATE")
            cg.add_relation("triggers_verdict", c_tx.id, c_verdict.id)

        return cg
