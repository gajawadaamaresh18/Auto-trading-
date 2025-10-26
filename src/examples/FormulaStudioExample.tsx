import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { FormulaStudioWithSamples } from '../components/FormulaStudio';
import { Formula } from '../types';

/**
 * Example usage of FormulaStudio with sample formulas
 * This demonstrates how to integrate the FormulaStudio into your app
 */
export const FormulaStudioExample: React.FC = () => {
  const [currentFormula, setCurrentFormula] = useState<Formula | null>(null);

  const handleFormulaChange = (formula: Formula) => {
    console.log('Formula changed:', formula);
    setCurrentFormula(formula);
  };

  const handleSave = (formula: Formula) => {
    // In a real app, you would save to your backend or local storage
    console.log('Saving formula:', formula);
    
    // Example: Save to AsyncStorage
    // AsyncStorage.setItem('currentFormula', JSON.stringify(formula));
    
    Alert.alert(
      'Formula Saved',
      `Formula "${formula.name}" has been saved successfully!`,
      [{ text: 'OK' }]
    );
  };

  const handleExport = (formula: Formula) => {
    // Example: Export formula as JSON
    const jsonString = JSON.stringify(formula, null, 2);
    console.log('Exported formula JSON:', jsonString);
    
    // In a real app, you might:
    // - Copy to clipboard
    // - Share via native sharing
    // - Save to file system
    // - Send to backend API
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      
      <FormulaStudioWithSamples
        onFormulaChange={handleFormulaChange}
        onSave={handleSave}
      />
      
      {currentFormula && (
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>
            Formula: {currentFormula.name} ({currentFormula.blocks.length} blocks)
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

/**
 * Example of creating a custom formula programmatically
 */
export const createCustomFormula = (): Formula => {
  return {
    id: 'custom-formula',
    name: 'Custom RSI Strategy',
    description: 'A custom RSI-based trading strategy',
    blocks: [
      {
        id: 'rsi-1',
        type: 'indicator',
        category: 'Momentum',
        name: 'RSI',
        description: 'Relative Strength Index',
        position: { x: 100, y: 100 },
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
        id: 'buy-action-1',
        type: 'action',
        category: 'Action',
        name: 'Buy Order',
        description: 'Execute buy when RSI is oversold',
        position: { x: 350, y: 100 },
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
      }
    ],
    connections: [
      {
        fromBlockId: 'rsi-1',
        toBlockId: 'buy-action-1',
        fromPort: 'output-oversold',
        toPort: 'input-trigger'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

/**
 * Example of integrating with a backend API
 */
export const saveFormulaToBackend = async (formula: Formula): Promise<boolean> => {
  try {
    // Example API call
    const response = await fetch('https://your-api.com/formulas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-token',
      },
      body: JSON.stringify(formula),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('Formula saved to backend:', result);
      return true;
    } else {
      throw new Error('Failed to save formula');
    }
  } catch (error) {
    console.error('Error saving formula:', error);
    return false;
  }
};

/**
 * Example of loading formulas from backend
 */
export const loadFormulasFromBackend = async (): Promise<Formula[]> => {
  try {
    const response = await fetch('https://your-api.com/formulas', {
      headers: {
        'Authorization': 'Bearer your-token',
      },
    });
    
    if (response.ok) {
      const formulas = await response.json();
      return formulas.map((f: any) => ({
        ...f,
        createdAt: new Date(f.createdAt),
        updatedAt: new Date(f.updatedAt),
      }));
    } else {
      throw new Error('Failed to load formulas');
    }
  } catch (error) {
    console.error('Error loading formulas:', error);
    return [];
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  infoBar: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});