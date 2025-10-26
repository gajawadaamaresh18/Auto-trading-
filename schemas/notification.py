"""
Pydantic schemas for Notification model.
"""

from typing import List, Optional
from uuid import UUID

from pydantic import Field

from .base import BaseCreateSchema, BaseUpdateSchema, BaseResponseSchema, PaginationSchema


class NotificationCreate(BaseCreateSchema):
    """Schema for creating a new notification."""
    
    user_id: UUID = Field(..., description="User ID")
    title: str = Field(..., max_length=200, description="Notification title")
    message: str = Field(..., description="Notification message")
    notification_type: str = Field(..., description="Notification type")
    priority: str = Field("medium", description="Notification priority")
    related_formula_id: Optional[UUID] = Field(None, description="Related formula ID")
    related_trade_id: Optional[UUID] = Field(None, description="Related trade ID")
    related_subscription_id: Optional[UUID] = Field(None, description="Related subscription ID")
    action_url: Optional[str] = Field(None, max_length=500, description="Action URL")
    action_text: Optional[str] = Field(None, max_length=100, description="Action text")
    is_actionable: bool = Field(False, description="Whether notification is actionable")
    metadata: Optional[str] = Field(None, description="Additional metadata (JSON)")
    tags: Optional[str] = Field(None, description="Notification tags (JSON)")
    category: Optional[str] = Field(None, max_length=50, description="Notification category")
    expires_at: Optional[str] = Field(None, description="Expiration timestamp")
    scheduled_for: Optional[str] = Field(None, description="Scheduled send timestamp")
    source: Optional[str] = Field(None, max_length=100, description="Notification source")
    batch_id: Optional[str] = Field(None, max_length=100, description="Batch ID")


class NotificationUpdate(BaseUpdateSchema):
    """Schema for updating a notification."""
    
    title: Optional[str] = Field(None, max_length=200, description="Notification title")
    message: Optional[str] = Field(None, description="Notification message")
    priority: Optional[str] = Field(None, description="Notification priority")
    status: Optional[str] = Field(None, description="Notification status")
    action_url: Optional[str] = Field(None, max_length=500, description="Action URL")
    action_text: Optional[str] = Field(None, max_length=100, description="Action text")
    is_actionable: Optional[bool] = Field(None, description="Whether notification is actionable")
    metadata: Optional[str] = Field(None, description="Additional metadata (JSON)")
    tags: Optional[str] = Field(None, description="Notification tags (JSON)")
    category: Optional[str] = Field(None, max_length=50, description="Notification category")
    expires_at: Optional[str] = Field(None, description="Expiration timestamp")
    scheduled_for: Optional[str] = Field(None, description="Scheduled send timestamp")


class NotificationResponse(BaseResponseSchema):
    """Schema for notification response."""
    
    user_id: UUID
    title: str
    message: str
    notification_type: str
    priority: str
    status: str
    is_read: bool
    read_at: Optional[str]
    email_sent: bool
    push_sent: bool
    sms_sent: bool
    in_app_sent: bool
    email_sent_at: Optional[str]
    push_sent_at: Optional[str]
    sms_sent_at: Optional[str]
    related_formula_id: Optional[UUID]
    related_trade_id: Optional[UUID]
    related_subscription_id: Optional[UUID]
    action_url: Optional[str]
    action_text: Optional[str]
    is_actionable: bool
    metadata: Optional[str]
    tags: Optional[str]
    category: Optional[str]
    expires_at: Optional[str]
    scheduled_for: Optional[str]
    source: Optional[str]
    batch_id: Optional[str]
    
    # Computed fields
    is_unread: bool = Field(description="Whether notification is unread")
    is_archived: bool = Field(description="Whether notification is archived")
    is_deleted: bool = Field(description="Whether notification is deleted")
    is_urgent: bool = Field(description="Whether notification is urgent priority")
    is_high_priority: bool = Field(description="Whether notification is high or urgent priority")
    delivery_status: dict = Field(description="Delivery status for all channels")
    display_name: str = Field(description="Display name for the notification")


class NotificationList(PaginationSchema):
    """Schema for paginated notification list."""
    
    items: List[NotificationResponse] = Field(description="List of notifications")


class NotificationMarkRead(BaseCreateSchema):
    """Schema for marking notifications as read."""
    
    notification_ids: List[UUID] = Field(..., description="List of notification IDs to mark as read")


class NotificationMarkAllRead(BaseCreateSchema):
    """Schema for marking all notifications as read."""
    
    user_id: UUID = Field(..., description="User ID")


class NotificationArchive(BaseCreateSchema):
    """Schema for archiving notifications."""
    
    notification_ids: List[UUID] = Field(..., description="List of notification IDs to archive")


class NotificationDelete(BaseCreateSchema):
    """Schema for deleting notifications."""
    
    notification_ids: List[UUID] = Field(..., description="List of notification IDs to delete")


class NotificationSearch(BaseCreateSchema):
    """Schema for notification search."""
    
    user_id: Optional[UUID] = Field(None, description="Filter by user ID")
    notification_type: Optional[str] = Field(None, description="Filter by notification type")
    priority: Optional[str] = Field(None, description="Filter by priority")
    status: Optional[str] = Field(None, description="Filter by status")
    is_read: Optional[bool] = Field(None, description="Filter by read status")
    category: Optional[str] = Field(None, description="Filter by category")
    is_actionable: Optional[bool] = Field(None, description="Filter by actionable status")
    date_from: Optional[str] = Field(None, description="Filter from date")
    date_to: Optional[str] = Field(None, description="Filter to date")
    sort_by: Optional[str] = Field("created_at", description="Sort field")
    sort_order: Optional[str] = Field("desc", description="Sort order (asc/desc)")


class NotificationStats(BaseCreateSchema):
    """Schema for notification statistics."""
    
    total_notifications: int = Field(description="Total number of notifications")
    unread_notifications: int = Field(description="Number of unread notifications")
    read_notifications: int = Field(description="Number of read notifications")
    archived_notifications: int = Field(description="Number of archived notifications")
    deleted_notifications: int = Field(description="Number of deleted notifications")
    urgent_notifications: int = Field(description="Number of urgent notifications")
    high_priority_notifications: int = Field(description="Number of high priority notifications")
    delivery_success_rate: dict = Field(description="Delivery success rate by channel")