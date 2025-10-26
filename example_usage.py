#!/usr/bin/env python3
"""
Example usage of the FormulaEngine system.

This script demonstrates how to:
1. Set up a FormulaEngine with custom services
2. Create and evaluate trading formulas
3. Handle signals with auto-execution and notifications
4. Run periodic evaluation
5. Monitor statistics and performance
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, List

from formula_engine import (
    FormulaEngine, Formula, MarketData, TradingSignal, SignalType, 
    ExecutionMode, PythonFormulaEvaluator, EmailNotificationService,
    WebhookNotificationService, MockTradingExecutor
)


class CustomMarketDataProvider:
    """Custom market data provider that simulates real market data."""
    
    def __init__(self):
        self.price_history = {}
        self.volatility = 0.02  # 2% daily volatility
    
    async def fetch_market_data(self, symbols: List[str]) -> Dict[str, MarketData]:
        """Fetch market data for given symbols."""
        market_data = {}
        current_time = datetime.now()
        
        for symbol in symbols:
            # Simulate price movement with random walk
            if symbol not in self.price_history:
                self.price_history[symbol] = 100.0  # Starting price
            
            # Simple random walk with drift
            import random
            change = random.uniform(-self.volatility, self.volatility)
            new_price = self.price_history[symbol] * (1 + change)
            self.price_history[symbol] = new_price
            
            # Create OHLC data
            open_price = new_price * (1 + random.uniform(-0.01, 0.01))
            high_price = max(open_price, new_price) * (1 + random.uniform(0, 0.02))
            low_price = min(open_price, new_price) * (1 - random.uniform(0, 0.02))
            close_price = new_price
            
            market_data[symbol] = MarketData(
                symbol=symbol,
                price=close_price,
                volume=int(1000000 + random.uniform(-200000, 200000)),
                timestamp=current_time,
                open_price=open_price,
                high_price=high_price,
                low_price=low_price,
                close_price=close_price,
                additional_data={
                    'sector': self._get_sector(symbol),
                    'market_cap': int(new_price * 1000000),  # Simulated market cap
                    'pe_ratio': random.uniform(10, 30)
                }
            )
        
        return market_data
    
    def _get_sector(self, symbol: str) -> str:
        """Get sector for a symbol."""
        sectors = {
            'AAPL': 'Technology',
            'GOOGL': 'Technology',
            'MSFT': 'Technology',
            'TSLA': 'Automotive',
            'AMZN': 'Consumer Discretionary',
            'NVDA': 'Technology',
            'META': 'Technology',
            'NFLX': 'Consumer Discretionary'
        }
        return sectors.get(symbol, 'Unknown')


class CustomTradingExecutor:
    """Custom trading executor that logs trades and simulates execution."""
    
    def __init__(self):
        self.trades = []
        self.balance = 100000.0  # Starting balance
        self.positions = {}  # symbol -> quantity
    
    async def execute_signal(self, signal: TradingSignal) -> bool:
        """Execute a trading signal."""
        try:
            trade_info = {
                'timestamp': signal.timestamp,
                'symbol': signal.symbol,
                'signal_type': signal.signal_type.value,
                'price': signal.price,
                'confidence': signal.confidence,
                'user_id': signal.user_id,
                'formula_id': signal.formula_id
            }
            
            # Simulate trade execution based on signal type
            if signal.signal_type in [SignalType.ENTRY_LONG, SignalType.ENTRY_SHORT]:
                # Calculate position size (simplified)
                position_size = min(1000, self.balance * 0.1 / signal.price)  # 10% of balance
                
                if signal.signal_type == SignalType.ENTRY_LONG:
                    cost = position_size * signal.price
                    if cost <= self.balance:
                        self.balance -= cost
                        self.positions[signal.symbol] = self.positions.get(signal.symbol, 0) + position_size
                        trade_info['action'] = 'BUY'
                        trade_info['quantity'] = position_size
                        trade_info['cost'] = cost
                    else:
                        trade_info['action'] = 'INSUFFICIENT_FUNDS'
                        trade_info['quantity'] = 0
                        trade_info['cost'] = 0
                
                elif signal.signal_type == SignalType.ENTRY_SHORT:
                    # Simplified short selling
                    trade_info['action'] = 'SELL_SHORT'
                    trade_info['quantity'] = position_size
                    trade_info['cost'] = 0  # Short selling doesn't require upfront cost
            
            elif signal.signal_type in [SignalType.EXIT_LONG, SignalType.EXIT_SHORT]:
                if signal.symbol in self.positions:
                    quantity = self.positions[signal.symbol]
                    if signal.signal_type == SignalType.EXIT_LONG:
                        proceeds = quantity * signal.price
                        self.balance += proceeds
                        self.positions[signal.symbol] = 0
                        trade_info['action'] = 'SELL'
                        trade_info['quantity'] = quantity
                        trade_info['proceeds'] = proceeds
                    elif signal.signal_type == SignalType.EXIT_SHORT:
                        trade_info['action'] = 'COVER_SHORT'
                        trade_info['quantity'] = quantity
            else:
                # HOLD signal - no action needed
                trade_info['action'] = 'HOLD'
                trade_info['quantity'] = 0
                trade_info['cost'] = 0
            
            self.trades.append(trade_info)
            
            # Log the trade
            logging.info(f"Trade executed: {trade_info['action']} {trade_info['quantity']} {signal.symbol} at {signal.price}")
            
            return True
            
        except Exception as e:
            logging.error(f"Trade execution failed: {str(e)}")
            return False
    
    def get_portfolio_summary(self) -> Dict:
        """Get current portfolio summary."""
        total_value = self.balance
        for symbol, quantity in self.positions.items():
            if quantity > 0:
                # In a real system, you'd fetch current price
                total_value += quantity * 100  # Simplified current price
        
        return {
            'balance': self.balance,
            'positions': self.positions,
            'total_value': total_value,
            'total_trades': len(self.trades)
        }


async def create_sample_formulas() -> List[Formula]:
    """Create sample trading formulas for demonstration."""
    formulas = [
        # Moving Average Crossover Strategy
        Formula(
            id="ma_crossover_1",
            user_id="trader_1",
            name="SMA Crossover Strategy",
            code="""
# Simple Moving Average Crossover Strategy
symbol = 'AAPL'
if symbol in market_data:
    data = market_data[symbol]
    current_price = data.price
    
    # Calculate simple moving averages (simplified)
    sma_short = current_price * 0.99  # Simulated 20-day SMA
    sma_long = current_price * 1.01   # Simulated 50-day SMA
    
    if sma_short > sma_long and current_price > sma_short:
        signal = {
            'signal_type': 'entry_long',
            'confidence': 0.8,
            'price': current_price,
            'symbol': symbol,
            'metadata': {
                'strategy': 'SMA Crossover',
                'sma_short': sma_short,
                'sma_long': sma_long,
                'reason': 'Golden cross detected'
            }
        }
    elif sma_short < sma_long and current_price < sma_short:
        signal = {
            'signal_type': 'exit_long',
            'confidence': 0.7,
            'price': current_price,
            'symbol': symbol,
            'metadata': {
                'strategy': 'SMA Crossover',
                'sma_short': sma_short,
                'sma_long': sma_long,
                'reason': 'Death cross detected'
            }
        }
    else:
        signal = {
            'signal_type': 'hold',
            'confidence': 0.5,
            'price': current_price,
            'symbol': symbol,
            'metadata': {
                'strategy': 'SMA Crossover',
                'sma_short': sma_short,
                'sma_long': sma_long,
                'reason': 'No clear signal'
            }
        }
else:
    signal = {
        'signal_type': 'hold',
        'confidence': 0.0,
        'price': 0.0,
        'symbol': 'UNKNOWN',
        'metadata': {'error': 'Symbol not found'}
    }
""",
            symbols=['AAPL', 'GOOGL'],
            execution_mode=ExecutionMode.AUTO
        ),
        
        # RSI Mean Reversion Strategy
        Formula(
            id="rsi_mean_reversion_1",
            user_id="trader_2",
            name="RSI Mean Reversion",
            code="""
# RSI Mean Reversion Strategy
symbol = 'TSLA'
if symbol in market_data:
    data = market_data[symbol]
    current_price = data.price
    
    # Simulate RSI calculation (simplified)
    rsi = 30 + (hash(str(data.timestamp)) % 40)  # Random RSI between 30-70
    
    if rsi < 30:  # Oversold
        signal = {
            'signal_type': 'entry_long',
            'confidence': 0.9,
            'price': current_price,
            'symbol': symbol,
            'metadata': {
                'strategy': 'RSI Mean Reversion',
                'rsi': rsi,
                'reason': 'Oversold condition'
            }
        }
    elif rsi > 70:  # Overbought
        signal = {
            'signal_type': 'entry_short',
            'confidence': 0.8,
            'price': current_price,
            'symbol': symbol,
            'metadata': {
                'strategy': 'RSI Mean Reversion',
                'rsi': rsi,
                'reason': 'Overbought condition'
            }
        }
    else:
        signal = {
            'signal_type': 'hold',
            'confidence': 0.3,
            'price': current_price,
            'symbol': symbol,
            'metadata': {
                'strategy': 'RSI Mean Reversion',
                'rsi': rsi,
                'reason': 'Neutral RSI'
            }
        }
else:
    signal = {
        'signal_type': 'hold',
        'confidence': 0.0,
        'price': 0.0,
        'symbol': 'UNKNOWN',
        'metadata': {'error': 'Symbol not found'}
    }
""",
            symbols=['TSLA', 'NVDA'],
            execution_mode=ExecutionMode.NOTIFICATION
        ),
        
        # Breakout Strategy
        Formula(
            id="breakout_strategy_1",
            user_id="trader_3",
            name="Price Breakout Strategy",
            code="""
# Price Breakout Strategy
symbol = 'AMZN'
if symbol in market_data:
    data = market_data[symbol]
    current_price = data.price
    
    # Simulate support and resistance levels
    support = current_price * 0.95
    resistance = current_price * 1.05
    
    if current_price > resistance:
        signal = {
            'signal_type': 'entry_long',
            'confidence': 0.85,
            'price': current_price,
            'symbol': symbol,
            'metadata': {
                'strategy': 'Breakout',
                'support': support,
                'resistance': resistance,
                'reason': 'Price broke above resistance'
            }
        }
    elif current_price < support:
        signal = {
            'signal_type': 'entry_short',
            'confidence': 0.75,
            'price': current_price,
            'symbol': symbol,
            'metadata': {
                'strategy': 'Breakout',
                'support': support,
                'resistance': resistance,
                'reason': 'Price broke below support'
            }
        }
    else:
        signal = {
            'signal_type': 'hold',
            'confidence': 0.4,
            'price': current_price,
            'symbol': symbol,
            'metadata': {
                'strategy': 'Breakout',
                'support': support,
                'resistance': resistance,
                'reason': 'Price within range'
            }
        }
else:
    signal = {
        'signal_type': 'hold',
        'confidence': 0.0,
        'price': 0.0,
        'symbol': 'UNKNOWN',
        'metadata': {'error': 'Symbol not found'}
    }
""",
            symbols=['AMZN', 'META'],
            execution_mode=ExecutionMode.AUTO
        )
    ]
    
    return formulas


async def main():
    """Main example function."""
    # Setup logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)
    
    logger.info("Starting FormulaEngine example")
    
    # Create custom services
    market_data_provider = CustomMarketDataProvider()
    trading_executor = CustomTradingExecutor()
    
    # Create notification service (mock for demo)
    notification_service = EmailNotificationService({
        'smtp_server': 'smtp.gmail.com',
        'smtp_port': 587,
        'username': 'demo@example.com',
        'password': 'demo_password'
    })
    
    # Create custom formula provider
    async def custom_formula_provider():
        return await create_sample_formulas()
    
    # Create FormulaEngine
    engine = FormulaEngine(
        market_data_provider=market_data_provider.fetch_market_data,
        user_formula_provider=custom_formula_provider,
        notification_service=notification_service,
        trading_executor=trading_executor,
        evaluation_interval=30  # 30 seconds for demo
    )
    
    logger.info("FormulaEngine initialized")
    
    # Run several evaluation cycles
    for cycle in range(5):
        logger.info(f"Running evaluation cycle {cycle + 1}")
        
        # Evaluate all formulas
        signals = await engine.evaluate_all_formulas()
        
        # Print results
        logger.info(f"Generated {len(signals)} signals in cycle {cycle + 1}")
        for signal in signals:
            logger.info(f"Signal: {signal.signal_type.value} {signal.symbol} at {signal.price:.2f} (confidence: {signal.confidence:.2f})")
        
        # Print statistics
        stats = engine.get_statistics()
        logger.info(f"Statistics: {stats}")
        
        # Print portfolio summary
        portfolio = trading_executor.get_portfolio_summary()
        logger.info(f"Portfolio: Balance=${portfolio['balance']:.2f}, Value=${portfolio['total_value']:.2f}, Trades={portfolio['total_trades']}")
        
        # Wait before next cycle
        if cycle < 4:  # Don't wait after the last cycle
            logger.info("Waiting 30 seconds before next cycle...")
            await asyncio.sleep(30)
    
    logger.info("Example completed")


if __name__ == "__main__":
    asyncio.run(main())