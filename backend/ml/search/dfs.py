"""
Depth-First Search (DFS) Module for FraudSentinel.

Implements stack-based (LIFO) deep traversal for fraud ring tracing.
Explores deep multi-hop laundering paths before backtracking.
Features cycle detection and returns standardized performance metrics.
"""

import time
import tracemalloc
from typing import Dict, List, Optional, Set, Tuple

from backend.ml.search.graph import FraudInvestigationGraph, SearchResult


def depth_first_search(
    graph: FraudInvestigationGraph,
    start: str,
    goal: str,
) -> SearchResult:
    """
    Execute Depth-First Search (DFS) from start node to goal node.

    Args:
        graph: The fraud investigation graph.
        start: Starting node identifier.
        goal: Target node identifier.

    Returns:
        SearchResult containing path, cost, nodes explored, latency, and memory.
    """
    tracemalloc.start()
    start_time = time.perf_counter()

    explored_sequence: List[str] = []
    nodes_explored = 0

    if start not in graph.nodes:
        peak_memory = tracemalloc.get_traced_memory()[1]
        tracemalloc.stop()
        return SearchResult(
            algorithm_name="Depth-First Search (DFS)",
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
            algorithm_name="Depth-First Search (DFS)",
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

    # Stack stores: (current_node, path_so_far, cumulative_cost)
    stack: List[Tuple[str, List[str], float]] = [(start, [start], 0.0)]
    visited: Set[str] = set()

    found = False
    final_path: List[str] = []
    final_cost = 0.0

    while stack:
        current_node, path, cost = stack.pop()

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

        # Reverse neighbor order so first neighbor is popped first (natural DFS order)
        neighbors = graph.get_neighbors(current_node)
        for neighbor, edge_cost, _ in reversed(neighbors):
            if neighbor not in visited:
                stack.append((neighbor, path + [neighbor], cost + edge_cost))

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    peak_memory = tracemalloc.get_traced_memory()[1]
    tracemalloc.stop()

    return SearchResult(
        algorithm_name="Depth-First Search (DFS)",
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
