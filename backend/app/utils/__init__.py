"""
Utility Functions

Common utility functions for the Auto Trading App.
"""

import json
import base64
from typing import Dict, Any, Optional
from cryptography.fernet import Fernet
import os

# Encryption key - in production, use environment variable
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key())
cipher_suite = Fernet(ENCRYPTION_KEY)

def encrypt_credentials(credentials: Dict[str, Any]) -> str:
    """Encrypt broker credentials."""
    credentials_json = json.dumps(credentials)
    encrypted_data = cipher_suite.encrypt(credentials_json.encode())
    return base64.b64encode(encrypted_data).decode()

def decrypt_credentials(encrypted_credentials: str) -> Dict[str, Any]:
    """Decrypt broker credentials."""
    encrypted_data = base64.b64decode(encrypted_credentials.encode())
    decrypted_data = cipher_suite.decrypt(encrypted_data)
    return json.loads(decrypted_data.decode())

def validate_order_data(order_data: Dict[str, Any]) -> bool:
    """Validate order data."""
    required_fields = ['symbol', 'side', 'quantity', 'price']
    return all(field in order_data for field in required_fields)

def validate_market_hours() -> bool:
    """Validate if market is open."""
    # Simple implementation - in production, check actual market hours
    return True

def calculate_technical_indicators(data: list, indicators: list) -> Dict[str, float]:
    """Calculate technical indicators."""
    # Simple implementation - in production, use proper technical analysis library
    result = {}
    for indicator in indicators:
        if indicator == 'sma_20':
            result['sma_20'] = sum(data[-20:]) / 20 if len(data) >= 20 else 0
        elif indicator == 'rsi_14':
            result['rsi_14'] = 50.0  # Placeholder
        elif indicator == 'macd':
            result['macd'] = 0.0  # Placeholder
    return result
