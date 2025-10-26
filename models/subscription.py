"""
Subscription model for user subscriptions to formulas.
"""

import enum
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Numeric, String, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base, TimestampMixin, UUIDMixin


class SubscriptionStatus(str, enum.Enum):
    """Subscription status enumeration."""
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    SUSPENDED = "suspended"
    PENDING = "pending"


class SubscriptionType(str, enum.Enum):
    """Subscription type enumeration."""
    MONTHLY = "monthly"
    YEARLY = "yearly"
    LIFETIME = "lifetime"
    TRIAL = "trial"


class Subscription(Base, UUIDMixin, TimestampMixin):
    """
    Subscription model representing user subscriptions to formulas.
    
    This model manages the relationship between users and formulas they've subscribed to.
    It tracks subscription status, billing information, and access permissions.
    Subscriptions can be free or paid, with different billing cycles and durations.
    """
    
    __tablename__ = "subscriptions"
    
    # User and formula relationships
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    formula_id = Column(UUID(as_uuid=True), ForeignKey("formulas.id"), nullable=False, index=True)
    
    # Subscription details
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.PENDING, nullable=False, index=True)
    subscription_type = Column(Enum(SubscriptionType), nullable=False)
    
    # Pricing information
    amount_paid = Column(Numeric(10, 2), nullable=True)  # Amount actually paid
    currency = Column(String(3), default="USD", nullable=False)
    
    # Billing and duration
    start_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    end_date = Column(DateTime, nullable=True)  # None for lifetime subscriptions
    trial_end_date = Column(DateTime, nullable=True)  # For trial subscriptions
    
    # Access control
    is_active = Column(Boolean, default=True, nullable=False)
    auto_renew = Column(Boolean, default=True, nullable=False)
    
    # Payment information
    payment_method = Column(String(50), nullable=True)  # stripe, paypal, etc.
    payment_reference = Column(String(255), nullable=True)  # External payment ID
    last_payment_date = Column(DateTime, nullable=True)
    next_payment_date = Column(DateTime, nullable=True)
    
    # Cancellation
    cancelled_at = Column(DateTime, nullable=True)
    cancellation_reason = Column(String(500), nullable=True)
    
    # Usage tracking
    signals_received = Column(String(20), default="0", nullable=False)  # Number of trading signals received
    last_signal_date = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="subscriptions")
    formula = relationship("Formula", back_populates="subscriptions")
    
    # Indexes
    __table_args__ = (
        Index("idx_subscriptions_user_status", "user_id", "status"),
        Index("idx_subscriptions_formula_status", "formula_id", "status"),
        Index("idx_subscriptions_active", "is_active", "status"),
        Index("idx_subscriptions_end_date", "end_date"),
        Index("idx_subscriptions_payment_date", "next_payment_date"),
        Index("idx_subscriptions_user_formula", "user_id", "formula_id", unique=True),
    )
    
    def __repr__(self) -> str:
        return f"<Subscription(id={self.id}, user_id={self.user_id}, formula_id={self.formula_id})>"
    
    @property
    def is_trial(self) -> bool:
        """Check if subscription is a trial."""
        return self.subscription_type == SubscriptionType.TRIAL
    
    @property
    def is_expired(self) -> bool:
        """Check if subscription has expired."""
        if self.subscription_type == SubscriptionType.LIFETIME:
            return False
        if self.end_date is None:
            return False
        return datetime.utcnow() > self.end_date
    
    @property
    def days_remaining(self) -> Optional[int]:
        """Get days remaining in subscription."""
        if self.subscription_type == SubscriptionType.LIFETIME:
            return None
        if self.end_date is None:
            return None
        delta = self.end_date - datetime.utcnow()
        return max(0, delta.days)
    
    @property
    def is_accessible(self) -> bool:
        """Check if user has access to the formula."""
        return (
            self.is_active and 
            self.status == SubscriptionStatus.ACTIVE and 
            not self.is_expired
        )