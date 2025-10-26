#!/usr/bin/env python3
"""
Startup script for the Trading Formula Platform API
"""

import uvicorn
from app.main import app

if __name__ == "__main__":
    print("🚀 Starting Trading Formula Platform API...")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("📖 ReDoc Documentation: http://localhost:8000/redoc")
    print("🔌 WebSocket: ws://localhost:8000/notifications/ws/{user_id}")
    print("=" * 60)
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )