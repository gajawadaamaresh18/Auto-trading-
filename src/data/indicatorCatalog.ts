import { IndicatorDefinition } from '../types';

export const indicatorCatalog: IndicatorDefinition[] = [
  {
    id: 'sma',
    name: 'Simple Moving Average',
    description: 'Calculates the average price over a specified period',
    category: 'Trend',
    inputs: [
      { name: 'period', type: 'number', default: 20, min: 1, max: 200, step: 1 },
      { name: 'source', type: 'string', default: 'close' }
    ],
    outputs: [
      { name: 'value', type: 'number', description: 'SMA value' },
      { name: 'above', type: 'boolean', description: 'Price above SMA' },
      { name: 'below', type: 'boolean', description: 'Price below SMA' }
    ],
    calculation: 'SMA(period, source)',
    icon: '📈'
  },
  {
    id: 'ema',
    name: 'Exponential Moving Average',
    description: 'Gives more weight to recent prices',
    category: 'Trend',
    inputs: [
      { name: 'period', type: 'number', default: 20, min: 1, max: 200, step: 1 },
      { name: 'source', type: 'string', default: 'close' }
    ],
    outputs: [
      { name: 'value', type: 'number', description: 'EMA value' },
      { name: 'above', type: 'boolean', description: 'Price above EMA' },
      { name: 'below', type: 'boolean', description: 'Price below EMA' }
    ],
    calculation: 'EMA(period, source)',
    icon: '📊'
  },
  {
    id: 'rsi',
    name: 'Relative Strength Index',
    description: 'Measures the speed and change of price movements',
    category: 'Momentum',
    inputs: [
      { name: 'period', type: 'number', default: 14, min: 2, max: 50, step: 1 },
      { name: 'source', type: 'string', default: 'close' }
    ],
    outputs: [
      { name: 'value', type: 'number', description: 'RSI value (0-100)' },
      { name: 'overbought', type: 'boolean', description: 'RSI > 70' },
      { name: 'oversold', type: 'boolean', description: 'RSI < 30' }
    ],
    calculation: 'RSI(period, source)',
    icon: '⚡'
  },
  {
    id: 'macd',
    name: 'MACD',
    description: 'Moving Average Convergence Divergence',
    category: 'Momentum',
    inputs: [
      { name: 'fastPeriod', type: 'number', default: 12, min: 1, max: 50, step: 1 },
      { name: 'slowPeriod', type: 'number', default: 26, min: 1, max: 100, step: 1 },
      { name: 'signalPeriod', type: 'number', default: 9, min: 1, max: 50, step: 1 }
    ],
    outputs: [
      { name: 'macd', type: 'number', description: 'MACD line' },
      { name: 'signal', type: 'number', description: 'Signal line' },
      { name: 'histogram', type: 'number', description: 'MACD histogram' },
      { name: 'bullish', type: 'boolean', description: 'MACD above signal' },
      { name: 'bearish', type: 'boolean', description: 'MACD below signal' }
    ],
    calculation: 'MACD(fastPeriod, slowPeriod, signalPeriod)',
    icon: '🔄'
  },
  {
    id: 'bollinger',
    name: 'Bollinger Bands',
    description: 'Price channels based on standard deviation',
    category: 'Volatility',
    inputs: [
      { name: 'period', type: 'number', default: 20, min: 1, max: 100, step: 1 },
      { name: 'stdDev', type: 'number', default: 2, min: 1, max: 5, step: 0.1 },
      { name: 'source', type: 'string', default: 'close' }
    ],
    outputs: [
      { name: 'upper', type: 'number', description: 'Upper band' },
      { name: 'middle', type: 'number', description: 'Middle band (SMA)' },
      { name: 'lower', type: 'number', description: 'Lower band' },
      { name: 'squeeze', type: 'boolean', description: 'Bands are tight' },
      { name: 'expansion', type: 'boolean', description: 'Bands are wide' }
    ],
    calculation: 'BOLLINGER(period, stdDev, source)',
    icon: '📏'
  },
  {
    id: 'stochastic',
    name: 'Stochastic Oscillator',
    description: 'Compares closing price to price range over time',
    category: 'Momentum',
    inputs: [
      { name: 'kPeriod', type: 'number', default: 14, min: 1, max: 50, step: 1 },
      { name: 'dPeriod', type: 'number', default: 3, min: 1, max: 20, step: 1 },
      { name: 'smooth', type: 'number', default: 3, min: 1, max: 20, step: 1 }
    ],
    outputs: [
      { name: 'k', type: 'number', description: '%K value' },
      { name: 'd', type: 'number', description: '%D value' },
      { name: 'overbought', type: 'boolean', description: 'Stochastic > 80' },
      { name: 'oversold', type: 'boolean', description: 'Stochastic < 20' }
    ],
    calculation: 'STOCHASTIC(kPeriod, dPeriod, smooth)',
    icon: '🎯'
  },
  {
    id: 'atr',
    name: 'Average True Range',
    description: 'Measures market volatility',
    category: 'Volatility',
    inputs: [
      { name: 'period', type: 'number', default: 14, min: 1, max: 50, step: 1 }
    ],
    outputs: [
      { name: 'value', type: 'number', description: 'ATR value' },
      { name: 'high', type: 'boolean', description: 'High volatility' },
      { name: 'low', type: 'boolean', description: 'Low volatility' }
    ],
    calculation: 'ATR(period)',
    icon: '📊'
  },
  {
    id: 'volume',
    name: 'Volume Analysis',
    description: 'Analyzes trading volume patterns',
    category: 'Volume',
    inputs: [
      { name: 'period', type: 'number', default: 20, min: 1, max: 100, step: 1 }
    ],
    outputs: [
      { name: 'average', type: 'number', description: 'Average volume' },
      { name: 'high', type: 'boolean', description: 'Above average volume' },
      { name: 'low', type: 'boolean', description: 'Below average volume' }
    ],
    calculation: 'VOLUME(period)',
    icon: '📦'
  }
];

export const getIndicatorById = (id: string): IndicatorDefinition | undefined => {
  return indicatorCatalog.find(indicator => indicator.id === id);
};

export const getIndicatorsByCategory = (category: string): IndicatorDefinition[] => {
  return indicatorCatalog.filter(indicator => indicator.category === category);
};

export const getCategories = (): string[] => {
  return [...new Set(indicatorCatalog.map(indicator => indicator.category))];
};