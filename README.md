# Risk Control System

A modular risk control system with React Native frontend and Python backend for trading operations. This system provides comprehensive risk management functionality including position sizing, stop loss/take profit management, real-time risk metrics, and automatic trade validation.

## Features

### Frontend (React Native)
- **RiskWidget Component**: Interactive UI for trade configuration
- **Position Sizing**: Dynamic position size calculation and validation
- **Stop Loss/Take Profit**: Support for fixed, percentage, and trailing stops
- **Real-time Risk Metrics**: Live calculation of risk:reward ratios and portfolio risk
- **Auto-block/Warn**: Automatic blocking of risky trades with override options
- **Visual Feedback**: Color-coded risk indicators and progress bars

### Backend (Python)
- **Risk Service**: Comprehensive risk validation and calculation engine
- **Trade Validation**: Multi-parameter risk checks before trade execution
- **API Endpoints**: RESTful API for frontend integration
- **Configurable Risk Parameters**: Flexible risk configuration system
- **Comprehensive Testing**: Full unit test coverage

## Project Structure

```
/workspace/
├── components/
│   └── RiskWidget.tsx          # Main React Native component
├── backend/
│   ├── services/
│   │   ├── __init__.py
│   │   └── risk.py             # Core risk management service
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_risk_service.py # Risk service unit tests
│   │   └── test_api.py         # API endpoint tests
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   └── pytest.ini            # Test configuration
├── App.tsx                     # React Native app entry point
├── package.json               # Node.js dependencies
└── README.md                  # This file
```

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- React Native development environment
- Android Studio / Xcode (for mobile development)

### Frontend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install React Native CLI** (if not already installed):
   ```bash
   npm install -g react-native-cli
   ```

3. **For Android development**:
   - Install Android Studio
   - Set up Android SDK
   - Configure environment variables

4. **For iOS development** (macOS only):
   - Install Xcode
   - Install CocoaPods: `sudo gem install cocoapods`
   - Run: `cd ios && pod install`

### Backend Setup

1. **Create virtual environment**:
   ```bash
   cd backend
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
   # Or with uvicorn directly:
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## Usage

### Starting the Application

1. **Start the backend server**:
   ```bash
   cd backend
   python main.py
   ```
   The API will be available at `http://localhost:8000`

2. **Start the React Native app**:
   ```bash
   # For Android
   npm run android
   
   # For iOS
   npm run ios
   
   # Or start Metro bundler separately
   npm start
   ```

### Using the Risk Widget

1. **Configure Trade Details**:
   - Enter symbol, entry price, position size
   - Set portfolio value
   - Configure stop loss (fixed/percentage/trailing)
   - Configure take profit (fixed/percentage/trailing)

2. **Set Risk Parameters**:
   - Maximum portfolio risk percentage
   - Maximum position size percentage
   - Maximum risk per trade percentage

3. **Monitor Risk Metrics**:
   - Real-time risk:reward ratio
   - Portfolio risk percentage
   - Position risk percentage
   - Visual risk level indicator

4. **Execute Trades**:
   - Click "Execute Trade" for automatic validation
   - Risky trades will be blocked with override option
   - Use "Validate Only" for risk assessment without execution

## API Documentation

### Endpoints

#### `POST /api/risk/validate`
Validate a trade against risk parameters.

**Request Body**:
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

#### `POST /api/risk/calculate`
Calculate risk metrics without validation.

#### `POST /api/risk/calculate-max-position`
Calculate maximum position size based on risk parameters.

#### `POST /api/risk/calculate-optimal-tp`
Calculate optimal take profit based on risk:reward ratio.

### Risk Configuration Parameters

- **max_portfolio_risk**: Maximum portfolio risk as decimal (e.g., 0.02 for 2%)
- **max_position_size**: Maximum position size as decimal (e.g., 0.1 for 10%)
- **max_risk_per_trade**: Maximum risk per trade as decimal (e.g., 0.01 for 1%)
- **max_drawdown**: Maximum drawdown as decimal (e.g., 0.05 for 5%)
- **min_risk_reward_ratio**: Minimum risk:reward ratio (default: 1.0)
- **max_leverage**: Maximum leverage allowed (default: 1.0)

## Testing

### Backend Tests

Run all tests:
```bash
cd backend
python -m pytest
```

Run specific test files:
```bash
python -m pytest tests/test_risk_service.py
python -m pytest tests/test_api.py
```

Run with coverage:
```bash
pip install pytest-cov
python -m pytest --cov=services tests/
```

### Frontend Tests

Run React Native tests:
```bash
npm test
```

## Risk Management Features

### Position Sizing
- Automatic calculation of maximum position size based on risk parameters
- Real-time validation against portfolio limits
- Support for different stop loss types (fixed, percentage, trailing)

### Risk Metrics
- **Risk Amount**: Absolute dollar risk per trade
- **Reward Amount**: Absolute dollar reward per trade
- **Risk:Reward Ratio**: Reward divided by risk
- **Portfolio Risk**: Risk as percentage of total portfolio
- **Position Risk**: Position size as percentage of portfolio
- **Leverage Risk**: Effective risk considering leverage

### Validation Rules
- Portfolio risk limits
- Position size limits
- Risk per trade limits
- Leverage limits
- Minimum risk:reward ratio requirements

### Auto-blocking
- Automatic blocking of trades that violate risk parameters
- Override option for experienced traders
- Detailed violation reporting
- Suggested adjustments for compliance

## Customization

### Adding New Risk Rules
1. Modify `RiskService.calculate_risk_metrics()` in `backend/services/risk.py`
2. Add new validation logic
3. Update tests in `backend/tests/test_risk_service.py`

### Customizing UI
1. Modify `components/RiskWidget.tsx`
2. Add new input fields or display components
3. Update styling in the `styles` object

### API Extensions
1. Add new endpoints in `backend/main.py`
2. Implement corresponding service methods
3. Add tests in `backend/tests/test_api.py`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the test files for usage examples
2. Review the API documentation
3. Create an issue in the repository