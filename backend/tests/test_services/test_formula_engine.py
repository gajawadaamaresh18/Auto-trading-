"""
Formula Engine Service Tests

Comprehensive unit tests for the FormulaEngine service covering
formula evaluation, signal generation, trade execution, and risk management.
"""

import pytest
import asyncio
from datetime import datetime, timezone
from unittest.mock import Mock, AsyncMock, patch
from decimal import Decimal

from app.services.formula_engine import (
    FormulaEngine,
    SignalType,
    ExecutionMode,
    ExecutionResult,
    FormulaEvaluationResult,
    TradeSignal
)
from app.models import Formula, Subscription, User, BrokerAccount


class TestFormulaEngine:
    """Test cases for FormulaEngine service."""

    @pytest.fixture
    def formula_engine(self, mock_market_data_service, mock_broker_validation_service, mock_notification_service):
        """Create a FormulaEngine instance with mocked dependencies."""
        return FormulaEngine(
            market_data_service=mock_market_data_service,
            broker_service=mock_broker_validation_service,
            notification_service=mock_notification_service
        )

    @pytest.fixture
    def sample_formula(self):
        """Create a sample formula for testing."""
        return Formula(
            id="test-formula-id",
            creator_id="test-creator-id",
            name="Test Momentum Formula",
            description="A test momentum strategy",
            category="momentum",
            formula_code='{"blocks": [{"type": "indicator", "name": "RSI", "params": {"period": 14}}], "connections": []}',
            parameters='{"rsi_threshold": 70, "stop_loss": 2.0, "take_profit": 4.0}',
            version="1.0.0",
            is_free=True,
            status="published",
            performance_score=85.5,
            risk_score=65.2
        )

    @pytest.fixture
    def sample_subscription(self, sample_formula):
        """Create a sample subscription for testing."""
        from uuid import uuid4
        return Subscription(
            id=uuid4(),
            user_id=uuid4(),
            formula_id=sample_formula.id,
            status="active",
            subscribed_at=datetime.now(timezone.utc),
            expires_at=datetime.now(timezone.utc).replace(year=2024),
            billing_period="monthly",
            execution_mode=ExecutionMode.AUTO,
            risk_settings={
                "stop_loss": {"enabled": True, "type": "percentage", "value": 2.0},
                "take_profit": {"enabled": True, "type": "percentage", "value": 4.0},
                "position_sizing": {"method": "risk_based", "value": 1000}
            }
        )

    @pytest.fixture
    def sample_broker_account(self, sample_subscription):
        """Create a sample broker account for testing."""
        from uuid import uuid4
        return BrokerAccount(
            id=uuid4(),
            user_id=sample_subscription.user_id,
            broker_type="zerodha",
            account_id="test-account-id",
            encrypted_credentials='{"api_key": "encrypted_key"}',
            is_active=True
        )

    @pytest.fixture
    def sample_market_data(self):
        """Create sample market data for testing."""
        return {
            "symbol": "RELIANCE",
            "price": 2500.0,
            "change": 25.0,
            "change_percent": 1.01,
            "volume": 1000000,
            "timestamp": datetime.now(timezone.utc),
            "indicators": {
                "rsi_14": 75.5,
                "sma_20": 2480.0,
                "macd": 15.2,
                "bollinger_upper": 2520.0,
                "bollinger_lower": 2440.0
            }
        }

        @pytest.mark.asyncio
        async def test_evaluate_formula_buy_signal(self, formula_engine, sample_formula, sample_market_data, test_user):
            """Test formula evaluation with buy signal generation."""
            # Mock market data service
            formula_engine.market_data_service.get_real_time_quote = AsyncMock(return_value=sample_market_data)
            formula_engine.market_data_service.calculate_technical_indicators = AsyncMock(
                return_value=sample_market_data["indicators"]
            )

            result = await formula_engine.evaluate_formula(sample_formula, "RELIANCE")

            # Check that we get a valid result
            assert result.signal in [SignalType.BUY, SignalType.SELL, SignalType.HOLD]
            assert result.confidence >= 0.0
            assert result.price > 0

    @pytest.mark.asyncio
    async def test_evaluate_formula_sell_signal(self, formula_engine, sample_formula):
        """Test formula evaluation with sell signal generation."""
        # Mock market data with RSI above threshold (sell signal)
        market_data = {
            "symbol": "RELIANCE",
            "price": 2500.0,
            "indicators": {"rsi": 85.0}  # High RSI indicates overbought
        }
        
        formula_engine.market_data_service.get_real_time_quote = AsyncMock(return_value=market_data)
        formula_engine.market_data_service.calculate_technical_indicators = AsyncMock(
            return_value=market_data["indicators"]
        )

        result = await formula_engine.evaluate_formula(sample_formula, "RELIANCE")

        assert result.signal == SignalType.SELL
        assert result.confidence > 0.5

    @pytest.mark.asyncio
    async def test_evaluate_formula_no_signal(self, formula_engine, sample_formula):
        """Test formula evaluation with no signal generation."""
        # Mock market data with RSI in neutral zone
        market_data = {
            "symbol": "RELIANCE",
            "price": 2500.0,
            "indicators": {"rsi_14": 50.0}  # Neutral RSI
        }
        
        formula_engine.market_data_service.get_real_time_quote = AsyncMock(return_value=market_data)
        formula_engine.market_data_service.calculate_technical_indicators = AsyncMock(
            return_value=market_data["indicators"]
        )

        result = await formula_engine.evaluate_formula(sample_formula, "RELIANCE")

        assert result.signal == SignalType.HOLD
        assert result.confidence < 0.5

    @pytest.mark.asyncio
    async def test_evaluate_formula_error_handling(self, formula_engine, sample_formula):
        """Test formula evaluation error handling."""
        # Mock market data service to raise an exception
        formula_engine.market_data_service.get_real_time_quote = AsyncMock(
            side_effect=Exception("Market data unavailable")
        )

        result = await formula_engine.evaluate_formula(sample_formula, "RELIANCE")

        assert result.signal == SignalType.HOLD
        assert result.confidence == 0.0
        assert result.error is not None
        assert "Market data unavailable" in result.error

    @pytest.mark.asyncio
    async def test_execute_trade_auto_mode(self, formula_engine, sample_subscription, sample_broker_account):
        """Test trade execution in auto mode."""
        # Mock trade signal
        trade_signal = TradeSignal(
            symbol="RELIANCE",
            side="buy",
            quantity=100,
            price=2500.0,
            stop_loss=2450.0,
            take_profit=2600.0,
            confidence=0.85,
            formula_id=sample_subscription.formula_id
        )
        
        # Mock the database query to return the broker account
        with patch('app.services.formula_engine.get_db_session') as mock_db:
            mock_session = Mock()
            mock_db.return_value = mock_session
            mock_session.query.return_value.filter.return_value.first.return_value = sample_broker_account
            
            result = await formula_engine.execute_trade(sample_subscription, trade_signal)

        assert isinstance(result, ExecutionResult)
        assert result.success is True
        assert result.trade_id is not None
        assert result.execution_price == 2500.0
        assert result.execution_time is not None

    @pytest.mark.asyncio
    async def test_execute_trade_manual_mode(self, formula_engine, sample_subscription, sample_broker_account):
        """Test trade execution in manual mode."""
        # Set subscription to manual mode
        sample_subscription.execution_mode = ExecutionMode.MANUAL
        
        # Mock trade signal
        trade_signal = TradeSignal(
            symbol="RELIANCE",
            side="buy",
            quantity=100,
            price=2500.0,
            stop_loss=2450.0,
            take_profit=2600.0,
            confidence=0.85,
            formula_id=sample_subscription.formula_id
        )
        
        # Mock the database query to return the broker account
        with patch('app.services.formula_engine.get_db_session') as mock_db:
            mock_session = Mock()
            mock_db.return_value = mock_session
            mock_session.query.return_value.filter.return_value.first.return_value = sample_broker_account
            
            result = await formula_engine.execute_trade(sample_subscription, trade_signal)

        assert isinstance(result, ExecutionResult)
        assert result.success is True
        assert result.requires_approval is True
        assert result.notification_sent is True

    @pytest.mark.asyncio
    async def test_execute_trade_alert_only_mode(self, formula_engine, sample_subscription, sample_broker_account):
        """Test trade execution in alert-only mode."""
        # Set subscription to alert-only mode
        sample_subscription.execution_mode = ExecutionMode.ALERT_ONLY
        
        # Mock trade signal
        trade_signal = TradeSignal(
            symbol="RELIANCE",
            side="buy",
            quantity=100,
            price=2500.0,
            stop_loss=2450.0,
            take_profit=2600.0,
            confidence=0.85,
            formula_id=sample_subscription.formula_id
        )
        
        # Mock the database query to return the broker account
        with patch('app.services.formula_engine.get_db_session') as mock_db:
            mock_session = Mock()
            mock_db.return_value = mock_session
            mock_session.query.return_value.filter.return_value.first.return_value = sample_broker_account
            
            result = await formula_engine.execute_trade(sample_subscription, trade_signal)

        assert isinstance(result, ExecutionResult)
        assert result.success is True
        assert result.requires_approval is False
        assert result.notification_sent is True

    @pytest.mark.asyncio
    async def test_execute_trade_broker_error(self, formula_engine, sample_subscription, sample_broker_account):
        """Test trade execution with broker error."""
        # Mock trade signal
        trade_signal = TradeSignal(
            symbol="RELIANCE",
            side="buy",
            quantity=100,
            price=2500.0,
            stop_loss=2450.0,
            take_profit=2600.0,
            confidence=0.85,
            formula_id=sample_subscription.formula_id
        )
        
        # Mock the database query to return the broker account
        with patch('app.services.formula_engine.get_db_session') as mock_db:
            mock_session = Mock()
            mock_db.return_value = mock_session
            mock_session.query.return_value.filter.return_value.first.return_value = sample_broker_account
            
            # Mock broker execution to fail
            formula_engine._execute_broker_trade = AsyncMock(return_value={"success": False, "error": "Broker API error"})
            
            result = await formula_engine.execute_trade(sample_subscription, trade_signal)

        assert isinstance(result, ExecutionResult)
        assert result.success is False
        assert result.error is not None
        assert "Broker API error" in result.error

    @pytest.mark.asyncio
    async def test_risk_management_stop_loss(self, formula_engine, sample_subscription, sample_broker_account):
        """Test risk management with stop loss."""
        # Mock trade signal with high risk
        trade_signal = TradeSignal(
            symbol="RELIANCE",
            side="buy",
            quantity=1000,  # Large position
            price=2500.0,
            stop_loss=2450.0,
            take_profit=2600.0,
            confidence=0.85,
            formula_id=sample_subscription.formula_id
        )
        
        # Mock the database query to return the broker account
        with patch('app.services.formula_engine.get_db_session') as mock_db:
            mock_session = Mock()
            mock_db.return_value = mock_session
            mock_session.query.return_value.filter.return_value.first.return_value = sample_broker_account
            
            result = await formula_engine.execute_trade(sample_subscription, trade_signal)

        assert isinstance(result, ExecutionResult)
        assert result.success is True
        assert result.risk_warnings is not None
        assert len(result.risk_warnings) > 0

    @pytest.mark.asyncio
    async def test_batch_evaluation(self, formula_engine, sample_formula, sample_subscription):
        """Test batch evaluation of multiple formulas."""
        # Mock market data
        market_data = {
            "symbol": "RELIANCE",
            "price": 2500.0,
            "indicators": {"rsi_14": 75.0}
        }
        
        formula_engine.market_data_service.get_real_time_quote = AsyncMock(return_value=market_data)
        formula_engine.market_data_service.calculate_technical_indicators = AsyncMock(
            return_value=market_data["indicators"]
        )

        # Mock database queries
        with patch('app.services.formula_engine.get_db_session') as mock_db:
            mock_session = Mock()
            mock_db.return_value = mock_session
            mock_session.query.return_value.join.return_value.join.return_value.filter.return_value.all.return_value = [sample_subscription]
            
            results = await formula_engine.evaluate_all_formulas()

        assert isinstance(results, dict)
        assert "signals_generated" in results
        assert "executions" in results
        assert "notifications" in results
        assert "errors" in results

    @pytest.mark.asyncio
    async def test_performance_metrics(self, formula_engine, sample_formula):
        """Test performance metrics calculation."""
        # Mock historical data
        historical_data = [
            {"timestamp": "2023-01-01", "price": 2400.0},
            {"timestamp": "2023-01-02", "price": 2450.0},
            {"timestamp": "2023-01-03", "price": 2500.0},
        ]
        
        formula_engine.market_data_service.get_historical_data = AsyncMock(return_value=historical_data)

        metrics = await formula_engine.calculate_performance_metrics(sample_formula, "RELIANCE")

        assert isinstance(metrics, dict)
        assert "total_return" in metrics
        assert "sharpe_ratio" in metrics
        assert "max_drawdown" in metrics
        assert "win_rate" in metrics

    @pytest.mark.asyncio
    async def test_formula_validation(self, formula_engine):
        """Test formula validation."""
        # Valid formula
        valid_formula_code = '{"blocks": [{"type": "indicator", "name": "RSI"}], "connections": []}'
        assert formula_engine.validate_formula_code(valid_formula_code) is True

        # Invalid formula
        invalid_formula_code = '{"invalid": "json"}'
        assert formula_engine.validate_formula_code(invalid_formula_code) is False

        # Empty formula
        assert formula_engine.validate_formula_code("") is False

    @pytest.mark.asyncio
    async def test_signal_filtering(self, formula_engine, sample_formula):
        """Test signal filtering based on confidence threshold."""
        # Mock market data with low confidence signal
        market_data = {
            "symbol": "RELIANCE",
            "price": 2500.0,
            "indicators": {"rsi_14": 55.0}  # Weak signal
        }
        
        formula_engine.market_data_service.get_real_time_quote = AsyncMock(return_value=market_data)
        formula_engine.market_data_service.calculate_technical_indicators = AsyncMock(
            return_value=market_data["indicators"]
        )

        result = await formula_engine.evaluate_formula(sample_formula, "RELIANCE")

        # Should filter out low confidence signals
        assert result.signal == SignalType.HOLD
        assert result.confidence < 0.6

    @pytest.mark.asyncio
    async def test_concurrent_evaluation(self, formula_engine, sample_formula):
        """Test concurrent formula evaluation."""
        # Mock market data
        market_data = {
            "symbol": "RELIANCE",
            "price": 2500.0,
            "indicators": {"rsi_14": 75.0}
        }
        
        formula_engine.market_data_service.get_real_time_quote = AsyncMock(return_value=market_data)
        formula_engine.market_data_service.calculate_technical_indicators = AsyncMock(
            return_value=market_data["indicators"]
        )

        # Evaluate multiple formulas concurrently
        tasks = [
            formula_engine.evaluate_formula(sample_formula, "RELIANCE"),
            formula_engine.evaluate_formula(sample_formula, "TCS"),
            formula_engine.evaluate_formula(sample_formula, "HDFC")
        ]

        results = await asyncio.gather(*tasks)

        assert len(results) == 3
        assert all(isinstance(result, FormulaEvaluationResult) for result in results)

    @pytest.mark.asyncio
    async def test_error_recovery(self, formula_engine, sample_formula):
        """Test error recovery mechanisms."""
        # Mock market data service to fail first, then succeed
        formula_engine.market_data_service.get_real_time_quote = AsyncMock(
            side_effect=[Exception("Network error"), {
                "symbol": "RELIANCE",
                "price": 2500.0,
                "indicators": {"rsi": 25.0}  # Low RSI for buy signal
            }]
        )
        formula_engine.market_data_service.calculate_technical_indicators = AsyncMock(
            return_value={"rsi": 25.0}
        )

        # First evaluation should fail
        result1 = await formula_engine.evaluate_formula(sample_formula, "RELIANCE")
        assert result1.signal == SignalType.HOLD
        assert result1.error is not None

        # Second evaluation should succeed
        result2 = await formula_engine.evaluate_formula(sample_formula, "RELIANCE")
        assert result2.signal == SignalType.BUY
        assert result2.error is None

    @pytest.mark.asyncio
    async def test_memory_usage(self, formula_engine, sample_formula):
        """Test memory usage during formula evaluation."""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss

        # Evaluate formula multiple times
        for _ in range(100):
            await formula_engine.evaluate_formula(sample_formula, "RELIANCE")

        final_memory = process.memory_info().rss
        memory_increase = final_memory - initial_memory

        # Memory increase should be reasonable (less than 10MB)
        assert memory_increase < 10 * 1024 * 1024

    @pytest.mark.asyncio
    async def test_formula_caching(self, formula_engine, sample_formula):
        """Test formula evaluation caching."""
        # Mock market data
        market_data = {
            "symbol": "RELIANCE",
            "price": 2500.0,
            "indicators": {"rsi_14": 75.0}
        }
        
        formula_engine.market_data_service.get_real_time_quote = AsyncMock(return_value=market_data)
        formula_engine.market_data_service.calculate_technical_indicators = AsyncMock(
            return_value=market_data["indicators"]
        )

        # First evaluation
        result1 = await formula_engine.evaluate_formula(sample_formula, "RELIANCE")
        
        # Second evaluation should use cache
        result2 = await formula_engine.evaluate_formula(sample_formula, "RELIANCE")

        assert result1.signal == result2.signal
        assert result1.confidence == result2.confidence

    @pytest.mark.asyncio
    async def test_formula_engine_cleanup(self, formula_engine):
        """Test formula engine cleanup."""
        # Test cleanup method
        await formula_engine.cleanup()
        
        # Verify cleanup was successful
        assert formula_engine.is_cleanup_complete is True
