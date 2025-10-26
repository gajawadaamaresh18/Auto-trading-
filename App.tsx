import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import FormulaStudio from './components/FormulaStudio';
import { BlockData } from './types/Block';
import { FormulaSerializer, FormulaPreviewGenerator } from './utils/formulaUtils';

const App: React.FC = () => {
  const [formula, setFormula] = useState<BlockData[]>([]);

  const handleFormulaChange = (blocks: BlockData[]) => {
    setFormula(blocks);
    console.log('Formula updated:', blocks);
  };

  const handleExport = (json: string) => {
    // You can implement custom export logic here
    console.log('Exporting formula:', json);
    Alert.alert('Export', 'Formula exported successfully!');
  };

  const handleImport = () => {
    // Example of importing a formula
    const sampleFormula = [
      {
        id: 'sample_1',
        type: 'indicator' as const,
        name: 'RSI Indicator',
        parameters: {
          type: 'rsi',
          period: 14,
          source: 'close',
        },
        children: [],
      },
      {
        id: 'sample_2',
        type: 'condition' as const,
        name: 'RSI Oversold',
        parameters: {
          operator: 'less_than',
          value: 30,
        },
        children: [
          {
            id: 'sample_3',
            type: 'action' as const,
            name: 'Buy Signal',
            parameters: {
              action: 'buy',
              quantity: 100,
            },
            children: [],
          },
        ],
      },
    ];

    setFormula(sampleFormula);
    Alert.alert('Import', 'Sample formula loaded!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      <FormulaStudio
        initialBlocks={formula}
        onFormulaChange={handleFormulaChange}
        onExport={handleExport}
        style={styles.formulaStudio}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  formulaStudio: {
    flex: 1,
  },
});

export default App;