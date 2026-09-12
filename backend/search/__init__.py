"""
Bridge package re-exporting backend.ml.search for top-level search modularity.
"""

from backend.ml.search import (
    FraudInvestigationGraph,
    GraphEdge,
    GraphNode,
    HeuristicFn,
    SearchResult,
    a_star_search,
    best_first_search,
    breadth_first_search,
    depth_first_search,
    euclidean_heuristic,
    generate_benchmark_visualization,
    manhattan_heuristic,
    risk_guided_heuristic,
    run_comprehensive_benchmark,
    run_single_comparison,
    verify_admissibility_and_consistency,
    zero_heuristic,
)

__all__ = [
    "breadth_first_search",
    "depth_first_search",
    "best_first_search",
    "a_star_search",
    "FraudInvestigationGraph",
    "GraphNode",
    "GraphEdge",
    "SearchResult",
    "HeuristicFn",
    "euclidean_heuristic",
    "manhattan_heuristic",
    "risk_guided_heuristic",
    "zero_heuristic",
    "verify_admissibility_and_consistency",
    "run_comprehensive_benchmark",
    "run_single_comparison",
    "generate_benchmark_visualization",
]
