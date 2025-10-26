"""
Pydantic schemas for Subscription model.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import Field

from .base import BaseCreateSchema, BaseUpdateSchema, BaseResponseSchema, PaginationSchema


class SubscriptionCreate(BaseCreateSchema):
    """Schema for creating a new subscription."""
    
    formula_id: UUID = Field(..., description="Formula ID to subscribe to")
    subscription_type: str = Field(..., description="Subscription type")
    auto_renew: bool = Field(True, description="Whether to auto-renew")
    payment_method: Optional[str] = Field(None, description="Payment method")


class SubscriptionUpdate(BaseUpdateSchema):
    """Schema for updating a subscription."""
    
    auto_renew: Optional[bool] = Field(None, description="Whether to auto-renew")
    status: Optional[str] = Field(None, description="Subscription status")
    cancellation_reason: Optional[str] = Field(None, max_length=500, description="Cancellation reason")


class SubscriptionResponse(BaseResponseSchema):
    """Schema for subscription response."""
    
    user_id: UUID
    formula_id: UUID
    status: str
    subscription_type: str
    amount_paid: Optional[Decimal]
    currency: str
    start_date: datetime
    end_date: Optional[datetime]
    trial_end_date: Optional[datetime]
    is_active: bool
    auto_renew: bool
    payment_method: Optional[str]
    payment_reference: Optional[str]
    last_payment_date: Optional[datetime]
    next_payment_date: Optional[datetime]
    cancelled_at: Optional[datetime]
    cancellation_reason: Optional[str]
    signals_received: str
    last_signal_date: Optional[datetime]
    
    # Computed fields
    is_trial: bool = Field(description="Whether subscription is a trial")
    is_expired: bool = Field(description="Whether subscription has expired")
    days_remaining: Optional[int] = Field(description="Days remaining in subscription")
    is_accessible: bool = Field(description="Whether user has access to the formula")


class SubscriptionList(PaginationSchema):
    """Schema for paginated subscription list."""
    
    items: List[SubscriptionResponse] = Field(description="List of subscriptions")


class SubscriptionCancel(BaseCreateSchema):
    """Schema for cancelling a subscription."""
    
    cancellation_reason: Optional[str] = Field(None, max_length=500, description="Cancellation reason")


class SubscriptionRenew(BaseCreateSchema):
    """Schema for renewing a subscription."""
    
    payment_method: Optional[str] = Field(None, description="Payment method for renewal")


class SubscriptionStats(BaseCreateSchema):
    """Schema for subscription statistics."""
    
    total_subscriptions: int = Field(description="Total number of subscriptions")
    active_subscriptions: int = Field(description="Number of active subscriptions")
    expired_subscriptions: int = Field(description="Number of expired subscriptions")
    cancelled_subscriptions: int = Field(description="Number of cancelled subscriptions")
    total_revenue: Optional[Decimal] = Field(description="Total revenue from subscriptions")
    monthly_recurring_revenue: Optional[Decimal] = Field(description="Monthly recurring revenue")
    churn_rate: Optional[Decimal] = Field(description="Subscription churn rate")