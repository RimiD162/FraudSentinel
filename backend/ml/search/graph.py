"""
Graph Data Structures and Deterministic Fraud Network Representation for FraudSentinel.

Defines GraphNode, GraphEdge, FraudInvestigationGraph, and SearchResult.
Provides a deterministic multi-tier banking fraud investigation network with
victims, smurfing layers, money mules, layering clusters, and syndicate hubs.
"""

from dataclasses import dataclass, field
import math
from typing import Any, Dict, List, Optional, Set, Tuple


@dataclass
class SearchResult:
    """Standardized search outcome returned by all search algorithms."""
    algorithm_name: str
    found: bool
    path: List[str] = field(default_factory=list)
    path_cost: float = 0.0
    nodes_explored: int = 0
    explored_sequence: List[str] = field(default_factory=list)
    execution_time_ms: float = 0.0
    memory_usage_bytes: int = 0
    start_node: str = ""
    goal_node: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "algorithm_name": self.algorithm_name,
            "found": self.found,
            "path": self.path,
            "hop_count": max(0, len(self.path) - 1),
            "path_cost": round(self.path_cost, 4),
            "nodes_explored": self.nodes_explored,
            "explored_sequence": self.explored_sequence,
            "execution_time_ms": round(self.execution_time_ms, 4),
            "memory_usage_bytes": self.memory_usage_bytes,
            "start_node": self.start_node,
            "goal_node": self.goal_node,
        }


@dataclass
class GraphNode:
    """Represents an entity node in the fraud investigation network."""
    id: str
    label: str
    node_type: str  # 'Victim', 'Smurf', 'Mule', 'Layering', 'FraudHub', 'Legitimate'
    risk_score: float = 0.0
    coordinates: Tuple[float, float] = (0.0, 0.0)  # (x, y) feature embedding or topology coords
    properties: Dict[str, Any] = field(default_factory=dict)


@dataclass
class GraphEdge:
    """Represents a directed or weighted connection between two investigation entities."""
    source: str
    target: str
    cost: float = 1.0  # Path traversal cost / investigation effort / inverse risk
    relation: str = "transacted_with"
    properties: Dict[str, Any] = field(default_factory=dict)


class FraudInvestigationGraph:
    """
    Deterministic Graph container representing transactional and entity relations.
    """

    def __init__(self):
        self.nodes: Dict[str, GraphNode] = {}
        self.adjacency: Dict[str, List[GraphEdge]] = {}
        self._edge_cost_map: Dict[Tuple[str, str], float] = {}

    def add_node(
        self,
        node_id: str,
        label: Optional[str] = None,
        node_type: str = "Account",
        risk_score: float = 0.0,
        coordinates: Tuple[float, float] = (0.0, 0.0),
        **properties,
    ) -> GraphNode:
        if node_id not in self.nodes:
            node = GraphNode(
                id=node_id,
                label=label or node_id,
                node_type=node_type,
                risk_score=risk_score,
                coordinates=coordinates,
                properties=properties,
            )
            self.nodes[node_id] = node
            self.adjacency[node_id] = []
        return self.nodes[node_id]

    def add_edge(
        self,
        source: str,
        target: str,
        cost: float = 1.0,
        relation: str = "transacted_with",
        bidirectional: bool = False,
        **properties,
    ):
        if source not in self.nodes:
            self.add_node(source)
        if target not in self.nodes:
            self.add_node(target)

        edge = GraphEdge(
            source=source,
            target=target,
            cost=cost,
            relation=relation,
            properties=properties,
        )
        self.adjacency[source].append(edge)
        self._edge_cost_map[(source, target)] = cost

        if bidirectional:
            back_edge = GraphEdge(
                source=target,
                target=source,
                cost=cost,
                relation=relation,
                properties=properties,
            )
            self.adjacency[target].append(back_edge)
            self._edge_cost_map[(target, source)] = cost

    def get_neighbors(self, node_id: str) -> List[Tuple[str, float, str]]:
        """Return list of (target_id, cost, relation) for neighbors of node_id."""
        if node_id not in self.adjacency:
            return []
        return [(e.target, e.cost, e.relation) for e in self.adjacency[node_id]]

    def get_edge_cost(self, source: str, target: str) -> float:
        return self._edge_cost_map.get((source, target), float("inf"))

    def get_node(self, node_id: str) -> Optional[GraphNode]:
        return self.nodes.get(node_id)

    @classmethod
    def create_benchmark_fraud_network(cls) -> "FraudInvestigationGraph":
        """
        Constructs a deterministic, multi-tier banking fraud investigation network.
        
        Topology:
        - Origin: Victim accounts (VIC_1, VIC_2, VIC_3) at x=0
        - Smurfing / Structuring Layer: SMURF_1..SMURF_6 at x=20
        - Money Mule Accounts: MULE_1..MULE_8 at x=40
        - Layering Shell Accounts: LAYER_1..LAYER_6 at x=60
        - Laundering Conversion Off-ramps: OFFRAMP_1..OFFRAMP_4 at x=80
        - Destination Syndicate Hubs: HUB_ALPHA, HUB_BETA at x=100
        - Parallel Legitimate Decoy Cluster: LEGIT_1..LEGIT_8 at various coordinates
        
        Deliberately contains:
        1. Low-hop, high-cost route (e.g. 2 hops, total cost = 50.0).
        2. Multi-hop, optimal-cost route (e.g. 5 hops, total cost = 16.0).
        3. Cyclic connections to test loop avoidance.
        4. Dead-end branches to test backtracking.
        """
        g = cls()

        # Tier 0: Victim Source Nodes (x=0)
        g.add_node("VIC_1", label="Victim Account 1", node_type="Victim", risk_score=0.1, coordinates=(0.0, 50.0))
        g.add_node("VIC_2", label="Victim Account 2", node_type="Victim", risk_score=0.1, coordinates=(0.0, 30.0))
        g.add_node("VIC_3", label="Victim Account 3", node_type="Victim", risk_score=0.2, coordinates=(0.0, 70.0))

        # Tier 1: Smurfing Layer (x=20)
        g.add_node("SMURF_1", label="Smurf Conduit 1", node_type="Smurf", risk_score=0.6, coordinates=(20.0, 55.0))
        g.add_node("SMURF_2", label="Smurf Conduit 2", node_type="Smurf", risk_score=0.65, coordinates=(20.0, 45.0))
        g.add_node("SMURF_3", label="Smurf Conduit 3", node_type="Smurf", risk_score=0.55, coordinates=(20.0, 25.0))
        g.add_node("SMURF_4", label="Smurf Conduit 4", node_type="Smurf", risk_score=0.5, coordinates=(20.0, 75.0))
        g.add_node("SMURF_5", label="Smurf Conduit 5", node_type="Smurf", risk_score=0.4, coordinates=(20.0, 10.0))
        g.add_node("SMURF_6", label="Smurf Conduit 6", node_type="Smurf", risk_score=0.7, coordinates=(20.0, 60.0))

        # Tier 2: Money Mule Layer (x=40)
        g.add_node("MULE_1", label="Mule Account Alpha", node_type="Mule", risk_score=0.85, coordinates=(40.0, 60.0))
        g.add_node("MULE_2", label="Mule Account Beta", node_type="Mule", risk_score=0.8, coordinates=(40.0, 42.0))
        g.add_node("MULE_3", label="Mule Account Gamma", node_type="Mule", risk_score=0.75, coordinates=(40.0, 20.0))
        g.add_node("MULE_4", label="Mule Account Delta", node_type="Mule", risk_score=0.9, coordinates=(40.0, 80.0))
        g.add_node("MULE_5", label="Mule Account Epsilon", node_type="Mule", risk_score=0.7, coordinates=(40.0, 30.0))
        g.add_node("MULE_6", label="Mule Account Zeta", node_type="Mule", risk_score=0.85, coordinates=(40.0, 70.0))

        # Tier 3: Layering Shell Accounts (x=60)
        g.add_node("LAYER_1", label="Layer Shell 1", node_type="Layering", risk_score=0.9, coordinates=(60.0, 55.0))
        g.add_node("LAYER_2", label="Layer Shell 2", node_type="Layering", risk_score=0.85, coordinates=(60.0, 45.0))
        g.add_node("LAYER_3", label="Layer Shell 3", node_type="Layering", risk_score=0.8, coordinates=(60.0, 25.0))
        g.add_node("LAYER_4", label="Layer Shell 4", node_type="Layering", risk_score=0.95, coordinates=(60.0, 75.0))

        # Tier 4: Conversion Off-ramps (x=80)
        g.add_node("OFFRAMP_1", label="Crypto Offramp 1", node_type="Offramp", risk_score=0.95, coordinates=(80.0, 52.0))
        g.add_node("OFFRAMP_2", label="Prepaid Hub 2", node_type="Offramp", risk_score=0.9, coordinates=(80.0, 48.0))
        g.add_node("OFFRAMP_3", label="Offshore Account 3", node_type="Offramp", risk_score=0.98, coordinates=(80.0, 74.0))

        # Tier 5: Target Fraud Hubs (x=100)
        g.add_node("HUB_ALPHA", label="Syndicate Hub Alpha", node_type="FraudHub", risk_score=0.99, coordinates=(100.0, 50.0))
        g.add_node("HUB_BETA", label="Syndicate Hub Beta", node_type="FraudHub", risk_score=0.95, coordinates=(100.0, 80.0))

        # Parallel Legitimate / Decoy Network
        g.add_node("LEGIT_1", label="Legitimate Merchant 1", node_type="Legitimate", risk_score=0.05, coordinates=(5.0, 45.0))
        g.add_node("LEGIT_2", label="Legitimate Merchant 2", node_type="Legitimate", risk_score=0.05, coordinates=(10.0, 42.0))
        g.add_node("LEGIT_3", label="Legitimate Merchant 3", node_type="Legitimate", risk_score=0.05, coordinates=(15.0, 39.0))
        g.add_node("LEGIT_4", label="Legitimate Merchant 4", node_type="Legitimate", risk_score=0.05, coordinates=(20.0, 36.0))

        # ----------------------------------------------------
        # EDGES CONFIGURATION (Designing controlled path cost vs hops)
        # ----------------------------------------------------

        # Route A: The Fewest-Hop "Direct Express" Route (Fewest hops, HIGH cost = 50.0)
        # VIC_1 -> MULE_DIRECT -> HUB_ALPHA (2 hops, cost = 25.0 + 25.0 = 50.0)
        g.add_node("MULE_DIRECT", label="Express Wire Conduit", node_type="Mule", risk_score=0.9, coordinates=(50.0, 50.0))
        g.add_edge("VIC_1", "MULE_DIRECT", cost=25.0, relation="express_wire")
        g.add_edge("MULE_DIRECT", "HUB_ALPHA", cost=25.0, relation="direct_settlement")

        # Route B: The Multi-Hop Optimal Cost Path (5 hops, LOW cost = 3.0 + 3.0 + 3.0 + 3.0 + 4.0 = 16.0)
        # VIC_1 -> SMURF_1 -> MULE_1 -> LAYER_1 -> OFFRAMP_1 -> HUB_ALPHA
        g.add_edge("VIC_1", "SMURF_1", cost=3.0, relation="structured_deposit")
        g.add_edge("SMURF_1", "MULE_1", cost=3.0, relation="peer_transfer")
        g.add_edge("MULE_1", "LAYER_1", cost=3.0, relation="layering_split")
        g.add_edge("LAYER_1", "OFFRAMP_1", cost=3.0, relation="crypto_purchase")
        g.add_edge("OFFRAMP_1", "HUB_ALPHA", cost=4.0, relation="wallet_sweep")

        # Route C: Alternative Suboptimal Medium Path (4 hops, cost = 6.0 + 7.0 + 8.0 + 9.0 = 30.0)
        # VIC_1 -> SMURF_2 -> MULE_2 -> LAYER_2 -> HUB_ALPHA
        g.add_edge("VIC_1", "SMURF_2", cost=6.0, relation="structured_deposit")
        g.add_edge("SMURF_2", "MULE_2", cost=7.0, relation="peer_transfer")
        g.add_edge("MULE_2", "LAYER_2", cost=8.0, relation="internal_transfer")
        g.add_edge("LAYER_2", "HUB_ALPHA", cost=9.0, relation="hub_aggregation")

        # Route D: Secondary Path to HUB_BETA
        g.add_edge("VIC_3", "SMURF_4", cost=4.0, relation="structured_deposit")
        g.add_edge("SMURF_4", "MULE_4", cost=5.0, relation="peer_transfer")
        g.add_edge("MULE_4", "LAYER_4", cost=5.0, relation="shell_forward")
        g.add_edge("LAYER_4", "OFFRAMP_3", cost=4.0, relation="offshore_wire")
        g.add_edge("OFFRAMP_3", "HUB_BETA", cost=4.0, relation="syndicate_payout")

        # Lateral / Cross-layer connections (creating cyclic and branchy topologies)
        g.add_edge("SMURF_1", "SMURF_2", cost=2.0, relation="lateral_rebalance", bidirectional=True)
        g.add_edge("MULE_1", "MULE_2", cost=3.0, relation="co_mule_transfer", bidirectional=True)
        g.add_edge("LAYER_1", "LAYER_2", cost=2.0, relation="account_consolidation", bidirectional=True)
        g.add_edge("MULE_1", "LAYER_2", cost=6.0, relation="redundant_hop")
        g.add_edge("MULE_2", "LAYER_1", cost=7.0, relation="redundant_hop")
        g.add_edge("LAYER_1", "OFFRAMP_2", cost=5.0, relation="crypto_transfer")
        g.add_edge("OFFRAMP_2", "HUB_ALPHA", cost=6.0, relation="direct_sweep")

        # Dead-end Branches (tests search backtracking)
        g.add_node("DEAD_END_1", label="Frozen Account 1", node_type="Frozen", risk_score=0.99, coordinates=(25.0, 65.0))
        g.add_node("DEAD_END_2", label="Closed Account 2", node_type="Closed", risk_score=0.2, coordinates=(30.0, 68.0))
        g.add_edge("VIC_1", "SMURF_6", cost=4.0, relation="attempted_channel")
        g.add_edge("SMURF_6", "DEAD_END_1", cost=2.0, relation="aborted_wire")
        g.add_edge("DEAD_END_1", "DEAD_END_2", cost=2.0, relation="interrupted_chain")

        # Connections from VIC_2 into network
        g.add_edge("VIC_2", "SMURF_3", cost=3.5, relation="structured_deposit")
        g.add_edge("SMURF_3", "MULE_3", cost=4.0, relation="peer_transfer")
        g.add_edge("MULE_3", "LAYER_3", cost=5.0, relation="layering_step")
        g.add_edge("LAYER_3", "HUB_ALPHA", cost=12.0, relation="final_sweep")

        # Interconnections with legitimate network
        g.add_edge("VIC_1", "LEGIT_1", cost=2.0, relation="retail_purchase")
        g.add_edge("LEGIT_1", "LEGIT_2", cost=2.0, relation="supplier_payment")
        g.add_edge("LEGIT_2", "LEGIT_3", cost=2.0, relation="payroll")
        g.add_edge("LEGIT_3", "LEGIT_4", cost=2.0, relation="utility_bill")

        return g
