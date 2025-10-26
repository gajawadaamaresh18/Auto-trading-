# React Native Trading Components

A collection of reusable React Native components designed for trading and financial applications. Built with TypeScript and a centralized theme system.

## Features

- 🎨 **Centralized Theme System** - Consistent colors, typography, and spacing
- 📱 **TypeScript Support** - Full type safety and IntelliSense
- 🧩 **Modular Design** - Reusable components with clear interfaces
- 📊 **Chart Integration** - Built-in chart components for data visualization
- 🎯 **Accessibility** - Proper test IDs and accessibility support
- 📱 **Responsive** - Works across different screen sizes

## Components

### FormulaCard
Displays formula information including stats, performance chart, and subscription status.

**Features:**
- Formula name, category, and tags
- Key statistics (win rate, profit factor, total trades, avg return)
- Performance sparkline chart
- Subscribe/unsubscribe functionality
- Multiple variants (default, elevated, outlined, filled)

**Usage:**
```tsx
import { FormulaCard } from './src/components';

<FormulaCard
  data={{
    id: '1',
    name: 'Momentum Strategy',
    winRate: 0.75,
    profitFactor: 1.8,
    totalTrades: 150,
    avgReturn: 0.12,
    maxDrawdown: -0.08,
    sharpeRatio: 1.5,
    performanceData: [0, 0.05, 0.12, 0.08, 0.15, 0.18, 0.22],
    isSubscribed: false,
    category: 'Trend Following',
    tags: ['Momentum', 'Trend', 'Medium Risk']
  }}
  onSubscribe={(id) => console.log('Subscribe to', id)}
  onPress={(id) => console.log('View formula', id)}
  variant="elevated"
/>
```

### StatCard
Displays a single statistic with optional change indicator and icon.

**Features:**
- Customizable value formatting (percentage, currency, number)
- Change indicators with color coding
- Icon support
- Multiple sizes (sm, md, lg)
- Clickable option

**Usage:**
```tsx
import { StatCard } from './src/components';

<StatCard
  data={{
    label: 'Win Rate',
    value: '75.2%',
    change: 2.1,
    changeType: 'positive',
    icon: 'trending-up'
  }}
  variant="elevated"
  size="lg"
  clickable
  onPress={() => console.log('Stat pressed')}
/>
```

### Chart
Displays line charts, sparklines, and area charts using SVG.

**Features:**
- Multiple chart types (line, sparkline, area)
- Customizable colors and stroke width
- Grid lines and labels
- Data point indicators
- Responsive sizing

**Usage:**
```tsx
import { Chart } from './src/components';

<Chart
  data={{
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      data: [10, 20, 15, 30, 25],
      color: '#10B981',
      strokeWidth: 2
    }]
  }}
  height={200}
  variant="line"
  showGrid
  showLabels
/>
```

## Theme System

The components use a centralized theme system located in `src/theme/theme.ts`. The theme includes:

- **Colors**: Primary, secondary, status, neutral, background, text, border, and chart colors
- **Typography**: Font families, sizes, and line heights
- **Spacing**: Consistent spacing values
- **Border Radius**: Standard border radius values
- **Shadows**: Elevation styles for different card variants

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install peer dependencies:
```bash
npm install react-native-svg react-native-vector-icons
```

3. For iOS, run:
```bash
cd ios && pod install
```

## TypeScript Support

All components are fully typed with TypeScript. The type definitions are located in `src/types/index.ts` and include:

- `FormulaData` - Interface for formula information
- `StatData` - Interface for statistic data
- `ChartData` - Interface for chart data
- `BrokerData` - Interface for broker information
- `NotificationData` - Interface for notification data
- `ModalData` - Interface for modal data

## Examples

See `src/examples/FormulaCardExample.tsx` for comprehensive usage examples of all components.

## Development

### Project Structure
```
src/
├── components/          # Reusable components
│   ├── FormulaCard/    # Formula card component
│   ├── StatCard/       # Stat card component
│   └── Chart/          # Chart component
├── theme/              # Theme configuration
│   └── theme.ts        # Central theme file
├── types/              # TypeScript type definitions
│   └── index.ts        # Type definitions
└── examples/           # Usage examples
    └── FormulaCardExample.tsx
```

### Scripts
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Contributing

1. Follow the existing code style and patterns
2. Add proper TypeScript types for all props
3. Include JSDoc comments for component documentation
4. Use the centralized theme system
5. Add test IDs for testing purposes
6. Ensure components are fully modular with no inline styles

## License

MIT