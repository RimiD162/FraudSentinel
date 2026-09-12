"""
Breadth-First Search (BFS) Module for FraudSentinel.

Implements queue-based (FIFO) level-order traversal for fraud investigation.
Guarantees finding the path with minimum hop count in unweighted or uniform graphs.
Returns complete metrics: found, path, cost, nodes explored, time, and memory.
"""

from collections import deque
import time
import tracemalloc
from typing import Dict, List, Optional, Set, Tuple

from backend.ml.search.graph import FraudInvestigationGraph, SearchResult


def breadth_first_search(
    graph: FraudInvestigationGraph,
    start: str,
    goal: str,
) -> SearchResult:
    """
    Execute Breadth-First Search (BFS) from start node to goal node.

    Args:
        graph: The fraud investigation graph.
        start: Starting node identifier (e.g. Victim Account).
        goal: Target node identifier (e.g. Fraud Hub).

    Returns:
        SearchResult containing path, cost, nodes explored, latency, and memory.
    """
    tracemalloc.start()
    start_time = time.perf_counter()

    explored_sequence: List[str] = []
    nodes_explored = 0

    # Edge cases
    if start not in graph.nodes:
        peak_memory = tracemalloc.get_traced_memory()[1]
        tracemalloc.stop()
        return SearchResult(
            algorithm_name="Breadth-First Search (BFS)",
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
            algorithm_name="Breadth-First Search (BFS)",
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

    # Queue stores: (current_node, path_so_far, cumulative_cost)
    queue: deque[Tuple[str, List[str], float]] = deque([(start, [start], 0.0)])
    visited: Set[str] = {start}

    found = False
    final_path: List[str] = []
    final_cost = 0.0

    while queue:
        current_node, path, cost = queue.popleft()
        nodes_explored += 1
        explored_sequence.append(current_node)

        if current_node == goal:
            found = True
            final_path = path
            final_cost = cost
            break

        for neighbor, edge_cost, _ in graph.get_neighbors(current_node):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor], cost + edge_cost))

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    peak_memory = tracemalloc.get_traced_memory()[1]
    tracemalloc.stop()

    return SearchResult(
        algorithm_name="Breadth-First Search (BFS)",
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
