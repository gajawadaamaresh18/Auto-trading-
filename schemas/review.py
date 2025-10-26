"""
Pydantic schemas for Review model.
"""

from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import Field, validator

from .base import BaseCreateSchema, BaseUpdateSchema, BaseResponseSchema, PaginationSchema


class ReviewCreate(BaseCreateSchema):
    """Schema for creating a new review."""
    
    formula_id: UUID = Field(..., description="Formula ID")
    title: Optional[str] = Field(None, max_length=200, description="Review title")
    content: str = Field(..., description="Review content")
    overall_rating: int = Field(..., ge=1, le=5, description="Overall rating (1-5 stars)")
    performance_rating: Optional[int] = Field(None, ge=1, le=5, description="Performance rating (1-5 stars)")
    ease_of_use_rating: Optional[int] = Field(None, ge=1, le=5, description="Ease of use rating (1-5 stars)")
    value_rating: Optional[int] = Field(None, ge=1, le=5, description="Value rating (1-5 stars)")
    support_rating: Optional[int] = Field(None, ge=1, le=5, description="Support rating (1-5 stars)")
    subscription_duration: Optional[int] = Field(None, ge=0, description="Days subscribed before review")
    trades_executed: Optional[int] = Field(None, ge=0, description="Number of trades executed")
    profit_loss: Optional[Decimal] = Field(None, description="P&L from using the formula")
    tags: Optional[str] = Field(None, description="Review tags (JSON)")
    is_anonymous: bool = Field(False, description="Whether review is anonymous")


class ReviewUpdate(BaseUpdateSchema):
    """Schema for updating a review."""
    
    title: Optional[str] = Field(None, max_length=200, description="Review title")
    content: Optional[str] = Field(None, description="Review content")
    overall_rating: Optional[int] = Field(None, ge=1, le=5, description="Overall rating (1-5 stars)")
    performance_rating: Optional[int] = Field(None, ge=1, le=5, description="Performance rating (1-5 stars)")
    ease_of_use_rating: Optional[int] = Field(None, ge=1, le=5, description="Ease of use rating (1-5 stars)")
    value_rating: Optional[int] = Field(None, ge=1, le=5, description="Value rating (1-5 stars)")
    support_rating: Optional[int] = Field(None, ge=1, le=5, description="Support rating (1-5 stars)")
    tags: Optional[str] = Field(None, description="Review tags (JSON)")
    is_anonymous: Optional[bool] = Field(None, description="Whether review is anonymous")


class ReviewResponse(BaseResponseSchema):
    """Schema for review response."""
    
    user_id: UUID
    formula_id: UUID
    title: Optional[str]
    content: str
    overall_rating: int
    performance_rating: Optional[int]
    ease_of_use_rating: Optional[int]
    value_rating: Optional[int]
    support_rating: Optional[int]
    status: str
    is_verified: bool
    is_helpful: bool
    helpful_count: int
    not_helpful_count: int
    reply_count: int
    moderation_notes: Optional[str]
    moderated_by: Optional[UUID]
    moderated_at: Optional[str]
    subscription_duration: Optional[int]
    trades_executed: Optional[int]
    profit_loss: Optional[Decimal]
    tags: Optional[str]
    is_anonymous: bool
    
    # Computed fields
    is_approved: bool = Field(description="Whether review is approved")
    is_pending: bool = Field(description="Whether review is pending moderation")
    is_rejected: bool = Field(description="Whether review is rejected")
    is_hidden: bool = Field(description="Whether review is hidden")
    helpful_score: int = Field(description="Helpful score (helpful - not helpful)")
    average_rating: Optional[Decimal] = Field(description="Average of all rating categories")
    display_name: str = Field(description="Display name for the review")


class ReviewList(PaginationSchema):
    """Schema for paginated review list."""
    
    items: List[ReviewResponse] = Field(description="List of reviews")


class ReviewHelpful(BaseCreateSchema):
    """Schema for marking a review as helpful."""
    
    is_helpful: bool = Field(..., description="Whether review is helpful")


class ReviewModerate(BaseCreateSchema):
    """Schema for moderating a review."""
    
    status: str = Field(..., description="New review status")
    moderation_notes: Optional[str] = Field(None, description="Moderation notes")


class ReviewSearch(BaseCreateSchema):
    """Schema for review search."""
    
    formula_id: Optional[UUID] = Field(None, description="Filter by formula ID")
    user_id: Optional[UUID] = Field(None, description="Filter by user ID")
    min_rating: Optional[int] = Field(None, ge=1, le=5, description="Minimum rating")
    max_rating: Optional[int] = Field(None, ge=1, le=5, description="Maximum rating")
    is_verified: Optional[bool] = Field(None, description="Filter by verified status")
    is_helpful: Optional[bool] = Field(None, description="Filter by helpful status")
    status: Optional[str] = Field(None, description="Filter by status")
    is_anonymous: Optional[bool] = Field(None, description="Filter by anonymous status")
    sort_by: Optional[str] = Field("created_at", description="Sort field")
    sort_order: Optional[str] = Field("desc", description="Sort order (asc/desc)")


class ReviewStats(BaseCreateSchema):
    """Schema for review statistics."""
    
    total_reviews: int = Field(description="Total number of reviews")
    approved_reviews: int = Field(description="Number of approved reviews")
    pending_reviews: int = Field(description="Number of pending reviews")
    rejected_reviews: int = Field(description="Number of rejected reviews")
    avg_rating: Optional[Decimal] = Field(description="Average rating")
    rating_distribution: dict = Field(description="Rating distribution")
    verified_reviews: int = Field(description="Number of verified reviews")
    helpful_reviews: int = Field(description="Number of helpful reviews")