from fastapi import APIRouter

from app.api.v1.health import router as health_router

api_router = APIRouter()

# Register API v1 routers
api_router.include_router(health_router, prefix="/health", tags=["Health"])
