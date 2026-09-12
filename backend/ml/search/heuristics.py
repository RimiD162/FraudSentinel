"""
Heuristic Functions for Informed Graph Search in FraudSentinel.

Implements admissible and consistent geometric heuristics (Euclidean, Manhattan),
risk-weighted guidance heuristics, zero heuristic (Uniform Cost Search baseline),
and formal verification of admissibility and consistency.
"""

import math
from typing import Any, Callable, Dict, List, Optional, Tuple

from backend.ml.search.graph import FraudInvestigationGraph, GraphNode

# Standard Heuristic Function Type Signature: (current_node_id, goal_node_id, graph) -> float
HeuristicFn = Callable[[str, str, FraudInvestigationGraph], float]


def euclidean_heuristic(u: str, goal: str, graph: FraudInvestigationGraph, scale_factor: float = 7.0) -> float:
    """
    Admissible Euclidean distance heuristic normalized by scale factor.
    
    h(u) = sqrt((x_u - x_g)^2 + (y_u - y_g)^2) / scale_factor
    
    When scale_factor >= max(euclidean_dist / path_cost), h(u) <= h*(u)
    is strictly admissible and consistent (satisfies triangle inequality).
    """
    node_u = graph.get_node(u)
    node_g = graph.get_node(goal)

    if not node_u or not node_g:
        return 0.0

    xu, yu = node_u.coordinates
    xg, yg = node_g.coordinates
    dist = math.sqrt((xu - xg) ** 2 + (yu - yg) ** 2)
    return dist / scale_factor


def manhattan_heuristic(u: str, goal: str, graph: FraudInvestigationGraph, scale_factor: float = 10.0) -> float:
    """
    Admissible Manhattan distance heuristic:
    h(u) = (|x_u - x_g| + |y_u - y_g|) / scale_factor
    """
    node_u = graph.get_node(u)
    node_g = graph.get_node(goal)

    if not node_u or not node_g:
        return 0.0

    xu, yu = node_u.coordinates
    xg, yg = node_g.coordinates
    dist = abs(xu - xg) + abs(yu - yg)
    return dist / scale_factor


def risk_guided_heuristic(u: str, goal: str, graph: FraudInvestigationGraph) -> float:
    """
    Informed heuristic for Greedy Best-First Search that incorporates both
    geometric proximity and entity risk score. Nodes with higher risk scores
    receive an exploration discount, driving the search towards high-risk conduits.
    """
    base_h = euclidean_heuristic(u, goal, graph, scale_factor=5.0)
    node_u = graph.get_node(u)
    if node_u:
        # High risk (e.g. 0.9) discounts remaining estimate, attracting greedy search
        risk_discount = 1.0 - (0.4 * node_u.risk_score)
        return max(0.0, base_h * risk_discount)
    return base_h


def zero_heuristic(u: str, goal: str, graph: FraudInvestigationGraph) -> float:
    """
    Trivial null heuristic h(n) = 0.
    Under A*, this degenerates into Dijkstra's Algorithm (Uniform Cost Search).
    """
    return 0.0


def verify_admissibility_and_consistency(
    graph: FraudInvestigationGraph,
    goal: str,
    heuristic: HeuristicFn,
    true_shortest_costs: Dict[str, float],
) -> Dict[str, Any]:
    """
    Verify whether heuristic is admissible (h(n) <= h*(n)) and consistent
    (h(u) <= c(u, v) + h(v) for all edges (u, v)).
    """
    admissible_violations: List[Dict[str, Any]] = []
    consistency_violations: List[Dict[str, Any]] = []

    # 1. Check admissibility
    for node_id in graph.nodes:
        if node_id in true_shortest_costs:
            h_val = heuristic(node_id, goal, graph)
            h_star = true_shortest_costs[node_id]
            if h_val > h_star + 1e-5:  # Tolerance for float imprecision
                admissible_violations.append({
                    "node": node_id,
                    "h": round(h_val, 4),
                    "h_star": round(h_star, 4),
                    "overestimate": round(h_val - h_star, 4),
                })

    # 2. Check consistency (monotonicity): h(u) <= c(u, v) + h(v)
    for u, edges in graph.adjacency.items():
        h_u = heuristic(u, goal, graph)
        for edge in edges:
            v = edge.target
            h_v = heuristic(v, goal, graph)
            cost_uv = edge.cost
            if h_u > cost_uv + h_v + 1e-5:
                consistency_violations.append({
                    "edge": (u, v),
                    "h_u": round(h_u, 4),
                    "c_uv": round(cost_uv, 4),
                    "h_v": round(h_v, 4),
                    "lhs": round(h_u, 4),
                    "rhs": round(cost_uv + h_v, 4),
                })

    return {
        "is_admissible": len(admissible_violations) == 0,
        "is_consistent": len(consistency_violations) == 0,
        "admissible_violations_count": len(admissible_violations),
        "consistency_violations_count": len(consistency_violations),
        "admissible_violations": admissible_violations,
        "consistency_violations": consistency_violations,
    }
