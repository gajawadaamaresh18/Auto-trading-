"""
Database Models

SQLAlchemy models for the Auto Trading App.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Optional

from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey, Integer, 
    Numeric, String, Text, UniqueConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()

# Enums
class UserRole(str, Enum):
    """User role enumeration."""
    USER = "user"
    CREATOR = "creator"
    ADMIN = "admin"

class FormulaStatus(str, Enum):
    """Formula status enumeration."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    SUSPENDED = "suspended"

class SubscriptionStatus(str, Enum):
    """Subscription status enumeration."""
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    SUSPENDED = "suspended"

class TradeStatus(str, Enum):
    """Trade status enumeration."""
    PENDING = "pending"
    EXECUTED = "executed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"

class BrokerType(str, Enum):
    """Broker type enumeration."""
    # US Brokers
    ALPACA = "alpaca"
    INTERACTIVE_BROKERS = "interactive_brokers"
    ROBINHOOD = "robinhood"
    
    # Indian Brokers
    ZERODHA = "zerodha"
    ANGEL_ONE = "angel_one"
    UPSTOX = "upstox"
    SHAREKHAN = "sharekhan"
    ICICI_DIRECT = "icici_direct"
    HDFC_SECURITIES = "hdfc_securities"
    KOTAK_SECURITIES = "kotak_securities"
    MOTILAL_OSWAL = "motilal_oswal"
    RELIANCE_SECURITIES = "reliance_securities"
    SBI_SECURITIES = "sbi_securities"

class NotificationType(str, Enum):
    """Notification type enumeration."""
    TRADE_SIGNAL = "trade_signal"
    TRADE_EXECUTED = "trade_executed"
    FORMULA_UPDATE = "formula_update"
    SUBSCRIPTION_EXPIRED = "subscription_expired"
    SYSTEM_ALERT = "system_alert"

# Models
class User(Base):
    """User model representing app users."""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(200), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # User status
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    role = Column(String(20), default="user", nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    formulas_created = relationship("Formula", back_populates="creator", foreign_keys="Formula.creator_id")
    subscriptions = relationship("Subscription", back_populates="user")
    trades = relationship("Trade", back_populates="user")
    broker_accounts = relationship("BrokerAccount", back_populates="user")
    reviews_given = relationship("Review", back_populates="reviewer", foreign_keys="Review.reviewer_id")
    reviews_received = relationship("Review", back_populates="formula_creator", foreign_keys="Review.formula_creator_id")
    notifications = relationship("Notification", back_populates="user")
    
    # Indexes
    __table_args__ = (
        Index('idx_user_email', 'email'),
        Index('idx_user_username', 'username'),
        Index('idx_user_created_at', 'created_at'),
    )

class Formula(Base):
    """Formula model representing trading strategies."""
    __tablename__ = "formulas"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Basic information
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    tags = Column(String(500), nullable=True)
    
    # Formula content
    formula_code = Column(Text, nullable=False)
    parameters = Column(Text, nullable=True)
    version = Column(String(20), default="1.0.0", nullable=False)
    
    # Pricing and access
    is_free = Column(Boolean, default=False, nullable=False)
    price_per_month = Column(Numeric(10, 2), nullable=True)
    price_per_year = Column(Numeric(10, 2), nullable=True)
    
    # Status and metrics
    status = Column(String(20), default="draft", nullable=False)
    performance_score = Column(Numeric(5, 2), nullable=True)
    risk_score = Column(Numeric(5, 2), nullable=True)
    total_subscribers = Column(Integer, default=0, nullable=False)
    total_trades = Column(Integer, default=0, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    creator = relationship("User", back_populates="formulas_created", foreign_keys=[creator_id])
    subscriptions = relationship("Subscription", back_populates="formula")
    trades = relationship("Trade", back_populates="formula")
    reviews = relationship("Review", back_populates="formula")
    
    # Indexes
    __table_args__ = (
        Index('idx_formula_creator', 'creator_id'),
        Index('idx_formula_category', 'category'),
        Index('idx_formula_status', 'status'),
        Index('idx_formula_performance', 'performance_score'),
        Index('idx_formula_created_at', 'created_at'),
    )

class Subscription(Base):
    """Subscription model for user formula subscriptions."""
    __tablename__ = "subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    formula_id = Column(UUID(as_uuid=True), ForeignKey("formulas.id"), nullable=False)
    
    # Subscription details
    status = Column(String(20), default="active", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    subscribed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    billing_period = Column(String(20), nullable=True)  # monthly, yearly
    amount_paid = Column(Numeric(10, 2), nullable=True)  # Amount paid for subscription
    started_at = Column(DateTime(timezone=True), nullable=True)  # When subscription started
    
    # Execution settings
    execution_mode = Column(String(20), default="manual", nullable=False)  # auto, manual, alert_only
    paper_mode = Column(Boolean, default=True, nullable=False)  # paper trading mode
    risk_settings = Column(Text, nullable=True)  # JSON string
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="subscriptions")
    formula = relationship("Formula", back_populates="subscriptions")
    
    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'formula_id', name='unique_user_formula_subscription'),
        Index('idx_subscription_user', 'user_id'),
        Index('idx_subscription_formula', 'formula_id'),
        Index('idx_subscription_status', 'status'),
        Index('idx_subscription_expires', 'expires_at'),
    )

class Trade(Base):
    """Trade model representing executed trades."""
    __tablename__ = "trades"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    subscription_id = Column(UUID(as_uuid=True), ForeignKey("subscriptions.id"), nullable=False)
    formula_id = Column(UUID(as_uuid=True), ForeignKey("formulas.id"), nullable=False)
    
    # Trade details
    symbol = Column(String(20), nullable=False)
    side = Column(String(10), nullable=False)  # buy, sell
    quantity = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), default="pending", nullable=False)
    order_type = Column(String(20), nullable=False)  # market, limit, stop
    execution_mode = Column(String(20), nullable=False)  # auto, manual, alert_only
    
    # Risk management
    stop_loss = Column(Numeric(10, 2), nullable=True)
    take_profit = Column(Numeric(10, 2), nullable=True)
    position_size = Column(Numeric(10, 2), nullable=True)
    
    # Execution details
    execution_price = Column(Numeric(10, 2), nullable=True)
    execution_time = Column(DateTime(timezone=True), nullable=True)
    broker_order_id = Column(String(100), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="trades")
    formula = relationship("Formula", back_populates="trades")
    
    # Indexes
    __table_args__ = (
        Index('idx_trade_user', 'user_id'),
        Index('idx_trade_formula', 'formula_id'),
        Index('idx_trade_symbol', 'symbol'),
        Index('idx_trade_status', 'status'),
        Index('idx_trade_created_at', 'created_at'),
    )

class BrokerAccount(Base):
    """Broker account model for user broker connections."""
    __tablename__ = "broker_accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Broker details
    broker_type = Column(String(50), nullable=False)
    account_id = Column(String(100), nullable=False)
    encrypted_credentials = Column(Text, nullable=False)
    
    # Account status
    is_active = Column(Boolean, default=True, nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="broker_accounts")
    
    # Indexes
    __table_args__ = (
        Index('idx_broker_user', 'user_id'),
        Index('idx_broker_type', 'broker_type'),
        Index('idx_broker_active', 'is_active'),
    )

class Review(Base):
    """Review model for community feedback on formulas."""
    __tablename__ = "reviews"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reviewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    formula_id = Column(UUID(as_uuid=True), ForeignKey("formulas.id"), nullable=False)
    formula_creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Review content
    rating = Column(Integer, nullable=False)  # 1-5 stars
    title = Column(String(200), nullable=True)
    content = Column(Text, nullable=True)
    
    # Review metadata
    is_verified_purchase = Column(Boolean, default=False, nullable=False)
    is_helpful_count = Column(Integer, default=0, nullable=False)
    is_moderated = Column(Boolean, default=False, nullable=False)
    moderation_reason = Column(String(500), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    reviewer = relationship("User", back_populates="reviews_given", foreign_keys=[reviewer_id])
    formula_creator = relationship("User", back_populates="reviews_received", foreign_keys=[formula_creator_id])
    formula = relationship("Formula", back_populates="reviews")
    
    # Constraints and indexes
    __table_args__ = (
        UniqueConstraint('reviewer_id', 'formula_id', name='unique_user_formula_review'),
        Index('idx_review_formula_rating', 'formula_id', 'rating'),
        Index('idx_review_creator_rating', 'formula_creator_id', 'rating'),
        Index('idx_review_created_at', 'created_at'),
        Index('idx_review_helpful', 'is_helpful_count'),
    )

class Notification(Base):
    """Notification model for user alerts and communications."""
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Notification content
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)
    
    # Notification status
    is_read = Column(Boolean, default=False, nullable=False)
    is_sent = Column(Boolean, default=False, nullable=False)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    
    # Additional data
    extra_data = Column(Text, nullable=True)  # JSON string
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    
    # Indexes
    __table_args__ = (
        Index('idx_notification_user', 'user_id'),
        Index('idx_notification_type', 'notification_type'),
        Index('idx_notification_read', 'is_read'),
        Index('idx_notification_created_at', 'created_at'),
    )