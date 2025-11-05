"""
Backend Test Configuration and Fixtures

Comprehensive test configuration with fixtures for database,
authentication, broker mocking, and API testing.
"""

import pytest
import pytest_asyncio
import asyncio
from typing import Generator, AsyncGenerator
from unittest.mock import Mock, AsyncMock, patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient
from httpx import AsyncClient
from uuid import uuid4
from datetime import datetime

from app.main import app
from app.core.database import get_db
from app.core.security import hash_password
from app.models import Base, User, Formula, Subscription, Trade, BrokerAccount, Review
from app.services.auth_service import AuthService
from app.services.broker_validation_service import BrokerValidationService
from app.services.formula_engine import FormulaEngine
from app.services.market_data_service import MarketDataService
from app.services.notification_service import NotificationService
from app.integrations.brokers.indian_brokers import BaseIndianBroker

# Test database configuration
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Create a fresh database session for each test."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        # Drop tables
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """Create a test client with database dependency override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def async_client(db_session: Session) -> TestClient:
    """Create a test client for API testing (synchronous TestClient)."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session: Session) -> User:
    """Create a test user."""
    user = User(
        id=uuid4(),
        email="test@example.com",
        username="testuser",
        full_name="Test User",
        hashed_password=hash_password("testpassword123"),
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_formula(db_session: Session, test_user: User) -> Formula:
    """Create a test formula."""
    formula = Formula(
        id=uuid4(),
        creator_id=test_user.id,
        name="Test Formula",
        description="A test trading formula",
        category="momentum",
        formula_code='{"blocks": [], "connections": []}',
        parameters='{"period": 14}',
        version="1.0.0",
        is_free=True,
        price_per_month=9.99,
        price_per_year=99.99,
        status="published",
        performance_score=85.5,
        risk_score=65.2,
        total_subscribers=100,
        total_trades=500
    )
    db_session.add(formula)
    db_session.commit()
    db_session.refresh(formula)
    return formula


@pytest.fixture
def test_subscription(db_session: Session, test_user: User, test_formula: Formula) -> Subscription:
    """Create a test subscription."""
    subscription = Subscription(
        id=uuid4(),
        user_id=test_user.id,
        formula_id=test_formula.id,
        is_active=True,
        execution_mode="manual",
        paper_mode=True
    )
    db_session.add(subscription)
    db_session.commit()
    db_session.refresh(subscription)
    return subscription


@pytest.fixture
def test_broker_account(db_session: Session, test_user: User) -> BrokerAccount:
    """Create a test broker account."""
    broker_account = BrokerAccount(
        id=uuid4(),
        user_id=test_user.id,
        broker_type="zerodha",
        account_id="test-account-id",
        encrypted_credentials='{"api_key": "encrypted_key"}',
        is_active=True,
        is_primary=True,
        last_sync_at=datetime(2023, 1, 1, 0, 0, 0)
    )
    db_session.add(broker_account)
    db_session.commit()
    db_session.refresh(broker_account)
    return broker_account


@pytest.fixture
def test_trade(db_session: Session, test_user: User, test_subscription: Subscription, test_formula: Formula) -> Trade:
    """Create a test trade."""
    trade = Trade(
        id=uuid4(),
        user_id=test_user.id,
        subscription_id=test_subscription.id,
        formula_id=test_formula.id,
        symbol="RELIANCE",
        side="buy",
        quantity=100,
        price=2500.0,
        status="pending",
        order_type="market",
        execution_mode="manual"
    )
    db_session.add(trade)
    db_session.commit()
    db_session.refresh(trade)
    return trade


@pytest.fixture
def test_review(db_session: Session, test_user: User, test_formula: Formula) -> Review:
    """Create a test review."""
    review = Review(
        id=uuid4(),
        reviewer_id=test_user.id,
        formula_id=test_formula.id,
        formula_creator_id=test_formula.creator_id,
        rating=5,
        title="Great formula!",
        content="This formula works really well for my trading strategy."
    )
    db_session.add(review)
    db_session.commit()
    db_session.refresh(review)
    return review


@pytest.fixture
def auth_token(test_user: User) -> str:
    """Create an authentication token for testing."""
    return AuthService.create_access_token({"sub": str(test_user.id)})


@pytest.fixture
def auth_headers(auth_token: str) -> dict:
    """Create authentication headers for testing."""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture
def mock_broker() -> Mock:
    """Create a mock broker for testing."""
    broker = Mock(spec=BaseIndianBroker)
    broker.connect = AsyncMock(return_value=True)
    broker.disconnect = AsyncMock(return_value=True)
    broker.place_order = AsyncMock(return_value={
        "order_id": "test-order-id",
        "status": "pending",
        "message": "Order placed successfully"
    })
    broker.get_order_status = AsyncMock(return_value={
        "order_id": "test-order-id",
        "status": "filled",
        "filled_quantity": 100,
        "pending_quantity": 0
    })
    broker.cancel_order = AsyncMock(return_value=True)
    broker.get_positions = AsyncMock(return_value=[])
    broker.get_holdings = AsyncMock(return_value=[])
    broker.get_margins = AsyncMock(return_value={
        "available_cash": 100000,
        "used_margin": 50000,
        "total_margin": 150000
    })
    broker.get_profile = AsyncMock(return_value={
        "user_id": "test-user-id",
        "name": "Test User",
        "email": "test@example.com"
    })
    return broker


@pytest.fixture
def mock_broker_validation_service() -> Mock:
    """Create a mock broker validation service."""
    service = Mock(spec=BrokerValidationService)
    service.validate_broker_credentials = AsyncMock(return_value={
        "success": True,
        "message": "Credentials validated successfully",
        "broker_type": "zerodha",
        "profile": {
            "user_id": "test-user-id",
            "name": "Test User"
        }
    })
    return service


@pytest.fixture
def mock_market_data_service() -> Mock:
    """Create a mock market data service."""
    service = Mock(spec=MarketDataService)
    service.get_real_time_quote = AsyncMock(return_value={
        "symbol": "RELIANCE",
        "price": 2500.0,
        "change": 25.0,
        "change_percent": 1.01,
        "volume": 1000000,
        "timestamp": "2023-01-01T10:00:00Z"
    })
    service.get_historical_data = AsyncMock(return_value=[
        {
            "timestamp": "2023-01-01T09:00:00Z",
            "open": 2480.0,
            "high": 2510.0,
            "low": 2475.0,
            "close": 2500.0,
            "volume": 1000000
        }
    ])
    service.calculate_technical_indicators = AsyncMock(return_value={
        "sma_20": 2480.0,
        "rsi_14": 65.5,
        "macd": 15.2,
        "bollinger_upper": 2520.0,
        "bollinger_lower": 2440.0
    })
    return service


@pytest.fixture
def mock_notification_service() -> Mock:
    """Create a mock notification service."""
    service = Mock(spec=NotificationService)
    service.send_notification = AsyncMock(return_value=True)
    service.send_trade_alert = AsyncMock(return_value=True)
    service.send_formula_update = AsyncMock(return_value=True)
    service.send_system_alert = AsyncMock(return_value=True)
    return service


@pytest.fixture
def mock_formula_engine() -> Mock:
    """Create a mock formula engine."""
    engine = Mock(spec=FormulaEngine)
    engine.evaluate_formula = AsyncMock(return_value={
        "signal": "buy",
        "confidence": 0.85,
        "price": 2500.0,
        "stop_loss": 2450.0,
        "take_profit": 2600.0,
        "position_size": 100
    })
    engine.execute_trade = AsyncMock(return_value={
        "trade_id": "test-trade-id",
        "status": "executed",
        "execution_price": 2500.0,
        "execution_time": "2023-01-01T10:00:00Z"
    })
    return engine


@pytest.fixture
def mock_redis():
    """Create a mock Redis client."""
    with patch('app.core.redis.redis_client') as mock_redis:
        mock_redis.get = AsyncMock(return_value=None)
        mock_redis.set = AsyncMock(return_value=True)
        mock_redis.delete = AsyncMock(return_value=True)
        mock_redis.exists = AsyncMock(return_value=False)
        yield mock_redis


@pytest.fixture
def mock_celery():
    """Create a mock Celery task."""
    with patch('app.tasks.celery_app.send_task') as mock_task:
        mock_task.return_value = Mock(id='test-task-id')
        yield mock_task


@pytest.fixture
def mock_websocket():
    """Create a mock WebSocket connection."""
    with patch('app.services.websocket_service.websocket_manager') as mock_ws:
        mock_ws.send_to_user = AsyncMock()
        mock_ws.broadcast = AsyncMock()
        yield mock_ws


# Test data fixtures
@pytest.fixture
def sample_formulas_data():
    """Sample formulas data for testing."""
    return [
        {
            "id": "formula-1",
            "name": "Momentum Strategy",
            "description": "A momentum-based trading strategy",
            "category": "momentum",
            "performance_score": 85.5,
            "risk_score": 65.2,
            "total_subscribers": 1250,
            "total_trades": 3420,
            "is_free": False,
            "price_per_month": 29.99
        },
        {
            "id": "formula-2",
            "name": "Mean Reversion",
            "description": "A mean reversion strategy",
            "category": "mean_reversion",
            "performance_score": 78.3,
            "risk_score": 45.1,
            "total_subscribers": 890,
            "total_trades": 2100,
            "is_free": True,
            "price_per_month": None
        }
    ]


@pytest.fixture
def sample_market_data():
    """Sample market data for testing."""
    return {
        "symbol": "RELIANCE",
        "price": 2500.0,
        "change": 25.0,
        "change_percent": 1.01,
        "volume": 1000000,
        "timestamp": "2023-01-01T10:00:00Z",
        "indicators": {
            "sma_20": 2480.0,
            "rsi_14": 65.5,
            "macd": 15.2,
            "bollinger_upper": 2520.0,
            "bollinger_lower": 2440.0
        }
    }


@pytest.fixture
def sample_risk_settings():
    """Sample risk settings for testing."""
    return {
        "stop_loss": {
            "enabled": True,
            "type": "percentage",
            "value": 2.0,
            "trailing": False,
            "trailing_step": 0.5
        },
        "take_profit": {
            "enabled": True,
            "type": "percentage",
            "value": 4.0
        },
        "position_sizing": {
            "method": "risk_based",
            "value": 1000,
            "max_risk_per_trade": 1.0
        },
        "risk_profile": {
            "max_portfolio_risk": 5.0,
            "max_daily_loss": 2.0,
            "max_concurrent_trades": 5,
            "risk_tolerance": "medium"
        }
    }


# Test utilities
class TestUtils:
    """Utility functions for testing."""
    
    @staticmethod
    def create_test_user_data():
        """Create test user data."""
        return {
            "email": "test@example.com",
            "username": "testuser",
            "full_name": "Test User",
            "password": "testpassword123"
        }
    
    @staticmethod
    def create_test_formula_data():
        """Create test formula data."""
        return {
            "name": "Test Formula",
            "description": "A test trading formula",
            "category": "momentum",
            "formula_code": '{"blocks": [], "connections": []}',
            "parameters": '{"period": 14}',
            "is_free": True
        }
    
    @staticmethod
    def create_test_trade_data():
        """Create test trade data."""
        return {
            "symbol": "RELIANCE",
            "side": "buy",
            "quantity": 100,
            "price": 2500.0,
            "order_type": "market",
            "execution_mode": "manual"
        }


@pytest.fixture
def test_utils():
    """Provide test utilities."""
    return TestUtils


# Performance testing fixtures
@pytest.fixture
def performance_timer():
    """Timer for performance testing."""
    import time
    start_time = time.time()
    yield
    end_time = time.time()
    print(f"Test execution time: {end_time - start_time:.2f} seconds")


# Cleanup fixtures
@pytest.fixture(autouse=True)
def cleanup_test_data(db_session: Session):
    """Clean up test data after each test."""
    yield
    # Cleanup is handled by the db_session fixture
    pass
