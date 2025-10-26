"""
Notification model for user notifications and alerts.
"""

import enum
from typing import Optional

from sqlalchemy import Boolean, Column, Enum, ForeignKey, String, Text, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from .base import Base, TimestampMixin, UUIDMixin


class NotificationType(str, enum.Enum):
    """Notification type enumeration."""
    TRADE_EXECUTED = "trade_executed"
    TRADE_FAILED = "trade_failed"
    FORMULA_SIGNAL = "formula_signal"
    SUBSCRIPTION_EXPIRED = "subscription_expired"
    SUBSCRIPTION_RENEWED = "subscription_renewed"
    PAYMENT_FAILED = "payment_failed"
    PAYMENT_SUCCESS = "payment_success"
    FORMULA_UPDATED = "formula_updated"
    REVIEW_RECEIVED = "review_received"
    SYSTEM_MAINTENANCE = "system_maintenance"
    SECURITY_ALERT = "security_alert"
    GENERAL = "general"


class NotificationPriority(str, enum.Enum):
    """Notification priority enumeration."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class NotificationStatus(str, enum.Enum):
    """Notification status enumeration."""
    UNREAD = "unread"
    READ = "read"
    ARCHIVED = "archived"
    DELETED = "deleted"


class Notification(Base, UUIDMixin, TimestampMixin):
    """
    Notification model for user notifications and alerts.
    
    This model manages all types of notifications sent to users including trade
    alerts, subscription updates, system messages, and security alerts. It supports
    different notification types, priorities, and delivery channels to ensure
    users stay informed about important events and activities.
    """
    
    __tablename__ = "notifications"
    
    # User relationship
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    
    # Notification content
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), nullable=False, index=True)
    priority = Column(Enum(NotificationPriority), default=NotificationPriority.MEDIUM, nullable=False, index=True)
    
    # Status and delivery
    status = Column(Enum(NotificationStatus), default=NotificationStatus.UNREAD, nullable=False, index=True)
    is_read = Column(Boolean, default=False, nullable=False)
    read_at = Column(String(50), nullable=True)  # When notification was read
    
    # Delivery channels
    email_sent = Column(Boolean, default=False, nullable=False)
    push_sent = Column(Boolean, default=False, nullable=False)
    sms_sent = Column(Boolean, default=False, nullable=False)
    in_app_sent = Column(Boolean, default=True, nullable=False)
    
    # Delivery timestamps
    email_sent_at = Column(String(50), nullable=True)
    push_sent_at = Column(String(50), nullable=True)
    sms_sent_at = Column(String(50), nullable=True)
    
    # Related entities (optional foreign keys)
    related_formula_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    related_trade_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    related_subscription_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    
    # Action and interaction
    action_url = Column(String(500), nullable=True)  # URL for action button
    action_text = Column(String(100), nullable=True)  # Text for action button
    is_actionable = Column(Boolean, default=False, nullable=False)
    
    # Metadata and context
    metadata = Column(Text, nullable=True)  # JSON string for additional data
    tags = Column(Text, nullable=True)  # JSON string of tags
    category = Column(String(50), nullable=True, index=True)  # Custom category
    
    # Expiration and scheduling
    expires_at = Column(String(50), nullable=True)  # When notification expires
    scheduled_for = Column(String(50), nullable=True)  # When to send (for scheduled notifications)
    
    # System information
    source = Column(String(100), nullable=True)  # What system/process created this
    batch_id = Column(String(100), nullable=True, index=True)  # For batch notifications
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    
    # Indexes
    __table_args__ = (
        Index("idx_notifications_user_status", "user_id", "status"),
        Index("idx_notifications_user_unread", "user_id", "is_read"),
        Index("idx_notifications_type_priority", "notification_type", "priority"),
        Index("idx_notifications_created_at", "created_at"),
        Index("idx_notifications_expires_at", "expires_at"),
        Index("idx_notifications_scheduled_for", "scheduled_for"),
        Index("idx_notifications_batch_id", "batch_id"),
    )
    
    def __repr__(self) -> str:
        return f"<Notification(id={self.id}, user_id={self.user_id}, type={self.notification_type})>"
    
    @property
    def is_unread(self) -> bool:
        """Check if notification is unread."""
        return not self.is_read and self.status == NotificationStatus.UNREAD
    
    @property
    def is_archived(self) -> bool:
        """Check if notification is archived."""
        return self.status == NotificationStatus.ARCHIVED
    
    @property
    def is_deleted(self) -> bool:
        """Check if notification is deleted."""
        return self.status == NotificationStatus.DELETED
    
    @property
    def is_urgent(self) -> bool:
        """Check if notification is urgent priority."""
        return self.priority == NotificationPriority.URGENT
    
    @property
    def is_high_priority(self) -> bool:
        """Check if notification is high or urgent priority."""
        return self.priority in [NotificationPriority.HIGH, NotificationPriority.URGENT]
    
    @property
    def delivery_status(self) -> dict:
        """Get delivery status for all channels."""
        return {
            "email": self.email_sent,
            "push": self.push_sent,
            "sms": self.sms_sent,
            "in_app": self.in_app_sent
        }
    
    def mark_as_read(self) -> None:
        """Mark notification as read."""
        self.is_read = True
        self.status = NotificationStatus.READ
        from datetime import datetime
        self.read_at = datetime.utcnow().isoformat()
    
    def archive(self) -> None:
        """Archive the notification."""
        self.status = NotificationStatus.ARCHIVED
    
    def delete(self) -> None:
        """Soft delete the notification."""
        self.status = NotificationStatus.DELETED