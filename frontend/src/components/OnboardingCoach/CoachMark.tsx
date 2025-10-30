/**
 * Onboarding Coach Mark Component
 * 
 * Individual coach mark component for highlighting specific UI elements.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import theme from '../theme';

// Types and Interfaces
export interface CoachMarkProps {
  /** Whether coach mark is visible */
  visible: boolean;
  /** Target element position */
  targetPosition: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** Coach mark position relative to target */
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** Coach mark content */
  title: string;
  description: string;
  /** Action hint */
  action?: 'tap' | 'swipe' | 'scroll' | 'none';
  /** Whether to show highlight overlay */
  highlight?: boolean;
  /** Callback when coach mark is dismissed */
  onDismiss: () => void;
  /** Callback when coach mark is completed */
  onComplete: () => void;
  /** Additional styling */
  style?: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Main Coach Mark Component
const CoachMark: React.FC<CoachMarkProps> = ({
  visible,
  targetPosition,
  position,
  title,
  description,
  action = 'none',
  highlight = true,
  onDismiss,
  onComplete,
  style,
}) => {
  const [coachMarkPosition, setCoachMarkPosition] = useState({ x: 0, y: 0 });
  const [arrowPosition, setArrowPosition] = useState({ x: 0, y: 0 });
  const [arrowRotation, setArrowRotation] = useState(0);
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Calculate coach mark position
  useEffect(() => {
    if (visible) {
      calculatePosition();
      animateIn();
    } else {
      animateOut();
    }
  }, [visible, targetPosition, position]);

  const calculatePosition = () => {
    const { x, y, width, height } = targetPosition;
    const coachMarkWidth = 280;
    const coachMarkHeight = 200;
    const margin = 20;
    
    let coachX = 0;
    let coachY = 0;
    let arrowX = 0;
    let arrowY = 0;
    let rotation = 0;

    switch (position) {
      case 'top':
        coachX = x + (width - coachMarkWidth) / 2;
        coachY = y - coachMarkHeight - margin;
        arrowX = x + width / 2;
        arrowY = y - margin;
        rotation = 180;
        break;
        
      case 'bottom':
        coachX = x + (width - coachMarkWidth) / 2;
        coachY = y + height + margin;
        arrowX = x + width / 2;
        arrowY = y + height + margin;
        rotation = 0;
        break;
        
      case 'left':
        coachX = x - coachMarkWidth - margin;
        coachY = y + (height - coachMarkHeight) / 2;
        arrowX = x - margin;
        arrowY = y + height / 2;
        rotation = 90;
        break;
        
      case 'right':
        coachX = x + width + margin;
        coachY = y + (height - coachMarkHeight) / 2;
        arrowX = x + width + margin;
        arrowY = y + height / 2;
        rotation = -90;
        break;
        
      case 'center':
        coachX = (screenWidth - coachMarkWidth) / 2;
        coachY = (screenHeight - coachMarkHeight) / 2;
        arrowX = 0;
        arrowY = 0;
        rotation = 0;
        break;
    }

    // Ensure coach mark stays within screen bounds
    coachX = Math.max(margin, Math.min(coachX, screenWidth - coachMarkWidth - margin));
    coachY = Math.max(margin, Math.min(coachY, screenHeight - coachMarkHeight - margin));

    setCoachMarkPosition({ x: coachX, y: coachY });
    setArrowPosition({ x: arrowX, y: arrowY });
    setArrowRotation(rotation);
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation
    startPulseAnimation();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'tap': return 'hand-left';
      case 'swipe': return 'swap-horizontal';
      case 'scroll': return 'chevron-up';
      default: return 'arrow-forward';
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'tap': return 'Tap to continue';
      case 'swipe': return 'Swipe to explore';
      case 'scroll': return 'Scroll to see more';
      default: return 'Continue';
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Highlight overlay */}
      {highlight && (
        <Animated.View
          style={[
            styles.highlightOverlay,
            {
              left: targetPosition.x - 10,
              top: targetPosition.y - 10,
              width: targetPosition.width + 20,
              height: targetPosition.height + 20,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      )}

      {/* Coach mark */}
      <Animated.View
        style={[
          styles.coachMark,
          {
            left: coachMarkPosition.x,
            top: coachMarkPosition.y,
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
          style,
        ]}
      >
        {/* Arrow */}
        {position !== 'center' && (
          <View
            style={[
              styles.arrow,
              {
                left: arrowPosition.x - coachMarkPosition.x,
                top: arrowPosition.y - coachMarkPosition.y,
                transform: [{ rotate: `${arrowRotation}deg` }],
              },
            ]}
          />
        )}

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onDismiss}
            >
              <Ionicons name="close" size={16} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.description}>{description}</Text>
          
          {action && action !== 'none' && (
            <View style={styles.actionHint}>
              <Ionicons 
                name={getActionIcon(action) as any} 
                size={16} 
                color={theme.colors.primary[500]} 
              />
              <Text style={styles.actionText}>
                {getActionText(action)}
              </Text>
            </View>
          )}
          
          <TouchableOpacity
            style={styles.completeButton}
            onPress={onComplete}
          >
            <Text style={styles.completeButtonText}>Got it!</Text>
            <Ionicons name="checkmark" size={16} color={theme.colors.text.inverse} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  
  // Highlight overlay styles
  highlightOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
    borderStyle: 'dashed',
  },
  
  // Coach mark styles
  coachMark: {
    position: 'absolute',
    width: 280,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  
  // Arrow styles
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: theme.colors.background.card,
  },
  
  // Content styles
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    marginBottom: theme.spacing.md,
  },
  
  // Action hint styles
  actionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  actionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[600],
    marginLeft: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  // Complete button styles
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[500],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  completeButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.inverse,
    marginRight: theme.spacing.sm,
  },
});

export default CoachMark;
