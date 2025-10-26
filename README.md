# FormulaStudio - Visual Strategy Builder for React Native

A drag-and-drop, visual strategy builder for React Native that allows users to create complex trading formulas and strategies through an intuitive interface.

## Features

- 🎨 **Modern iOS Glass Design** - Beautiful glassmorphism UI with smooth animations
- 🖱️ **Drag & Drop Interface** - Intuitive block-based formula building
- 📊 **Multiple Block Types** - Indicators, conditions, actions, and parameters
- 🌳 **Nested Structures** - Support for complex if/then, AND/OR logic trees
- 📱 **React Native Ready** - Optimized for mobile performance
- 💾 **JSON Export/Import** - Serialize and share formulas
- 📝 **Plain English Preview** - Human-readable formula descriptions
- ⚙️ **Configurable Blocks** - Rich parameter editing for each block type

## Installation

```bash
npm install
# or
yarn install
```

### Required Dependencies

The following dependencies are required for the glass effects and animations:

```bash
npm install @react-native-community/blur react-native-reanimated react-native-gesture-handler
```

## Usage

### Basic Usage

```tsx
import React from 'react';
import FormulaStudio from './components/FormulaStudio';

const MyApp = () => {
  const handleFormulaChange = (blocks) => {
    console.log('Formula updated:', blocks);
  };

  const handleExport = (json) => {
    // Handle export logic
    console.log('Exported formula:', json);
  };

  return (
    <FormulaStudio
      initialBlocks={[]}
      onFormulaChange={handleFormulaChange}
      onExport={handleExport}
    />
  );
};
```

### Advanced Usage with Custom Blocks

```tsx
import React, { useState } from 'react';
import FormulaStudio from './components/FormulaStudio';
import IndicatorBlock from './components/IndicatorBlock';
import { BlockData } from './types/Block';

const AdvancedApp = () => {
  const [formula, setFormula] = useState<BlockData[]>([]);

  const handleBlockUpdate = (blockId: string, data: Partial<BlockData>) => {
    setFormula(prev => prev.map(block => 
      block.id === blockId ? { ...block, ...data } : block
    ));
  };

  return (
    <FormulaStudio
      initialBlocks={formula}
      onFormulaChange={setFormula}
      onExport={(json) => console.log(json)}
    />
  );
};
```

## Components

### FormulaStudio

The main component that provides the drag-and-drop canvas and formula management.

**Props:**
- `initialBlocks?: BlockData[]` - Initial blocks to display
- `onFormulaChange?: (blocks: BlockData[]) => void` - Callback when formula changes
- `onExport?: (json: string) => void` - Callback for export functionality
- `style?: any` - Custom styles

### Block

Base block component with drag-and-drop functionality.

**Props:**
- `data: BlockData` - Block data
- `position: BlockPosition` - Block position
- `isSelected?: boolean` - Selection state
- `isDragging?: boolean` - Dragging state
- `onPress?: (blockId: string) => void` - Press handler
- `onLongPress?: (blockId: string) => void` - Long press handler
- `onDragStart?: (blockId: string) => void` - Drag start handler
- `onDragEnd?: (blockId: string, position: BlockPosition) => void` - Drag end handler
- `onDrop?: (blockId: string, targetId: string) => void` - Drop handler

### BlockGroup

Component for grouping and nesting blocks.

**Props:**
- `data: BlockData` - Group data
- `children: BlockData[]` - Child blocks
- `position: BlockPosition` - Group position
- `onAddBlock?: (parentId: string, blockType: string) => void` - Add block handler
- `onRemoveBlock?: (blockId: string) => void` - Remove block handler

### IndicatorBlock

Sample implementation of a configurable indicator block.

**Props:**
- `data: BlockData` - Block data
- `onUpdate?: (blockId: string, data: Partial<BlockData>) => void` - Update handler

## Block Types

### Indicator Blocks
- **RSI** - Relative Strength Index
- **MACD** - Moving Average Convergence Divergence
- **Bollinger Bands** - Price channels
- **SMA/EMA** - Moving averages
- **Stochastic** - Momentum oscillator
- **Williams %R** - Momentum indicator
- **ATR** - Average True Range
- **ADX** - Average Directional Index
- **CCI** - Commodity Channel Index

### Condition Blocks
- **Comparison** - Compare values with operators
- **Logical** - AND/OR operations
- **Threshold** - Above/below threshold checks

### Action Blocks
- **Buy/Sell** - Trading actions
- **Alert** - Notification actions
- **Set Variable** - Variable assignment

### Parameter Blocks
- **Number** - Numeric parameters
- **String** - Text parameters
- **Boolean** - True/false parameters
- **Selection** - Dropdown parameters

## JSON Format

Formulas are serialized to JSON with the following structure:

```json
{
  "version": "1.0.0",
  "name": "My Strategy",
  "description": "A sample trading strategy",
  "blocks": [
    {
      "id": "block_1",
      "type": "indicator",
      "name": "RSI Indicator",
      "parameters": {
        "type": "rsi",
        "period": 14,
        "source": "close"
      },
      "children": []
    }
  ],
  "metadata": {
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Utilities

### FormulaSerializer

Handles JSON serialization and deserialization:

```tsx
import { FormulaSerializer } from './utils/formulaUtils';

// Serialize to JSON
const json = FormulaSerializer.toJSON(blocks);

// Deserialize from JSON
const blocks = FormulaSerializer.fromJSON(json);
```

### FormulaPreviewGenerator

Generates human-readable descriptions:

```tsx
import { FormulaPreviewGenerator } from './utils/formulaUtils';

// Generate plain English preview
const preview = FormulaPreviewGenerator.generatePlainEnglish(blocks);

// Generate code in different languages
const jsCode = FormulaPreviewGenerator.generateCode(blocks, 'javascript');
const pythonCode = FormulaPreviewGenerator.generateCode(blocks, 'python');
```

## Theming

The app uses a modern iOS glass theme defined in `/theme/colors.ts`. You can customize the colors by modifying the theme file:

```tsx
export const colors = {
  primary: '#007AFF',
  background: 'rgba(242, 242, 247, 0.95)',
  glass: 'rgba(255, 255, 255, 0.25)',
  // ... more colors
};
```

## Performance Considerations

- Uses `react-native-reanimated` for smooth 60fps animations
- Implements virtualization for large formula trees
- Optimized gesture handling with `react-native-gesture-handler`
- Efficient re-rendering with proper memoization

## Platform Support

- ✅ iOS 12+
- ✅ Android 8+
- ✅ React Native 0.72+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Examples

### Simple RSI Strategy

```tsx
const rsiStrategy = [
  {
    id: 'rsi_indicator',
    type: 'indicator',
    name: 'RSI',
    parameters: { type: 'rsi', period: 14 },
    children: []
  },
  {
    id: 'oversold_condition',
    type: 'condition',
    name: 'RSI < 30',
    parameters: { operator: 'less_than', value: 30 },
    children: [
      {
        id: 'buy_action',
        type: 'action',
        name: 'Buy',
        parameters: { action: 'buy', quantity: 100 },
        children: []
      }
    ]
  }
];
```

### Complex Multi-Condition Strategy

```tsx
const complexStrategy = [
  {
    id: 'main_condition',
    type: 'condition',
    name: 'AND Logic',
    parameters: { operator: 'and' },
    children: [
      {
        id: 'rsi_condition',
        type: 'condition',
        name: 'RSI < 30',
        parameters: { operator: 'less_than', value: 30 },
        children: []
      },
      {
        id: 'volume_condition',
        type: 'condition',
        name: 'Volume > Average',
        parameters: { operator: 'greater_than', value: 'avg_volume' },
        children: []
      }
    ]
  }
];
```

This creates a powerful visual strategy builder that can handle complex trading formulas while maintaining a beautiful, intuitive interface.