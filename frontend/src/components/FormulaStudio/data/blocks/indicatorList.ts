/**
 * Indicator Metadata and Block Registry
 * 
 * Contains metadata for all available indicators, conditions, and actions
 * that can be used in the visual strategy builder.
 */

import { IndicatorTypes, ConditionTypes, ActionTypes, GroupTypes } from './types';

export interface IndicatorMetadata {
  id: string;
  name: string;
  description: string;
  category: 'momentum' | 'trend' | 'volatility' | 'volume' | 'price';
  icon: string;
  parameters: ParameterDefinition[];
  outputs: OutputDefinition[];
  timeframe: string[];
  complexity: 'low' | 'medium' | 'high';
  documentation: string;
}

export interface ParameterDefinition {
  id: string;
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select';
  label: string;
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

export interface OutputDefinition {
  id: string;
  name: string;
  type: 'number' | 'boolean' | 'signal';
  label: string;
  description: string;
}

export interface ConditionMetadata {
  id: string;
  name: string;
  description: string;
  category: 'comparison' | 'cross' | 'logical' | 'time';
  icon: string;
  operator: string;
  inputs: InputDefinition[];
  parameters: ParameterDefinition[];
  complexity: 'low' | 'medium' | 'high';
}

export interface InputDefinition {
  id: string;
  name: string;
  type: 'number' | 'boolean' | 'signal' | 'indicator';
  label: string;
  required: boolean;
}

export interface ActionMetadata {
  id: string;
  name: string;
  description: string;
  category: 'trade' | 'risk' | 'alert' | 'position';
  icon: string;
  parameters: ParameterDefinition[];
  inputs: InputDefinition[];
  complexity: 'low' | 'medium' | 'high';
}

export interface GroupMetadata {
  id: string;
  name: string;
  description: string;
  category: 'logic' | 'flow';
  icon: string;
  parameters: ParameterDefinition[];
  maxChildren: number;
  complexity: 'low' | 'medium' | 'high';
}

// Indicator Registry
export const INDICATOR_REGISTRY: Record<string, IndicatorMetadata> = {
  [IndicatorTypes.RSI]: {
    id: IndicatorTypes.RSI,
    name: 'RSI',
    description: 'Relative Strength Index - Momentum oscillator',
    category: 'momentum',
    icon: 'trending-up',
    parameters: [
      {
        id: 'period',
        name: 'Period',
        type: 'number',
        label: 'Period',
        description: 'Number of periods for RSI calculation',
        required: true,
        defaultValue: 14,
        constraints: { min: 2, max: 100, step: 1 }
      },
      {
        id: 'overbought',
        name: 'Overbought Level',
        type: 'number',
        label: 'Overbought',
        description: 'RSI level considered overbought',
        required: false,
        defaultValue: 70,
        constraints: { min: 50, max: 100, step: 1 }
      },
      {
        id: 'oversold',
        name: 'Oversold Level',
        type: 'number',
        label: 'Oversold',
        description: 'RSI level considered oversold',
        required: false,
        defaultValue: 30,
        constraints: { min: 0, max: 50, step: 1 }
      }
    ],
    outputs: [
      {
        id: 'rsi',
        name: 'RSI Value',
        type: 'number',
        label: 'RSI',
        description: 'Current RSI value'
      }
    ],
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    complexity: 'medium',
    documentation: 'RSI measures the speed and magnitude of price changes.'
  },

  [IndicatorTypes.MACD]: {
    id: IndicatorTypes.MACD,
    name: 'MACD',
    description: 'Moving Average Convergence Divergence',
    category: 'trend',
    icon: 'trending-up',
    parameters: [
      {
        id: 'fast_period',
        name: 'Fast Period',
        type: 'number',
        label: 'Fast EMA',
        description: 'Period for fast EMA',
        required: true,
        defaultValue: 12,
        constraints: { min: 1, max: 50, step: 1 }
      },
      {
        id: 'slow_period',
        name: 'Slow Period',
        type: 'number',
        label: 'Slow EMA',
        description: 'Period for slow EMA',
        required: true,
        defaultValue: 26,
        constraints: { min: 1, max: 100, step: 1 }
      },
      {
        id: 'signal_period',
        name: 'Signal Period',
        type: 'number',
        label: 'Signal EMA',
        description: 'Period for signal line',
        required: true,
        defaultValue: 9,
        constraints: { min: 1, max: 50, step: 1 }
      }
    ],
    outputs: [
      {
        id: 'macd',
        name: 'MACD Line',
        type: 'number',
        label: 'MACD',
        description: 'MACD line value'
      },
      {
        id: 'signal',
        name: 'Signal Line',
        type: 'number',
        label: 'Signal',
        description: 'Signal line value'
      },
      {
        id: 'histogram',
        name: 'Histogram',
        type: 'number',
        label: 'Histogram',
        description: 'MACD histogram value'
      }
    ],
    timeframe: ['5m', '15m', '1h', '4h', '1d'],
    complexity: 'medium',
    documentation: 'MACD shows the relationship between two moving averages.'
  },

  [IndicatorTypes.SMA]: {
    id: IndicatorTypes.SMA,
    name: 'Simple Moving Average',
    description: 'Simple Moving Average - Trend following indicator',
    category: 'trend',
    icon: 'trending-up',
    parameters: [
      {
        id: 'period',
        name: 'Period',
        type: 'number',
        label: 'Period',
        description: 'Number of periods for SMA calculation',
        required: true,
        defaultValue: 20,
        constraints: { min: 1, max: 200, step: 1 }
      }
    ],
    outputs: [
      {
        id: 'sma',
        name: 'SMA Value',
        type: 'number',
        label: 'SMA',
        description: 'Current SMA value'
      }
    ],
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    complexity: 'low',
    documentation: 'SMA is the average price over a specified number of periods.'
  },

  [IndicatorTypes.EMA]: {
    id: IndicatorTypes.EMA,
    name: 'Exponential Moving Average',
    description: 'Exponential Moving Average - Trend following indicator',
    category: 'trend',
    icon: 'trending-up',
    parameters: [
      {
        id: 'period',
        name: 'Period',
        type: 'number',
        label: 'Period',
        description: 'Number of periods for EMA calculation',
        required: true,
        defaultValue: 20,
        constraints: { min: 1, max: 200, step: 1 }
      }
    ],
    outputs: [
      {
        id: 'ema',
        name: 'EMA Value',
        type: 'number',
        label: 'EMA',
        description: 'Current EMA value'
      }
    ],
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    complexity: 'low',
    documentation: 'EMA gives more weight to recent prices.'
  },

  [IndicatorTypes.BOLLINGER_BANDS]: {
    id: IndicatorTypes.BOLLINGER_BANDS,
    name: 'Bollinger Bands',
    description: 'Bollinger Bands - Volatility indicator',
    category: 'volatility',
    icon: 'trending-up',
    parameters: [
      {
        id: 'period',
        name: 'Period',
        type: 'number',
        label: 'Period',
        description: 'Number of periods for calculation',
        required: true,
        defaultValue: 20,
        constraints: { min: 1, max: 100, step: 1 }
      },
      {
        id: 'std_dev',
        name: 'Standard Deviation',
        type: 'number',
        label: 'Std Dev',
        description: 'Number of standard deviations',
        required: true,
        defaultValue: 2,
        constraints: { min: 1, max: 5, step: 0.1 }
      }
    ],
    outputs: [
      {
        id: 'upper',
        name: 'Upper Band',
        type: 'number',
        label: 'Upper',
        description: 'Upper Bollinger Band'
      },
      {
        id: 'middle',
        name: 'Middle Band',
        type: 'number',
        label: 'Middle',
        description: 'Middle Bollinger Band (SMA)'
      },
      {
        id: 'lower',
        name: 'Lower Band',
        type: 'number',
        label: 'Lower',
        description: 'Lower Bollinger Band'
      }
    ],
    timeframe: ['5m', '15m', '1h', '4h', '1d'],
    complexity: 'medium',
    documentation: 'Bollinger Bands show price volatility and potential support/resistance levels.'
  },

  [IndicatorTypes.PRICE]: {
    id: IndicatorTypes.PRICE,
    name: 'Price',
    description: 'Current price data',
    category: 'price',
    icon: 'cash',
    parameters: [
      {
        id: 'price_type',
        name: 'Price Type',
        type: 'select',
        label: 'Type',
        description: 'Type of price to use',
        required: true,
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
      {
        id: 'price',
        name: 'Price Value',
        type: 'number',
        label: 'Price',
        description: 'Current price value'
      }
    ],
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'],
    complexity: 'low',
    documentation: 'Basic price data for calculations and comparisons.'
  }
};

// Condition Registry
export const CONDITION_REGISTRY: Record<string, ConditionMetadata> = {
  'greater_than': {
    id: 'greater_than',
    name: 'Greater Than',
    description: 'Check if first value is greater than second value',
    category: 'comparison',
    icon: 'chevron-up',
    operator: '>',
    inputs: [
      { id: 'left', name: 'Left Value', type: 'number', label: 'Left', required: true },
      { id: 'right', name: 'Right Value', type: 'number', label: 'Right', required: true }
    ],
    parameters: [],
    complexity: 'low'
  },

  'less_than': {
    id: 'less_than',
    name: 'Less Than',
    description: 'Check if first value is less than second value',
    category: 'comparison',
    icon: 'chevron-down',
    operator: '<',
    inputs: [
      { id: 'left', name: 'Left Value', type: 'number', label: 'Left', required: true },
      { id: 'right', name: 'Right Value', type: 'number', label: 'Right', required: true }
    ],
    parameters: [],
    complexity: 'low'
  },

  'crosses_above': {
    id: 'crosses_above',
    name: 'Crosses Above',
    description: 'Check if first line crosses above second line',
    category: 'cross',
    icon: 'arrow-up',
    operator: 'crosses_above',
    inputs: [
      { id: 'line1', name: 'First Line', type: 'number', label: 'Line 1', required: true },
      { id: 'line2', name: 'Second Line', type: 'number', label: 'Line 2', required: true }
    ],
    parameters: [],
    complexity: 'medium'
  },

  'crosses_below': {
    id: 'crosses_below',
    name: 'Crosses Below',
    description: 'Check if first line crosses below second line',
    category: 'cross',
    icon: 'arrow-down',
    operator: 'crosses_below',
    inputs: [
      { id: 'line1', name: 'First Line', type: 'number', label: 'Line 1', required: true },
      { id: 'line2', name: 'Second Line', type: 'number', label: 'Line 2', required: true }
    ],
    parameters: [],
    complexity: 'medium'
  },

  'and_condition': {
    id: 'and_condition',
    name: 'AND',
    description: 'All conditions must be true',
    category: 'logical',
    icon: 'checkmark-circle',
    operator: 'and',
    inputs: [
      { id: 'condition1', name: 'Condition 1', type: 'boolean', label: 'Condition 1', required: true },
      { id: 'condition2', name: 'Condition 2', type: 'boolean', label: 'Condition 2', required: true }
    ],
    parameters: [],
    complexity: 'low'
  },

  'or_condition': {
    id: 'or_condition',
    name: 'OR',
    description: 'At least one condition must be true',
    category: 'logical',
    icon: 'checkmark-circle-outline',
    operator: 'or',
    inputs: [
      { id: 'condition1', name: 'Condition 1', type: 'boolean', label: 'Condition 1', required: true },
      { id: 'condition2', name: 'Condition 2', type: 'boolean', label: 'Condition 2', required: true }
    ],
    parameters: [],
    complexity: 'low'
  }
};

// Action Registry
export const ACTION_REGISTRY: Record<string, ActionMetadata> = {
  [ActionTypes.BUY]: {
    id: ActionTypes.BUY,
    name: 'Buy',
    description: 'Execute buy order',
    category: 'trade',
    icon: 'arrow-up-circle',
    parameters: [
      {
        id: 'quantity',
        name: 'Quantity',
        type: 'number',
        label: 'Quantity',
        description: 'Number of shares to buy',
        required: true,
        defaultValue: 100,
        constraints: { min: 1, max: 10000, step: 1 }
      },
      {
        id: 'order_type',
        name: 'Order Type',
        type: 'select',
        label: 'Type',
        description: 'Type of order to place',
        required: true,
        defaultValue: 'market',
        constraints: {
          options: [
            { value: 'market', label: 'Market' },
            { value: 'limit', label: 'Limit' },
            { value: 'stop', label: 'Stop' }
          ]
        }
      }
    ],
    inputs: [
      { id: 'condition', name: 'Condition', type: 'boolean', label: 'When', required: true }
    ],
    complexity: 'low'
  },

  [ActionTypes.SELL]: {
    id: ActionTypes.SELL,
    name: 'Sell',
    description: 'Execute sell order',
    category: 'trade',
    icon: 'arrow-down-circle',
    parameters: [
      {
        id: 'quantity',
        name: 'Quantity',
        type: 'number',
        label: 'Quantity',
        description: 'Number of shares to sell',
        required: true,
        defaultValue: 100,
        constraints: { min: 1, max: 10000, step: 1 }
      },
      {
        id: 'order_type',
        name: 'Order Type',
        type: 'select',
        label: 'Type',
        description: 'Type of order to place',
        required: true,
        defaultValue: 'market',
        constraints: {
          options: [
            { value: 'market', label: 'Market' },
            { value: 'limit', label: 'Limit' },
            { value: 'stop', label: 'Stop' }
          ]
        }
      }
    ],
    inputs: [
      { id: 'condition', name: 'Condition', type: 'boolean', label: 'When', required: true }
    ],
    complexity: 'low'
  },

  [ActionTypes.ALERT]: {
    id: ActionTypes.ALERT,
    name: 'Alert',
    description: 'Send notification alert',
    category: 'alert',
    icon: 'notifications',
    parameters: [
      {
        id: 'message',
        name: 'Message',
        type: 'string',
        label: 'Message',
        description: 'Alert message to send',
        required: true,
        defaultValue: 'Alert triggered'
      },
      {
        id: 'priority',
        name: 'Priority',
        type: 'select',
        label: 'Priority',
        description: 'Alert priority level',
        required: false,
        defaultValue: 'medium',
        constraints: {
          options: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' }
          ]
        }
      }
    ],
    inputs: [
      { id: 'condition', name: 'Condition', type: 'boolean', label: 'When', required: true }
    ],
    complexity: 'low'
  },

  [ActionTypes.SET_STOP_LOSS]: {
    id: ActionTypes.SET_STOP_LOSS,
    name: 'Set Stop Loss',
    description: 'Set stop loss order',
    category: 'risk',
    icon: 'shield',
    parameters: [
      {
        id: 'stop_price',
        name: 'Stop Price',
        type: 'number',
        label: 'Stop Price',
        description: 'Stop loss price level',
        required: true,
        defaultValue: 0,
        constraints: { min: 0, max: 10000, step: 0.01 }
      },
      {
        id: 'percentage',
        name: 'Percentage',
        type: 'number',
        label: 'Percentage',
        description: 'Stop loss as percentage of entry price',
        required: false,
        defaultValue: 2,
        constraints: { min: 0.1, max: 20, step: 0.1 }
      }
    ],
    inputs: [
      { id: 'condition', name: 'Condition', type: 'boolean', label: 'When', required: true }
    ],
    complexity: 'medium'
  }
};

// Group Registry
export const GROUP_REGISTRY: Record<string, GroupMetadata> = {
  [GroupTypes.IF_THEN]: {
    id: GroupTypes.IF_THEN,
    name: 'If-Then',
    description: 'Execute action if condition is true',
    category: 'logic',
    icon: 'play-circle',
    parameters: [],
    maxChildren: 2,
    complexity: 'low'
  },

  [GroupTypes.IF_THEN_ELSE]: {
    id: GroupTypes.IF_THEN_ELSE,
    name: 'If-Then-Else',
    description: 'Execute different actions based on condition',
    category: 'logic',
    icon: 'git-branch',
    parameters: [],
    maxChildren: 3,
    complexity: 'medium'
  },

  [GroupTypes.AND_GROUP]: {
    id: GroupTypes.AND_GROUP,
    name: 'AND Group',
    description: 'Group multiple conditions with AND logic',
    category: 'logic',
    icon: 'checkmark-circle',
    parameters: [],
    maxChildren: 10,
    complexity: 'low'
  },

  [GroupTypes.OR_GROUP]: {
    id: GroupTypes.OR_GROUP,
    name: 'OR Group',
    description: 'Group multiple conditions with OR logic',
    category: 'logic',
    icon: 'checkmark-circle-outline',
    parameters: [],
    maxChildren: 10,
    complexity: 'low'
  }
};

// Utility functions
export const getIndicatorMetadata = (indicatorType: string): IndicatorMetadata | undefined => {
  return INDICATOR_REGISTRY[indicatorType];
};

export const getConditionMetadata = (conditionType: string): ConditionMetadata | undefined => {
  return CONDITION_REGISTRY[conditionType];
};

export const getActionMetadata = (actionType: string): ActionMetadata | undefined => {
  return ACTION_REGISTRY[actionType];
};

export const getGroupMetadata = (groupType: string): GroupMetadata | undefined => {
  return GROUP_REGISTRY[groupType];
};

export const getAllIndicators = (): IndicatorMetadata[] => {
  return Object.values(INDICATOR_REGISTRY);
};

export const getAllConditions = (): ConditionMetadata[] => {
  return Object.values(CONDITION_REGISTRY);
};

export const getAllActions = (): ActionMetadata[] => {
  return Object.values(ACTION_REGISTRY);
};

export const getAllGroups = (): GroupMetadata[] => {
  return Object.values(GROUP_REGISTRY);
};

export const getIndicatorsByCategory = (category: string): IndicatorMetadata[] => {
  return Object.values(INDICATOR_REGISTRY).filter(indicator => indicator.category === category);
};

export const getConditionsByCategory = (category: string): ConditionMetadata[] => {
  return Object.values(CONDITION_REGISTRY).filter(condition => condition.category === category);
};

export const getActionsByCategory = (category: string): ActionMetadata[] => {
  return Object.values(ACTION_REGISTRY).filter(action => action.category === category);
};
