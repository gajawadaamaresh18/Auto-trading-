import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Block } from './Block';
import { IndicatorBlock as IndicatorBlockType } from '../../types';
import { getIndicatorById } from '../../data/indicatorCatalog';

interface IndicatorBlockProps {
  block: IndicatorBlockType;
  onMove: (blockId: string, position: { x: number; y: number }) => void;
  onSelect: (blockId: string) => void;
  onPress: (blockId: string) => void;
  isSelected: boolean;
}

export const IndicatorBlock: React.FC<IndicatorBlockProps> = ({
  block,
  onMove,
  onSelect,
  onPress,
  isSelected,
}) => {
  const indicatorDef = getIndicatorById(block.indicatorType);

  const renderPorts = () => {
    if (!indicatorDef) return null;

    return (
      <View style={styles.portsContainer}>
        {/* Input Ports */}
        <View style={styles.inputPorts}>
          {indicatorDef.inputs.map((input, index) => (
            <View key={`input-${input.name}`} style={styles.port}>
              <View style={[styles.portDot, styles.inputPort]} />
              <Text style={styles.portLabel}>{input.name}</Text>
            </View>
          ))}
        </View>

        {/* Output Ports */}
        <View style={styles.outputPorts}>
          {indicatorDef.outputs.map((output, index) => (
            <View key={`output-${output.name}`} style={styles.port}>
              <Text style={styles.portLabel}>{output.name}</Text>
              <View style={[styles.portDot, styles.outputPort]} />
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderCalculation = () => {
    if (!indicatorDef) return null;

    return (
      <View style={styles.calculationContainer}>
        <Text style={styles.calculationLabel}>Formula:</Text>
        <Text style={styles.calculationText}>{indicatorDef.calculation}</Text>
      </View>
    );
  };

  return (
    <Block
      block={block}
      onMove={onMove}
      onSelect={onSelect}
      onPress={onPress}
      isSelected={isSelected}
    >
      {renderCalculation()}
      {renderPorts()}
    </Block>
  );
};

const styles = StyleSheet.create({
  portsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  inputPorts: {
    marginBottom: 8,
  },
  outputPorts: {
    marginBottom: 4,
  },
  port: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  portDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  inputPort: {
    backgroundColor: '#34C759',
  },
  outputPort: {
    backgroundColor: '#007AFF',
  },
  portLabel: {
    fontSize: 10,
    color: '#6D6D70',
    fontWeight: '500',
  },
  calculationContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 6,
  },
  calculationLabel: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  calculationText: {
    fontSize: 11,
    color: '#1C1C1E',
    fontFamily: 'monospace',
  },
});