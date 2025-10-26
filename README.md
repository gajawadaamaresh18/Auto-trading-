# Auto Trading - Basket Management System

A comprehensive React Native application for managing user-defined stock baskets with advanced analytics, signal generation, and trading capabilities.

## Features

### 🎯 Basket Management
- **Create Custom Baskets**: Build personalized stock portfolios with custom names and descriptions
- **Predefined Baskets**: Access to popular market indices like Nifty 50, Banking Sector, IT Sector
- **Stock Assignment**: Add/remove stocks from baskets with intuitive interface
- **Formula-based Scanning**: Define custom formulas for automated stock screening

### 📊 Analytics & Reporting
- **Real-time Statistics**: Track total value, change percentage, and performance metrics
- **Performance Charts**: Visual representation of basket performance over time
- **Trade Analytics**: Comprehensive trade statistics including win rate, average gains/losses
- **Risk Metrics**: Volatility, Sharpe ratio, and maximum drawdown calculations

### 🔔 Signal Generation
- **Automated Signals**: AI-powered buy/sell/hold recommendations
- **Custom Formulas**: Define complex screening criteria for stock selection
- **Signal Strength**: Weak, medium, and strong signal classifications
- **Real-time Updates**: Live signal generation based on market conditions

### 📈 Trading Integration
- **Trade History**: Complete record of all buy/sell transactions
- **Order Management**: Track pending, completed, and cancelled orders
- **Portfolio Tracking**: Monitor individual stock performance within baskets
- **Risk Management**: Stop-loss and target price recommendations

## Technical Architecture

### Frontend
- **React Native**: Cross-platform mobile development
- **TypeScript**: Type-safe development
- **React Navigation**: Seamless screen navigation
- **React Native Paper**: Material Design components
- **Charts**: Interactive performance visualization

### Backend
- **SQLite**: Local database for data persistence
- **Expo SQLite**: React Native database integration
- **Service Layer**: Modular business logic separation
- **Type Safety**: Full TypeScript integration

### Data Models
- **Baskets**: Portfolio containers with metadata
- **Stocks**: Market data and pricing information
- **Signals**: Trading recommendations and alerts
- **Trades**: Transaction records and history
- **Analytics**: Performance metrics and statistics

## Project Structure

```
src/
├── components/
│   └── BasketManager.tsx          # Main basket management interface
├── screens/
│   └── BasketDetailScreen.tsx     # Detailed basket view with analytics
├── services/
│   ├── DatabaseService.ts         # SQLite database operations
│   ├── BasketService.ts           # Basket business logic
│   ├── AnalyticsService.ts        # Analytics calculations
│   └── SampleDataService.ts       # Sample data initialization
├── types/
│   └── index.ts                   # TypeScript type definitions
└── utils/
    └── theme.ts                   # App theming configuration
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- React Native development environment

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auto-trading
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   
   # Web
   npm run web
   ```

## Usage

### Creating a Basket
1. Open the app and navigate to the main screen
2. Tap the "+" button to create a new basket
3. Enter basket name, description, and select stocks
4. Optionally add a custom formula for scanning
5. Save the basket

### Running Scans
1. Select a basket from the main screen
2. Tap "Run Scan" to execute the basket's formula
3. View generated signals and recommendations
4. Monitor scan results in real-time

### Viewing Analytics
1. Open a basket detail view
2. Navigate to the "Analytics" tab
3. View performance metrics and trade statistics
4. Analyze charts and trends

## API Reference

### BasketService
- `createBasket(data)`: Create a new basket
- `getBaskets()`: Retrieve all baskets
- `updateBasket(id, updates)`: Update basket properties
- `deleteBasket(id)`: Soft delete a basket
- `runBasketScan(id)`: Execute formula-based scanning

### AnalyticsService
- `generateAnalytics(basketId, period)`: Generate performance analytics
- `getAnalyticsForBasket(basketId)`: Retrieve basket analytics
- `calculatePerformance(trades)`: Calculate performance metrics

### DatabaseService
- Complete CRUD operations for all data models
- Transaction support for data integrity
- Query optimization and indexing

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ using React Native and TypeScript**