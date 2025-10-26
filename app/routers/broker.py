from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import httpx
from cryptography.fernet import Fernet
import base64
from app.database import get_db
from app.models import User, BrokerConnection
from app.schemas import (
    BrokerConnectionCreate, BrokerConnectionResponse, 
    BrokerConnectionBase
)
from app.auth import get_current_active_user
from app.config import settings

router = APIRouter(prefix="/broker", tags=["broker connections"])

# Simple encryption for storing broker tokens
def get_encryption_key():
    """Get or generate encryption key for broker tokens."""
    key = settings.secret_key.encode()[:32].ljust(32, b'0')
    return base64.urlsafe_b64encode(key)


def encrypt_token(token: str) -> str:
    """Encrypt broker token for storage."""
    f = Fernet(get_encryption_key())
    return f.encrypt(token.encode()).decode()


def decrypt_token(encrypted_token: str) -> str:
    """Decrypt broker token for use."""
    f = Fernet(get_encryption_key())
    return f.decrypt(encrypted_token.encode()).decode()


async def validate_broker_connection(broker_name: str, access_token: str) -> bool:
    """
    Validate broker connection by making a test API call.
    
    This would typically call the broker's API to verify the token is valid.
    """
    try:
        async with httpx.AsyncClient() as client:
            # This is a placeholder - actual implementation would depend on broker API
            response = await client.get(
                f"{settings.broker_api_base_url}/account/info",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10.0
            )
            return response.status_code == 200
    except Exception:
        return False


@router.post("/connect", response_model=BrokerConnectionResponse, status_code=status.HTTP_201_CREATED)
async def connect_broker(
    connection_data: BrokerConnectionCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Connect a broker account to the user's profile.
    
    Validates broker credentials and stores encrypted connection details.
    Only one active connection per broker per user is allowed.
    """
    # Check if user already has an active connection to this broker
    existing_connection = db.query(BrokerConnection).filter(
        BrokerConnection.user_id == current_user.id,
        BrokerConnection.broker_name == connection_data.broker_name,
        BrokerConnection.is_active == True
    ).first()
    
    if existing_connection:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Active connection to {connection_data.broker_name} already exists"
        )
    
    # Validate broker connection
    is_valid = await validate_broker_connection(
        connection_data.broker_name, 
        connection_data.access_token
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid broker credentials or connection failed"
        )
    
    # Create new broker connection
    db_connection = BrokerConnection(
        user_id=current_user.id,
        broker_name=connection_data.broker_name,
        account_id=connection_data.account_id,
        access_token=encrypt_token(connection_data.access_token),
        refresh_token=encrypt_token(connection_data.refresh_token) if connection_data.refresh_token else None,
        is_active=True
    )
    
    db.add(db_connection)
    db.commit()
    db.refresh(db_connection)
    
    return db_connection


@router.get("/connections", response_model=List[BrokerConnectionResponse])
async def get_broker_connections(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get all broker connections for the current user.
    
    Returns list of all connected broker accounts with their status.
    """
    connections = db.query(BrokerConnection).filter(
        BrokerConnection.user_id == current_user.id
    ).all()
    
    return connections


@router.get("/connections/{connection_id}", response_model=BrokerConnectionResponse)
async def get_broker_connection(
    connection_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get specific broker connection details.
    
    Returns details for a specific broker connection owned by the current user.
    """
    connection = db.query(BrokerConnection).filter(
        BrokerConnection.id == connection_id,
        BrokerConnection.user_id == current_user.id
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Broker connection not found"
        )
    
    return connection


@router.put("/connections/{connection_id}/disconnect", status_code=status.HTTP_200_OK)
async def disconnect_broker(
    connection_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Disconnect a broker account.
    
    Deactivates the broker connection, preventing further trading operations.
    Connection data is preserved for historical purposes.
    """
    connection = db.query(BrokerConnection).filter(
        BrokerConnection.id == connection_id,
        BrokerConnection.user_id == current_user.id
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Broker connection not found"
        )
    
    if not connection.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Broker connection is already inactive"
        )
    
    connection.is_active = False
    db.commit()
    
    return {"message": f"Successfully disconnected from {connection.broker_name}"}


@router.delete("/connections/{connection_id}", status_code=status.HTTP_200_OK)
async def delete_broker_connection(
    connection_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Permanently delete a broker connection.
    
    Completely removes the broker connection and all associated data.
    This action cannot be undone.
    """
    connection = db.query(BrokerConnection).filter(
        BrokerConnection.id == connection_id,
        BrokerConnection.user_id == current_user.id
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Broker connection not found"
        )
    
    db.delete(connection)
    db.commit()
    
    return {"message": f"Successfully deleted connection to {connection.broker_name}"}


@router.post("/connections/{connection_id}/sync", status_code=status.HTTP_200_OK)
async def sync_broker_data(
    connection_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Sync data from broker account.
    
    Fetches latest account data, positions, and transactions from the broker.
    Updates local portfolio data with current broker information.
    """
    connection = db.query(BrokerConnection).filter(
        BrokerConnection.id == connection_id,
        BrokerConnection.user_id == current_user.id,
        BrokerConnection.is_active == True
    ).first()
    
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active broker connection not found"
        )
    
    try:
        # Decrypt access token
        access_token = decrypt_token(connection.access_token)
        
        # Sync data from broker (placeholder implementation)
        async with httpx.AsyncClient() as client:
            # This would typically fetch positions, transactions, etc.
            response = await client.get(
                f"{settings.broker_api_base_url}/account/positions",
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=30.0
            )
            
            if response.status_code == 200:
                # Update last sync timestamp
                from datetime import datetime
                connection.last_sync = datetime.utcnow()
                db.commit()
                
                return {"message": "Broker data synced successfully"}
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to sync data from broker"
                )
                
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sync failed: {str(e)}"
        )