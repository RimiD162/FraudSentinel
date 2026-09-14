"""FastAPI Authentication and Role-Based Access Control (RBAC) dependencies."""

from __future__ import annotations

import json
import uuid
from typing import Any, Callable, Optional, Sequence
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import ExpiredSignatureError, JWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.audit_log import AuditLog
from app.models.user import User

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
    """Dependency to extract, decode, and validate JWT Bearer token and return active User model."""
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
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or malformed access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id_str: Optional[str] = payload.get("user_id") or payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload is missing user identification.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_uuid = UUID(user_id_str)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID format in token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.get(User, user_uuid)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account associated with token does not exist.",
            headers={"WWW-Authenticate": "Bearer"},
        )

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
    """RBAC Dependency Factory: Enforces that the current authenticated user possesses one of allowed_roles."""
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
