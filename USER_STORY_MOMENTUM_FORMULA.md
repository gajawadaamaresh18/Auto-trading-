# User Story: Alice's Momentum Formula Subscription Journey

## User Story Overview

**As Alice**, a new user to the trading platform,  
**I want to** subscribe to a momentum formula, run it in paper mode, review the results, and then go live with real trading,  
**So that** I can safely test and validate a trading strategy before risking real capital.

---

## Complete User Journey & Technical Implementation

### Step 1: User Registration & Onboarding
**Alice's Action:** Alice visits the platform and creates an account

**Technical Components:**
- **Frontend Module:** `UserAuthComponent` (`/src/components/auth/UserAuthComponent.jsx`)
- **API Endpoint:** `POST /api/auth/register` (handled by `AuthController.register()`)
- **Backend Service:** `UserService.createUser()` (`/src/services/UserService.js`)
- **Database:** User record created in `users` table via `UserRepository`

**Navigation Flow:**
- Landing page → Registration form → Email verification → Dashboard

---

### Step 2: Formula Discovery & Subscription
**Alice's Action:** Alice browses available momentum formulas and subscribes to one

**Technical Components:**
- **Frontend Module:** `FormulaMarketplace` (`/src/components/marketplace/FormulaMarketplace.jsx`)
- **Formula Card Component:** `FormulaCard` (`/src/components/marketplace/FormulaCard.jsx`)
- **API Endpoints:** 
  - `GET /api/formulas` (handled by `FormulaController.list()`)
  - `POST /api/subscriptions` (handled by `SubscriptionController.create()`)
- **Backend Services:**
  - `FormulaService.getAvailableFormulas()` (`/src/services/FormulaService.js`)
  - `SubscriptionService.createSubscription()` (`/src/services/SubscriptionService.js`)
- **Database:** Subscription record created in `user_subscriptions` table

**Navigation Flow:**
- Dashboard → Formula Marketplace → Formula Details → Subscribe Button → Confirmation

---

### Step 3: Paper Trading Setup
**Alice's Action:** Alice configures paper trading parameters for the momentum formula

**Technical Components:**
- **Frontend Module:** `PaperTradingSetup` (`/src/components/trading/PaperTradingSetup.jsx`)
- **Configuration Form:** `TradingConfigForm` (`/src/components/trading/TradingConfigForm.jsx`)
- **API Endpoint:** `POST /api/paper-trading/setup` (handled by `PaperTradingController.setup()`)
- **Backend Services:**
  - `PaperTradingService.initialize()` (`/src/services/PaperTradingService.js`)
  - `TradingEngineService.createPaperInstance()` (`/src/services/TradingEngineService.js`)
- **Database:** Paper trading session created in `paper_trading_sessions` table

**Configuration Parameters:**
- Initial capital amount
- Risk parameters (position sizing, stop-loss)
- Trading schedule (market hours, timezone)
- Notification preferences

---

### Step 4: Paper Trading Execution
**Alice's Action:** Alice starts the paper trading session and monitors the momentum formula

**Technical Components:**
- **Frontend Module:** `TradingDashboard` (`/src/components/trading/TradingDashboard.jsx`)
- **Real-time Updates:** WebSocket connection via `TradingWebSocket` (`/src/services/TradingWebSocket.js`)
- **API Endpoints:**
  - `POST /api/paper-trading/start` (handled by `PaperTradingController.start()`)
  - `GET /api/paper-trading/status` (handled by `PaperTradingController.getStatus()`)
- **Backend Services:**
  - `MomentumFormulaEngine` (`/src/engines/MomentumFormulaEngine.js`)
  - `PaperTradingSimulator` (`/src/simulators/PaperTradingSimulator.js`)
  - `MarketDataService` (`/src/services/MarketDataService.js`)
- **Background Jobs:** 
  - `TradingJobScheduler` (`/src/jobs/TradingJobScheduler.js`)
  - `MomentumCalculationJob` (`/src/jobs/MomentumCalculationJob.js`)

**Real-time Data Flow:**
- Market data → `MarketDataService` → `MomentumFormulaEngine` → `PaperTradingSimulator` → WebSocket → Frontend

---

### Step 5: Results Analysis & Review
**Alice's Action:** Alice reviews paper trading performance and decides whether to go live

**Technical Components:**
- **Frontend Module:** `PerformanceAnalytics` (`/src/components/analytics/PerformanceAnalytics.jsx`)
- **Charts Component:** `TradingCharts` (`/src/components/analytics/TradingCharts.jsx`)
- **API Endpoints:**
  - `GET /api/paper-trading/performance` (handled by `AnalyticsController.getPerformance()`)
  - `GET /api/paper-trading/trades` (handled by `TradingController.getTrades()`)
- **Backend Services:**
  - `AnalyticsService.calculateMetrics()` (`/src/services/AnalyticsService.js`)
  - `ReportGenerator` (`/src/services/ReportGenerator.js`)
- **Database Queries:** Performance metrics calculated from `paper_trades` and `paper_positions` tables

**Key Metrics Displayed:**
- Total return and percentage gain/loss
- Sharpe ratio and risk metrics
- Win rate and average trade duration
- Drawdown analysis
- Trade-by-trade breakdown

---

### Step 6: Live Trading Activation
**Alice's Action:** Alice approves the results and activates live trading

**Technical Components:**
- **Frontend Module:** `LiveTradingActivation` (`/src/components/trading/LiveTradingActivation.jsx`)
- **Risk Confirmation:** `RiskDisclosureModal` (`/src/components/trading/RiskDisclosureModal.jsx`)
- **API Endpoint:** `POST /api/live-trading/activate` (handled by `LiveTradingController.activate()`)
- **Backend Services:**
  - `LiveTradingService.activate()` (`/src/services/LiveTradingService.js`)
  - `BrokerIntegrationService` (`/src/services/BrokerIntegrationService.js`)
  - `RiskManagementService` (`/src/services/RiskManagementService.js`)
- **Database:** Live trading session created in `live_trading_sessions` table

**Pre-activation Checks:**
- Account verification status
- Sufficient capital validation
- Risk tolerance confirmation
- Broker API connectivity test

---

### Step 7: Live Trading Monitoring
**Alice's Action:** Alice monitors live trading performance and receives notifications

**Technical Components:**
- **Frontend Module:** `LiveTradingMonitor` (`/src/components/trading/LiveTradingMonitor.jsx`)
- **Notification System:** `NotificationManager` (`/src/services/NotificationManager.js`)
- **API Endpoints:**
  - `GET /api/live-trading/status` (handled by `LiveTradingController.getStatus()`)
  - `GET /api/notifications` (handled by `NotificationController.list()`)
- **Backend Services:**
  - `LiveTradingEngine` (`/src/engines/LiveTradingEngine.js`)
  - `BrokerOrderService` (`/src/services/BrokerOrderService.js`)
  - `NotificationService` (`/src/services/NotificationService.js`)
- **External Integrations:**
  - Broker API (e.g., Interactive Brokers, Alpaca)
  - Market data providers (e.g., Alpha Vantage, IEX Cloud)

---

## System Integration Architecture

### Navigation Flow
```
Landing Page
    ↓
User Registration
    ↓
Dashboard
    ↓
Formula Marketplace
    ↓
Formula Details & Subscription
    ↓
Paper Trading Setup
    ↓
Trading Dashboard (Paper Mode)
    ↓
Performance Analytics
    ↓
Live Trading Activation
    ↓
Live Trading Monitor
```

### API Layer Integration
- **Authentication:** JWT tokens managed by `AuthMiddleware`
- **Rate Limiting:** `RateLimitMiddleware` for API protection
- **Error Handling:** Centralized error handling via `ErrorHandler`
- **API Documentation:** OpenAPI/Swagger specs auto-generated

### Notification System
- **Real-time:** WebSocket connections for live updates
- **Email:** `EmailService` for important alerts
- **Push:** `PushNotificationService` for mobile/web notifications
- **SMS:** `SMSService` for critical alerts (optional)

### Backend Architecture
- **Microservices:** Separate services for trading, analytics, notifications
- **Message Queue:** Redis/RabbitMQ for async job processing
- **Database:** PostgreSQL for transactional data, Redis for caching
- **Monitoring:** Application metrics via `MetricsCollector`

### Security & Compliance
- **Data Encryption:** All sensitive data encrypted at rest and in transit
- **Audit Logging:** `AuditLogger` tracks all trading activities
- **Compliance:** `ComplianceService` ensures regulatory requirements
- **Risk Management:** `RiskEngine` prevents excessive risk exposure

---

## Key Success Metrics

1. **User Onboarding:** Time from registration to first paper trade < 10 minutes
2. **Paper Trading:** Realistic simulation with < 100ms latency
3. **Performance Analysis:** Comprehensive metrics available within 1 minute of session end
4. **Live Activation:** Seamless transition from paper to live trading
5. **Monitoring:** Real-time updates with < 500ms delay
6. **Notifications:** Critical alerts delivered within 30 seconds

---

## Technical Dependencies

- **Frontend:** React.js with TypeScript, Chart.js for analytics
- **Backend:** Node.js with Express.js, TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Caching:** Redis for session management and real-time data
- **Message Queue:** Bull Queue with Redis
- **WebSockets:** Socket.io for real-time communication
- **External APIs:** Broker APIs, market data providers
- **Monitoring:** Prometheus + Grafana for system metrics
- **Deployment:** Docker containers with Kubernetes orchestration