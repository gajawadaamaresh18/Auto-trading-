"""
Encryption utilities for the Auto Trading App.
"""

import json
import base64
from typing import Dict, Any
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

def encrypt_sensitive_data(data: str) -> str:
    """Encrypt sensitive data."""
    encrypted_data = cipher_suite.encrypt(data.encode())
    return base64.b64encode(encrypted_data).decode()

def decrypt_sensitive_data(encrypted_data: str) -> str:
    """Decrypt sensitive data."""
    encrypted_bytes = base64.b64decode(encrypted_data.encode())
    decrypted_data = cipher_suite.decrypt(encrypted_bytes)
    return decrypted_data.decode()
