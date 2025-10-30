"""
Broker Validation Service

Service for validating broker credentials and establishing connections
with various Indian and international brokers.
"""

import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime

from app.models import BrokerType
from app.integrations.brokers.indian_brokers import (
    IndianBrokerFactory, 
    BrokerCredentials,
    ZerodhaBroker,
    AngelOneBroker, 
    UpstoxBroker
)
from app.integrations.brokers.base_broker import BaseBroker

logger = logging.getLogger(__name__)


class BrokerValidationService:
    """Service for validating broker credentials and connections."""
    
    def __init__(self):
        self.validation_cache = {}
        self.cache_ttl = 300  # 5 minutes
    
    async def validate_broker_credentials(
        self, 
        broker_type: BrokerType, 
        credentials: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Validate broker credentials.
        
        Args:
            broker_type: Type of broker
            credentials: Broker credentials dictionary
            
        Returns:
            Validation result with success status and details
        """
        try:
            # Check cache first
            cache_key = f"{broker_type.value}:{credentials.get('api_key', '')}"
            if self._is_cached_valid(cache_key):
                return {
                    "success": True,
                    "message": "Credentials validated (cached)",
                    "broker_type": broker_type.value,
                    "validated_at": datetime.utcnow().isoformat()
                }
            
            # Create broker instance
            broker_credentials = BrokerCredentials(
                api_key=credentials.get("api_key", ""),
                secret_key=credentials.get("secret_key", ""),
                access_token=credentials.get("access_token"),
                user_id=credentials.get("user_id"),
                password=credentials.get("password"),
                totp_secret=credentials.get("totp_secret")
            )
            
            # Validate based on broker type
            if broker_type in [BrokerType.ZERODHA, BrokerType.ANGEL_ONE, BrokerType.UPSTOX]:
                result = await self._validate_indian_broker(broker_type, broker_credentials)
            else:
                result = await self._validate_international_broker(broker_type, broker_credentials)
            
            # Cache successful validations
            if result["success"]:
                self._cache_validation(cache_key, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Error validating broker credentials: {e}")
            return {
                "success": False,
                "error": str(e),
                "broker_type": broker_type.value,
                "validated_at": datetime.utcnow().isoformat()
            }
    
    async def _validate_indian_broker(
        self, 
        broker_type: BrokerType, 
        credentials: BrokerCredentials
    ) -> Dict[str, Any]:
        """Validate Indian broker credentials."""
        try:
            # Create broker instance
            broker = IndianBrokerFactory.create_broker(broker_type, credentials)
            
            # Attempt connection
            is_connected = await broker.connect()
            
            if is_connected:
                # Get profile to verify credentials
                profile = await broker.get_profile()
                
                # Disconnect
                await broker.disconnect()
                
                return {
                    "success": True,
                    "message": f"Successfully connected to {broker_type.value}",
                    "broker_type": broker_type.value,
                    "profile": profile,
                    "validated_at": datetime.utcnow().isoformat()
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to connect to {broker_type.value}",
                    "broker_type": broker_type.value,
                    "validated_at": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error validating Indian broker {broker_type.value}: {e}")
            return {
                "success": False,
                "error": f"Connection failed: {str(e)}",
                "broker_type": broker_type.value,
                "validated_at": datetime.utcnow().isoformat()
            }
    
    async def _validate_international_broker(
        self, 
        broker_type: BrokerType, 
        credentials: BrokerCredentials
    ) -> Dict[str, Any]:
        """Validate international broker credentials."""
        try:
            # For now, implement basic validation for international brokers
            # In production, this should integrate with actual broker APIs
            
            if broker_type == BrokerType.ALPACA:
                return await self._validate_alpaca(credentials)
            elif broker_type == BrokerType.INTERACTIVE_BROKERS:
                return await self._validate_interactive_brokers(credentials)
            elif broker_type == BrokerType.ROBINHOOD:
                return await self._validate_robinhood(credentials)
            else:
                return {
                    "success": False,
                    "error": f"Unsupported broker type: {broker_type.value}",
                    "broker_type": broker_type.value,
                    "validated_at": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error validating international broker {broker_type.value}: {e}")
            return {
                "success": False,
                "error": f"Validation failed: {str(e)}",
                "broker_type": broker_type.value,
                "validated_at": datetime.utcnow().isoformat()
            }
    
    async def _validate_alpaca(self, credentials: BrokerCredentials) -> Dict[str, Any]:
        """Validate Alpaca credentials."""
        try:
            import aiohttp
            
            # Alpaca API validation
            headers = {
                "APCA-API-KEY-ID": credentials.api_key,
                "APCA-API-SECRET-KEY": credentials.secret_key
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    "https://paper-api.alpaca.markets/v2/account",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        account_data = await response.json()
                        return {
                            "success": True,
                            "message": "Successfully connected to Alpaca",
                            "broker_type": "alpaca",
                            "account": account_data,
                            "validated_at": datetime.utcnow().isoformat()
                        }
                    else:
                        return {
                            "success": False,
                            "error": f"Alpaca API returned status {response.status}",
                            "broker_type": "alpaca",
                            "validated_at": datetime.utcnow().isoformat()
                        }
        
        except Exception as e:
            return {
                "success": False,
                "error": f"Alpaca validation failed: {str(e)}",
                "broker_type": "alpaca",
                "validated_at": datetime.utcnow().isoformat()
            }
    
    async def _validate_interactive_brokers(self, credentials: BrokerCredentials) -> Dict[str, Any]:
        """Validate Interactive Brokers credentials."""
        try:
            # Interactive Brokers uses TWS API which requires different validation
            # For now, return a placeholder validation
            return {
                "success": True,
                "message": "Interactive Brokers validation (placeholder)",
                "broker_type": "interactive_brokers",
                "validated_at": datetime.utcnow().isoformat()
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": f"Interactive Brokers validation failed: {str(e)}",
                "broker_type": "interactive_brokers",
                "validated_at": datetime.utcnow().isoformat()
            }
    
    async def _validate_robinhood(self, credentials: BrokerCredentials) -> Dict[str, Any]:
        """Validate Robinhood credentials."""
        try:
            # Robinhood API validation
            # Note: Robinhood has restricted their API access
            return {
                "success": False,
                "error": "Robinhood API access is currently restricted",
                "broker_type": "robinhood",
                "validated_at": datetime.utcnow().isoformat()
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": f"Robinhood validation failed: {str(e)}",
                "broker_type": "robinhood",
                "validated_at": datetime.utcnow().isoformat()
            }
    
    def _is_cached_valid(self, cache_key: str) -> bool:
        """Check if validation is cached and still valid."""
        if cache_key in self.validation_cache:
            cached_time = self.validation_cache[cache_key]["timestamp"]
            if (datetime.utcnow() - cached_time).seconds < self.cache_ttl:
                return True
            else:
                # Remove expired cache entry
                del self.validation_cache[cache_key]
        return False
    
    def _cache_validation(self, cache_key: str, result: Dict[str, Any]) -> None:
        """Cache validation result."""
        self.validation_cache[cache_key] = {
            "result": result,
            "timestamp": datetime.utcnow()
        }
    
    async def test_broker_connection(
        self, 
        broker_type: BrokerType, 
        credentials: BrokerCredentials
    ) -> Dict[str, Any]:
        """
        Test broker connection with full API calls.
        
        Args:
            broker_type: Type of broker
            credentials: Broker credentials
            
        Returns:
            Connection test result
        """
        try:
            if broker_type in [BrokerType.ZERODHA, BrokerType.ANGEL_ONE, BrokerType.UPSTOX]:
                broker = IndianBrokerFactory.create_broker(broker_type, credentials)
                
                # Test connection
                is_connected = await broker.connect()
                if not is_connected:
                    return {
                        "success": False,
                        "error": "Failed to establish connection",
                        "broker_type": broker_type.value
                    }
                
                # Test API calls
                tests = []
                
                try:
                    profile = await broker.get_profile()
                    tests.append({"test": "get_profile", "success": True, "data": profile})
                except Exception as e:
                    tests.append({"test": "get_profile", "success": False, "error": str(e)})
                
                try:
                    positions = await broker.get_positions()
                    tests.append({"test": "get_positions", "success": True, "count": len(positions)})
                except Exception as e:
                    tests.append({"test": "get_positions", "success": False, "error": str(e)})
                
                try:
                    margins = await broker.get_margins()
                    tests.append({"test": "get_margins", "success": True, "data": margins})
                except Exception as e:
                    tests.append({"test": "get_margins", "success": False, "error": str(e)})
                
                # Disconnect
                await broker.disconnect()
                
                # Calculate success rate
                successful_tests = sum(1 for test in tests if test["success"])
                success_rate = successful_tests / len(tests) if tests else 0
                
                return {
                    "success": success_rate >= 0.5,  # At least 50% tests must pass
                    "broker_type": broker_type.value,
                    "success_rate": success_rate,
                    "tests": tests,
                    "tested_at": datetime.utcnow().isoformat()
                }
            
            else:
                return {
                    "success": False,
                    "error": f"Connection testing not implemented for {broker_type.value}",
                    "broker_type": broker_type.value
                }
        
        except Exception as e:
            logger.error(f"Error testing broker connection: {e}")
            return {
                "success": False,
                "error": str(e),
                "broker_type": broker_type.value,
                "tested_at": datetime.utcnow().isoformat()
            }


# Global instance
broker_validation_service = BrokerValidationService()


# Convenience function for API routes
async def validate_broker_credentials(
    broker_type: BrokerType, 
    credentials: Dict[str, Any]
) -> Dict[str, Any]:
    """Validate broker credentials."""
    return await broker_validation_service.validate_broker_credentials(
        broker_type, credentials
    )


# Export
__all__ = [
    "BrokerValidationService",
    "broker_validation_service", 
    "validate_broker_credentials"
]
