import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Block as BlockType, BlockPosition } from '../../types';

interface BlockProps {
  block: BlockType;
  onMove: (blockId: string, position: BlockPosition) => void;
  onSelect: (blockId: string) => void;
  onPress: (blockId: string) => void;
  isSelected: boolean;
  children?: React.ReactNode;
}

const { width: screenWidth } = Dimensions.get('window');

export const Block: React.FC<BlockProps> = ({
  block,
  onMove,
  onSelect,
  onPress,
  isSelected,
  children,
}) => {
  const translateX = useRef(new Animated.Value(block.position.x)).current;
  const translateY = useRef(new Animated.Value(block.position.y)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [isDragging, setIsDragging] = useState(false);

  const getBlockStyle = () => {
    const baseStyle = {
      ...styles.block,
      width: block.size.width,
      height: block.size.height,
      backgroundColor: getBlockColor(block.type),
      borderColor: isSelected ? '#007AFF' : '#E5E5EA',
      borderWidth: isSelected ? 2 : 1,
      shadowOpacity: isDragging ? 0.3 : 0.1,
      shadowRadius: isDragging ? 8 : 4,
      elevation: isDragging ? 8 : 4,
    };

    return baseStyle;
  };

  const getBlockColor = (type: string) => {
    switch (type) {
      case 'indicator':
        return '#F2F2F7';
      case 'signal':
        return '#E8F5E8';
      case 'condition':
        return '#FFF3E0';
      case 'action':
        return '#FFEBEE';
      case 'group':
        return '#F3E5F5';
      default:
        return '#F2F2F7';
    }
  };

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'indicator':
        return '📊';
      case 'signal':
        return '⚡';
      case 'condition':
        return '🔗';
      case 'action':
        return '🎯';
      case 'group':
        return '📁';
      default:
        return '📦';
    }
  };

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === 5) { // BEGAN
      setIsDragging(true);
      onSelect(block.id);
      Animated.spring(scale, {
        toValue: 1.05,
        useNativeDriver: true,
      }).start();
    } else if (event.nativeEvent.state === 3) { // END
      setIsDragging(false);
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      const newPosition = {
        x: Math.max(0, Math.min(screenWidth - block.size.width, block.position.x + event.nativeEvent.translationX)),
        y: Math.max(0, block.position.y + event.nativeEvent.translationY),
      };

      onMove(block.id, newPosition);
      
      translateX.setValue(0);
      translateY.setValue(0);
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          getBlockStyle(),
          {
            transform: [
              { translateX },
              { translateY },
              { scale },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.blockContent}
          onPress={() => onPress(block.id)}
          activeOpacity={0.7}
        >
          <View style={styles.blockHeader}>
            <Text style={styles.blockIcon}>{getBlockIcon(block.type)}</Text>
            <Text style={styles.blockTitle} numberOfLines={1}>
              {block.name}
            </Text>
          </View>
          
          <Text style={styles.blockDescription} numberOfLines={2}>
            {block.description}
          </Text>

          {block.parameters && block.parameters.length > 0 && (
            <View style={styles.parametersContainer}>
              {block.parameters.slice(0, 2).map((param) => (
                <View key={param.id} style={styles.parameterItem}>
                  <Text style={styles.parameterName}>{param.name}:</Text>
                  <Text style={styles.parameterValue}>
                    {typeof param.value === 'boolean' 
                      ? param.value ? 'Yes' : 'No'
                      : String(param.value)
                    }
                  </Text>
                </View>
              ))}
              {block.parameters.length > 2 && (
                <Text style={styles.moreParameters}>
                  +{block.parameters.length - 2} more
                </Text>
              )}
            </View>
          )}

          {children}
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  blockContent: {
    flex: 1,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  blockIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  blockDescription: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
    marginBottom: 8,
  },
  parametersContainer: {
    marginTop: 4,
  },
  parameterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  parameterName: {
    fontSize: 11,
    color: '#6D6D70',
    fontWeight: '500',
  },
  parameterValue: {
    fontSize: 11,
    color: '#1C1C1E',
    fontWeight: '400',
  },
  moreParameters: {
    fontSize: 10,
    color: '#8E8E93',
    fontStyle: 'italic',
    marginTop: 2,
  },
});