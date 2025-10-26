"""
Review model for user feedback and ratings on formulas.
"""

import enum
from decimal import Decimal
from typing import Optional

from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, Numeric, String, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base, TimestampMixin, UUIDMixin


class ReviewStatus(str, enum.Enum):
    """Review status enumeration."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    HIDDEN = "hidden"


class Review(Base, UUIDMixin, TimestampMixin):
    """
    Review model for user feedback and ratings on formulas.
    
    This model manages user reviews and ratings for formulas, providing a feedback
    system for the community. Reviews include ratings, written feedback, and metadata
    to help other users make informed decisions about formula subscriptions.
    """
    
    __tablename__ = "reviews"
    
    # User and formula relationships
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    formula_id = Column(UUID(as_uuid=True), ForeignKey("formulas.id"), nullable=False, index=True)
    
    # Review content
    title = Column(String(200), nullable=True)
    content = Column(Text, nullable=False)
    
    # Rating information
    overall_rating = Column(Integer, nullable=False)  # 1-5 stars
    performance_rating = Column(Integer, nullable=True)  # 1-5 stars
    ease_of_use_rating = Column(Integer, nullable=True)  # 1-5 stars
    value_rating = Column(Integer, nullable=True)  # 1-5 stars
    support_rating = Column(Integer, nullable=True)  # 1-5 stars
    
    # Review status and moderation
    status = Column(Enum(ReviewStatus), default=ReviewStatus.PENDING, nullable=False, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)  # Verified purchase/subscription
    is_helpful = Column(Boolean, default=False, nullable=False)  # Marked as helpful by others
    
    # Engagement metrics
    helpful_count = Column(Integer, default=0, nullable=False)  # Number of helpful votes
    not_helpful_count = Column(Integer, default=0, nullable=False)  # Number of not helpful votes
    reply_count = Column(Integer, default=0, nullable=False)  # Number of replies
    
    # Moderation
    moderation_notes = Column(Text, nullable=True)  # Internal moderation notes
    moderated_by = Column(UUID(as_uuid=True), nullable=True)  # Admin who moderated
    moderated_at = Column(String(50), nullable=True)  # When it was moderated
    
    # User experience data
    subscription_duration = Column(Integer, nullable=True)  # Days subscribed before review
    trades_executed = Column(Integer, nullable=True)  # Number of trades executed
    profit_loss = Column(Numeric(20, 8), nullable=True)  # P&L from using the formula
    
    # Metadata
    tags = Column(Text, nullable=True)  # JSON string of tags
    is_anonymous = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="reviews")
    formula = relationship("Formula", back_populates="reviews")
    
    # Indexes
    __table_args__ = (
        Index("idx_reviews_formula_status", "formula_id", "status"),
        Index("idx_reviews_user_formula", "user_id", "formula_id", unique=True),
        Index("idx_reviews_rating", "overall_rating"),
        Index("idx_reviews_verified", "is_verified", "status"),
        Index("idx_reviews_helpful", "is_helpful", "status"),
        Index("idx_reviews_created_at", "created_at"),
        Index("idx_reviews_helpful_count", "helpful_count"),
    )
    
    def __repr__(self) -> str:
        return f"<Review(id={self.id}, formula_id={self.formula_id}, rating={self.overall_rating})>"
    
    @property
    def is_approved(self) -> bool:
        """Check if review is approved."""
        return self.status == ReviewStatus.APPROVED
    
    @property
    def is_pending(self) -> bool:
        """Check if review is pending moderation."""
        return self.status == ReviewStatus.PENDING
    
    @property
    def is_rejected(self) -> bool:
        """Check if review is rejected."""
        return self.status == ReviewStatus.REJECTED
    
    @property
    def is_hidden(self) -> bool:
        """Check if review is hidden."""
        return self.status == ReviewStatus.HIDDEN
    
    @property
    def helpful_score(self) -> int:
        """Calculate helpful score (helpful - not helpful)."""
        return self.helpful_count - self.not_helpful_count
    
    @property
    def average_rating(self) -> Optional[Decimal]:
        """Calculate average of all rating categories."""
        ratings = [r for r in [
            self.performance_rating,
            self.ease_of_use_rating,
            self.value_rating,
            self.support_rating
        ] if r is not None]
        
        if not ratings:
            return None
        
        return sum(ratings) / len(ratings)
    
    @property
    def display_name(self) -> str:
        """Get display name for the review."""
        if self.is_anonymous:
            return "Anonymous User"
        return self.user.username if self.user else "Unknown User"