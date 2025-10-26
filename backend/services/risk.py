"""
Risk Control Service

This module provides comprehensive risk management functionality for trading operations.
It validates trades against user-configured risk parameters and provides detailed
feedback on risk metrics and potential violations.
"""

from typing import Dict, List, Tuple, Optional, Union
from dataclasses import dataclass
from enum import Enum
import math


class StopLossType(Enum):
    """Stop loss calculation types"""
    FIXED = "fixed"
    PERCENTAGE = "percentage"
    TRAILING = "trailing"


class TakeProfitType(Enum):
    """Take profit calculation types"""
    FIXED = "fixed"
    PERCENTAGE = "percentage"
    TRAILING = "trailing"


@dataclass
class RiskConfig:
    """Risk configuration parameters"""
    max_portfolio_risk: float  # Maximum portfolio risk as decimal (e.g., 0.02 for 2%)
    max_position_size: float   # Maximum position size as decimal (e.g., 0.1 for 10%)
    max_risk_per_trade: float  # Maximum risk per trade as decimal (e.g., 0.01 for 1%)
    max_drawdown: float        # Maximum drawdown as decimal (e.g., 0.05 for 5%)
    min_risk_reward_ratio: float = 1.0  # Minimum risk:reward ratio
    max_leverage: float = 1.0  # Maximum leverage allowed


@dataclass
class TradeData:
    """Trade data structure"""
    symbol: str
    entry_price: float
    position_size: float
    stop_loss: float
    take_profit: float
    stop_loss_type: str
    take_profit_type: str
    current_price: float
    portfolio_value: float
    leverage: float = 1.0


@dataclass
class RiskMetrics:
    """Risk metrics calculation results"""
    risk_amount: float
    reward_amount: float
    risk_reward_ratio: float
    portfolio_risk_percentage: float
    position_risk_percentage: float
    leverage_risk: float
    is_risky: bool
    violations: List[str]
    warnings: List[str]
    recommendations: List[str]


@dataclass
class RiskValidationResult:
    """Risk validation result"""
    status: str  # 'approved', 'rejected', 'warning'
    message: str
    risk_metrics: RiskMetrics
    suggested_adjustments: Optional[Dict[str, float]] = None


class RiskService:
    """
    Risk management service that validates trades against risk parameters
    and provides comprehensive risk analysis.
    """
    
    def __init__(self):
        self.default_config = RiskConfig(
            max_portfolio_risk=0.02,    # 2%
            max_position_size=0.1,      # 10%
            max_risk_per_trade=0.01,    # 1%
            max_drawdown=0.05,          # 5%
            min_risk_reward_ratio=1.0,
            max_leverage=1.0
        )
    
    def calculate_stop_loss_price(
        self, 
        entry_price: float, 
        stop_loss_value: float, 
        stop_loss_type: str
    ) -> float:
        """Calculate actual stop loss price based on type"""
        if stop_loss_type == StopLossType.PERCENTAGE.value:
            return entry_price * (1 - stop_loss_value / 100)
        elif stop_loss_type == StopLossType.TRAILING.value:
            # For trailing stop, assume stop_loss_value is the trailing distance
            return entry_price * (1 - stop_loss_value / 100)
        else:  # FIXED
            return stop_loss_value
    
    def calculate_take_profit_price(
        self, 
        entry_price: float, 
        take_profit_value: float, 
        take_profit_type: str
    ) -> float:
        """Calculate actual take profit price based on type"""
        if take_profit_type == TakeProfitType.PERCENTAGE.value:
            return entry_price * (1 + take_profit_value / 100)
        elif take_profit_type == TakeProfitType.TRAILING.value:
            # For trailing take profit, assume take_profit_value is the trailing distance
            return entry_price * (1 + take_profit_value / 100)
        else:  # FIXED
            return take_profit_value
    
    def calculate_risk_metrics(
        self, 
        trade: TradeData, 
        config: RiskConfig
    ) -> RiskMetrics:
        """Calculate comprehensive risk metrics for a trade"""
        
        # Calculate actual stop loss and take profit prices
        actual_stop_loss = self.calculate_stop_loss_price(
            trade.entry_price, trade.stop_loss, trade.stop_loss_type
        )
        actual_take_profit = self.calculate_take_profit_price(
            trade.entry_price, trade.take_profit, trade.take_profit_type
        )
        
        # Calculate risk and reward amounts
        risk_amount = abs(trade.entry_price - actual_stop_loss) * trade.position_size
        reward_amount = abs(actual_take_profit - trade.entry_price) * trade.position_size
        
        # Calculate risk:reward ratio
        risk_reward_ratio = reward_amount / risk_amount if risk_amount > 0 else 0
        
        # Calculate portfolio risk percentages
        portfolio_risk_percentage = (risk_amount / trade.portfolio_value) * 100
        position_risk_percentage = (trade.position_size * trade.entry_price / trade.portfolio_value) * 100
        
        # Calculate leverage risk
        leverage_risk = trade.leverage * position_risk_percentage
        
        # Check for violations and warnings
        violations = []
        warnings = []
        recommendations = []
        
        # Portfolio risk check
        if portfolio_risk_percentage > config.max_portfolio_risk * 100:
            violations.append(
                f"Portfolio risk ({portfolio_risk_percentage:.2f}%) exceeds maximum "
                f"({config.max_portfolio_risk * 100:.2f}%)"
            )
        
        # Position size check
        if position_risk_percentage > config.max_position_size * 100:
            violations.append(
                f"Position size ({position_risk_percentage:.2f}%) exceeds maximum "
                f"({config.max_position_size * 100:.2f}%)"
            )
        
        # Risk per trade check
        if portfolio_risk_percentage > config.max_risk_per_trade * 100:
            violations.append(
                f"Risk per trade ({portfolio_risk_percentage:.2f}%) exceeds maximum "
                f"({config.max_risk_per_trade * 100:.2f}%)"
            )
        
        # Leverage check
        if trade.leverage > config.max_leverage:
            violations.append(
                f"Leverage ({trade.leverage:.2f}x) exceeds maximum ({config.max_leverage:.2f}x)"
            )
        
        # Risk:reward ratio check
        if risk_reward_ratio < config.min_risk_reward_ratio:
            warnings.append(
                f"Risk:reward ratio ({risk_reward_ratio:.2f}) is below minimum "
                f"({config.min_risk_reward_ratio:.2f})"
            )
        
        # Leverage risk check
        if leverage_risk > config.max_portfolio_risk * 100:
            warnings.append(
                f"Leverage risk ({leverage_risk:.2f}%) exceeds portfolio risk limit"
            )
        
        # Generate recommendations
        if violations or warnings:
            if portfolio_risk_percentage > config.max_portfolio_risk * 100:
                suggested_size = (config.max_portfolio_risk * trade.portfolio_value) / abs(trade.entry_price - actual_stop_loss)
                recommendations.append(f"Reduce position size to {suggested_size:.4f}")
            
            if position_risk_percentage > config.max_position_size * 100:
                suggested_size = (config.max_position_size * trade.portfolio_value) / trade.entry_price
                recommendations.append(f"Reduce position size to {suggested_size:.4f}")
            
            if risk_reward_ratio < config.min_risk_reward_ratio:
                suggested_tp = trade.entry_price + (risk_amount / trade.position_size) * config.min_risk_reward_ratio
                recommendations.append(f"Adjust take profit to {suggested_tp:.2f} for better R:R ratio")
        
        is_risky = len(violations) > 0
        
        return RiskMetrics(
            risk_amount=risk_amount,
            reward_amount=reward_amount,
            risk_reward_ratio=risk_reward_ratio,
            portfolio_risk_percentage=portfolio_risk_percentage,
            position_risk_percentage=position_risk_percentage,
            leverage_risk=leverage_risk,
            is_risky=is_risky,
            violations=violations,
            warnings=warnings,
            recommendations=recommendations
        )
    
    def validate_trade(
        self, 
        trade: TradeData, 
        config: Optional[RiskConfig] = None
    ) -> RiskValidationResult:
        """
        Validate a trade against risk parameters and return detailed result
        """
        if config is None:
            config = self.default_config
        
        # Calculate risk metrics
        risk_metrics = self.calculate_risk_metrics(trade, config)
        
        # Determine status
        if risk_metrics.is_risky:
            status = "rejected"
            message = f"Trade rejected due to risk violations: {'; '.join(risk_metrics.violations)}"
        elif risk_metrics.warnings:
            status = "warning"
            message = f"Trade approved with warnings: {'; '.join(risk_metrics.warnings)}"
        else:
            status = "approved"
            message = "Trade approved - all risk parameters within limits"
        
        # Generate suggested adjustments
        suggested_adjustments = None
        if risk_metrics.recommendations:
            suggested_adjustments = {
                "recommendations": risk_metrics.recommendations,
                "suggested_position_size": None,
                "suggested_take_profit": None
            }
            
            # Calculate specific suggestions
            actual_stop_loss = self.calculate_stop_loss_price(
                trade.entry_price, trade.stop_loss, trade.stop_loss_type
            )
            
            if risk_metrics.portfolio_risk_percentage > config.max_portfolio_risk * 100:
                suggested_adjustments["suggested_position_size"] = (
                    config.max_portfolio_risk * trade.portfolio_value
                ) / abs(trade.entry_price - actual_stop_loss)
            
            if risk_metrics.risk_reward_ratio < config.min_risk_reward_ratio:
                suggested_adjustments["suggested_take_profit"] = (
                    trade.entry_price + 
                    (risk_metrics.risk_amount / trade.position_size) * config.min_risk_reward_ratio
                )
        
        return RiskValidationResult(
            status=status,
            message=message,
            risk_metrics=risk_metrics,
            suggested_adjustments=suggested_adjustments
        )
    
    def get_risk_summary(self, trade: TradeData, config: Optional[RiskConfig] = None) -> Dict:
        """Get a summary of risk metrics for display"""
        if config is None:
            config = self.default_config
        
        risk_metrics = self.calculate_risk_metrics(trade, config)
        
        return {
            "risk_amount": risk_metrics.risk_amount,
            "reward_amount": risk_metrics.reward_amount,
            "risk_reward_ratio": risk_metrics.risk_reward_ratio,
            "portfolio_risk_percentage": risk_metrics.portfolio_risk_percentage,
            "position_risk_percentage": risk_metrics.position_risk_percentage,
            "leverage_risk": risk_metrics.leverage_risk,
            "is_risky": risk_metrics.is_risky,
            "violations": risk_metrics.violations,
            "warnings": risk_metrics.warnings,
            "recommendations": risk_metrics.recommendations
        }
    
    def calculate_max_position_size(
        self, 
        entry_price: float, 
        stop_loss: float, 
        stop_loss_type: str,
        portfolio_value: float,
        max_risk_percentage: float
    ) -> float:
        """Calculate maximum position size based on risk parameters"""
        actual_stop_loss = self.calculate_stop_loss_price(entry_price, stop_loss, stop_loss_type)
        risk_per_share = abs(entry_price - actual_stop_loss)
        max_risk_amount = portfolio_value * max_risk_percentage
        
        return max_risk_amount / risk_per_share if risk_per_share > 0 else 0
    
    def calculate_optimal_take_profit(
        self, 
        entry_price: float, 
        stop_loss: float, 
        stop_loss_type: str,
        min_risk_reward_ratio: float
    ) -> float:
        """Calculate optimal take profit based on risk:reward ratio"""
        actual_stop_loss = self.calculate_stop_loss_price(entry_price, stop_loss, stop_loss_type)
        risk_amount = abs(entry_price - actual_stop_loss)
        reward_amount = risk_amount * min_risk_reward_ratio
        
        return entry_price + reward_amount