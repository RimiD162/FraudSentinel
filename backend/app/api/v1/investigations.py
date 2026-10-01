"""Investigation & Graph Search API Endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import require_analyst, require_viewer
from app.models.user import User
from app.schemas.investigation import SearchRequest, SearchResponse
from app.services.search_service import SearchService, get_search_service

router = APIRouter()


@router.get(
    "/nodes",
    summary="Get Investigation Graph Nodes",
    description="Returns available nodes, categories, and positions in the benchmark fraud network.",
)
def get_graph_nodes(
    current_user: User = Depends(require_viewer),
    service: SearchService = Depends(get_search_service),
):
    nodes_info = []
    for node_id, node in service.graph.nodes.items():
        x_val, y_val = node.coordinates if hasattr(node, "coordinates") and node.coordinates else (0.0, 0.0)
        nodes_info.append({
            "id": node_id,
            "label": node.label,
            "node_type": getattr(node, "node_type", "Entity"),
            "risk_score": getattr(node, "risk_score", 0.0),
            "x": x_val,
            "y": y_val,
        })
    return {
        "total_nodes": len(nodes_info),
        "nodes": nodes_info,
        "default_sources": ["VIC_1", "VIC_2", "VIC_3"],
        "default_goals": ["HUB_ALPHA", "HUB_BETA", "OFFRAMP_1"],
    }


@router.post(
    "/search",
    response_model=SearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute Graph Search on Fraud Network",
    description=(
        "Performs heuristic or uninformed graph search (A*, BFS, DFS, Greedy Best-First) "
        "across the multi-tier banking fraud investigation network to trace fund flows to syndicate hubs."
    ),
)
def search_investigation_graph(
    payload: SearchRequest,
    current_user: User = Depends(require_analyst),
    service: SearchService = Depends(get_search_service),
) -> SearchResponse:
    try:
        return service.search(payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Graph search failed: {str(e)}",
        )
