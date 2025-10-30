/**
 * Block Data Structures and JSON Schema
 * 
 * Defines the core data structures for the visual strategy builder,
 * including block types, connections, and serialization format.
 */

export interface BlockPosition {
  x: number;
  y: number;
}

export interface BlockConnection {
  id: string;
  sourceBlockId: string;
  sourcePortId: string;
  targetBlockId: string;
  targetPortId: string;
}

export interface BlockPort {
  id: string;
  type: 'input' | 'output';
  dataType: 'number' | 'boolean' | 'signal' | 'indicator';
  label: string;
  required?: boolean;
  defaultValue?: any;
}

export interface BaseBlock {
  id: string;
  type: 'indicator' | 'condition' | 'action' | 'group' | 'parameter';
  position: BlockPosition;
  size: { width: number; height: number };
  ports: BlockPort[];
  metadata: {
    label: string;
    description?: string;
    category: string;
    icon?: string;
  };
}

export interface IndicatorBlock extends BaseBlock {
  type: 'indicator';
  indicatorType: string;
  parameters: Record<string, any>;
  timeframe: string;
  symbol: string;
}

export interface ConditionBlock extends BaseBlock {
  type: 'condition';
  conditionType: 'comparison' | 'cross' | 'logical' | 'time';
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'crosses_above' | 'crosses_below' | 'and' | 'or' | 'not';
  parameters: Record<string, any>;
  inputs: string[]; // Connected block IDs
}

export interface ActionBlock extends BaseBlock {
  type: 'action';
  actionType: 'buy' | 'sell' | 'alert' | 'close_position' | 'set_stop_loss' | 'set_take_profit';
  parameters: Record<string, any>;
  conditions: string[]; // Connected condition block IDs
}

export interface GroupBlock extends BaseBlock {
  type: 'group';
  groupType: 'if_then' | 'if_then_else' | 'and_group' | 'or_group';
  children: string[]; // Child block IDs
  parameters: Record<string, any>;
}

export interface ParameterBlock extends BaseBlock {
  type: 'parameter';
  parameterType: 'threshold' | 'stop_loss' | 'take_profit' | 'position_size' | 'time_offset';
  value: number | string | boolean;
  constraints: {
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
  };
}

export type Block = IndicatorBlock | ConditionBlock | ActionBlock | GroupBlock | ParameterBlock;

export interface FormulaCanvas {
  id: string;
  name: string;
  description?: string;
  blocks: Block[];
  connections: BlockConnection[];
  metadata: {
    created: string;
    modified: string;
    version: string;
    author: string;
  };
}

export interface FormulaPreview {
  pseudocode: string;
  naturalLanguage: string;
  logicTree: LogicNode;
  estimatedComplexity: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  executionTime: number; // milliseconds
}

export interface LogicNode {
  id: string;
  type: string;
  label: string;
  children: LogicNode[];
  parameters?: Record<string, any>;
}

// JSON Schema for formula serialization
export const FormulaSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    blocks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { 
            type: 'string',
            enum: ['indicator', 'condition', 'action', 'group', 'parameter']
          },
          position: {
            type: 'object',
            properties: {
              x: { type: 'number' },
              y: { type: 'number' }
            },
            required: ['x', 'y']
          },
          size: {
            type: 'object',
            properties: {
              width: { type: 'number' },
              height: { type: 'number' }
            },
            required: ['width', 'height']
          },
          ports: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                type: { type: 'string', enum: ['input', 'output'] },
                dataType: { type: 'string', enum: ['number', 'boolean', 'signal', 'indicator'] },
                label: { type: 'string' },
                required: { type: 'boolean' },
                defaultValue: {}
              },
              required: ['id', 'type', 'dataType', 'label']
            }
          },
          metadata: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              description: { type: 'string' },
              category: { type: 'string' },
              icon: { type: 'string' }
            },
            required: ['label', 'category']
          }
        },
        required: ['id', 'type', 'position', 'size', 'ports', 'metadata']
      }
    },
    connections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          sourceBlockId: { type: 'string' },
          sourcePortId: { type: 'string' },
          targetBlockId: { type: 'string' },
          targetPortId: { type: 'string' }
        },
        required: ['id', 'sourceBlockId', 'sourcePortId', 'targetBlockId', 'targetPortId']
      }
    },
    metadata: {
      type: 'object',
      properties: {
        created: { type: 'string' },
        modified: { type: 'string' },
        version: { type: 'string' },
        author: { type: 'string' }
      },
      required: ['created', 'modified', 'version', 'author']
    }
  },
  required: ['id', 'name', 'blocks', 'connections', 'metadata']
};

// Block type definitions for TypeScript
export const BlockTypes = {
  INDICATOR: 'indicator',
  CONDITION: 'condition',
  ACTION: 'action',
  GROUP: 'group',
  PARAMETER: 'parameter'
} as const;

export const IndicatorTypes = {
  RSI: 'rsi',
  MACD: 'macd',
  SMA: 'sma',
  EMA: 'ema',
  BOLLINGER_BANDS: 'bollinger_bands',
  STOCHASTIC: 'stochastic',
  WILLIAMS_R: 'williams_r',
  CCI: 'cci',
  ADX: 'adx',
  ATR: 'atr',
  VOLUME: 'volume',
  PRICE: 'price'
} as const;

export const ConditionTypes = {
  COMPARISON: 'comparison',
  CROSS: 'cross',
  LOGICAL: 'logical',
  TIME: 'time'
} as const;

export const ActionTypes = {
  BUY: 'buy',
  SELL: 'sell',
  ALERT: 'alert',
  CLOSE_POSITION: 'close_position',
  SET_STOP_LOSS: 'set_stop_loss',
  SET_TAKE_PROFIT: 'set_take_profit'
} as const;

export const GroupTypes = {
  IF_THEN: 'if_then',
  IF_THEN_ELSE: 'if_then_else',
  AND_GROUP: 'and_group',
  OR_GROUP: 'or_group'
} as const;

// Utility functions
export const createBlockId = (): string => {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createConnectionId = (): string => {
  return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const validateFormula = (formula: FormulaCanvas): boolean => {
  try {
    // Basic validation
    if (!formula.id || !formula.name || !formula.blocks) {
      return false;
    }

    // Check for at least one action block
    const hasActionBlock = formula.blocks.some(block => block.type === 'action');
    if (!hasActionBlock) {
      return false;
    }

    // Check for valid connections
    for (const connection of formula.connections) {
      const sourceBlock = formula.blocks.find(b => b.id === connection.sourceBlockId);
      const targetBlock = formula.blocks.find(b => b.id === connection.targetBlockId);
      
      if (!sourceBlock || !targetBlock) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
};

export const serializeFormula = (formula: FormulaCanvas): string => {
  return JSON.stringify(formula, null, 2);
};

export const deserializeFormula = (json: string): FormulaCanvas => {
  return JSON.parse(json) as FormulaCanvas;
};
