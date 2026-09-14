"""Search & Investigation Service for FraudSentinel.

Executes graph search algorithms (A*, BFS, DFS, Greedy Best-First) over
the multi-tier banking fraud investigation network.
"""

from __future__ import annotations

from typing import Any, Dict, Optional

from app.schemas.investigation import SearchRequest, SearchResponse

try:
    from backend.ml.search.astar import a_star_search
    from backend.ml.search.best_first import best_first_search
    from backend.ml.search.bfs import breadth_first_search
    from backend.ml.search.dfs import depth_first_search
    from backend.ml.search.graph import FraudInvestigationGraph, SearchResult
    from backend.ml.search.heuristics import (
        euclidean_heuristic,
        manhattan_heuristic,
        risk_guided_heuristic,
        zero_heuristic,
    )
except ImportError:
    from ml.search.astar import a_star_search
    from ml.search.best_first import best_first_search
    from ml.search.bfs import breadth_first_search
    from ml.search.dfs import depth_first_search
    from ml.search.graph import FraudInvestigationGraph, SearchResult
    from ml.search.heuristics import (
        euclidean_heuristic,
        manhattan_heuristic,
        risk_guided_heuristic,
        zero_heuristic,
    )


class SearchService:
    """Service executing deterministic graph search algorithms."""

    def __init__(self):
        self.graph = FraudInvestigationGraph.create_benchmark_fraud_network()
        self.heuristic_map = {
            "euclidean": euclidean_heuristic,
            "manhattan": manhattan_heuristic,
            "risk_guided": risk_guided_heuristic,
            "zero": zero_heuristic,
        }

    def search(self, req: SearchRequest) -> SearchResponse:
        """Run requested search algorithm on the fraud network."""
        algo = req.algorithm.lower()
        h_name = req.heuristic.lower()
        heuristic_fn = self.heuristic_map.get(h_name, euclidean_heuristic)

        if algo == "astar":
            res: SearchResult = a_star_search(
                self.graph, req.start_node, req.goal_node, heuristic=heuristic_fn
            )
        elif algo == "bfs":
            res: SearchResult = breadth_first_search(
                self.graph, req.start_node, req.goal_node
            )
        elif algo == "dfs":
            res: SearchResult = depth_first_search(
                self.graph, req.start_node, req.goal_node
            )
        elif algo in ["best_first", "gbfs"]:
            res: SearchResult = best_first_search(
                self.graph, req.start_node, req.goal_node, heuristic=heuristic_fn
            )
        else:
            # Default to A*
            res: SearchResult = a_star_search(
                self.graph, req.start_node, req.goal_node, heuristic=heuristic_fn
            )

        res_dict = res.to_dict()
        return SearchResponse(
            algorithm_name=res_dict["algorithm_name"],
            found=res_dict["found"],
            path=res_dict["path"],
            hop_count=res_dict["hop_count"],
            path_cost=res_dict["path_cost"],
            nodes_explored=res_dict["nodes_explored"],
            explored_sequence=res_dict["explored_sequence"],
            execution_time_ms=res_dict["execution_time_ms"],
            memory_usage_bytes=res_dict["memory_usage_bytes"],
            start_node=res_dict["start_node"],
            goal_node=res_dict["goal_node"],
            heuristic_used=h_name if algo in ["astar", "best_first", "gbfs"] else None,
        )


def get_search_service() -> SearchService:
    return SearchService()
