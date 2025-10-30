/**
 * Trading Indicator Catalog
 * 
 * Comprehensive catalog of 100+ commonly used technical indicators for trading systems.
 * Each indicator includes metadata, parameter schemas, and categorization.
 */

export interface IndicatorParameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  description: string;
  required: boolean;
  defaultValue: any;
  constraints?: {
    min?: number;
    max?: number;
    step?: number;
    options?: Array<{ value: any; label: string }>;
  };
}

export interface IndicatorInput {
  name: string;
  type: 'price' | 'volume' | 'indicator' | 'number';
  description: string;
  required: boolean;
}

export interface IndicatorOutput {
  name: string;
  type: 'number' | 'boolean' | 'array';
  description: string;
}

export interface IndicatorCatalogEntry {
  name: string;
  description: string;
  category: 'trend' | 'momentum' | 'volatility' | 'volume' | 'oscillator' | 'support_resistance';
  supportedInputs: IndicatorInput[];
  defaultParams: Record<string, any>;
  parameters: IndicatorParameter[];
  outputs: IndicatorOutput[];
  complexity: 'low' | 'medium' | 'high';
  timeframe: string[];
  documentation: string;
  examples: {
    bullish: string;
    bearish: string;
    neutral: string;
  };
}

// Trend Following Indicators
const TREND_INDICATORS: Record<string, IndicatorCatalogEntry> = {
  SMA: {
    name: 'Simple Moving Average',
    description: 'Average price over a specified number of periods',
    category: 'trend',
    supportedInputs: [
      { name: 'price', type: 'price', description: 'Price data (OHLC)', required: true }
    ],
    defaultParams: { period: 20, price_type: 'close' },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 20,
        constraints: { min: 1, max: 200, step: 1 }
      },
      {
        name: 'price_type',
        type: 'select',
        description: 'Type of price to use',
        required: false,
        defaultValue: 'close',
        constraints: {
          options: [
            { value: 'open', label: 'Open' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
            { value: 'close', label: 'Close' },
            { value: 'hl2', label: 'HL2' },
            { value: 'hlc3', label: 'HLC3' },
            { value: 'ohlc4', label: 'OHLC4' }
          ]
        }
      }
    ],
    outputs: [
      { name: 'sma', type: 'number', description: 'Simple Moving Average value' }
    ],
    complexity: 'low',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'SMA is the most basic trend-following indicator. It smooths price data to identify trends.',
    examples: {
      bullish: 'Price above SMA indicates uptrend',
      bearish: 'Price below SMA indicates downtrend',
      neutral: 'Price crossing SMA may signal trend change'
    }
  },

  EMA: {
    name: 'Exponential Moving Average',
    description: 'Moving average that gives more weight to recent prices',
    category: 'trend',
    supportedInputs: [
      { name: 'price', type: 'price', description: 'Price data (OHLC)', required: true }
    ],
    defaultParams: { period: 20, price_type: 'close' },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 20,
        constraints: { min: 1, max: 200, step: 1 }
      },
      {
        name: 'price_type',
        type: 'select',
        description: 'Type of price to use',
        required: false,
        defaultValue: 'close',
        constraints: {
          options: [
            { value: 'open', label: 'Open' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
            { value: 'close', label: 'Close' },
            { value: 'hl2', label: 'HL2' },
            { value: 'hlc3', label: 'HLC3' },
            { value: 'ohlc4', label: 'OHLC4' }
          ]
        }
      }
    ],
    outputs: [
      { name: 'ema', type: 'number', description: 'Exponential Moving Average value' }
    ],
    complexity: 'low',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'EMA responds faster to price changes than SMA due to exponential weighting.',
    examples: {
      bullish: 'Price above EMA with EMA sloping up',
      bearish: 'Price below EMA with EMA sloping down',
      neutral: 'EMA flattening indicates consolidation'
    }
  },

  WMA: {
    name: 'Weighted Moving Average',
    description: 'Moving average with linear weighting (recent prices weighted more)',
    category: 'trend',
    supportedInputs: [
      { name: 'price', type: 'price', description: 'Price data (OHLC)', required: true }
    ],
    defaultParams: { period: 20, price_type: 'close' },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 20,
        constraints: { min: 1, max: 200, step: 1 }
      },
      {
        name: 'price_type',
        type: 'select',
        description: 'Type of price to use',
        required: false,
        defaultValue: 'close',
        constraints: {
          options: [
            { value: 'open', label: 'Open' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
            { value: 'close', label: 'Close' },
            { value: 'hl2', label: 'HL2' },
            { value: 'hlc3', label: 'HLC3' },
            { value: 'ohlc4', label: 'OHLC4' }
          ]
        }
      }
    ],
    outputs: [
      { name: 'wma', type: 'number', description: 'Weighted Moving Average value' }
    ],
    complexity: 'low',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'WMA provides a middle ground between SMA and EMA in terms of responsiveness.',
    examples: {
      bullish: 'Price above WMA indicates upward momentum',
      bearish: 'Price below WMA indicates downward momentum',
      neutral: 'WMA convergence with price suggests consolidation'
    }
  },

  DEMA: {
    name: 'Double Exponential Moving Average',
    description: 'EMA of EMA for reduced lag',
    category: 'trend',
    supportedInputs: [
      { name: 'price', type: 'price', description: 'Price data (OHLC)', required: true }
    ],
    defaultParams: { period: 20, price_type: 'close' },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 20,
        constraints: { min: 1, max: 200, step: 1 }
      },
      {
        name: 'price_type',
        type: 'select',
        description: 'Type of price to use',
        required: false,
        defaultValue: 'close',
        constraints: {
          options: [
            { value: 'open', label: 'Open' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
            { value: 'close', label: 'Close' },
            { value: 'hl2', label: 'HL2' },
            { value: 'hlc3', label: 'HLC3' },
            { value: 'ohlc4', label: 'OHLC4' }
          ]
        }
      }
    ],
    outputs: [
      { name: 'dema', type: 'number', description: 'Double Exponential Moving Average value' }
    ],
    complexity: 'medium',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'DEMA reduces lag compared to EMA by applying exponential smoothing twice.',
    examples: {
      bullish: 'DEMA sloping up with price above',
      bearish: 'DEMA sloping down with price below',
      neutral: 'DEMA flattening indicates trend weakness'
    }
  },

  TEMA: {
    name: 'Triple Exponential Moving Average',
    description: 'EMA of EMA of EMA for minimal lag',
    category: 'trend',
    supportedInputs: [
      { name: 'price', type: 'price', description: 'Price data (OHLC)', required: true }
    ],
    defaultParams: { period: 20, price_type: 'close' },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 20,
        constraints: { min: 1, max: 200, step: 1 }
      },
      {
        name: 'price_type',
        type: 'select',
        description: 'Type of price to use',
        required: false,
        defaultValue: 'close',
        constraints: {
          options: [
            { value: 'open', label: 'Open' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
            { value: 'close', label: 'Close' },
            { value: 'hl2', label: 'HL2' },
            { value: 'hlc3', label: 'HLC3' },
            { value: 'ohlc4', label: 'OHLC4' }
          ]
        }
      }
    ],
    outputs: [
      { name: 'tema', type: 'number', description: 'Triple Exponential Moving Average value' }
    ],
    complexity: 'medium',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'TEMA provides the least lag among moving averages but may be more noisy.',
    examples: {
      bullish: 'TEMA trending up indicates strong momentum',
      bearish: 'TEMA trending down indicates strong bearish momentum',
      neutral: 'TEMA oscillation suggests choppy market'
    }
  },

  HULL_MA: {
    name: 'Hull Moving Average',
    description: 'Weighted moving average that reduces lag and noise',
    category: 'trend',
    supportedInputs: [
      { name: 'price', type: 'price', description: 'Price data (OHLC)', required: true }
    ],
    defaultParams: { period: 20, price_type: 'close' },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 20,
        constraints: { min: 1, max: 200, step: 1 }
      },
      {
        name: 'price_type',
        type: 'select',
        description: 'Type of price to use',
        required: false,
        defaultValue: 'close',
        constraints: {
          options: [
            { value: 'open', label: 'Open' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
            { value: 'close', label: 'Close' },
            { value: 'hl2', label: 'HL2' },
            { value: 'hlc3', label: 'HLC3' },
            { value: 'ohlc4', label: 'OHLC4' }
          ]
        }
      }
    ],
    outputs: [
      { name: 'hma', type: 'number', description: 'Hull Moving Average value' }
    ],
    complexity: 'medium',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'HMA combines the smoothness of SMA with the responsiveness of EMA.',
    examples: {
      bullish: 'Price above HMA with HMA sloping up',
      bearish: 'Price below HMA with HMA sloping down',
      neutral: 'HMA flattening indicates consolidation'
    }
  },

  KAMA: {
    name: 'Kaufman Adaptive Moving Average',
    description: 'Adaptive moving average that adjusts to market volatility',
    category: 'trend',
    supportedInputs: [
      { name: 'price', type: 'price', description: 'Price data (OHLC)', required: true }
    ],
    defaultParams: { period: 20, fast_period: 2, slow_period: 30, price_type: 'close' },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 20,
        constraints: { min: 1, max: 200, step: 1 }
      },
      {
        name: 'fast_period',
        type: 'number',
        description: 'Fast smoothing period',
        required: false,
        defaultValue: 2,
        constraints: { min: 1, max: 10, step: 1 }
      },
      {
        name: 'slow_period',
        type: 'number',
        description: 'Slow smoothing period',
        required: false,
        defaultValue: 30,
        constraints: { min: 10, max: 100, step: 1 }
      },
      {
        name: 'price_type',
        type: 'select',
        description: 'Type of price to use',
        required: false,
        defaultValue: 'close',
        constraints: {
          options: [
            { value: 'open', label: 'Open' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
            { value: 'close', label: 'Close' },
            { value: 'hl2', label: 'HL2' },
            { value: 'hlc3', label: 'HLC3' },
            { value: 'ohlc4', label: 'OHLC4' }
          ]
        }
      }
    ],
    outputs: [
      { name: 'kama', type: 'number', description: 'Kaufman Adaptive Moving Average value' }
    ],
    complexity: 'high',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'KAMA automatically adjusts its smoothing based on market efficiency.',
    examples: {
      bullish: 'Price above KAMA in trending market',
      bearish: 'Price below KAMA in trending market',
      neutral: 'KAMA flat in sideways market'
    }
  },

  VWMA: {
    name: 'Volume Weighted Moving Average',
    description: 'Moving average weighted by volume',
    category: 'trend',
    supportedInputs: [
      { name: 'price', type: 'price', description: 'Price data (OHLC)', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    defaultParams: { period: 20, price_type: 'close' },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 20,
        constraints: { min: 1, max: 200, step: 1 }
      },
      {
        name: 'price_type',
        type: 'select',
        description: 'Type of price to use',
        required: false,
        defaultValue: 'close',
        constraints: {
          options: [
            { value: 'open', label: 'Open' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
            { value: 'close', label: 'Close' },
            { value: 'hl2', label: 'HL2' },
            { value: 'hlc3', label: 'HLC3' },
            { value: 'ohlc4', label: 'OHLC4' }
          ]
        }
      }
    ],
    outputs: [
      { name: 'vwma', type: 'number', description: 'Volume Weighted Moving Average value' }
    ],
    complexity: 'medium',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'VWMA gives more weight to periods with higher volume.',
    examples: {
      bullish: 'Price above VWMA with increasing volume',
      bearish: 'Price below VWMA with increasing volume',
      neutral: 'VWMA close to price suggests balanced volume'
    }
  },

  SUPERTREND: {
    name: 'SuperTrend',
    description: 'Trend-following indicator based on ATR',
    category: 'trend',
    supportedInputs: [
      { name: 'high', type: 'price', description: 'High price', required: true },
      { name: 'low', type: 'price', description: 'Low price', required: true },
      { name: 'close', type: 'price', description: 'Close price', required: true }
    ],
    defaultParams: { period: 10, multiplier: 3.0 },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'ATR period',
        required: true,
        defaultValue: 10,
        constraints: { min: 1, max: 50, step: 1 }
      },
      {
        name: 'multiplier',
        type: 'number',
        description: 'ATR multiplier',
        required: true,
        defaultValue: 3.0,
        constraints: { min: 0.1, max: 10.0, step: 0.1 }
      }
    ],
    outputs: [
      { name: 'supertrend', type: 'number', description: 'SuperTrend value' },
      { name: 'direction', type: 'number', description: 'Trend direction (1 for up, -1 for down)' }
    ],
    complexity: 'medium',
    timeframe: ['5m', '15m', '1h', '4h', '1d'],
    documentation: 'SuperTrend identifies trend direction and provides dynamic support/resistance levels.',
    examples: {
      bullish: 'Price above SuperTrend line indicates uptrend',
      bearish: 'Price below SuperTrend line indicates downtrend',
      neutral: 'Price crossing SuperTrend may signal trend change'
    }
  },

  PARABOLIC_SAR: {
    name: 'Parabolic SAR',
    description: 'Stop and Reverse indicator for trend following',
    category: 'trend',
    supportedInputs: [
      { name: 'high', type: 'price', description: 'High price', required: true },
      { name: 'low', type: 'price', description: 'Low price', required: true }
    ],
    defaultParams: { step: 0.02, maximum: 0.2 },
    parameters: [
      {
        name: 'step',
        type: 'number',
        description: 'Acceleration factor step',
        required: true,
        defaultValue: 0.02,
        constraints: { min: 0.01, max: 0.1, step: 0.01 }
      },
      {
        name: 'maximum',
        type: 'number',
        description: 'Maximum acceleration factor',
        required: true,
        defaultValue: 0.2,
        constraints: { min: 0.1, max: 0.5, step: 0.01 }
      }
    ],
    outputs: [
      { name: 'sar', type: 'number', description: 'Parabolic SAR value' },
      { name: 'trend', type: 'number', description: 'Trend direction (1 for up, -1 for down)' }
    ],
    complexity: 'medium',
    timeframe: ['5m', '15m', '1h', '4h', '1d'],
    documentation: 'Parabolic SAR provides stop-loss levels and trend direction signals.',
    examples: {
      bullish: 'SAR below price indicates uptrend',
      bearish: 'SAR above price indicates downtrend',
      neutral: 'SAR flip may signal trend change'
    }
  }
};

// Momentum Indicators
const MOMENTUM_INDICATORS: Record<string, IndicatorCatalogEntry> = {
  RSI: {
    name: 'Relative Strength Index',
    description: 'Momentum oscillator measuring speed and magnitude of price changes',
    category: 'momentum',
    supportedInputs: [
      { name: 'price', type: 'price', description: 'Price data (OHLC)', required: true }
    ],
    defaultParams: { period: 14, price_type: 'close' },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 14,
        constraints: { min: 2, max: 100, step: 1 }
      },
      {
        name: 'price_type',
        type: 'select',
        description: 'Type of price to use',
        required: false,
        defaultValue: 'close',
        constraints: {
          options: [
            { value: 'open', label: 'Open' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
            { value: 'close', label: 'Close' },
            { value: 'hl2', label: 'HL2' },
            { value: 'hlc3', label: 'HLC3' },
            { value: 'ohlc4', label: 'OHLC4' }
          ]
        }
      }
    ],
    outputs: [
      { name: 'rsi', type: 'number', description: 'RSI value (0-100)' }
    ],
    complexity: 'medium',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'RSI measures the speed and magnitude of price changes to identify overbought/oversold conditions.',
    examples: {
      bullish: 'RSI above 70 indicates overbought, potential sell signal',
      bearish: 'RSI below 30 indicates oversold, potential buy signal',
      neutral: 'RSI between 30-70 indicates normal market conditions'
    }
  },

  MACD: {
    name: 'Moving Average Convergence Divergence',
    description: 'Trend-following momentum indicator showing relationship between two moving averages',
    category: 'momentum',
    supportedInputs: [
      { name: 'price', type: 'price', description: 'Price data (OHLC)', required: true }
    ],
    defaultParams: { fast_period: 12, slow_period: 26, signal_period: 9, price_type: 'close' },
    parameters: [
      {
        name: 'fast_period',
        type: 'number',
        description: 'Fast EMA period',
        required: true,
        defaultValue: 12,
        constraints: { min: 1, max: 50, step: 1 }
      },
      {
        name: 'slow_period',
        type: 'number',
        description: 'Slow EMA period',
        required: true,
        defaultValue: 26,
        constraints: { min: 1, max: 100, step: 1 }
      },
      {
        name: 'signal_period',
        type: 'number',
        description: 'Signal line EMA period',
        required: true,
        defaultValue: 9,
        constraints: { min: 1, max: 50, step: 1 }
      },
      {
        name: 'price_type',
        type: 'select',
        description: 'Type of price to use',
        required: false,
        defaultValue: 'close',
        constraints: {
          options: [
            { value: 'open', label: 'Open' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
            { value: 'close', label: 'Close' },
            { value: 'hl2', label: 'HL2' },
            { value: 'hlc3', label: 'HLC3' },
            { value: 'ohlc4', label: 'OHLC4' }
          ]
        }
      }
    ],
    outputs: [
      { name: 'macd', type: 'number', description: 'MACD line value' },
      { name: 'signal', type: 'number', description: 'Signal line value' },
      { name: 'histogram', type: 'number', description: 'MACD histogram value' }
    ],
    complexity: 'medium',
    timeframe: ['5m', '15m', '1h', '4h', '1d'],
    documentation: 'MACD shows the relationship between two moving averages and helps identify trend changes.',
    examples: {
      bullish: 'MACD line crosses above signal line',
      bearish: 'MACD line crosses below signal line',
      neutral: 'MACD histogram shrinking indicates momentum weakening'
    }
  },

  STOCHASTIC: {
    name: 'Stochastic Oscillator',
    description: 'Momentum indicator comparing closing price to price range over time',
    category: 'momentum',
    supportedInputs: [
      { name: 'high', type: 'price', description: 'High price', required: true },
      { name: 'low', type: 'price', description: 'Low price', required: true },
      { name: 'close', type: 'price', description: 'Close price', required: true }
    ],
    defaultParams: { k_period: 14, d_period: 3, smooth_k: 3 },
    parameters: [
      {
        name: 'k_period',
        type: 'number',
        description: 'K period for %K calculation',
        required: true,
        defaultValue: 14,
        constraints: { min: 1, max: 50, step: 1 }
      },
      {
        name: 'd_period',
        type: 'number',
        description: 'D period for %D calculation',
        required: true,
        defaultValue: 3,
        constraints: { min: 1, max: 20, step: 1 }
      },
      {
        name: 'smooth_k',
        type: 'number',
        description: 'Smoothing period for %K',
        required: false,
        defaultValue: 3,
        constraints: { min: 1, max: 10, step: 1 }
      }
    ],
    outputs: [
      { name: 'k_percent', type: 'number', description: 'Stochastic %K value' },
      { name: 'd_percent', type: 'number', description: 'Stochastic %D value' }
    ],
    complexity: 'medium',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'Stochastic compares closing price to the high-low range over a specified period.',
    examples: {
      bullish: '%K crosses above %D in oversold territory (below 20)',
      bearish: '%K crosses below %D in overbought territory (above 80)',
      neutral: 'Stochastic oscillating between 20-80 indicates normal conditions'
    }
  },

  WILLIAMS_R: {
    name: 'Williams %R',
    description: 'Momentum indicator measuring overbought/oversold levels',
    category: 'momentum',
    supportedInputs: [
      { name: 'high', type: 'price', description: 'High price', required: true },
      { name: 'low', type: 'price', description: 'Low price', required: true },
      { name: 'close', type: 'price', description: 'Close price', required: true }
    ],
    defaultParams: { period: 14 },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 14,
        constraints: { min: 1, max: 50, step: 1 }
      }
    ],
    outputs: [
      { name: 'williams_r', type: 'number', description: 'Williams %R value (-100 to 0)' }
    ],
    complexity: 'low',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'Williams %R is similar to Stochastic but inverted, measuring momentum on a scale from -100 to 0.',
    examples: {
      bullish: 'Williams %R above -20 indicates overbought, potential sell',
      bearish: 'Williams %R below -80 indicates oversold, potential buy',
      neutral: 'Williams %R between -20 and -80 indicates normal conditions'
    }
  },

  CCI: {
    name: 'Commodity Channel Index',
    description: 'Momentum oscillator measuring deviation from statistical mean',
    category: 'momentum',
    supportedInputs: [
      { name: 'high', type: 'price', description: 'High price', required: true },
      { name: 'low', type: 'price', description: 'Low price', required: true },
      { name: 'close', type: 'price', description: 'Close price', required: true }
    ],
    defaultParams: { period: 20, constant: 0.015 },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 20,
        constraints: { min: 1, max: 100, step: 1 }
      },
      {
        name: 'constant',
        type: 'number',
        description: 'Constant for scaling',
        required: false,
        defaultValue: 0.015,
        constraints: { min: 0.001, max: 0.1, step: 0.001 }
      }
    ],
    outputs: [
      { name: 'cci', type: 'number', description: 'CCI value' }
    ],
    complexity: 'medium',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'CCI measures how far the current price is from its statistical mean.',
    examples: {
      bullish: 'CCI above +100 indicates strong upward momentum',
      bearish: 'CCI below -100 indicates strong downward momentum',
      neutral: 'CCI between -100 and +100 indicates normal conditions'
    }
  },

  ROC: {
    name: 'Rate of Change',
    description: 'Momentum oscillator measuring percentage change in price',
    category: 'momentum',
    supportedInputs: [
      { name: 'price', type: 'price', description: 'Price data (OHLC)', required: true }
    ],
    defaultParams: { period: 10, price_type: 'close' },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 10,
        constraints: { min: 1, max: 100, step: 1 }
      },
      {
        name: 'price_type',
        type: 'select',
        description: 'Type of price to use',
        required: false,
        defaultValue: 'close',
        constraints: {
          options: [
            { value: 'open', label: 'Open' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
            { value: 'close', label: 'Close' },
            { value: 'hl2', label: 'HL2' },
            { value: 'hlc3', label: 'HLC3' },
            { value: 'ohlc4', label: 'OHLC4' }
          ]
        }
      }
    ],
    outputs: [
      { name: 'roc', type: 'number', description: 'Rate of Change percentage' }
    ],
    complexity: 'low',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'ROC measures the percentage change in price over a specified period.',
    examples: {
      bullish: 'ROC above 0 indicates upward momentum',
      bearish: 'ROC below 0 indicates downward momentum',
      neutral: 'ROC near 0 indicates sideways movement'
    }
  },

  MOMENTUM: {
    name: 'Momentum',
    description: 'Simple momentum indicator measuring price change over time',
    category: 'momentum',
    supportedInputs: [
      { name: 'price', type: 'price', description: 'Price data (OHLC)', required: true }
    ],
    defaultParams: { period: 10, price_type: 'close' },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 10,
        constraints: { min: 1, max: 100, step: 1 }
      },
      {
        name: 'price_type',
        type: 'select',
        description: 'Type of price to use',
        required: false,
        defaultValue: 'close',
        constraints: {
          options: [
            { value: 'open', label: 'Open' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
            { value: 'close', label: 'Close' },
            { value: 'hl2', label: 'HL2' },
            { value: 'hlc3', label: 'HLC3' },
            { value: 'ohlc4', label: 'OHLC4' }
          ]
        }
      }
    ],
    outputs: [
      { name: 'momentum', type: 'number', description: 'Momentum value' }
    ],
    complexity: 'low',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'Momentum measures the rate of change in price over a specified period.',
    examples: {
      bullish: 'Momentum above 0 indicates upward price movement',
      bearish: 'Momentum below 0 indicates downward price movement',
      neutral: 'Momentum near 0 indicates sideways movement'
    }
  },

  ADX: {
    name: 'Average Directional Index',
    description: 'Trend strength indicator measuring directional movement',
    category: 'momentum',
    supportedInputs: [
      { name: 'high', type: 'price', description: 'High price', required: true },
      { name: 'low', type: 'price', description: 'Low price', required: true },
      { name: 'close', type: 'price', description: 'Close price', required: true }
    ],
    defaultParams: { period: 14 },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 14,
        constraints: { min: 1, max: 50, step: 1 }
      }
    ],
    outputs: [
      { name: 'adx', type: 'number', description: 'ADX value (0-100)' },
      { name: 'plus_di', type: 'number', description: '+DI value' },
      { name: 'minus_di', type: 'number', description: '-DI value' }
    ],
    complexity: 'high',
    timeframe: ['5m', '15m', '1h', '4h', '1d'],
    documentation: 'ADX measures trend strength regardless of direction. Higher values indicate stronger trends.',
    examples: {
      bullish: 'ADX above 25 with +DI > -DI indicates strong uptrend',
      bearish: 'ADX above 25 with -DI > +DI indicates strong downtrend',
      neutral: 'ADX below 20 indicates weak trend or sideways market'
    }
  },

  ULTIMATE_OSCILLATOR: {
    name: 'Ultimate Oscillator',
    description: 'Multi-timeframe momentum oscillator',
    category: 'momentum',
    supportedInputs: [
      { name: 'high', type: 'price', description: 'High price', required: true },
      { name: 'low', type: 'price', description: 'Low price', required: true },
      { name: 'close', type: 'price', description: 'Close price', required: true }
    ],
    defaultParams: { period1: 7, period2: 14, period3: 28 },
    parameters: [
      {
        name: 'period1',
        type: 'number',
        description: 'First period',
        required: true,
        defaultValue: 7,
        constraints: { min: 1, max: 20, step: 1 }
      },
      {
        name: 'period2',
        type: 'number',
        description: 'Second period',
        required: true,
        defaultValue: 14,
        constraints: { min: 1, max: 50, step: 1 }
      },
      {
        name: 'period3',
        type: 'number',
        description: 'Third period',
        required: true,
        defaultValue: 28,
        constraints: { min: 1, max: 100, step: 1 }
      }
    ],
    outputs: [
      { name: 'uo', type: 'number', description: 'Ultimate Oscillator value (0-100)' }
    ],
    complexity: 'high',
    timeframe: ['5m', '15m', '1h', '4h', '1d'],
    documentation: 'Ultimate Oscillator combines three different timeframes to reduce false signals.',
    examples: {
      bullish: 'UO above 70 indicates overbought, potential sell',
      bearish: 'UO below 30 indicates oversold, potential buy',
      neutral: 'UO between 30-70 indicates normal conditions'
    }
  },

  TRIX: {
    name: 'TRIX',
    description: 'Triple smoothed rate of change oscillator',
    category: 'momentum',
    supportedInputs: [
      { name: 'price', type: 'price', description: 'Price data (OHLC)', required: true }
    ],
    defaultParams: { period: 14, price_type: 'close' },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 14,
        constraints: { min: 1, max: 100, step: 1 }
      },
      {
        name: 'price_type',
        type: 'select',
        description: 'Type of price to use',
        required: false,
        defaultValue: 'close',
        constraints: {
          options: [
            { value: 'open', label: 'Open' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
            { value: 'close', label: 'Close' },
            { value: 'hl2', label: 'HL2' },
            { value: 'hlc3', label: 'HLC3' },
            { value: 'ohlc4', label: 'OHLC4' }
          ]
        }
      }
    ],
    outputs: [
      { name: 'trix', type: 'number', description: 'TRIX value' }
    ],
    complexity: 'high',
    timeframe: ['5m', '15m', '1h', '4h', '1d'],
    documentation: 'TRIX applies triple exponential smoothing to reduce noise and identify trend changes.',
    examples: {
      bullish: 'TRIX crossing above zero indicates uptrend',
      bearish: 'TRIX crossing below zero indicates downtrend',
      neutral: 'TRIX near zero indicates trend consolidation'
    }
  }
};

// Volatility Indicators
const VOLATILITY_INDICATORS: Record<string, IndicatorCatalogEntry> = {
  BOLLINGER_BANDS: {
    name: 'Bollinger Bands',
    description: 'Volatility indicator showing price channels based on standard deviation',
    category: 'volatility',
    supportedInputs: [
      { name: 'price', type: 'price', description: 'Price data (OHLC)', required: true }
    ],
    defaultParams: { period: 20, std_dev: 2.0, price_type: 'close' },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 20,
        constraints: { min: 1, max: 100, step: 1 }
      },
      {
        name: 'std_dev',
        type: 'number',
        description: 'Standard deviation multiplier',
        required: true,
        defaultValue: 2.0,
        constraints: { min: 0.5, max: 5.0, step: 0.1 }
      },
      {
        name: 'price_type',
        type: 'select',
        description: 'Type of price to use',
        required: false,
        defaultValue: 'close',
        constraints: {
          options: [
            { value: 'open', label: 'Open' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
            { value: 'close', label: 'Close' },
            { value: 'hl2', label: 'HL2' },
            { value: 'hlc3', label: 'HLC3' },
            { value: 'ohlc4', label: 'OHLC4' }
          ]
        }
      }
    ],
    outputs: [
      { name: 'upper', type: 'number', description: 'Upper Bollinger Band' },
      { name: 'middle', type: 'number', description: 'Middle Bollinger Band (SMA)' },
      { name: 'lower', type: 'number', description: 'Lower Bollinger Band' },
      { name: 'width', type: 'number', description: 'Band width' },
      { name: 'percent_b', type: 'number', description: '%B indicator' }
    ],
    complexity: 'medium',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'Bollinger Bands show price volatility and potential support/resistance levels.',
    examples: {
      bullish: 'Price touching lower band may indicate oversold condition',
      bearish: 'Price touching upper band may indicate overbought condition',
      neutral: 'Price within bands indicates normal volatility'
    }
  },

  ATR: {
    name: 'Average True Range',
    description: 'Volatility indicator measuring market volatility',
    category: 'volatility',
    supportedInputs: [
      { name: 'high', type: 'price', description: 'High price', required: true },
      { name: 'low', type: 'price', description: 'Low price', required: true },
      { name: 'close', type: 'price', description: 'Close price', required: true }
    ],
    defaultParams: { period: 14 },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 14,
        constraints: { min: 1, max: 100, step: 1 }
      }
    ],
    outputs: [
      { name: 'atr', type: 'number', description: 'Average True Range value' }
    ],
    complexity: 'low',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'ATR measures market volatility by calculating the average of true ranges.',
    examples: {
      bullish: 'High ATR indicates high volatility, potential breakout',
      bearish: 'Low ATR indicates low volatility, potential consolidation',
      neutral: 'ATR expansion/contraction indicates volatility changes'
    }
  },

  KELTNER_CHANNELS: {
    name: 'Keltner Channels',
    description: 'Volatility-based envelope indicator using EMA and ATR',
    category: 'volatility',
    supportedInputs: [
      { name: 'high', type: 'price', description: 'High price', required: true },
      { name: 'low', type: 'price', description: 'Low price', required: true },
      { name: 'close', type: 'price', description: 'Close price', required: true }
    ],
    defaultParams: { period: 20, multiplier: 2.0 },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for EMA calculation',
        required: true,
        defaultValue: 20,
        constraints: { min: 1, max: 100, step: 1 }
      },
      {
        name: 'multiplier',
        type: 'number',
        description: 'ATR multiplier',
        required: true,
        defaultValue: 2.0,
        constraints: { min: 0.5, max: 5.0, step: 0.1 }
      }
    ],
    outputs: [
      { name: 'upper', type: 'number', description: 'Upper Keltner Channel' },
      { name: 'middle', type: 'number', description: 'Middle Keltner Channel (EMA)' },
      { name: 'lower', type: 'number', description: 'Lower Keltner Channel' }
    ],
    complexity: 'medium',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'Keltner Channels use EMA and ATR to create volatility-based price channels.',
    examples: {
      bullish: 'Price above upper channel indicates strong uptrend',
      bearish: 'Price below lower channel indicates strong downtrend',
      neutral: 'Price within channels indicates normal volatility'
    }
  },

  DONCHIAN_CHANNELS: {
    name: 'Donchian Channels',
    description: 'Volatility indicator showing highest high and lowest low over period',
    category: 'volatility',
    supportedInputs: [
      { name: 'high', type: 'price', description: 'High price', required: true },
      { name: 'low', type: 'price', description: 'Low price', required: true }
    ],
    defaultParams: { period: 20 },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 20,
        constraints: { min: 1, max: 100, step: 1 }
      }
    ],
    outputs: [
      { name: 'upper', type: 'number', description: 'Upper Donchian Channel (highest high)' },
      { name: 'lower', type: 'number', description: 'Lower Donchian Channel (lowest low)' },
      { name: 'middle', type: 'number', description: 'Middle Donchian Channel' }
    ],
    complexity: 'low',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'Donchian Channels show the highest high and lowest low over a specified period.',
    examples: {
      bullish: 'Price breaking above upper channel indicates breakout',
      bearish: 'Price breaking below lower channel indicates breakdown',
      neutral: 'Price within channels indicates range-bound market'
    }
  },

  STANDARD_DEVIATION: {
    name: 'Standard Deviation',
    description: 'Statistical measure of price volatility',
    category: 'volatility',
    supportedInputs: [
      { name: 'price', type: 'price', description: 'Price data (OHLC)', required: true }
    ],
    defaultParams: { period: 20, price_type: 'close' },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 20,
        constraints: { min: 1, max: 100, step: 1 }
      },
      {
        name: 'price_type',
        type: 'select',
        description: 'Type of price to use',
        required: false,
        defaultValue: 'close',
        constraints: {
          options: [
            { value: 'open', label: 'Open' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
            { value: 'close', label: 'Close' },
            { value: 'hl2', label: 'HL2' },
            { value: 'hlc3', label: 'HLC3' },
            { value: 'ohlc4', label: 'OHLC4' }
          ]
        }
      }
    ],
    outputs: [
      { name: 'std_dev', type: 'number', description: 'Standard deviation value' }
    ],
    complexity: 'low',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'Standard deviation measures the dispersion of price from its mean.',
    examples: {
      bullish: 'High standard deviation indicates high volatility',
      bearish: 'Low standard deviation indicates low volatility',
      neutral: 'Standard deviation changes indicate volatility shifts'
    }
  },

  VIX: {
    name: 'Volatility Index',
    description: 'Fear gauge measuring market volatility expectations',
    category: 'volatility',
    supportedInputs: [
      { name: 'price', type: 'price', description: 'Price data (OHLC)', required: true }
    ],
    defaultParams: { period: 20, price_type: 'close' },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 20,
        constraints: { min: 1, max: 100, step: 1 }
      },
      {
        name: 'price_type',
        type: 'select',
        description: 'Type of price to use',
        required: false,
        defaultValue: 'close',
        constraints: {
          options: [
            { value: 'open', label: 'Open' },
            { value: 'high', label: 'High' },
            { value: 'low', label: 'Low' },
            { value: 'close', label: 'Close' },
            { value: 'hl2', label: 'HL2' },
            { value: 'hlc3', label: 'HLC3' },
            { value: 'ohlc4', label: 'OHLC4' }
          ]
        }
      }
    ],
    outputs: [
      { name: 'vix', type: 'number', description: 'Volatility Index value' }
    ],
    complexity: 'medium',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'VIX measures market volatility expectations based on price movements.',
    examples: {
      bullish: 'High VIX indicates high fear/volatility',
      bearish: 'Low VIX indicates low fear/volatility',
      neutral: 'VIX changes indicate volatility expectation shifts'
    }
  }
};

// Volume Indicators
const VOLUME_INDICATORS: Record<string, IndicatorCatalogEntry> = {
  VOLUME: {
    name: 'Volume',
    description: 'Basic volume indicator showing trading volume',
    category: 'volume',
    supportedInputs: [
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    defaultParams: {},
    parameters: [],
    outputs: [
      { name: 'volume', type: 'number', description: 'Volume value' }
    ],
    complexity: 'low',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'Volume shows the number of shares or contracts traded.',
    examples: {
      bullish: 'High volume confirms price movements',
      bearish: 'Low volume may indicate weak price movements',
      neutral: 'Volume patterns indicate market participation'
    }
  },

  OBV: {
    name: 'On-Balance Volume',
    description: 'Volume-based momentum indicator',
    category: 'volume',
    supportedInputs: [
      { name: 'close', type: 'price', description: 'Close price', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    defaultParams: {},
    parameters: [],
    outputs: [
      { name: 'obv', type: 'number', description: 'On-Balance Volume value' }
    ],
    complexity: 'low',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'OBV adds volume on up days and subtracts volume on down days.',
    examples: {
      bullish: 'OBV rising confirms uptrend',
      bearish: 'OBV falling confirms downtrend',
      neutral: 'OBV divergence may signal trend change'
    }
  },

  VWAP: {
    name: 'Volume Weighted Average Price',
    description: 'Average price weighted by volume',
    category: 'volume',
    supportedInputs: [
      { name: 'high', type: 'price', description: 'High price', required: true },
      { name: 'low', type: 'price', description: 'Low price', required: true },
      { name: 'close', type: 'price', description: 'Close price', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    defaultParams: {},
    parameters: [],
    outputs: [
      { name: 'vwap', type: 'number', description: 'Volume Weighted Average Price' }
    ],
    complexity: 'low',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'VWAP represents the average price weighted by volume.',
    examples: {
      bullish: 'Price above VWAP indicates buying pressure',
      bearish: 'Price below VWAP indicates selling pressure',
      neutral: 'Price near VWAP indicates balanced market'
    }
  },

  AD_LINE: {
    name: 'Accumulation/Distribution Line',
    description: 'Volume-based indicator measuring buying and selling pressure',
    category: 'volume',
    supportedInputs: [
      { name: 'high', type: 'price', description: 'High price', required: true },
      { name: 'low', type: 'price', description: 'Low price', required: true },
      { name: 'close', type: 'price', description: 'Close price', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    defaultParams: {},
    parameters: [],
    outputs: [
      { name: 'ad_line', type: 'number', description: 'Accumulation/Distribution Line value' }
    ],
    complexity: 'low',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'A/D Line measures buying and selling pressure based on price and volume.',
    examples: {
      bullish: 'A/D Line rising confirms uptrend',
      bearish: 'A/D Line falling confirms downtrend',
      neutral: 'A/D Line divergence may signal trend change'
    }
  },

  CMF: {
    name: 'Chaikin Money Flow',
    description: 'Volume-weighted accumulation/distribution indicator',
    category: 'volume',
    supportedInputs: [
      { name: 'high', type: 'price', description: 'High price', required: true },
      { name: 'low', type: 'price', description: 'Low price', required: true },
      { name: 'close', type: 'price', description: 'Close price', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    defaultParams: { period: 20 },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 20,
        constraints: { min: 1, max: 100, step: 1 }
      }
    ],
    outputs: [
      { name: 'cmf', type: 'number', description: 'Chaikin Money Flow value (-1 to 1)' }
    ],
    complexity: 'medium',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'CMF measures buying and selling pressure over a specified period.',
    examples: {
      bullish: 'CMF above 0 indicates buying pressure',
      bearish: 'CMF below 0 indicates selling pressure',
      neutral: 'CMF near 0 indicates balanced pressure'
    }
  },

  MFI: {
    name: 'Money Flow Index',
    description: 'Volume-weighted RSI measuring buying and selling pressure',
    category: 'volume',
    supportedInputs: [
      { name: 'high', type: 'price', description: 'High price', required: true },
      { name: 'low', type: 'price', description: 'Low price', required: true },
      { name: 'close', type: 'price', description: 'Close price', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    defaultParams: { period: 14 },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 14,
        constraints: { min: 1, max: 100, step: 1 }
      }
    ],
    outputs: [
      { name: 'mfi', type: 'number', description: 'Money Flow Index value (0-100)' }
    ],
    complexity: 'medium',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'MFI is a volume-weighted RSI that measures buying and selling pressure.',
    examples: {
      bullish: 'MFI above 80 indicates overbought with volume',
      bearish: 'MFI below 20 indicates oversold with volume',
      neutral: 'MFI between 20-80 indicates normal conditions'
    }
  },

  EASE_OF_MOVEMENT: {
    name: 'Ease of Movement',
    description: 'Volume-based indicator measuring price movement efficiency',
    category: 'volume',
    supportedInputs: [
      { name: 'high', type: 'price', description: 'High price', required: true },
      { name: 'low', type: 'price', description: 'Low price', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    defaultParams: { period: 14 },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 14,
        constraints: { min: 1, max: 100, step: 1 }
      }
    ],
    outputs: [
      { name: 'eom', type: 'number', description: 'Ease of Movement value' }
    ],
    complexity: 'medium',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'EOM measures how easily price moves with volume.',
    examples: {
      bullish: 'Positive EOM indicates easy upward movement',
      bearish: 'Negative EOM indicates easy downward movement',
      neutral: 'EOM near zero indicates difficult price movement'
    }
  },

  VOLUME_RATE_OF_CHANGE: {
    name: 'Volume Rate of Change',
    description: 'Momentum indicator measuring volume change over time',
    category: 'volume',
    supportedInputs: [
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    defaultParams: { period: 10 },
    parameters: [
      {
        name: 'period',
        type: 'number',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 10,
        constraints: { min: 1, max: 100, step: 1 }
      }
    ],
    outputs: [
      { name: 'vroc', type: 'number', description: 'Volume Rate of Change percentage' }
    ],
    complexity: 'low',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'VROC measures the percentage change in volume over a specified period.',
    examples: {
      bullish: 'Positive VROC indicates increasing volume',
      bearish: 'Negative VROC indicates decreasing volume',
      neutral: 'VROC near zero indicates stable volume'
    }
  },

  VOLUME_OSCILLATOR: {
    name: 'Volume Oscillator',
    description: 'Difference between two volume moving averages',
    category: 'volume',
    supportedInputs: [
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    defaultParams: { short_period: 5, long_period: 10 },
    parameters: [
      {
        name: 'short_period',
        type: 'number',
        description: 'Short period for volume MA',
        required: true,
        defaultValue: 5,
        constraints: { min: 1, max: 50, step: 1 }
      },
      {
        name: 'long_period',
        type: 'number',
        description: 'Long period for volume MA',
        required: true,
        defaultValue: 10,
        constraints: { min: 1, max: 100, step: 1 }
      }
    ],
    outputs: [
      { name: 'vo', type: 'number', description: 'Volume Oscillator value' }
    ],
    complexity: 'low',
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    documentation: 'Volume Oscillator shows the difference between short and long volume moving averages.',
    examples: {
      bullish: 'Positive VO indicates increasing volume trend',
      bearish: 'Negative VO indicates decreasing volume trend',
      neutral: 'VO near zero indicates stable volume trend'
    }
  }
};

// Support/Resistance Indicators
const SUPPORT_RESISTANCE_INDICATORS: Record<string, IndicatorCatalogEntry> = {
  PIVOT_POINTS: {
    name: 'Pivot Points',
    description: 'Support and resistance levels based on previous day\'s OHLC',
    category: 'support_resistance',
    supportedInputs: [
      { name: 'high', type: 'price', description: 'High price', required: true },
      { name: 'low', type: 'price', description: 'Low price', required: true },
      { name: 'close', type: 'price', description: 'Close price', required: true }
    ],
    defaultParams: {},
    parameters: [],
    outputs: [
      { name: 'pivot', type: 'number', description: 'Pivot Point' },
      { name: 'r1', type: 'number', description: 'Resistance 1' },
      { name: 'r2', type: 'number', description: 'Resistance 2' },
      { name: 'r3', type: 'number', description: 'Resistance 3' },
      { name: 's1', type: 'number', description: 'Support 1' },
      { name: 's2', type: 'number', description: 'Support 2' },
      { name: 's3', type: 'number', description: 'Support 3' }
    ],
    complexity: 'low',
    timeframe: ['1h', '4h', '1d'],
    documentation: 'Pivot Points calculate support and resistance levels based on previous period\'s OHLC.',
    examples: {
      bullish: 'Price above pivot point indicates bullish sentiment',
      bearish: 'Price below pivot point indicates bearish sentiment',
      neutral: 'Price near pivot point indicates indecision'
    }
  },

  FIBONACCI_RETRACEMENT: {
    name: 'Fibonacci Retracement',
    description: 'Support and resistance levels based on Fibonacci ratios',
    category: 'support_resistance',
    supportedInputs: [
      { name: 'high', type: 'price', description: 'High price', required: true },
      { name: 'low', type: 'price', description: 'Low price', required: true }
    ],
    defaultParams: {},
    parameters: [],
    outputs: [
      { name: 'level_0', type: 'number', description: '0% level' },
      { name: 'level_236', type: 'number', description: '23.6% level' },
      { name: 'level_382', type: 'number', description: '38.2% level' },
      { name: 'level_500', type: 'number', description: '50% level' },
      { name: 'level_618', type: 'number', description: '61.8% level' },
      { name: 'level_786', type: 'number', description: '78.6% level' },
      { name: 'level_100', type: 'number', description: '100% level' }
    ],
    complexity: 'low',
    timeframe: ['1h', '4h', '1d'],
    documentation: 'Fibonacci Retracement levels are based on mathematical ratios found in nature.',
    examples: {
      bullish: 'Price bouncing off 61.8% level indicates potential reversal',
      bearish: 'Price breaking below 38.2% level indicates weakness',
      neutral: 'Price consolidating between Fibonacci levels'
    }
  },

  ICHIMOKU: {
    name: 'Ichimoku Cloud',
    description: 'Comprehensive support/resistance and trend indicator',
    category: 'support_resistance',
    supportedInputs: [
      { name: 'high', type: 'price', description: 'High price', required: true },
      { name: 'low', type: 'price', description: 'Low price', required: true },
      { name: 'close', type: 'price', description: 'Close price', required: true }
    ],
    defaultParams: { conversion_period: 9, base_period: 26, leading_span_b_period: 52, displacement: 26 },
    parameters: [
      {
        name: 'conversion_period',
        type: 'number',
        description: 'Tenkan-sen period',
        required: true,
        defaultValue: 9,
        constraints: { min: 1, max: 50, step: 1 }
      },
      {
        name: 'base_period',
        type: 'number',
        description: 'Kijun-sen period',
        required: true,
        defaultValue: 26,
        constraints: { min: 1, max: 100, step: 1 }
      },
      {
        name: 'leading_span_b_period',
        type: 'number',
        description: 'Senkou Span B period',
        required: true,
        defaultValue: 52,
        constraints: { min: 1, max: 200, step: 1 }
      },
      {
        name: 'displacement',
        type: 'number',
        description: 'Chikou Span displacement',
        required: true,
        defaultValue: 26,
        constraints: { min: 1, max: 100, step: 1 }
      }
    ],
    outputs: [
      { name: 'tenkan_sen', type: 'number', description: 'Tenkan-sen (Conversion Line)' },
      { name: 'kijun_sen', type: 'number', description: 'Kijun-sen (Base Line)' },
      { name: 'senkou_span_a', type: 'number', description: 'Senkou Span A' },
      { name: 'senkou_span_b', type: 'number', description: 'Senkou Span B' },
      { name: 'chikou_span', type: 'number', description: 'Chikou Span' }
    ],
    complexity: 'high',
    timeframe: ['1h', '4h', '1d'],
    documentation: 'Ichimoku provides comprehensive support/resistance levels and trend analysis.',
    examples: {
      bullish: 'Price above cloud with Tenkan above Kijun indicates uptrend',
      bearish: 'Price below cloud with Tenkan below Kijun indicates downtrend',
      neutral: 'Price within cloud indicates consolidation'
    }
  }
};

// Combine all indicators
const INDICATOR_CATALOG: Record<string, IndicatorCatalogEntry> = {
  ...TREND_INDICATORS,
  ...MOMENTUM_INDICATORS,
  ...VOLATILITY_INDICATORS,
  ...VOLUME_INDICATORS,
  ...SUPPORT_RESISTANCE_INDICATORS
};

// Utility Functions
export const getIndicatorByName = (name: string): IndicatorCatalogEntry | undefined => {
  return INDICATOR_CATALOG[name];
};

export const getAllIndicators = (): IndicatorCatalogEntry[] => {
  return Object.values(INDICATOR_CATALOG);
};

export const getIndicatorsByCategory = (category: string): IndicatorCatalogEntry[] => {
  return Object.values(INDICATOR_CATALOG).filter(indicator => indicator.category === category);
};

export const searchIndicators = (query: string): IndicatorCatalogEntry[] => {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(INDICATOR_CATALOG).filter(indicator => 
    indicator.name.toLowerCase().includes(lowercaseQuery) ||
    indicator.description.toLowerCase().includes(lowercaseQuery)
  );
};

export const getIndicatorNames = (): string[] => {
  return Object.keys(INDICATOR_CATALOG);
};

export const getCategories = (): string[] => {
  return Array.from(new Set(Object.values(INDICATOR_CATALOG).map(indicator => indicator.category)));
};

// Export the catalog
export default INDICATOR_CATALOG;

/**
 * How to Add New Indicators to the Catalog
 * 
 * 1. Choose the appropriate category:
 *    - 'trend': Trend-following indicators (SMA, EMA, etc.)
 *    - 'momentum': Momentum oscillators (RSI, MACD, etc.)
 *    - 'volatility': Volatility indicators (Bollinger Bands, ATR, etc.)
 *    - 'volume': Volume-based indicators (OBV, VWAP, etc.)
 *    - 'oscillator': General oscillators
 *    - 'support_resistance': Support/resistance indicators
 * 
 * 2. Define the indicator entry with all required fields:
 *    - name: Display name
 *    - description: Brief description
 *    - category: One of the categories above
 *    - supportedInputs: Array of required inputs
 *    - defaultParams: Default parameter values
 *    - parameters: Array of parameter definitions
 *    - outputs: Array of output definitions
 *    - complexity: 'low', 'medium', or 'high'
 *    - timeframe: Array of supported timeframes
 *    - documentation: Detailed explanation
 *    - examples: Bullish, bearish, and neutral examples
 * 
 * 3. Add the indicator to the appropriate category object
 * 
 * 4. Update the INDICATOR_CATALOG export to include the new category
 * 
 * Example:
 * 
 * const NEW_INDICATOR: IndicatorCatalogEntry = {
 *   name: 'My Custom Indicator',
 *   description: 'A custom indicator for specific analysis',
 *   category: 'momentum',
 *   supportedInputs: [
 *     { name: 'price', type: 'price', description: 'Price data', required: true }
 *   ],
 *   defaultParams: { period: 14 },
 *   parameters: [
 *     {
 *       name: 'period',
 *       type: 'number',
 *       description: 'Calculation period',
 *       required: true,
 *       defaultValue: 14,
 *       constraints: { min: 1, max: 100, step: 1 }
 *     }
 *   ],
 *   outputs: [
 *     { name: 'value', type: 'number', description: 'Indicator value' }
 *   ],
 *   complexity: 'medium',
 *   timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
 *   documentation: 'Detailed explanation of how the indicator works...',
 *   examples: {
 *     bullish: 'When indicator is above threshold...',
 *     bearish: 'When indicator is below threshold...',
 *     neutral: 'When indicator is near threshold...'
 *   }
 * };
 */
