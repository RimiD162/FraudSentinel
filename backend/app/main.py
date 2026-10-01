import logging
import sys
from contextlib import asynccontextmanager
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
from app.core.database import Base, SessionLocal, engine
from app.models import AuditLog, Customer, Forecast, FraudAlert, Investigation, ModelPrediction, Role, Transaction, User
from app.schemas.health import HealthResponse, RootResponse

logger = logging.getLogger("fraudsentinel")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize database tables and seed baseline admin/analyst/viewer users if needed."""
    try:
        # Create tables if not present
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            from scripts.seed import seed_default_users, seed_roles
            roles = seed_roles(db)
            seed_default_users(db, roles)
            db.commit()
        except Exception as e:
            db.rollback()
            logger.warning("Startup seeding check notice: %s", e)
        finally:
            db.close()
    except Exception as err:
        logger.warning("Database startup init notice: %s", err)
    yield


app = FastAPI(
    title="FraudSentinel API",
    description="Fraud Detection, Risk Analysis & Forecasting System API",
    version="1.0.0",
    lifespan=lifespan,
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


@app.on_event("startup")
def startup_db_init():
    try:
        from app.core.database import Base, SessionLocal, engine
        from app.core.security import get_password_hash
        from app.models import Role, User

        # Auto-create tables if they don't exist
        Base.metadata.create_all(bind=engine)

        with SessionLocal() as db:
            if not db.query(Role).first():
                roles_data = [
                    {"name": "admin", "description": "Full system access — manage users, settings, all data"},
                    {"name": "analyst", "description": "Investigate fraud alerts, view analytics, run models"},
                    {"name": "viewer", "description": "Read-only access to dashboards and reports"},
                ]
                roles = {}
                for data in roles_data:
                    role = Role(**data)
                    db.add(role)
                    roles[data["name"]] = role
                db.flush()

                # Seed default users if none exist
                users_data = [
                    {"email": "admin@fraudsentinel.com", "password": "admin123", "full_name": "System Administrator", "role": roles["admin"]},
                    {"email": "analyst@fraudsentinel.com", "password": "analyst123", "full_name": "Senior Fraud Analyst", "role": roles["analyst"]},
                    {"email": "viewer@fraudsentinel.com", "password": "viewer123", "full_name": "Auditor & Compliance Viewer", "role": roles["viewer"]},
                ]
                for u in users_data:
                    user = User(
                        email=u["email"],
                        hashed_password=get_password_hash(u["password"]),
                        full_name=u["full_name"],
                        role_id=u["role"].id,
                        is_active=True,
                    )
                    db.add(user)
                db.commit()
    except Exception as e:
        print(f"[WARN] Database initialization notice: {e}")


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
