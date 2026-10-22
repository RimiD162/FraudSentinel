"""Integration and unit tests for Supabase Authentication and RBAC token verification."""

from datetime import datetime, timedelta, timezone
import uuid
import pytest
from fastapi.testclient import TestClient
import jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.models.role import Role
from app.models.user import User


def _create_mock_supabase_token(
    user_id: str,
    email: str,
    role_claim: str = "viewer",
    expires_delta: timedelta = timedelta(hours=1),
    issuer: str | None = None,
    secret: str | None = None,
) -> str:
    """Helper to generate a mock Supabase JWT token."""
    now = datetime.now(timezone.utc)
    iss = issuer or f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1"
    key = secret or settings.SECRET_KEY
    payload = {
        "sub": str(user_id),
        "user_id": str(user_id),
        "email": email,
        "role": role_claim,  # Untrusted client claim in token
        "iss": iss,
        "aud": "authenticated",
        "exp": int((now + expires_delta).timestamp()),
        "iat": int(now.timestamp()),
        "user_metadata": {"full_name": "Test User"},
    }
    return jwt.encode(payload, key, algorithm="HS256")


def test_supabase_valid_token_authenticated(
    client: TestClient,
    db_session: Session,
    sample_admin_role: Role,
):
    """Test that a valid Supabase token is verified and returns trusted server-side profile."""
    user_id = uuid.uuid4()
    user = User(
        id=user_id,
        email="supabase_admin@fraudsentinel.com",
        hashed_password=get_password_hash("placeholder"),
        full_name="Supabase Admin User",
        role_id=sample_admin_role.id,
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    token = _create_mock_supabase_token(
        user_id=str(user_id),
        email="supabase_admin@fraudsentinel.com",
    )
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(user_id)
    assert data["email"] == "supabase_admin@fraudsentinel.com"
    assert data["role"] == "admin"
    assert data["is_active"] is True


def test_supabase_expired_token_rejected(client: TestClient):
    """Test that expired Supabase token returns 401 Unauthorized with expired notice."""
    token = _create_mock_supabase_token(
        user_id=str(uuid.uuid4()),
        email="expired@test.com",
        expires_delta=timedelta(seconds=-120),  # expired 2 minutes ago
    )
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert "expired" in response.json()["detail"].lower()


def test_supabase_invalid_signature_rejected(client: TestClient):
    """Test that tampered token signature is rejected with 401 Unauthorized."""
    token = _create_mock_supabase_token(
        user_id=str(uuid.uuid4()),
        email="tampered@test.com",
        secret="different_untrusted_signing_secret_xxx",
    )
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert "Invalid or malformed" in response.json()["detail"]


def test_supabase_mismatched_issuer_rejected(client: TestClient):
    """Test that token from untrusted issuer is rejected."""
    token = _create_mock_supabase_token(
        user_id=str(uuid.uuid4()),
        email="attacker@fake-supabase.co",
        issuer="https://attacker-fake.supabase.co/auth/v1",
    )
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert "Invalid or malformed" in response.json()["detail"]


def test_server_side_role_cannot_be_overridden_by_token(
    client: TestClient,
    db_session: Session,
    sample_viewer_role: Role,
):
    """Security test: Ensure token claim 'role: admin' cannot elevate privileges for a viewer in SQLite DB."""
    user_id = uuid.uuid4()
    viewer_user = User(
        id=user_id,
        email="viewer_attempting_privilege_escalation@test.com",
        hashed_password=get_password_hash("secret123"),
        full_name="Viewer Account",
        role_id=sample_viewer_role.id,  # Database role is viewer!
        is_active=True,
    )
    db_session.add(viewer_user)
    db_session.commit()

    # Attacker crafts token claiming role='admin'
    escalation_token = _create_mock_supabase_token(
        user_id=str(user_id),
        email="viewer_attempting_privilege_escalation@test.com",
        role_claim="admin",
    )

    # 1. /api/v1/auth/me must return trusted DB role 'viewer'
    me_resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {escalation_token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["role"] == "viewer"

    # 2. Admin-only user management must be 403 Forbidden
    users_resp = client.get("/api/v1/auth/users", headers={"Authorization": f"Bearer {escalation_token}"})
    assert users_resp.status_code == 403
    assert "Forbidden" in users_resp.json()["detail"]

    # 3. Analyst-required transaction prediction must be 403 Forbidden
    analyze_resp = client.post(
        "/api/v1/transactions/analyze",
        json={
            "id": "T_FORBIDDEN_TEST",
            "customer_id": "C_TEST",
            "amount": 50.00,
            "transaction_type": "payment",
            "transaction_time": "2025-01-01T10:00:00Z",
            "location": "NY",
            "device_type": "web",
            "previous_transactions_count": 1,
        },
        headers={"Authorization": f"Bearer {escalation_token}"},
    )
    assert analyze_resp.status_code == 403
    assert "Forbidden" in analyze_resp.json()["detail"]


def test_supabase_deactivated_user_blocked(
    client: TestClient,
    db_session: Session,
    sample_admin_role: Role,
):
    """Test that deactivated users (is_active=False) in DB are rejected even with valid token."""
    user_id = uuid.uuid4()
    inactive_user = User(
        id=user_id,
        email="deactivated_admin@test.com",
        hashed_password=get_password_hash("pass"),
        full_name="Deactivated Admin",
        role_id=sample_admin_role.id,
        is_active=False,  # Deactivated in SQLite DB!
    )
    db_session.add(inactive_user)
    db_session.commit()

    token = _create_mock_supabase_token(
        user_id=str(user_id),
        email="deactivated_admin@test.com",
    )
    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 401
    assert "deactivated" in response.json()["detail"].lower()
