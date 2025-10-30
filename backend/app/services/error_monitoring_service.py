"""
Backend Error Monitoring and Logging System

Comprehensive error monitoring, logging, and alerting system for the backend.
"""

import logging
import traceback
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
import uuid
import json

from sqlalchemy.orm import Session
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse

from app.core.database import get_db_session
from app.models import User
from app.utils.encryption import encrypt_sensitive_data

logger = logging.getLogger(__name__)


class ErrorSeverity(str, Enum):
    """Error severity levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ErrorCategory(str, Enum):
    """Error categories."""
    UI = "ui"
    API = "api"
    BROKER = "broker"
    FORMULA = "formula"
    TRADING = "trading"
    SYSTEM = "system"
    DATABASE = "database"
    AUTHENTICATION = "authentication"
    VALIDATION = "validation"


@dataclass
class ErrorReport:
    """Error report data structure."""
    id: str
    timestamp: str
    error: Dict[str, Any]
    context: Dict[str, Any]
    severity: ErrorSeverity
    category: ErrorCategory
    resolved: bool
    metadata: Optional[Dict[str, Any]] = None
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    request_id: Optional[str] = None


@dataclass
class ErrorStats:
    """Error statistics data structure."""
    total_errors: int
    errors_by_severity: Dict[str, int]
    errors_by_category: Dict[str, int]
    resolved_errors: int
    unresolved_errors: int
    errors_last_24h: int
    errors_last_7d: int
    top_errors: List[Dict[str, Any]]


class ErrorMonitoringService:
    """Main error monitoring service."""
    
    def __init__(self):
        self.error_reports: List[ErrorReport] = []
        self.alert_thresholds = {
            ErrorSeverity.CRITICAL: 1,
            ErrorSeverity.HIGH: 5,
            ErrorSeverity.MEDIUM: 20,
            ErrorSeverity.LOW: 100,
        }
        self.is_initialized = False
    
    def initialize(self):
        """Initialize error monitoring service."""
        if self.is_initialized:
            return
        
        # Setup logging configuration
        self._setup_logging()
        
        # Setup global exception handlers
        self._setup_exception_handlers()
        
        self.is_initialized = True
        logger.info("Error monitoring service initialized")
    
    def _setup_logging(self):
        """Setup comprehensive logging configuration."""
        # Create formatters
        detailed_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
        )
        
        # Setup file handlers
        error_handler = logging.FileHandler('logs/errors.log')
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(detailed_formatter)
        
        info_handler = logging.FileHandler('logs/app.log')
        info_handler.setLevel(logging.INFO)
        info_handler.setFormatter(detailed_formatter)
        
        # Setup console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(detailed_formatter)
        
        # Configure root logger
        root_logger = logging.getLogger()
        root_logger.setLevel(logging.INFO)
        root_logger.addHandler(error_handler)
        root_logger.addHandler(info_handler)
        root_logger.addHandler(console_handler)
    
    def _setup_exception_handlers(self):
        """Setup global exception handlers."""
        import sys
        
        def handle_exception(exc_type, exc_value, exc_traceback):
            if issubclass(exc_type, KeyboardInterrupt):
                sys.__excepthook__(exc_type, exc_value, exc_traceback)
                return
            
            self.log_error(
                error=exc_value,
                severity=ErrorSeverity.CRITICAL,
                category=ErrorCategory.SYSTEM,
                context={
                    "exception_type": exc_type.__name__,
                    "traceback": traceback.format_tb(exc_traceback),
                }
            )
        
        sys.excepthook = handle_exception
    
    def log_error(
        self,
        error: Union[Exception, str],
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        category: ErrorCategory = ErrorCategory.SYSTEM,
        context: Optional[Dict[str, Any]] = None,
        user_id: Optional[str] = None,
        session_id: Optional[str] = None,
        request_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Log an error with comprehensive context.
        
        Args:
            error: Exception or error message
            severity: Error severity level
            category: Error category
            context: Additional context information
            user_id: User ID if available
            session_id: Session ID if available
            request_id: Request ID if available
            metadata: Additional metadata
            
        Returns:
            Error report ID
        """
        try:
            error_id = f"error_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
            
            # Prepare error information
            if isinstance(error, Exception):
                error_info = {
                    "name": error.__class__.__name__,
                    "message": str(error),
                    "stack": traceback.format_exc(),
                }
            else:
                error_info = {
                    "name": "Error",
                    "message": str(error),
                    "stack": None,
                }
            
            # Create error report
            error_report = ErrorReport(
                id=error_id,
                timestamp=datetime.now(timezone.utc).isoformat(),
                error=error_info,
                context=context or {},
                severity=severity,
                category=category,
                resolved=False,
                metadata=metadata,
                user_id=user_id,
                session_id=session_id,
                request_id=request_id,
            )
            
            # Add to local storage
            self.error_reports.append(error_report)
            
            # Log to appropriate level
            self._log_to_level(error_report)
            
            # Check for alerts
            self._check_alerts(error_report)
            
            # Store in database if available
            self._store_in_database(error_report)
            
            return error_id
            
        except Exception as e:
            logger.critical(f"Failed to log error: {e}")
            return "unknown"
    
    def _log_to_level(self, error_report: ErrorReport):
        """Log error to appropriate logging level."""
        category_str = error_report.category.value if hasattr(error_report.category, 'value') else str(error_report.category)
        message = f"[{category_str}] {error_report.error['message']}"
        
        if error_report.severity == ErrorSeverity.CRITICAL:
            logger.critical(message, extra={"error_report": asdict(error_report)})
        elif error_report.severity == ErrorSeverity.HIGH:
            logger.error(message, extra={"error_report": asdict(error_report)})
        elif error_report.severity == ErrorSeverity.MEDIUM:
            logger.warning(message, extra={"error_report": asdict(error_report)})
        else:
            logger.info(message, extra={"error_report": asdict(error_report)})
    
    def _check_alerts(self, error_report: ErrorReport):
        """Check if error should trigger alerts."""
        try:
            # Count recent errors of same severity
            recent_errors = [
                report for report in self.error_reports
                if report.severity == error_report.severity
                and report.timestamp > (datetime.now(timezone.utc).timestamp() - 3600)  # Last hour
            ]
            
            threshold = self.alert_thresholds.get(error_report.severity, 0)
            
            if len(recent_errors) >= threshold:
                self._send_alert(error_report, len(recent_errors))
                
        except Exception as e:
            logger.error(f"Failed to check alerts: {e}")
    
    def _send_alert(self, error_report: ErrorReport, count: int):
        """Send alert for error threshold breach."""
        try:
            alert_message = (
                f"ALERT: {count} {error_report.severity.value} errors in the last hour. "
                f"Latest: [{error_report.category.value}] {error_report.error['message']}"
            )
            
            logger.critical(alert_message)
            
            # In production, this would send to external alerting service
            # For now, just log the alert
            
        except Exception as e:
            logger.error(f"Failed to send alert: {e}")
    
    def _store_in_database(self, error_report: ErrorReport):
        """Store error report in database."""
        try:
            # This would store in a dedicated error_reports table
            # For now, just log that it would be stored
            logger.debug(f"Would store error report {error_report.id} in database")
            
        except Exception as e:
            logger.error(f"Failed to store error report in database: {e}")
    
    def get_error_stats(self) -> ErrorStats:
        """Get comprehensive error statistics."""
        try:
            now = datetime.now(timezone.utc)
            last_24h = now.timestamp() - 86400
            last_7d = now.timestamp() - 604800
            
            # Filter recent errors
            errors_24h = [
                report for report in self.error_reports
                if datetime.fromisoformat(report.timestamp).timestamp() > last_24h
            ]
            
            errors_7d = [
                report for report in self.error_reports
                if datetime.fromisoformat(report.timestamp).timestamp() > last_7d
            ]
            
            # Calculate statistics
            total_errors = len(self.error_reports)
            resolved_errors = len([r for r in self.error_reports if r.resolved])
            unresolved_errors = total_errors - resolved_errors
            
            # Group by severity
            errors_by_severity = {}
            for severity in ErrorSeverity:
                errors_by_severity[severity.value] = len([
                    r for r in self.error_reports if r.severity == severity
                ])
            
            # Group by category
            errors_by_category = {}
            for category in ErrorCategory:
                errors_by_category[category.value] = len([
                    r for r in self.error_reports if r.category == category
                ])
            
            # Top errors (most frequent)
            error_counts = {}
            for report in self.error_reports:
                key = f"{report.category.value}:{report.error['message']}"
                error_counts[key] = error_counts.get(key, 0) + 1
            
            top_errors = [
                {"error": key, "count": count}
                for key, count in sorted(error_counts.items(), key=lambda x: x[1], reverse=True)[:10]
            ]
            
            return ErrorStats(
                total_errors=total_errors,
                errors_by_severity=errors_by_severity,
                errors_by_category=errors_by_category,
                resolved_errors=resolved_errors,
                unresolved_errors=unresolved_errors,
                errors_last_24h=len(errors_24h),
                errors_last_7d=len(errors_7d),
                top_errors=top_errors,
            )
            
        except Exception as e:
            logger.error(f"Failed to get error stats: {e}")
            return ErrorStats(
                total_errors=0,
                errors_by_severity={},
                errors_by_category={},
                resolved_errors=0,
                unresolved_errors=0,
                errors_last_24h=0,
                errors_last_7d=0,
                top_errors=[],
            )
    
    def get_error_reports(
        self,
        severity: Optional[ErrorSeverity] = None,
        category: Optional[ErrorCategory] = None,
        resolved: Optional[bool] = None,
        limit: int = 100
    ) -> List[ErrorReport]:
        """Get filtered error reports."""
        try:
            filtered_reports = self.error_reports
            
            if severity:
                filtered_reports = [r for r in filtered_reports if r.severity == severity]
            
            if category:
                filtered_reports = [r for r in filtered_reports if r.category == category]
            
            if resolved is not None:
                filtered_reports = [r for r in filtered_reports if r.resolved == resolved]
            
            # Sort by timestamp (newest first)
            filtered_reports.sort(key=lambda x: x.timestamp, reverse=True)
            
            return filtered_reports[:limit]
            
        except Exception as e:
            logger.error(f"Failed to get error reports: {e}")
            return []
    
    def resolve_error(self, error_id: str) -> bool:
        """Mark an error as resolved."""
        try:
            for report in self.error_reports:
                if report.id == error_id:
                    report.resolved = True
                    logger.info(f"Error {error_id} marked as resolved")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to resolve error {error_id}: {e}")
            return False
    
    def clear_resolved_errors(self) -> int:
        """Clear all resolved errors."""
        try:
            initial_count = len(self.error_reports)
            self.error_reports = [r for r in self.error_reports if not r.resolved]
            cleared_count = initial_count - len(self.error_reports)
            
            logger.info(f"Cleared {cleared_count} resolved errors")
            return cleared_count
            
        except Exception as e:
            logger.error(f"Failed to clear resolved errors: {e}")
            return 0


# Global error monitoring service instance
error_monitoring_service = ErrorMonitoringService()


# FastAPI exception handlers
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions."""
    error_id = error_monitoring_service.log_error(
        error=exc,
        severity=ErrorSeverity.MEDIUM,
        category=ErrorCategory.API,
        context={
            "status_code": exc.status_code,
            "detail": exc.detail,
            "url": str(request.url),
            "method": request.method,
            "headers": dict(request.headers),
        },
        request_id=request.headers.get("x-request-id"),
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "error_id": error_id,
            "status_code": exc.status_code,
        }
    )


async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions."""
    error_id = error_monitoring_service.log_error(
        error=exc,
        severity=ErrorSeverity.HIGH,
        category=ErrorCategory.API,
        context={
            "url": str(request.url),
            "method": request.method,
            "headers": dict(request.headers),
        },
        request_id=request.headers.get("x-request-id"),
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "error_id": error_id,
            "status_code": 500,
        }
    )


# Decorator for error monitoring
def monitor_errors(
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.SYSTEM
):
    """Decorator to monitor function errors."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                error_monitoring_service.log_error(
                    error=e,
                    severity=severity,
                    category=category,
                    context={
                        "function": func.__name__,
                        "module": func.__module__,
                        "args": str(args)[:500],  # Limit length
                        "kwargs": str(kwargs)[:500],  # Limit length
                    }
                )
                raise
        return wrapper
    return decorator


# Context manager for error monitoring
class ErrorContext:
    """Context manager for error monitoring."""
    
    def __init__(
        self,
        operation: str,
        severity: ErrorSeverity = ErrorSeverity.MEDIUM,
        category: ErrorCategory = ErrorCategory.SYSTEM,
        context: Optional[Dict[str, Any]] = None
    ):
        self.operation = operation
        self.severity = severity
        self.category = category
        self.context = context or {}
        self.start_time = None
    
    def __enter__(self):
        self.start_time = datetime.now(timezone.utc)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            error_monitoring_service.log_error(
                error=exc_val,
                severity=self.severity,
                category=self.category,
                context={
                    "operation": self.operation,
                    "duration": (datetime.now(timezone.utc) - self.start_time).total_seconds(),
                    **self.context,
                }
            )
        return False


# Export
__all__ = [
    "ErrorMonitoringService",
    "error_monitoring_service",
    "ErrorReport",
    "ErrorStats",
    "ErrorSeverity",
    "ErrorCategory",
    "monitor_errors",
    "ErrorContext",
    "http_exception_handler",
    "general_exception_handler",
]
