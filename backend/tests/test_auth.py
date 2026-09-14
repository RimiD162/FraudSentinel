"""Unit and integration tests for Authentication API endpoints (/api/v1/auth)."""

from datetime import timedelta
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_password_hash
from app.models.audit_log import AuditLog
from app.models.role import Role
from app.models.user import User


def test_login_valid_credentials(client: TestClient, admin_user: User):
    """Test successful authentication with valid credentials."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "admin123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["email"] == "admin@test.com"
    assert data["role"] == "admin"
    assert data["user_id"] == str(admin_user.id)
    assert data["full_name"] == "Admin User"
    assert data["expires_in"] > 0


def test_login_invalid_password(client: TestClient, admin_user: User, db_session: Session):
    """Test login rejection when an incorrect password is provided."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

    # Verify audit log entry was created for login failure
    audit = (
        db_session.query(AuditLog)
        .filter(AuditLog.action == "AUTH_LOGIN_FAILURE")
        .first()
    )
    assert audit is not None


def test_login_nonexistent_user(client: TestClient):
    """Test login rejection for unknown email address."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "ghost@nonexistent.com", "password": "anypassword"},
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_login_inactive_user(client: TestClient, db_session: Session, sample_role: Role):
    """Test login rejection when user account is deactivated."""
    inactive_user = User(
        id=uuid.uuid4(),
        email="inactive@test.com",
        hashed_password=get_password_hash("password123"),
        full_name="Deactivated Analyst",
        role_id=sample_role.id,
        is_active=False,
    )
    db_session.add(inactive_user)
    db_session.commit()

    response = client.post(
        "/api/v1/auth/login",
        json={"email": "inactive@test.com", "password": "password123"},
    )
    assert response.status_code == 401
    assert "deactivated" in response.json()["detail"].lower()


def test_get_me_valid_token(client: TestClient, analyst_user: User, analyst_headers: dict[str, str]):
    """Test retrieving current authenticated user profile via /auth/me."""
    response = client.get("/api/v1/auth/me", headers=analyst_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(analyst_user.id)
    assert data["email"] == analyst_user.email
    assert data["full_name"] == analyst_user.full_name
    assert data["role"] == "analyst"
    assert data["is_active"] is True


def test_get_me_unauthorized_missing_token(client: TestClient):
    """Test /auth/me rejection when Authorization header is absent."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
    assert "Authentication required" in response.json()["detail"]


def test_get_me_expired_token(client: TestClient, analyst_user: User):
    """Test /auth/me rejection when access token has expired."""
    expired_token = create_access_token(
        data={"sub": str(analyst_user.id), "user_id": str(analyst_user.id), "email": analyst_user.email, "role": "analyst"},
        expires_delta=timedelta(seconds=-10),  # expired 10s ago
    )
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert response.status_code == 401
    assert "expired" in response.json()["detail"].lower()


def test_get_me_invalid_signature_token(client: TestClient):
    """Test /auth/me rejection when token has invalid signature or format."""
    tampered_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMifQ.invalid_signature_xxx"
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {tampered_token}"})
    assert response.status_code == 401
    assert "Invalid or malformed" in response.json()["detail"]


def test_audit_log_created_on_login_success(client: TestClient, db_session: Session, admin_user: User):
    """Test that AUTH_LOGIN_SUCCESS audit event is logged in PostgreSQL database."""
    client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "admin123"},
    )
    audit = (
        db_session.query(AuditLog)
        .filter(AuditLog.action == "AUTH_LOGIN_SUCCESS")
        .filter(AuditLog.user_id == admin_user.id)
        .first()
    )
    assert audit is not None
    assert "admin@test.com" in audit.details
