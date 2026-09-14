from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "FraudSentinel API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # PostgreSQL Database Connection String loaded from environment / .env
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/fraudsentinel"

    # SQLAlchemy echo mode (log all SQL statements) - useful for debugging
    DB_ECHO: bool = False

    # JWT Authentication & RBAC Settings
    SECRET_KEY: str = "fraudsentinel_super_secret_jwt_key_2026_production_secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
