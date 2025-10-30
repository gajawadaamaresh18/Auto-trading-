# Stock Trading Marketplace App - Directory Structure

```
Auto-trading/
├── frontend/                          # React Native (TypeScript) Frontend
│   ├── src/
│   │   ├── screens/                  # Screen components
│   │   │   ├── auth/
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   ├── RegisterScreen.tsx
│   │   │   │   └── ForgotPasswordScreen.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardScreen.tsx
│   │   │   │   ├── PortfolioScreen.tsx
│   │   │   │   └── WatchlistScreen.tsx
│   │   │   ├── trading/
│   │   │   │   ├── TradingScreen.tsx
│   │   │   │   ├── OrderBookScreen.tsx
│   │   │   │   └── TradeHistoryScreen.tsx
│   │   │   ├── formulas/
│   │   │   │   ├── FormulaBuilderScreen.tsx
│   │   │   │   ├── FormulaLibraryScreen.tsx
│   │   │   │   └── FormulaBacktestScreen.tsx
│   │   │   ├── settings/
│   │   │   │   ├── SettingsScreen.tsx
│   │   │   │   ├── BrokerSettingsScreen.tsx
│   │   │   │   └── NotificationSettingsScreen.tsx
│   │   │   └── profile/
│   │   │       ├── ProfileScreen.tsx
│   │   │       └── AccountScreen.tsx
│   │   ├── components/               # Reusable UI components
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   └── LoadingSpinner.tsx
│   │   │   ├── trading/
│   │   │   │   ├── StockCard.tsx
│   │   │   │   ├── PriceChart.tsx
│   │   │   │   ├── OrderForm.tsx
│   │   │   │   ├── OrderBook.tsx
│   │   │   │   └── TradeHistory.tsx
│   │   │   ├── formulas/
│   │   │   │   ├── FormulaCard.tsx
│   │   │   │   ├── FormulaBuilder.tsx
│   │   │   │   ├── FormulaVisualizer.tsx
│   │   │   │   └── BacktestResults.tsx
│   │   │   ├── charts/
│   │   │   │   ├── CandlestickChart.tsx
│   │   │   │   ├── LineChart.tsx
│   │   │   │   └── VolumeChart.tsx
│   │   │   └── navigation/
│   │   │       ├── TabNavigator.tsx
│   │   │       ├── StackNavigator.tsx
│   │   │       └── DrawerNavigator.tsx
│   │   ├── services/                 # API clients and broker integrations
│   │   │   ├── api/
│   │   │   │   ├── client.ts
│   │   │   │   ├── auth.ts
│   │   │   │   ├── trading.ts
│   │   │   │   ├── formulas.ts
│   │   │   │   └── notifications.ts
│   │   │   ├── brokers/
│   │   │   │   ├── base/
│   │   │   │   │   ├── BrokerInterface.ts
│   │   │   │   │   └── BrokerConfig.ts
│   │   │   │   ├── alpaca/
│   │   │   │   │   ├── AlpacaBroker.ts
│   │   │   │   │   └── AlpacaConfig.ts
│   │   │   │   ├── interactive-brokers/
│   │   │   │   │   ├── IBBroker.ts
│   │   │   │   │   └── IBConfig.ts
│   │   │   │   └── robinhood/
│   │   │   │       ├── RobinhoodBroker.ts
│   │   │   │       └── RobinhoodConfig.ts
│   │   │   ├── websocket/
│   │   │   │   ├── WebSocketClient.ts
│   │   │   │   ├── PriceFeed.ts
│   │   │   │   └── OrderUpdates.ts
│   │   │   └── storage/
│   │   │       ├── AsyncStorage.ts
│   │   │       └── SecureStorage.ts
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useTrading.ts
│   │   │   ├── useFormulas.ts
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useNotifications.ts
│   │   │   └── useTheme.ts
│   │   ├── state/                    # Global app state management
│   │   │   ├── context/
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   ├── TradingContext.tsx
│   │   │   │   ├── FormulaContext.tsx
│   │   │   │   └── ThemeContext.tsx
│   │   │   ├── reducers/
│   │   │   │   ├── authReducer.ts
│   │   │   │   ├── tradingReducer.ts
│   │   │   │   └── formulaReducer.ts
│   │   │   ├── store/
│   │   │   │   ├── store.ts
│   │   │   │   └── middleware.ts
│   │   │   └── types/
│   │   │       ├── auth.ts
│   │   │       ├── trading.ts
│   │   │       └── formulas.ts
│   │   ├── notifications/            # Push notification handling
│   │   │   ├── NotificationService.ts
│   │   │   ├── NotificationHandler.ts
│   │   │   ├── PushTokenManager.ts
│   │   │   └── types.ts
│   │   ├── theme/                    # Design system and theming
│   │   │   ├── colors.ts
│   │   │   ├── fonts.ts
│   │   │   ├── spacing.ts
│   │   │   ├── breakpoints.ts
│   │   │   ├── shadows.ts
│   │   │   └── index.ts
│   │   ├── assets/                   # Static assets
│   │   │   ├── images/
│   │   │   │   ├── logos/
│   │   │   │   └── backgrounds/
│   │   │   ├── icons/
│   │   │   │   ├── trading/
│   │   │   │   ├── navigation/
│   │   │   │   └── common/
│   │   │   ├── svgs/
│   │   │   │   ├── charts/
│   │   │   │   └── illustrations/
│   │   │   └── fonts/
│   │   ├── utils/                    # Utility functions
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   ├── calculations.ts
│   │   │   ├── dateUtils.ts
│   │   │   ├── numberUtils.ts
│   │   │   └── constants.ts
│   │   ├── types/                    # TypeScript type definitions
│   │   │   ├── api.ts
│   │   │   ├── navigation.ts
│   │   │   ├── trading.ts
│   │   │   ├── formulas.ts
│   │   │   └── common.ts
│   │   └── __tests__/                # Frontend tests
│   │       ├── components/
│   │       ├── screens/
│   │       ├── services/
│   │       ├── hooks/
│   │       └── utils/
│   ├── android/                      # Android-specific files
│   ├── ios/                          # iOS-specific files
│   ├── package.json
│   ├── tsconfig.json
│   ├── metro.config.js
│   ├── babel.config.js
│   └── app.json
├── backend/                          # FastAPI (Python) Backend
│   ├── app/
│   │   ├── api/                      # API routes
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── auth.py
│   │   │   │   ├── trading.py
│   │   │   │   ├── formulas.py
│   │   │   │   ├── brokers.py
│   │   │   │   ├── notifications.py
│   │   │   │   └── users.py
│   │   │   └── dependencies.py
│   │   ├── models/                   # Database models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── trading.py
│   │   │   ├── formulas.py
│   │   │   ├── brokers.py
│   │   │   └── notifications.py
│   │   ├── schemas/                  # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── trading.py
│   │   │   ├── formulas.py
│   │   │   ├── brokers.py
│   │   │   └── notifications.py
│   │   ├── services/                 # Business logic services
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── trading_service.py
│   │   │   ├── formula_service.py
│   │   │   ├── broker_service.py
│   │   │   ├── notification_service.py
│   │   │   └── websocket_service.py
│   │   ├── tasks/                    # Scheduled jobs and background tasks
│   │   │   ├── __init__.py
│   │   │   ├── celery_app.py
│   │   │   ├── market_data.py
│   │   │   ├── formula_execution.py
│   │   │   ├── notifications.py
│   │   │   └── cleanup.py
│   │   ├── auth/                     # Authentication and authorization
│   │   │   ├── __init__.py
│   │   │   ├── jwt_handler.py
│   │   │   ├── password_handler.py
│   │   │   ├── oauth_handler.py
│   │   │   └── permissions.py
│   │   ├── config/                   # Configuration management
│   │   │   ├── __init__.py
│   │   │   ├── settings.py
│   │   │   ├── database.py
│   │   │   ├── redis.py
│   │   │   └── broker_configs.py
│   │   ├── core/                     # Core application logic
│   │   │   ├── __init__.py
│   │   │   ├── security.py
│   │   │   ├── database.py
│   │   │   ├── exceptions.py
│   │   │   └── middleware.py
│   │   ├── utils/                    # Utility functions
│   │   │   ├── __init__.py
│   │   │   ├── formatters.py
│   │   │   ├── validators.py
│   │   │   ├── calculations.py
│   │   │   ├── date_utils.py
│   │   │   └── constants.py
│   │   ├── integrations/             # External service integrations
│   │   │   ├── __init__.py
│   │   │   ├── brokers/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── base_broker.py
│   │   │   │   ├── alpaca_broker.py
│   │   │   │   ├── ib_broker.py
│   │   │   │   └── robinhood_broker.py
│   │   │   ├── market_data/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── alpha_vantage.py
│   │   │   │   ├── yahoo_finance.py
│   │   │   │   └── polygon.py
│   │   │   └── notifications/
│   │   │       ├── __init__.py
│   │   │       ├── firebase.py
│   │   │       └── email_service.py
│   │   └── main.py                   # FastAPI application entry point
│   ├── tests/                        # Backend tests
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_api/
│   │   ├── test_services/
│   │   ├── test_models/
│   │   └── test_integrations/
│   ├── migrations/                   # Database migrations
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── pyproject.toml
│   ├── Dockerfile
│   └── docker-compose.yml
├── docs/                             # Documentation
│   ├── api/
│   │   ├── authentication.md
│   │   ├── trading.md
│   │   ├── formulas.md
│   │   └── brokers.md
│   ├── frontend/
│   │   ├── components.md
│   │   ├── navigation.md
│   │   └── theming.md
│   ├── backend/
│   │   ├── architecture.md
│   │   ├── database.md
│   │   └── deployment.md
│   └── deployment/
│       ├── docker.md
│       ├── aws.md
│       └── ci-cd.md
├── scripts/                          # Development and deployment scripts
│   ├── setup.sh
│   ├── deploy.sh
│   ├── test.sh
│   └── migrate.sh
├── .github/                          # GitHub Actions CI/CD
│   └── workflows/
│       ├── frontend.yml
│       ├── backend.yml
│       └── deploy.yml
├── .gitignore
├── README.md
└── docker-compose.yml                # Development environment
```