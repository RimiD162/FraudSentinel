"""Database engine setup, connection pooling, and session management."""

from __future__ import annotations

from contextlib import contextmanager
import logging
from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session

from app.core.config import settings

logger = logging.getLogger("fraudsentinel.database")


class Base(DeclarativeBase):
    """Base declarative class for all SQLAlchemy ORM models."""
    pass


def init_engine():
    """Initializes SQLAlchemy database engine with automatic fallback for local development."""
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://") or db_url.startswith("postgres://"):
        try:
            pg_engine = create_engine(
                db_url,
                pool_pre_ping=True,
                pool_size=10,
                max_overflow=20,
                echo=settings.DB_ECHO,
                connect_args={"connect_timeout": 2},
            )
            with pg_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Successfully connected to PostgreSQL at %s", db_url)
            return pg_engine
        except Exception as e:
            logger.warning(
                "PostgreSQL not accessible at %s (%s). Falling back to local SQLite database for local execution.",
                db_url,
                e,
            )
            sqlite_path = Path(__file__).resolve().parent.parent.parent / "fraudsentinel_local.db"
            sqlite_url = f"sqlite:///{sqlite_path}"
            sqlite_engine = create_engine(
                sqlite_url,
                connect_args={"check_same_thread": False},
                echo=settings.DB_ECHO,
            )

            @event.listens_for(sqlite_engine, "connect")
            def _set_sqlite_pragma(dbapi_connection, connection_record):
                cursor = dbapi_connection.cursor()
                cursor.execute("PRAGMA foreign_keys=ON")
                cursor.close()

            return sqlite_engine
    else:
        connect_args = {"check_same_thread": False} if db_url.startswith("sqlite") else {}
        return create_engine(db_url, connect_args=connect_args, echo=settings.DB_ECHO)


# Global database engine
engine = init_engine()

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# FastAPI database session dependency
def get_db() -> Generator[Session, None, None]:
    """Yield a database session for FastAPI dependency injection."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context() -> Generator[Session, None, None]:
    """Context manager for database sessions in scripts and non-FastAPI code."""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
