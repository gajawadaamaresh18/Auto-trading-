import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanGestureHandler,
  State,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { BlockProps, BlockData } from '../types/Block';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const Block: React.FC<BlockProps> = ({
  data,
  position,
  isSelected = false,
  isDragging = false,
  onPress,
  onLongPress,
  onDragStart,
  onDragEnd,
  onDrop,
  style,
}) => {
  const translateX = useSharedValue(position.x);
  const translateY = useSharedValue(position.y);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const getBlockColor = (type: string) => {
    switch (type) {
      case 'indicator':
        return colors.indicator;
      case 'condition':
        return colors.condition;
      case 'action':
        return colors.action;
      case 'parameter':
        return colors.parameter;
      default:
        return colors.primary;
    }
  };

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'indicator':
        return '📊';
      case 'condition':
        return '🔍';
      case 'action':
        return '⚡';
      case 'parameter':
        return '⚙️';
      default:
        return '📦';
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      scale.value = withSpring(1.1);
      opacity.value = withSpring(0.8);
      if (onDragStart) {
        runOnJS(onDragStart)(data.id);
      }
    },
    onActive: (event) => {
      translateX.value = position.x + event.translationX;
      translateY.value = position.y + event.translationY;
    },
    onEnd: (event) => {
      scale.value = withSpring(1);
      opacity.value = withSpring(1);
      
      const newPosition = {
        x: position.x + event.translationX,
        y: position.y + event.translationY,
      };
      
      if (onDragEnd) {
        runOnJS(onDragEnd)(data.id, newPosition);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const handlePress = () => {
    if (onPress) {
      onPress(data.id);
    }
  };

  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress(data.id);
    }
  };

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <AnimatedTouchableOpacity
        style={[animatedStyle, style]}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={500}
        activeOpacity={0.8}
      >
        <BlurView
          style={[
            styles.container,
            {
              borderColor: isSelected ? colors.primary : colors.glassBorder,
              backgroundColor: getBlockColor(data.type),
            },
          ]}
          blurType="light"
          blurAmount={10}
        >
          <View style={styles.header}>
            <Text style={styles.icon}>{getBlockIcon(data.type)}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {data.name}
            </Text>
          </View>
          
          {data.parameters && Object.keys(data.parameters).length > 0 && (
            <View style={styles.parameters}>
              {Object.entries(data.parameters).map(([key, value]) => (
                <Text key={key} style={styles.parameter}>
                  {key}: {String(value)}
                </Text>
              ))}
            </View>
          )}
          
          {isDragging && (
            <View style={styles.dragIndicator}>
              <Text style={styles.dragText}>Drag to move</Text>
            </View>
          )}
        </BlurView>
      </AnimatedTouchableOpacity>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 120,
    minHeight: 80,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  parameters: {
    marginTop: 4,
  },
  parameter: {
    fontSize: 12,
    color: colors.textInverse,
    opacity: 0.8,
    marginBottom: 2,
  },
  dragIndicator: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dragText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '500',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
});

export default Block;