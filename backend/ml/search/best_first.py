"""
Greedy Best-First Search Module for FraudSentinel.

Implements priority-queue informed graph search guided by heuristic evaluation:
f(n) = h(n).
Greedily expands the node judged closest to the investigation target.
Features performance benchmarking and returns standardized SearchResult.
"""

import heapq
import itertools
import time
import tracemalloc
from typing import Callable, Dict, List, Optional, Set, Tuple

from backend.ml.search.graph import FraudInvestigationGraph, SearchResult
from backend.ml.search.heuristics import HeuristicFn, euclidean_heuristic


def best_first_search(
    graph: FraudInvestigationGraph,
    start: str,
    goal: str,
    heuristic: Optional[HeuristicFn] = None,
) -> SearchResult:
    """
    Execute Greedy Best-First Search from start to goal.

    Args:
        graph: The fraud investigation graph.
        start: Starting node identifier.
        goal: Target node identifier.
        heuristic: Heuristic evaluation function h(node, goal, graph).
                   Defaults to euclidean_heuristic.

    Returns:
        SearchResult containing path, cost, nodes explored, latency, and memory.
    """
    tracemalloc.start()
    start_time = time.perf_counter()

    h_fn = heuristic or euclidean_heuristic
    explored_sequence: List[str] = []
    nodes_explored = 0

    if start not in graph.nodes:
        peak_memory = tracemalloc.get_traced_memory()[1]
        tracemalloc.stop()
        return SearchResult(
            algorithm_name="Greedy Best-First Search",
            found=False,
            execution_time_ms=(time.perf_counter() - start_time) * 1000.0,
            memory_usage_bytes=peak_memory,
            start_node=start,
            goal_node=goal,
        )

    if start == goal:
        peak_memory = tracemalloc.get_traced_memory()[1]
        tracemalloc.stop()
        return SearchResult(
            algorithm_name="Greedy Best-First Search",
            found=True,
            path=[start],
            path_cost=0.0,
            nodes_explored=1,
            explored_sequence=[start],
            execution_time_ms=(time.perf_counter() - start_time) * 1000.0,
            memory_usage_bytes=peak_memory,
            start_node=start,
            goal_node=goal,
        )

    # Priority queue stores: (h_value, tie_breaker, current_node, path, cumulative_cost)
    counter = itertools.count()
    start_h = h_fn(start, goal, graph)
    pq: List[Tuple[float, int, str, List[str], float]] = [
        (start_h, next(counter), start, [start], 0.0)
    ]
    visited: Set[str] = set()

    found = False
    final_path: List[str] = []
    final_cost = 0.0

    while pq:
        h_val, _, current_node, path, cost = heapq.heappop(pq)

        if current_node in visited:
            continue

        visited.add(current_node)
        nodes_explored += 1
        explored_sequence.append(current_node)

        if current_node == goal:
            found = True
            final_path = path
            final_cost = cost
            break

        for neighbor, edge_cost, _ in graph.get_neighbors(current_node):
            if neighbor not in visited:
                neighbor_h = h_fn(neighbor, goal, graph)
                heapq.heappush(
                    pq,
                    (
                        neighbor_h,
                        next(counter),
                        neighbor,
                        path + [neighbor],
                        cost + edge_cost,
                    ),
                )

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    peak_memory = tracemalloc.get_traced_memory()[1]
    tracemalloc.stop()

    return SearchResult(
        algorithm_name="Greedy Best-First Search",
        found=found,
        path=final_path,
        path_cost=final_cost,
        nodes_explored=nodes_explored,
        explored_sequence=explored_sequence,
        execution_time_ms=elapsed_ms,
        memory_usage_bytes=peak_memory,
        start_node=start,
        goal_node=goal,
    )
