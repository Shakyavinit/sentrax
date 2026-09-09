import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PROJECT_NAME: str = "SENTRAX CCTV Intelligence Platform"
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = "sentrax_super_secret_production_key_change_in_real_deploy_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # Initial Admin Account
    INITIAL_ADMIN_EMAIL: str = "command@sentrax.gujarat.gov.in"
    INITIAL_ADMIN_PASSWORD: str = "SentinelAdmin2026!"
    INITIAL_ADMIN_BADGE: str = "GJ-HQ-001"
    INITIAL_ADMIN_NAME: str = "State Command Center"

    # Database
    POSTGRES_SERVER: str = "db"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "sentrax_admin"
    POSTGRES_PASSWORD: str = "sentrax_secure_postgis_password_2026"
    POSTGRES_DB: str = "sentrax_db"

    # Storage Paths & Resource Quotas
    DATA_DIR: str = "/app/data"
    VIDEOS_DIR: str = "/app/data/videos"
    EVIDENCE_DIR: str = "/app/data/evidence"
    TEMP_DIR: str = "/app/data/temp"

    # Hard Storage Caps (Megabytes)
    MAX_TEMP_STORAGE_MB: int = 500
    MAX_EVIDENCE_STORAGE_MB: int = 1000

    # Incremental Stream Processing Settings
    DEFAULT_STREAM_FPS: float = 5.0
    MAX_FRAME_WIDTH: int = 1280
    MAX_FRAME_HEIGHT: int = 720
    ALERT_CLIP_DURATION_SEC: int = 8

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:80",
        "http://localhost:8080",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1",
        "http://127.0.0.1:80",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:5173",
    ]

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
