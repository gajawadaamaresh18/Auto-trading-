/**
 * ParameterInput Component
 * 
 * A reusable input component for configuring block parameters.
 * Supports various input types: number, string, boolean, select, etc.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ParameterDefinition } from './data/blocks/indicatorList';
import theme from '../../theme';

export interface ParameterInputProps {
  /** Parameter definition */
  parameter: ParameterDefinition;
  /** Current value */
  value: any;
  /** Callback when value changes */
  onChange: (value: any) => void;
  /** Whether input is read-only */
  readOnly?: boolean;
  /** Additional styling */
  style?: any;
}

const ParameterInput: React.FC<ParameterInputProps> = ({
  parameter,
  value,
  onChange,
  readOnly = false,
  style,
}) => {
  const [showSelectModal, setShowSelectModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Handle value change
  const handleValueChange = useCallback((newValue: any) => {
    if (!readOnly) {
      onChange(newValue);
    }
  }, [onChange, readOnly]);

  // Validate value based on constraints
  const validateValue = (val: any): any => {
    if (parameter.type === 'number' && parameter.constraints) {
      const { min, max, step } = parameter.constraints;
      let numValue = Number(val);
      
      if (min !== undefined && numValue < min) numValue = min;
      if (max !== undefined && numValue > max) numValue = max;
      
      return numValue;
    }
    
    return val;
  };

  // Format display value
  const formatDisplayValue = (val: any): string => {
    if (val === null || val === undefined) return '';
    
    switch (parameter.type) {
      case 'number':
        return String(val);
      case 'string':
        return String(val);
      case 'boolean':
        return val ? 'Yes' : 'No';
      case 'select':
        const option = parameter.constraints?.options?.find(opt => opt.value === val);
        return option ? option.label : String(val);
      default:
        return String(val);
    }
  };

  // Render number input
  const renderNumberInput = () => (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.textInput,
          isFocused && styles.focusedInput,
          readOnly && styles.readOnlyInput,
        ]}
        value={formatDisplayValue(value)}
        onChangeText={(text) => {
          const numValue = parseFloat(text) || 0;
          handleValueChange(validateValue(numValue));
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType="numeric"
        editable={!readOnly}
        placeholder={parameter.description}
        placeholderTextColor={theme.colors.text.tertiary}
      />
      {parameter.constraints?.unit && (
        <Text style={styles.unitLabel}>{parameter.constraints.unit}</Text>
      )}
    </View>
  );

  // Render string input
  const renderStringInput = () => (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.textInput,
          isFocused && styles.focusedInput,
          readOnly && styles.readOnlyInput,
        ]}
        value={formatDisplayValue(value)}
        onChangeText={handleValueChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={!readOnly}
        placeholder={parameter.description}
        placeholderTextColor={theme.colors.text.tertiary}
        multiline={parameter.id === 'message'}
        numberOfLines={parameter.id === 'message' ? 3 : 1}
      />
    </View>
  );

  // Render boolean input
  const renderBooleanInput = () => (
    <View style={styles.booleanContainer}>
      <Switch
        value={Boolean(value)}
        onValueChange={handleValueChange}
        disabled={readOnly}
        trackColor={{
          false: theme.colors.neutral[300],
          true: theme.colors.primary[300],
        }}
        thumbColor={
          Boolean(value) ? theme.colors.primary[500] : theme.colors.neutral[500]
        }
      />
      <Text style={styles.booleanLabel}>
        {Boolean(value) ? 'Enabled' : 'Disabled'}
      </Text>
    </View>
  );

  // Render select input
  const renderSelectInput = () => (
    <TouchableOpacity
      style={[
        styles.selectContainer,
        isFocused && styles.focusedInput,
        readOnly && styles.readOnlyInput,
      ]}
      onPress={() => !readOnly && setShowSelectModal(true)}
      disabled={readOnly}
    >
      <Text style={[
        styles.selectText,
        !value && styles.placeholderText,
        readOnly && styles.readOnlyText,
      ]}>
        {formatDisplayValue(value) || parameter.description}
      </Text>
      <Ionicons 
        name="chevron-down" 
        size={20} 
        color={readOnly ? theme.colors.text.tertiary : theme.colors.text.secondary} 
      />
    </TouchableOpacity>
  );

  // Render select modal
  const renderSelectModal = () => (
    <Modal
      visible={showSelectModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowSelectModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{parameter.label}</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowSelectModal(false)}
          >
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={parameter.constraints?.options || []}
          keyExtractor={(item) => String(item.value)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.optionItem,
                item.value === value && styles.selectedOption,
              ]}
              onPress={() => {
                handleValueChange(item.value);
                setShowSelectModal(false);
              }}
            >
              <Text style={[
                styles.optionText,
                item.value === value && styles.selectedOptionText,
              ]}>
                {item.label}
              </Text>
              {item.value === value && (
                <Ionicons 
                  name="checkmark" 
                  size={20} 
                  color={theme.colors.primary[500]} 
                />
              )}
            </TouchableOpacity>
          )}
          style={styles.optionsList}
        />
      </View>
    </Modal>
  );

  // Render input based on type
  const renderInput = () => {
    switch (parameter.type) {
      case 'number':
        return renderNumberInput();
      case 'string':
        return renderStringInput();
      case 'boolean':
        return renderBooleanInput();
      case 'select':
        return renderSelectInput();
      default:
        return renderStringInput();
    }
  };

  // Render constraints info
  const renderConstraints = () => {
    if (!parameter.constraints) return null;

    const { min, max, step } = parameter.constraints;
    const constraints: string[] = [];

    if (min !== undefined) constraints.push(`Min: ${min}`);
    if (max !== undefined) constraints.push(`Max: ${max}`);
    if (step !== undefined) constraints.push(`Step: ${step}`);

    if (constraints.length === 0) return null;

    return (
      <Text style={styles.constraintsText}>
        {constraints.join(' • ')}
      </Text>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Parameter Label */}
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{parameter.label}</Text>
        {parameter.required && (
          <Ionicons 
            name="star" 
            size={12} 
            color={theme.colors.error[500]} 
          />
        )}
      </View>

      {/* Parameter Description */}
      {parameter.description && (
        <Text style={styles.description}>{parameter.description}</Text>
      )}

      {/* Input Component */}
      {renderInput()}

      {/* Constraints Info */}
      {renderConstraints()}

      {/* Select Modal */}
      {renderSelectModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  
  // Label styles
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    flex: 1,
  },
  
  // Description styles
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  
  // Input container styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  
  // Text input styles
  textInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: 'transparent',
  },
  focusedInput: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[25],
  },
  readOnlyInput: {
    backgroundColor: theme.colors.neutral[100],
    borderColor: theme.colors.neutral[200],
  },
  readOnlyText: {
    color: theme.colors.text.tertiary,
  },
  
  // Unit label styles
  unitLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  
  // Boolean input styles
  booleanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  booleanLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
  },
  
  // Select input styles
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  selectText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  placeholderText: {
    color: theme.colors.text.tertiary,
  },
  
  // Constraints styles
  constraintsText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
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
  
  // Options list styles
  optionsList: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[25],
  },
  optionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  selectedOptionText: {
    color: theme.colors.primary[700],
    fontWeight: theme.typography.fontWeight.medium,
  },
});

export default ParameterInput;
