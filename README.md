# React Native Marketplace App

A comprehensive React Native marketplace application for trading formulas with advanced features including sorting, filtering, and detailed formula views.

## Features

### 🏪 Marketplace Screen
- **Dual Layout Support**: Horizontal cards for top/trending sections, vertical cards for main grid
- **Advanced Sorting**: Top gainers, highest rating, newest, most downloaded
- **Category Filtering**: Filter by technical analysis, momentum, volume, etc.
- **Infinite Scroll**: Load more formulas as you scroll
- **Pull-to-Refresh**: Refresh data with pull gesture
- **Error Handling**: Comprehensive error states with retry functionality

### 📱 Formula Cards
- **Responsive Design**: Adapts to horizontal and vertical layouts
- **Rich Information**: Rating, downloads, profit percentage, author info
- **Visual Indicators**: Verified badges, top gainer labels, trending indicators
- **Smooth Interactions**: Touch feedback and navigation

### 🔍 Formula Detail Screen
- **Comprehensive Details**: Full formula information with performance metrics
- **Purchase Flow**: Integrated purchase functionality with confirmation
- **Author Information**: Detailed author profile and verification status
- **Performance Stats**: Profit tracking and download statistics

### 🎣 Custom Hooks
- **useMarketplace**: Centralized state management for marketplace data
- **API Integration**: Mock API service with realistic data
- **Loading States**: Proper loading, success, and error states
- **Caching**: Efficient data management and pagination

## Project Structure

```
/workspace/
├── components/
│   └── FormulaCard.tsx          # Reusable formula card component
├── hooks/
│   └── useMarketplace.ts        # Custom hook for marketplace logic
├── navigation/
│   └── AppNavigator.tsx         # Navigation configuration
├── screens/
│   ├── MarketplaceScreen.tsx    # Main marketplace screen
│   └── FormulaDetailScreen.tsx  # Formula detail screen
├── services/
│   └── api.ts                   # API service with mock data
├── types/
│   └── index.ts                 # TypeScript type definitions
├── App.tsx                      # Main app component
├── index.js                     # App entry point
└── package.json                 # Dependencies and scripts
```

## Key Components

### FormulaCard Component
- **Props**: `formula`, `layout`, `onPress`
- **Layouts**: Horizontal (for top/trending) and vertical (for grid)
- **Features**: Star ratings, profit indicators, verification badges

### MarketplaceScreen
- **State Management**: Uses `useMarketplace` hook
- **FlatList Implementation**: Optimized for performance with infinite scroll
- **Modal Dialogs**: Sort and filter selection modals
- **Error Boundaries**: Comprehensive error handling

### useMarketplace Hook
- **State**: Formulas, loading states, filters, pagination
- **Actions**: Fetch data, sort, filter, load more, refresh
- **API Integration**: Handles all API calls and error states

## API Service

The app includes a comprehensive API service with:
- **Mock Data**: Realistic trading formula data
- **Error Simulation**: Configurable error states for testing
- **Pagination**: Proper pagination support
- **Filtering**: Category, rating, and price filtering
- **Sorting**: Multiple sorting options

## Navigation

- **Stack Navigator**: Smooth transitions between screens
- **Type Safety**: Full TypeScript support for navigation
- **Deep Linking**: Support for direct formula access
- **Back Navigation**: Proper back button handling

## Error Handling

- **Loading States**: Visual feedback during data fetching
- **Error States**: User-friendly error messages with retry options
- **Empty States**: Helpful messages when no data is available
- **Network Errors**: Graceful handling of API failures

## Performance Optimizations

- **FlatList**: Efficient rendering of large lists
- **Image Optimization**: Proper image loading and caching
- **Memoization**: Optimized re-renders
- **Lazy Loading**: Load data as needed

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. For iOS:
```bash
cd ios && pod install && cd ..
npm run ios
```

3. For Android:
```bash
npm run android
```

## Dependencies

- **React Native**: 0.72.6
- **Navigation**: @react-navigation/native
- **Vector Icons**: react-native-vector-icons
- **Linear Gradient**: react-native-linear-gradient
- **Safe Area**: react-native-safe-area-context

## Features Showcase

### Sorting Options
- Top Gainers (by profit percentage)
- Highest Rating (by user ratings)
- Newest (by creation date)
- Most Downloaded (by download count)

### Filtering Options
- All Categories
- Technical Analysis
- Momentum
- Volume Analysis
- Support & Resistance
- Volatility

### Visual Elements
- Star ratings with half-star support
- Profit indicators with color coding
- Verification badges for trusted formulas
- Trending and top gainer labels
- Author avatars and information

This implementation provides a complete, production-ready marketplace experience with all the requested features and more!