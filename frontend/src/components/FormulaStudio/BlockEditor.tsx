/**
 * BlockEditor - Main Visual Strategy Builder Component
 * 
 * A drag-and-drop visual editor for building trading strategies.
 * Supports creating, editing, and connecting blocks to form complex trading logic.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from 'react-native';

import { IndicatorBlock } from './IndicatorBlock';
import { ConditionBlock } from './ConditionBlock';
import { ActionBlock } from './ActionBlock';
import { ParameterInput } from './ParameterInput';
import { FormulaPreview } from './FormulaPreview';

import {
  FormulaCanvas,
  Block,
  BlockConnection,
  BlockPosition,
  createBlockId,
  createConnectionId,
  validateFormula,
  serializeFormula,
  deserializeFormula,
  IndicatorTypes,
  ConditionTypes,
  ActionTypes,
  GroupTypes,
} from './types';

import {
  getAllIndicators,
  getAllConditions,
  getAllActions,
  getAllGroups,
  getIndicatorMetadata,
  getConditionMetadata,
  getActionMetadata,
  getGroupMetadata,
} from './data/blocks/indicatorList';

import theme from '../../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface BlockEditorProps {
  /** Initial formula canvas */
  initialFormula?: FormulaCanvas;
  /** Callback when formula changes */
  onFormulaChange: (formula: FormulaCanvas) => void;
  /** Callback when formula is saved */
  onSave?: (formula: FormulaCanvas) => void;
  /** Callback when formula is validated */
  onValidate?: (isValid: boolean, errors: string[]) => void;
  /** Whether editor is in read-only mode */
  readOnly?: boolean;
  /** Additional styling */
  style?: any;
}

const BlockEditor: React.FC<BlockEditorProps> = ({
  initialFormula,
  onFormulaChange,
  onSave,
  onValidate,
  readOnly = false,
  style,
}) => {
  // State management
  const [formula, setFormula] = useState<FormulaCanvas>(
    initialFormula || {
      id: createBlockId(),
      name: 'New Strategy',
      description: '',
      blocks: [],
      connections: [],
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        version: '1.0.0',
        author: 'user',
      },
    }
  );

  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<Block | null>(null);
  const [dragPosition, setDragPosition] = useState<BlockPosition>({ x: 0, y: 0 });
  const [showBlockPalette, setShowBlockPalette] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [canvasScale, setCanvasScale] = useState(1);

  // Refs
  const canvasRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Update formula when initial formula changes
  useEffect(() => {
    if (initialFormula) {
      setFormula(initialFormula);
    }
  }, [initialFormula]);

  // Validate formula and notify parent
  useEffect(() => {
    const isValid = validateFormula(formula);
    const errors: string[] = [];
    
    if (!isValid) {
      if (formula.blocks.length === 0) {
        errors.push('No blocks added');
      }
      if (!formula.blocks.some(block => block.type === 'action')) {
        errors.push('No action blocks found');
      }
      if (formula.blocks.some(block => block.type === 'action') && 
          !formula.connections.some(conn => 
            formula.blocks.find(b => b.id === conn.targetBlockId)?.type === 'action'
          )) {
        errors.push('Action blocks must be connected');
      }
    }
    
    onValidate?.(isValid, errors);
  }, [formula, onValidate]);

  // Pan responder for canvas dragging
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      if (draggedBlock) {
        setDragPosition({
          x: gestureState.moveX - canvasOffset.x,
          y: gestureState.moveY - canvasOffset.y,
        });
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (draggedBlock) {
        const finalPosition = {
          x: gestureState.moveX - canvasOffset.x,
          y: gestureState.moveY - canvasOffset.y,
        };
        
        addBlockToCanvas(draggedBlock, finalPosition);
        setDraggedBlock(null);
      }
    },
  });

  // Block management functions
  const addBlockToCanvas = useCallback((block: Block, position: BlockPosition) => {
    const newBlock = {
      ...block,
      id: createBlockId(),
      position,
    };

    setFormula(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock],
      metadata: {
        ...prev.metadata,
        modified: new Date().toISOString(),
      },
    }));

    onFormulaChange({
      ...formula,
      blocks: [...formula.blocks, newBlock],
      metadata: {
        ...formula.metadata,
        modified: new Date().toISOString(),
      },
    });
  }, [formula, onFormulaChange]);

  const updateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    setFormula(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      ),
      metadata: {
        ...prev.metadata,
        modified: new Date().toISOString(),
      },
    }));

    const updatedFormula = {
      ...formula,
      blocks: formula.blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      ),
      metadata: {
        ...formula.metadata,
        modified: new Date().toISOString(),
      },
    };

    onFormulaChange(updatedFormula);
  }, [formula, onFormulaChange]);

  const deleteBlock = useCallback((blockId: string) => {
    Alert.alert(
      'Delete Block',
      'Are you sure you want to delete this block?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setFormula(prev => ({
              ...prev,
              blocks: prev.blocks.filter(block => block.id !== blockId),
              connections: prev.connections.filter(
                conn => conn.sourceBlockId !== blockId && conn.targetBlockId !== blockId
              ),
              metadata: {
                ...prev.metadata,
                modified: new Date().toISOString(),
              },
            }));

            const updatedFormula = {
              ...formula,
              blocks: formula.blocks.filter(block => block.id !== blockId),
              connections: formula.connections.filter(
                conn => conn.sourceBlockId !== blockId && conn.targetBlockId !== blockId
              ),
              metadata: {
                ...formula.metadata,
                modified: new Date().toISOString(),
              },
            };

            onFormulaChange(updatedFormula);
            setSelectedBlock(null);
          },
        },
      ]
    );
  }, [formula, onFormulaChange]);

  const createConnection = useCallback((
    sourceBlockId: string,
    sourcePortId: string,
    targetBlockId: string,
    targetPortId: string
  ) => {
    const connection: BlockConnection = {
      id: createConnectionId(),
      sourceBlockId,
      sourcePortId,
      targetBlockId,
      targetPortId,
    };

    setFormula(prev => ({
      ...prev,
      connections: [...prev.connections, connection],
      metadata: {
        ...prev.metadata,
        modified: new Date().toISOString(),
      },
    }));

    const updatedFormula = {
      ...formula,
      connections: [...formula.connections, connection],
      metadata: {
        ...formula.metadata,
        modified: new Date().toISOString(),
      },
    };

    onFormulaChange(updatedFormula);
  }, [formula, onFormulaChange]);

  const deleteConnection = useCallback((connectionId: string) => {
    setFormula(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== connectionId),
      metadata: {
        ...prev.metadata,
        modified: new Date().toISOString(),
      },
    }));

    const updatedFormula = {
      ...formula,
      connections: formula.connections.filter(conn => conn.id !== connectionId),
      metadata: {
        ...formula.metadata,
        modified: new Date().toISOString(),
      },
    };

    onFormulaChange(updatedFormula);
  }, [formula, onFormulaChange]);

  // Block creation functions
  const createIndicatorBlock = useCallback((indicatorType: string) => {
    const metadata = getIndicatorMetadata(indicatorType);
    if (!metadata) return;

    const block: Block = {
      id: createBlockId(),
      type: 'indicator',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 120 },
      ports: [
        ...metadata.outputs.map(output => ({
          id: output.id,
          type: 'output' as const,
          dataType: output.type as any,
          label: output.label,
        })),
      ],
      metadata: {
        label: metadata.name,
        description: metadata.description,
        category: metadata.category,
        icon: metadata.icon,
      },
      indicatorType,
      parameters: metadata.parameters.reduce((acc, param) => {
        acc[param.id] = param.defaultValue;
        return acc;
      }, {} as Record<string, any>),
      timeframe: '1h',
      symbol: 'AAPL',
    };

    setDraggedBlock(block);
  }, []);

  const createConditionBlock = useCallback((conditionType: string) => {
    const metadata = getConditionMetadata(conditionType);
    if (!metadata) return;

    const block: Block = {
      id: createBlockId(),
      type: 'condition',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 120 },
      ports: [
        ...metadata.inputs.map(input => ({
          id: input.id,
          type: 'input' as const,
          dataType: input.type as any,
          label: input.label,
          required: input.required,
        })),
        {
          id: 'output',
          type: 'output' as const,
          dataType: 'boolean' as const,
          label: 'Result',
        },
      ],
      metadata: {
        label: metadata.name,
        description: metadata.description,
        category: metadata.category,
        icon: metadata.icon,
      },
      conditionType,
      operator: metadata.operator,
      parameters: {},
      inputs: [],
    };

    setDraggedBlock(block);
  }, []);

  const createActionBlock = useCallback((actionType: string) => {
    const metadata = getActionMetadata(actionType);
    if (!metadata) return;

    const block: Block = {
      id: createBlockId(),
      type: 'action',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 120 },
      ports: [
        ...metadata.inputs.map(input => ({
          id: input.id,
          type: 'input' as const,
          dataType: input.type as any,
          label: input.label,
          required: input.required,
        })),
      ],
      metadata: {
        label: metadata.name,
        description: metadata.description,
        category: metadata.category,
        icon: metadata.icon,
      },
      actionType,
      parameters: metadata.parameters.reduce((acc, param) => {
        acc[param.id] = param.defaultValue;
        return acc;
      }, {} as Record<string, any>),
      conditions: [],
    };

    setDraggedBlock(block);
  }, []);

  // Render functions
  const renderBlockPalette = () => (
    <Modal
      visible={showBlockPalette}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowBlockPalette(false)}
    >
      <SafeAreaView style={styles.paletteContainer}>
        <View style={styles.paletteHeader}>
          <Text style={styles.paletteTitle}>Add Block</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowBlockPalette(false)}
          >
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.paletteContent}>
          {/* Indicators */}
          <View style={styles.paletteSection}>
            <Text style={styles.paletteSectionTitle}>Indicators</Text>
            {getAllIndicators().map(indicator => (
              <TouchableOpacity
                key={indicator.id}
                style={styles.paletteItem}
                onPress={() => {
                  createIndicatorBlock(indicator.id);
                  setShowBlockPalette(false);
                }}
              >
                <Ionicons name={indicator.icon as any} size={20} color={theme.colors.primary[500]} />
                <Text style={styles.paletteItemText}>{indicator.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Conditions */}
          <View style={styles.paletteSection}>
            <Text style={styles.paletteSectionTitle}>Conditions</Text>
            {getAllConditions().map(condition => (
              <TouchableOpacity
                key={condition.id}
                style={styles.paletteItem}
                onPress={() => {
                  createConditionBlock(condition.id);
                  setShowBlockPalette(false);
                }}
              >
                <Ionicons name={condition.icon as any} size={20} color={theme.colors.warning[500]} />
                <Text style={styles.paletteItemText}>{condition.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.paletteSection}>
            <Text style={styles.paletteSectionTitle}>Actions</Text>
            {getAllActions().map(action => (
              <TouchableOpacity
                key={action.id}
                style={styles.paletteItem}
                onPress={() => {
                  createActionBlock(action.id);
                  setShowBlockPalette(false);
                }}
              >
                <Ionicons name={action.icon as any} size={20} color={theme.colors.success[500]} />
                <Text style={styles.paletteItemText}>{action.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderCanvas = () => (
    <View style={styles.canvas} ref={canvasRef} {...panResponder.panHandlers}>
      {/* Render connections */}
      {formula.connections.map(connection => {
        const sourceBlock = formula.blocks.find(b => b.id === connection.sourceBlockId);
        const targetBlock = formula.blocks.find(b => b.id === connection.targetBlockId);
        
        if (!sourceBlock || !targetBlock) return null;

        return (
          <View
            key={connection.id}
            style={[
              styles.connection,
              {
                left: sourceBlock.position.x + sourceBlock.size.width,
                top: sourceBlock.position.y + sourceBlock.size.height / 2,
                width: targetBlock.position.x - sourceBlock.position.x - sourceBlock.size.width,
              },
            ]}
          />
        );
      })}

      {/* Render blocks */}
      {formula.blocks.map(block => {
        switch (block.type) {
          case 'indicator':
            return (
              <IndicatorBlock
                key={block.id}
                block={block}
                isSelected={selectedBlock === block.id}
                onSelect={() => setSelectedBlock(block.id)}
                onUpdate={(updates) => updateBlock(block.id, updates)}
                onDelete={() => deleteBlock(block.id)}
                readOnly={readOnly}
              />
            );
          case 'condition':
            return (
              <ConditionBlock
                key={block.id}
                block={block}
                isSelected={selectedBlock === block.id}
                onSelect={() => setSelectedBlock(block.id)}
                onUpdate={(updates) => updateBlock(block.id, updates)}
                onDelete={() => deleteBlock(block.id)}
                readOnly={readOnly}
              />
            );
          case 'action':
            return (
              <ActionBlock
                key={block.id}
                block={block}
                isSelected={selectedBlock === block.id}
                onSelect={() => setSelectedBlock(block.id)}
                onUpdate={(updates) => updateBlock(block.id, updates)}
                onDelete={() => deleteBlock(block.id)}
                readOnly={readOnly}
              />
            );
          default:
            return null;
        }
      })}

      {/* Render dragged block */}
      {draggedBlock && (
        <View
          style={[
            styles.draggedBlock,
            {
              left: dragPosition.x,
              top: dragPosition.y,
            },
          ]}
        >
          <Text style={styles.draggedBlockText}>{draggedBlock.metadata.label}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>{formula.name}</Text>
          <Text style={styles.subtitle}>{formula.blocks.length} blocks</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowPreview(true)}
          >
            <Ionicons name="eye" size={20} color={theme.colors.primary[500]} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => onSave?.(formula)}
          >
            <Ionicons name="save" size={20} color={theme.colors.primary[500]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Canvas */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        {renderCanvas()}
      </ScrollView>

      {/* Floating Action Button */}
      {!readOnly && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowBlockPalette(true)}
        >
          <Ionicons name="add" size={24} color={theme.colors.text.inverse} />
        </TouchableOpacity>
      )}

      {/* Block Palette */}
      {renderBlockPalette()}

      {/* Formula Preview */}
      <FormulaPreview
        visible={showPreview}
        formula={formula}
        onClose={() => setShowPreview(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  
  // Canvas styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    minWidth: screenWidth * 2,
    minHeight: screenHeight * 2,
  },
  canvas: {
    width: screenWidth * 2,
    height: screenHeight * 2,
    backgroundColor: theme.colors.background.secondary,
  },
  
  // Connection styles
  connection: {
    position: 'absolute',
    height: 2,
    backgroundColor: theme.colors.primary[500],
    zIndex: 1,
  },
  
  // Dragged block styles
  draggedBlock: {
    position: 'absolute',
    width: 200,
    height: 120,
    backgroundColor: theme.colors.primary[100],
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
    borderStyle: 'dashed',
    zIndex: 10,
  },
  draggedBlockText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary[700],
  },
  
  // FAB styles
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
    zIndex: 100,
  },
  
  // Palette styles
  paletteContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  paletteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  paletteTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  paletteContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  paletteSection: {
    marginTop: theme.spacing.lg,
  },
  paletteSectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  paletteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  paletteItemText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.md,
  },
});

export default BlockEditor;
