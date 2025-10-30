"""
Base Broker Interface

Abstract base class for broker integrations.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

@dataclass
class OrderRequest:
    """Order request data structure."""
    symbol: str
    side: str  # buy, sell
    quantity: int
    price: float
    order_type: str  # market, limit, stop
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None

@dataclass
class OrderResponse:
    """Order response data structure."""
    order_id: str
    status: str
    message: str
    filled_quantity: Optional[int] = None
    pending_quantity: Optional[int] = None

class BaseBroker(ABC):
    """Abstract base class for broker integrations."""
    
    def __init__(self, credentials: Dict[str, Any]):
        self.credentials = credentials
        self.is_connected = False
    
    @abstractmethod
    async def connect(self) -> bool:
        """Establish connection with broker."""
        pass
    
    @abstractmethod
    async def disconnect(self) -> bool:
        """Disconnect from broker."""
        pass
    
    @abstractmethod
    async def place_order(self, order_request: OrderRequest) -> OrderResponse:
        """Place an order with the broker."""
        pass
    
    @abstractmethod
    async def get_order_status(self, order_id: str) -> Dict[str, Any]:
        """Get order status from broker."""
        pass
    
    @abstractmethod
    async def cancel_order(self, order_id: str) -> bool:
        """Cancel an order."""
        pass
    
    @abstractmethod
    async def get_positions(self) -> List[Dict[str, Any]]:
        """Get current positions."""
        pass
    
    @abstractmethod
    async def get_holdings(self) -> List[Dict[str, Any]]:
        """Get holdings."""
        pass
    
    @abstractmethod
    async def get_margins(self) -> Dict[str, Any]:
        """Get margin information."""
        pass
    
    @abstractmethod
    async def get_profile(self) -> Dict[str, Any]:
        """Get user profile."""
        pass
