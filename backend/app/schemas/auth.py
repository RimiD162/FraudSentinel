"""Pydantic schemas for Authentication and RBAC."""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    """User login request payload."""

    email: str = Field(..., description="User account email address", json_schema_extra={"example": "admin@fraudsentinel.com"})
    password: str = Field(..., min_length=1, description="Plaintext password", json_schema_extra={"example": "admin123"})


class TokenResponse(BaseModel):
    """JWT Token response returned upon successful authentication."""

    access_token: str = Field(..., description="Signed JWT Bearer access token")
    token_type: str = Field("bearer", description="Token type")
    expires_in: int = Field(..., description="Lifetime of token in seconds")
    user_id: str = Field(..., description="Unique user UUID string")
    email: str = Field(..., description="Authenticated user email")
    full_name: str = Field(..., description="User full name")
    role: str = Field(..., description="Assigned RBAC role name (admin, analyst, viewer)")


class UserResponse(BaseModel):
    """User profile response model."""

    id: UUID = Field(..., description="Unique user UUID")
    email: str = Field(..., description="User email address")
    full_name: str = Field(..., description="User full name")
    role: str = Field(..., description="Assigned role name (e.g. admin, analyst, viewer)")
    is_active: bool = Field(..., description="Whether user account is active")
    created_at: datetime = Field(..., description="Timestamp of account creation")


class TokenPayload(BaseModel):
    """Decoded JWT access token payload."""

    sub: Optional[str] = None
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None
    iat: Optional[int] = None
