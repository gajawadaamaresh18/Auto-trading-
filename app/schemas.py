from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# Enums
class KYCStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class NotificationType(str, Enum):
    TRADE_SIGNAL = "trade_signal"
    FORMULA_UPDATE = "formula_update"
    PORTFOLIO_ALERT = "portfolio_alert"
    BROKER_CONNECTION = "broker_connection"


# Authentication Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    kyc_status: KYCStatus
    created_at: datetime
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# KYC Schemas
class KYCDocument(BaseModel):
    document_type: str  # passport, driver_license, etc.
    file_url: str
    uploaded_at: datetime


class KYCUpload(BaseModel):
    documents: List[KYCDocument]


class KYCResponse(BaseModel):
    status: KYCStatus
    documents: List[KYCDocument]
    message: Optional[str] = None


# Broker Connection Schemas
class BrokerConnectionBase(BaseModel):
    broker_name: str
    account_id: str


class BrokerConnectionCreate(BrokerConnectionBase):
    access_token: str
    refresh_token: Optional[str] = None


class BrokerConnectionResponse(BrokerConnectionBase):
    id: int
    is_active: bool
    connected_at: datetime
    last_sync: Optional[datetime]
    
    class Config:
        from_attributes = True


# Formula Schemas
class FormulaBase(BaseModel):
    name: str
    description: Optional[str] = None
    formula_code: str
    category: Optional[str] = None
    tags: Optional[List[str]] = []


class FormulaCreate(FormulaBase):
    is_public: bool = True


class FormulaUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    formula_code: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    is_public: Optional[bool] = None


class FormulaResponse(FormulaBase):
    id: int
    author_id: Optional[int]
    is_public: bool
    is_active: bool
    performance_score: float
    total_subscribers: int
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class FormulaListResponse(BaseModel):
    formulas: List[FormulaResponse]
    total: int
    page: int
    size: int
    total_pages: int


# Formula Filters
class FormulaFilters(BaseModel):
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    min_performance_score: Optional[float] = None
    max_performance_score: Optional[float] = None
    is_public: Optional[bool] = None
    search: Optional[str] = None
    sort_by: Optional[str] = "created_at"  # created_at, performance_score, total_subscribers
    sort_order: Optional[str] = "desc"  # asc, desc
    page: int = 1
    size: int = 20


# Subscription Schemas
class SubscriptionBase(BaseModel):
    formula_id: int


class SubscriptionCreate(SubscriptionBase):
    pass


class SubscriptionResponse(SubscriptionBase):
    id: int
    user_id: int
    is_active: bool
    subscribed_at: datetime
    formula: FormulaResponse
    
    class Config:
        from_attributes = True


# Portfolio Schemas
class PortfolioBase(BaseModel):
    symbol: str
    quantity: float
    average_price: float


class PortfolioCreate(PortfolioBase):
    formula_id: Optional[int] = None


class PortfolioUpdate(BaseModel):
    current_price: Optional[float] = None
    quantity: Optional[float] = None


class PortfolioResponse(PortfolioBase):
    id: int
    user_id: int
    formula_id: Optional[int]
    current_price: Optional[float]
    total_value: Optional[float]
    unrealized_pnl: float
    realized_pnl: float
    timestamp: datetime
    
    class Config:
        from_attributes = True


class PortfolioStats(BaseModel):
    total_value: float
    total_unrealized_pnl: float
    total_realized_pnl: float
    total_return_percentage: float
    positions_count: int


class PortfolioHistory(BaseModel):
    date: datetime
    total_value: float
    unrealized_pnl: float
    realized_pnl: float


# Review Schemas
class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    formula_id: int


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None


class ReviewResponse(ReviewBase):
    id: int
    user_id: int
    formula_id: int
    created_at: datetime
    user: UserResponse
    
    class Config:
        from_attributes = True


# Notification Schemas
class NotificationBase(BaseModel):
    type: NotificationType
    title: str
    message: str
    data: Optional[Dict[str, Any]] = None


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    total: int
    page: int
    size: int
    total_pages: int


# WebSocket Schemas
class WebSocketMessage(BaseModel):
    type: str
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Error Schemas
class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None