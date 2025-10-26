"""
Pydantic schemas for Trade model.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import Field

from .base import BaseCreateSchema, BaseUpdateSchema, BaseResponseSchema, PaginationSchema


class TradeCreate(BaseCreateSchema):
    """Schema for creating a new trade."""
    
    formula_id: UUID = Field(..., description="Formula ID")
    broker_account_id: Optional[UUID] = Field(None, description="Broker account ID")
    symbol: str = Field(..., max_length=20, description="Trading symbol")
    side: str = Field(..., description="Trade side (buy/sell)")
    trade_type: str = Field(..., description="Trade type")
    quantity: Decimal = Field(..., gt=0, description="Trade quantity")
    price: Optional[Decimal] = Field(None, gt=0, description="Execution price")
    limit_price: Optional[Decimal] = Field(None, gt=0, description="Limit price")
    stop_price: Optional[Decimal] = Field(None, gt=0, description="Stop price")
    stop_loss: Optional[Decimal] = Field(None, gt=0, description="Stop loss price")
    take_profit: Optional[Decimal] = Field(None, gt=0, description="Take profit price")
    position_size: Optional[Decimal] = Field(None, gt=0, description="Position size")
    notes: Optional[str] = Field(None, description="Trade notes")
    tags: Optional[str] = Field(None, description="Trade tags (JSON)")
    is_automated: bool = Field(False, description="Whether trade is automated")


class TradeUpdate(BaseUpdateSchema):
    """Schema for updating a trade."""
    
    status: Optional[str] = Field(None, description="Trade status")
    price: Optional[Decimal] = Field(None, gt=0, description="Execution price")
    realized_pnl: Optional[Decimal] = Field(None, description="Realized profit/loss")
    unrealized_pnl: Optional[Decimal] = Field(None, description="Unrealized profit/loss")
    return_percentage: Optional[Decimal] = Field(None, description="Return percentage")
    notes: Optional[str] = Field(None, description="Trade notes")
    tags: Optional[str] = Field(None, description="Trade tags (JSON)")
    error_message: Optional[str] = Field(None, description="Error message")


class TradeResponse(BaseResponseSchema):
    """Schema for trade response."""
    
    user_id: UUID
    formula_id: UUID
    broker_account_id: Optional[UUID]
    external_trade_id: Optional[str]
    signal_id: Optional[str]
    symbol: str
    side: str
    trade_type: str
    quantity: Decimal
    price: Optional[Decimal]
    limit_price: Optional[Decimal]
    stop_price: Optional[Decimal]
    total_amount: Optional[Decimal]
    commission: Optional[Decimal]
    fees: Optional[Decimal]
    net_amount: Optional[Decimal]
    status: str
    executed_at: Optional[datetime]
    cancelled_at: Optional[datetime]
    realized_pnl: Optional[Decimal]
    unrealized_pnl: Optional[Decimal]
    return_percentage: Optional[Decimal]
    execution_venue: Optional[str]
    execution_algorithm: Optional[str]
    slippage: Optional[Decimal]
    stop_loss: Optional[Decimal]
    take_profit: Optional[Decimal]
    position_size: Optional[Decimal]
    notes: Optional[str]
    tags: Optional[str]
    is_automated: bool
    broker_order_id: Optional[str]
    broker_response: Optional[str]
    error_message: Optional[str]
    
    # Computed fields
    is_executed: bool = Field(description="Whether trade is executed")
    is_pending: bool = Field(description="Whether trade is pending")
    is_cancelled: bool = Field(description="Whether trade is cancelled")
    is_failed: bool = Field(description="Whether trade failed")
    total_cost: Optional[Decimal] = Field(description="Total cost including fees")
    net_profit: Optional[Decimal] = Field(description="Net profit/loss")


class TradeList(PaginationSchema):
    """Schema for paginated trade list."""
    
    items: List[TradeResponse] = Field(description="List of trades")


class TradeSearch(BaseCreateSchema):
    """Schema for trade search."""
    
    symbol: Optional[str] = Field(None, description="Filter by symbol")
    side: Optional[str] = Field(None, description="Filter by side")
    status: Optional[str] = Field(None, description="Filter by status")
    trade_type: Optional[str] = Field(None, description="Filter by trade type")
    is_automated: Optional[bool] = Field(None, description="Filter by automation status")
    date_from: Optional[datetime] = Field(None, description="Filter from date")
    date_to: Optional[datetime] = Field(None, description="Filter to date")
    min_pnl: Optional[Decimal] = Field(None, description="Minimum P&L")
    max_pnl: Optional[Decimal] = Field(None, description="Maximum P&L")
    sort_by: Optional[str] = Field("created_at", description="Sort field")
    sort_order: Optional[str] = Field("desc", description="Sort order (asc/desc)")


class TradeStats(BaseCreateSchema):
    """Schema for trade statistics."""
    
    total_trades: int = Field(description="Total number of trades")
    executed_trades: int = Field(description="Number of executed trades")
    pending_trades: int = Field(description="Number of pending trades")
    cancelled_trades: int = Field(description="Number of cancelled trades")
    failed_trades: int = Field(description="Number of failed trades")
    total_volume: Optional[Decimal] = Field(description="Total trading volume")
    total_pnl: Optional[Decimal] = Field(description="Total profit/loss")
    win_rate: Optional[Decimal] = Field(description="Win rate percentage")
    avg_return: Optional[Decimal] = Field(description="Average return percentage")
    max_drawdown: Optional[Decimal] = Field(description="Maximum drawdown")
    sharpe_ratio: Optional[Decimal] = Field(description="Sharpe ratio")