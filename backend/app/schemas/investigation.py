"""Pydantic schemas for Investigation and Graph Search endpoints."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    """Payload for executing an investigation graph search."""

    start_node: str = Field(default="VIC_1", description="Source entity ID (e.g. 'VIC_1')")
    goal_node: str = Field(default="HUB_ALPHA", description="Target destination ID (e.g. 'HUB_ALPHA')")
    algorithm: str = Field(
        default="astar",
        description="Search algorithm: astar, bfs, dfs, best_first",
    )
    heuristic: str = Field(
        default="euclidean",
        description="Heuristic function: euclidean, manhattan, risk_guided, zero",
    )


class SearchResponse(BaseModel):
    """Standardized search outcome from graph search algorithms."""

    algorithm_name: str
    found: bool
    path: List[str]
    hop_count: int
    path_cost: float
    nodes_explored: int
    explored_sequence: List[str]
    execution_time_ms: float
    memory_usage_bytes: int
    start_node: str
    goal_node: str
    heuristic_used: Optional[str] = None
