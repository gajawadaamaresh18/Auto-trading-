import { Formula } from '../types';

export const sampleFormulas: Formula[] = [
  {
    id: 'rsi-oversold-strategy',
    name: 'RSI Oversold Strategy',
    description: 'Buy when RSI is oversold and price is above SMA',
    blocks: [
      {
        id: 'rsi-block',
        type: 'indicator',
        category: 'Momentum',
        name: 'RSI',
        description: 'Relative Strength Index',
        position: { x: 50, y: 100 },
        size: { width: 200, height: 120 },
        parameters: [
          { id: 'period', name: 'period', type: 'number', value: 14 },
          { id: 'source', name: 'source', type: 'string', value: 'close' }
        ],
        ports: [
          { id: 'input-period', name: 'period', type: 'input', dataType: 'number', required: true },
          { id: 'input-source', name: 'source', type: 'input', dataType: 'string', required: true },
          { id: 'output-value', name: 'value', type: 'output', dataType: 'number' },
          { id: 'output-oversold', name: 'oversold', type: 'output', dataType: 'boolean' }
        ],
        isSelected: false,
        isDragging: false,
        indicatorType: 'rsi',
        calculation: 'RSI(14, close)',
        inputs: ['period', 'source'],
        outputs: ['value', 'oversold']
      },
      {
        id: 'sma-block',
        type: 'indicator',
        category: 'Trend',
        name: 'SMA',
        description: 'Simple Moving Average',
        position: { x: 50, y: 250 },
        size: { width: 200, height: 120 },
        parameters: [
          { id: 'period', name: 'period', type: 'number', value: 20 },
          { id: 'source', name: 'source', type: 'string', value: 'close' }
        ],
        ports: [
          { id: 'input-period', name: 'period', type: 'input', dataType: 'number', required: true },
          { id: 'input-source', name: 'source', type: 'input', dataType: 'string', required: true },
          { id: 'output-value', name: 'value', type: 'output', dataType: 'number' },
          { id: 'output-above', name: 'above', type: 'output', dataType: 'boolean' }
        ],
        isSelected: false,
        isDragging: false,
        indicatorType: 'sma',
        calculation: 'SMA(20, close)',
        inputs: ['period', 'source'],
        outputs: ['value', 'above']
      },
      {
        id: 'condition-block',
        type: 'condition',
        category: 'Logic',
        name: 'AND Condition',
        description: 'Both RSI oversold AND price above SMA',
        position: { x: 300, y: 175 },
        size: { width: 200, height: 120 },
        parameters: [],
        ports: [
          { id: 'input-1', name: 'input1', type: 'input', dataType: 'boolean', required: true },
          { id: 'input-2', name: 'input2', type: 'input', dataType: 'boolean', required: true },
          { id: 'output-result', name: 'result', type: 'output', dataType: 'boolean' }
        ],
        isSelected: false,
        isDragging: false,
        operator: 'AND',
        operands: ['rsi-oversold', 'price-above-sma']
      },
      {
        id: 'buy-action',
        type: 'action',
        category: 'Action',
        name: 'Buy Signal',
        description: 'Execute buy order when conditions are met',
        position: { x: 550, y: 175 },
        size: { width: 200, height: 120 },
        parameters: [
          { id: 'quantity', name: 'quantity', type: 'number', value: 100 },
          { id: 'stopLoss', name: 'stopLoss', type: 'number', value: 0.02 }
        ],
        ports: [
          { id: 'input-trigger', name: 'trigger', type: 'input', dataType: 'boolean', required: true },
          { id: 'output-executed', name: 'executed', type: 'output', dataType: 'boolean' }
        ],
        isSelected: false,
        isDragging: false,
        actionType: 'buy'
      }
    ],
    connections: [
      {
        fromBlockId: 'rsi-block',
        toBlockId: 'condition-block',
        fromPort: 'output-oversold',
        toPort: 'input-1'
      },
      {
        fromBlockId: 'sma-block',
        toBlockId: 'condition-block',
        fromPort: 'output-above',
        toPort: 'input-2'
      },
      {
        fromBlockId: 'condition-block',
        toBlockId: 'buy-action',
        fromPort: 'output-result',
        toPort: 'input-trigger'
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'macd-crossover-strategy',
    name: 'MACD Crossover Strategy',
    description: 'Buy on MACD bullish crossover, sell on bearish crossover',
    blocks: [
      {
        id: 'macd-block',
        type: 'indicator',
        category: 'Momentum',
        name: 'MACD',
        description: 'Moving Average Convergence Divergence',
        position: { x: 50, y: 100 },
        size: { width: 200, height: 140 },
        parameters: [
          { id: 'fastPeriod', name: 'fastPeriod', type: 'number', value: 12 },
          { id: 'slowPeriod', name: 'slowPeriod', type: 'number', value: 26 },
          { id: 'signalPeriod', name: 'signalPeriod', type: 'number', value: 9 }
        ],
        ports: [
          { id: 'input-fast', name: 'fastPeriod', type: 'input', dataType: 'number', required: true },
          { id: 'input-slow', name: 'slowPeriod', type: 'input', dataType: 'number', required: true },
          { id: 'input-signal', name: 'signalPeriod', type: 'input', dataType: 'number', required: true },
          { id: 'output-macd', name: 'macd', type: 'output', dataType: 'number' },
          { id: 'output-signal', name: 'signal', type: 'output', dataType: 'number' },
          { id: 'output-bullish', name: 'bullish', type: 'output', dataType: 'boolean' },
          { id: 'output-bearish', name: 'bearish', type: 'output', dataType: 'boolean' }
        ],
        isSelected: false,
        isDragging: false,
        indicatorType: 'macd',
        calculation: 'MACD(12, 26, 9)',
        inputs: ['fastPeriod', 'slowPeriod', 'signalPeriod'],
        outputs: ['macd', 'signal', 'bullish', 'bearish']
      },
      {
        id: 'buy-signal',
        type: 'action',
        category: 'Action',
        name: 'Buy Order',
        description: 'Execute buy when MACD is bullish',
        position: { x: 300, y: 100 },
        size: { width: 200, height: 120 },
        parameters: [
          { id: 'quantity', name: 'quantity', type: 'number', value: 100 }
        ],
        ports: [
          { id: 'input-trigger', name: 'trigger', type: 'input', dataType: 'boolean', required: true },
          { id: 'output-executed', name: 'executed', type: 'output', dataType: 'boolean' }
        ],
        isSelected: false,
        isDragging: false,
        actionType: 'buy'
      },
      {
        id: 'sell-signal',
        type: 'action',
        category: 'Action',
        name: 'Sell Order',
        description: 'Execute sell when MACD is bearish',
        position: { x: 300, y: 250 },
        size: { width: 200, height: 120 },
        parameters: [
          { id: 'quantity', name: 'quantity', type: 'number', value: 100 }
        ],
        ports: [
          { id: 'input-trigger', name: 'trigger', type: 'input', dataType: 'boolean', required: true },
          { id: 'output-executed', name: 'executed', type: 'output', dataType: 'boolean' }
        ],
        isSelected: false,
        isDragging: false,
        actionType: 'sell'
      }
    ],
    connections: [
      {
        fromBlockId: 'macd-block',
        toBlockId: 'buy-signal',
        fromPort: 'output-bullish',
        toPort: 'input-trigger'
      },
      {
        fromBlockId: 'macd-block',
        toBlockId: 'sell-signal',
        fromPort: 'output-bearish',
        toPort: 'input-trigger'
      }
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  }
];

export const getSampleFormulaById = (id: string): Formula | undefined => {
  return sampleFormulas.find(formula => formula.id === id);
};

export const getSampleFormulasByComplexity = (complexity: 'simple' | 'medium' | 'complex'): Formula[] => {
  return sampleFormulas.filter(formula => {
    const blockCount = formula.blocks.length;
    if (blockCount <= 3) return complexity === 'simple';
    if (blockCount <= 6) return complexity === 'medium';
    return complexity === 'complex';
  });
};