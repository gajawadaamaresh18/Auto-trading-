"""
Pydantic schemas for BrokerAccount model.
"""

from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import Field

from .base import BaseCreateSchema, BaseUpdateSchema, BaseResponseSchema, PaginationSchema


class BrokerAccountCreate(BaseCreateSchema):
    """Schema for creating a new broker account."""
    
    broker_type: str = Field(..., description="Broker type")
    broker_name: str = Field(..., max_length=100, description="Broker name")
    account_name: Optional[str] = Field(None, max_length=100, description="Account name")
    account_id: str = Field(..., max_length=255, description="Broker account ID")
    account_number: Optional[str] = Field(None, max_length=100, description="Account number")
    api_key: Optional[str] = Field(None, description="API key")
    api_secret: Optional[str] = Field(None, description="API secret")
    access_token: Optional[str] = Field(None, description="Access token")
    refresh_token: Optional[str] = Field(None, description="Refresh token")
    additional_credentials: Optional[str] = Field(None, description="Additional credentials (JSON)")
    is_primary: bool = Field(False, description="Whether this is the primary account")
    is_trading_enabled: bool = Field(True, description="Whether trading is enabled")
    is_paper_trading: bool = Field(False, description="Whether this is a paper trading account")
    account_type: Optional[str] = Field(None, max_length=50, description="Account type")
    currency: str = Field("USD", max_length=3, description="Account currency")
    timezone: Optional[str] = Field(None, max_length=50, description="Account timezone")
    can_trade_stocks: bool = Field(True, description="Can trade stocks")
    can_trade_options: bool = Field(False, description="Can trade options")
    can_trade_crypto: bool = Field(False, description="Can trade crypto")
    can_trade_forex: bool = Field(False, description="Can trade forex")
    can_trade_futures: bool = Field(False, description="Can trade futures")
    daily_trade_limit: Optional[Decimal] = Field(None, ge=0, description="Daily trade limit")
    max_position_size: Optional[Decimal] = Field(None, ge=0, description="Maximum position size")
    min_order_size: Optional[Decimal] = Field(None, ge=0, description="Minimum order size")
    auto_sync: bool = Field(True, description="Whether to auto-sync")
    sync_frequency: str = Field("5m", max_length=20, description="Sync frequency")
    webhook_url: Optional[str] = Field(None, max_length=500, description="Webhook URL")
    notes: Optional[str] = Field(None, description="Account notes")
    tags: Optional[str] = Field(None, description="Account tags (JSON)")


class BrokerAccountUpdate(BaseUpdateSchema):
    """Schema for updating a broker account."""
    
    broker_name: Optional[str] = Field(None, max_length=100, description="Broker name")
    account_name: Optional[str] = Field(None, max_length=100, description="Account name")
    api_key: Optional[str] = Field(None, description="API key")
    api_secret: Optional[str] = Field(None, description="API secret")
    access_token: Optional[str] = Field(None, description="Access token")
    refresh_token: Optional[str] = Field(None, description="Refresh token")
    additional_credentials: Optional[str] = Field(None, description="Additional credentials (JSON)")
    is_primary: Optional[bool] = Field(None, description="Whether this is the primary account")
    is_trading_enabled: Optional[bool] = Field(None, description="Whether trading is enabled")
    is_paper_trading: Optional[bool] = Field(None, description="Whether this is a paper trading account")
    account_type: Optional[str] = Field(None, max_length=50, description="Account type")
    currency: Optional[str] = Field(None, max_length=3, description="Account currency")
    timezone: Optional[str] = Field(None, max_length=50, description="Account timezone")
    can_trade_stocks: Optional[bool] = Field(None, description="Can trade stocks")
    can_trade_options: Optional[bool] = Field(None, description="Can trade options")
    can_trade_crypto: Optional[bool] = Field(None, description="Can trade crypto")
    can_trade_forex: Optional[bool] = Field(None, description="Can trade forex")
    can_trade_futures: Optional[bool] = Field(None, description="Can trade futures")
    daily_trade_limit: Optional[Decimal] = Field(None, ge=0, description="Daily trade limit")
    max_position_size: Optional[Decimal] = Field(None, ge=0, description="Maximum position size")
    min_order_size: Optional[Decimal] = Field(None, ge=0, description="Minimum order size")
    auto_sync: Optional[bool] = Field(None, description="Whether to auto-sync")
    sync_frequency: Optional[str] = Field(None, max_length=20, description="Sync frequency")
    webhook_url: Optional[str] = Field(None, max_length=500, description="Webhook URL")
    notes: Optional[str] = Field(None, description="Account notes")
    tags: Optional[str] = Field(None, description="Account tags (JSON)")


class BrokerAccountResponse(BaseResponseSchema):
    """Schema for broker account response."""
    
    user_id: UUID
    broker_type: str
    broker_name: str
    account_name: Optional[str]
    account_id: str
    account_number: Optional[str]
    status: str
    is_primary: bool
    is_trading_enabled: bool
    is_paper_trading: bool
    account_type: Optional[str]
    currency: str
    timezone: Optional[str]
    total_balance: Optional[Decimal]
    available_balance: Optional[Decimal]
    buying_power: Optional[Decimal]
    margin_balance: Optional[Decimal]
    can_trade_stocks: bool
    can_trade_options: bool
    can_trade_crypto: bool
    can_trade_forex: bool
    can_trade_futures: bool
    daily_trade_limit: Optional[Decimal]
    max_position_size: Optional[Decimal]
    min_order_size: Optional[Decimal]
    last_sync_at: Optional[str]
    last_error: Optional[str]
    error_count: str
    auto_sync: bool
    sync_frequency: str
    webhook_url: Optional[str]
    notes: Optional[str]
    tags: Optional[str]
    
    # Computed fields
    is_active: bool = Field(description="Whether account is active")
    is_verified: bool = Field(description="Whether account is verified")
    has_error: bool = Field(description="Whether account has errors")
    trading_capabilities: List[str] = Field(description="List of trading capabilities")
    display_name: str = Field(description="Display name for the account")


class BrokerAccountList(PaginationSchema):
    """Schema for paginated broker account list."""
    
    items: List[BrokerAccountResponse] = Field(description="List of broker accounts")


class BrokerAccountConnect(BaseCreateSchema):
    """Schema for connecting a broker account."""
    
    broker_type: str = Field(..., description="Broker type")
    credentials: dict = Field(..., description="Connection credentials")


class BrokerAccountDisconnect(BaseCreateSchema):
    """Schema for disconnecting a broker account."""
    
    reason: Optional[str] = Field(None, description="Disconnection reason")


class BrokerAccountSync(BaseCreateSchema):
    """Schema for syncing a broker account."""
    
    force: bool = Field(False, description="Force sync even if recently synced")


class BrokerAccountStats(BaseCreateSchema):
    """Schema for broker account statistics."""
    
    total_accounts: int = Field(description="Total number of accounts")
    active_accounts: int = Field(description="Number of active accounts")
    paper_accounts: int = Field(description="Number of paper trading accounts")
    live_accounts: int = Field(description="Number of live trading accounts")
    total_balance: Optional[Decimal] = Field(description="Total balance across all accounts")
    total_buying_power: Optional[Decimal] = Field(description="Total buying power")
    sync_success_rate: Optional[Decimal] = Field(description="Sync success rate")