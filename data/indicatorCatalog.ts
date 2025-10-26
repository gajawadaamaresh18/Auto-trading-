// Technical Indicator Catalog
// Comprehensive collection of 100+ technical indicators with TypeScript definitions

export interface IndicatorParam {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  description: string;
  default: any;
  min?: number;
  max?: number;
  options?: string[];
  required?: boolean;
}

export interface IndicatorInput {
  name: string;
  type: 'price' | 'volume' | 'custom';
  description: string;
  required: boolean;
}

export interface Indicator {
  key: string;
  name: string;
  description: string;
  inputs: IndicatorInput[];
  params: IndicatorParam[];
  category: string;
  pythonFunction: string;
  pythonInputs: string[];
  pythonOutput: string;
  usagePattern: string;
  library: 'ta-lib' | 'pandas_ta' | 'custom';
}

export const indicatorCatalog: Indicator[] = [
  // === TREND INDICATORS ===
  {
    key: 'sma',
    name: 'Simple Moving Average',
    description: 'Calculates the average price over a specified period',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 20, min: 1, max: 200, required: true }
    ],
    category: 'trend',
    pythonFunction: 'SMA',
    pythonInputs: ['close', 'timeperiod'],
    pythonOutput: 'sma_values',
    usagePattern: 'ta.SMA(close, timeperiod=20)',
    library: 'ta-lib'
  },
  {
    key: 'ema',
    name: 'Exponential Moving Average',
    description: 'Calculates the exponentially weighted moving average',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 20, min: 1, max: 200, required: true }
    ],
    category: 'trend',
    pythonFunction: 'EMA',
    pythonInputs: ['close', 'timeperiod'],
    pythonOutput: 'ema_values',
    usagePattern: 'ta.EMA(close, timeperiod=20)',
    library: 'ta-lib'
  },
  {
    key: 'wma',
    name: 'Weighted Moving Average',
    description: 'Calculates the weighted moving average with linear weights',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 20, min: 1, max: 200, required: true }
    ],
    category: 'trend',
    pythonFunction: 'WMA',
    pythonInputs: ['close', 'timeperiod'],
    pythonOutput: 'wma_values',
    usagePattern: 'ta.WMA(close, timeperiod=20)',
    library: 'ta-lib'
  },
  {
    key: 'dema',
    name: 'Double Exponential Moving Average',
    description: 'Reduces lag by applying EMA twice',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 20, min: 1, max: 200, required: true }
    ],
    category: 'trend',
    pythonFunction: 'DEMA',
    pythonInputs: ['close', 'timeperiod'],
    pythonOutput: 'dema_values',
    usagePattern: 'ta.DEMA(close, timeperiod=20)',
    library: 'ta-lib'
  },
  {
    key: 'tema',
    name: 'Triple Exponential Moving Average',
    description: 'Applies EMA three times to reduce lag further',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 20, min: 1, max: 200, required: true }
    ],
    category: 'trend',
    pythonFunction: 'TEMA',
    pythonInputs: ['close', 'timeperiod'],
    pythonOutput: 'tema_values',
    usagePattern: 'ta.TEMA(close, timeperiod=20)',
    library: 'ta-lib'
  },
  {
    key: 'kama',
    name: 'Kaufman Adaptive Moving Average',
    description: 'Adapts to market volatility and noise',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 30, min: 1, max: 200, required: true }
    ],
    category: 'trend',
    pythonFunction: 'KAMA',
    pythonInputs: ['close', 'timeperiod'],
    pythonOutput: 'kama_values',
    usagePattern: 'ta.KAMA(close, timeperiod=30)',
    library: 'ta-lib'
  },
  {
    key: 'mama',
    name: 'MESA Adaptive Moving Average',
    description: 'Adaptive moving average based on Hilbert Transform',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'fastlimit', type: 'number', description: 'Fast limit', default: 0.5, min: 0.01, max: 0.99 },
      { name: 'slowlimit', type: 'number', description: 'Slow limit', default: 0.05, min: 0.01, max: 0.99 }
    ],
    category: 'trend',
    pythonFunction: 'MAMA',
    pythonInputs: ['close', 'fastlimit', 'slowlimit'],
    pythonOutput: 'mama_values, fama_values',
    usagePattern: 'ta.MAMA(close, fastlimit=0.5, slowlimit=0.05)',
    library: 'ta-lib'
  },
  {
    key: 't3',
    name: 'T3 Moving Average',
    description: 'Triple smoothed moving average',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 20, min: 1, max: 200, required: true },
      { name: 'vfactor', type: 'number', description: 'Volume factor', default: 0.7, min: 0, max: 1 }
    ],
    category: 'trend',
    pythonFunction: 'T3',
    pythonInputs: ['close', 'timeperiod', 'vfactor'],
    pythonOutput: 't3_values',
    usagePattern: 'ta.T3(close, timeperiod=20, vfactor=0.7)',
    library: 'ta-lib'
  },
  {
    key: 'trima',
    name: 'Triangular Moving Average',
    description: 'Double smoothed simple moving average',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 20, min: 1, max: 200, required: true }
    ],
    category: 'trend',
    pythonFunction: 'TRIMA',
    pythonInputs: ['close', 'timeperiod'],
    pythonOutput: 'trima_values',
    usagePattern: 'ta.TRIMA(close, timeperiod=20)',
    library: 'ta-lib'
  },
  {
    key: 'vwma',
    name: 'Volume Weighted Moving Average',
    description: 'Moving average weighted by volume',
    inputs: [
      { name: 'close', type: 'price', description: 'Closing prices', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 20, min: 1, max: 200, required: true }
    ],
    category: 'trend',
    pythonFunction: 'VWMA',
    pythonInputs: ['close', 'volume', 'timeperiod'],
    pythonOutput: 'vwma_values',
    usagePattern: 'ta.VWMA(close, volume, timeperiod=20)',
    library: 'pandas_ta'
  },

  // === MOMENTUM INDICATORS ===
  {
    key: 'rsi',
    name: 'Relative Strength Index',
    description: 'Measures the speed and magnitude of price changes',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'momentum',
    pythonFunction: 'RSI',
    pythonInputs: ['close', 'timeperiod'],
    pythonOutput: 'rsi_values',
    usagePattern: 'ta.RSI(close, timeperiod=14)',
    library: 'ta-lib'
  },
  {
    key: 'stoch',
    name: 'Stochastic Oscillator',
    description: 'Compares closing price to price range over a period',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'k_period', type: 'number', description: 'K period', default: 14, min: 1, max: 100, required: true },
      { name: 'd_period', type: 'number', description: 'D period', default: 3, min: 1, max: 100, required: true },
      { name: 'smooth_k', type: 'number', description: 'K smoothing', default: 1, min: 1, max: 10 }
    ],
    category: 'momentum',
    pythonFunction: 'STOCH',
    pythonInputs: ['high', 'low', 'close', 'fastk_period', 'slowk_period', 'slowd_period'],
    pythonOutput: 'slowk_values, slowd_values',
    usagePattern: 'ta.STOCH(high, low, close, fastk_period=14, slowk_period=3, slowd_period=3)',
    library: 'ta-lib'
  },
  {
    key: 'stochf',
    name: 'Stochastic Fast',
    description: 'Fast version of stochastic oscillator',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'k_period', type: 'number', description: 'K period', default: 14, min: 1, max: 100, required: true },
      { name: 'd_period', type: 'number', description: 'D period', default: 3, min: 1, max: 100, required: true }
    ],
    category: 'momentum',
    pythonFunction: 'STOCHF',
    pythonInputs: ['high', 'low', 'close', 'fastk_period', 'fastd_period'],
    pythonOutput: 'fastk_values, fastd_values',
    usagePattern: 'ta.STOCHF(high, low, close, fastk_period=14, fastd_period=3)',
    library: 'ta-lib'
  },
  {
    key: 'williams_r',
    name: 'Williams %R',
    description: 'Momentum indicator measuring overbought/oversold levels',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'momentum',
    pythonFunction: 'WILLR',
    pythonInputs: ['high', 'low', 'close', 'timeperiod'],
    pythonOutput: 'willr_values',
    usagePattern: 'ta.WILLR(high, low, close, timeperiod=14)',
    library: 'ta-lib'
  },
  {
    key: 'cci',
    name: 'Commodity Channel Index',
    description: 'Measures deviation from statistical mean',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'momentum',
    pythonFunction: 'CCI',
    pythonInputs: ['high', 'low', 'close', 'timeperiod'],
    pythonOutput: 'cci_values',
    usagePattern: 'ta.CCI(high, low, close, timeperiod=14)',
    library: 'ta-lib'
  },
  {
    key: 'roc',
    name: 'Rate of Change',
    description: 'Measures percentage change in price over time',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 10, min: 1, max: 100, required: true }
    ],
    category: 'momentum',
    pythonFunction: 'ROC',
    pythonInputs: ['close', 'timeperiod'],
    pythonOutput: 'roc_values',
    usagePattern: 'ta.ROC(close, timeperiod=10)',
    library: 'ta-lib'
  },
  {
    key: 'momentum',
    name: 'Momentum',
    description: 'Measures the rate of change in price',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 10, min: 1, max: 100, required: true }
    ],
    category: 'momentum',
    pythonFunction: 'MOM',
    pythonInputs: ['close', 'timeperiod'],
    pythonOutput: 'mom_values',
    usagePattern: 'ta.MOM(close, timeperiod=10)',
    library: 'ta-lib'
  },
  {
    key: 'ppo',
    name: 'Percentage Price Oscillator',
    description: 'Percentage difference between two moving averages',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'fast_period', type: 'number', description: 'Fast period', default: 12, min: 1, max: 100, required: true },
      { name: 'slow_period', type: 'number', description: 'Slow period', default: 26, min: 1, max: 100, required: true },
      { name: 'ma_type', type: 'select', description: 'MA type', default: 'EMA', options: ['SMA', 'EMA', 'WMA'], required: true }
    ],
    category: 'momentum',
    pythonFunction: 'PPO',
    pythonInputs: ['close', 'fastperiod', 'slowperiod', 'matype'],
    pythonOutput: 'ppo_values',
    usagePattern: 'ta.PPO(close, fastperiod=12, slowperiod=26, matype=1)',
    library: 'ta-lib'
  },
  {
    key: 'macd',
    name: 'MACD',
    description: 'Moving Average Convergence Divergence',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'fast_period', type: 'number', description: 'Fast period', default: 12, min: 1, max: 100, required: true },
      { name: 'slow_period', type: 'number', description: 'Slow period', default: 26, min: 1, max: 100, required: true },
      { name: 'signal_period', type: 'number', description: 'Signal period', default: 9, min: 1, max: 100, required: true }
    ],
    category: 'momentum',
    pythonFunction: 'MACD',
    pythonInputs: ['close', 'fastperiod', 'slowperiod', 'signalperiod'],
    pythonOutput: 'macd_values, macdsignal_values, macdhist_values',
    usagePattern: 'ta.MACD(close, fastperiod=12, slowperiod=26, signalperiod=9)',
    library: 'ta-lib'
  },
  {
    key: 'macdext',
    name: 'MACD with controllable MA type',
    description: 'MACD with user-defined MA types',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'fast_period', type: 'number', description: 'Fast period', default: 12, min: 1, max: 100, required: true },
      { name: 'slow_period', type: 'number', description: 'Slow period', default: 26, min: 1, max: 100, required: true },
      { name: 'signal_period', type: 'number', description: 'Signal period', default: 9, min: 1, max: 100, required: true },
      { name: 'fast_ma_type', type: 'select', description: 'Fast MA type', default: 'EMA', options: ['SMA', 'EMA', 'WMA'], required: true },
      { name: 'slow_ma_type', type: 'select', description: 'Slow MA type', default: 'EMA', options: ['SMA', 'EMA', 'WMA'], required: true },
      { name: 'signal_ma_type', type: 'select', description: 'Signal MA type', default: 'EMA', options: ['SMA', 'EMA', 'WMA'], required: true }
    ],
    category: 'momentum',
    pythonFunction: 'MACDEXT',
    pythonInputs: ['close', 'fastperiod', 'slowperiod', 'signalperiod', 'fastmatype', 'slowmatype', 'signalmatype'],
    pythonOutput: 'macd_values, macdsignal_values, macdhist_values',
    usagePattern: 'ta.MACDEXT(close, fastperiod=12, slowperiod=26, signalperiod=9, fastmatype=1, slowmatype=1, signalmatype=1)',
    library: 'ta-lib'
  },
  {
    key: 'macdfix',
    name: 'MACD Fixed Period',
    description: 'MACD with fixed 12/26 periods',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'signal_period', type: 'number', description: 'Signal period', default: 9, min: 1, max: 100, required: true }
    ],
    category: 'momentum',
    pythonFunction: 'MACDFIX',
    pythonInputs: ['close', 'signalperiod'],
    pythonOutput: 'macd_values, macdsignal_values, macdhist_values',
    usagePattern: 'ta.MACDFIX(close, signalperiod=9)',
    library: 'ta-lib'
  },

  // === VOLATILITY INDICATORS ===
  {
    key: 'atr',
    name: 'Average True Range',
    description: 'Measures market volatility',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'volatility',
    pythonFunction: 'ATR',
    pythonInputs: ['high', 'low', 'close', 'timeperiod'],
    pythonOutput: 'atr_values',
    usagePattern: 'ta.ATR(high, low, close, timeperiod=14)',
    library: 'ta-lib'
  },
  {
    key: 'natr',
    name: 'Normalized Average True Range',
    description: 'ATR normalized by price',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'volatility',
    pythonFunction: 'NATR',
    pythonInputs: ['high', 'low', 'close', 'timeperiod'],
    pythonOutput: 'natr_values',
    usagePattern: 'ta.NATR(high, low, close, timeperiod=14)',
    library: 'ta-lib'
  },
  {
    key: 'trange',
    name: 'True Range',
    description: 'True range without smoothing',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [],
    category: 'volatility',
    pythonFunction: 'TRANGE',
    pythonInputs: ['high', 'low', 'close'],
    pythonOutput: 'trange_values',
    usagePattern: 'ta.TRANGE(high, low, close)',
    library: 'ta-lib'
  },
  {
    key: 'bbands',
    name: 'Bollinger Bands',
    description: 'Price channels based on standard deviation',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 20, min: 1, max: 100, required: true },
      { name: 'std_dev', type: 'number', description: 'Standard deviation multiplier', default: 2, min: 0.1, max: 5, required: true },
      { name: 'ma_type', type: 'select', description: 'MA type', default: 'SMA', options: ['SMA', 'EMA', 'WMA'], required: true }
    ],
    category: 'volatility',
    pythonFunction: 'BBANDS',
    pythonInputs: ['close', 'timeperiod', 'nbdevup', 'nbdevdn', 'matype'],
    pythonOutput: 'upperband_values, middleband_values, lowerband_values',
    usagePattern: 'ta.BBANDS(close, timeperiod=20, nbdevup=2, nbdevdn=2, matype=0)',
    library: 'ta-lib'
  },
  {
    key: 'kc',
    name: 'Keltner Channels',
    description: 'Price channels based on ATR',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 20, min: 1, max: 100, required: true },
      { name: 'multiplier', type: 'number', description: 'ATR multiplier', default: 2, min: 0.1, max: 5, required: true }
    ],
    category: 'volatility',
    pythonFunction: 'KC',
    pythonInputs: ['high', 'low', 'close', 'timeperiod', 'multiplier'],
    pythonOutput: 'upperband_values, middleband_values, lowerband_values',
    usagePattern: 'ta.KC(high, low, close, timeperiod=20, multiplier=2)',
    library: 'pandas_ta'
  },
  {
    key: 'dc',
    name: 'Donchian Channels',
    description: 'Price channels based on highest high and lowest low',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 20, min: 1, max: 100, required: true }
    ],
    category: 'volatility',
    pythonFunction: 'DC',
    pythonInputs: ['high', 'low', 'timeperiod'],
    pythonOutput: 'upperband_values, middleband_values, lowerband_values',
    usagePattern: 'ta.DC(high, low, timeperiod=20)',
    library: 'pandas_ta'
  },
  {
    key: 'ui',
    name: 'Ulcer Index',
    description: 'Measures downside volatility',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'volatility',
    pythonFunction: 'UI',
    pythonInputs: ['close', 'timeperiod'],
    pythonOutput: 'ui_values',
    usagePattern: 'ta.UI(close, timeperiod=14)',
    library: 'pandas_ta'
  },
  {
    key: 'mass',
    name: 'Mass Index',
    description: 'Measures volatility based on high-low range',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 25, min: 1, max: 100, required: true }
    ],
    category: 'volatility',
    pythonFunction: 'MASS',
    pythonInputs: ['high', 'low', 'timeperiod'],
    pythonOutput: 'mass_values',
    usagePattern: 'ta.MASS(high, low, timeperiod=25)',
    library: 'pandas_ta'
  },
  {
    key: 'vi',
    name: 'Vortex Indicator',
    description: 'Measures trend strength and direction',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'volatility',
    pythonFunction: 'VI',
    pythonInputs: ['high', 'low', 'close', 'timeperiod'],
    pythonOutput: 'vi_plus_values, vi_minus_values',
    usagePattern: 'ta.VI(high, low, close, timeperiod=14)',
    library: 'pandas_ta'
  },

  // === VOLUME INDICATORS ===
  {
    key: 'ad',
    name: 'Accumulation/Distribution Line',
    description: 'Volume-based indicator measuring buying/selling pressure',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    params: [],
    category: 'volume',
    pythonFunction: 'AD',
    pythonInputs: ['high', 'low', 'close', 'volume'],
    pythonOutput: 'ad_values',
    usagePattern: 'ta.AD(high, low, close, volume)',
    library: 'ta-lib'
  },
  {
    key: 'adosc',
    name: 'A/D Oscillator',
    description: 'Oscillator version of A/D line',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    params: [
      { name: 'fast_period', type: 'number', description: 'Fast period', default: 3, min: 1, max: 100, required: true },
      { name: 'slow_period', type: 'number', description: 'Slow period', default: 10, min: 1, max: 100, required: true }
    ],
    category: 'volume',
    pythonFunction: 'ADOSC',
    pythonInputs: ['high', 'low', 'close', 'volume', 'fastperiod', 'slowperiod'],
    pythonOutput: 'adosc_values',
    usagePattern: 'ta.ADOSC(high, low, close, volume, fastperiod=3, slowperiod=10)',
    library: 'ta-lib'
  },
  {
    key: 'obv',
    name: 'On Balance Volume',
    description: 'Cumulative volume indicator',
    inputs: [
      { name: 'close', type: 'price', description: 'Closing prices', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    params: [],
    category: 'volume',
    pythonFunction: 'OBV',
    pythonInputs: ['close', 'volume'],
    pythonOutput: 'obv_values',
    usagePattern: 'ta.OBV(close, volume)',
    library: 'ta-lib'
  },
  {
    key: 'cmf',
    name: 'Chaikin Money Flow',
    description: 'Volume-weighted average of accumulation/distribution',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 20, min: 1, max: 100, required: true }
    ],
    category: 'volume',
    pythonFunction: 'CMF',
    pythonInputs: ['high', 'low', 'close', 'volume', 'timeperiod'],
    pythonOutput: 'cmf_values',
    usagePattern: 'ta.CMF(high, low, close, volume, timeperiod=20)',
    library: 'pandas_ta'
  },
  {
    key: 'fi',
    name: 'Force Index',
    description: 'Measures the force behind price movements',
    inputs: [
      { name: 'close', type: 'price', description: 'Closing prices', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 13, min: 1, max: 100, required: true }
    ],
    category: 'volume',
    pythonFunction: 'FI',
    pythonInputs: ['close', 'volume', 'timeperiod'],
    pythonOutput: 'fi_values',
    usagePattern: 'ta.FI(close, volume, timeperiod=13)',
    library: 'pandas_ta'
  },
  {
    key: 'eom',
    name: 'Ease of Movement',
    description: 'Measures price change per unit volume',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'volume',
    pythonFunction: 'EOM',
    pythonInputs: ['high', 'low', 'volume', 'timeperiod'],
    pythonOutput: 'eom_values',
    usagePattern: 'ta.EOM(high, low, volume, timeperiod=14)',
    library: 'pandas_ta'
  },
  {
    key: 'vwap',
    name: 'Volume Weighted Average Price',
    description: 'Average price weighted by volume',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    params: [],
    category: 'volume',
    pythonFunction: 'VWAP',
    pythonInputs: ['high', 'low', 'close', 'volume'],
    pythonOutput: 'vwap_values',
    usagePattern: 'ta.VWAP(high, low, close, volume)',
    library: 'pandas_ta'
  },
  {
    key: 'vwma',
    name: 'Volume Weighted Moving Average',
    description: 'Moving average weighted by volume',
    inputs: [
      { name: 'close', type: 'price', description: 'Closing prices', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 20, min: 1, max: 100, required: true }
    ],
    category: 'volume',
    pythonFunction: 'VWMA',
    pythonInputs: ['close', 'volume', 'timeperiod'],
    pythonOutput: 'vwma_values',
    usagePattern: 'ta.VWMA(close, volume, timeperiod=20)',
    library: 'pandas_ta'
  },
  {
    key: 'pvi',
    name: 'Positive Volume Index',
    description: 'Cumulative indicator for positive volume days',
    inputs: [
      { name: 'close', type: 'price', description: 'Closing prices', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    params: [],
    category: 'volume',
    pythonFunction: 'PVI',
    pythonInputs: ['close', 'volume'],
    pythonOutput: 'pvi_values',
    usagePattern: 'ta.PVI(close, volume)',
    library: 'pandas_ta'
  },
  {
    key: 'nvi',
    name: 'Negative Volume Index',
    description: 'Cumulative indicator for negative volume days',
    inputs: [
      { name: 'close', type: 'price', description: 'Closing prices', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    params: [],
    category: 'volume',
    pythonFunction: 'NVI',
    pythonInputs: ['close', 'volume'],
    pythonOutput: 'nvi_values',
    usagePattern: 'ta.NVI(close, volume)',
    library: 'pandas_ta'
  },

  // === TREND STRENGTH INDICATORS ===
  {
    key: 'adx',
    name: 'Average Directional Index',
    description: 'Measures trend strength without direction',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'trend_strength',
    pythonFunction: 'ADX',
    pythonInputs: ['high', 'low', 'close', 'timeperiod'],
    pythonOutput: 'adx_values',
    usagePattern: 'ta.ADX(high, low, close, timeperiod=14)',
    library: 'ta-lib'
  },
  {
    key: 'plus_di',
    name: 'Plus Directional Indicator',
    description: 'Measures upward trend strength',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'trend_strength',
    pythonFunction: 'PLUS_DI',
    pythonInputs: ['high', 'low', 'close', 'timeperiod'],
    pythonOutput: 'plus_di_values',
    usagePattern: 'ta.PLUS_DI(high, low, close, timeperiod=14)',
    library: 'ta-lib'
  },
  {
    key: 'minus_di',
    name: 'Minus Directional Indicator',
    description: 'Measures downward trend strength',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'trend_strength',
    pythonFunction: 'MINUS_DI',
    pythonInputs: ['high', 'low', 'close', 'timeperiod'],
    pythonOutput: 'minus_di_values',
    usagePattern: 'ta.MINUS_DI(high, low, close, timeperiod=14)',
    library: 'ta-lib'
  },
  {
    key: 'dx',
    name: 'Directional Movement Index',
    description: 'Measures directional movement strength',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'trend_strength',
    pythonFunction: 'DX',
    pythonInputs: ['high', 'low', 'close', 'timeperiod'],
    pythonOutput: 'dx_values',
    usagePattern: 'ta.DX(high, low, close, timeperiod=14)',
    library: 'ta-lib'
  },
  {
    key: 'aroon',
    name: 'Aroon',
    description: 'Measures time since highest high and lowest low',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'trend_strength',
    pythonFunction: 'AROON',
    pythonInputs: ['high', 'low', 'timeperiod'],
    pythonOutput: 'aroon_down_values, aroon_up_values',
    usagePattern: 'ta.AROON(high, low, timeperiod=14)',
    library: 'ta-lib'
  },
  {
    key: 'aroonosc',
    name: 'Aroon Oscillator',
    description: 'Difference between Aroon Up and Aroon Down',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'trend_strength',
    pythonFunction: 'AROONOSC',
    pythonInputs: ['high', 'low', 'timeperiod'],
    pythonOutput: 'aroonosc_values',
    usagePattern: 'ta.AROONOSC(high, low, timeperiod=14)',
    library: 'ta-lib'
  },
  {
    key: 'bop',
    name: 'Balance of Power',
    description: 'Measures buying/selling pressure',
    inputs: [
      { name: 'open', type: 'price', description: 'Opening prices', required: true },
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [],
    category: 'trend_strength',
    pythonFunction: 'BOP',
    pythonInputs: ['open', 'high', 'low', 'close'],
    pythonOutput: 'bop_values',
    usagePattern: 'ta.BOP(open, high, low, close)',
    library: 'pandas_ta'
  },
  {
    key: 'cmo',
    name: 'Chande Momentum Oscillator',
    description: 'Momentum oscillator based on price changes',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'trend_strength',
    pythonFunction: 'CMO',
    pythonInputs: ['close', 'timeperiod'],
    pythonOutput: 'cmo_values',
    usagePattern: 'ta.CMO(close, timeperiod=14)',
    library: 'pandas_ta'
  },
  {
    key: 'dmi',
    name: 'Directional Movement Index',
    description: 'Combines ADX, +DI, and -DI',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'trend_strength',
    pythonFunction: 'DMI',
    pythonInputs: ['high', 'low', 'close', 'timeperiod'],
    pythonOutput: 'adx_values, plus_di_values, minus_di_values',
    usagePattern: 'ta.DMI(high, low, close, timeperiod=14)',
    library: 'pandas_ta'
  },

  // === CUSTOM INDICATORS ===
  {
    key: 'supertrend',
    name: 'Supertrend',
    description: 'Trend-following indicator based on ATR',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'ATR period', default: 10, min: 1, max: 100, required: true },
      { name: 'multiplier', type: 'number', description: 'ATR multiplier', default: 3, min: 0.1, max: 10, required: true }
    ],
    category: 'custom',
    pythonFunction: 'supertrend',
    pythonInputs: ['high', 'low', 'close', 'period', 'multiplier'],
    pythonOutput: 'supertrend_values, direction_values',
    usagePattern: 'ta.supertrend(high, low, close, period=10, multiplier=3)',
    library: 'pandas_ta'
  },
  {
    key: 'ichimoku',
    name: 'Ichimoku Cloud',
    description: 'Comprehensive trend analysis system',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'conversion_period', type: 'number', description: 'Conversion line period', default: 9, min: 1, max: 100, required: true },
      { name: 'base_period', type: 'number', description: 'Base line period', default: 26, min: 1, max: 100, required: true },
      { name: 'span_b_period', type: 'number', description: 'Span B period', default: 52, min: 1, max: 100, required: true },
      { name: 'displacement', type: 'number', description: 'Displacement', default: 26, min: 1, max: 100, required: true }
    ],
    category: 'custom',
    pythonFunction: 'ichimoku',
    pythonInputs: ['high', 'low', 'close', 'conversion_period', 'base_period', 'span_b_period', 'displacement'],
    pythonOutput: 'conversion_line, base_line, span_a, span_b, leading_span_a, leading_span_b',
    usagePattern: 'ta.ichimoku(high, low, close, conversion_period=9, base_period=26, span_b_period=52, displacement=26)',
    library: 'pandas_ta'
  },
  {
    key: 'psar',
    name: 'Parabolic SAR',
    description: 'Stop and reverse indicator',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'step', type: 'number', description: 'Acceleration step', default: 0.02, min: 0.01, max: 0.2, required: true },
      { name: 'maximum', type: 'number', description: 'Maximum acceleration', default: 0.2, min: 0.01, max: 1, required: true }
    ],
    category: 'custom',
    pythonFunction: 'PSAR',
    pythonInputs: ['high', 'low', 'close', 'step', 'maximum'],
    pythonOutput: 'psar_values',
    usagePattern: 'ta.PSAR(high, low, close, step=0.02, maximum=0.2)',
    library: 'ta-lib'
  },
  {
    key: 'zigzag',
    name: 'ZigZag',
    description: 'Identifies significant price reversals',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'threshold', type: 'number', description: 'Minimum change threshold (%)', default: 5, min: 0.1, max: 50, required: true }
    ],
    category: 'custom',
    pythonFunction: 'zigzag',
    pythonInputs: ['high', 'low', 'close', 'threshold'],
    pythonOutput: 'zigzag_values',
    usagePattern: 'ta.zigzag(high, low, close, threshold=5)',
    library: 'pandas_ta'
  },
  {
    key: 'td_sequential',
    name: 'TD Sequential',
    description: 'Tom DeMark sequential indicator',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'count', type: 'number', description: 'Count period', default: 9, min: 1, max: 20, required: true }
    ],
    category: 'custom',
    pythonFunction: 'td_sequential',
    pythonInputs: ['high', 'low', 'close', 'count'],
    pythonOutput: 'td_setup, td_countdown, td_stop',
    usagePattern: 'ta.td_sequential(high, low, close, count=9)',
    library: 'pandas_ta'
  },
  {
    key: 'fractals',
    name: 'Fractals',
    description: 'Identifies fractal patterns in price',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Fractal period', default: 2, min: 1, max: 10, required: true }
    ],
    category: 'custom',
    pythonFunction: 'fractals',
    pythonInputs: ['high', 'low', 'period'],
    pythonOutput: 'fractal_high, fractal_low',
    usagePattern: 'ta.fractals(high, low, period=2)',
    library: 'pandas_ta'
  },
  {
    key: 'gaps',
    name: 'Gaps',
    description: 'Identifies price gaps',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'threshold', type: 'number', description: 'Gap threshold (%)', default: 0.1, min: 0.01, max: 10, required: true }
    ],
    category: 'custom',
    pythonFunction: 'gaps',
    pythonInputs: ['high', 'low', 'close', 'threshold'],
    pythonOutput: 'gap_up, gap_down',
    usagePattern: 'ta.gaps(high, low, close, threshold=0.1)',
    library: 'pandas_ta'
  },
  {
    key: 'pivot_points',
    name: 'Pivot Points',
    description: 'Standard pivot point calculations',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Pivot period', default: 1, min: 1, max: 10, required: true }
    ],
    category: 'custom',
    pythonFunction: 'pivot_points',
    pythonInputs: ['high', 'low', 'close', 'period'],
    pythonOutput: 'pivot, r1, r2, r3, s1, s2, s3',
    usagePattern: 'ta.pivot_points(high, low, close, period=1)',
    library: 'pandas_ta'
  },
  {
    key: 'fibonacci_retracement',
    name: 'Fibonacci Retracement',
    description: 'Fibonacci retracement levels',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Lookback period', default: 20, min: 1, max: 100, required: true }
    ],
    category: 'custom',
    pythonFunction: 'fibonacci_retracement',
    pythonInputs: ['high', 'low', 'period'],
    pythonOutput: 'fib_0, fib_236, fib_382, fib_500, fib_618, fib_764, fib_1000',
    usagePattern: 'ta.fibonacci_retracement(high, low, period=20)',
    library: 'pandas_ta'
  },

  // === ADDITIONAL MOMENTUM INDICATORS ===
  {
    key: 'tsi',
    name: 'True Strength Index',
    description: 'Double smoothed momentum oscillator',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'r_period', type: 'number', description: 'First smoothing period', default: 25, min: 1, max: 100, required: true },
      { name: 's_period', type: 'number', description: 'Second smoothing period', default: 13, min: 1, max: 100, required: true }
    ],
    category: 'momentum',
    pythonFunction: 'TSI',
    pythonInputs: ['close', 'r_period', 's_period'],
    pythonOutput: 'tsi_values',
    usagePattern: 'ta.TSI(close, r_period=25, s_period=13)',
    library: 'pandas_ta'
  },
  {
    key: 'ultimate_oscillator',
    name: 'Ultimate Oscillator',
    description: 'Multi-timeframe momentum oscillator',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'period1', type: 'number', description: 'First period', default: 7, min: 1, max: 100, required: true },
      { name: 'period2', type: 'number', description: 'Second period', default: 14, min: 1, max: 100, required: true },
      { name: 'period3', type: 'number', description: 'Third period', default: 28, min: 1, max: 100, required: true }
    ],
    category: 'momentum',
    pythonFunction: 'ULTOSC',
    pythonInputs: ['high', 'low', 'close', 'timeperiod1', 'timeperiod2', 'timeperiod3'],
    pythonOutput: 'ultosc_values',
    usagePattern: 'ta.ULTOSC(high, low, close, timeperiod1=7, timeperiod2=14, timeperiod3=28)',
    library: 'ta-lib'
  },
  {
    key: 'awesome_oscillator',
    name: 'Awesome Oscillator',
    description: 'Momentum oscillator using SMA differences',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true }
    ],
    params: [
      { name: 'fast_period', type: 'number', description: 'Fast period', default: 5, min: 1, max: 100, required: true },
      { name: 'slow_period', type: 'number', description: 'Slow period', default: 34, min: 1, max: 100, required: true }
    ],
    category: 'momentum',
    pythonFunction: 'awesome_oscillator',
    pythonInputs: ['high', 'low', 'fast_period', 'slow_period'],
    pythonOutput: 'ao_values',
    usagePattern: 'ta.awesome_oscillator(high, low, fast_period=5, slow_period=34)',
    library: 'pandas_ta'
  },
  {
    key: 'kst',
    name: 'Know Sure Thing',
    description: 'Multi-timeframe momentum oscillator',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'r1', type: 'number', description: 'First ROC period', default: 10, min: 1, max: 100, required: true },
      { name: 'r2', type: 'number', description: 'Second ROC period', default: 15, min: 1, max: 100, required: true },
      { name: 'r3', type: 'number', description: 'Third ROC period', default: 20, min: 1, max: 100, required: true },
      { name: 'r4', type: 'number', description: 'Fourth ROC period', default: 30, min: 1, max: 100, required: true },
      { name: 's1', type: 'number', description: 'First smoothing', default: 10, min: 1, max: 100, required: true },
      { name: 's2', type: 'number', description: 'Second smoothing', default: 10, min: 1, max: 100, required: true },
      { name: 's3', type: 'number', description: 'Third smoothing', default: 10, min: 1, max: 100, required: true },
      { name: 's4', type: 'number', description: 'Fourth smoothing', default: 15, min: 1, max: 100, required: true }
    ],
    category: 'momentum',
    pythonFunction: 'kst',
    pythonInputs: ['close', 'r1', 'r2', 'r3', 'r4', 's1', 's2', 's3', 's4'],
    pythonOutput: 'kst_values, kst_signal',
    usagePattern: 'ta.kst(close, r1=10, r2=15, r3=20, r4=30, s1=10, s2=10, s3=10, s4=15)',
    library: 'pandas_ta'
  },
  {
    key: 'pgo',
    name: 'Pretty Good Oscillator',
    description: 'Momentum oscillator based on SMA',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'period', type: 'number', description: 'SMA period', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'momentum',
    pythonFunction: 'pgo',
    pythonInputs: ['close', 'period'],
    pythonOutput: 'pgo_values',
    usagePattern: 'ta.pgo(close, period=14)',
    library: 'pandas_ta'
  },
  {
    key: 'pvo',
    name: 'Percentage Volume Oscillator',
    description: 'Volume-based momentum oscillator',
    inputs: [
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    params: [
      { name: 'fast_period', type: 'number', description: 'Fast period', default: 12, min: 1, max: 100, required: true },
      { name: 'slow_period', type: 'number', description: 'Slow period', default: 26, min: 1, max: 100, required: true },
      { name: 'signal_period', type: 'number', description: 'Signal period', default: 9, min: 1, max: 100, required: true }
    ],
    category: 'momentum',
    pythonFunction: 'pvo',
    pythonInputs: ['volume', 'fast_period', 'slow_period', 'signal_period'],
    pythonOutput: 'pvo_values, pvo_signal',
    usagePattern: 'ta.pvo(volume, fast_period=12, slow_period=26, signal_period=9)',
    library: 'pandas_ta'
  },
  {
    key: 'qstick',
    name: 'QStick',
    description: 'Measures the ratio of recent up closes to down closes',
    inputs: [
      { name: 'open', type: 'price', description: 'Opening prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'momentum',
    pythonFunction: 'qstick',
    pythonInputs: ['open', 'close', 'period'],
    pythonOutput: 'qstick_values',
    usagePattern: 'ta.qstick(open, close, period=14)',
    library: 'pandas_ta'
  },
  {
    key: 'squeeze',
    name: 'Squeeze',
    description: 'Identifies periods of low volatility',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'bb_period', type: 'number', description: 'Bollinger Bands period', default: 20, min: 1, max: 100, required: true },
      { name: 'bb_std', type: 'number', description: 'Bollinger Bands std dev', default: 2, min: 0.1, max: 5, required: true },
      { name: 'kc_period', type: 'number', description: 'Keltner Channels period', default: 20, min: 1, max: 100, required: true },
      { name: 'kc_mult', type: 'number', description: 'Keltner Channels multiplier', default: 1.5, min: 0.1, max: 5, required: true }
    ],
    category: 'momentum',
    pythonFunction: 'squeeze',
    pythonInputs: ['high', 'low', 'close', 'bb_period', 'bb_std', 'kc_period', 'kc_mult'],
    pythonOutput: 'squeeze_values, squeeze_hist',
    usagePattern: 'ta.squeeze(high, low, close, bb_period=20, bb_std=2, kc_period=20, kc_mult=1.5)',
    library: 'pandas_ta'
  },

  // === ADDITIONAL VOLATILITY INDICATORS ===
  {
    key: 'bbw',
    name: 'Bollinger Bands Width',
    description: 'Width of Bollinger Bands as percentage',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 20, min: 1, max: 100, required: true },
      { name: 'std_dev', type: 'number', description: 'Standard deviation multiplier', default: 2, min: 0.1, max: 5, required: true }
    ],
    category: 'volatility',
    pythonFunction: 'bbw',
    pythonInputs: ['close', 'period', 'std_dev'],
    pythonOutput: 'bbw_values',
    usagePattern: 'ta.bbw(close, period=20, std_dev=2)',
    library: 'pandas_ta'
  },
  {
    key: 'bbp',
    name: 'Bollinger Bands %B',
    description: 'Position within Bollinger Bands as percentage',
    inputs: [{ name: 'close', type: 'price', description: 'Closing prices', required: true }],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 20, min: 1, max: 100, required: true },
      { name: 'std_dev', type: 'number', description: 'Standard deviation multiplier', default: 2, min: 0.1, max: 5, required: true }
    ],
    category: 'volatility',
    pythonFunction: 'bbp',
    pythonInputs: ['close', 'period', 'std_dev'],
    pythonOutput: 'bbp_values',
    usagePattern: 'ta.bbp(close, period=20, std_dev=2)',
    library: 'pandas_ta'
  },
  {
    key: 'kbb',
    name: 'Keltner Bands',
    description: 'Price channels based on ATR',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 20, min: 1, max: 100, required: true },
      { name: 'multiplier', type: 'number', description: 'ATR multiplier', default: 2, min: 0.1, max: 5, required: true }
    ],
    category: 'volatility',
    pythonFunction: 'kbb',
    pythonInputs: ['high', 'low', 'close', 'period', 'multiplier'],
    pythonOutput: 'kbb_upper, kbb_middle, kbb_lower',
    usagePattern: 'ta.kbb(high, low, close, period=20, multiplier=2)',
    library: 'pandas_ta'
  },
  {
    key: 'dbb',
    name: 'Donchian Bands',
    description: 'Price channels based on highest high and lowest low',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 20, min: 1, max: 100, required: true }
    ],
    category: 'volatility',
    pythonFunction: 'dbb',
    pythonInputs: ['high', 'low', 'period'],
    pythonOutput: 'dbb_upper, dbb_middle, dbb_lower',
    usagePattern: 'ta.dbb(high, low, period=20)',
    library: 'pandas_ta'
  },
  {
    key: 'pvi',
    name: 'Price Volume Index',
    description: 'Cumulative volume indicator for positive price changes',
    inputs: [
      { name: 'close', type: 'price', description: 'Closing prices', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    params: [],
    category: 'volatility',
    pythonFunction: 'pvi',
    pythonInputs: ['close', 'volume'],
    pythonOutput: 'pvi_values',
    usagePattern: 'ta.pvi(close, volume)',
    library: 'pandas_ta'
  },
  {
    key: 'nvi',
    name: 'Negative Volume Index',
    description: 'Cumulative volume indicator for negative volume days',
    inputs: [
      { name: 'close', type: 'price', description: 'Closing prices', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    params: [],
    category: 'volatility',
    pythonFunction: 'nvi',
    pythonInputs: ['close', 'volume'],
    pythonOutput: 'nvi_values',
    usagePattern: 'ta.nvi(close, volume)',
    library: 'pandas_ta'
  },
  {
    key: 'efi',
    name: 'Elder Force Index',
    description: 'Volume-weighted price change',
    inputs: [
      { name: 'close', type: 'price', description: 'Closing prices', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 13, min: 1, max: 100, required: true }
    ],
    category: 'volatility',
    pythonFunction: 'efi',
    pythonInputs: ['close', 'volume', 'period'],
    pythonOutput: 'efi_values',
    usagePattern: 'ta.efi(close, volume, period=13)',
    library: 'pandas_ta'
  },
  {
    key: 'eom',
    name: 'Ease of Movement',
    description: 'Measures price change per unit volume',
    inputs: [
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 14, min: 1, max: 100, required: true }
    ],
    category: 'volatility',
    pythonFunction: 'eom',
    pythonInputs: ['high', 'low', 'volume', 'period'],
    pythonOutput: 'eom_values',
    usagePattern: 'ta.eom(high, low, volume, period=14)',
    library: 'pandas_ta'
  },
  {
    key: 'vpt',
    name: 'Volume Price Trend',
    description: 'Cumulative volume-price indicator',
    inputs: [
      { name: 'close', type: 'price', description: 'Closing prices', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    params: [],
    category: 'volatility',
    pythonFunction: 'vpt',
    pythonInputs: ['close', 'volume'],
    pythonOutput: 'vpt_values',
    usagePattern: 'ta.vpt(close, volume)',
    library: 'pandas_ta'
  },
  {
    key: 'fve',
    name: 'FVE',
    description: 'Force Volume Evaluation',
    inputs: [
      { name: 'open', type: 'price', description: 'Opening prices', required: true },
      { name: 'high', type: 'price', description: 'High prices', required: true },
      { name: 'low', type: 'price', description: 'Low prices', required: true },
      { name: 'close', type: 'price', description: 'Closing prices', required: true },
      { name: 'volume', type: 'volume', description: 'Volume data', required: true }
    ],
    params: [
      { name: 'period', type: 'number', description: 'Number of periods', default: 13, min: 1, max: 100, required: true }
    ],
    category: 'volatility',
    pythonFunction: 'fve',
    pythonInputs: ['open', 'high', 'low', 'close', 'volume', 'period'],
    pythonOutput: 'fve_values',
    usagePattern: 'ta.fve(open, high, low, close, volume, period=13)',
    library: 'pandas_ta'
  }
];

// Utility functions
export function getIndicatorByName(name: string): Indicator | undefined {
  return indicatorCatalog.find(indicator => 
    indicator.name.toLowerCase() === name.toLowerCase() ||
    indicator.key.toLowerCase() === name.toLowerCase()
  );
}

export function filterIndicatorsByCategory(category: string): Indicator[] {
  return indicatorCatalog.filter(indicator => 
    indicator.category.toLowerCase() === category.toLowerCase()
  );
}

export function getAllCategories(): string[] {
  const categories = new Set(indicatorCatalog.map(indicator => indicator.category));
  return Array.from(categories).sort();
}

export function getIndicatorsByLibrary(library: 'ta-lib' | 'pandas_ta' | 'custom'): Indicator[] {
  return indicatorCatalog.filter(indicator => indicator.library === library);
}

export function searchIndicators(query: string): Indicator[] {
  const lowercaseQuery = query.toLowerCase();
  return indicatorCatalog.filter(indicator => 
    indicator.name.toLowerCase().includes(lowercaseQuery) ||
    indicator.description.toLowerCase().includes(lowercaseQuery) ||
    indicator.key.toLowerCase().includes(lowercaseQuery)
  );
}

export function getIndicatorCount(): number {
  return indicatorCatalog.length;
}

export function getIndicatorsByInputType(inputType: 'price' | 'volume' | 'custom'): Indicator[] {
  return indicatorCatalog.filter(indicator => 
    indicator.inputs.some(input => input.type === inputType)
  );
}

export function getRequiredInputs(indicator: Indicator): IndicatorInput[] {
  return indicator.inputs.filter(input => input.required);
}

export function getOptionalInputs(indicator: Indicator): IndicatorInput[] {
  return indicator.inputs.filter(input => !input.required);
}

export function getRequiredParams(indicator: Indicator): IndicatorParam[] {
  return indicator.params.filter(param => param.required);
}

export function getOptionalParams(indicator: Indicator): IndicatorParam[] {
  return indicator.params.filter(param => !param.required);
}

export function validateIndicatorParams(indicator: Indicator, params: Record<string, any>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required parameters
  const requiredParams = getRequiredParams(indicator);
  for (const param of requiredParams) {
    if (!(param.name in params)) {
      errors.push(`Missing required parameter: ${param.name}`);
    }
  }
  
  // Validate parameter values
  for (const [key, value] of Object.entries(params)) {
    const param = indicator.params.find(p => p.name === key);
    if (param) {
      if (param.type === 'number') {
        if (typeof value !== 'number') {
          errors.push(`Parameter ${key} must be a number`);
        } else {
          if (param.min !== undefined && value < param.min) {
            errors.push(`Parameter ${key} must be >= ${param.min}`);
          }
          if (param.max !== undefined && value > param.max) {
            errors.push(`Parameter ${key} must be <= ${param.max}`);
          }
        }
      } else if (param.type === 'select' && param.options && !param.options.includes(value)) {
        errors.push(`Parameter ${key} must be one of: ${param.options.join(', ')}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function generatePythonCode(indicator: Indicator, params: Record<string, any>): string {
  const validation = validateIndicatorParams(indicator, params);
  if (!validation.valid) {
    throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
  }
  
  const paramValues = indicator.pythonInputs.map(input => {
    const param = indicator.params.find(p => p.name === input);
    if (param && param.name in params) {
      return params[param.name];
    }
    return param?.default;
  });
  
  return `${indicator.library === 'ta-lib' ? 'import talib as ta' : 'import pandas_ta as ta'}\n${indicator.pythonFunction}(${paramValues.join(', ')})`;
}

export default indicatorCatalog;