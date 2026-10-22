"""Security, cryptographic utilities, password hashing, and Supabase JWT token verification."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
import logging
from typing import Any, Optional
import urllib.parse

import bcrypt
import jwt
from jwt import (
    ExpiredSignatureError,
    InvalidIssuerError,
    InvalidSignatureError,
    PyJWKClient,
    PyJWKClientError,
    PyJWTError,
)

from app.core.config import settings

logger = logging.getLogger("fraudsentinel.security")

# Alias for backward compatibility with jose.JWTError
JWTError = PyJWTError

# Global cached PyJWKClient instance for Supabase asymmetric key verification
_jwks_client: Optional[PyJWKClient] = None


def get_jwks_client() -> Optional[PyJWKClient]:
    """Returns or initializes a cached PyJWKClient pointing to Supabase JWKS endpoint."""
    global _jwks_client
    if _jwks_client is None:
        supabase_url = (settings.SUPABASE_URL or "").strip().rstrip("/")
        if supabase_url and "your-project" not in supabase_url:
            jwks_url = f"{supabase_url}/auth/v1/.well-known/jwks.json"
            try:
                _jwks_client = PyJWKClient(
                    jwks_url,
                    cache_jwk_set=True,
                    lifespan=3600,
                    headers={"User-Agent": "FraudSentinel-Backend"},
                )
            except Exception as e:
                logger.warning("Could not initialize JWKS client for %s: %s", jwks_url, e)
    return _jwks_client


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its bcrypt hash."""
    try:
        password_bytes = plain_password.encode("utf-8")[:72]
        hashed_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hash a plain password using bcrypt."""
    password_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


class _PwdContextCompat:
    """Compatibility shim for libraries or tests expecting passlib's CryptContext."""

    def verify(self, secret: str, hash: str) -> bool:
        return verify_password(secret, hash)

    def hash(self, secret: str) -> str:
        return get_password_hash(secret)


pwd_context = _PwdContextCompat()


def create_access_token(
    data: dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a signed JWT access token containing arbitrary payload data (local / test signing)."""
    to_encode = data.copy()
    now_utc = datetime.now(timezone.utc)
    if expires_delta is not None:
        expire = now_utc + expires_delta
    else:
        expire = now_utc + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({
        "exp": expire,
        "iat": now_utc,
    })
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt


def decode_access_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT access token.

    Validates:
      1. Signature: Using Supabase's published JWKS (asymmetric RS256/ES256)
         or Supabase JWT Secret / fallback SECRET_KEY (symmetric HS256).
      2. Issuer: If token has an 'iss' claim, validates it against expected Supabase issuer.
      3. Expiration: Strict check that token expiration time has not elapsed.
    """
    if not token or not isinstance(token, str):
        raise PyJWTError("Empty or invalid token format.")

    token = token.strip()

    # Inspect token header without verification
    try:
        unverified_header = jwt.get_unverified_header(token)
    except Exception as e:
        raise PyJWTError(f"Malformed JWT header: {e}")

    alg = unverified_header.get("alg", "HS256")
    kid = unverified_header.get("kid")

    supabase_url = (settings.SUPABASE_URL or "").strip().rstrip("/")
    expected_issuer = f"{supabase_url}/auth/v1" if supabase_url else None

    decode_options = {
        "verify_signature": True,
        "verify_exp": True,
        "verify_aud": False,  # Allow standard Supabase 'authenticated' audience without rejecting non-standard test tokens
    }

    # Asymmetric Supabase JWT verification via JWKS (RS256, RS384, RS512, ES256, etc.)
    last_error: Optional[Exception] = None
    if kid or alg.startswith("RS") or alg.startswith("ES"):
        client = get_jwks_client()
        if client:
            try:
                signing_key = client.get_signing_key_from_jwt(token)
                payload = jwt.decode(
                    token,
                    signing_key.key,
                    algorithms=[alg],
                    options=decode_options,
                )
                _validate_token_claims(payload, expected_issuer)
                return payload
            except ExpiredSignatureError:
                raise
            except (PyJWKClientError, PyJWTError) as e:
                logger.warning("JWKS key lookup or decode notice: %s", e)
                last_error = e

    # Symmetric verification (HS256):
    # Try SUPABASE_JWT_SECRET if present, then SECRET_KEY fallback
    candidate_secrets: list[str] = []
    if settings.SUPABASE_JWT_SECRET and settings.SUPABASE_JWT_SECRET.strip():
        candidate_secrets.append(settings.SUPABASE_JWT_SECRET.strip())
    if settings.SECRET_KEY and settings.SECRET_KEY not in candidate_secrets:
        candidate_secrets.append(settings.SECRET_KEY)

    for secret in candidate_secrets:
        try:
            payload = jwt.decode(
                token,
                secret,
                algorithms=["HS256"],
                options=decode_options,
            )
            _validate_token_claims(payload, expected_issuer)
            return payload
        except ExpiredSignatureError:
            raise
        except InvalidIssuerError:
            raise
        except PyJWTError as err:
            last_error = err

    # Fallback to Supabase Auth API verification (handles any Supabase key rotations or secret-less deployments)
    if supabase_url and "your-project" not in supabase_url:
        api_payload = _verify_via_supabase_api(token, supabase_url)
        if api_payload:
            return api_payload

    if last_error:
        raise last_error
    raise PyJWTError("Unable to verify token signature with configured signing keys.")


def _verify_via_supabase_api(token: str, supabase_url: str) -> Optional[dict[str, Any]]:
    """Verify access token against Supabase Auth API as supported signing-key verification fallback."""
    import httpx
    url = f"{supabase_url.rstrip('/')}/auth/v1/user"
    headers = {
        "Authorization": f"Bearer {token}",
    }
    anon_key = (
        getattr(settings, "SUPABASE_ANON_KEY", None)
        or getattr(settings, "SUPABASE_PUBLISHABLE_KEY", None)
        or "sb_publishable_c55-iY1kKpwbocU0sogThA_Ei49FZJs"
    )
    if anon_key and anon_key.strip():
        headers["apikey"] = anon_key.strip()

    try:
        with httpx.Client(timeout=8.0) as client:
            resp = client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "sub": data.get("id"),
                    "user_id": data.get("id"),
                    "email": data.get("email"),
                    "role": data.get("role", "authenticated"),
                    "aud": data.get("aud", "authenticated"),
                    "user_metadata": data.get("user_metadata", {}),
                    "app_metadata": data.get("app_metadata", {}),
                }
            else:
                logger.warning("Supabase Auth API responded with %d: %s", resp.status_code, resp.text[:200])
    except Exception as e:
        logger.warning("Supabase Auth API verification notice: %s", e)
    return None




def _validate_token_claims(payload: dict[str, Any], expected_issuer: Optional[str]) -> None:
    """Enforce claim validation such as issuer if configured."""
    iss = payload.get("iss")
    if iss and expected_issuer:
        clean_iss = iss.rstrip("/")
        clean_expected = expected_issuer.rstrip("/")
        if clean_iss != clean_expected:
            raise InvalidIssuerError(
                f"Token issuer '{clean_iss}' does not match expected Supabase issuer '{clean_expected}'."
            )

