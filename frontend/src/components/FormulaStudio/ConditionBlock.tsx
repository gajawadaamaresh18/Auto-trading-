/**
 * ConditionBlock Component
 * 
 * A draggable, configurable block for logical conditions and comparisons.
 * Supports various operators like greater than, less than, crosses above, etc.
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
import { ConditionBlock as ConditionBlockType, BlockPosition } from './types';
import { getConditionMetadata } from './data/blocks/indicatorList';
import theme from '../../theme';

export interface ConditionBlockProps {
  /** Block data */
  block: ConditionBlockType;
  /** Whether block is selected */
  isSelected: boolean;
  /** Callback when block is selected */
  onSelect: () => void;
  /** Callback when block is updated */
  onUpdate: (updates: Partial<ConditionBlockType>) => void;
  /** Callback when block is deleted */
  onDelete: () => void;
  /** Whether block is in read-only mode */
  readOnly?: boolean;
  /** Additional styling */
  style?: any;
}

const ConditionBlock: React.FC<ConditionBlockProps> = ({
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

  const metadata = getConditionMetadata(block.conditionType);
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

  // Get operator display text
  const getOperatorText = (operator: string): string => {
    switch (operator) {
      case '>': return 'Greater Than';
      case '<': return 'Less Than';
      case '>=': return 'Greater or Equal';
      case '<=': return 'Less or Equal';
      case '==': return 'Equal To';
      case '!=': return 'Not Equal';
      case 'crosses_above': return 'Crosses Above';
      case 'crosses_below': return 'Crosses Below';
      case 'and': return 'AND';
      case 'or': return 'OR';
      case 'not': return 'NOT';
      default: return operator;
    }
  };

  // Get operator icon
  const getOperatorIcon = (operator: string): string => {
    switch (operator) {
      case '>': return 'chevron-up';
      case '<': return 'chevron-down';
      case '>=': return 'chevron-up-outline';
      case '<=': return 'chevron-down-outline';
      case '==': return 'checkmark';
      case '!=': return 'close';
      case 'crosses_above': return 'arrow-up';
      case 'crosses_below': return 'arrow-down';
      case 'and': return 'checkmark-circle';
      case 'or': return 'checkmark-circle-outline';
      case 'not': return 'close-circle';
      default: return 'help-circle';
    }
  };

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
          <Text style={styles.modalTitle}>{metadata.name} Configuration</Text>
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

          <View style={styles.operatorContainer}>
            <Text style={styles.operatorTitle}>Operator</Text>
            <View style={styles.operatorDisplay}>
              <Ionicons 
                name={getOperatorIcon(block.operator) as any} 
                size={24} 
                color={theme.colors.warning[500]} 
              />
              <Text style={styles.operatorText}>{getOperatorText(block.operator)}</Text>
            </View>
          </View>

          <View style={styles.inputsContainer}>
            <Text style={styles.inputsTitle}>Input Connections</Text>
            {metadata.inputs.map(input => (
              <View key={input.id} style={styles.inputItem}>
                <View style={styles.inputIcon}>
                  <Ionicons 
                    name="arrow-back" 
                    size={16} 
                    color={theme.colors.primary[500]} 
                  />
                </View>
                <View style={styles.inputInfo}>
                  <Text style={styles.inputName}>{input.label}</Text>
                  <Text style={styles.inputDescription}>
                    {input.required ? 'Required' : 'Optional'} • {input.type}
                  </Text>
                </View>
                <View style={styles.inputStatus}>
                  {block.inputs.includes(input.id) ? (
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.success[500]} />
                  ) : (
                    <Ionicons name="ellipse-outline" size={20} color={theme.colors.neutral[400]} />
                  )}
                </View>
              </View>
            ))}
          </View>

          {metadata.parameters.length > 0 && (
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
          )}

          <View style={styles.outputContainer}>
            <Text style={styles.outputTitle}>Output</Text>
            <View style={styles.outputItem}>
              <View style={styles.outputIcon}>
                <Ionicons 
                  name="arrow-forward" 
                  size={16} 
                  color={theme.colors.success[500]} 
                />
              </View>
              <View style={styles.outputInfo}>
                <Text style={styles.outputName}>Result</Text>
                <Text style={styles.outputDescription}>Boolean result of the condition</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  // Render input ports
  const renderInputPorts = () => (
    <View style={styles.inputPorts}>
      {block.ports
        .filter(port => port.type === 'input')
        .map(port => (
          <View key={port.id} style={styles.inputPort}>
            <View style={[
              styles.portDot,
              { backgroundColor: getPortColor(port.dataType) }
            ]} />
            <Text style={styles.portLabel}>{port.label}</Text>
            {port.required && (
              <Ionicons 
                name="star" 
                size={12} 
                color={theme.colors.warning[500]} 
              />
            )}
          </View>
        ))}
    </View>
  );

  // Render output port
  const renderOutputPort = () => (
    <View style={styles.outputPort}>
      <Text style={styles.portLabel}>Result</Text>
      <View style={styles.portDot} />
    </View>
  );

  // Get port color based on data type
  const getPortColor = (dataType: string): string => {
    switch (dataType) {
      case 'number': return theme.colors.primary[500];
      case 'boolean': return theme.colors.warning[500];
      case 'signal': return theme.colors.success[500];
      case 'indicator': return theme.colors.secondary[500];
      default: return theme.colors.neutral[500];
    }
  };

  // Check if all required inputs are connected
  const allInputsConnected = block.ports
    .filter(port => port.type === 'input' && port.required)
    .every(port => block.inputs.includes(port.id));

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          isSelected && styles.selectedContainer,
          !allInputsConnected && styles.incompleteContainer,
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
              color={theme.colors.warning[500]} 
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

        {/* Operator Display */}
        <View style={styles.operatorContainer}>
          <View style={styles.operatorDisplay}>
            <Ionicons 
              name={getOperatorIcon(block.operator) as any} 
              size={18} 
              color={theme.colors.warning[600]} 
            />
            <Text style={styles.operatorText}>{getOperatorText(block.operator)}</Text>
          </View>
        </View>

        {/* Input Ports */}
        {renderInputPorts()}

        {/* Output Port */}
        {renderOutputPort()}

        {/* Connection Status */}
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionStatusText}>
            {block.inputs.length}/{block.ports.filter(p => p.type === 'input').length} inputs connected
          </Text>
          {!allInputsConnected && (
            <Ionicons 
              name="warning" 
              size={16} 
              color={theme.colors.warning[500]} 
            />
          )}
        </View>

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
    minHeight: 140,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: theme.colors.warning[500],
    ...theme.shadows.lg,
  },
  incompleteContainer: {
    borderColor: theme.colors.warning[300],
    backgroundColor: theme.colors.warning[25],
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
  
  // Operator styles
  operatorContainer: {
    marginBottom: theme.spacing.sm,
  },
  operatorDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.warning[50],
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  operatorText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.warning[700],
    marginLeft: theme.spacing.sm,
  },
  
  // Input ports styles
  inputPorts: {
    marginBottom: theme.spacing.sm,
  },
  inputPort: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  portDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  portLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  
  // Output port styles
  outputPort: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing.sm,
  },
  
  // Connection status styles
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  connectionStatusText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    flex: 1,
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
  
  // Operator styles
  operatorTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  
  // Inputs styles
  inputsContainer: {
    marginBottom: theme.spacing.lg,
  },
  inputsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  inputItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  inputInfo: {
    flex: 1,
  },
  inputName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  inputDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  inputStatus: {
    marginLeft: theme.spacing.sm,
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
  
  // Output styles
  outputContainer: {
    marginBottom: theme.spacing.lg,
  },
  outputTitle: {
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

export default ConditionBlock;
