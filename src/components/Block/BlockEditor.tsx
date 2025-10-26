import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Switch,
  Picker,
} from 'react-native';
import { Block, BlockParameter } from '../../types';

interface BlockEditorProps {
  block: Block | null;
  isVisible: boolean;
  onClose: () => void;
  onSave: (blockId: string, updatedParameters: BlockParameter[]) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  block,
  isVisible,
  onClose,
  onSave,
}) => {
  const [parameters, setParameters] = useState<BlockParameter[]>([]);

  useEffect(() => {
    if (block) {
      setParameters([...block.parameters]);
    }
  }, [block]);

  const handleParameterChange = (paramId: string, value: any) => {
    setParameters(prev => 
      prev.map(param => 
        param.id === paramId ? { ...param, value } : param
      )
    );
  };

  const handleSave = () => {
    if (block) {
      onSave(block.id, parameters);
      onClose();
    }
  };

  const renderParameterInput = (param: BlockParameter) => {
    switch (param.type) {
      case 'number':
        return (
          <TextInput
            style={styles.input}
            value={String(param.value)}
            onChangeText={(text) => {
              const numValue = parseFloat(text) || 0;
              handleParameterChange(param.id, numValue);
            }}
            keyboardType="numeric"
            placeholder={`Enter ${param.name}`}
          />
        );

      case 'string':
        return (
          <TextInput
            style={styles.input}
            value={String(param.value)}
            onChangeText={(text) => handleParameterChange(param.id, text)}
            placeholder={`Enter ${param.name}`}
          />
        );

      case 'boolean':
        return (
          <Switch
            value={Boolean(param.value)}
            onValueChange={(value) => handleParameterChange(param.id, value)}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor={param.value ? '#FFFFFF' : '#FFFFFF'}
          />
        );

      case 'select':
        return (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={param.value}
              onValueChange={(value) => handleParameterChange(param.id, value)}
              style={styles.picker}
            >
              {param.options?.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
        );

      case 'color':
        return (
          <View style={styles.colorContainer}>
            <TextInput
              style={[styles.input, styles.colorInput]}
              value={String(param.value)}
              onChangeText={(text) => handleParameterChange(param.id, text)}
              placeholder="#000000"
            />
            <View 
              style={[
                styles.colorPreview, 
                { backgroundColor: param.value || '#000000' }
              ]} 
            />
          </View>
        );

      default:
        return (
          <TextInput
            style={styles.input}
            value={String(param.value)}
            onChangeText={(text) => handleParameterChange(param.id, text)}
            placeholder={`Enter ${param.name}`}
          />
        );
    }
  };

  if (!block) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit {block.name}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.blockInfo}>
            <Text style={styles.blockType}>{block.type.toUpperCase()}</Text>
            <Text style={styles.blockDescription}>{block.description}</Text>
          </View>

          <View style={styles.parametersSection}>
            <Text style={styles.sectionTitle}>Parameters</Text>
            {parameters.map((param) => (
              <View key={param.id} style={styles.parameterContainer}>
                <View style={styles.parameterHeader}>
                  <Text style={styles.parameterName}>{param.name}</Text>
                  <Text style={styles.parameterType}>{param.type}</Text>
                </View>
                
                {param.min !== undefined && param.max !== undefined && (
                  <Text style={styles.parameterRange}>
                    Range: {param.min} - {param.max}
                  </Text>
                )}

                <View style={styles.inputContainer}>
                  {renderParameterInput(param)}
                </View>
              </View>
            ))}
          </View>

          {block.ports && block.ports.length > 0 && (
            <View style={styles.portsSection}>
              <Text style={styles.sectionTitle}>Connections</Text>
              <View style={styles.portsList}>
                {block.ports.map((port) => (
                  <View key={port.id} style={styles.portItem}>
                    <View style={[
                      styles.portDot,
                      { backgroundColor: port.type === 'input' ? '#34C759' : '#007AFF' }
                    ]} />
                    <Text style={styles.portName}>{port.name}</Text>
                    <Text style={styles.portType}>({port.dataType})</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '400',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  saveText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  blockInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  blockType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  blockDescription: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 22,
  },
  parametersSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  parameterContainer: {
    marginBottom: 20,
  },
  parameterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  parameterName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  parameterType: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  parameterRange: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  inputContainer: {
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#F2F2F7',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  picker: {
    height: 50,
  },
  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorInput: {
    flex: 1,
    marginRight: 12,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  portsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  portsList: {
    marginTop: 8,
  },
  portItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  portDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  portName: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
    marginRight: 8,
  },
  portType: {
    fontSize: 12,
    color: '#8E8E93',
  },
});