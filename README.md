# Trading Strategy Templates System

A comprehensive modular system for cloneable trading strategy templates with paper trading and formula studio integration.

## 🚀 Features

- **12+ Pre-built Trading Strategies** - Covering all major trading styles
- **Interactive Template Picker** - React component with grid/list views
- **RESTful API** - Complete CRUD operations for template management
- **Paper Trading Integration** - Test strategies without real money
- **Formula Studio Integration** - Advanced strategy customization
- **Modern UI/UX** - Responsive design with comprehensive filtering

## 📊 Included Strategy Templates

1. **Moving Average Crossover** - Classic trend-following strategy
2. **RSI Mean Reversion** - Oversold/overbought signals
3. **Bollinger Bands Squeeze** - Volatility breakout strategy
4. **Momentum Breakout** - High-momentum stock breakouts
5. **Pairs Trading** - Market-neutral correlated pairs
6. **MACD Divergence** - Trend reversal signals
7. **Support/Resistance Bounce** - Price action strategy
8. **Volatility Expansion** - Options strategy for high VIX
9. **Earnings Play** - Pre-earnings volatility strategy
10. **Sector Rotation** - Macro sector rotation strategy
11. **Grid Trading** - Systematic grid-based trading
12. **Arbitrage Scanner** - Cross-exchange arbitrage

## 🏗️ Architecture

```
/workspace/
├── data/
│   └── templateFormulas.json     # Strategy template definitions
├── components/
│   ├── TemplatePicker.jsx        # React component
│   └── TemplatePicker.css        # Component styling
├── api/
│   └── templates.js              # Express API routes
├── src/
│   ├── index.js                  # React app entry point
│   └── index.html                # HTML template
├── public/
│   └── index.html                # Demo page
├── server.js                     # Express server
├── package.json                  # Dependencies
└── webpack.config.js             # Build configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd trading-strategy-templates

# Install dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm start
```

The system will be available at:
- **Main App**: http://localhost:3000
- **API Endpoints**: http://localhost:3000/api/templates
- **React Demo**: http://localhost:3000 (with webpack dev server)

## 🔌 API Endpoints

### Template Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | Get all templates |
| GET | `/api/templates/:id` | Get specific template |
| POST | `/api/templates/clone` | Clone template for user |
| POST | `/api/templates/create-new-for-user` | Create new user template |
| PUT | `/api/templates/:id` | Update template |
| DELETE | `/api/templates/:id` | Delete template |
| POST | `/api/templates/validate` | Validate template logic |

### Example API Usage

```javascript
// Get all templates
fetch('/api/templates')
  .then(res => res.json())
  .then(templates => console.log(templates));

// Clone a template
fetch('/api/templates/clone', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    templateId: 'template_0',
    userId: 'user123',
    customizations: {
      templateName: 'My Custom MA Strategy',
      riskLevel: 'High'
    }
  })
})
.then(res => res.json())
.then(cloned => console.log(cloned));
```

## 🎯 Template Picker Component

The `TemplatePicker` React component provides:

- **Grid/List View Toggle** - Switch between card grid and list views
- **Advanced Filtering** - Filter by risk level, asset type, and search terms
- **Action Buttons** - Clone, Paper Mode, and Edit in Studio
- **Responsive Design** - Works on desktop and mobile
- **Real-time Search** - Instant filtering as you type

### Usage

```jsx
import TemplatePicker from './components/TemplatePicker';

<TemplatePicker
  onTemplateSelect={(template) => console.log('Selected:', template)}
  onPaperMode={(template) => console.log('Paper mode:', template)}
  onEditInStudio={(template) => console.log('Edit:', template)}
/>
```

## 📋 Template Data Structure

Each template includes:

```json
{
  "templateName": "Moving Average Crossover",
  "description": "Classic trend-following strategy...",
  "serializedLogic": {
    "type": "crossover",
    "fastMA": 20,
    "slowMA": 50,
    "entryCondition": "fastMA > slowMA",
    "exitCondition": "fastMA < slowMA",
    "stopLoss": 0.02,
    "takeProfit": 0.04
  },
  "winRate": 0.58,
  "riskLevel": "Medium",
  "assetType": "Stocks",
  "recommendedUniverse": ["SPY", "QQQ", "IWM", "DIA"]
}
```

## 🔧 Customization

### Adding New Templates

1. Edit `/data/templateFormulas.json`
2. Add new template object with required fields
3. Restart server to load new templates

### Modifying UI

1. Edit `/components/TemplatePicker.jsx` for functionality
2. Edit `/components/TemplatePicker.css` for styling
3. Rebuild with `npm run build`

### Extending API

1. Add new routes to `/api/templates.js`
2. Implement business logic
3. Test with API client

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📦 Building for Production

```bash
# Build React components
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API examples

## 🔮 Roadmap

- [ ] Real-time backtesting integration
- [ ] Advanced strategy validation
- [ ] User authentication and permissions
- [ ] Strategy performance analytics
- [ ] Social sharing of strategies
- [ ] Mobile app integration