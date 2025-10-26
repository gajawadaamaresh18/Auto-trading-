# Risk Control Backend

Python FastAPI backend for the Risk Control System providing comprehensive risk management and trade validation services.

## Features

- **Risk Service**: Core risk calculation and validation engine
- **RESTful API**: FastAPI-based endpoints for frontend integration
- **Comprehensive Testing**: Full unit test coverage with pytest
- **Configurable Risk Parameters**: Flexible risk management rules
- **Real-time Validation**: Instant trade validation against risk parameters

## Quick Start

### Installation

1. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server**:
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:8000`

### API Documentation

Once running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## Architecture

### Core Components

#### RiskService (`services/risk.py`)
The main risk management engine providing:
- Risk metrics calculation
- Trade validation
- Position sizing recommendations
- Risk parameter enforcement

#### API Endpoints (`main.py`)
FastAPI application with endpoints for:
- Trade validation
- Risk metrics calculation
- Position sizing utilities
- Health monitoring

### Data Models

#### TradeData
```python
@dataclass
class TradeData:
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
```

#### RiskConfig
```python
@dataclass
class RiskConfig:
    max_portfolio_risk: float      # e.g., 0.02 for 2%
    max_position_size: float       # e.g., 0.1 for 10%
    max_risk_per_trade: float      # e.g., 0.01 for 1%
    max_drawdown: float            # e.g., 0.05 for 5%
    min_risk_reward_ratio: float = 1.0
    max_leverage: float = 1.0
```

## API Reference

### Trade Validation

#### `POST /api/risk/validate`
Validates a trade against risk parameters and returns detailed results.

**Request**:
```json
{
  "trade": {
    "symbol": "BTC/USDT",
    "entry_price": 50000.0,
    "position_size": 0.1,
    "stop_loss": 48000.0,
    "take_profit": 52000.0,
    "stop_loss_type": "fixed",
    "take_profit_type": "fixed",
    "current_price": 50000.0,
    "portfolio_value": 10000.0,
    "leverage": 1.0
  },
  "risk_config": {
    "max_portfolio_risk": 0.02,
    "max_position_size": 0.1,
    "max_risk_per_trade": 0.01,
    "max_drawdown": 0.05,
    "min_risk_reward_ratio": 1.0,
    "max_leverage": 1.0
  }
}
```

**Response**:
```json
{
  "status": "approved|rejected|warning",
  "message": "Validation message",
  "risk_metrics": {
    "risk_amount": 200.0,
    "reward_amount": 200.0,
    "risk_reward_ratio": 1.0,
    "portfolio_risk_percentage": 2.0,
    "position_risk_percentage": 50.0,
    "leverage_risk": 50.0,
    "is_risky": false,
    "violations": [],
    "warnings": [],
    "recommendations": []
  },
  "suggested_adjustments": {
    "recommendations": ["Reduce position size to 0.05"],
    "suggested_position_size": 0.05,
    "suggested_take_profit": 54000.0
  }
}
```

### Risk Metrics Calculation

#### `POST /api/risk/calculate`
Calculate risk metrics without validation.

#### `POST /api/risk/calculate-max-position`
Calculate maximum position size based on risk parameters.

**Parameters**:
- `entry_price`: Entry price of the asset
- `stop_loss`: Stop loss value
- `stop_loss_type`: Type of stop loss ("fixed", "percentage", "trailing")
- `portfolio_value`: Total portfolio value
- `max_risk_percentage`: Maximum risk percentage as decimal

#### `POST /api/risk/calculate-optimal-tp`
Calculate optimal take profit based on risk:reward ratio.

**Parameters**:
- `entry_price`: Entry price of the asset
- `stop_loss`: Stop loss value
- `stop_loss_type`: Type of stop loss
- `min_risk_reward_ratio`: Minimum risk:reward ratio

## Testing

### Running Tests

```bash
# Run all tests
python -m pytest

# Run with verbose output
python -m pytest -v

# Run specific test file
python -m pytest tests/test_risk_service.py

# Run with coverage
pip install pytest-cov
python -m pytest --cov=services tests/
```

### Test Structure

- `tests/test_risk_service.py`: Unit tests for the RiskService class
- `tests/test_api.py`: Integration tests for API endpoints

### Test Coverage

The test suite covers:
- Risk calculation accuracy
- Trade validation logic
- API endpoint functionality
- Edge cases and error handling
- Data validation

## Risk Management Logic

### Risk Calculations

1. **Risk Amount**: `|entry_price - stop_loss| * position_size`
2. **Reward Amount**: `|take_profit - entry_price| * position_size`
3. **Risk:Reward Ratio**: `reward_amount / risk_amount`
4. **Portfolio Risk**: `(risk_amount / portfolio_value) * 100`
5. **Position Risk**: `(position_size * entry_price / portfolio_value) * 100`
6. **Leverage Risk**: `leverage * position_risk_percentage`

### Validation Rules

- **Portfolio Risk**: Must not exceed `max_portfolio_risk`
- **Position Size**: Must not exceed `max_position_size`
- **Risk Per Trade**: Must not exceed `max_risk_per_trade`
- **Leverage**: Must not exceed `max_leverage`
- **Risk:Reward Ratio**: Should meet `min_risk_reward_ratio`

### Stop Loss Types

- **Fixed**: Absolute price value
- **Percentage**: Percentage of entry price
- **Trailing**: Dynamic percentage-based stop

### Take Profit Types

- **Fixed**: Absolute price value
- **Percentage**: Percentage of entry price
- **Trailing**: Dynamic percentage-based target

## Configuration

### Environment Variables

- `HOST`: Server host (default: "0.0.0.0")
- `PORT`: Server port (default: 8000)
- `LOG_LEVEL`: Logging level (default: "info")

### Risk Parameters

Default risk configuration:
```python
RiskConfig(
    max_portfolio_risk=0.02,    # 2%
    max_position_size=0.1,      # 10%
    max_risk_per_trade=0.01,    # 1%
    max_drawdown=0.05,          # 5%
    min_risk_reward_ratio=1.0,
    max_leverage=1.0
)
```

## Error Handling

The API provides comprehensive error handling:
- **Validation Errors**: 422 status for invalid input data
- **Calculation Errors**: 400 status for calculation failures
- **Server Errors**: 500 status for unexpected errors

Error responses include detailed messages and suggestions for resolution.

## Performance

- **Fast Calculations**: Optimized risk calculations
- **Async Support**: FastAPI async/await support
- **Caching**: Built-in response caching for repeated calculations
- **Scalability**: Horizontal scaling support

## Security

- **Input Validation**: Pydantic model validation
- **CORS Support**: Configurable CORS for frontend integration
- **Error Sanitization**: Safe error messages without sensitive data

## Monitoring

- **Health Check**: `/health` endpoint for service monitoring
- **Metrics**: Built-in performance metrics
- **Logging**: Comprehensive logging for debugging

## Development

### Adding New Features

1. **Extend RiskService**: Add new methods to `services/risk.py`
2. **Add API Endpoints**: Create new endpoints in `main.py`
3. **Write Tests**: Add comprehensive tests
4. **Update Documentation**: Update this README and API docs

### Code Style

- Follow PEP 8 guidelines
- Use type hints throughout
- Write docstrings for all public methods
- Maintain test coverage above 90%

## Deployment

### Docker

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

### Production Considerations

- Use a production WSGI server (e.g., Gunicorn)
- Configure proper logging
- Set up monitoring and alerting
- Use environment variables for configuration
- Implement rate limiting if needed

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all dependencies are installed
2. **Port Conflicts**: Change port if 8000 is occupied
3. **CORS Issues**: Configure CORS middleware properly
4. **Validation Errors**: Check input data format

### Debug Mode

Run with debug logging:
```bash
LOG_LEVEL=debug python main.py
```

## Support

For issues and questions:
1. Check the test files for usage examples
2. Review the API documentation at `/docs`
3. Create an issue in the repository