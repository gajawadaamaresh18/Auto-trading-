import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Block, IndicatorBlock, BlockEditor } from '../Block';
import { Formula, Block as BlockType, BlockPosition, BlockConnection } from '../../types';
import { indicatorCatalog, getCategories } from '../../data/indicatorCatalog';
import { FormulaPreview } from './FormulaPreview';
import { BlockPalette } from './BlockPalette';
import { ConnectionCanvas } from './ConnectionCanvas';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FormulaStudioProps {
  initialFormula?: Formula;
  onFormulaChange?: (formula: Formula) => void;
  onSave?: (formula: Formula) => void;
}

export const FormulaStudio: React.FC<FormulaStudioProps> = ({
  initialFormula,
  onFormulaChange,
  onSave,
}) => {
  const [formula, setFormula] = useState<Formula>(
    initialFormula || {
      id: 'new-formula',
      name: 'Untitled Formula',
      description: 'A new trading strategy',
      blocks: [],
      connections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  );
  
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isPaletteVisible, setIsPaletteVisible] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const canvasRef = useRef<View>(null);

  const updateFormula = useCallback((updates: Partial<Formula>) => {
    const updatedFormula = {
      ...formula,
      ...updates,
      updatedAt: new Date(),
    };
    setFormula(updatedFormula);
    onFormulaChange?.(updatedFormula);
  }, [formula, onFormulaChange]);

  const addBlock = useCallback((blockType: string, indicatorId?: string) => {
    const newBlock: BlockType = {
      id: `block-${Date.now()}`,
      type: blockType as any,
      category: 'Custom',
      name: `New ${blockType}`,
      description: `A new ${blockType} block`,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 120 },
      parameters: [],
      ports: [],
      isSelected: false,
      isDragging: false,
    };

    if (blockType === 'indicator' && indicatorId) {
      const indicatorDef = indicatorCatalog.find(ind => ind.id === indicatorId);
      if (indicatorDef) {
        (newBlock as any).indicatorType = indicatorId;
        newBlock.name = indicatorDef.name;
        newBlock.description = indicatorDef.description;
        newBlock.parameters = indicatorDef.inputs.map(input => ({
          id: `param-${input.name}`,
          name: input.name,
          type: input.type,
          value: input.default,
          min: input.min,
          max: input.max,
          step: input.step,
        }));
        newBlock.ports = [
          ...indicatorDef.inputs.map(input => ({
            id: `input-${input.name}`,
            name: input.name,
            type: 'input' as const,
            dataType: input.type as any,
            required: true,
          })),
          ...indicatorDef.outputs.map(output => ({
            id: `output-${output.name}`,
            name: output.name,
            type: 'output' as const,
            dataType: output.type as any,
          })),
        ];
      }
    }

    updateFormula({
      blocks: [...formula.blocks, newBlock],
    });
    setIsPaletteVisible(false);
  }, [formula.blocks, updateFormula]);

  const moveBlock = useCallback((blockId: string, position: BlockPosition) => {
    updateFormula({
      blocks: formula.blocks.map(block =>
        block.id === blockId ? { ...block, position } : block
      ),
    });
  }, [formula.blocks, updateFormula]);

  const selectBlock = useCallback((blockId: string) => {
    setSelectedBlockId(blockId);
    updateFormula({
      blocks: formula.blocks.map(block => ({
        ...block,
        isSelected: block.id === blockId,
      })),
    });
  }, [formula.blocks, updateFormula]);

  const pressBlock = useCallback((blockId: string) => {
    setEditingBlockId(blockId);
  }, []);

  const updateBlockParameters = useCallback((blockId: string, parameters: any[]) => {
    updateFormula({
      blocks: formula.blocks.map(block =>
        block.id === blockId ? { ...block, parameters } : block
      ),
    });
  }, [formula.blocks, updateFormula]);

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
            updateFormula({
              blocks: formula.blocks.filter(block => block.id !== blockId),
              connections: formula.connections.filter(
                conn => conn.fromBlockId !== blockId && conn.toBlockId !== blockId
              ),
            });
            setSelectedBlockId(null);
          },
        },
      ]
    );
  }, [formula.blocks, formula.connections, updateFormula]);

  const addConnection = useCallback((connection: BlockConnection) => {
    // Check if connection already exists
    const exists = formula.connections.some(
      conn => conn.fromBlockId === connection.fromBlockId && 
               conn.toBlockId === connection.toBlockId &&
               conn.fromPort === connection.fromPort &&
               conn.toPort === connection.toPort
    );
    
    if (!exists) {
      updateFormula({
        connections: [...formula.connections, connection],
      });
    }
  }, [formula.connections, updateFormula]);

  const deleteConnection = useCallback((connectionId: string) => {
    updateFormula({
      connections: formula.connections.filter(conn => conn.id !== connectionId),
    });
  }, [formula.connections, updateFormula]);

  const renderBlock = (block: BlockType) => {
    if (block.type === 'indicator') {
      return (
        <IndicatorBlock
          key={block.id}
          block={block as any}
          onMove={moveBlock}
          onSelect={selectBlock}
          onPress={pressBlock}
          isSelected={block.isSelected}
        />
      );
    }

    return (
      <Block
        key={block.id}
        block={block}
        onMove={moveBlock}
        onSelect={selectBlock}
        onPress={pressBlock}
        isSelected={block.isSelected}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setIsPaletteVisible(true)}
        >
          <Text style={styles.headerButtonText}>+ Add Block</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>{formula.name}</Text>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setIsPreviewVisible(true)}
        >
          <Text style={styles.headerButtonText}>Preview</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.canvasContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          <View ref={canvasRef} style={styles.canvas}>
            <ConnectionCanvas
              connections={formula.connections}
              blocks={formula.blocks}
            />
            {formula.blocks.map(renderBlock)}
          </View>
        </ScrollView>
      </View>

      <BlockPalette
        isVisible={isPaletteVisible}
        onClose={() => setIsPaletteVisible(false)}
        onAddBlock={addBlock}
      />

      <FormulaPreview
        formula={formula}
        isVisible={isPreviewVisible}
        onClose={() => setIsPreviewVisible(false)}
      />

      <BlockEditor
        block={formula.blocks.find(b => b.id === editingBlockId) || null}
        isVisible={!!editingBlockId}
        onClose={() => setEditingBlockId(null)}
        onSave={updateBlockParameters}
      />
    </SafeAreaView>
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
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  canvasContainer: {
    flex: 1,
  },
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
    position: 'relative',
  },
});