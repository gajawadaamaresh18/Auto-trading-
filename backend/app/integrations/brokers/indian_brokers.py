"""
Indian Broker Integrations

Comprehensive broker integrations for major Indian brokers including
Zerodha, Angel One, Upstox, and other major players.
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from decimal import Decimal
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from enum import Enum

import aiohttp
import requests
from sqlalchemy.orm import Session

from app.models import BrokerAccount, Trade, BrokerType
from app.utils.encryption import encrypt_credentials, decrypt_credentials
from app.utils.validators import validate_order_data, validate_market_hours

logger = logging.getLogger(__name__)


class OrderType(str, Enum):
    """Order types supported by Indian brokers."""
    MARKET = "MARKET"
    LIMIT = "LIMIT"
    STOP_LOSS = "STOP_LOSS"
    STOP_LOSS_MARKET = "STOP_LOSS_MARKET"
    BRACKET_ORDER = "BRACKET_ORDER"
    COVER_ORDER = "COVER_ORDER"
    AFTER_MARKET_ORDER = "AFTER_MARKET_ORDER"


class ProductType(str, Enum):
    """Product types for Indian markets."""
    INTRADAY = "INTRADAY"
    DELIVERY = "DELIVERY"
    MARGIN = "MARGIN"
    BO = "BO"  # Bracket Order
    CO = "CO"  # Cover Order


class TransactionType(str, Enum):
    """Transaction types."""
    BUY = "BUY"
    SELL = "SELL"


@dataclass
class BrokerCredentials:
    """Broker credentials container."""
    api_key: str
    secret_key: str
    access_token: Optional[str] = None
    user_id: Optional[str] = None
    password: Optional[str] = None
    totp_secret: Optional[str] = None


@dataclass
class OrderRequest:
    """Order request data structure."""
    symbol: str
    quantity: int
    order_type: OrderType
    product_type: ProductType
    transaction_type: TransactionType
    price: Optional[float] = None
    trigger_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    validity: str = "DAY"
    disclosed_quantity: Optional[int] = None
    squareoff: Optional[float] = None
    trailing_stop_loss: Optional[float] = None


@dataclass
class OrderResponse:
    """Order response data structure."""
    order_id: str
    broker_order_id: str
    status: str
    message: str
    average_price: Optional[float] = None
    filled_quantity: Optional[int] = None
    pending_quantity: Optional[int] = None


class BaseIndianBroker:
    """Base class for Indian broker integrations."""
    
    def __init__(self, credentials: BrokerCredentials):
        self.credentials = credentials
        self.session = None
        self.access_token = None
        self.is_connected = False
    
    async def connect(self) -> bool:
        """Establish connection with broker."""
        raise NotImplementedError
    
    async def disconnect(self) -> bool:
        """Disconnect from broker."""
        raise NotImplementedError
    
    async def place_order(self, order_request: OrderRequest) -> OrderResponse:
        """Place an order with the broker."""
        raise NotImplementedError
    
    async def get_order_status(self, order_id: str) -> Dict[str, Any]:
        """Get order status from broker."""
        raise NotImplementedError
    
    async def cancel_order(self, order_id: str) -> bool:
        """Cancel an order."""
        raise NotImplementedError
    
    async def get_positions(self) -> List[Dict[str, Any]]:
        """Get current positions."""
        raise NotImplementedError
    
    async def get_holdings(self) -> List[Dict[str, Any]]:
        """Get holdings."""
        raise NotImplementedError
    
    async def get_margins(self) -> Dict[str, Any]:
        """Get margin information."""
        raise NotImplementedError
    
    async def get_profile(self) -> Dict[str, Any]:
        """Get user profile."""
        raise NotImplementedError


class ZerodhaBroker(BaseIndianBroker):
    """Zerodha Kite Connect integration."""
    
    BASE_URL = "https://api.kite.trade"
    LOGIN_URL = "https://kite.trade/connect/login"
    
    def __init__(self, credentials: BrokerCredentials):
        super().__init__(credentials)
        self.api_key = credentials.api_key
        self.access_token = credentials.access_token
    
    async def connect(self) -> bool:
        """Connect to Zerodha Kite."""
        try:
            if not self.access_token:
                # Generate access token using login flow
                return await self._generate_access_token()
            
            # Validate access token
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"token {self.api_key}:{self.access_token}",
                    "X-Kite-Version": "3"
                }
                
                async with session.get(f"{self.BASE_URL}/user/profile", headers=headers) as response:
                    if response.status == 200:
                        self.is_connected = True
                        return True
                    else:
                        logger.error(f"Zerodha connection failed: {response.status}")
                        return False
        
        except Exception as e:
            logger.error(f"Error connecting to Zerodha: {e}")
            return False
    
    async def _generate_access_token(self) -> bool:
        """Generate access token using login flow."""
        try:
            # This would typically involve OAuth flow
            # For now, we'll assume access token is provided
            logger.warning("Zerodha access token generation requires OAuth flow")
            return False
        except Exception as e:
            logger.error(f"Error generating Zerodha access token: {e}")
            return False
    
    async def place_order(self, order_request: OrderRequest) -> OrderResponse:
        """Place order on Zerodha."""
        try:
            if not self.is_connected:
                raise Exception("Not connected to Zerodha")
            
            order_data = {
                "variety": "regular",
                "exchange": self._get_exchange(order_request.symbol),
                "tradingsymbol": order_request.symbol,
                "transaction_type": order_request.transaction_type.value,
                "order_type": order_request.order_type.value,
                "quantity": order_request.quantity,
                "product": order_request.product_type.value,
                "validity": order_request.validity
            }
            
            if order_request.price:
                order_data["price"] = order_request.price
            
            if order_request.trigger_price:
                order_data["trigger_price"] = order_request.trigger_price
            
            if order_request.disclosed_quantity:
                order_data["disclosed_quantity"] = order_request.disclosed_quantity
            
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"token {self.api_key}:{self.access_token}",
                    "X-Kite-Version": "3",
                    "Content-Type": "application/json"
                }
                
                async with session.post(
                    f"{self.BASE_URL}/orders/regular",
                    json=order_data,
                    headers=headers
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return OrderResponse(
                            order_id=result["data"]["order_id"],
                            broker_order_id=result["data"]["order_id"],
                            status=result["data"]["status"],
                            message=result["data"]["status_message"]
                        )
                    else:
                        error_data = await response.json()
                        raise Exception(f"Order placement failed: {error_data}")
        
        except Exception as e:
            logger.error(f"Error placing Zerodha order: {e}")
            raise
    
    async def get_order_status(self, order_id: str) -> Dict[str, Any]:
        """Get order status from Zerodha."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"token {self.api_key}:{self.access_token}",
                    "X-Kite-Version": "3"
                }
                
                async with session.get(
                    f"{self.BASE_URL}/orders/{order_id}",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        raise Exception(f"Failed to get order status: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Zerodha order status: {e}")
            raise
    
    async def cancel_order(self, order_id: str) -> bool:
        """Cancel order on Zerodha."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"token {self.api_key}:{self.access_token}",
                    "X-Kite-Version": "3"
                }
                
                async with session.delete(
                    f"{self.BASE_URL}/orders/regular/{order_id}",
                    headers=headers
                ) as response:
                    return response.status == 200
        
        except Exception as e:
            logger.error(f"Error cancelling Zerodha order: {e}")
            return False
    
    async def get_positions(self) -> List[Dict[str, Any]]:
        """Get positions from Zerodha."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"token {self.api_key}:{self.access_token}",
                    "X-Kite-Version": "3"
                }
                
                async with session.get(
                    f"{self.BASE_URL}/portfolio/positions",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data["data"]["day"] + data["data"]["net"]
                    else:
                        raise Exception(f"Failed to get positions: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Zerodha positions: {e}")
            raise
    
    async def get_holdings(self) -> List[Dict[str, Any]]:
        """Get holdings from Zerodha."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"token {self.api_key}:{self.access_token}",
                    "X-Kite-Version": "3"
                }
                
                async with session.get(
                    f"{self.BASE_URL}/portfolio/holdings",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data["data"]
                    else:
                        raise Exception(f"Failed to get holdings: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Zerodha holdings: {e}")
            raise
    
    async def get_margins(self) -> Dict[str, Any]:
        """Get margin information from Zerodha."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"token {self.api_key}:{self.access_token}",
                    "X-Kite-Version": "3"
                }
                
                async with session.get(
                    f"{self.BASE_URL}/user/margins",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        raise Exception(f"Failed to get margins: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Zerodha margins: {e}")
            raise
    
    async def get_profile(self) -> Dict[str, Any]:
        """Get user profile from Zerodha."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"token {self.api_key}:{self.access_token}",
                    "X-Kite-Version": "3"
                }
                
                async with session.get(
                    f"{self.BASE_URL}/user/profile",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        raise Exception(f"Failed to get profile: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Zerodha profile: {e}")
            raise
    
    def _get_exchange(self, symbol: str) -> str:
        """Determine exchange based on symbol."""
        # Simple logic - in production, this should be more sophisticated
        if symbol.endswith('.NSE'):
            return 'NSE'
        elif symbol.endswith('.BSE'):
            return 'BSE'
        else:
            return 'NSE'  # Default to NSE
    
    async def disconnect(self) -> bool:
        """Disconnect from Zerodha."""
        self.is_connected = False
        return True


class AngelOneBroker(BaseIndianBroker):
    """Angel One SmartAPI integration."""
    
    BASE_URL = "https://apiconnect.angelbroking.com"
    LOGIN_URL = "https://smartapi.angelbroking.com"
    
    def __init__(self, credentials: BrokerCredentials):
        super().__init__(credentials)
        self.api_key = credentials.api_key
        self.client_code = credentials.user_id
        self.password = credentials.password
        self.totp_secret = credentials.totp_secret
        self.access_token = credentials.access_token
    
    async def connect(self) -> bool:
        """Connect to Angel One SmartAPI."""
        try:
            if not self.access_token:
                return await self._generate_access_token()
            
            # Validate access token
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-UserType": "USER",
                    "X-SourceID": "WEB",
                    "X-ClientLocalIP": "192.168.1.1",
                    "X-ClientPublicIP": "192.168.1.1",
                    "X-MACAddress": "00:00:00:00:00:00",
                    "X-PrivateKey": self.api_key
                }
                
                async with session.get(
                    f"{self.BASE_URL}/rest/secure/angelbroking/user/v1/getProfile",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        self.is_connected = True
                        return True
                    else:
                        logger.error(f"Angel One connection failed: {response.status}")
                        return False
        
        except Exception as e:
            logger.error(f"Error connecting to Angel One: {e}")
            return False
    
    async def _generate_access_token(self) -> bool:
        """Generate access token for Angel One."""
        try:
            # Angel One uses OAuth flow with TOTP
            # This is a simplified version - production should handle full OAuth
            logger.warning("Angel One access token generation requires OAuth flow with TOTP")
            return False
        except Exception as e:
            logger.error(f"Error generating Angel One access token: {e}")
            return False
    
    async def place_order(self, order_request: OrderRequest) -> OrderResponse:
        """Place order on Angel One."""
        try:
            if not self.is_connected:
                raise Exception("Not connected to Angel One")
            
            order_data = {
                "variety": "NORMAL",
                "tradingsymbol": order_request.symbol,
                "symboltoken": self._get_symbol_token(order_request.symbol),
                "transactiontype": order_request.transaction_type.value,
                "exchange": self._get_exchange(order_request.symbol),
                "ordertype": order_request.order_type.value,
                "producttype": order_request.product_type.value,
                "duration": order_request.validity,
                "price": order_request.price or "0",
                "squareoff": order_request.squareoff or "0",
                "stoploss": order_request.stop_loss or "0",
                "quantity": str(order_request.quantity)
            }
            
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-UserType": "USER",
                    "X-SourceID": "WEB",
                    "X-ClientLocalIP": "192.168.1.1",
                    "X-ClientPublicIP": "192.168.1.1",
                    "X-MACAddress": "00:00:00:00:00:00",
                    "X-PrivateKey": self.api_key
                }
                
                async with session.post(
                    f"{self.BASE_URL}/rest/secure/angelbroking/order/v1/placeOrder",
                    json=order_data,
                    headers=headers
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return OrderResponse(
                            order_id=result["data"]["orderid"],
                            broker_order_id=result["data"]["orderid"],
                            status=result["data"]["status"],
                            message=result["data"]["message"]
                        )
                    else:
                        error_data = await response.json()
                        raise Exception(f"Order placement failed: {error_data}")
        
        except Exception as e:
            logger.error(f"Error placing Angel One order: {e}")
            raise
    
    async def get_order_status(self, order_id: str) -> Dict[str, Any]:
        """Get order status from Angel One."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-UserType": "USER",
                    "X-SourceID": "WEB",
                    "X-ClientLocalIP": "192.168.1.1",
                    "X-ClientPublicIP": "192.168.1.1",
                    "X-MACAddress": "00:00:00:00:00:00",
                    "X-PrivateKey": self.api_key
                }
                
                async with session.get(
                    f"{self.BASE_URL}/rest/secure/angelbroking/order/v1/details/{order_id}",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        raise Exception(f"Failed to get order status: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Angel One order status: {e}")
            raise
    
    async def cancel_order(self, order_id: str) -> bool:
        """Cancel order on Angel One."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-UserType": "USER",
                    "X-SourceID": "WEB",
                    "X-ClientLocalIP": "192.168.1.1",
                    "X-ClientPublicIP": "192.168.1.1",
                    "X-MACAddress": "00:00:00:00:00:00",
                    "X-PrivateKey": self.api_key
                }
                
                async with session.post(
                    f"{self.BASE_URL}/rest/secure/angelbroking/order/v1/cancelOrder",
                    json={"variety": "NORMAL", "orderid": order_id},
                    headers=headers
                ) as response:
                    return response.status == 200
        
        except Exception as e:
            logger.error(f"Error cancelling Angel One order: {e}")
            return False
    
    async def get_positions(self) -> List[Dict[str, Any]]:
        """Get positions from Angel One."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-UserType": "USER",
                    "X-SourceID": "WEB",
                    "X-ClientLocalIP": "192.168.1.1",
                    "X-ClientPublicIP": "192.168.1.1",
                    "X-MACAddress": "00:00:00:00:00:00",
                    "X-PrivateKey": self.api_key
                }
                
                async with session.get(
                    f"{self.BASE_URL}/rest/secure/angelbroking/portfolio/v1/getPosition",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data["data"]
                    else:
                        raise Exception(f"Failed to get positions: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Angel One positions: {e}")
            raise
    
    async def get_holdings(self) -> List[Dict[str, Any]]:
        """Get holdings from Angel One."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-UserType": "USER",
                    "X-SourceID": "WEB",
                    "X-ClientLocalIP": "192.168.1.1",
                    "X-ClientPublicIP": "192.168.1.1",
                    "X-MACAddress": "00:00:00:00:00:00",
                    "X-PrivateKey": self.api_key
                }
                
                async with session.get(
                    f"{self.BASE_URL}/rest/secure/angelbroking/portfolio/v1/getHolding",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data["data"]
                    else:
                        raise Exception(f"Failed to get holdings: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Angel One holdings: {e}")
            raise
    
    async def get_margins(self) -> Dict[str, Any]:
        """Get margin information from Angel One."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-UserType": "USER",
                    "X-SourceID": "WEB",
                    "X-ClientLocalIP": "192.168.1.1",
                    "X-ClientPublicIP": "192.168.1.1",
                    "X-MACAddress": "00:00:00:00:00:00",
                    "X-PrivateKey": self.api_key
                }
                
                async with session.get(
                    f"{self.BASE_URL}/rest/secure/angelbroking/user/v1/getRMS",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        raise Exception(f"Failed to get margins: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Angel One margins: {e}")
            raise
    
    async def get_profile(self) -> Dict[str, Any]:
        """Get user profile from Angel One."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-UserType": "USER",
                    "X-SourceID": "WEB",
                    "X-ClientLocalIP": "192.168.1.1",
                    "X-ClientPublicIP": "192.168.1.1",
                    "X-MACAddress": "00:00:00:00:00:00",
                    "X-PrivateKey": self.api_key
                }
                
                async with session.get(
                    f"{self.BASE_URL}/rest/secure/angelbroking/user/v1/getProfile",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        raise Exception(f"Failed to get profile: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Angel One profile: {e}")
            raise
    
    def _get_exchange(self, symbol: str) -> str:
        """Determine exchange based on symbol."""
        if symbol.endswith('.NSE'):
            return 'NSE'
        elif symbol.endswith('.BSE'):
            return 'BSE'
        else:
            return 'NSE'
    
    def _get_symbol_token(self, symbol: str) -> str:
        """Get symbol token for Angel One."""
        # This should be fetched from Angel One's symbol master
        # For now, return a placeholder
        return "12345"
    
    async def disconnect(self) -> bool:
        """Disconnect from Angel One."""
        self.is_connected = False
        return True


class UpstoxBroker(BaseIndianBroker):
    """Upstox API integration."""
    
    BASE_URL = "https://api.upstox.com"
    LOGIN_URL = "https://api.upstox.com/index/login/authorization"
    
    def __init__(self, credentials: BrokerCredentials):
        super().__init__(credentials)
        self.api_key = credentials.api_key
        self.access_token = credentials.access_token
    
    async def connect(self) -> bool:
        """Connect to Upstox API."""
        try:
            if not self.access_token:
                return await self._generate_access_token()
            
            # Validate access token
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Accept": "application/json"
                }
                
                async with session.get(
                    f"{self.BASE_URL}/index/dashboard/profile",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        self.is_connected = True
                        return True
                    else:
                        logger.error(f"Upstox connection failed: {response.status}")
                        return False
        
        except Exception as e:
            logger.error(f"Error connecting to Upstox: {e}")
            return False
    
    async def _generate_access_token(self) -> bool:
        """Generate access token for Upstox."""
        try:
            # Upstox uses OAuth flow
            logger.warning("Upstox access token generation requires OAuth flow")
            return False
        except Exception as e:
            logger.error(f"Error generating Upstox access token: {e}")
            return False
    
    async def place_order(self, order_request: OrderRequest) -> OrderResponse:
        """Place order on Upstox."""
        try:
            if not self.is_connected:
                raise Exception("Not connected to Upstox")
            
            order_data = {
                "quantity": order_request.quantity,
                "product": order_request.product_type.value,
                "validity": order_request.validity,
                "price": order_request.price or 0,
                "tag": "string",
                "instrument_token": self._get_instrument_token(order_request.symbol),
                "order_type": order_request.order_type.value,
                "transaction_type": order_request.transaction_type.value,
                "disclosed_quantity": order_request.disclosed_quantity or 0,
                "trigger_price": order_request.trigger_price or 0,
                "is_amo": False
            }
            
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
                
                async with session.post(
                    f"{self.BASE_URL}/index/order/place",
                    json=order_data,
                    headers=headers
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        return OrderResponse(
                            order_id=result["data"]["order_id"],
                            broker_order_id=result["data"]["order_id"],
                            status=result["data"]["status"],
                            message=result["data"]["status_message"]
                        )
                    else:
                        error_data = await response.json()
                        raise Exception(f"Order placement failed: {error_data}")
        
        except Exception as e:
            logger.error(f"Error placing Upstox order: {e}")
            raise
    
    async def get_order_status(self, order_id: str) -> Dict[str, Any]:
        """Get order status from Upstox."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Accept": "application/json"
                }
                
                async with session.get(
                    f"{self.BASE_URL}/index/order/history/{order_id}",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        raise Exception(f"Failed to get order status: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Upstox order status: {e}")
            raise
    
    async def cancel_order(self, order_id: str) -> bool:
        """Cancel order on Upstox."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Accept": "application/json"
                }
                
                async with session.delete(
                    f"{self.BASE_URL}/index/order/cancel/{order_id}",
                    headers=headers
                ) as response:
                    return response.status == 200
        
        except Exception as e:
            logger.error(f"Error cancelling Upstox order: {e}")
            return False
    
    async def get_positions(self) -> List[Dict[str, Any]]:
        """Get positions from Upstox."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Accept": "application/json"
                }
                
                async with session.get(
                    f"{self.BASE_URL}/index/portfolio/positions",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data["data"]
                    else:
                        raise Exception(f"Failed to get positions: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Upstox positions: {e}")
            raise
    
    async def get_holdings(self) -> List[Dict[str, Any]]:
        """Get holdings from Upstox."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Accept": "application/json"
                }
                
                async with session.get(
                    f"{self.BASE_URL}/index/portfolio/holdings",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data["data"]
                    else:
                        raise Exception(f"Failed to get holdings: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Upstox holdings: {e}")
            raise
    
    async def get_margins(self) -> Dict[str, Any]:
        """Get margin information from Upstox."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Accept": "application/json"
                }
                
                async with session.get(
                    f"{self.BASE_URL}/index/user/margins",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        raise Exception(f"Failed to get margins: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Upstox margins: {e}")
            raise
    
    async def get_profile(self) -> Dict[str, Any]:
        """Get user profile from Upstox."""
        try:
            async with aiohttp.ClientSession() as session:
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Accept": "application/json"
                }
                
                async with session.get(
                    f"{self.BASE_URL}/index/dashboard/profile",
                    headers=headers
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        raise Exception(f"Failed to get profile: {response.status}")
        
        except Exception as e:
            logger.error(f"Error getting Upstox profile: {e}")
            raise
    
    def _get_instrument_token(self, symbol: str) -> str:
        """Get instrument token for Upstox."""
        # This should be fetched from Upstox's instrument master
        return "12345"
    
    async def disconnect(self) -> bool:
        """Disconnect from Upstox."""
        self.is_connected = False
        return True


class IndianBrokerFactory:
    """Factory for creating Indian broker instances."""
    
    @staticmethod
    def create_broker(broker_type: BrokerType, credentials: BrokerCredentials) -> BaseIndianBroker:
        """Create broker instance based on type."""
        if broker_type == BrokerType.ZERODHA:
            return ZerodhaBroker(credentials)
        elif broker_type == BrokerType.ANGEL_ONE:
            return AngelOneBroker(credentials)
        elif broker_type == BrokerType.UPSTOX:
            return UpstoxBroker(credentials)
        else:
            raise ValueError(f"Unsupported broker type: {broker_type}")


# Export classes
__all__ = [
    "BaseIndianBroker",
    "ZerodhaBroker", 
    "AngelOneBroker",
    "UpstoxBroker",
    "IndianBrokerFactory",
    "BrokerCredentials",
    "OrderRequest",
    "OrderResponse",
    "OrderType",
    "ProductType",
    "TransactionType"
]
