from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "FraudSentinel API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database Connection String loaded from environment / .env
    # Defaults to local SQLite file for seamless local development, or PostgreSQL when set
    DATABASE_URL: str = "sqlite:///./fraudsentinel.db"

    # SQLAlchemy echo mode (log all SQL statements) - useful for debugging
    DB_ECHO: bool = False

    # Supabase Authentication & Token Verification Settings
    SUPABASE_URL: str = "https://your-project.supabase.co"
    SUPABASE_ANON_KEY: str = "sb_publishable_c55-iY1kKpwbocU0sogThA_Ei49FZJs"
    SUPABASE_PUBLISHABLE_KEY: str = "sb_publishable_c55-iY1kKpwbocU0sogThA_Ei49FZJs"
    SUPABASE_JWT_SECRET: str = ""
    SUPABASE_AUDIENCE: str = "authenticated"

    # JWT Authentication & RBAC Settings (Local / Test signing fallback)
    SECRET_KEY: str = "fraudsentinel_super_secret_jwt_key_2026_production_secure"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
