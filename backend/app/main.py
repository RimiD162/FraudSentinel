import sys
from pathlib import Path

# Ensure backend and project root are in sys.path
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_PROJECT_ROOT = _BACKEND_DIR.parent
for _p in [str(_BACKEND_DIR), str(_PROJECT_ROOT)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.schemas.health import HealthResponse, RootResponse

app = FastAPI(
    title="FraudSentinel API",
    description="Fraud Detection, Risk Analysis & Forecasting System API",
    version="1.0.0",
)

# Enable CORS for local development with frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include modular API router under /api/v1
app.include_router(api_router, prefix="/api/v1")


@app.get("/", response_model=RootResponse, tags=["System"])
def read_root():
    return {
        "message": "FraudSentinel API",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    return {
        "status": "healthy",
    }
