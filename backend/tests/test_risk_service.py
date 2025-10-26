"""
Comprehensive unit tests for the Risk Service
"""

import pytest
from services.risk import (
    RiskService, 
    RiskConfig, 
    TradeData, 
    StopLossType, 
    TakeProfitType,
    RiskValidationResult
)


class TestRiskService:
    """Test cases for RiskService class"""
    
    def setup_method(self):
        """Set up test fixtures"""
        self.risk_service = RiskService()
        self.default_config = RiskConfig(
            max_portfolio_risk=0.02,    # 2%
            max_position_size=0.1,      # 10%
            max_risk_per_trade=0.01,    # 1%
            max_drawdown=0.05,          # 5%
            min_risk_reward_ratio=1.0,
            max_leverage=1.0
        )
        
        self.sample_trade = TradeData(
            symbol="BTC/USDT",
            entry_price=50000.0,
            position_size=0.1,
            stop_loss=48000.0,
            take_profit=52000.0,
            stop_loss_type="fixed",
            take_profit_type="fixed",
            current_price=50000.0,
            portfolio_value=10000.0,
            leverage=1.0
        )
    
    def test_calculate_stop_loss_price_fixed(self):
        """Test fixed stop loss price calculation"""
        result = self.risk_service.calculate_stop_loss_price(
            50000.0, 48000.0, StopLossType.FIXED.value
        )
        assert result == 48000.0
    
    def test_calculate_stop_loss_price_percentage(self):
        """Test percentage stop loss price calculation"""
        result = self.risk_service.calculate_stop_loss_price(
            50000.0, 4.0, StopLossType.PERCENTAGE.value
        )
        expected = 50000.0 * (1 - 4.0 / 100)
        assert result == expected
    
    def test_calculate_stop_loss_price_trailing(self):
        """Test trailing stop loss price calculation"""
        result = self.risk_service.calculate_stop_loss_price(
            50000.0, 2.0, StopLossType.TRAILING.value
        )
        expected = 50000.0 * (1 - 2.0 / 100)
        assert result == expected
    
    def test_calculate_take_profit_price_fixed(self):
        """Test fixed take profit price calculation"""
        result = self.risk_service.calculate_take_profit_price(
            50000.0, 52000.0, TakeProfitType.FIXED.value
        )
        assert result == 52000.0
    
    def test_calculate_take_profit_price_percentage(self):
        """Test percentage take profit price calculation"""
        result = self.risk_service.calculate_take_profit_price(
            50000.0, 4.0, TakeProfitType.PERCENTAGE.value
        )
        expected = 50000.0 * (1 + 4.0 / 100)
        assert result == expected
    
    def test_calculate_risk_metrics_valid_trade(self):
        """Test risk metrics calculation for a valid trade"""
        risk_metrics = self.risk_service.calculate_risk_metrics(
            self.sample_trade, self.default_config
        )
        
        # Risk amount: (50000 - 48000) * 0.1 = 200
        assert risk_metrics.risk_amount == 200.0
        
        # Reward amount: (52000 - 50000) * 0.1 = 200
        assert risk_metrics.reward_amount == 200.0
        
        # Risk:reward ratio: 200 / 200 = 1.0
        assert risk_metrics.risk_reward_ratio == 1.0
        
        # Portfolio risk: (200 / 10000) * 100 = 2%
        assert risk_metrics.portfolio_risk_percentage == 2.0
        
        # Position risk: (0.1 * 50000 / 10000) * 100 = 50%
        assert risk_metrics.position_risk_percentage == 50.0
        
        # Should not be risky
        assert not risk_metrics.is_risky
        assert len(risk_metrics.violations) == 0
    
    def test_calculate_risk_metrics_risky_trade(self):
        """Test risk metrics calculation for a risky trade"""
        risky_trade = TradeData(
            symbol="BTC/USDT",
            entry_price=50000.0,
            position_size=0.5,  # 50% position size - exceeds max
            stop_loss=48000.0,
            take_profit=52000.0,
            stop_loss_type="fixed",
            take_profit_type="fixed",
            current_price=50000.0,
            portfolio_value=10000.0,
            leverage=1.0
        )
        
        risk_metrics = self.risk_service.calculate_risk_metrics(
            risky_trade, self.default_config
        )
        
        # Should be risky due to position size violation
        assert risk_metrics.is_risky
        assert len(risk_metrics.violations) > 0
        assert any("Position size" in violation for violation in risk_metrics.violations)
    
    def test_calculate_risk_metrics_portfolio_risk_violation(self):
        """Test portfolio risk violation"""
        high_risk_trade = TradeData(
            symbol="BTC/USDT",
            entry_price=50000.0,
            position_size=0.1,
            stop_loss=30000.0,  # Very wide stop loss
            take_profit=52000.0,
            stop_loss_type="fixed",
            take_profit_type="fixed",
            current_price=50000.0,
            portfolio_value=10000.0,
            leverage=1.0
        )
        
        risk_metrics = self.risk_service.calculate_risk_metrics(
            high_risk_trade, self.default_config
        )
        
        # Risk amount: (50000 - 30000) * 0.1 = 2000
        assert risk_metrics.risk_amount == 2000.0
        
        # Portfolio risk: (2000 / 10000) * 100 = 20% - exceeds 2% max
        assert risk_metrics.portfolio_risk_percentage == 20.0
        assert risk_metrics.is_risky
        assert any("Portfolio risk" in violation for violation in risk_metrics.violations)
    
    def test_calculate_risk_metrics_leverage_violation(self):
        """Test leverage violation"""
        leveraged_trade = TradeData(
            symbol="BTC/USDT",
            entry_price=50000.0,
            position_size=0.1,
            stop_loss=48000.0,
            take_profit=52000.0,
            stop_loss_type="fixed",
            take_profit_type="fixed",
            current_price=50000.0,
            portfolio_value=10000.0,
            leverage=5.0  # Exceeds max leverage of 1.0
        )
        
        risk_metrics = self.risk_service.calculate_risk_metrics(
            leveraged_trade, self.default_config
        )
        
        assert risk_metrics.is_risky
        assert any("Leverage" in violation for violation in risk_metrics.violations)
    
    def test_calculate_risk_metrics_poor_risk_reward_ratio(self):
        """Test poor risk:reward ratio warning"""
        poor_rr_trade = TradeData(
            symbol="BTC/USDT",
            entry_price=50000.0,
            position_size=0.1,
            stop_loss=48000.0,
            take_profit=50100.0,  # Very close take profit
            stop_loss_type="fixed",
            take_profit_type="fixed",
            current_price=50000.0,
            portfolio_value=10000.0,
            leverage=1.0
        )
        
        risk_metrics = self.risk_service.calculate_risk_metrics(
            poor_rr_trade, self.default_config
        )
        
        # Risk:reward ratio should be poor
        assert risk_metrics.risk_reward_ratio < 1.0
        assert any("Risk:reward ratio" in warning for warning in risk_metrics.warnings)
    
    def test_validate_trade_approved(self):
        """Test trade validation for approved trade"""
        result = self.risk_service.validate_trade(self.sample_trade, self.default_config)
        
        assert result.status == "approved"
        assert "approved" in result.message.lower()
        assert not result.risk_metrics.is_risky
    
    def test_validate_trade_rejected(self):
        """Test trade validation for rejected trade"""
        risky_trade = TradeData(
            symbol="BTC/USDT",
            entry_price=50000.0,
            position_size=0.5,  # Exceeds max position size
            stop_loss=48000.0,
            take_profit=52000.0,
            stop_loss_type="fixed",
            take_profit_type="fixed",
            current_price=50000.0,
            portfolio_value=10000.0,
            leverage=1.0
        )
        
        result = self.risk_service.validate_trade(risky_trade, self.default_config)
        
        assert result.status == "rejected"
        assert "rejected" in result.message.lower()
        assert result.risk_metrics.is_risky
    
    def test_validate_trade_warning(self):
        """Test trade validation for trade with warnings"""
        warning_trade = TradeData(
            symbol="BTC/USDT",
            entry_price=50000.0,
            position_size=0.1,
            stop_loss=48000.0,
            take_profit=50100.0,  # Poor risk:reward ratio
            stop_loss_type="fixed",
            take_profit_type="fixed",
            current_price=50000.0,
            portfolio_value=10000.0,
            leverage=1.0
        )
        
        result = self.risk_service.validate_trade(warning_trade, self.default_config)
        
        assert result.status == "warning"
        assert "warning" in result.message.lower()
        assert not result.risk_metrics.is_risky
        assert len(result.risk_metrics.warnings) > 0
    
    def test_get_risk_summary(self):
        """Test risk summary generation"""
        summary = self.risk_service.get_risk_summary(self.sample_trade, self.default_config)
        
        assert "risk_amount" in summary
        assert "reward_amount" in summary
        assert "risk_reward_ratio" in summary
        assert "portfolio_risk_percentage" in summary
        assert "position_risk_percentage" in summary
        assert "is_risky" in summary
        assert "violations" in summary
        assert "warnings" in summary
        assert "recommendations" in summary
    
    def test_calculate_max_position_size(self):
        """Test maximum position size calculation"""
        max_size = self.risk_service.calculate_max_position_size(
            entry_price=50000.0,
            stop_loss=48000.0,
            stop_loss_type="fixed",
            portfolio_value=10000.0,
            max_risk_percentage=0.02  # 2%
        )
        
        # Max risk amount: 10000 * 0.02 = 200
        # Risk per share: 50000 - 48000 = 2000
        # Max position size: 200 / 2000 = 0.1
        expected = (10000.0 * 0.02) / abs(50000.0 - 48000.0)
        assert max_size == expected
    
    def test_calculate_optimal_take_profit(self):
        """Test optimal take profit calculation"""
        optimal_tp = self.risk_service.calculate_optimal_take_profit(
            entry_price=50000.0,
            stop_loss=48000.0,
            stop_loss_type="fixed",
            min_risk_reward_ratio=2.0
        )
        
        # Risk amount: 50000 - 48000 = 2000
        # Reward amount: 2000 * 2.0 = 4000
        # Optimal TP: 50000 + 4000 = 54000
        expected = 50000.0 + (abs(50000.0 - 48000.0) * 2.0)
        assert optimal_tp == expected
    
    def test_percentage_stop_loss_calculation(self):
        """Test percentage-based stop loss calculation"""
        trade = TradeData(
            symbol="BTC/USDT",
            entry_price=50000.0,
            position_size=0.1,
            stop_loss=4.0,  # 4% stop loss
            take_profit=52000.0,
            stop_loss_type="percentage",
            take_profit_type="fixed",
            current_price=50000.0,
            portfolio_value=10000.0,
            leverage=1.0
        )
        
        risk_metrics = self.risk_service.calculate_risk_metrics(trade, self.default_config)
        
        # Actual stop loss: 50000 * (1 - 4/100) = 48000
        # Risk amount: (50000 - 48000) * 0.1 = 200
        assert risk_metrics.risk_amount == 200.0
    
    def test_percentage_take_profit_calculation(self):
        """Test percentage-based take profit calculation"""
        trade = TradeData(
            symbol="BTC/USDT",
            entry_price=50000.0,
            position_size=0.1,
            stop_loss=48000.0,
            take_profit=4.0,  # 4% take profit
            stop_loss_type="fixed",
            take_profit_type="percentage",
            current_price=50000.0,
            portfolio_value=10000.0,
            leverage=1.0
        )
        
        risk_metrics = self.risk_service.calculate_risk_metrics(trade, self.default_config)
        
        # Actual take profit: 50000 * (1 + 4/100) = 52000
        # Reward amount: (52000 - 50000) * 0.1 = 200
        assert risk_metrics.reward_amount == 200.0
    
    def test_edge_case_zero_risk_amount(self):
        """Test edge case where risk amount is zero"""
        trade = TradeData(
            symbol="BTC/USDT",
            entry_price=50000.0,
            position_size=0.1,
            stop_loss=50000.0,  # Same as entry price
            take_profit=52000.0,
            stop_loss_type="fixed",
            take_profit_type="fixed",
            current_price=50000.0,
            portfolio_value=10000.0,
            leverage=1.0
        )
        
        risk_metrics = self.risk_service.calculate_risk_metrics(trade, self.default_config)
        
        assert risk_metrics.risk_amount == 0.0
        assert risk_metrics.risk_reward_ratio == 0.0  # Should handle division by zero
    
    def test_suggested_adjustments_generation(self):
        """Test generation of suggested adjustments"""
        risky_trade = TradeData(
            symbol="BTC/USDT",
            entry_price=50000.0,
            position_size=0.5,  # Exceeds max position size
            stop_loss=48000.0,
            take_profit=50100.0,  # Poor risk:reward ratio
            stop_loss_type="fixed",
            take_profit_type="fixed",
            current_price=50000.0,
            portfolio_value=10000.0,
            leverage=1.0
        )
        
        result = self.risk_service.validate_trade(risky_trade, self.default_config)
        
        assert result.suggested_adjustments is not None
        assert "recommendations" in result.suggested_adjustments
        assert len(result.suggested_adjustments["recommendations"]) > 0


class TestRiskConfig:
    """Test cases for RiskConfig class"""
    
    def test_risk_config_creation(self):
        """Test RiskConfig creation with default values"""
        config = RiskConfig(
            max_portfolio_risk=0.02,
            max_position_size=0.1,
            max_risk_per_trade=0.01,
            max_drawdown=0.05
        )
        
        assert config.max_portfolio_risk == 0.02
        assert config.max_position_size == 0.1
        assert config.max_risk_per_trade == 0.01
        assert config.max_drawdown == 0.05
        assert config.min_risk_reward_ratio == 1.0  # Default value
        assert config.max_leverage == 1.0  # Default value


class TestTradeData:
    """Test cases for TradeData class"""
    
    def test_trade_data_creation(self):
        """Test TradeData creation"""
        trade = TradeData(
            symbol="BTC/USDT",
            entry_price=50000.0,
            position_size=0.1,
            stop_loss=48000.0,
            take_profit=52000.0,
            stop_loss_type="fixed",
            take_profit_type="fixed",
            current_price=50000.0,
            portfolio_value=10000.0
        )
        
        assert trade.symbol == "BTC/USDT"
        assert trade.entry_price == 50000.0
        assert trade.position_size == 0.1
        assert trade.leverage == 1.0  # Default value


if __name__ == "__main__":
    pytest.main([__file__])