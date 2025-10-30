"""
Notification Service

Service for managing notifications and real-time updates.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models import Notification, User

class NotificationService:
    """Service for managing notifications."""
    
    def __init__(self):
        self.websocket_connections = {}
    
    async def create_notification(
        self, 
        db: Session, 
        user_id: str, 
        title: str, 
        message: str, 
        notification_type: str,
        extra_data: Optional[str] = None
    ) -> Notification:
        """Create a new notification."""
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            extra_data=extra_data
        )
        
        db.add(notification)
        db.commit()
        db.refresh(notification)
        
        # Send real-time notification if user is connected
        await self.send_realtime_notification(user_id, notification)
        
        return notification
    
    async def send_realtime_notification(self, user_id: str, notification: Notification):
        """Send real-time notification via WebSocket."""
        if user_id in self.websocket_connections:
            websocket = self.websocket_connections[user_id]
            try:
                await websocket.send_text(notification.message)
            except Exception as e:
                # Remove disconnected websocket
                del self.websocket_connections[user_id]
    
    async def get_user_notifications(
        self, 
        db: Session, 
        user_id: str, 
        limit: int = 50, 
        offset: int = 0
    ) -> List[Notification]:
        """Get user notifications."""
        return db.query(Notification).filter(
            Notification.user_id == user_id
        ).order_by(Notification.created_at.desc()).offset(offset).limit(limit).all()
    
    async def mark_notification_as_read(self, db: Session, notification_id: str) -> bool:
        """Mark notification as read."""
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if notification:
            notification.is_read = True
            db.commit()
            return True
        return False
    
    async def mark_all_notifications_as_read(self, db: Session, user_id: str) -> int:
        """Mark all user notifications as read."""
        notifications = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).all()
        
        count = 0
        for notification in notifications:
            notification.is_read = True
            count += 1
        
        db.commit()
        return count
    
    async def send_trade_notification(
        self, 
        db: Session, 
        user_id: str, 
        trade_data: Dict[str, Any]
    ) -> Notification:
        """Send trade execution notification."""
        title = f"Trade {'Executed' if trade_data.get('status') == 'executed' else 'Pending'}"
        message = f"Your {trade_data.get('side', 'trade')} order for {trade_data.get('symbol', 'N/A')} has been {trade_data.get('status', 'pending')}"
        
        return await self.create_notification(
            db=db,
            user_id=user_id,
            title=title,
            message=message,
            notification_type="trade_executed",
            extra_data=str(trade_data)
        )
    
    async def send_formula_alert(
        self, 
        db: Session, 
        user_id: str, 
        formula_name: str, 
        signal: str
    ) -> Notification:
        """Send formula alert notification."""
        title = f"Formula Alert: {formula_name}"
        message = f"Your formula '{formula_name}' has generated a {signal} signal"
        
        return await self.create_notification(
            db=db,
            user_id=user_id,
            title=title,
            message=message,
            notification_type="formula_alert",
            extra_data=f"formula_name={formula_name}&signal={signal}"
        )
    
    async def send_system_alert(
        self, 
        db: Session, 
        user_id: str, 
        alert_type: str, 
        message: str
    ) -> Notification:
        """Send system alert notification."""
        title = f"System Alert: {alert_type}"
        
        return await self.create_notification(
            db=db,
            user_id=user_id,
            title=title,
            message=message,
            notification_type="system_alert",
            extra_data=f"alert_type={alert_type}"
        )
    
    def add_websocket_connection(self, user_id: str, websocket):
        """Add WebSocket connection for real-time notifications."""
        self.websocket_connections[user_id] = websocket
    
    def remove_websocket_connection(self, user_id: str):
        """Remove WebSocket connection."""
        if user_id in self.websocket_connections:
            del self.websocket_connections[user_id]
