"""
Unit Tests for Module II Search Algorithms in FraudSentinel.

Tests Breadth-First Search (BFS), Depth-First Search (DFS), Greedy Best-First Search,
and A* Search on deterministic fraud investigation networks.
Validates path correctness, optimality, heuristic admissibility, cycle avoidance,
and edge cases.
"""

import unittest
from backend.ml.search.astar import a_star_search
from backend.ml.search.benchmark import run_comprehensive_benchmark
from backend.ml.search.best_first import best_first_search
from backend.ml.search.bfs import breadth_first_search
from backend.ml.search.dfs import depth_first_search
from backend.ml.search.graph import FraudInvestigationGraph, GraphNode, SearchResult
from backend.ml.search.heuristics import (
    euclidean_heuristic,
    manhattan_heuristic,
    risk_guided_heuristic,
    verify_admissibility_and_consistency,
    zero_heuristic,
)
# Test bridge package imports as well
import backend.search as bridge_search


class TestSearchAlgorithms(unittest.TestCase):
    """Test suite for graph search algorithms in fraud investigation."""

    def setUp(self):
        self.graph = FraudInvestigationGraph.create_benchmark_fraud_network()

    def test_graph_initialization_and_topology(self):
        """Verify the benchmark fraud graph contains expected nodes and edges."""
        self.assertGreaterEqual(len(self.graph.nodes), 30)
        self.assertTrue(self.graph.get_node("VIC_1") is not None)
        self.assertTrue(self.graph.get_node("HUB_ALPHA") is not None)

        neighbors_vic1 = self.graph.get_neighbors("VIC_1")
        self.assertGreaterEqual(len(neighbors_vic1), 3)

    def test_bfs_finds_minimum_hop_path(self):
        """BFS must find the path with minimum number of hops."""
        result = breadth_first_search(self.graph, "VIC_1", "HUB_ALPHA")
        self.assertTrue(result.found)
        self.assertEqual(result.start_node, "VIC_1")
        self.assertEqual(result.goal_node, "HUB_ALPHA")
        self.assertEqual(result.path[0], "VIC_1")
        self.assertEqual(result.path[-1], "HUB_ALPHA")

        # Minimum hop route is VIC_1 -> MULE_DIRECT -> HUB_ALPHA (2 hops)
        hops = len(result.path) - 1
        self.assertEqual(hops, 2)
        self.assertEqual(result.path_cost, 50.0)
        self.assertGreater(result.nodes_explored, 0)
        self.assertGreaterEqual(result.execution_time_ms, 0.0)

    def test_dfs_finds_valid_path_and_avoids_cycles(self):
        """DFS must find a valid path to target and terminate despite cycles in the graph."""
        result = depth_first_search(self.graph, "VIC_1", "HUB_ALPHA")
        self.assertTrue(result.found)
        self.assertEqual(result.path[0], "VIC_1")
        self.assertEqual(result.path[-1], "HUB_ALPHA")

        # Verify path connectivity
        for i in range(len(result.path) - 1):
            u, v = result.path[i], result.path[i + 1]
            edge_cost = self.graph.get_edge_cost(u, v)
            self.assertNotEqual(edge_cost, float("inf"), f"Edge ({u}, {v}) must exist in graph")

    def test_astar_finds_provably_optimal_path_cost(self):
        """
        A* Search with an admissible heuristic must find the globally optimal
        cost path, outperforming BFS/DFS in terms of edge cost.
        """
        bfs_res = breadth_first_search(self.graph, "VIC_1", "HUB_ALPHA")
        astar_res = a_star_search(self.graph, "VIC_1", "HUB_ALPHA", heuristic=euclidean_heuristic)

        self.assertTrue(astar_res.found)
        self.assertEqual(astar_res.path[0], "VIC_1")
        self.assertEqual(astar_res.path[-1], "HUB_ALPHA")

        # The optimal cost path in this network is 16.0 (Route B)
        self.assertAlmostEqual(astar_res.path_cost, 16.0, places=2)
        # Optimal cost is strictly lower than the fewest-hop BFS path (50.0)
        self.assertLess(astar_res.path_cost, bfs_res.path_cost)
        self.assertEqual(len(astar_res.path) - 1, 5)

    def test_astar_with_zero_heuristic_matches_dijkstra(self):
        """A* with h(n)=0 (Dijkstra) must also find the optimal cost of 16.0."""
        dijkstra_res = a_star_search(self.graph, "VIC_1", "HUB_ALPHA", heuristic=zero_heuristic)
        self.assertTrue(dijkstra_res.found)
        self.assertAlmostEqual(dijkstra_res.path_cost, 16.0, places=2)

    def test_greedy_best_first_search(self):
        """Greedy Best-First Search should quickly reach the goal guided by heuristic."""
        result = best_first_search(self.graph, "VIC_1", "HUB_ALPHA", heuristic=risk_guided_heuristic)
        self.assertTrue(result.found)
        self.assertEqual(result.path[0], "VIC_1")
        self.assertEqual(result.path[-1], "HUB_ALPHA")
        self.assertGreater(result.nodes_explored, 0)

    def test_heuristic_admissibility_and_consistency(self):
        """Verify euclidean_heuristic is mathematically admissible and consistent."""
        # True shortest costs to HUB_ALPHA
        true_costs = {
            "HUB_ALPHA": 0.0,
            "OFFRAMP_1": 4.0,
            "LAYER_1": 7.0,
            "MULE_1": 10.0,
            "SMURF_1": 13.0,
            "VIC_1": 16.0,
            "MULE_DIRECT": 25.0,
        }
        verification = verify_admissibility_and_consistency(
            self.graph,
            goal="HUB_ALPHA",
            heuristic=euclidean_heuristic,
            true_shortest_costs=true_costs,
        )
        self.assertTrue(verification["is_admissible"], f"Admissibility violations: {verification['admissible_violations']}")
        self.assertTrue(verification["is_consistent"], f"Consistency violations: {verification['consistency_violations']}")

    def test_search_edge_case_start_equals_goal(self):
        """When start == goal, all algorithms should immediately return single-node path with cost 0."""
        for algo_fn in [breadth_first_search, depth_first_search, best_first_search, a_star_search]:
            res = algo_fn(self.graph, "HUB_ALPHA", "HUB_ALPHA")
            self.assertTrue(res.found)
            self.assertEqual(res.path, ["HUB_ALPHA"])
            self.assertEqual(res.path_cost, 0.0)
            self.assertEqual(res.nodes_explored, 1)

    def test_search_edge_case_unreachable_node(self):
        """When target is unreachable (isolated component), all algorithms return found=False."""
        self.graph.add_node("ISOLATED_TARGET", label="Isolated Safe Vault")

        for algo_fn in [breadth_first_search, depth_first_search, best_first_search, a_star_search]:
            res = algo_fn(self.graph, "VIC_1", "ISOLATED_TARGET")
            self.assertFalse(res.found)
            self.assertEqual(res.path, [])
            self.assertEqual(res.path_cost, 0.0)

    def test_search_edge_case_invalid_start_node(self):
        """When start node does not exist in graph, return found=False gracefully."""
        res = a_star_search(self.graph, "NON_EXISTENT_SOURCE", "HUB_ALPHA")
        self.assertFalse(res.found)
        self.assertEqual(res.path, [])

    def test_bridge_package_interoperability(self):
        """Verify backend.search bridge re-exports all search functions cleanly."""
        bfs_res = bridge_search.breadth_first_search(self.graph, "VIC_3", "HUB_BETA")
        astar_res = bridge_search.a_star_search(self.graph, "VIC_3", "HUB_BETA")

        self.assertTrue(bfs_res.found)
        self.assertTrue(astar_res.found)
        self.assertEqual(bfs_res.goal_node, "HUB_BETA")
        self.assertEqual(astar_res.goal_node, "HUB_BETA")

    def test_comprehensive_benchmark_runner(self):
        """Verify benchmark runner produces structured output without errors."""
        benchmark_data = run_comprehensive_benchmark()
        self.assertIn("scenarios", benchmark_data)
        self.assertIn("results", benchmark_data)
        self.assertIn("summary_table", benchmark_data)
        self.assertGreaterEqual(len(benchmark_data["summary_table"]), 12)


if __name__ == "__main__":
    unittest.main()
