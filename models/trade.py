"""
Trade model for trading records and execution history.
"""

import enum
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Numeric, String, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base, TimestampMixin, UUIDMixin


class TradeStatus(str, enum.Enum):
    """Trade status enumeration."""
    PENDING = "pending"
    EXECUTED = "executed"
    CANCELLED = "cancelled"
    FAILED = "failed"
    PARTIALLY_FILLED = "partially_filled"


class TradeSide(str, enum.Enum):
    """Trade side enumeration."""
    BUY = "buy"
    SELL = "sell"


class TradeType(str, enum.Enum):
    """Trade type enumeration."""
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    STOP_LIMIT = "stop_limit"


class Trade(Base, UUIDMixin, TimestampMixin):
    """
    Trade model representing individual trading records and execution history.
    
    This model tracks all trading activities executed by users based on formula signals.
    It maintains a complete audit trail of trades including execution details, performance
    metrics, and broker integration data. Trades can be manual or automated based on
    formula signals.
    """
    
    __tablename__ = "trades"
    
    # User and formula relationships
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    formula_id = Column(UUID(as_uuid=True), ForeignKey("formulas.id"), nullable=False, index=True)
    broker_account_id = Column(UUID(as_uuid=True), ForeignKey("broker_accounts.id"), nullable=True, index=True)
    
    # Trade identification
    external_trade_id = Column(String(255), nullable=True, index=True)  # Broker's trade ID
    signal_id = Column(String(255), nullable=True, index=True)  # Formula signal ID
    
    # Trade details
    symbol = Column(String(20), nullable=False, index=True)  # Trading symbol (e.g., AAPL, BTC-USD)
    side = Column(Enum(TradeSide), nullable=False, index=True)
    trade_type = Column(Enum(TradeType), nullable=False)
    
    # Quantity and pricing
    quantity = Column(Numeric(20, 8), nullable=False)  # Number of shares/units
    price = Column(Numeric(20, 8), nullable=True)  # Execution price
    limit_price = Column(Numeric(20, 8), nullable=True)  # For limit orders
    stop_price = Column(Numeric(20, 8), nullable=True)  # For stop orders
    
    # Financial details
    total_amount = Column(Numeric(20, 8), nullable=True)  # Total trade value
    commission = Column(Numeric(10, 4), nullable=True)  # Broker commission
    fees = Column(Numeric(10, 4), nullable=True)  # Additional fees
    net_amount = Column(Numeric(20, 8), nullable=True)  # Net amount after fees
    
    # Status and execution
    status = Column(Enum(TradeStatus), default=TradeStatus.PENDING, nullable=False, index=True)
    executed_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    
    # Performance tracking
    realized_pnl = Column(Numeric(20, 8), nullable=True)  # Realized profit/loss
    unrealized_pnl = Column(Numeric(20, 8), nullable=True)  # Unrealized profit/loss
    return_percentage = Column(Numeric(10, 4), nullable=True)  # Return percentage
    
    # Execution details
    execution_venue = Column(String(100), nullable=True)  # Exchange or venue
    execution_algorithm = Column(String(100), nullable=True)  # Execution algorithm used
    slippage = Column(Numeric(10, 4), nullable=True)  # Price slippage
    
    # Risk management
    stop_loss = Column(Numeric(20, 8), nullable=True)  # Stop loss price
    take_profit = Column(Numeric(20, 8), nullable=True)  # Take profit price
    position_size = Column(Numeric(20, 8), nullable=True)  # Position size
    
    # Metadata
    notes = Column(Text, nullable=True)  # User notes
    tags = Column(Text, nullable=True)  # JSON string of tags
    is_automated = Column(Boolean, default=False, nullable=False)  # Auto-executed by formula
    
    # Broker integration
    broker_order_id = Column(String(255), nullable=True)
    broker_response = Column(Text, nullable=True)  # JSON response from broker
    error_message = Column(Text, nullable=True)  # Error details if failed
    
    # Relationships
    user = relationship("User", back_populates="trades")
    formula = relationship("Formula", back_populates="trades")
    broker_account = relationship("BrokerAccount", back_populates="trades")
    
    # Indexes
    __table_args__ = (
        Index("idx_trades_user_status", "user_id", "status"),
        Index("idx_trades_formula_status", "formula_id", "status"),
        Index("idx_trades_symbol_date", "symbol", "created_at"),
        Index("idx_trades_executed_at", "executed_at"),
        Index("idx_trades_side_status", "side", "status"),
        Index("idx_trades_automated", "is_automated", "status"),
        Index("idx_trades_external_id", "external_trade_id"),
        Index("idx_trades_signal_id", "signal_id"),
    )
    
    def __repr__(self) -> str:
        return f"<Trade(id={self.id}, symbol={self.symbol}, side={self.side}, status={self.status})>"
    
    @property
    def is_executed(self) -> bool:
        """Check if trade is executed."""
        return self.status == TradeStatus.EXECUTED
    
    @property
    def is_pending(self) -> bool:
        """Check if trade is pending."""
        return self.status == TradeStatus.PENDING
    
    @property
    def is_cancelled(self) -> bool:
        """Check if trade is cancelled."""
        return self.status == TradeStatus.CANCELLED
    
    @property
    def is_failed(self) -> bool:
        """Check if trade failed."""
        return self.status == TradeStatus.FAILED
    
    @property
    def total_cost(self) -> Optional[Decimal]:
        """Calculate total cost including fees."""
        if self.total_amount is None:
            return None
        total_fees = (self.commission or 0) + (self.fees or 0)
        return self.total_amount + total_fees
    
    @property
    def net_profit(self) -> Optional[Decimal]:
        """Calculate net profit/loss."""
        if self.realized_pnl is not None:
            return self.realized_pnl
        return self.unrealized_pnl