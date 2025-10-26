# FormulaEngine

A comprehensive Python system for evaluating trading formulas and generating signals. The FormulaEngine evaluates subscribed formulas for all users at regular intervals, generates trading signals based on market data, and handles auto-execution or notifications based on user preferences.

## Features

- **Async/Await Support**: Built with modern Python async patterns for efficient processing
- **Flexible Formula Evaluation**: Support for Python-based trading formulas with safe execution
- **Signal Generation**: Generate entry/exit signals with confidence scoring
- **Auto-Execution**: Automatically execute trades based on formula results
- **Notification System**: Send notifications for manual review when auto-execution is disabled
- **Celery Integration**: Built-in support for Celery task scheduling
- **Comprehensive Logging**: Detailed logging and statistics tracking
- **Modular Design**: Easily extensible with custom evaluators, executors, and notification services
- **Test Suite**: Comprehensive test coverage with unit, integration, and performance tests

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd formula-engine
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. (Optional) Install Redis for Celery:
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Start Redis
redis-server
```

## Quick Start

### Basic Usage

```python
import asyncio
from formula_engine import FormulaEngine

async def main():
    # Create a FormulaEngine instance
    engine = FormulaEngine()
    
    # Run a single evaluation cycle
    signals = await engine.evaluate_all_formulas()
    print(f"Generated {len(signals)} signals")
    
    # Start periodic evaluation (every 5 minutes)
    await engine.start_periodic_evaluation()

if __name__ == "__main__":
    asyncio.run(main())
```

### Custom Configuration

```python
from formula_engine import (
    FormulaEngine, EmailNotificationService, 
    MockTradingExecutor, ExecutionMode
)

# Create custom services
notification_service = EmailNotificationService({
    'smtp_server': 'smtp.gmail.com',
    'smtp_port': 587,
    'username': 'your_email@gmail.com',
    'password': 'your_password'
})

trading_executor = MockTradingExecutor()

# Create FormulaEngine with custom services
engine = FormulaEngine(
    notification_service=notification_service,
    trading_executor=trading_executor,
    evaluation_interval=300  # 5 minutes
)
```

## Architecture

### Core Components

1. **FormulaEngine**: Main orchestrator class
2. **FormulaEvaluator**: Evaluates trading formulas (PythonFormulaEvaluator)
3. **TradingExecutor**: Executes trading signals (MockTradingExecutor)
4. **NotificationService**: Sends notifications (EmailNotificationService, WebhookNotificationService)
5. **MarketDataProvider**: Fetches market data
6. **UserFormulaProvider**: Fetches user formulas

### Data Models

- **Formula**: Trading formula definition with code and metadata
- **MarketData**: Market data structure with OHLCV data
- **TradingSignal**: Generated trading signal with confidence and metadata
- **SignalType**: Enum for signal types (ENTRY_LONG, ENTRY_SHORT, EXIT_LONG, EXIT_SHORT, HOLD)
- **ExecutionMode**: Enum for execution modes (AUTO, NOTIFICATION)

## Writing Trading Formulas

Formulas are written in Python and must set a `signal` variable with the following structure:

```python
# Example: Simple Moving Average Crossover
symbol = 'AAPL'
if symbol in market_data:
    data = market_data[symbol]
    current_price = data.price
    
    # Calculate moving averages (simplified)
    sma_short = current_price * 0.99  # 20-day SMA
    sma_long = current_price * 1.01   # 50-day SMA
    
    if sma_short > sma_long:
        signal = {
            'signal_type': 'entry_long',
            'confidence': 0.8,
            'price': current_price,
            'symbol': symbol,
            'metadata': {
                'sma_short': sma_short,
                'sma_long': sma_long,
                'strategy': 'SMA Crossover'
            }
        }
    else:
        signal = {
            'signal_type': 'hold',
            'confidence': 0.5,
            'price': current_price,
            'symbol': symbol,
            'metadata': {'reason': 'No crossover signal'}
        }
else:
    signal = {
        'signal_type': 'hold',
        'confidence': 0.0,
        'price': 0.0,
        'symbol': 'UNKNOWN',
        'metadata': {'error': 'Symbol not found'}
    }
```

### Available Variables in Formula Context

- `market_data`: Dictionary of MarketData objects keyed by symbol
- `symbols`: List of available symbols
- `current_time`: Current datetime
- `SignalType`: Enum for signal types
- `datetime`: Python datetime module
- `math`: Python math module
- `numpy`: NumPy (if available)
- `pandas`: Pandas (if available)

## Celery Integration

For production use with Celery task scheduling:

```python
from formula_engine import celery_app

# Start Celery worker
# celery -A formula_engine worker --loglevel=info

# Start Celery beat scheduler
# celery -A formula_engine beat --loglevel=info
```

The system includes pre-configured Celery tasks and beat schedules for periodic evaluation.

## Testing

Run the comprehensive test suite:

```bash
# Run all tests
pytest test_formula_engine.py -v

# Run specific test categories
pytest test_formula_engine.py::TestFormulaEngine -v
pytest test_formula_engine.py::TestPerformance -v

# Run with coverage
pytest test_formula_engine.py --cov=formula_engine --cov-report=html
```

## Example Usage

See `example_usage.py` for a complete example that demonstrates:

- Custom market data provider
- Custom trading executor with portfolio tracking
- Multiple trading strategies
- Signal processing and execution
- Statistics monitoring

Run the example:

```bash
python example_usage.py
```

## Configuration

### Environment Variables

- `CELERY_BROKER_URL`: Redis URL for Celery (default: redis://localhost:6379/0)
- `CELERY_RESULT_BACKEND`: Redis URL for Celery results
- `LOG_LEVEL`: Logging level (default: INFO)

### Custom Providers

You can provide custom implementations for:

```python
# Custom market data provider
async def my_market_data_provider(symbols):
    # Fetch real market data from API
    return market_data_dict

# Custom user formula provider
async def my_user_formula_provider():
    # Fetch formulas from database
    return formula_list

engine = FormulaEngine(
    market_data_provider=my_market_data_provider,
    user_formula_provider=my_user_formula_provider
)
```

## Monitoring and Statistics

The FormulaEngine tracks comprehensive statistics:

```python
stats = engine.get_statistics()
print(f"Total evaluations: {stats['total_evaluations']}")
print(f"Successful evaluations: {stats['successful_evaluations']}")
print(f"Signals generated: {stats['signals_generated']}")
print(f"Auto executions: {stats['auto_executions']}")
print(f"Notifications sent: {stats['notifications_sent']}")
```

## Error Handling

The system includes comprehensive error handling:

- Formula evaluation errors are logged and don't stop the entire process
- Market data fetch failures are handled gracefully
- Signal processing errors are logged with context
- Statistics track both successful and failed operations

## Security Considerations

- Formula code execution is sandboxed with limited builtins
- No file system or network access in formula context
- Input validation for all data structures
- Safe handling of user-provided code

## Performance

- Async/await for non-blocking I/O operations
- Efficient batch processing of formulas
- Configurable evaluation intervals
- Memory-efficient data structures
- Comprehensive performance tests included

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions, issues, or contributions, please open an issue on the GitHub repository.