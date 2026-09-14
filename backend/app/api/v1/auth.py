"""Authentication API Endpoints (/api/v1/auth)."""

from __future__ import annotations

from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, log_audit_event
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse

router = APIRouter()


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate User & Generate JWT",
    description="Authenticates user against PostgreSQL database, validates password hash, and returns signed JWT access token.",
)
def login(
    payload: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> TokenResponse:
    client_ip = request.client.host if request.client else None
    email_clean = payload.email.strip().lower()

    # 1. Look up user by email
    user = db.query(User).filter(User.email.ilike(email_clean)).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        log_audit_event(
            db=db,
            action="AUTH_LOGIN_FAILURE",
            user_id=user.id if user else None,
            resource_type="auth",
            details={"attempted_email": email_clean},
            ip_address=client_ip,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Check active status
    if not user.is_active:
        log_audit_event(
            db=db,
            action="AUTH_LOGIN_INACTIVE_BLOCKED",
            user_id=user.id,
            resource_type="auth",
            details={"email": user.email},
            ip_address=client_ip,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated. Please contact administrator.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Generate JWT Access Token
    role_name = user.role.name if user.role else "viewer"
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "sub": str(user.id),
        "user_id": str(user.id),
        "email": user.email,
        "role": role_name,
    }
    access_token = create_access_token(data=token_data, expires_delta=expires_delta)

    # 4. Log successful authentication in audit_logs
    log_audit_event(
        db=db,
        action="AUTH_LOGIN_SUCCESS",
        user_id=user.id,
        resource_type="auth",
        details={"email": user.email, "role": role_name},
        ip_address=client_ip,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        role=role_name,
    )


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Current User Profile",
    description="Returns the profile details and RBAC role of the currently authenticated user.",
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    role_name = current_user.role.name if current_user.role else "viewer"
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=role_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )
