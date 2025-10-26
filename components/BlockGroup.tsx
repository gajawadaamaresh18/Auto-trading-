import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { BlockGroupProps, BlockData } from '../types/Block';
import Block from './Block';

const { width: screenWidth } = Dimensions.get('window');

const BlockGroup: React.FC<BlockGroupProps> = ({
  data,
  children,
  position,
  isSelected = false,
  onBlockPress,
  onBlockLongPress,
  onBlockDragStart,
  onBlockDragEnd,
  onBlockDrop,
  onAddBlock,
  onRemoveBlock,
  style,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);
  
  const scale = useSharedValue(1);
  const height = useSharedValue(isExpanded ? 200 : 60);

  const getGroupTypeColor = (type: string) => {
    switch (type) {
      case 'condition':
        return colors.condition;
      case 'action':
        return colors.action;
      default:
        return colors.primary;
    }
  };

  const getGroupIcon = (type: string) => {
    switch (type) {
      case 'condition':
        return '🔍';
      case 'action':
        return '⚡';
      default:
        return '📦';
    }
  };

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
    height.value = withSpring(isExpanded ? 60 : 200);
  };

  const handleBlockPress = (blockId: string) => {
    if (onBlockPress) {
      onBlockPress(blockId);
    }
  };

  const handleBlockLongPress = (blockId: string) => {
    if (onBlockLongPress) {
      onBlockLongPress(blockId);
    }
  };

  const handleBlockDragStart = (blockId: string) => {
    if (onBlockDragStart) {
      onBlockDragStart(blockId);
    }
  };

  const handleBlockDragEnd = (blockId: string, newPosition: any) => {
    if (onBlockDragEnd) {
      onBlockDragEnd(blockId, newPosition);
    }
  };

  const handleBlockDrop = (blockId: string, targetId: string) => {
    if (onBlockDrop) {
      onBlockDrop(blockId, targetId);
    }
  };

  const handleAddBlock = (blockType: string) => {
    if (onAddBlock) {
      onAddBlock(data.id, blockType);
    }
  };

  const handleRemoveBlock = (blockId: string) => {
    if (onRemoveBlock) {
      onRemoveBlock(blockId);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      height: height.value,
    };
  });

  return (
    <Animated.View style={[styles.container, { left: position.x, top: position.y }, style]}>
      <BlurView
        style={[
          styles.groupContainer,
          {
            borderColor: isSelected ? colors.primary : colors.glassBorder,
            backgroundColor: getGroupTypeColor(data.type),
          },
        ]}
        blurType="light"
        blurAmount={10}
      >
        {/* Group Header */}
        <TouchableOpacity
          style={styles.header}
          onPress={handleToggleExpanded}
          activeOpacity={0.8}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.icon}>{getGroupIcon(data.type)}</Text>
            <Text style={styles.name}>{data.name}</Text>
            <Text style={styles.count}>({children.length})</Text>
          </View>
          <Text style={styles.expandIcon}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>

        {/* Group Content */}
        {isExpanded && (
          <View style={styles.content}>
            {/* Add Block Buttons */}
            <View style={styles.addBlockContainer}>
              <Text style={styles.addBlockLabel}>Add Block:</Text>
              <View style={styles.addBlockButtons}>
                {['indicator', 'condition', 'action', 'parameter'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.addBlockButton, { backgroundColor: getGroupTypeColor(type) }]}
                    onPress={() => handleAddBlock(type)}
                  >
                    <Text style={styles.addBlockText}>
                      {type === 'indicator' ? '📊' : 
                       type === 'condition' ? '🔍' :
                       type === 'action' ? '⚡' : '⚙️'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Blocks Grid */}
            <View style={styles.blocksContainer}>
              {children.map((child, index) => (
                <View key={child.id} style={styles.blockWrapper}>
                  <Block
                    data={child}
                    position={{ x: 0, y: 0 }}
                    isSelected={false}
                    onPress={() => handleBlockPress(child.id)}
                    onLongPress={() => handleBlockLongPress(child.id)}
                    onDragStart={() => handleBlockDragStart(child.id)}
                    onDragEnd={(blockId, newPosition) => handleBlockDragEnd(blockId, newPosition)}
                    onDrop={(blockId, targetId) => handleBlockDrop(blockId, targetId)}
                    style={styles.block}
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveBlock(child.id)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    minWidth: 200,
    zIndex: 1,
  },
  groupContainer: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textInverse,
    flex: 1,
  },
  count: {
    fontSize: 12,
    color: colors.textInverse,
    opacity: 0.7,
    marginLeft: 8,
  },
  expandIcon: {
    fontSize: 12,
    color: colors.textInverse,
    opacity: 0.7,
  },
  content: {
    padding: 12,
  },
  addBlockContainer: {
    marginBottom: 12,
  },
  addBlockLabel: {
    fontSize: 12,
    color: colors.textInverse,
    opacity: 0.8,
    marginBottom: 8,
  },
  addBlockButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addBlockButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBlockText: {
    fontSize: 14,
  },
  blocksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  blockWrapper: {
    position: 'relative',
  },
  block: {
    margin: 0,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  removeButtonText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default BlockGroup;