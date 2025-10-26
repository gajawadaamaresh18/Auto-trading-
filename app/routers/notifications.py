from fastapi import APIRouter, Depends, HTTPException, status, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import List, Dict, Any
from datetime import datetime
import json
import asyncio
from app.database import get_db
from app.models import User, Notification, Subscription, Formula
from app.schemas import (
    NotificationResponse, NotificationListResponse, NotificationType,
    WebSocketMessage
)
from app.auth import get_current_active_user

router = APIRouter(prefix="/notifications", tags=["notifications"])

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(message)
            except:
                # Connection might be closed, remove it
                self.disconnect(user_id)
    
    async def broadcast_to_subscribers(self, message: str, formula_id: int, db: Session):
        """Broadcast message to all subscribers of a specific formula."""
        subscribers = db.query(Subscription).filter(
            and_(
                Subscription.formula_id == formula_id,
                Subscription.is_active == True
            )
        ).all()
        
        for subscriber in subscribers:
            await self.send_personal_message(message, subscriber.user_id)

manager = ConnectionManager()


@router.get("/", response_model=NotificationListResponse)
async def get_notifications(
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    unread_only: bool = Query(False, description="Filter unread notifications only"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get user notifications with pagination.
    
    Returns paginated list of notifications for the current user.
    Can filter to show only unread notifications.
    """
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * size
    notifications = query.order_by(desc(Notification.created_at)).offset(offset).limit(size).all()
    
    # Calculate total pages
    total_pages = (total + size - 1) // size if total > 0 else 1
    
    return NotificationListResponse(
        notifications=notifications,
        total=total,
        page=page,
        size=size,
        total_pages=total_pages
    )


@router.get("/unread/count")
async def get_unread_count(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get count of unread notifications.
    
    Returns the number of unread notifications for the current user.
    Useful for showing notification badges in the UI.
    """
    unread_count = db.query(Notification).filter(
        and_(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
    ).count()
    
    return {"unread_count": unread_count}


@router.put("/{notification_id}/read", status_code=status.HTTP_200_OK)
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Mark a notification as read.
    
    Updates the notification status to read for the current user.
    """
    notification = db.query(Notification).filter(
        and_(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read"}


@router.put("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Mark all notifications as read.
    
    Marks all unread notifications for the current user as read.
    """
    updated_count = db.query(Notification).filter(
        and_(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
    ).update({"is_read": True})
    
    db.commit()
    
    return {"message": f"Marked {updated_count} notifications as read"}


@router.delete("/{notification_id}", status_code=status.HTTP_200_OK)
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete a notification.
    
    Permanently removes a notification from the user's notification list.
    """
    notification = db.query(Notification).filter(
        and_(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted successfully"}


@router.delete("/", status_code=status.HTTP_200_OK)
async def delete_all_notifications(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete all notifications for the current user.
    
    Permanently removes all notifications for the current user.
    """
    deleted_count = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).delete()
    
    db.commit()
    
    return {"message": f"Deleted {deleted_count} notifications"}


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """
    WebSocket endpoint for real-time notifications.
    
    Establishes a persistent connection for real-time notifications.
    User must be authenticated to connect.
    """
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Echo back the message (could be used for ping/pong)
            await websocket.send_text(json.dumps({
                "type": "pong",
                "timestamp": datetime.utcnow().isoformat()
            }))
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)


async def create_notification(
    user_id: int,
    notification_type: NotificationType,
    title: str,
    message: str,
    data: Dict[str, Any] = None,
    db: Session = None
):
    """
    Create a new notification for a user.
    
    This is a helper function that can be called from other parts of the application
    to create notifications programmatically.
    """
    notification = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        message=message,
        data=data or {}
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    # Send real-time notification via WebSocket
    websocket_message = WebSocketMessage(
        type="notification",
        data={
            "id": notification.id,
            "type": notification.type,
            "title": notification.title,
            "message": notification.message,
            "data": notification.data,
            "created_at": notification.created_at.isoformat()
        }
    )
    
    await manager.send_personal_message(
        websocket_message.json(),
        user_id
    )
    
    return notification


async def broadcast_formula_signal(
    formula_id: int,
    signal_data: Dict[str, Any],
    db: Session
):
    """
    Broadcast a trading signal to all subscribers of a formula.
    
    This function can be called when a formula generates a new trading signal
    to notify all subscribers in real-time.
    """
    # Get formula details
    formula = db.query(Formula).filter(Formula.id == formula_id).first()
    if not formula:
        return
    
    # Create notification for each subscriber
    subscribers = db.query(Subscription).filter(
        and_(
            Subscription.formula_id == formula_id,
            Subscription.is_active == True
        )
    ).all()
    
    for subscriber in subscribers:
        notification = Notification(
            user_id=subscriber.user_id,
            type=NotificationType.TRADE_SIGNAL,
            title=f"New Signal: {formula.name}",
            message=f"Formula '{formula.name}' has generated a new trading signal",
            data=signal_data
        )
        
        db.add(notification)
        
        # Send real-time notification
        websocket_message = WebSocketMessage(
            type="trade_signal",
            data={
                "formula_id": formula_id,
                "formula_name": formula.name,
                "signal_data": signal_data,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
        
        await manager.send_personal_message(
            websocket_message.json(),
            subscriber.user_id
        )
    
    db.commit()


@router.post("/test/signal/{formula_id}", status_code=status.HTTP_200_OK)
async def test_formula_signal(
    formula_id: int,
    signal_data: Dict[str, Any],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Test endpoint to send a signal notification for a formula.
    
    This is a test endpoint that can be used to trigger signal notifications
    for testing purposes. Only formula authors can use this endpoint.
    """
    formula = db.query(Formula).filter(
        and_(
            Formula.id == formula_id,
            Formula.author_id == current_user.id
        )
    ).first()
    
    if not formula:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formula not found or you don't have permission to test it"
        )
    
    await broadcast_formula_signal(formula_id, signal_data, db)
    
    return {"message": f"Signal broadcasted to subscribers of formula '{formula.name}'"}


@router.get("/types", response_model=List[str])
async def get_notification_types():
    """
    Get available notification types.
    
    Returns list of all available notification types for the application.
    """
    return [notification_type.value for notification_type in NotificationType]