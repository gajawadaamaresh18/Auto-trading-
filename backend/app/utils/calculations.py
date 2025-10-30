"""
Calculation utilities for the Auto Trading App.
"""

from typing import List, Dict, Any

def calculate_technical_indicators(data: List[float], indicators: List[str]) -> Dict[str, float]:
    """Calculate technical indicators."""
    result = {}
    
    for indicator in indicators:
        if indicator == 'sma_20':
            result['sma_20'] = sum(data[-20:]) / 20 if len(data) >= 20 else 0
        elif indicator == 'rsi_14':
            result['rsi_14'] = 50.0  # Placeholder
        elif indicator == 'macd':
            result['macd'] = 0.0  # Placeholder
        elif indicator == 'bollinger_upper':
            result['bollinger_upper'] = data[-1] * 1.02 if data else 0
        elif indicator == 'bollinger_lower':
            result['bollinger_lower'] = data[-1] * 0.98 if data else 0
    
    return result

def calculate_risk_metrics(position_size: float, stop_loss: float, take_profit: float) -> Dict[str, float]:
    """Calculate risk metrics."""
    risk_amount = position_size * (stop_loss / 100) if stop_loss else 0
    reward_amount = position_size * (take_profit / 100) if take_profit else 0
    risk_reward_ratio = reward_amount / risk_amount if risk_amount > 0 else 0
    
    return {
        'risk_amount': risk_amount,
        'reward_amount': reward_amount,
        'risk_reward_ratio': risk_reward_ratio
    }

def calculate_position_size(account_value: float, risk_percentage: float, stop_loss_percentage: float) -> float:
    """Calculate position size based on risk."""
    if stop_loss_percentage <= 0:
        return 0
    
    risk_amount = account_value * (risk_percentage / 100)
    position_size = risk_amount / (stop_loss_percentage / 100)
    return position_size
