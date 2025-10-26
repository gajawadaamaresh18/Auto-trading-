from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://user:password@localhost/trading_app"
    
    # JWT
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Redis
    redis_url: str = "redis://localhost:6379"
    
    # AWS S3 for file uploads
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "us-east-1"
    s3_bucket: str = "trading-app-kyc"
    
    # Broker API
    broker_api_base_url: str = "https://api.broker.com"
    broker_api_key: Optional[str] = None
    
    class Config:
        env_file = ".env"


settings = Settings()