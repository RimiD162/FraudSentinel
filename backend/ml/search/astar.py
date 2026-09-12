"""
A* Search Module for FraudSentinel.

Implements optimal informed graph search using evaluation function:
f(n) = g(n) + h(n)
where g(n) is the exact path cost from start to n, and h(n) is an admissible
heuristic estimating the cost from n to goal.
Guarantees finding the optimal path cost when h(n) is admissible.
Features performance benchmarking and returns standardized SearchResult.
"""

import heapq
import itertools
import time
import tracemalloc
from typing import Callable, Dict, List, Optional, Set, Tuple

from backend.ml.search.graph import FraudInvestigationGraph, SearchResult
from backend.ml.search.heuristics import HeuristicFn, euclidean_heuristic


def a_star_search(
    graph: FraudInvestigationGraph,
    start: str,
    goal: str,
    heuristic: Optional[HeuristicFn] = None,
) -> SearchResult:
    """
    Execute A* Search from start node to goal node.

    Args:
        graph: The fraud investigation graph.
        start: Starting node identifier.
        goal: Target node identifier.
        heuristic: Admissible heuristic evaluation function h(node, goal, graph).
                   Defaults to euclidean_heuristic.

    Returns:
        SearchResult containing optimal path, cost, nodes explored, latency, and memory.
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
            algorithm_name="A* Search",
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
            algorithm_name="A* Search",
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

    # Priority queue stores: (f_score, g_cost, tie_breaker, current_node, path)
    counter = itertools.count()
    start_h = h_fn(start, goal, graph)
    pq: List[Tuple[float, float, int, str, List[str]]] = [
        (start_h, 0.0, next(counter), start, [start])
    ]

    # Best known g_cost for each node
    best_g: Dict[str, float] = {start: 0.0}
    closed_set: Set[str] = set()

    found = False
    final_path: List[str] = []
    final_cost = 0.0

    while pq:
        f_score, g_cost, _, current_node, path = heapq.heappop(pq)

        if current_node in closed_set:
            continue

        closed_set.add(current_node)
        nodes_explored += 1
        explored_sequence.append(current_node)

        if current_node == goal:
            found = True
            final_path = path
            final_cost = g_cost
            break

        for neighbor, edge_cost, _ in graph.get_neighbors(current_node):
            tentative_g = g_cost + edge_cost

            if tentative_g < best_g.get(neighbor, float("inf")):
                best_g[neighbor] = tentative_g
                h_val = h_fn(neighbor, goal, graph)
                f_val = tentative_g + h_val
                heapq.heappush(
                    pq,
                    (f_val, tentative_g, next(counter), neighbor, path + [neighbor]),
                )

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    peak_memory = tracemalloc.get_traced_memory()[1]
    tracemalloc.stop()

    return SearchResult(
        algorithm_name="A* Search",
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
