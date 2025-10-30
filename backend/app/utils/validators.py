"""
Validation utilities for the Auto Trading App.
"""

from typing import Dict, Any

def validate_order_data(order_data: Dict[str, Any]) -> bool:
    """Validate order data."""
    required_fields = ['symbol', 'side', 'quantity', 'price']
    return all(field in order_data for field in required_fields)

def validate_market_hours() -> bool:
    """Validate if market is open."""
    # Simple implementation - in production, check actual market hours
    return True

def validate_symbol(symbol: str) -> bool:
    """Validate trading symbol."""
    return symbol and len(symbol) > 0 and symbol.isalnum()

def validate_signal(signal: str) -> bool:
    """Validate trading signal."""
    valid_signals = ['buy', 'sell', 'hold']
    return signal.lower() in valid_signals

def validate_execution_mode(mode: str) -> bool:
    """Validate execution mode."""
    valid_modes = ['auto', 'manual', 'alert_only']
    return mode.lower() in valid_modes

def validate_timeframe(timeframe: str) -> bool:
    """Validate timeframe."""
    valid_timeframes = ['1m', '5m', '15m', '1h', '4h', '1d', '1w', '1M']
    return timeframe in valid_timeframes
