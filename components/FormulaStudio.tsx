import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { colors } from '../theme/colors';
import { BlockData, BlockPosition } from '../types/Block';
import Block from './Block';
import BlockGroup from './BlockGroup';
import IndicatorBlock from './IndicatorBlock';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FormulaStudioProps {
  initialBlocks?: BlockData[];
  onFormulaChange?: (formula: BlockData[]) => void;
  onExport?: (json: string) => void;
  style?: any;
}

const FormulaStudio: React.FC<FormulaStudioProps> = ({
  initialBlocks = [],
  onFormulaChange,
  onExport,
  style,
}) => {
  const [blocks, setBlocks] = useState<BlockData[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showExport, setShowExport] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const nextIdRef = useRef(1);

  const generateId = () => `block_${nextIdRef.current++}`;

  const handleAddBlock = useCallback((type: string, position?: BlockPosition) => {
    const newBlock: BlockData = {
      id: generateId(),
      type: type as any,
      name: `New ${type}`,
      parameters: {},
      children: [],
    };

    const newPosition = position || {
      x: Math.random() * (screenWidth - 200),
      y: Math.random() * (screenHeight - 200),
    };

    setBlocks(prev => [...prev, { ...newBlock, position: newPosition }]);
    
    if (onFormulaChange) {
      onFormulaChange([...blocks, { ...newBlock, position: newPosition }]);
    }
  }, [blocks, onFormulaChange]);

  const handleBlockPress = useCallback((blockId: string) => {
    setSelectedBlockId(blockId);
  }, []);

  const handleBlockLongPress = useCallback((blockId: string) => {
    setSelectedBlockId(blockId);
    // Show context menu or edit modal
  }, []);

  const handleBlockDragStart = useCallback((blockId: string) => {
    setDraggedBlockId(blockId);
  }, []);

  const handleBlockDragEnd = useCallback((blockId: string, newPosition: BlockPosition) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, position: newPosition }
        : block
    ));
    setDraggedBlockId(null);
    
    if (onFormulaChange) {
      onFormulaChange(blocks.map(block => 
        block.id === blockId 
          ? { ...block, position: newPosition }
          : block
      ));
    }
  }, [blocks, onFormulaChange]);

  const handleBlockDrop = useCallback((blockId: string, targetId: string) => {
    // Handle dropping one block onto another
    setBlocks(prev => {
      const updatedBlocks = [...prev];
      const blockIndex = updatedBlocks.findIndex(b => b.id === blockId);
      const targetIndex = updatedBlocks.findIndex(b => b.id === targetId);
      
      if (blockIndex !== -1 && targetIndex !== -1) {
        // Move block to be child of target
        const block = updatedBlocks[blockIndex];
        const target = updatedBlocks[targetIndex];
        
        updatedBlocks[blockIndex] = { ...block, parentId: targetId };
        updatedBlocks[targetIndex] = { 
          ...target, 
          children: [...(target.children || []), block] 
        };
      }
      
      return updatedBlocks;
    });
  }, []);

  const handleRemoveBlock = useCallback((blockId: string) => {
    Alert.alert(
      'Remove Block',
      'Are you sure you want to remove this block?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setBlocks(prev => prev.filter(block => block.id !== blockId));
            if (selectedBlockId === blockId) {
              setSelectedBlockId(null);
            }
          },
        },
      ]
    );
  }, [selectedBlockId]);

  const handleUpdateBlock = useCallback((blockId: string, data: Partial<BlockData>) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, ...data }
        : block
    ));
    
    if (onFormulaChange) {
      onFormulaChange(blocks.map(block => 
        block.id === blockId 
          ? { ...block, ...data }
          : block
      ));
    }
  }, [blocks, onFormulaChange]);

  const generatePlainEnglishPreview = useCallback(() => {
    const generateBlockDescription = (block: BlockData, depth = 0): string => {
      const indent = '  '.repeat(depth);
      let description = `${indent}${block.name}`;
      
      if (block.parameters && Object.keys(block.parameters).length > 0) {
        const params = Object.entries(block.parameters)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        description += ` (${params})`;
      }
      
      if (block.children && block.children.length > 0) {
        description += ':\n';
        description += block.children
          .map(child => generateBlockDescription(child, depth + 1))
          .join('\n');
      }
      
      return description;
    };

    return blocks.map(block => generateBlockDescription(block)).join('\n\n');
  }, [blocks]);

  const exportToJSON = useCallback(() => {
    const json = JSON.stringify(blocks, null, 2);
    
    if (onExport) {
      onExport(json);
    } else {
      Share.share({
        message: json,
        title: 'Formula Export',
      });
    }
    
    setShowExport(false);
  }, [blocks, onExport]);

  const renderBlock = (block: BlockData) => {
    const position = block.position || { x: 0, y: 0 };
    const isSelected = selectedBlockId === block.id;
    const isDragging = draggedBlockId === block.id;

    if (block.type === 'indicator') {
      return (
        <IndicatorBlock
          key={block.id}
          data={block}
          position={position}
          isSelected={isSelected}
          isDragging={isDragging}
          onPress={() => handleBlockPress(block.id)}
          onLongPress={() => handleBlockLongPress(block.id)}
          onDragStart={() => handleBlockDragStart(block.id)}
          onDragEnd={(blockId, newPosition) => handleBlockDragEnd(blockId, newPosition)}
          onDrop={(blockId, targetId) => handleBlockDrop(blockId, targetId)}
          onUpdate={(blockId, data) => handleUpdateBlock(blockId, data)}
        />
      );
    }

    if (block.children && block.children.length > 0) {
      return (
        <BlockGroup
          key={block.id}
          data={block}
          children={block.children}
          position={position}
          isSelected={isSelected}
          onBlockPress={handleBlockPress}
          onBlockLongPress={handleBlockLongPress}
          onBlockDragStart={handleBlockDragStart}
          onBlockDragEnd={handleBlockDragEnd}
          onBlockDrop={handleBlockDrop}
          onAddBlock={(parentId, blockType) => handleAddBlock(blockType)}
          onRemoveBlock={handleRemoveBlock}
        />
      );
    }

    return (
      <Block
        key={block.id}
        data={block}
        position={position}
        isSelected={isSelected}
        isDragging={isDragging}
        onPress={() => handleBlockPress(block.id)}
        onLongPress={() => handleBlockLongPress(block.id)}
        onDragStart={() => handleBlockDragStart(block.id)}
        onDragEnd={(blockId, newPosition) => handleBlockDragEnd(blockId, newPosition)}
        onDrop={(blockId, targetId) => handleBlockDrop(blockId, targetId)}
      />
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <BlurView style={styles.header} blurType="light" blurAmount={10}>
        <Text style={styles.title}>FormulaStudio</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowPreview(!showPreview)}
          >
            <Text style={styles.headerButtonText}>
              {showPreview ? 'Hide' : 'Show'} Preview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowExport(true)}
          >
            <Text style={styles.headerButtonText}>Export</Text>
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* Canvas */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.canvas}
        contentContainerStyle={styles.canvasContent}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {/* Drop Zone */}
        <View style={styles.dropZone}>
          <Text style={styles.dropZoneText}>
            Drag blocks here to build your strategy
          </Text>
        </View>

        {/* Blocks */}
        {blocks.map(renderBlock)}

        {/* Add Block Buttons */}
        <View style={styles.addBlockContainer}>
          <Text style={styles.addBlockTitle}>Add Block</Text>
          <View style={styles.addBlockButtons}>
            {['indicator', 'condition', 'action', 'parameter'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.addBlockButton, { backgroundColor: colors[type as keyof typeof colors] }]}
                onPress={() => handleAddBlock(type)}
              >
                <Text style={styles.addBlockText}>
                  {type === 'indicator' ? '📊' : 
                   type === 'condition' ? '🔍' :
                   type === 'action' ? '⚡' : '⚙️'}
                </Text>
                <Text style={styles.addBlockLabel}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Preview Modal */}
      {showPreview && (
        <View style={styles.previewOverlay}>
          <BlurView style={styles.previewContainer} blurType="light" blurAmount={10}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Plain English Preview</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPreview(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.previewContent}>
              <Text style={styles.previewText}>
                {generatePlainEnglishPreview() || 'No blocks added yet'}
              </Text>
            </ScrollView>
          </BlurView>
        </View>
      )}

      {/* Export Modal */}
      {showExport && (
        <View style={styles.exportOverlay}>
          <BlurView style={styles.exportContainer} blurType="light" blurAmount={10}>
            <View style={styles.exportHeader}>
              <Text style={styles.exportTitle}>Export Formula</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowExport(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.exportContent}>
              <Text style={styles.exportText}>
                {JSON.stringify(blocks, null, 2)}
              </Text>
            </ScrollView>
            <View style={styles.exportFooter}>
              <TouchableOpacity
                style={styles.exportButton}
                onPress={exportToJSON}
              >
                <Text style={styles.exportButtonText}>Export JSON</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textInverse,
  },
  canvas: {
    flex: 1,
  },
  canvasContent: {
    minHeight: screenHeight,
    padding: 20,
  },
  dropZone: {
    height: 100,
    backgroundColor: colors.dropZone,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dropZoneText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  addBlockContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  addBlockTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  addBlockButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  addBlockButton: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addBlockText: {
    fontSize: 24,
    marginBottom: 4,
  },
  addBlockLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textInverse,
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  previewContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  previewTitle: {
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
  previewContent: {
    flex: 1,
    padding: 20,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    fontFamily: 'monospace',
  },
  exportOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  exportContainer: {
    width: '90%',
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  exportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  exportContent: {
    flex: 1,
    padding: 20,
  },
  exportText: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.text,
    fontFamily: 'monospace',
  },
  exportFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
  },
  exportButton: {
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textInverse,
  },
});

export default FormulaStudio;