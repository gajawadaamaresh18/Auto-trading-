"""
Formula model for trading formulas created by users.
"""

import enum
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, Numeric, String, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base, TimestampMixin, UUIDMixin


class FormulaStatus(str, enum.Enum):
    """Formula status enumeration."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    SUSPENDED = "suspended"


class FormulaCategory(str, enum.Enum):
    """Formula category enumeration."""
    TECHNICAL_ANALYSIS = "technical_analysis"
    FUNDAMENTAL_ANALYSIS = "fundamental_analysis"
    QUANTITATIVE = "quantitative"
    MOMENTUM = "momentum"
    MEAN_REVERSION = "mean_reversion"
    ARBITRAGE = "arbitrage"
    OTHER = "other"


class Formula(Base, UUIDMixin, TimestampMixin):
    """
    Formula model representing trading formulas created by users.
    
    Formulas are algorithmic trading strategies that users can create, publish,
    and monetize. They contain the logic, parameters, and metadata needed to
    execute automated trading decisions. Users can subscribe to formulas and
    execute trades based on their signals.
    """
    
    __tablename__ = "formulas"
    
    # Basic information
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    short_description = Column(String(500), nullable=True)
    
    # Creator relationship
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Formula content
    formula_code = Column(Text, nullable=False)  # The actual trading logic/code
    parameters = Column(Text, nullable=True)  # JSON string of configurable parameters
    version = Column(String(20), default="1.0.0", nullable=False)
    
    # Categorization
    category = Column(Enum(FormulaCategory), nullable=False, index=True)
    tags = Column(Text, nullable=True)  # JSON string of tags
    
    # Pricing and subscription
    is_free = Column(Boolean, default=False, nullable=False)
    price = Column(Numeric(10, 2), nullable=True)  # Price in USD
    currency = Column(String(3), default="USD", nullable=False)
    
    # Status and visibility
    status = Column(Enum(FormulaStatus), default=FormulaStatus.DRAFT, nullable=False, index=True)
    is_public = Column(Boolean, default=True, nullable=False)
    
    # Performance metrics
    total_subscribers = Column(Integer, default=0, nullable=False)
    total_trades = Column(Integer, default=0, nullable=False)
    success_rate = Column(Numeric(5, 2), nullable=True)  # Percentage
    avg_return = Column(Numeric(10, 4), nullable=True)  # Average return percentage
    
    # Documentation
    documentation = Column(Text, nullable=True)
    usage_instructions = Column(Text, nullable=True)
    
    # Risk and compliance
    risk_level = Column(String(20), nullable=True)  # low, medium, high
    min_capital = Column(Numeric(12, 2), nullable=True)  # Minimum capital required
    max_drawdown = Column(Numeric(5, 2), nullable=True)  # Maximum drawdown percentage
    
    # Relationships
    creator = relationship("User", back_populates="created_formulas")
    subscriptions = relationship("Subscription", back_populates="formula", cascade="all, delete-orphan")
    trades = relationship("Trade", back_populates="formula", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="formula", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index("idx_formulas_creator_status", "creator_id", "status"),
        Index("idx_formulas_category_status", "category", "status"),
        Index("idx_formulas_price_status", "price", "status"),
        Index("idx_formulas_public_status", "is_public", "status"),
        Index("idx_formulas_created_at", "created_at"),
        Index("idx_formulas_success_rate", "success_rate"),
    )
    
    def __repr__(self) -> str:
        return f"<Formula(id={self.id}, title={self.title}, creator_id={self.creator_id})>"
    
    @property
    def is_published(self) -> bool:
        """Check if formula is published."""
        return self.status == FormulaStatus.PUBLISHED
    
    @property
    def is_monetized(self) -> bool:
        """Check if formula is monetized."""
        return not self.is_free and self.price is not None and self.price > 0
    
    @property
    def display_price(self) -> str:
        """Get formatted price string."""
        if self.is_free:
            return "Free"
        return f"${self.price} {self.currency}"