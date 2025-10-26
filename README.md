# Auto Trading Platform

A comprehensive auto-trading platform with user-selectable execution modes, featuring a React/TypeScript frontend and Node.js/Express backend.

## Features

### 🎯 Trade Signal Management
- **TradeSignalCard Component**: Displays trade signals with all details
- **Approval Workflow**: "Approve & Execute" or "Reject" actions for manual trades
- **Trade Modification**: Adjust quantity, stop loss, and take profit before execution
- **Real-time Status Updates**: Track trade status from pending to executed

### ⚙️ Execution Mode Configuration
- **Auto Mode**: Automatic execution without user confirmation
- **Manual Mode**: Requires explicit user approval before execution
- **Alert Only Mode**: Sends notifications without executing trades
- **Per-Formula Settings**: Each strategy can have its own execution mode

### 📊 Settings Management
- **SettingsScreen Component**: Configure execution modes and risk parameters
- **Risk Level Configuration**: Set LOW, MEDIUM, or HIGH risk levels
- **Position Size Limits**: Configure maximum position sizes per strategy
- **Stop Loss/Take Profit**: Set default percentages for risk management

### 🔧 Backend API
- **PATCH /trades/{id}/approve**: Main endpoint for trade approval/rejection
- **Comprehensive Logging**: All trade events and actions are logged
- **Event Tracking**: Complete audit trail of all trading activities
- **RESTful Design**: Clean, consistent API structure

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd auto-trading
npm install
```

2. **Start the backend server:**
```bash
npm run server
```
The API will be available at `http://localhost:3001/api`

3. **Start the frontend (in a new terminal):**
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### First Steps

1. **View Trade Signals**: Navigate to the "Trade Signals" tab to see pending trades
2. **Configure Settings**: Go to "Settings" to set execution modes for each strategy
3. **Approve Trades**: For manual mode trades, use "Approve & Execute" or "Reject"
4. **Monitor Events**: Check the console for trade event logs

## Project Structure

```
auto-trading/
├── components/
│   ├── TradeSignalCard.tsx      # Trade signal display and approval
│   └── SettingsScreen.tsx       # Execution mode configuration
├── pages/
│   ├── index.tsx               # Main dashboard
│   └── _app.tsx                # App wrapper with global styles
├── server/
│   └── index.js                # Express API server
├── types/
│   └── index.ts                # TypeScript type definitions
├── styles/
│   └── globals.css             # Global CSS with Tailwind
└── API_DOCUMENTATION.md        # Complete API documentation
```

## Key Components

### TradeSignalCard
- Displays comprehensive trade information
- Shows risk level, confidence, and market conditions
- Provides approval/rejection actions for manual trades
- Includes modal for modifying trade parameters
- Visual indicators for different execution modes

### SettingsScreen
- Interactive execution mode selection
- Risk parameter configuration
- Real-time settings updates
- Visual mode indicators and warnings

### Backend API
- Express.js server with CORS support
- In-memory data storage (easily replaceable with database)
- Comprehensive error handling
- Event logging system
- Sample data for immediate testing

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trades` | Get all trade signals |
| GET | `/api/trades/:id` | Get specific trade signal |
| PATCH | `/api/trades/:id/approve` | Approve/reject trade |
| GET | `/api/subscriptions` | Get formula subscriptions |
| PATCH | `/api/subscriptions/:id` | Update subscription settings |
| GET | `/api/events` | Get all trade events |
| GET | `/api/health` | Health check |

## Execution Modes

### 🤖 Auto Mode
- Trades execute immediately without confirmation
- Suitable for high-frequency strategies
- ⚠️ Use with caution - no manual oversight

### 👤 Manual Mode  
- Requires explicit user approval
- Users can modify trade parameters
- Full control over execution timing

### 🔔 Alert Only Mode
- Generates notifications only
- No actual trade execution
- Useful for monitoring and analysis

## Trade Flow

1. **Signal Generation**: Trading formulas generate signals
2. **Mode Check**: System checks execution mode for the formula
3. **Auto Execution**: Auto mode trades execute immediately
4. **Manual Approval**: Manual mode trades wait for user approval
5. **Alert Notification**: Alert-only mode sends notifications
6. **Event Logging**: All actions are logged for audit

## Configuration

### Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
PORT=3001

# Database (when implemented)
DATABASE_URL=postgresql://user:pass@localhost:5432/trading
```

### Customization
- Modify `types/index.ts` for data structure changes
- Update `server/index.js` for backend logic
- Customize components in `components/` directory
- Adjust styling in `styles/globals.css`

## Development

### Adding New Features
1. **Frontend**: Add components in `components/` directory
2. **Backend**: Add routes in `server/index.js`
3. **Types**: Update `types/index.ts` for new data structures
4. **API**: Document new endpoints in `API_DOCUMENTATION.md`

### Testing
```bash
# Run linting
npm run lint

# Test API endpoints
curl http://localhost:3001/api/health
curl http://localhost:3001/api/trades
```

## Production Deployment

### Backend
1. Replace in-memory storage with database
2. Implement proper authentication
3. Add rate limiting and security measures
4. Set up monitoring and logging

### Frontend
1. Build for production: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Configure environment variables
4. Set up CDN for static assets

## Security Considerations

- Implement proper authentication (JWT/OAuth)
- Add input validation and sanitization
- Use HTTPS in production
- Implement rate limiting
- Add audit logging
- Validate all API inputs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues:
1. Check the API documentation
2. Review the component code
3. Open an issue on GitHub
4. Contact the development team

---

**Note**: This is a development/demo version. For production use, implement proper security, authentication, database persistence, and error handling.
