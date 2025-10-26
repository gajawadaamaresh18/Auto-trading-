import { IndicatorDefinition } from '../types';
import { indicatorCatalog } from '../data/indicatorCatalog';

/**
 * Sample indicator list export
 * This file demonstrates how to export and use the indicator catalog
 */

// Export all indicators
export const allIndicators: IndicatorDefinition[] = indicatorCatalog;

// Export indicators by category
export const trendIndicators = indicatorCatalog.filter(ind => ind.category === 'Trend');
export const momentumIndicators = indicatorCatalog.filter(ind => ind.category === 'Momentum');
export const volatilityIndicators = indicatorCatalog.filter(ind => ind.category === 'Volatility');
export const volumeIndicators = indicatorCatalog.filter(ind => ind.category === 'Volume');

// Export popular indicators
export const popularIndicators: IndicatorDefinition[] = [
  indicatorCatalog.find(ind => ind.id === 'sma')!,
  indicatorCatalog.find(ind => ind.id === 'ema')!,
  indicatorCatalog.find(ind => ind.id === 'rsi')!,
  indicatorCatalog.find(ind => ind.id === 'macd')!,
  indicatorCatalog.find(ind => ind.id === 'bollinger')!,
].filter(Boolean);

// Export indicator categories
export const categories = [
  'Trend',
  'Momentum', 
  'Volatility',
  'Volume'
];

// Export indicator search function
export const searchIndicators = (query: string): IndicatorDefinition[] => {
  const lowercaseQuery = query.toLowerCase();
  return indicatorCatalog.filter(indicator => 
    indicator.name.toLowerCase().includes(lowercaseQuery) ||
    indicator.description.toLowerCase().includes(lowercaseQuery) ||
    indicator.category.toLowerCase().includes(lowercaseQuery)
  );
};

// Export indicator by ID
export const getIndicatorById = (id: string): IndicatorDefinition | undefined => {
  return indicatorCatalog.find(indicator => indicator.id === id);
};

// Export indicators by complexity (based on number of inputs)
export const getIndicatorsByComplexity = (complexity: 'simple' | 'medium' | 'complex'): IndicatorDefinition[] => {
  return indicatorCatalog.filter(indicator => {
    const inputCount = indicator.inputs.length;
    switch (complexity) {
      case 'simple':
        return inputCount <= 2;
      case 'medium':
        return inputCount > 2 && inputCount <= 4;
      case 'complex':
        return inputCount > 4;
      default:
        return false;
    }
  });
};

// Export indicator statistics
export const getIndicatorStats = () => {
  const total = indicatorCatalog.length;
  const byCategory = categories.reduce((acc, category) => {
    acc[category] = indicatorCatalog.filter(ind => ind.category === category).length;
    return acc;
  }, {} as Record<string, number>);
  
  const byComplexity = {
    simple: getIndicatorsByComplexity('simple').length,
    medium: getIndicatorsByComplexity('medium').length,
    complex: getIndicatorsByComplexity('complex').length,
  };

  return {
    total,
    byCategory,
    byComplexity,
  };
};

// Export sample indicator configurations
export const sampleIndicatorConfigs = {
  rsi: {
    period: 14,
    source: 'close',
    overbought: 70,
    oversold: 30,
  },
  sma: {
    period: 20,
    source: 'close',
  },
  ema: {
    period: 20,
    source: 'close',
  },
  macd: {
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
  },
  bollinger: {
    period: 20,
    stdDev: 2,
    source: 'close',
  },
  stochastic: {
    kPeriod: 14,
    dPeriod: 3,
    smooth: 3,
  },
  atr: {
    period: 14,
  },
  volume: {
    period: 20,
  },
};

// Export indicator validation function
export const validateIndicatorConfig = (indicatorId: string, config: Record<string, any>): boolean => {
  const indicator = getIndicatorById(indicatorId);
  if (!indicator) return false;

  return indicator.inputs.every(input => {
    const value = config[input.name];
    if (input.required && (value === undefined || value === null)) {
      return false;
    }
    if (value !== undefined && input.min !== undefined && value < input.min) {
      return false;
    }
    if (value !== undefined && input.max !== undefined && value > input.max) {
      return false;
    }
    return true;
  });
};

// Export indicator calculation examples
export const getCalculationExamples = () => {
  return {
    rsi: 'RSI(14, close) > 30 && RSI(14, close) < 70',
    sma: 'close > SMA(20, close)',
    macd: 'MACD(12, 26, 9).macd > MACD(12, 26, 9).signal',
    bollinger: 'close > BOLLINGER(20, 2, close).upper',
    stochastic: 'STOCHASTIC(14, 3, 3).k > 80',
  };
};

// Export all indicators as a single object for easy access
export const indicators = {
  all: allIndicators,
  byCategory: {
    trend: trendIndicators,
    momentum: momentumIndicators,
    volatility: volatilityIndicators,
    volume: volumeIndicators,
  },
  popular: popularIndicators,
  categories,
  search: searchIndicators,
  getById: getIndicatorById,
  getByComplexity: getIndicatorsByComplexity,
  stats: getIndicatorStats(),
  sampleConfigs: sampleIndicatorConfigs,
  validateConfig: validateIndicatorConfig,
  examples: getCalculationExamples(),
};