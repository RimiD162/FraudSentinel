"""Investigation & Graph Search API Endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import require_analyst
from app.models.user import User
from app.schemas.investigation import SearchRequest, SearchResponse
from app.services.search_service import SearchService, get_search_service

router = APIRouter()


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
