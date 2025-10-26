# FormulaStudio - Visual No-Code Strategy Builder

A comprehensive React Native block-based visual no-code strategy builder for creating trading formulas and strategies.

## Features

- **Drag & Drop Interface**: Intuitive block-based editor with smooth drag-and-drop functionality
- **Technical Indicators**: Built-in catalog of popular indicators (SMA, RSI, MACD, Bollinger Bands, etc.)
- **Logical Operations**: Support for AND/OR conditions and complex nesting
- **Parameter Input**: Rich parameter editing with different input types
- **Block Grouping**: Organize related blocks into groups
- **Formula Preview**: Natural language description and pseudo-code generation
- **JSON Serialization**: Export/import formulas as JSON for backend integration
- **iOS Design**: Modern iOS card and block styling throughout

## Project Structure

```
src/
├── components/
│   ├── Block/
│   │   ├── Block.tsx              # Base block component with drag-and-drop
│   │   ├── IndicatorBlock.tsx     # Specialized indicator block
│   │   ├── BlockEditor.tsx        # Parameter editing modal
│   │   └── index.ts
│   └── FormulaStudio/
│       ├── FormulaStudio.tsx      # Main canvas component
│       ├── BlockPalette.tsx       # Block selection palette
│       ├── ConnectionCanvas.tsx   # Visual connections between blocks
│       ├── FormulaPreview.tsx     # Preview and export functionality
│       ├── FormulaStudioWithSamples.tsx # Enhanced version with samples
│       └── index.ts
├── data/
│   └── indicatorCatalog.ts        # Technical indicators definitions
├── types/
│   └── index.ts                   # TypeScript type definitions
├── samples/
│   └── sampleFormulas.ts          # Sample trading strategies
└── App.tsx                        # Main application component
```

## Installation

```bash
npm install
# or
yarn install
```

## Usage

### Basic Usage

```tsx
import React from 'react';
import { FormulaStudio } from './src/components/FormulaStudio';

const App = () => {
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

### With Sample Formulas

```tsx
import React from 'react';
import { FormulaStudioWithSamples } from './src/components/FormulaStudio';

const App = () => {
  return (
    <FormulaStudioWithSamples
      onFormulaChange={(formula) => console.log('Changed:', formula)}
      onSave={(formula) => console.log('Saved:', formula)}
    />
  );
};
```

## Components

### Block Components

#### Block
Base block component with drag-and-drop functionality.

**Props:**
- `block: Block` - Block data object
- `onMove: (blockId: string, position: BlockPosition) => void` - Called when block is moved
- `onSelect: (blockId: string) => void` - Called when block is selected
- `onPress: (blockId: string) => void` - Called when block is pressed
- `isSelected: boolean` - Whether block is currently selected

#### IndicatorBlock
Specialized block for technical indicators with ports and calculation display.

**Props:**
- Same as Block component
- `block: IndicatorBlock` - Indicator-specific block data

#### BlockEditor
Modal for editing block parameters.

**Props:**
- `block: Block | null` - Block to edit
- `isVisible: boolean` - Whether modal is visible
- `onClose: () => void` - Called when modal should close
- `onSave: (blockId: string, parameters: BlockParameter[]) => void` - Called when parameters are saved

### FormulaStudio Components

#### FormulaStudio
Main canvas component for building formulas.

**Props:**
- `initialFormula?: Formula` - Initial formula to load
- `onFormulaChange?: (formula: Formula) => void` - Called when formula changes
- `onSave?: (formula: Formula) => void` - Called when save is requested

#### BlockPalette
Modal for selecting and adding new blocks.

**Props:**
- `isVisible: boolean` - Whether palette is visible
- `onClose: () => void` - Called when palette should close
- `onAddBlock: (blockType: string, indicatorId?: string) => void` - Called when block is added

#### FormulaPreview
Modal for previewing and exporting formulas.

**Props:**
- `formula: Formula` - Formula to preview
- `isVisible: boolean` - Whether preview is visible
- `onClose: () => void` - Called when preview should close

## Data Types

### Block Types
- `IndicatorBlock` - Technical indicator blocks
- `SignalBlock` - Buy/sell signal blocks
- `ConditionBlock` - Logical condition blocks (AND/OR)
- `ActionBlock` - Trading action blocks
- `GroupBlock` - Block grouping

### Formula Structure
```typescript
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

## Technical Indicators

The following indicators are included in the catalog:

- **Trend**: Simple Moving Average (SMA), Exponential Moving Average (EMA)
- **Momentum**: RSI, MACD, Stochastic Oscillator
- **Volatility**: Bollinger Bands, Average True Range (ATR)
- **Volume**: Volume Analysis

Each indicator includes:
- Configurable parameters
- Input/output ports
- Calculation formulas
- Visual representation

## Sample Formulas

Two sample trading strategies are included:

1. **RSI Oversold Strategy**: Buys when RSI is oversold and price is above SMA
2. **MACD Crossover Strategy**: Buys on bullish MACD crossover, sells on bearish

## Styling

The entire UI follows iOS design principles:
- Modern card-based layout
- iOS color palette
- Smooth animations and transitions
- Native iOS typography
- Proper spacing and shadows

## Dependencies

- React Native 0.72+
- React Native Gesture Handler
- React Native Reanimated
- React Native Vector Icons
- React Native SVG (for connections)

## License

MIT License - see LICENSE file for details.