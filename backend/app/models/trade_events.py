/**
 * Trade Event Logging System
 * 
 * Comprehensive trade event logging and action tracking system.
 * Logs all trade-related events for audit, analytics, and debugging purposes.
 */

from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from enum import Enum

from app.database import Base

class TradeEventType(str, Enum):
    """Trade event types for comprehensive logging."""
    # Signal Events
    SIGNAL_GENERATED = "SIGNAL_GENERATED"
    SIGNAL_EXPIRED = "SIGNAL_EXPIRED"
    SIGNAL_CANCELLED = "SIGNAL_CANCELLED"
    
    # Approval Events
    APPROVAL_REQUESTED = "APPROVAL_REQUESTED"
    APPROVAL_GRANTED = "APPROVAL_GRANTED"
    APPROVAL_DENIED = "APPROVAL_DENIED"
    APPROVAL_EXPIRED = "APPROVAL_EXPIRED"
    
    # Execution Events
    EXECUTION_QUEUED = "EXECUTION_QUEUED"
    EXECUTION_STARTED = "EXECUTION_STARTED"
    EXECUTION_COMPLETED = "EXECUTION_COMPLETED"
    EXECUTION_FAILED = "EXECUTION_FAILED"
    EXECUTION_CANCELLED = "EXECUTION_CANCELLED"
    
    # Broker Events
    BROKER_ORDER_PLACED = "BROKER_ORDER_PLACED"
    BROKER_ORDER_FILLED = "BROKER_ORDER_FILLED"
    BROKER_ORDER_PARTIAL_FILL = "BROKER_ORDER_PARTIAL_FILL"
    BROKER_ORDER_CANCELLED = "BROKER_ORDER_CANCELLED"
    BROKER_ORDER_REJECTED = "BROKER_ORDER_REJECTED"
    BROKER_ORDER_EXPIRED = "BROKER_ORDER_EXPIRED"
    
    # Status Events
    STATUS_CHANGED = "STATUS_CHANGED"
    STATUS_UPDATED = "STATUS_UPDATED"
    
    # Risk Management Events
    RISK_CHECK_PASSED = "RISK_CHECK_PASSED"
    RISK_CHECK_FAILED = "RISK_CHECK_FAILED"
    RISK_LIMIT_EXCEEDED = "RISK_LIMIT_EXCEEDED"
    RISK_ADJUSTMENT_MADE = "RISK_ADJUSTMENT_MADE"
    
    # Notification Events
    NOTIFICATION_SENT = "NOTIFICATION_SENT"
    NOTIFICATION_DELIVERED = "NOTIFICATION_DELIVERED"
    NOTIFICATION_FAILED = "NOTIFICATION_FAILED"
    
    # Error Events
    ERROR_OCCURRED = "ERROR_OCCURRED"
    ERROR_RECOVERED = "ERROR_RECOVERED"
    
    # System Events
    SYSTEM_STARTED = "SYSTEM_STARTED"
    SYSTEM_STOPPED = "SYSTEM_STOPPED"
    SYSTEM_MAINTENANCE = "SYSTEM_MAINTENANCE"

class TradeEvent(Base):
    """Trade event logging model for comprehensive audit trail."""
    
    __tablename__ = "trade_events"
    
    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Foreign Keys
    trade_id = Column(UUID(as_uuid=True), ForeignKey("trades.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    formula_id = Column(UUID(as_uuid=True), ForeignKey("formulas.id"), nullable=True)
    broker_account_id = Column(UUID(as_uuid=True), ForeignKey("broker_accounts.id"), nullable=True)
    
    # Event Details
    event_type = Column(String(50), nullable=False)
    event_category = Column(String(50), nullable=False)  # SIGNAL, APPROVAL, EXECUTION, etc.
    event_severity = Column(String(20), nullable=False)    # INFO, WARNING, ERROR, CRITICAL
    
    # Event Data
    event_data = Column(JSON, nullable=True)
    event_message = Column(Text, nullable=True)
    event_source = Column(String(100), nullable=True)    # SYSTEM, USER, BROKER, etc.
    
    # Context Information
    session_id = Column(String(100), nullable=True)
    request_id = Column(String(100), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Performance Metrics
    execution_time_ms = Column(Integer, nullable=True)
    memory_usage_mb = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    trade = relationship("Trade", back_populates="events")
    user = relationship("User", back_populates="trade_events")
    formula = relationship("Formula", back_populates="trade_events")
    broker_account = relationship("BrokerAccount", back_populates="trade_events")
    
    # Indexes
    __table_args__ = (
        Index("idx_trade_events_trade_id", "trade_id"),
        Index("idx_trade_events_user_id", "user_id"),
        Index("idx_trade_events_event_type", "event_type"),
        Index("idx_trade_events_created_at", "created_at"),
        Index("idx_trade_events_event_category", "event_category"),
        Index("idx_trade_events_event_severity", "event_severity"),
        Index("idx_trade_events_trade_user", "trade_id", "user_id"),
        Index("idx_trade_events_type_created", "event_type", "created_at"),
    )
    
    def __repr__(self):
        return f"<TradeEvent(id={self.id}, type={self.event_type}, trade_id={self.trade_id})>"

class TradeEventLogger:
    """Trade event logger for comprehensive event tracking."""
    
    def __init__(self, db_session):
        self.db = db_session
    
    async def log_signal_generated(self, trade_id: str, user_id: str, formula_id: str, signal_data: dict):
        """Log signal generation event."""
        event = TradeEvent(
            trade_id=trade_id,
            user_id=user_id,
            formula_id=formula_id,
            event_type=TradeEventType.SIGNAL_GENERATED,
            event_category="SIGNAL",
            event_severity="INFO",
            event_data=signal_data,
            event_message=f"Signal generated for trade {trade_id}",
            event_source="SYSTEM"
        )
        self.db.add(event)
        self.db.commit()
    
    async def log_approval_requested(self, trade_id: str, user_id: str, approval_data: dict):
        """Log approval request event."""
        event = TradeEvent(
            trade_id=trade_id,
            user_id=user_id,
            event_type=TradeEventType.APPROVAL_REQUESTED,
            event_category="APPROVAL",
            event_severity="INFO",
            event_data=approval_data,
            event_message=f"Approval requested for trade {trade_id}",
            event_source="USER"
        )
        self.db.add(event)
        self.db.commit()
    
    async def log_approval_granted(self, trade_id: str, user_id: str, approval_data: dict):
        """Log approval granted event."""
        event = TradeEvent(
            trade_id=trade_id,
            user_id=user_id,
            event_type=TradeEventType.APPROVAL_GRANTED,
            event_category="APPROVAL",
            event_severity="INFO",
            event_data=approval_data,
            event_message=f"Approval granted for trade {trade_id}",
            event_source="USER"
        )
        self.db.add(event)
        self.db.commit()
    
    async def log_approval_denied(self, trade_id: str, user_id: str, rejection_data: dict):
        """Log approval denied event."""
        event = TradeEvent(
            trade_id=trade_id,
            user_id=user_id,
            event_type=TradeEventType.APPROVAL_DENIED,
            event_category="APPROVAL",
            event_severity="INFO",
            event_data=rejection_data,
            event_message=f"Approval denied for trade {trade_id}",
            event_source="USER"
        )
        self.db.add(event)
        self.db.commit()
    
    async def log_execution_started(self, trade_id: str, user_id: str, broker_account_id: str, execution_data: dict):
        """Log execution started event."""
        event = TradeEvent(
            trade_id=trade_id,
            user_id=user_id,
            broker_account_id=broker_account_id,
            event_type=TradeEventType.EXECUTION_STARTED,
            event_category="EXECUTION",
            event_severity="INFO",
            event_data=execution_data,
            event_message=f"Execution started for trade {trade_id}",
            event_source="SYSTEM"
        )
        self.db.add(event)
        self.db.commit()
    
    async def log_execution_completed(self, trade_id: str, user_id: str, broker_account_id: str, execution_result: dict):
        """Log execution completed event."""
        event = TradeEvent(
            trade_id=trade_id,
            user_id=user_id,
            broker_account_id=broker_account_id,
            event_type=TradeEventType.EXECUTION_COMPLETED,
            event_category="EXECUTION",
            event_severity="INFO",
            event_data=execution_result,
            event_message=f"Execution completed for trade {trade_id}",
            event_source="BROKER"
        )
        self.db.add(event)
        self.db.commit()
    
    async def log_execution_failed(self, trade_id: str, user_id: str, broker_account_id: str, error_data: dict):
        """Log execution failed event."""
        event = TradeEvent(
            trade_id=trade_id,
            user_id=user_id,
            broker_account_id=broker_account_id,
            event_type=TradeEventType.EXECUTION_FAILED,
            event_category="EXECUTION",
            event_severity="ERROR",
            event_data=error_data,
            event_message=f"Execution failed for trade {trade_id}",
            event_source="BROKER"
        )
        self.db.add(event)
        self.db.commit()
    
    async def log_broker_order_placed(self, trade_id: str, user_id: str, broker_account_id: str, order_data: dict):
        """Log broker order placed event."""
        event = TradeEvent(
            trade_id=trade_id,
            user_id=user_id,
            broker_account_id=broker_account_id,
            event_type=TradeEventType.BROKER_ORDER_PLACED,
            event_category="BROKER",
            event_severity="INFO",
            event_data=order_data,
            event_message=f"Broker order placed for trade {trade_id}",
            event_source="BROKER"
        )
        self.db.add(event)
        self.db.commit()
    
    async def log_broker_order_filled(self, trade_id: str, user_id: str, broker_account_id: str, fill_data: dict):
        """Log broker order filled event."""
        event = TradeEvent(
            trade_id=trade_id,
            user_id=user_id,
            broker_account_id=broker_account_id,
            event_type=TradeEventType.BROKER_ORDER_FILLED,
            event_category="BROKER",
            event_severity="INFO",
            event_data=fill_data,
            event_message=f"Broker order filled for trade {trade_id}",
            event_source="BROKER"
        )
        self.db.add(event)
        self.db.commit()
    
    async def log_risk_check_failed(self, trade_id: str, user_id: str, risk_data: dict):
        """Log risk check failed event."""
        event = TradeEvent(
            trade_id=trade_id,
            user_id=user_id,
            event_type=TradeEventType.RISK_CHECK_FAILED,
            event_category="RISK",
            event_severity="WARNING",
            event_data=risk_data,
            event_message=f"Risk check failed for trade {trade_id}",
            event_source="SYSTEM"
        )
        self.db.add(event)
        self.db.commit()
    
    async def log_error_occurred(self, trade_id: str, user_id: str, error_data: dict):
        """Log error occurred event."""
        event = TradeEvent(
            trade_id=trade_id,
            user_id=user_id,
            event_type=TradeEventType.ERROR_OCCURRED,
            event_category="ERROR",
            event_severity="ERROR",
            event_data=error_data,
            event_message=f"Error occurred for trade {trade_id}",
            event_source="SYSTEM"
        )
        self.db.add(event)
        self.db.commit()
    
    async def log_notification_sent(self, trade_id: str, user_id: str, notification_data: dict):
        """Log notification sent event."""
        event = TradeEvent(
            trade_id=trade_id,
            user_id=user_id,
            event_type=TradeEventType.NOTIFICATION_SENT,
            event_category="NOTIFICATION",
            event_severity="INFO",
            event_data=notification_data,
            event_message=f"Notification sent for trade {trade_id}",
            event_source="SYSTEM"
        )
        self.db.add(event)
        self.db.commit()
    
    async def log_custom_event(self, trade_id: str, user_id: str, event_type: str, event_data: dict, 
                              event_category: str = "CUSTOM", event_severity: str = "INFO", 
                              event_message: str = None, event_source: str = "USER"):
        """Log custom event."""
        event = TradeEvent(
            trade_id=trade_id,
            user_id=user_id,
            event_type=event_type,
            event_category=event_category,
            event_severity=event_severity,
            event_data=event_data,
            event_message=event_message or f"Custom event {event_type} for trade {trade_id}",
            event_source=event_source
        )
        self.db.add(event)
        self.db.commit()

class TradeEventAnalytics:
    """Trade event analytics for performance monitoring and insights."""
    
    def __init__(self, db_session):
        self.db = db_session
    
    async def get_event_summary(self, user_id: str, start_date: datetime = None, end_date: datetime = None):
        """Get event summary for a user."""
        query = self.db.query(TradeEvent).filter(TradeEvent.user_id == user_id)
        
        if start_date:
            query = query.filter(TradeEvent.created_at >= start_date)
        if end_date:
            query = query.filter(TradeEvent.created_at <= end_date)
        
        events = query.all()
        
        summary = {
            "total_events": len(events),
            "events_by_type": {},
            "events_by_category": {},
            "events_by_severity": {},
            "events_by_source": {},
            "error_count": 0,
            "warning_count": 0,
            "info_count": 0,
            "critical_count": 0
        }
        
        for event in events:
            # Count by type
            summary["events_by_type"][event.event_type] = summary["events_by_type"].get(event.event_type, 0) + 1
            
            # Count by category
            summary["events_by_category"][event.event_category] = summary["events_by_category"].get(event.event_category, 0) + 1
            
            # Count by severity
            summary["events_by_severity"][event.event_severity] = summary["events_by_severity"].get(event.event_severity, 0) + 1
            
            # Count by source
            summary["events_by_source"][event.event_source] = summary["events_by_source"].get(event.event_source, 0) + 1
            
            # Count severity levels
            if event.event_severity == "ERROR":
                summary["error_count"] += 1
            elif event.event_severity == "WARNING":
                summary["warning_count"] += 1
            elif event.event_severity == "INFO":
                summary["info_count"] += 1
            elif event.event_severity == "CRITICAL":
                summary["critical_count"] += 1
        
        return summary
    
    async def get_approval_analytics(self, user_id: str, start_date: datetime = None, end_date: datetime = None):
        """Get approval analytics for a user."""
        query = self.db.query(TradeEvent).filter(
            TradeEvent.user_id == user_id,
            TradeEvent.event_category == "APPROVAL"
        )
        
        if start_date:
            query = query.filter(TradeEvent.created_at >= start_date)
        if end_date:
            query = query.filter(TradeEvent.created_at <= end_date)
        
        events = query.all()
        
        analytics = {
            "total_approval_requests": 0,
            "total_approvals_granted": 0,
            "total_approvals_denied": 0,
            "approval_rate": 0,
            "average_approval_time_minutes": 0,
            "approvals_by_hour": {},
            "approvals_by_day": {}
        }
        
        approval_requests = []
        approval_granted = []
        approval_denied = []
        
        for event in events:
            if event.event_type == TradeEventType.APPROVAL_REQUESTED:
                approval_requests.append(event)
            elif event.event_type == TradeEventType.APPROVAL_GRANTED:
                approval_granted.append(event)
            elif event.event_type == TradeEventType.APPROVAL_DENIED:
                approval_denied.append(event)
        
        analytics["total_approval_requests"] = len(approval_requests)
        analytics["total_approvals_granted"] = len(approval_granted)
        analytics["total_approvals_denied"] = len(approval_denied)
        
        if len(approval_requests) > 0:
            analytics["approval_rate"] = (len(approval_granted) / len(approval_requests)) * 100
        
        # Calculate average approval time
        approval_times = []
        for granted in approval_granted:
            # Find corresponding request
            for request in approval_requests:
                if request.trade_id == granted.trade_id:
                    time_diff = granted.created_at - request.created_at
                    approval_times.append(time_diff.total_seconds() / 60)  # Convert to minutes
                    break
        
        if approval_times:
            analytics["average_approval_time_minutes"] = sum(approval_times) / len(approval_times)
        
        # Count approvals by hour and day
        for event in approval_granted:
            hour = event.created_at.hour
            day = event.created_at.strftime("%Y-%m-%d")
            
            analytics["approvals_by_hour"][hour] = analytics["approvals_by_hour"].get(hour, 0) + 1
            analytics["approvals_by_day"][day] = analytics["approvals_by_day"].get(day, 0) + 1
        
        return analytics
    
    async def get_execution_analytics(self, user_id: str, start_date: datetime = None, end_date: datetime = None):
        """Get execution analytics for a user."""
        query = self.db.query(TradeEvent).filter(
            TradeEvent.user_id == user_id,
            TradeEvent.event_category == "EXECUTION"
        )
        
        if start_date:
            query = query.filter(TradeEvent.created_at >= start_date)
        if end_date:
            query = query.filter(TradeEvent.created_at <= end_date)
        
        events = query.all()
        
        analytics = {
            "total_executions_started": 0,
            "total_executions_completed": 0,
            "total_executions_failed": 0,
            "execution_success_rate": 0,
            "average_execution_time_ms": 0,
            "executions_by_broker": {},
            "execution_failures_by_reason": {}
        }
        
        executions_started = []
        executions_completed = []
        executions_failed = []
        
        for event in events:
            if event.event_type == TradeEventType.EXECUTION_STARTED:
                executions_started.append(event)
            elif event.event_type == TradeEventType.EXECUTION_COMPLETED:
                executions_completed.append(event)
            elif event.event_type == TradeEventType.EXECUTION_FAILED:
                executions_failed.append(event)
        
        analytics["total_executions_started"] = len(executions_started)
        analytics["total_executions_completed"] = len(executions_completed)
        analytics["total_executions_failed"] = len(executions_failed)
        
        if len(executions_started) > 0:
            analytics["execution_success_rate"] = (len(executions_completed) / len(executions_started)) * 100
        
        # Calculate average execution time
        execution_times = []
        for completed in executions_completed:
            # Find corresponding started event
            for started in executions_started:
                if started.trade_id == completed.trade_id:
                    time_diff = completed.created_at - started.created_at
                    execution_times.append(time_diff.total_seconds() * 1000)  # Convert to milliseconds
                    break
        
        if execution_times:
            analytics["average_execution_time_ms"] = sum(execution_times) / len(execution_times)
        
        # Count executions by broker
        for event in executions_completed:
            broker_id = event.broker_account_id
            analytics["executions_by_broker"][broker_id] = analytics["executions_by_broker"].get(broker_id, 0) + 1
        
        # Count execution failures by reason
        for event in executions_failed:
            failure_reason = event.event_data.get("reason", "Unknown") if event.event_data else "Unknown"
            analytics["execution_failures_by_reason"][failure_reason] = analytics["execution_failures_by_reason"].get(failure_reason, 0) + 1
        
        return analytics
    
    async def get_error_analytics(self, user_id: str, start_date: datetime = None, end_date: datetime = None):
        """Get error analytics for a user."""
        query = self.db.query(TradeEvent).filter(
            TradeEvent.user_id == user_id,
            TradeEvent.event_severity.in_(["ERROR", "CRITICAL"])
        )
        
        if start_date:
            query = query.filter(TradeEvent.created_at >= start_date)
        if end_date:
            query = query.filter(TradeEvent.created_at <= end_date)
        
        events = query.all()
        
        analytics = {
            "total_errors": len(events),
            "errors_by_type": {},
            "errors_by_category": {},
            "errors_by_source": {},
            "error_trend": {},
            "most_common_errors": []
        }
        
        for event in events:
            # Count by type
            analytics["errors_by_type"][event.event_type] = analytics["errors_by_type"].get(event.event_type, 0) + 1
            
            # Count by category
            analytics["errors_by_category"][event.event_category] = analytics["errors_by_category"].get(event.event_category, 0) + 1
            
            # Count by source
            analytics["errors_by_source"][event.event_source] = analytics["errors_by_source"].get(event.event_source, 0) + 1
            
            # Count by date
            date = event.created_at.strftime("%Y-%m-%d")
            analytics["error_trend"][date] = analytics["error_trend"].get(date, 0) + 1
        
        # Get most common errors
        error_counts = {}
        for event in events:
            error_message = event.event_message or "Unknown error"
            error_counts[error_message] = error_counts.get(error_message, 0) + 1
        
        analytics["most_common_errors"] = sorted(
            error_counts.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:10]
        
        return analytics

# Export classes and enums
__all__ = [
    "TradeEvent",
    "TradeEventType", 
    "TradeEventLogger",
    "TradeEventAnalytics"
]
