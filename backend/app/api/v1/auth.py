"""Authentication API Endpoints (/api/v1/auth)."""

from __future__ import annotations

from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, log_audit_event, require_admin
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.role import Role
from app.models.user import User
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    UserCreate,
    UserListResponse,
    UserResponse,
    UserUpdate,
)

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


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register New Analyst Account",
    description="Self-service registration for Fraud Analysts.",
)
def register(
    payload: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
) -> TokenResponse:
    client_ip = request.client.host if request.client else None
    email_clean = payload.email.strip().lower()

    existing = db.query(User).filter(User.email.ilike(email_clean)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with email '{email_clean}' already exists.",
        )

    target_role_name = (payload.role or "analyst").lower().strip()
    role = db.query(Role).filter(Role.name == target_role_name).first()
    if not role:
        role = db.query(Role).filter(Role.name == "analyst").first()
    if not role:
        role = db.query(Role).first()

    raw_password = payload.password or "admin123"
    new_user = User(
        email=email_clean,
        hashed_password=get_password_hash(raw_password),
        full_name=payload.full_name.strip() if payload.full_name else email_clean.split("@")[0].title(),
        role_id=role.id if role else None,
        is_active=True,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    role_name = new_user.role.name if new_user.role else "analyst"
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token_data = {
        "sub": str(new_user.id),
        "user_id": str(new_user.id),
        "email": new_user.email,
        "role": role_name,
    }
    access_token = create_access_token(data=token_data, expires_delta=expires_delta)

    log_audit_event(
        db=db,
        action="AUTH_REGISTER_SUCCESS",
        user_id=new_user.id,
        resource_type="auth",
        details={"email": new_user.email, "role": role_name},
        ip_address=client_ip,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=str(new_user.id),
        email=new_user.email,
        full_name=new_user.full_name,
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


@router.get(
    "/users",
    response_model=UserListResponse,
    summary="List Team Users",
    description="Lists all users in the system (Admin only).",
)
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> UserListResponse:
    users = db.query(User).all()
    items = []
    for u in users:
        role_name = u.role.name if u.role else "viewer"
        items.append(
            UserResponse(
                id=u.id,
                email=u.email,
                full_name=u.full_name,
                role=role_name,
                is_active=u.is_active,
                created_at=u.created_at,
            )
        )
    return UserListResponse(total=len(items), items=items)


@router.post(
    "/users",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create or Invite User",
    description="Creates a new user profile with assigned RBAC role (Admin only).",
)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> UserResponse:
    email_clean = payload.email.strip().lower()
    existing = db.query(User).filter(User.email.ilike(email_clean)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{email_clean}' already exists.",
        )

    role = db.query(Role).filter(Role.name.ilike(payload.role.strip().lower())).first()
    if not role:
        role = db.query(Role).filter(Role.name == "analyst").first()

    new_user = User(
        email=email_clean,
        hashed_password=get_password_hash(payload.password or "Sentin3l#2026"),
        full_name=payload.full_name,
        role_id=role.id if role else None,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        role=role.name if role else "viewer",
        is_active=new_user.is_active,
        created_at=new_user.created_at,
    )


@router.patch(
    "/users/{user_id}",
    response_model=UserResponse,
    summary="Update User",
    description="Updates role, active status, or name of a user (Admin only).",
)
def update_user(
    user_id: str,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
) -> UserResponse:
    import uuid
    try:
        u_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user UUID")

    user = db.get(User, u_uuid)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.role is not None:
        role = db.query(Role).filter(Role.name.ilike(payload.role.strip().lower())).first()
        if role:
            user.role_id = role.id

    db.commit()
    db.refresh(user)

    role_name = user.role.name if user.role else "viewer"
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=role_name,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Deactivate or Remove User",
    description="Deactivates a user (Admin only).",
)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    import uuid
    try:
        u_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user UUID")

    user = db.get(User, u_uuid)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.is_active = False
    db.commit()
    return {"message": f"User {user.email} has been deactivated"}
