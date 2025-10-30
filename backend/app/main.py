"""
FastAPI Application Entry Point

Main application file for the Auto Trading App backend.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import logging

from app.api.v1.routes import router as api_router
from app.core.database import engine, Base
from app.services.error_monitoring_service import error_monitoring_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Auto Trading App API",
    description="Mobile-first, broker-agnostic, formula-driven stock trading marketplace",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure appropriately for production
)

# Initialize error monitoring
error_monitoring_service.initialize()

# Create database tables
Base.metadata.create_all(bind=engine)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Global exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions."""
    error_id = error_monitoring_service.log_error(
        error=exc,
        severity="medium",
        category="api",
        context={
            "status_code": exc.status_code,
            "detail": exc.detail,
            "url": str(request.url),
            "method": request.method,
        }
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "error_id": error_id,
            "status_code": exc.status_code,
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions."""
    # Temporarily disable error monitoring to see actual error
    # error_id = error_monitoring_service.log_error(
    #     error=exc,
    #     severity="high",
    #     category="system",
    #     context={
    #         "url": str(request.url),
    #         "method": request.method,
    #     }
    # )
    
    # For debugging, include the actual error message
    return JSONResponse(
        status_code=500,
        content={
            "error": f"Internal server error: {str(exc)}",
            "error_id": "debug",
            "status_code": 500,
        }
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Auto Trading App API is running"}

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Auto Trading App API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
