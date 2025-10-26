import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { colors } from '../theme/colors';
import { BlockData } from '../types/Block';
import Block from './Block';

interface IndicatorBlockProps {
  data: BlockData;
  position: { x: number; y: number };
  isSelected?: boolean;
  isDragging?: boolean;
  onPress?: (blockId: string) => void;
  onLongPress?: (blockId: string) => void;
  onDragStart?: (blockId: string) => void;
  onDragEnd?: (blockId: string, position: { x: number; y: number }) => void;
  onDrop?: (blockId: string, targetId: string) => void;
  onUpdate?: (blockId: string, data: Partial<BlockData>) => void;
  style?: any;
}

const INDICATOR_TYPES = [
  { id: 'sma', name: 'Simple Moving Average', description: 'Average price over N periods' },
  { id: 'ema', name: 'Exponential Moving Average', description: 'Weighted average with more recent data' },
  { id: 'rsi', name: 'Relative Strength Index', description: 'Momentum oscillator (0-100)' },
  { id: 'macd', name: 'MACD', description: 'Moving Average Convergence Divergence' },
  { id: 'bollinger', name: 'Bollinger Bands', description: 'Price channels based on standard deviation' },
  { id: 'stochastic', name: 'Stochastic Oscillator', description: 'Momentum indicator comparing closing price' },
  { id: 'williams', name: 'Williams %R', description: 'Momentum indicator similar to stochastic' },
  { id: 'atr', name: 'Average True Range', description: 'Volatility indicator' },
  { id: 'adx', name: 'Average Directional Index', description: 'Trend strength indicator' },
  { id: 'cci', name: 'Commodity Channel Index', description: 'Momentum oscillator' },
];

const IndicatorBlock: React.FC<IndicatorBlockProps> = ({
  data,
  position,
  isSelected = false,
  isDragging = false,
  onPress,
  onLongPress,
  onDragStart,
  onDragEnd,
  onDrop,
  onUpdate,
  style,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState(
    INDICATOR_TYPES.find(ind => ind.id === data.parameters?.type) || INDICATOR_TYPES[0]
  );
  const [period, setPeriod] = useState(data.parameters?.period || 14);
  const [source, setSource] = useState(data.parameters?.source || 'close');

  const handlePress = () => {
    if (onPress) {
      onPress(data.id);
    }
  };

  const handleLongPress = () => {
    setIsModalVisible(true);
    if (onLongPress) {
      onLongPress(data.id);
    }
  };

  const handleIndicatorSelect = (indicator: typeof INDICATOR_TYPES[0]) => {
    setSelectedIndicator(indicator);
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(data.id, {
        name: selectedIndicator.name,
        parameters: {
          type: selectedIndicator.id,
          period,
          source,
          ...data.parameters,
        },
      });
    }
    setIsModalVisible(false);
  };

  const getIndicatorDescription = () => {
    if (data.parameters?.type) {
      const indicator = INDICATOR_TYPES.find(ind => ind.id === data.parameters.type);
      return indicator?.description || 'Technical indicator';
    }
    return 'Select an indicator';
  };

  const getIndicatorParameters = () => {
    const params = [];
    if (data.parameters?.period) {
      params.push(`Period: ${data.parameters.period}`);
    }
    if (data.parameters?.source) {
      params.push(`Source: ${data.parameters.source}`);
    }
    return params;
  };

  return (
    <>
      <Block
        data={{
          ...data,
          name: data.name || selectedIndicator.name,
          parameters: {
            ...data.parameters,
            description: getIndicatorDescription(),
            ...Object.fromEntries(getIndicatorParameters().map(p => p.split(': '))),
          },
        }}
        position={position}
        isSelected={isSelected}
        isDragging={isDragging}
        onPress={handlePress}
        onLongPress={handleLongPress}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDrop={onDrop}
        style={[styles.container, style]}
      />

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView style={styles.modalContainer} blurType="light" blurAmount={10}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Configure Indicator</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Indicator Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Indicator Type</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.indicatorGrid}>
                    {INDICATOR_TYPES.map((indicator) => (
                      <TouchableOpacity
                        key={indicator.id}
                        style={[
                          styles.indicatorCard,
                          selectedIndicator.id === indicator.id && styles.selectedIndicatorCard,
                        ]}
                        onPress={() => handleIndicatorSelect(indicator)}
                      >
                        <Text style={styles.indicatorName}>{indicator.name}</Text>
                        <Text style={styles.indicatorDescription}>{indicator.description}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Parameters */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Parameters</Text>
                
                <View style={styles.parameterRow}>
                  <Text style={styles.parameterLabel}>Period:</Text>
                  <TextInput
                    style={styles.parameterInput}
                    value={String(period)}
                    onChangeText={(text) => setPeriod(parseInt(text) || 14)}
                    keyboardType="numeric"
                    placeholder="14"
                  />
                </View>

                <View style={styles.parameterRow}>
                  <Text style={styles.parameterLabel}>Source:</Text>
                  <View style={styles.sourceButtons}>
                    {['open', 'high', 'low', 'close', 'volume'].map((src) => (
                      <TouchableOpacity
                        key={src}
                        style={[
                          styles.sourceButton,
                          source === src && styles.selectedSourceButton,
                        ]}
                        onPress={() => setSource(src)}
                      >
                        <Text style={[
                          styles.sourceButtonText,
                          source === src && styles.selectedSourceButtonText,
                        ]}>
                          {src.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    // Inherits from Block component
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: colors.textInverse,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  indicatorGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  indicatorCard: {
    width: 150,
    padding: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedIndicatorCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '20',
  },
  indicatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  indicatorDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  parameterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  parameterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    width: 80,
  },
  parameterInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },
  sourceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sourceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  selectedSourceButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sourceButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  selectedSourceButtonText: {
    color: colors.textInverse,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textInverse,
  },
});

export default IndicatorBlock;