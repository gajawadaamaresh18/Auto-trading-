# FormulaStudio Props and Types Documentation

## Main Components

### FormulaStudio

The main canvas component for building trading formulas.

```tsx
interface FormulaStudioProps {
  initialFormula?: Formula;
  onFormulaChange?: (formula: Formula) => void;
  onSave?: (formula: Formula) => void;
}
```

**Props:**
- `initialFormula?: Formula` - Optional initial formula to load
- `onFormulaChange?: (formula: Formula) => void` - Callback when formula changes
- `onSave?: (formula: Formula) => void` - Callback when save is requested

### FormulaStudioWithSamples

Enhanced version with sample formulas and help.

```tsx
interface FormulaStudioWithSamplesProps {
  initialFormula?: Formula;
  onFormulaChange?: (formula: Formula) => void;
  onSave?: (formula: Formula) => void;
}
```

**Props:**
- Same as FormulaStudio

## Block Components

### Block

Base block component with drag-and-drop functionality.

```tsx
interface BlockProps {
  block: Block;
  onMove: (blockId: string, position: BlockPosition) => void;
  onSelect: (blockId: string) => void;
  onPress: (blockId: string) => void;
  isSelected: boolean;
  children?: React.ReactNode;
}
```

**Props:**
- `block: Block` - Block data object
- `onMove: (blockId: string, position: BlockPosition) => void` - Called when block is moved
- `onSelect: (blockId: string) => void` - Called when block is selected
- `onPress: (blockId: string) => void` - Called when block is pressed
- `isSelected: boolean` - Whether block is currently selected
- `children?: React.ReactNode` - Optional child components

### IndicatorBlock

Specialized block for technical indicators.

```tsx
interface IndicatorBlockProps {
  block: IndicatorBlock;
  onMove: (blockId: string, position: BlockPosition) => void;
  onSelect: (blockId: string) => void;
  onPress: (blockId: string) => void;
  isSelected: boolean;
}
```

**Props:**
- Same as Block, but `block` must be of type `IndicatorBlock`

### BlockEditor

Modal for editing block parameters.

```tsx
interface BlockEditorProps {
  block: Block | null;
  isVisible: boolean;
  onClose: () => void;
  onSave: (blockId: string, updatedParameters: BlockParameter[]) => void;
}
```

**Props:**
- `block: Block | null` - Block to edit (null if not editing)
- `isVisible: boolean` - Whether modal is visible
- `onClose: () => void` - Called when modal should close
- `onSave: (blockId: string, updatedParameters: BlockParameter[]) => void` - Called when parameters are saved

## Supporting Components

### BlockPalette

Modal for selecting and adding new blocks.

```tsx
interface BlockPaletteProps {
  isVisible: boolean;
  onClose: () => void;
  onAddBlock: (blockType: string, indicatorId?: string) => void;
}
```

**Props:**
- `isVisible: boolean` - Whether palette is visible
- `onClose: () => void` - Called when palette should close
- `onAddBlock: (blockType: string, indicatorId?: string) => void` - Called when block is added

### FormulaPreview

Modal for previewing and exporting formulas.

```tsx
interface FormulaPreviewProps {
  formula: Formula;
  isVisible: boolean;
  onClose: () => void;
}
```

**Props:**
- `formula: Formula` - Formula to preview
- `isVisible: boolean` - Whether preview is visible
- `onClose: () => void` - Called when preview should close

### ConnectionCanvas

Canvas for rendering connections between blocks.

```tsx
interface ConnectionCanvasProps {
  connections: BlockConnection[];
  blocks: Block[];
}
```

**Props:**
- `connections: BlockConnection[]` - Array of connections to render
- `blocks: Block[]` - Array of blocks for positioning

## Core Types

### Block Types

#### BaseBlock
```tsx
interface BaseBlock {
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
```

#### IndicatorBlock
```tsx
interface IndicatorBlock extends BaseBlock {
  type: 'indicator';
  indicatorType: string;
  calculation: string;
  inputs: string[];
  outputs: string[];
}
```

#### SignalBlock
```tsx
interface SignalBlock extends BaseBlock {
  type: 'signal';
  signalType: 'buy' | 'sell' | 'alert';
  condition: string;
}
```

#### ConditionBlock
```tsx
interface ConditionBlock extends BaseBlock {
  type: 'condition';
  operator: 'AND' | 'OR' | 'NOT';
  operands: string[];
}
```

#### ActionBlock
```tsx
interface ActionBlock extends BaseBlock {
  type: 'action';
  actionType: 'buy' | 'sell' | 'alert' | 'notification';
  parameters: BlockParameter[];
}
```

#### GroupBlock
```tsx
interface GroupBlock extends BaseBlock {
  type: 'group';
  children: string[];
  collapsed: boolean;
}
```

### Supporting Types

#### BlockPosition
```tsx
interface BlockPosition {
  x: number;
  y: number;
}
```

#### BlockSize
```tsx
interface BlockSize {
  width: number;
  height: number;
}
```

#### BlockConnection
```tsx
interface BlockConnection {
  fromBlockId: string;
  toBlockId: string;
  fromPort: string;
  toPort: string;
}
```

#### BlockParameter
```tsx
interface BlockParameter {
  id: string;
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select' | 'color';
  value: any;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}
```

#### BlockPort
```tsx
interface BlockPort {
  id: string;
  name: string;
  type: 'input' | 'output';
  dataType: 'number' | 'boolean' | 'signal' | 'condition';
  required?: boolean;
}
```

### Formula Types

#### Formula
```tsx
interface Formula {
  id: string;
  name: string;
  description: string;
  blocks: Block[];
  connections: BlockConnection[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### FormulaPreview
```tsx
interface FormulaPreview {
  naturalLanguage: string;
  pseudoCode: string;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedBlocks: number;
}
```

### Indicator Types

#### IndicatorDefinition
```tsx
interface IndicatorDefinition {
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
```

## Usage Examples

### Basic FormulaStudio Usage

```tsx
import { FormulaStudio } from './src/components/FormulaStudio';

const MyApp = () => {
  const handleFormulaChange = (formula) => {
    console.log('Formula updated:', formula);
  };

  const handleSave = (formula) => {
    // Save to backend or local storage
    console.log('Saving formula:', formula);
  };

  return (
    <FormulaStudio
      onFormulaChange={handleFormulaChange}
      onSave={handleSave}
    />
  );
};
```

### Custom Block Creation

```tsx
import { Block } from './src/components/Block';

const CustomBlock = ({ block, onMove, onSelect, onPress, isSelected }) => {
  return (
    <Block
      block={block}
      onMove={onMove}
      onSelect={onSelect}
      onPress={onPress}
      isSelected={isSelected}
    >
      {/* Custom block content */}
    </Block>
  );
};
```

### Formula Serialization

```tsx
import { Formula } from './src/types';

const saveFormula = (formula: Formula) => {
  const jsonString = JSON.stringify(formula, null, 2);
  // Save to file, send to API, etc.
};

const loadFormula = (jsonString: string): Formula => {
  const formula = JSON.parse(jsonString);
  // Convert dates back to Date objects
  formula.createdAt = new Date(formula.createdAt);
  formula.updatedAt = new Date(formula.updatedAt);
  return formula;
};
```