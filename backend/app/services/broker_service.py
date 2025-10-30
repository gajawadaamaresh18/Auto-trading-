"""
Broker Service

Service for managing broker connections and operations.
"""

from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session

from app.models import BrokerAccount, User
from app.integrations.brokers.base_broker import BaseBroker
from app.integrations.brokers.indian_brokers import ZerodhaBroker, AngelOneBroker, UpstoxBroker

class BrokerService:
    """Service for managing broker operations."""
    
    def __init__(self):
        self.broker_classes = {
            'zerodha': ZerodhaBroker,
            'angel_one': AngelOneBroker,
            'upstox': UpstoxBroker,
        }
    
    def get_broker_class(self, broker_type: str) -> Optional[type]:
        """Get broker class by type."""
        return self.broker_classes.get(broker_type)
    
    async def create_broker_instance(self, broker_type: str, credentials: Dict[str, Any]) -> Optional[BaseBroker]:
        """Create broker instance."""
        broker_class = self.get_broker_class(broker_type)
        if not broker_class:
            return None
        
        return broker_class(credentials)
    
    async def validate_broker_credentials(self, broker_type: str, credentials: Dict[str, Any]) -> Dict[str, Any]:
        """Validate broker credentials."""
        broker = await self.create_broker_instance(broker_type, credentials)
        if not broker:
            return {
                "success": False,
                "error": f"Unsupported broker type: {broker_type}"
            }
        
        try:
            is_connected = await broker.connect()
            if is_connected:
                profile = await broker.get_profile()
                await broker.disconnect()
                return {
                    "success": True,
                    "message": "Credentials validated successfully",
                    "broker_type": broker_type,
                    "profile": profile
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to connect to broker"
                }
        except Exception as e:
            return {
                "success": False,
                "error": f"Broker validation failed: {str(e)}"
            }
    
    def get_user_broker(self, db: Session, user_id: str, broker_type: str) -> Optional[BrokerAccount]:
        """Get user's broker account."""
        return db.query(BrokerAccount).filter(
            BrokerAccount.user_id == user_id,
            BrokerAccount.broker_type == broker_type,
            BrokerAccount.is_active == True
        ).first()
    
    def get_user_brokers(self, db: Session, user_id: str) -> List[BrokerAccount]:
        """Get all user's broker accounts."""
        return db.query(BrokerAccount).filter(
            BrokerAccount.user_id == user_id,
            BrokerAccount.is_active == True
        ).all()
    
    async def execute_trade(self, db: Session, user_id: str, trade_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a trade through user's broker."""
        broker_account = self.get_user_broker(db, user_id, trade_data.get('broker_type'))
        if not broker_account:
            return {
                "success": False,
                "error": "No active broker account found"
            }
        
        try:
            # Decrypt credentials
            from app.utils.encryption import decrypt_credentials
            credentials = decrypt_credentials(broker_account.encrypted_credentials)
            
            # Create broker instance
            broker = await self.create_broker_instance(broker_account.broker_type, credentials)
            if not broker:
                return {
                    "success": False,
                    "error": "Failed to create broker instance"
                }
            
            # Connect and execute trade
            await broker.connect()
            result = await broker.place_order(trade_data)
            await broker.disconnect()
            
            return {
                "success": True,
                "result": result
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Trade execution failed: {str(e)}"
            }
