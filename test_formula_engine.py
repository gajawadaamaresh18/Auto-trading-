"""
Comprehensive test suite for FormulaEngine.

This module contains unit tests, integration tests, and performance tests
for the FormulaEngine class and its components.
"""

import pytest
import asyncio
from datetime import datetime, timedelta
from unittest.mock import Mock, AsyncMock, patch
import json

from formula_engine import (
    FormulaEngine, Formula, MarketData, TradingSignal, SignalType, 
    ExecutionMode, PythonFormulaEvaluator, EmailNotificationService,
    WebhookNotificationService, MockTradingExecutor
)


class TestMarketData:
    """Test MarketData dataclass."""
    
    def test_market_data_creation(self):
        """Test MarketData creation with all fields."""
        data = MarketData(
            symbol="AAPL",
            price=150.0,
            volume=1000000,
            timestamp=datetime.now(),
            open_price=149.0,
            high_price=151.0,
            low_price=148.0,
            close_price=150.0
        )
        
        assert data.symbol == "AAPL"
        assert data.price == 150.0
        assert data.volume == 1000000
        assert data.additional_data == {}
    
    def test_market_data_with_additional_data(self):
        """Test MarketData with additional data."""
        additional = {"sector": "technology", "market_cap": 1000000000}
        data = MarketData(
            symbol="GOOGL",
            price=200.0,
            volume=500000,
            timestamp=datetime.now(),
            open_price=199.0,
            high_price=201.0,
            low_price=198.0,
            close_price=200.0,
            additional_data=additional
        )
        
        assert data.additional_data == additional


class TestTradingSignal:
    """Test TradingSignal dataclass."""
    
    def test_trading_signal_creation(self):
        """Test TradingSignal creation."""
        signal = TradingSignal(
            user_id="user_1",
            formula_id="formula_1",
            symbol="AAPL",
            signal_type=SignalType.ENTRY_LONG,
            confidence=0.8,
            price=150.0,
            timestamp=datetime.now()
        )
        
        assert signal.user_id == "user_1"
        assert signal.formula_id == "formula_1"
        assert signal.symbol == "AAPL"
        assert signal.signal_type == SignalType.ENTRY_LONG
        assert signal.confidence == 0.8
        assert signal.price == 150.0
        assert signal.metadata == {}


class TestFormula:
    """Test Formula dataclass."""
    
    def test_formula_creation(self):
        """Test Formula creation with defaults."""
        formula = Formula(
            id="formula_1",
            user_id="user_1",
            name="Test Formula",
            code="signal = {'signal_type': 'hold', 'confidence': 0.5, 'price': 100.0}",
            symbols=["AAPL", "GOOGL"]
        )
        
        assert formula.id == "formula_1"
        assert formula.user_id == "user_1"
        assert formula.name == "Test Formula"
        assert formula.symbols == ["AAPL", "GOOGL"]
        assert formula.is_active is True
        assert formula.execution_mode == ExecutionMode.NOTIFICATION
        assert formula.created_at is not None
        assert formula.updated_at is not None


class TestPythonFormulaEvaluator:
    """Test PythonFormulaEvaluator class."""
    
    @pytest.fixture
    def evaluator(self):
        """Create a PythonFormulaEvaluator instance."""
        return PythonFormulaEvaluator()
    
    @pytest.fixture
    def sample_formula(self):
        """Create a sample formula for testing."""
        return Formula(
            id="test_formula",
            user_id="test_user",
            name="Test Formula",
            code="""
signal = {
    'signal_type': 'entry_long',
    'confidence': 0.8,
    'price': market_data['AAPL'].price,
    'symbol': 'AAPL',
    'metadata': {'test': True}
}
""",
            symbols=["AAPL"]
        )
    
    @pytest.fixture
    def sample_market_data(self):
        """Create sample market data."""
        return {
            "AAPL": MarketData(
                symbol="AAPL",
                price=150.0,
                volume=1000000,
                timestamp=datetime.now(),
                open_price=149.0,
                high_price=151.0,
                low_price=148.0,
                close_price=150.0
            )
        }
    
    @pytest.mark.asyncio
    async def test_evaluate_simple_formula(self, evaluator, sample_formula, sample_market_data):
        """Test evaluation of a simple formula."""
        signal = await evaluator.evaluate(sample_formula, sample_market_data)
        
        assert isinstance(signal, TradingSignal)
        assert signal.user_id == "test_user"
        assert signal.formula_id == "test_formula"
        assert signal.symbol == "AAPL"
        assert signal.signal_type == SignalType.ENTRY_LONG
        assert signal.confidence == 0.8
        assert signal.price == 150.0
        assert signal.metadata == {'test': True}
    
    @pytest.mark.asyncio
    async def test_evaluate_formula_with_error(self, evaluator, sample_market_data):
        """Test evaluation of a formula that raises an error."""
        error_formula = Formula(
            id="error_formula",
            user_id="test_user",
            name="Error Formula",
            code="raise Exception('Test error')",
            symbols=["AAPL"]
        )
        
        with pytest.raises(Exception):
            await evaluator.evaluate(error_formula, sample_market_data)
    
    @pytest.mark.asyncio
    async def test_evaluate_formula_missing_signal(self, evaluator, sample_market_data):
        """Test evaluation of a formula that doesn't set signal variable."""
        no_signal_formula = Formula(
            id="no_signal_formula",
            user_id="test_user",
            name="No Signal Formula",
            code="x = 1 + 1",  # Doesn't set 'signal' variable
            symbols=["AAPL"]
        )
        
        with pytest.raises(ValueError, match="Formula must set 'signal' variable"):
            await evaluator.evaluate(no_signal_formula, sample_market_data)
    
    @pytest.mark.asyncio
    async def test_evaluate_formula_invalid_signal(self, evaluator, sample_market_data):
        """Test evaluation of a formula with invalid signal format."""
        invalid_signal_formula = Formula(
            id="invalid_signal_formula",
            user_id="test_user",
            name="Invalid Signal Formula",
            code="signal = 'invalid'",  # Signal should be a dict
            symbols=["AAPL"]
        )
        
        with pytest.raises(ValueError, match="Signal must be a dictionary"):
            await evaluator.evaluate(invalid_signal_formula, sample_market_data)


class TestNotificationServices:
    """Test notification service implementations."""
    
    @pytest.mark.asyncio
    async def test_email_notification_service(self):
        """Test EmailNotificationService."""
        service = EmailNotificationService({
            'smtp_server': 'smtp.gmail.com',
            'smtp_port': 587,
            'username': 'test@gmail.com',
            'password': 'test_password'
        })
        
        signal = TradingSignal(
            user_id="user_1",
            formula_id="formula_1",
            symbol="AAPL",
            signal_type=SignalType.ENTRY_LONG,
            confidence=0.8,
            price=150.0,
            timestamp=datetime.now()
        )
        
        # Should not raise an exception
        result = await service.send_signal_notification(signal)
        assert result is True
    
    @pytest.mark.asyncio
    async def test_webhook_notification_service(self):
        """Test WebhookNotificationService."""
        service = WebhookNotificationService("http://test-webhook.com/signals")
        
        signal = TradingSignal(
            user_id="user_1",
            formula_id="formula_1",
            symbol="AAPL",
            signal_type=SignalType.ENTRY_LONG,
            confidence=0.8,
            price=150.0,
            timestamp=datetime.now()
        )
        
        # Test without aiohttp (should handle gracefully)
        try:
            result = await service.send_signal_notification(signal)
            # If aiohttp is not available, it should return False
            assert result is False
        except ImportError:
            # If aiohttp is not available, the service should handle it gracefully
            pass


class TestTradingExecutor:
    """Test trading executor implementations."""
    
    @pytest.mark.asyncio
    async def test_mock_trading_executor(self):
        """Test MockTradingExecutor."""
        executor = MockTradingExecutor()
        
        signal = TradingSignal(
            user_id="user_1",
            formula_id="formula_1",
            symbol="AAPL",
            signal_type=SignalType.ENTRY_LONG,
            confidence=0.8,
            price=150.0,
            timestamp=datetime.now()
        )
        
        result = await executor.execute_signal(signal)
        assert result is True


class TestFormulaEngine:
    """Test FormulaEngine main class."""
    
    @pytest.fixture
    def mock_market_data_provider(self):
        """Create a mock market data provider."""
        async def provider(symbols):
            return {
                symbol: MarketData(
                    symbol=symbol,
                    price=100.0 + hash(symbol) % 50,
                    volume=1000000,
                    timestamp=datetime.now(),
                    open_price=99.0,
                    high_price=101.0,
                    low_price=98.0,
                    close_price=100.0
                )
                for symbol in symbols
            }
        return provider
    
    @pytest.fixture
    def mock_user_formula_provider(self):
        """Create a mock user formula provider."""
        async def provider():
            return [
                Formula(
                    id="test_formula_1",
                    user_id="user_1",
                    name="Test Formula 1",
                    code="""
signal = {
    'signal_type': 'entry_long',
    'confidence': 0.8,
    'price': market_data['AAPL'].price,
    'symbol': 'AAPL'
}
""",
                    symbols=["AAPL"],
                    execution_mode=ExecutionMode.AUTO
                ),
                Formula(
                    id="test_formula_2",
                    user_id="user_2",
                    name="Test Formula 2",
                    code="""
signal = {
    'signal_type': 'hold',
    'confidence': 0.5,
    'price': market_data['GOOGL'].price,
    'symbol': 'GOOGL'
}
""",
                    symbols=["GOOGL"],
                    execution_mode=ExecutionMode.NOTIFICATION
                )
            ]
        return provider
    
    @pytest.fixture
    def formula_engine(self, mock_market_data_provider, mock_user_formula_provider):
        """Create a FormulaEngine instance for testing."""
        return FormulaEngine(
            market_data_provider=mock_market_data_provider,
            user_formula_provider=mock_user_formula_provider,
            evaluation_interval=60
        )
    
    @pytest.mark.asyncio
    async def test_evaluate_all_formulas(self, formula_engine):
        """Test evaluate_all_formulas method."""
        signals = await formula_engine.evaluate_all_formulas()
        
        assert len(signals) == 2  # Two formulas should generate two signals
        assert all(isinstance(signal, TradingSignal) for signal in signals)
        
        # Check statistics
        stats = formula_engine.get_statistics()
        assert stats['total_evaluations'] == 1
        assert stats['successful_evaluations'] == 2
        assert stats['signals_generated'] == 2
    
    @pytest.mark.asyncio
    async def test_evaluate_all_formulas_with_errors(self, mock_market_data_provider):
        """Test evaluate_all_formulas with formula errors."""
        async def error_formula_provider():
            return [
                Formula(
                    id="error_formula",
                    user_id="user_1",
                    name="Error Formula",
                    code="raise Exception('Test error')",
                    symbols=["AAPL"]
                )
            ]
        
        engine = FormulaEngine(
            market_data_provider=mock_market_data_provider,
            user_formula_provider=error_formula_provider
        )
        
        signals = await engine.evaluate_all_formulas()
        
        # Should return empty list due to error
        assert len(signals) == 0
        
        # Check statistics
        stats = engine.get_statistics()
        assert stats['total_evaluations'] == 1
        assert stats['failed_evaluations'] == 1
        assert stats['successful_evaluations'] == 0
    
    @pytest.mark.asyncio
    async def test_process_signal_auto_mode(self, formula_engine):
        """Test signal processing in auto mode."""
        signal = TradingSignal(
            user_id="user_1",
            formula_id="test_formula_1",
            symbol="AAPL",
            signal_type=SignalType.ENTRY_LONG,
            confidence=0.8,
            price=150.0,
            timestamp=datetime.now()
        )
        
        formula = Formula(
            id="test_formula_1",
            user_id="user_1",
            name="Test Formula",
            code="",
            symbols=["AAPL"],
            execution_mode=ExecutionMode.AUTO
        )
        
        # Mock the trading executor
        formula_engine.trading_executor = MockTradingExecutor()
        
        await formula_engine._process_signal(signal, formula)
        
        # Check statistics
        stats = formula_engine.get_statistics()
        assert stats['auto_executions'] == 1
    
    @pytest.mark.asyncio
    async def test_process_signal_notification_mode(self, formula_engine):
        """Test signal processing in notification mode."""
        signal = TradingSignal(
            user_id="user_2",
            formula_id="test_formula_2",
            symbol="GOOGL",
            signal_type=SignalType.HOLD,
            confidence=0.5,
            price=200.0,
            timestamp=datetime.now()
        )
        
        formula = Formula(
            id="test_formula_2",
            user_id="user_2",
            name="Test Formula",
            code="",
            symbols=["GOOGL"],
            execution_mode=ExecutionMode.NOTIFICATION
        )
        
        # Mock the notification service
        mock_notification_service = AsyncMock()
        mock_notification_service.send_signal_notification.return_value = True
        formula_engine.notification_service = mock_notification_service
        
        await formula_engine._process_signal(signal, formula)
        
        # Verify notification was called
        mock_notification_service.send_signal_notification.assert_called_once_with(signal)
        
        # Check statistics
        stats = formula_engine.get_statistics()
        assert stats['notifications_sent'] == 1
    
    def test_get_statistics(self, formula_engine):
        """Test get_statistics method."""
        stats = formula_engine.get_statistics()
        
        expected_keys = [
            'total_evaluations', 'successful_evaluations', 'failed_evaluations',
            'signals_generated', 'auto_executions', 'notifications_sent', 'last_evaluation'
        ]
        
        for key in expected_keys:
            assert key in stats
    
    def test_reset_statistics(self, formula_engine):
        """Test reset_statistics method."""
        # Modify some statistics
        formula_engine.stats['total_evaluations'] = 5
        formula_engine.stats['signals_generated'] = 10
        
        # Reset statistics
        formula_engine.reset_statistics()
        
        # Check that statistics are reset
        stats = formula_engine.get_statistics()
        assert stats['total_evaluations'] == 0
        assert stats['signals_generated'] == 0


class TestIntegration:
    """Integration tests for the complete system."""
    
    @pytest.mark.asyncio
    async def test_full_workflow(self):
        """Test the complete workflow from formula evaluation to signal processing."""
        # Create a real FormulaEngine with mock services
        mock_notification_service = AsyncMock()
        mock_notification_service.send_signal_notification.return_value = True
        
        mock_trading_executor = AsyncMock()
        mock_trading_executor.execute_signal.return_value = True
        
        engine = FormulaEngine(
            notification_service=mock_notification_service,
            trading_executor=mock_trading_executor
        )
        
        # Run evaluation
        signals = await engine.evaluate_all_formulas()
        
        # Verify results
        assert len(signals) > 0
        
        # Check that services were called appropriately
        # (This depends on the default formulas and their execution modes)
        stats = engine.get_statistics()
        assert stats['total_evaluations'] == 1
        assert stats['successful_evaluations'] > 0


class TestPerformance:
    """Performance tests for the FormulaEngine."""
    
    @pytest.mark.asyncio
    async def test_large_scale_evaluation(self):
        """Test evaluation with many formulas and symbols."""
        # Create many formulas
        async def large_formula_provider():
            formulas = []
            for i in range(100):  # 100 formulas
                formula = Formula(
                    id=f"formula_{i}",
                    user_id=f"user_{i % 10}",  # 10 users
                    name=f"Formula {i}",
                    code=f"""
signal = {{
    'signal_type': 'entry_long' if {i} % 2 == 0 else 'hold',
    'confidence': 0.5 + ({i} % 5) * 0.1,
    'price': market_data['SYMBOL_{i % 20}'].price,
    'symbol': 'SYMBOL_{i % 20}'
}}
""",
                    symbols=[f"SYMBOL_{i % 20}"]  # 20 unique symbols
                )
                formulas.append(formula)
            return formulas
        
        # Create market data provider for many symbols
        async def large_market_data_provider(symbols):
            return {
                symbol: MarketData(
                    symbol=symbol,
                    price=100.0 + hash(symbol) % 100,
                    volume=1000000,
                    timestamp=datetime.now(),
                    open_price=99.0,
                    high_price=101.0,
                    low_price=98.0,
                    close_price=100.0
                )
                for symbol in symbols
            }
        
        engine = FormulaEngine(
            market_data_provider=large_market_data_provider,
            user_formula_provider=large_formula_provider
        )
        
        # Measure execution time
        start_time = datetime.now()
        signals = await engine.evaluate_all_formulas()
        end_time = datetime.now()
        
        execution_time = (end_time - start_time).total_seconds()
        
        # Verify results
        assert len(signals) == 100  # 100 formulas should generate 100 signals
        assert execution_time < 10.0  # Should complete within 10 seconds
        
        # Check statistics
        stats = engine.get_statistics()
        assert stats['successful_evaluations'] == 100
        assert stats['signals_generated'] == 100


# Pytest configuration
if __name__ == "__main__":
    pytest.main([__file__, "-v"])