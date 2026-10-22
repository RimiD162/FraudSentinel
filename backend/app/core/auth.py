"""FastAPI Authentication and Role-Based Access Control (RBAC) dependencies with Supabase JWT support."""

from __future__ import annotations

import json
import logging
from typing import Any, Callable, Optional, Sequence
import uuid
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import ExpiredSignatureError, PyJWTError

from app.core.database import get_db
from app.core.security import JWTError, decode_access_token, get_password_hash
from app.models.audit_log import AuditLog
from app.models.role import Role
from app.models.user import User

logger = logging.getLogger("fraudsentinel.auth")

# HTTP Bearer security scheme (auto_error=False allows custom structured 401 exceptions)
bearer_scheme = HTTPBearer(auto_error=False)


def log_audit_event(
    db: Session,
    action: str,
    user_id: Optional[UUID] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    details: Optional[dict[str, Any] | str] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Helper to record security, authentication, and authorization events into audit_logs."""
    details_str = (
        json.dumps(details) if isinstance(details, dict) else (str(details) if details else None)
    )
    audit_entry = AuditLog(
        id=uuid.uuid4(),
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details_str,
        ip_address=ip_address,
    )
    db.add(audit_entry)
    try:
        db.commit()
    except Exception:
        db.rollback()
    return audit_entry


def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Dependency to extract, decode, and validate Supabase/JWT Bearer token and return active User model.
    
    Roles and status are strictly resolved from server-side database records.
    """
    client_ip = request.client.host if request.client else None

    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Bearer access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (JWTError, PyJWTError) as e:
        logger.warning("Token verification failure detail: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or malformed access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str: Optional[str] = payload.get("user_id") or payload.get("sub")
    email: Optional[str] = payload.get("email")

    if not user_id_str and not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing user identification.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 1. Primary lookup by UUID
    user: Optional[User] = None
    user_uuid: Optional[UUID] = None
    if user_id_str:
        try:
            user_uuid = UUID(user_id_str)
            user = db.get(User, user_uuid)
        except (ValueError, TypeError):
            pass

    # 2. Secondary lookup by email in SQLite database
    if not user and email:
        user = db.query(User).filter(User.email.ilike(email.strip())).first()

    # 3. If user is authenticated via Supabase but has not been recorded in local SQLite yet:
    # Auto-provision user record with trusted server-side default role (analyst / viewer)
    if not user:
        clean_email = email.strip().lower() if email else f"{user_id_str}@supabase.user"
        # Server-enforced role: only predefined bootstrap emails can receive admin
        default_role_name = "admin" if clean_email in ["admin@fraudsentinel.com"] else "analyst"
        role = db.query(Role).filter(Role.name == default_role_name).first()
        if not role:
            role = db.query(Role).first()

        metadata = payload.get("user_metadata") or {}
        full_name = (
            metadata.get("full_name")
            or metadata.get("name")
            or (clean_email.split("@")[0].title() if "@" in clean_email else "User")
        )

        user = User(
            id=user_uuid if user_uuid else uuid.uuid4(),
            email=clean_email,
            hashed_password=get_password_hash(uuid.uuid4().hex),
            full_name=full_name,
            role_id=role.id if role else None,
            is_active=True,
        )
        db.add(user)
        try:
            db.commit()
            db.refresh(user)
        except Exception:
            db.rollback()
            user = db.query(User).filter(User.email.ilike(clean_email)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account associated with token does not exist.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 4. Check active status in trusted server-side data
    if not user.is_active:
        log_audit_event(
            db=db,
            action="AUTH_INACTIVE_USER_BLOCKED",
            user_id=user.id,
            resource_type="auth",
            details={"email": user.email},
            ip_address=client_ip,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def require_roles(allowed_roles: Sequence[str]) -> Callable[..., User]:
    """RBAC Dependency Factory: Enforces that the current authenticated user possesses one of allowed_roles in server-side DB."""
    normalized_allowed = [r.lower().strip() for r in allowed_roles]

    def role_checker(
        request: Request,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        user_role_name = current_user.role.name.lower().strip() if current_user.role else ""
        if user_role_name not in normalized_allowed:
            client_ip = request.client.host if request.client else None
            # Record security violation in audit_logs
            log_audit_event(
                db=db,
                action="RBAC_ACCESS_DENIED",
                user_id=current_user.id,
                resource_type=request.url.path,
                details={
                    "user_role": user_role_name,
                    "required_roles": list(allowed_roles),
                    "method": request.method,
                    "endpoint": str(request.url),
                },
                ip_address=client_ip,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Forbidden: Insufficient role permissions. User has '{user_role_name}', "
                    f"requires one of: {list(allowed_roles)}."
                ),
            )
        return current_user

    return role_checker


# Predefined RBAC dependencies
require_admin = require_roles(["admin"])
require_analyst = require_roles(["admin", "analyst"])
require_viewer = require_roles(["admin", "analyst", "viewer"])
