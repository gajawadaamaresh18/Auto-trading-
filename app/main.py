from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
from app.database import engine
from app.models import Base
from app.routers import (
    auth, broker, formulas, subscriptions, 
    portfolio, reviews, notifications
)
from app.config import settings

# Create database tables
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    pass

# Create FastAPI app
app = FastAPI(
    title="Trading Formula Platform API",
    description="""
    A comprehensive trading formula platform API with the following features:
    
    ## Authentication & User Management
    - User registration and login with JWT tokens
    - KYC document upload and verification
    - User profile management
    
    ## Broker Integration
    - Connect and disconnect broker accounts
    - Sync portfolio data from brokers
    - Secure token storage and management
    
    ## Formula Management
    - Create, read, update, and delete trading formulas
    - Advanced filtering, searching, and pagination
    - Formula categories and tags
    - Performance scoring and analytics
    
    ## Subscription System
    - Subscribe/unsubscribe to formulas
    - Access control for private formulas
    - Subscription management and statistics
    
    ## Portfolio Management
    - Track current positions and portfolio value
    - Historical portfolio data and analytics
    - Real-time P&L calculations
    - Formula-based position tracking
    
    ## Review & Rating System
    - Rate and review formulas
    - Community feedback and ratings
    - Review statistics and analytics
    
    ## Real-time Notifications
    - WebSocket support for real-time updates
    - Trading signal notifications
    - Formula update alerts
    - Portfolio alerts and notifications
    """,
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(broker.router)
app.include_router(formulas.router)
app.include_router(subscriptions.router)
app.include_router(portfolio.router)
app.include_router(reviews.router)
app.include_router(notifications.router)

# Global exception handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error_code": getattr(exc, 'error_code', None)}
    )

# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint providing API information.
    
    Returns basic information about the API and available endpoints.
    """
    return {
        "message": "Trading Formula Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "authentication": "/auth",
            "broker_connections": "/broker",
            "formulas": "/formulas",
            "subscriptions": "/subscriptions",
            "portfolio": "/portfolio",
            "reviews": "/reviews",
            "notifications": "/notifications",
            "websocket": "/notifications/ws/{user_id}"
        }
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    
    Returns the current status of the API and its dependencies.
    """
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )