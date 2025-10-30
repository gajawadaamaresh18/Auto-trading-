/**
 * IndicatorBlock Component
 * 
 * A draggable, configurable block for technical indicators.
 * Displays indicator parameters, outputs, and allows real-time configuration.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ParameterInput } from './ParameterInput';
import { IndicatorBlock as IndicatorBlockType, BlockPosition } from './types';
import { getIndicatorMetadata } from './data/blocks/indicatorList';
import theme from '../../theme';

export interface IndicatorBlockProps {
  /** Block data */
  block: IndicatorBlockType;
  /** Whether block is selected */
  isSelected: boolean;
  /** Callback when block is selected */
  onSelect: () => void;
  /** Callback when block is updated */
  onUpdate: (updates: Partial<IndicatorBlockType>) => void;
  /** Callback when block is deleted */
  onDelete: () => void;
  /** Whether block is in read-only mode */
  readOnly?: boolean;
  /** Additional styling */
  style?: any;
}

const IndicatorBlock: React.FC<IndicatorBlockProps> = ({
  block,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  readOnly = false,
  style,
}) => {
  const [showParameters, setShowParameters] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const metadata = getIndicatorMetadata(block.indicatorType);
  if (!metadata) return null;

  // Parameter update handler
  const handleParameterChange = useCallback((parameterId: string, value: any) => {
    onUpdate({
      parameters: {
        ...block.parameters,
        [parameterId]: value,
      },
    });
  }, [block.parameters, onUpdate]);

  // Position update handler
  const handlePositionChange = useCallback((position: BlockPosition) => {
    onUpdate({ position });
  }, [onUpdate]);

  // Render parameter modal
  const renderParameterModal = () => (
    <Modal
      visible={showParameters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowParameters(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{metadata.name} Parameters</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowParameters(false)}
          >
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{metadata.description}</Text>
          </View>

          <View style={styles.parametersContainer}>
            <Text style={styles.parametersTitle}>Parameters</Text>
            {metadata.parameters.map(parameter => (
              <View key={parameter.id} style={styles.parameterItem}>
                <ParameterInput
                  parameter={parameter}
                  value={block.parameters[parameter.id]}
                  onChange={(value) => handleParameterChange(parameter.id, value)}
                  readOnly={readOnly}
                />
              </View>
            ))}
          </View>

          <View style={styles.outputsContainer}>
            <Text style={styles.outputsTitle}>Outputs</Text>
            {metadata.outputs.map(output => (
              <View key={output.id} style={styles.outputItem}>
                <View style={styles.outputIcon}>
                  <Ionicons 
                    name="arrow-forward" 
                    size={16} 
                    color={theme.colors.success[500]} 
                  />
                </View>
                <View style={styles.outputInfo}>
                  <Text style={styles.outputName}>{output.label}</Text>
                  <Text style={styles.outputDescription}>{output.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  // Render output ports
  const renderOutputPorts = () => (
    <View style={styles.outputPorts}>
      {block.ports
        .filter(port => port.type === 'output')
        .map(port => (
          <View key={port.id} style={styles.outputPort}>
            <View style={styles.portDot} />
            <Text style={styles.portLabel}>{port.label}</Text>
          </View>
        ))}
    </View>
  );

  // Render parameter summary
  const renderParameterSummary = () => {
    const paramCount = Object.keys(block.parameters).length;
    const configuredCount = Object.values(block.parameters).filter(
      value => value !== null && value !== undefined && value !== ''
    ).length;

    return (
      <View style={styles.parameterSummary}>
        <Text style={styles.parameterSummaryText}>
          {configuredCount}/{paramCount} parameters configured
        </Text>
        {configuredCount < paramCount && (
          <Ionicons 
            name="warning" 
            size={16} 
            color={theme.colors.warning[500]} 
          />
        )}
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          isSelected && styles.selectedContainer,
          style,
        ]}
        onPress={onSelect}
        onLongPress={() => !readOnly && setShowParameters(true)}
        activeOpacity={0.8}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons 
              name={metadata.icon as any} 
              size={20} 
              color={theme.colors.primary[500]} 
            />
            <Text style={styles.title}>{metadata.name}</Text>
          </View>
          
          {!readOnly && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={onDelete}
            >
              <Ionicons name="close" size={16} color={theme.colors.error[500]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Symbol and Timeframe */}
        <View style={styles.symbolContainer}>
          <Text style={styles.symbol}>{block.symbol}</Text>
          <Text style={styles.timeframe}>{block.timeframe}</Text>
        </View>

        {/* Parameter Summary */}
        {renderParameterSummary()}

        {/* Output Ports */}
        {renderOutputPorts()}

        {/* Configuration Button */}
        {!readOnly && (
          <TouchableOpacity
            style={styles.configButton}
            onPress={() => setShowParameters(true)}
          >
            <Ionicons name="settings" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.configButtonText}>Configure</Text>
          </TouchableOpacity>
        )}

        {/* Complexity Badge */}
        <View style={[
          styles.complexityBadge,
          { backgroundColor: getComplexityColor(metadata.complexity) }
        ]}>
          <Text style={styles.complexityText}>
            {metadata.complexity.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Parameter Modal */}
      {renderParameterModal()}
    </>
  );
};

// Helper function to get complexity color
const getComplexityColor = (complexity: string) => {
  switch (complexity) {
    case 'low':
      return theme.colors.success[100];
    case 'medium':
      return theme.colors.warning[100];
    case 'high':
      return theme.colors.error[100];
    default:
      return theme.colors.neutral[100];
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 200,
    minHeight: 120,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: theme.colors.primary[500],
    ...theme.shadows.lg,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  
  // Symbol and timeframe styles
  symbolContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  symbol: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  timeframe: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    backgroundColor: theme.colors.neutral[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  
  // Parameter summary styles
  parameterSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  parameterSummaryText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  
  // Output ports styles
  outputPorts: {
    marginBottom: theme.spacing.sm,
  },
  outputPort: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  portDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success[500],
    marginRight: theme.spacing.sm,
  },
  portLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  
  // Configuration button styles
  configButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  configButtonText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  
  // Complexity badge styles
  complexityBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  complexityText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  
  // Description styles
  descriptionContainer: {
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  
  // Parameters styles
  parametersContainer: {
    marginBottom: theme.spacing.lg,
  },
  parametersTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  parameterItem: {
    marginBottom: theme.spacing.md,
  },
  
  // Outputs styles
  outputsContainer: {
    marginBottom: theme.spacing.lg,
  },
  outputsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  outputItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  outputIcon: {
    marginRight: theme.spacing.sm,
  },
  outputInfo: {
    flex: 1,
  },
  outputName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  outputDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
});

export default IndicatorBlock;
