import pytest
from unittest.mock import AsyncMock, patch
from decimal import Decimal

from app.services.risk_management import RiskManagementService
from app.models.user import User
from app.models.formula import Formula
from app.models.trade import Trade, TradeSide, TradeStatus

@pytest.mark.asyncio
class TestRiskManagementService:
    """Test risk management service."""

    @pytest.fixture
    def risk_service(self):
        """Create risk management service instance."""
        return RiskManagementService()

    @pytest.fixture
    def mock_user(self):
        """Create mock user."""
        user = User()
        user.id = "test-user-id"
        user.is_banned = False
        return user

    @pytest.fixture
    def mock_formula(self):
        """Create mock formula."""
        formula = Formula()
        formula.id = "test-formula-id"
        formula.risk_level = "medium"
        formula.blocks = [
            {"type": "indicator", "name": "SMA", "parameters": {"period": 20}},
            {"type": "condition", "name": "Price > SMA", "parameters": {}},
            {"type": "action", "name": "Buy", "parameters": {"quantity": 100}},
        ]
        return formula

    async def test_calculate_position_size_success(self, risk_service, mock_user, mock_formula):
        """Test successful position size calculation."""
        portfolio_value = 100000.0
        risk_percentage = 0.02
        current_price = 150.0
        
        position_size = await risk_service.calculate_position_size(
            user=mock_user,
            formula=mock_formula,
            portfolio_value=portfolio_value,
            risk_percentage=risk_percentage,
            current_price=current_price
        )
        
        # Expected: (100000 * 0.02) / 150 = 13.33 shares
        expected_size = int((portfolio_value * risk_percentage) / current_price)
        assert position_size == expected_size

    async def test_calculate_position_size_high_risk_formula(self, risk_service, mock_user):
        """Test position size calculation for high risk formula."""
        high_risk_formula = Formula()
        high_risk_formula.id = "high-risk-formula"
        high_risk_formula.risk_level = "high"
        high_risk_formula.blocks = []
        
        portfolio_value = 100000.0
        risk_percentage = 0.01  # Lower risk for high-risk formula
        current_price = 150.0
        
        position_size = await risk_service.calculate_position_size(
            user=mock_user,
            formula=high_risk_formula,
            portfolio_value=portfolio_value,
            risk_percentage=risk_percentage,
            current_price=current_price
        )
        
        # Should use lower risk percentage for high-risk formulas
        expected_size = int((portfolio_value * risk_percentage) / current_price)
        assert position_size == expected_size

    async def test_calculate_position_size_zero_price(self, risk_service, mock_user, mock_formula):
        """Test position size calculation with zero price fails."""
        portfolio_value = 100000.0
        risk_percentage = 0.02
        current_price = 0.0
        
        with pytest.raises(ValueError, match="Price must be greater than zero"):
            await risk_service.calculate_position_size(
                user=mock_user,
                formula=mock_formula,
                portfolio_value=portfolio_value,
                risk_percentage=risk_percentage,
                current_price=current_price
            )

    async def test_calculate_position_size_negative_values(self, risk_service, mock_user, mock_formula):
        """Test position size calculation with negative values fails."""
        portfolio_value = -100000.0
        risk_percentage = 0.02
        current_price = 150.0
        
        with pytest.raises(ValueError, match="Portfolio value must be positive"):
            await risk_service.calculate_position_size(
                user=mock_user,
                formula=mock_formula,
                portfolio_value=portfolio_value,
                risk_percentage=risk_percentage,
                current_price=current_price
            )

    async def test_check_risk_limits_within_limits(self, risk_service, mock_user):
        """Test risk limit check when within limits."""
        current_risk = 1000.0
        max_risk = 2000.0
        daily_trades = 5
        max_daily_trades = 100
        
        is_within_limits = await risk_service.check_risk_limits(
            user=mock_user,
            current_risk=current_risk,
            max_risk=max_risk,
            daily_trades=daily_trades,
            max_daily_trades=max_daily_trades
        )
        
        assert is_within_limits is True

    async def test_check_risk_limits_exceeded_risk(self, risk_service, mock_user):
        """Test risk limit check when risk is exceeded."""
        current_risk = 3000.0
        max_risk = 2000.0
        daily_trades = 5
        max_daily_trades = 100
        
        is_within_limits = await risk_service.check_risk_limits(
            user=mock_user,
            current_risk=current_risk,
            max_risk=max_risk,
            daily_trades=daily_trades,
            max_daily_trades=max_daily_trades
        )
        
        assert is_within_limits is False

    async def test_check_risk_limits_exceeded_daily_trades(self, risk_service, mock_user):
        """Test risk limit check when daily trades are exceeded."""
        current_risk = 1000.0
        max_risk = 2000.0
        daily_trades = 150
        max_daily_trades = 100
        
        is_within_limits = await risk_service.check_risk_limits(
            user=mock_user,
            current_risk=current_risk,
            max_risk=max_risk,
            daily_trades=daily_trades,
            max_daily_trades=max_daily_trades
        )
        
        assert is_within_limits is False

    async def test_validate_trade_risk_success(self, risk_service, mock_user, mock_formula):
        """Test successful trade risk validation."""
        trade_data = {
            "symbol": "AAPL",
            "side": "buy",
            "quantity": 100,
            "price": 150.0
        }
        
        portfolio_value = 100000.0
        current_risk = 500.0
        max_risk = 2000.0
        
        is_valid = await risk_service.validate_trade_risk(
            user=mock_user,
            formula=mock_formula,
            trade_data=trade_data,
            portfolio_value=portfolio_value,
            current_risk=current_risk,
            max_risk=max_risk
        )
        
        assert is_valid is True

    async def test_validate_trade_risk_exceeds_limit(self, risk_service, mock_user, mock_formula):
        """Test trade risk validation when risk limit is exceeded."""
        trade_data = {
            "symbol": "AAPL",
            "side": "buy",
            "quantity": 10000,  # Very large quantity
            "price": 150.0
        }
        
        portfolio_value = 100000.0
        current_risk = 1900.0
        max_risk = 2000.0
        
        is_valid = await risk_service.validate_trade_risk(
            user=mock_user,
            formula=mock_formula,
            trade_data=trade_data,
            portfolio_value=portfolio_value,
            current_risk=current_risk,
            max_risk=max_risk
        )
        
        assert is_valid is False

    async def test_validate_trade_risk_banned_user(self, risk_service, mock_formula):
        """Test trade risk validation for banned user fails."""
        banned_user = User()
        banned_user.id = "banned-user-id"
        banned_user.is_banned = True
        
        trade_data = {
            "symbol": "AAPL",
            "side": "buy",
            "quantity": 100,
            "price": 150.0
        }
        
        with pytest.raises(ValueError, match="Banned users cannot trade"):
            await risk_service.validate_trade_risk(
                user=banned_user,
                formula=mock_formula,
                trade_data=trade_data,
                portfolio_value=100000.0,
                current_risk=500.0,
                max_risk=2000.0
            )

    async def test_calculate_portfolio_risk_success(self, risk_service, mock_user):
        """Test portfolio risk calculation."""
        trades = [
            Trade(symbol="AAPL", side=TradeSide.BUY, quantity=100, price=150.0, status=TradeStatus.FILLED),
            Trade(symbol="GOOGL", side=TradeSide.BUY, quantity=50, price=2000.0, status=TradeStatus.FILLED),
            Trade(symbol="MSFT", side=TradeSide.SELL, quantity=75, price=300.0, status=TradeStatus.FILLED),
        ]
        
        portfolio_value = 100000.0
        current_prices = {"AAPL": 160.0, "GOOGL": 2100.0, "MSFT": 310.0}
        
        risk = await risk_service.calculate_portfolio_risk(
            user=mock_user,
            trades=trades,
            portfolio_value=portfolio_value,
            current_prices=current_prices
        )
        
        # Expected: (100 * 160 + 50 * 2100 - 75 * 310) / 100000
        expected_risk = (100 * 160 + 50 * 2100 - 75 * 310) / portfolio_value
        assert abs(risk - expected_risk) < 0.01

    async def test_calculate_portfolio_risk_empty_trades(self, risk_service, mock_user):
        """Test portfolio risk calculation with no trades."""
        trades = []
        portfolio_value = 100000.0
        current_prices = {}
        
        risk = await risk_service.calculate_portfolio_risk(
            user=mock_user,
            trades=trades,
            portfolio_value=portfolio_value,
            current_prices=current_prices
        )
        
        assert risk == 0.0

    async def test_get_risk_metrics_success(self, risk_service, mock_user):
        """Test getting risk metrics."""
        trades = [
            Trade(symbol="AAPL", side=TradeSide.BUY, quantity=100, price=150.0, status=TradeStatus.FILLED),
            Trade(symbol="GOOGL", side=TradeSide.BUY, quantity=50, price=2000.0, status=TradeStatus.FILLED),
        ]
        
        portfolio_value = 100000.0
        current_prices = {"AAPL": 160.0, "GOOGL": 2100.0}
        
        metrics = await risk_service.get_risk_metrics(
            user=mock_user,
            trades=trades,
            portfolio_value=portfolio_value,
            current_prices=current_prices
        )
        
        assert "current_risk" in metrics
        assert "risk_percentage" in metrics
        assert "max_risk" in metrics
        assert "risk_utilization" in metrics
        assert "daily_trades" in metrics
        assert "max_daily_trades" in metrics

    async def test_block_trading_risk_exceeded(self, risk_service, mock_user):
        """Test blocking trading when risk is exceeded."""
        current_risk = 3000.0
        max_risk = 2000.0
        
        is_blocked = await risk_service.should_block_trading(
            user=mock_user,
            current_risk=current_risk,
            max_risk=max_risk
        )
        
        assert is_blocked is True

    async def test_allow_trading_within_limits(self, risk_service, mock_user):
        """Test allowing trading when within limits."""
        current_risk = 1000.0
        max_risk = 2000.0
        
        is_blocked = await risk_service.should_block_trading(
            user=mock_user,
            current_risk=current_risk,
            max_risk=max_risk
        )
        
        assert is_blocked is False

    async def test_risk_alert_generation(self, risk_service, mock_user):
        """Test risk alert generation."""
        current_risk = 1800.0
        max_risk = 2000.0
        risk_threshold = 0.8  # 80% of max risk
        
        alert = await risk_service.generate_risk_alert(
            user=mock_user,
            current_risk=current_risk,
            max_risk=max_risk,
            risk_threshold=risk_threshold
        )
        
        assert alert is not None
        assert "user_id" in alert
        assert "alert_type" in alert
        assert "message" in alert
        assert "risk_level" in alert

    @pytest.mark.parametrize("risk_level,expected_multiplier", [
        ("low", 1.0),
        ("medium", 0.8),
        ("high", 0.5),
    ])
    async def test_risk_level_multipliers(self, risk_service, mock_user, risk_level: str, expected_multiplier: float):
        """Test risk level multipliers for position sizing."""
        formula = Formula()
        formula.risk_level = risk_level
        formula.blocks = []
        
        portfolio_value = 100000.0
        base_risk_percentage = 0.02
        current_price = 150.0
        
        position_size = await risk_service.calculate_position_size(
            user=mock_user,
            formula=formula,
            portfolio_value=portfolio_value,
            risk_percentage=base_risk_percentage,
            current_price=current_price
        )
        
        expected_size = int((portfolio_value * base_risk_percentage * expected_multiplier) / current_price)
        assert position_size == expected_size