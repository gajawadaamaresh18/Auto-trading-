"""
Celery Tasks for Formula Engine

This module contains Celery tasks for scheduling and executing
formula evaluations in the background.
"""

from celery import Celery
from celery.schedules import crontab
from datetime import datetime, timezone
import logging

from app.services.formula_engine import FormulaEngine
from app.services.market_data_service import MarketDataService
from app.services.broker_service import BrokerService
from app.services.notification_service import NotificationService
from app.core.config import get_settings

# Configure logging
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# Initialize Celery app
celery_app = Celery(
    'formula_engine',
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=['app.tasks.formula_tasks']
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes
    task_soft_time_limit=240,  # 4 minutes
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_disable_rate_limits=True,
)

# Beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    'evaluate-formulas-every-5-minutes': {
        'task': 'app.tasks.formula_tasks.evaluate_all_formulas',
        'schedule': crontab(minute='*/5'),  # Every 5 minutes
    },
    'evaluate-formulas-market-open': {
        'task': 'app.tasks.formula_tasks.evaluate_all_formulas',
        'schedule': crontab(hour=9, minute=30),  # Market open
    },
    'evaluate-formulas-market-close': {
        'task': 'app.tasks.formula_tasks.evaluate_all_formulas',
        'schedule': crontab(hour=16, minute=0),  # Market close
    },
    'cleanup-old-tasks': {
        'task': 'app.tasks.formula_tasks.cleanup_old_tasks',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
    },
}

celery_app.conf.timezone = 'UTC'


@celery_app.task(bind=True, name='app.tasks.formula_tasks.evaluate_all_formulas')
def evaluate_all_formulas(self):
    """
    Celery task to evaluate all active formulas.
    
    This task runs every 5 minutes during market hours and evaluates
    all subscribed formulas for all users.
    
    Returns:
        Dict containing evaluation results
    """
    task_id = self.request.id
    logger.info(f"Starting formula evaluation task {task_id}")
    
    try:
        # Initialize services
        market_data_service = MarketDataService()
        broker_service = BrokerService()
        notification_service = NotificationService()
        
        # Initialize formula engine
        engine = FormulaEngine(
            market_data_service=market_data_service,
            broker_service=broker_service,
            notification_service=notification_service,
            celery_app=celery_app
        )
        
        # Run evaluation (this is async, so we need to handle it properly)
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(engine.evaluate_all_formulas())
            logger.info(f"Formula evaluation task {task_id} completed successfully")
            return result
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"Formula evaluation task {task_id} failed: {e}")
        # Update task state
        self.update_state(
            state='FAILURE',
            meta={'error': str(e), 'task_id': task_id}
        )
        raise


@celery_app.task(bind=True, name='app.tasks.formula_tasks.evaluate_user_formulas')
def evaluate_user_formulas(self, user_id: str):
    """
    Celery task to evaluate formulas for a specific user.
    
    Args:
        user_id: User ID to evaluate formulas for
        
    Returns:
        Dict containing evaluation results for the user
    """
    task_id = self.request.id
    logger.info(f"Starting user formula evaluation task {task_id} for user {user_id}")
    
    try:
        # Initialize services
        market_data_service = MarketDataService()
        broker_service = BrokerService()
        notification_service = NotificationService()
        
        # Initialize formula engine
        engine = FormulaEngine(
            market_data_service=market_data_service,
            broker_service=broker_service,
            notification_service=notification_service,
            celery_app=celery_app
        )
        
        # Run evaluation
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(engine.evaluate_single_formula(user_id, None))
            logger.info(f"User formula evaluation task {task_id} completed successfully")
            return result
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"User formula evaluation task {task_id} failed: {e}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(e), 'task_id': task_id, 'user_id': user_id}
        )
        raise


@celery_app.task(bind=True, name='app.tasks.formula_tasks.evaluate_single_formula')
def evaluate_single_formula(self, user_id: str, formula_id: str):
    """
    Celery task to evaluate a single formula for a specific user.
    
    Args:
        user_id: User ID
        formula_id: Formula ID
        
    Returns:
        Dict containing evaluation results
    """
    task_id = self.request.id
    logger.info(f"Starting single formula evaluation task {task_id} for user {user_id}, formula {formula_id}")
    
    try:
        # Initialize services
        market_data_service = MarketDataService()
        broker_service = BrokerService()
        notification_service = NotificationService()
        
        # Initialize formula engine
        engine = FormulaEngine(
            market_data_service=market_data_service,
            broker_service=broker_service,
            notification_service=notification_service,
            celery_app=celery_app
        )
        
        # Run evaluation
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(engine.evaluate_single_formula(user_id, formula_id))
            logger.info(f"Single formula evaluation task {task_id} completed successfully")
            return result
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"Single formula evaluation task {task_id} failed: {e}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(e), 'task_id': task_id, 'user_id': user_id, 'formula_id': formula_id}
        )
        raise


@celery_app.task(bind=True, name='app.tasks.formula_tasks.cleanup_old_tasks')
def cleanup_old_tasks(self):
    """
    Celery task to cleanup old task results and logs.
    
    This task runs daily to clean up old task results and logs
    to prevent database bloat.
    """
    task_id = self.request.id
    logger.info(f"Starting cleanup task {task_id}")
    
    try:
        from app.core.database import get_db_session
        from app.models import Notification
        from sqlalchemy.orm import Session
        from datetime import datetime, timedelta
        
        # Clean up old notifications (older than 30 days)
        db = next(get_db_session())
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=30)
        
        old_notifications = db.query(Notification).filter(
            Notification.created_at < cutoff_date
        ).delete()
        
        db.commit()
        db.close()
        
        logger.info(f"Cleanup task {task_id} completed. Deleted {old_notifications} old notifications")
        
        return {
            'deleted_notifications': old_notifications,
            'cutoff_date': cutoff_date.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Cleanup task {task_id} failed: {e}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(e), 'task_id': task_id}
        )
        raise


@celery_app.task(bind=True, name='app.tasks.formula_tasks.health_check')
def health_check(self):
    """
    Celery task to perform health check on the formula engine.
    
    This task can be used to monitor the health of the formula engine
    and its dependencies.
    """
    task_id = self.request.id
    logger.info(f"Starting health check task {task_id}")
    
    try:
        # Initialize services
        market_data_service = MarketDataService()
        broker_service = BrokerService()
        notification_service = NotificationService()
        
        # Initialize formula engine
        engine = FormulaEngine(
            market_data_service=market_data_service,
            broker_service=broker_service,
            notification_service=notification_service,
            celery_app=celery_app
        )
        
        # Get engine status
        status = engine.get_engine_status()
        
        # Test market data service
        try:
            test_data = market_data_service.get_latest_data('AAPL')
            status['market_data_test'] = 'success'
        except Exception as e:
            status['market_data_test'] = f'failed: {e}'
        
        # Test broker service
        try:
            broker_status = broker_service.get_status()
            status['broker_test'] = 'success'
        except Exception as e:
            status['broker_test'] = f'failed: {e}'
        
        # Test notification service
        try:
            notification_status = notification_service.get_status()
            status['notification_test'] = 'success'
        except Exception as e:
            status['notification_test'] = f'failed: {e}'
        
        logger.info(f"Health check task {task_id} completed successfully")
        return status
        
    except Exception as e:
        logger.error(f"Health check task {task_id} failed: {e}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(e), 'task_id': task_id}
        )
        raise


@celery_app.task(bind=True, name='app.tasks.formula_tasks.manual_evaluation')
def manual_evaluation(self, user_id: str = None, formula_id: str = None):
    """
    Celery task for manual formula evaluation.
    
    This task can be triggered manually for testing or debugging purposes.
    
    Args:
        user_id: Optional user ID to evaluate formulas for
        formula_id: Optional formula ID to evaluate
        
    Returns:
        Dict containing evaluation results
    """
    task_id = self.request.id
    logger.info(f"Starting manual evaluation task {task_id}")
    
    try:
        # Initialize services
        market_data_service = MarketDataService()
        broker_service = BrokerService()
        notification_service = NotificationService()
        
        # Initialize formula engine
        engine = FormulaEngine(
            market_data_service=market_data_service,
            broker_service=broker_service,
            notification_service=notification_service,
            celery_app=celery_app
        )
        
        # Run evaluation
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            if user_id and formula_id:
                result = loop.run_until_complete(engine.evaluate_single_formula(user_id, formula_id))
            elif user_id:
                result = loop.run_until_complete(engine.evaluate_single_formula(user_id, None))
            else:
                result = loop.run_until_complete(engine.evaluate_all_formulas())
            
            logger.info(f"Manual evaluation task {task_id} completed successfully")
            return result
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"Manual evaluation task {task_id} failed: {e}")
        self.update_state(
            state='FAILURE',
            meta={'error': str(e), 'task_id': task_id}
        )
        raise


# Task monitoring and management functions
def get_task_status(task_id: str) -> dict:
    """Get the status of a specific task."""
    try:
        result = celery_app.AsyncResult(task_id)
        return {
            'task_id': task_id,
            'status': result.status,
            'result': result.result,
            'traceback': result.traceback
        }
    except Exception as e:
        return {'error': str(e)}


def cancel_task(task_id: str) -> bool:
    """Cancel a running task."""
    try:
        celery_app.control.revoke(task_id, terminate=True)
        return True
    except Exception as e:
        logger.error(f"Error canceling task {task_id}: {e}")
        return False


def get_active_tasks() -> list:
    """Get list of active tasks."""
    try:
        inspect = celery_app.control.inspect()
        active_tasks = inspect.active()
        return active_tasks
    except Exception as e:
        logger.error(f"Error getting active tasks: {e}")
        return []


def get_scheduled_tasks() -> list:
    """Get list of scheduled tasks."""
    try:
        inspect = celery_app.control.inspect()
        scheduled_tasks = inspect.scheduled()
        return scheduled_tasks
    except Exception as e:
        logger.error(f"Error getting scheduled tasks: {e}")
        return []


# Export the Celery app
__all__ = ['celery_app', 'evaluate_all_formulas', 'evaluate_user_formulas', 
           'evaluate_single_formula', 'cleanup_old_tasks', 'health_check', 
           'manual_evaluation', 'get_task_status', 'cancel_task', 
           'get_active_tasks', 'get_scheduled_tasks']
