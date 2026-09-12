"""
Semantic Network Knowledge Representation Module for FraudSentinel Expert System.

Implements a directed labeled semantic network graph representing banking entities,
taxonomic classifications (is_a, instance_of), relational properties, and risk propagation paths.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple


@dataclass
class SemanticNode:
    id: str
    label: str
    node_type: str  # e.g., 'Entity', 'Concept', 'Category', 'RiskFactor'
    properties: Dict[str, Any] = field(default_factory=dict)


@dataclass
class SemanticEdge:
    source_id: str
    target_id: str
    relation: str  # e.g., 'is_a', 'performed_by', 'used_device', 'indicates_risk'
    weight: float = 1.0
    properties: Dict[str, Any] = field(default_factory=dict)


class SemanticNetwork:
    """
    Graph-based semantic network model for entity-relation reasoning.
    """

    def __init__(self):
        self.nodes: Dict[str, SemanticNode] = {}
        self.edges: List[SemanticEdge] = []
        self._adjacency: Dict[str, List[SemanticEdge]] = {}

    def add_node(self, node_id: str, label: str, node_type: str = "Entity", **properties) -> SemanticNode:
        if node_id not in self.nodes:
            node = SemanticNode(id=node_id, label=label, node_type=node_type, properties=properties)
            self.nodes[node_id] = node
            self._adjacency[node_id] = []
        return self.nodes[node_id]

    def add_edge(self, source_id: str, target_id: str, relation: str, weight: float = 1.0, **properties) -> SemanticEdge:
        edge = SemanticEdge(source_id=source_id, target_id=target_id, relation=relation, weight=weight, properties=properties)
        self.edges.append(edge)
        if source_id not in self._adjacency:
            self._adjacency[source_id] = []
        self._adjacency[source_id].append(edge)
        return edge

    def get_neighbors(self, node_id: str, relation: Optional[str] = None) -> List[Tuple[SemanticNode, str]]:
        """Get all target nodes connected from node_id, optionally filtered by relation."""
        results = []
        if node_id in self._adjacency:
            for edge in self._adjacency[node_id]:
                if relation is None or edge.relation == relation:
                    if edge.target_id in self.nodes:
                        results.append((self.nodes[edge.target_id], edge.relation))
        return results

    def find_paths(self, start_id: str, target_id: str, max_depth: int = 4) -> List[List[Tuple[str, str]]]:
        """
        Find all directed paths between two nodes up to max_depth.
        Returns list of paths where each path is a list of (node_id, relation_used).
        """
        paths: List[List[Tuple[str, str]]] = []

        def dfs(current_id: str, current_path: List[Tuple[str, str]], depth: int):
            if current_id == target_id and len(current_path) > 0:
                paths.append(list(current_path))
                return
            if depth >= max_depth:
                return

            if current_id in self._adjacency:
                for edge in self._adjacency[current_id]:
                    next_id = edge.target_id
                    if not any(step[0] == next_id for step in current_path):
                        current_path.append((next_id, edge.relation))
                        dfs(next_id, current_path, depth + 1)
                        current_path.pop()

        dfs(start_id, [], 0)
        return paths

    def to_dict(self) -> Dict[str, Any]:
        """Serialize semantic network for inspection, auditing, or UI visualization."""
        return {
            "nodes": [
                {
                    "id": n.id,
                    "label": n.label,
                    "node_type": n.node_type,
                    "properties": n.properties,
                }
                for n in self.nodes.values()
            ],
            "edges": [
                {
                    "source": e.source_id,
                    "target": e.target_id,
                    "relation": e.relation,
                    "weight": e.weight,
                    "properties": e.properties,
                }
                for e in self.edges
            ],
        }

    @classmethod
    def build_for_transaction(
        cls,
        tx_data: Dict[str, Any],
        derived_facts: Optional[Set[str]] = None,
    ) -> "SemanticNetwork":
        """
        Construct a transaction-specific semantic network incorporating domain taxonomy,
        observed transaction attributes, and inferred risk categories.
        """
        net = cls()
        tx_id = str(tx_data.get("transaction_id", "TX_CURRENT"))
        cust_id = str(tx_data.get("customer_id", "CUST_CURRENT"))
        amount = float(tx_data.get("transaction_amount", 0.0))
        device = str(tx_data.get("device_type", "UnknownDevice"))
        location = str(tx_data.get("transaction_location", "UnknownLocation"))
        tx_type = str(tx_data.get("transaction_type", "Payment"))

        # 1. Base Taxonomies (Classes)
        net.add_node("Class:Transaction", "Transaction Event", "Class")
        net.add_node("Class:FinancialCrime", "Financial Crime Category", "Class")
        net.add_node("Class:AccountTakeover", "Account Takeover Pattern", "Class")
        net.add_edge("Class:AccountTakeover", "Class:FinancialCrime", "is_a")

        # 2. Entity Instances
        net.add_node(tx_id, f"Tx #{tx_id} (${amount:,.2f})", "Transaction", amount=amount, type=tx_type)
        net.add_node(cust_id, f"Customer #{cust_id}", "Customer")
        net.add_node(f"Device:{device}", f"Device ({device})", "Device")
        net.add_node(f"Location:{location}", f"Location ({location})", "Location")

        net.add_edge(tx_id, "Class:Transaction", "instance_of")
        net.add_edge(tx_id, cust_id, "performed_by")
        net.add_edge(tx_id, f"Device:{device}", "used_device")
        net.add_edge(tx_id, f"Location:{location}", "occurred_at")

        # 3. Behavioral and Anomaly Flags
        facts = derived_facts or set()

        if int(tx_data.get("customer_device_change", 0)) == 1 or "device_change" in facts:
            net.add_node("Risk:DeviceAnomaly", "Unrecognized Device Change", "RiskFactor")
            net.add_edge(tx_id, "Risk:DeviceAnomaly", "has_risk_indicator")
            net.add_edge("Risk:DeviceAnomaly", "Class:AccountTakeover", "indicates_risk")

        if int(tx_data.get("customer_location_change", 0)) == 1 or "location_change" in facts:
            net.add_node("Risk:LocationAnomaly", "Unusual Geographical Shift", "RiskFactor")
            net.add_edge(tx_id, "Risk:LocationAnomaly", "has_risk_indicator")
            net.add_edge("Risk:LocationAnomaly", "Class:AccountTakeover", "indicates_risk")

        if int(tx_data.get("customer_transactions_last_1h", 0)) >= 2 or "rapid_velocity" in facts:
            net.add_node("Risk:HighVelocity", "Burst Frequency Anomaly", "RiskFactor")
            net.add_edge(tx_id, "Risk:HighVelocity", "has_risk_indicator")
            net.add_edge("Risk:HighVelocity", "Class:FinancialCrime", "indicates_risk")

        if "high_amount" in facts or amount >= 2500.0:
            net.add_node("Risk:HighAmount", f"High Value Exposure (${amount:,.2f})", "RiskFactor")
            net.add_edge(tx_id, "Risk:HighAmount", "has_risk_indicator")
            net.add_edge("Risk:HighAmount", "Class:FinancialCrime", "amplifies_risk")

        if "night_transaction" in facts or int(tx_data.get("is_night_transaction", 0)) == 1:
            net.add_node("Risk:NightHours", "Nocturnal Execution Window", "RiskFactor")
            net.add_edge(tx_id, "Risk:NightHours", "has_risk_indicator")
            net.add_edge("Risk:NightHours", "Class:FinancialCrime", "indicates_risk")

        # 4. Final Classification node
        if "fraud" in facts:
            net.add_node("Conclusion:FraudAlert", "HIGH RISK FRAUD ALERT", "Conclusion", status="CONFIRMED_FRAUD")
            net.add_edge(tx_id, "Conclusion:FraudAlert", "classified_as")
            net.add_edge("Class:FinancialCrime", "Conclusion:FraudAlert", "triggers")
        elif "legitimate" in facts:
            net.add_node("Conclusion:Legitimate", "CLEARED TRANSACTION", "Conclusion", status="CLEARED")
            net.add_edge(tx_id, "Conclusion:Legitimate", "classified_as")

        return net
