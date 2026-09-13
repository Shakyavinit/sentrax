import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SENTRAX"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    DEBUG: bool = False
    
    # Database
    DB_PASSWORD: str = "SentraxDB2024!"
    DATABASE_URL: str = "postgresql+asyncpg://sentrax:SentraxDB2024!@postgres:5432/sentrax"
    
    # Redis
    REDIS_URL: str = "redis://redis:6379/0"
    
    # Security & Auth
    JWT_SECRET: str = "ciphernetra-sentrax-jwt-secret-change-in-prod-2024"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480
    
    # AI Models
    YOLO_MODEL_PATH: str = "/app/models/yolov8n.pt"
    PLATE_MODEL_PATH: str = "/app/models/plate_detector.pt"
    
    # Media Storage
    MEDIA_ROOT: str = "/app/media"
    MEDIA_URL: str = "http://localhost:8000/media"
    
    # Default Admin Login
    DEFAULT_ADMIN_USERNAME: str = "admin"
    DEFAULT_ADMIN_PASSWORD: str = "SentraxAdmin2024!"
    
    # Sandbox Fallback Cameras
    SANDBOX_RTSP_URL: str = "rtsp://demo:demo@ipvmdemo.dyndns.org:554/onvif-media/media.amp"
    SANDBOX_HLS_URL: str = "https://demo.unified-streaming.com/k8s/live/scte35.isml/.m3u8"
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost",
        "http://127.0.0.1",
        "http://localhost:80",
        "http://127.0.0.1:80"
    ]

    # Forensic AI Copilot & LLMs
    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    HF_TOKEN: str = ""
    AI_PRIMARY_PROVIDER: str = "gemini"
    AI_FALLBACK_PROVIDER: str = "openai"
    OPENAI_MODEL: str = "gpt-4o"
    GROQ_MODEL: str = "qwen/qwen3.8-27b"
    GEMINI_MODEL: str = "gemini-3.6-flash"
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )


settings = Settings()
