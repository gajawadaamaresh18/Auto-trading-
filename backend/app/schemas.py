"""
Pydantic Schemas

Data validation and serialization schemas for the Auto Trading App.
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from decimal import Decimal
from pydantic import BaseModel, Field, validator

# User Schemas
class UserBase(BaseModel):
    """Base user schema."""
    email: str = Field(..., description="User email address")
    username: str = Field(..., description="Username")
    full_name: str = Field(..., description="Full name")

class UserCreate(UserBase):
    """Schema for creating a user."""
    password: str = Field(..., min_length=8, description="User password")

class UserUpdate(BaseModel):
    """Schema for updating a user."""
    email: Optional[str] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    """Schema for user response."""
    id: UUID
    is_active: bool
    is_verified: bool
    role: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Formula Schemas
class FormulaBase(BaseModel):
    """Base formula schema."""
    name: str = Field(..., max_length=200, description="Formula name")
    description: str = Field(..., description="Formula description")
    category: str = Field(..., description="Formula category")
    tags: Optional[str] = None

class FormulaCreate(FormulaBase):
    """Schema for creating a formula."""
    formula_code: str = Field(..., description="Formula code")
    parameters: Optional[str] = None
    is_free: bool = False
    price_per_month: Optional[float] = None
    price_per_year: Optional[float] = None

class FormulaUpdate(BaseModel):
    """Schema for updating a formula."""
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    formula_code: Optional[str] = None
    parameters: Optional[str] = None
    version: Optional[str] = None
    is_free: Optional[bool] = None
    price_per_month: Optional[float] = None
    price_per_year: Optional[float] = None
    status: Optional[str] = None

class FormulaResponse(FormulaBase):
    """Schema for formula response."""
    id: UUID
    creator_id: UUID
    formula_code: str
    parameters: Optional[str]
    version: str
    is_free: bool
    price_per_month: Optional[float]
    price_per_year: Optional[float]
    status: str
    performance_score: Optional[float]
    risk_score: Optional[float]
    total_subscribers: int
    total_trades: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Subscription Schemas
class SubscriptionBase(BaseModel):
    """Base subscription schema."""
    formula_id: UUID = Field(..., description="Formula ID")
    billing_period: Optional[str] = None

class SubscriptionCreate(SubscriptionBase):
    """Schema for creating a subscription."""
    execution_mode: str = "manual"
    risk_settings: Optional[str] = None

class SubscriptionUpdate(BaseModel):
    """Schema for updating a subscription."""
    status: Optional[str] = None
    execution_mode: Optional[str] = None
    risk_settings: Optional[str] = None

class SubscriptionResponse(SubscriptionBase):
    """Schema for subscription response."""
    id: UUID
    user_id: UUID
    status: str
    subscribed_at: datetime
    expires_at: Optional[datetime]
    execution_mode: str
    risk_settings: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Trade Schemas
class TradeBase(BaseModel):
    """Base trade schema."""
    symbol: str = Field(..., description="Trading symbol")
    side: str = Field(..., description="Trade side (buy/sell)")
    quantity: int = Field(..., gt=0, description="Trade quantity")
    price: float = Field(..., gt=0, description="Trade price")
    order_type: str = Field(..., description="Order type")
    execution_mode: str = Field(..., description="Execution mode")

class TradeCreate(TradeBase):
    """Schema for creating a trade."""
    formula_id: UUID = Field(..., description="Formula ID")
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    position_size: Optional[float] = None

class TradeUpdate(BaseModel):
    """Schema for updating a trade."""
    status: Optional[str] = None
    execution_price: Optional[float] = None
    execution_time: Optional[datetime] = None
    broker_order_id: Optional[str] = None

class TradeResponse(TradeBase):
    """Schema for trade response."""
    id: UUID
    user_id: UUID
    subscription_id: UUID
    formula_id: UUID
    status: str
    stop_loss: Optional[float]
    take_profit: Optional[float]
    position_size: Optional[float]
    execution_price: Optional[float]
    execution_time: Optional[datetime]
    broker_order_id: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        
    @validator('price', 'stop_loss', 'take_profit', 'position_size', 'execution_price', pre=True)
    def convert_decimal_to_float(cls, v):
        """Convert Decimal to float for JSON serialization."""
        if isinstance(v, Decimal):
            return float(v)
        return v

# Broker Account Schemas
class BrokerAccountBase(BaseModel):
    """Base broker account schema."""
    broker_type: str = Field(..., description="Broker type")
    account_id: str = Field(..., description="Account ID")

class BrokerAccountCreate(BrokerAccountBase):
    """Schema for creating a broker account."""
    api_key: str = Field(..., description="API key")
    secret_key: str = Field(..., description="Secret key")
    passphrase: Optional[str] = None

class BrokerAccountUpdate(BaseModel):
    """Schema for updating a broker account."""
    is_active: Optional[bool] = None
    is_primary: Optional[bool] = None

class BrokerAccountResponse(BrokerAccountBase):
    """Schema for broker account response."""
    id: UUID
    user_id: UUID
    is_active: bool
    is_primary: bool
    last_sync_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Review Schemas
class ReviewBase(BaseModel):
    """Base review schema."""
    rating: int = Field(..., ge=1, le=5, description="Rating (1-5 stars)")
    title: Optional[str] = Field(None, max_length=200, description="Review title")
    content: Optional[str] = Field(None, description="Review content")

class ReviewCreate(ReviewBase):
    """Schema for creating a review."""
    formula_id: UUID = Field(..., description="Formula ID")

class ReviewUpdate(BaseModel):
    """Schema for updating a review."""
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = None
    content: Optional[str] = None

class ReviewResponse(ReviewBase):
    """Schema for review response."""
    id: UUID
    reviewer_id: UUID
    formula_id: UUID
    formula_creator_id: UUID
    is_verified_purchase: bool
    is_helpful_count: int
    is_moderated: bool
    moderation_reason: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationBase(BaseModel):
    """Base notification schema."""
    title: str = Field(..., max_length=200, description="Notification title")
    message: str = Field(..., description="Notification message")
    notification_type: str = Field(..., description="Notification type")

class NotificationCreate(NotificationBase):
    """Schema for creating a notification."""
    user_id: UUID = Field(..., description="User ID")
    extra_data: Optional[str] = None

class NotificationUpdate(BaseModel):
    """Schema for updating a notification."""
    is_read: Optional[bool] = None
    is_sent: Optional[bool] = None

class NotificationResponse(NotificationBase):
    """Schema for notification response."""
    id: UUID
    user_id: UUID
    is_read: bool
    is_sent: bool
    sent_at: Optional[datetime]
    extra_data: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Authentication Schemas
class LoginRequest(BaseModel):
    """Schema for login request."""
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")

class LoginResponse(BaseModel):
    """Schema for login response."""
    access_token: str = Field(..., description="Access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: UserResponse = Field(..., description="User information")

class Token(BaseModel):
    """Schema for token."""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Schema for token data."""
    user_id: Optional[str] = None

# Broker Connection Schemas
class BrokerConnectRequest(BaseModel):
    """Schema for broker connection request."""
    broker_type: str = Field(..., description="Broker type")
    api_key: str = Field(..., description="API key")
    secret_key: str = Field(..., description="Secret key")
    passphrase: Optional[str] = Field(None, description="Passphrase")
    account_id: str = Field(..., description="Account ID")

class BrokerConnectionResponse(BaseModel):
    """Schema for broker connection response."""
    success: bool = Field(..., description="Connection success status")
    message: str = Field(..., description="Status message")
    broker_account: Optional[BrokerAccountResponse] = None

# Trade Approval Schemas
class TradeApprovalRequest(BaseModel):
    """Schema for trade approval request."""
    approved: bool = Field(..., description="Approval status")
    quantity: Optional[int] = Field(None, description="Updated quantity")
    price: Optional[float] = Field(None, description="Updated price")
    reason: Optional[str] = Field(None, description="Rejection reason")

# Portfolio Schemas
class PortfolioStats(BaseModel):
    """Schema for portfolio statistics."""
    total_value: Optional[float] = None
    total_pnl: Optional[float] = None
    win_rate: Optional[float] = None
    avg_trade_return: Optional[float] = None

# Notification Preferences Schema
class NotificationPreferences(BaseModel):
    """Schema for notification preferences."""
    trade_notifications: bool = True
    formula_alerts: bool = True
    market_updates: bool = True
    system_alerts: bool = True
    email_notifications: bool = False
    push_notifications: bool = True

# Trade Schemas
class TradeApprovalRequest(BaseModel):
    """Schema for trade approval request."""
    adjustments: Optional[dict] = None
    notes: Optional[str] = None
    execution_mode: Optional[str] = None

class TradeApprovalResponse(BaseModel):
    """Schema for trade approval response."""
    trade_id: UUID
    status: str
    execution_queue_position: Optional[int] = None
    estimated_execution_time: Optional[datetime] = None
    message: str

class TradeExecutionRequest(BaseModel):
    """Schema for trade execution request."""
    execution_mode: str = "manual"
    notes: Optional[str] = None

class TradeExecutionResponse(BaseModel):
    """Schema for trade execution response."""
    trade_id: UUID
    status: str
    execution_price: Optional[float] = None
    execution_quantity: Optional[int] = None
    broker_order_id: Optional[str] = None
    message: str

class TradeRejectionRequest(BaseModel):
    """Schema for trade rejection request."""
    reason: str
    notes: Optional[str] = None

class TradeStatusUpdate(BaseModel):
    """Schema for trade status update."""
    status: str
    notes: Optional[str] = None
    is_broker_callback: bool = False
