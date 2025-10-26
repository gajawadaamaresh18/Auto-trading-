export interface BlockPosition {
  x: number;
  y: number;
}

export interface BlockSize {
  width: number;
  height: number;
}

export interface BlockConnection {
  fromBlockId: string;
  toBlockId: string;
  fromPort: string;
  toPort: string;
}

export interface BlockParameter {
  id: string;
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select' | 'color';
  value: any;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export interface BlockPort {
  id: string;
  name: string;
  type: 'input' | 'output';
  dataType: 'number' | 'boolean' | 'signal' | 'condition';
  required?: boolean;
}

export interface BaseBlock {
  id: string;
  type: 'indicator' | 'signal' | 'condition' | 'action' | 'group';
  category: string;
  name: string;
  description: string;
  position: BlockPosition;
  size: BlockSize;
  parameters: BlockParameter[];
  ports: BlockPort[];
  isSelected: boolean;
  isDragging: boolean;
  parentGroupId?: string;
}

export interface IndicatorBlock extends BaseBlock {
  type: 'indicator';
  indicatorType: string;
  calculation: string;
  inputs: string[];
  outputs: string[];
}

export interface SignalBlock extends BaseBlock {
  type: 'signal';
  signalType: 'buy' | 'sell' | 'alert';
  condition: string;
}

export interface ConditionBlock extends BaseBlock {
  type: 'condition';
  operator: 'AND' | 'OR' | 'NOT';
  operands: string[];
}

export interface ActionBlock extends BaseBlock {
  type: 'action';
  actionType: 'buy' | 'sell' | 'alert' | 'notification';
  parameters: BlockParameter[];
}

export interface GroupBlock extends BaseBlock {
  type: 'group';
  children: string[];
  collapsed: boolean;
}

export type Block = IndicatorBlock | SignalBlock | ConditionBlock | ActionBlock | GroupBlock;

export interface Formula {
  id: string;
  name: string;
  description: string;
  blocks: Block[];
  connections: BlockConnection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IndicatorDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  inputs: {
    name: string;
    type: 'number' | 'string' | 'boolean';
    default: any;
    min?: number;
    max?: number;
    step?: number;
  }[];
  outputs: {
    name: string;
    type: 'number' | 'boolean' | 'signal';
    description: string;
  }[];
  calculation: string;
  icon: string;
}

export interface FormulaPreview {
  naturalLanguage: string;
  pseudoCode: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedBlocks: number;
}