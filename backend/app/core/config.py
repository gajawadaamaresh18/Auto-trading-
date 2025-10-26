from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/trading_system"
    TEST_DATABASE_URL: str = "postgresql://user:password@localhost/trading_system_test"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Broker APIs
    BROKER_API_URL: str = "https://api.broker.com"
    BROKER_API_KEY: str = "your-broker-api-key"
    
    # Risk Management
    MAX_RISK_PERCENTAGE: float = 0.02  # 2% of portfolio
    MAX_DAILY_TRADES: int = 100
    
    # Notifications
    EMAIL_HOST: str = "smtp.gmail.com"
    EMAIL_PORT: int = 587
    EMAIL_USERNAME: str = ""
    EMAIL_PASSWORD: str = ""
    
    # Testing
    TESTING: bool = False
    
    class Config:
        env_file = ".env"

settings = Settings()