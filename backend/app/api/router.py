from fastapi import APIRouter

from app.api.v1.alerts import router as alerts_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.forecasting import router as forecasting_router
from app.api.v1.health import router as health_router
from app.api.v1.investigations import router as investigations_router
from app.api.v1.reasoning import router as reasoning_router
from app.api.v1.transactions import router as transactions_router

api_router = APIRouter()

# Register API v1 routers
api_router.include_router(health_router, prefix="/health", tags=["Health"])
api_router.include_router(transactions_router, prefix="/transactions", tags=["Transactions"])
api_router.include_router(alerts_router, prefix="/alerts", tags=["Fraud Alerts"])
api_router.include_router(reasoning_router, prefix="/reasoning", tags=["Reasoning"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(forecasting_router, prefix="/forecasts", tags=["Forecasting"])
api_router.include_router(
    investigations_router, prefix="/investigations", tags=["Investigations & Search"]
)
