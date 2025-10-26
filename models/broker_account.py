"""
BrokerAccount model for broker integrations and account management.
"""

import enum
from decimal import Decimal
from typing import Optional

from sqlalchemy import Boolean, Column, Enum, ForeignKey, Numeric, String, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base, TimestampMixin, UUIDMixin


class BrokerType(str, enum.Enum):
    """Broker type enumeration."""
    ALPACA = "alpaca"
    INTERACTIVE_BROKERS = "interactive_brokers"
    TD_AMERITRADE = "td_ameritrade"
    ETRADE = "etrade"
    ROBINHOOD = "robinhood"
    BINANCE = "binance"
    COINBASE = "coinbase"
    CUSTOM = "custom"


class AccountStatus(str, enum.Enum):
    """Account status enumeration."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"
    ERROR = "error"


class BrokerAccount(Base, UUIDMixin, TimestampMixin):
    """
    BrokerAccount model for managing broker integrations and account connections.
    
    This model handles the connection between users and their external broker accounts.
    It stores authentication credentials, account information, and trading capabilities
    for each broker integration. Supports multiple brokers and account types including
    traditional brokers and cryptocurrency exchanges.
    """
    
    __tablename__ = "broker_accounts"
    
    # User relationship
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Broker information
    broker_type = Column(Enum(BrokerType), nullable=False, index=True)
    broker_name = Column(String(100), nullable=False)
    account_name = Column(String(100), nullable=True)  # User-defined name
    
    # Account identification
    account_id = Column(String(255), nullable=False, index=True)  # Broker's account ID
    account_number = Column(String(100), nullable=True)  # Account number if different from ID
    
    # Authentication and credentials
    api_key = Column(Text, nullable=True)  # Encrypted API key
    api_secret = Column(Text, nullable=True)  # Encrypted API secret
    access_token = Column(Text, nullable=True)  # OAuth access token
    refresh_token = Column(Text, nullable=True)  # OAuth refresh token
    additional_credentials = Column(Text, nullable=True)  # JSON string for other credentials
    
    # Account status and capabilities
    status = Column(Enum(AccountStatus), default=AccountStatus.PENDING_VERIFICATION, nullable=False, index=True)
    is_primary = Column(Boolean, default=False, nullable=False)  # Primary account for user
    is_trading_enabled = Column(Boolean, default=True, nullable=False)
    is_paper_trading = Column(Boolean, default=False, nullable=False)  # Paper/sandbox account
    
    # Account details
    account_type = Column(String(50), nullable=True)  # cash, margin, crypto, etc.
    currency = Column(String(3), default="USD", nullable=False)
    timezone = Column(String(50), nullable=True)
    
    # Financial information
    total_balance = Column(Numeric(20, 8), nullable=True)
    available_balance = Column(Numeric(20, 8), nullable=True)
    buying_power = Column(Numeric(20, 8), nullable=True)
    margin_balance = Column(Numeric(20, 8), nullable=True)
    
    # Trading permissions
    can_trade_stocks = Column(Boolean, default=True, nullable=False)
    can_trade_options = Column(Boolean, default=False, nullable=False)
    can_trade_crypto = Column(Boolean, default=False, nullable=False)
    can_trade_forex = Column(Boolean, default=False, nullable=False)
    can_trade_futures = Column(Boolean, default=False, nullable=False)
    
    # Rate limits and constraints
    daily_trade_limit = Column(Numeric(20, 8), nullable=True)
    max_position_size = Column(Numeric(20, 8), nullable=True)
    min_order_size = Column(Numeric(20, 8), nullable=True)
    
    # Connection and sync information
    last_sync_at = Column(String(50), nullable=True)  # Last successful sync
    last_error = Column(Text, nullable=True)  # Last error message
    error_count = Column(String(10), default="0", nullable=False)  # Consecutive error count
    
    # Configuration
    auto_sync = Column(Boolean, default=True, nullable=False)
    sync_frequency = Column(String(20), default="5m", nullable=False)  # Sync frequency
    webhook_url = Column(String(500), nullable=True)  # Webhook for real-time updates
    
    # Metadata
    notes = Column(Text, nullable=True)  # User notes
    tags = Column(Text, nullable=True)  # JSON string of tags
    
    # Relationships
    user = relationship("User", back_populates="broker_accounts")
    trades = relationship("Trade", back_populates="broker_account", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index("idx_broker_accounts_user_status", "user_id", "status"),
        Index("idx_broker_accounts_broker_type", "broker_type", "status"),
        Index("idx_broker_accounts_primary", "user_id", "is_primary"),
        Index("idx_broker_accounts_trading_enabled", "is_trading_enabled", "status"),
        Index("idx_broker_accounts_account_id", "account_id", "broker_type"),
        Index("idx_broker_accounts_paper_trading", "is_paper_trading", "status"),
    )
    
    def __repr__(self) -> str:
        return f"<BrokerAccount(id={self.id}, broker_type={self.broker_type}, account_id={self.account_id})>"
    
    @property
    def is_active(self) -> bool:
        """Check if account is active."""
        return self.status == AccountStatus.ACTIVE
    
    @property
    def is_verified(self) -> bool:
        """Check if account is verified."""
        return self.status == AccountStatus.ACTIVE
    
    @property
    def has_error(self) -> bool:
        """Check if account has errors."""
        return self.status == AccountStatus.ERROR or self.last_error is not None
    
    @property
    def trading_capabilities(self) -> list:
        """Get list of trading capabilities."""
        capabilities = []
        if self.can_trade_stocks:
            capabilities.append("stocks")
        if self.can_trade_options:
            capabilities.append("options")
        if self.can_trade_crypto:
            capabilities.append("crypto")
        if self.can_trade_forex:
            capabilities.append("forex")
        if self.can_trade_futures:
            capabilities.append("futures")
        return capabilities
    
    @property
    def display_name(self) -> str:
        """Get display name for the account."""
        if self.account_name:
            return f"{self.broker_name} - {self.account_name}"
        return f"{self.broker_name} - {self.account_id}"