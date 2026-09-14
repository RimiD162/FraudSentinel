"""Tests for Investigation & Search API endpoints (/api/v1/investigations)."""

import pytest
from fastapi.testclient import TestClient


@pytest.mark.parametrize("algo", ["astar", "bfs", "dfs", "best_first"])
def test_investigation_search_algorithms(client: TestClient, algo: str):
    payload = {
        "start_node": "VIC_1",
        "goal_node": "HUB_ALPHA",
        "algorithm": algo,
        "heuristic": "euclidean",
    }
    response = client.post("/api/v1/investigations/search", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["found"] is True
    assert len(data["path"]) >= 2
    assert data["path"][0] == "VIC_1"
    assert data["path"][-1] == "HUB_ALPHA"
    assert data["nodes_explored"] > 0
    assert data["execution_time_ms"] >= 0


def test_investigation_search_dead_end(client: TestClient):
    payload = {
        "start_node": "DEAD_END_2",
        "goal_node": "HUB_ALPHA",
        "algorithm": "astar",
    }
    response = client.post("/api/v1/investigations/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["found"] is False
