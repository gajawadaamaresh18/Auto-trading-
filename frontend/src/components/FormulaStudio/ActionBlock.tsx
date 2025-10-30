/**
 * ActionBlock Component
 * 
 * A draggable, configurable block for trading actions like buy, sell, alerts, etc.
 * Supports various order types, position sizing, and risk management actions.
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
import { ActionBlock as ActionBlockType, BlockPosition } from './types';
import { getActionMetadata } from './data/blocks/indicatorList';
import theme from '../../theme';

export interface ActionBlockProps {
  /** Block data */
  block: ActionBlockType;
  /** Whether block is selected */
  isSelected: boolean;
  /** Callback when block is selected */
  onSelect: () => void;
  /** Callback when block is updated */
  onUpdate: (updates: Partial<ActionBlockType>) => void;
  /** Callback when block is deleted */
  onDelete: () => void;
  /** Whether block is in read-only mode */
  readOnly?: boolean;
  /** Additional styling */
  style?: any;
}

const ActionBlock: React.FC<ActionBlockProps> = ({
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

  const metadata = getActionMetadata(block.actionType);
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

  // Get action display text
  const getActionText = (actionType: string): string => {
    switch (actionType) {
      case 'buy': return 'Buy Order';
      case 'sell': return 'Sell Order';
      case 'alert': return 'Send Alert';
      case 'close_position': return 'Close Position';
      case 'set_stop_loss': return 'Set Stop Loss';
      case 'set_take_profit': return 'Set Take Profit';
      default: return actionType;
    }
  };

  // Get action icon
  const getActionIcon = (actionType: string): string => {
    switch (actionType) {
      case 'buy': return 'arrow-up-circle';
      case 'sell': return 'arrow-down-circle';
      case 'alert': return 'notifications';
      case 'close_position': return 'close-circle';
      case 'set_stop_loss': return 'shield';
      case 'set_take_profit': return 'trophy';
      default: return 'play-circle';
    }
  };

  // Get action color
  const getActionColor = (actionType: string): string => {
    switch (actionType) {
      case 'buy': return theme.colors.success[500];
      case 'sell': return theme.colors.error[500];
      case 'alert': return theme.colors.warning[500];
      case 'close_position': return theme.colors.neutral[500];
      case 'set_stop_loss': return theme.colors.error[400];
      case 'set_take_profit': return theme.colors.success[400];
      default: return theme.colors.primary[500];
    }
  };

  // Get category color
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'trade': return theme.colors.primary[100];
      case 'risk': return theme.colors.error[100];
      case 'alert': return theme.colors.warning[100];
      case 'position': return theme.colors.neutral[100];
      default: return theme.colors.primary[100];
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

          <View style={styles.actionTypeContainer}>
            <Text style={styles.actionTypeTitle}>Action Type</Text>
            <View style={[
              styles.actionTypeDisplay,
              { backgroundColor: getCategoryColor(metadata.category) }
            ]}>
              <Ionicons 
                name={getActionIcon(block.actionType) as any} 
                size={24} 
                color={getActionColor(block.actionType)} 
              />
              <Text style={[
                styles.actionTypeText,
                { color: getActionColor(block.actionType) }
              ]}>
                {getActionText(block.actionType)}
              </Text>
            </View>
          </View>

          <View style={styles.inputsContainer}>
            <Text style={styles.inputsTitle}>Trigger Conditions</Text>
            {metadata.inputs.map(input => (
              <View key={input.id} style={styles.inputItem}>
                <View style={styles.inputIcon}>
                  <Ionicons 
                    name="arrow-back" 
                    size={16} 
                    color={theme.colors.warning[500]} 
                  />
                </View>
                <View style={styles.inputInfo}>
                  <Text style={styles.inputName}>{input.label}</Text>
                  <Text style={styles.inputDescription}>
                    {input.required ? 'Required' : 'Optional'} • {input.type}
                  </Text>
                </View>
                <View style={styles.inputStatus}>
                  {block.conditions.includes(input.id) ? (
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.success[500]} />
                  ) : (
                    <Ionicons name="ellipse-outline" size={20} color={theme.colors.neutral[400]} />
                  )}
                </View>
              </View>
            ))}
          </View>

          <View style={styles.parametersContainer}>
            <Text style={styles.parametersTitle}>Action Parameters</Text>
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

          {/* Action-specific help */}
          {renderActionHelp()}
        </ScrollView>
      </View>
    </Modal>
  );

  // Render action-specific help
  const renderActionHelp = () => {
    switch (block.actionType) {
      case 'buy':
      case 'sell':
        return (
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Order Types</Text>
            <View style={styles.helpItem}>
              <Text style={styles.helpLabel}>Market Order:</Text>
              <Text style={styles.helpText}>Executes immediately at current market price</Text>
            </View>
            <View style={styles.helpItem}>
              <Text style={styles.helpLabel}>Limit Order:</Text>
              <Text style={styles.helpText}>Executes only at specified price or better</Text>
            </View>
            <View style={styles.helpItem}>
              <Text style={styles.helpLabel}>Stop Order:</Text>
              <Text style={styles.helpText}>Triggers when price reaches stop level</Text>
            </View>
          </View>
        );
      
      case 'set_stop_loss':
        return (
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Stop Loss</Text>
            <Text style={styles.helpText}>
              Stop loss orders help limit your downside risk by automatically selling 
              when the price drops to a specified level.
            </Text>
          </View>
        );
      
      case 'set_take_profit':
        return (
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Take Profit</Text>
            <Text style={styles.helpText}>
              Take profit orders help secure gains by automatically selling 
              when the price reaches a specified profit level.
            </Text>
          </View>
        );
      
      case 'alert':
        return (
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Alerts</Text>
            <Text style={styles.helpText}>
              Alerts will be sent to your device when the condition is met. 
              You can customize the message and priority level.
            </Text>
          </View>
        );
      
      default:
        return null;
    }
  };

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
    .every(port => block.conditions.includes(port.id));

  // Get parameter summary
  const getParameterSummary = () => {
    const paramCount = Object.keys(block.parameters).length;
    const configuredCount = Object.values(block.parameters).filter(
      value => value !== null && value !== undefined && value !== ''
    ).length;

    return `${configuredCount}/${paramCount} parameters configured`;
  };

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
              name={getActionIcon(block.actionType) as any} 
              size={20} 
              color={getActionColor(block.actionType)} 
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

        {/* Action Type Display */}
        <View style={[
          styles.actionTypeContainer,
          { backgroundColor: getCategoryColor(metadata.category) }
        ]}>
          <Text style={[
            styles.actionTypeText,
            { color: getActionColor(block.actionType) }
          ]}>
            {getActionText(block.actionType)}
          </Text>
        </View>

        {/* Input Ports */}
        {renderInputPorts()}

        {/* Parameter Summary */}
        <View style={styles.parameterSummary}>
          <Text style={styles.parameterSummaryText}>
            {getParameterSummary()}
          </Text>
        </View>

        {/* Connection Status */}
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionStatusText}>
            {block.conditions.length}/{block.ports.filter(p => p.type === 'input').length} conditions connected
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

        {/* Category Badge */}
        <View style={[
          styles.categoryBadge,
          { backgroundColor: getActionColor(block.actionType) }
        ]}>
          <Text style={styles.categoryText}>
            {metadata.category.toUpperCase()}
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
    minHeight: 160,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: theme.colors.success[500],
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
  
  // Action type styles
  actionTypeContainer: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  actionTypeText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
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
  
  // Parameter summary styles
  parameterSummary: {
    marginBottom: theme.spacing.sm,
  },
  parameterSummaryText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
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
  
  // Category badge styles
  categoryBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
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
  
  // Action type styles
  actionTypeTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  actionTypeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
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
  
  // Help styles
  helpContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  helpTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  helpItem: {
    marginBottom: theme.spacing.sm,
  },
  helpLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  helpText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
});

export default ActionBlock;
