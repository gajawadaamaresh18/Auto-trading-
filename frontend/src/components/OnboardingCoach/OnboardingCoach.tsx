/**
 * Onboarding Coach System
 * 
 * Comprehensive onboarding system with step-by-step guidance,
 * progress tracking, and interactive coach marks.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from '@react-native-community/blur';

import theme from '../theme';

// Types and Interfaces
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetComponent: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'tap' | 'swipe' | 'scroll' | 'none';
  highlight?: boolean;
  skipable?: boolean;
  order: number;
}

export interface OnboardingProgress {
  currentStep: number;
  completedSteps: string[];
  skippedSteps: string[];
  totalSteps: number;
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface OnboardingCoachProps {
  /** Whether onboarding is visible */
  visible: boolean;
  /** Current step */
  currentStep: number;
  /** Onboarding progress */
  progress: OnboardingProgress;
  /** Callback when step changes */
  onStepChange: (step: number) => void;
  /** Callback when onboarding completes */
  onComplete: () => void;
  /** Callback when onboarding is skipped */
  onSkip: () => void;
  /** Callback when step is completed */
  onStepComplete: (stepId: string) => void;
  /** Callback when step is skipped */
  onStepSkip: (stepId: string) => void;
  /** Additional styling */
  style?: any;
}

// Onboarding Steps Configuration
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to FormulaTrader',
    description: 'Let\'s take a quick tour of the key features that will help you succeed in algorithmic trading.',
    targetComponent: 'welcome',
    position: 'center',
    action: 'none',
    skipable: true,
    order: 1,
  },
  {
    id: 'marketplace',
    title: 'Formula Marketplace',
    description: 'Discover and subscribe to proven trading strategies created by expert traders.',
    targetComponent: 'marketplace',
    position: 'bottom',
    action: 'tap',
    highlight: true,
    skipable: true,
    order: 2,
  },
  {
    id: 'subscriptions',
    title: 'Manage Subscriptions',
    description: 'Subscribe to formulas you like and manage your active strategies here.',
    targetComponent: 'subscriptions',
    position: 'bottom',
    action: 'tap',
    highlight: true,
    skipable: true,
    order: 3,
  },
  {
    id: 'backtest',
    title: 'Run Backtests',
    description: 'Test formulas with historical data to see how they would have performed.',
    targetComponent: 'backtest',
    position: 'top',
    action: 'tap',
    highlight: true,
    skipable: true,
    order: 4,
  },
  {
    id: 'alerts',
    title: 'Set Alerts',
    description: 'Configure notifications to stay informed about trading opportunities.',
    targetComponent: 'alerts',
    position: 'left',
    action: 'tap',
    highlight: true,
    skipable: true,
    order: 5,
  },
  {
    id: 'risk',
    title: 'Manage Risk',
    description: 'Set stop-loss, take-profit, and position sizing to protect your capital.',
    targetComponent: 'risk',
    position: 'right',
    action: 'tap',
    highlight: true,
    skipable: true,
    order: 6,
  },
  {
    id: 'execution',
    title: 'Execute Trades',
    description: 'Place live trades or run in paper mode to practice without risk.',
    targetComponent: 'execution',
    position: 'bottom',
    action: 'tap',
    highlight: true,
    skipable: true,
    order: 7,
  },
  {
    id: 'notifications',
    title: 'Stay Informed',
    description: 'Receive real-time notifications about trades, alerts, and market updates.',
    targetComponent: 'notifications',
    position: 'top',
    action: 'tap',
    highlight: true,
    skipable: true,
    order: 8,
  },
];

// Main Onboarding Coach Component
const OnboardingCoach: React.FC<OnboardingCoachProps> = ({
  visible,
  currentStep,
  progress,
  onStepChange,
  onComplete,
  onSkip,
  onStepComplete,
  onStepSkip,
  style,
}) => {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [coachMarkVisible, setCoachMarkVisible] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const coachMarkScale = useRef(new Animated.Value(0)).current;
  const coachMarkOpacity = useRef(new Animated.Value(0)).current;

  const currentStepData = ONBOARDING_STEPS.find(step => step.order === currentStep);
  const isLastStep = currentStep === ONBOARDING_STEPS.length;
  const isFirstStep = currentStep === 1;

  // Show overlay and coach mark
  useEffect(() => {
    if (visible && currentStepData) {
      showCoachMark();
    } else {
      hideCoachMark();
    }
  }, [visible, currentStep]);

  const showCoachMark = useCallback(() => {
    setOverlayVisible(true);
    setCoachMarkVisible(true);
    
    // Animate overlay
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Animate coach mark
    Animated.parallel([
      Animated.timing(coachMarkScale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(coachMarkOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [overlayOpacity, coachMarkScale, coachMarkOpacity]);

  const hideCoachMark = useCallback(() => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(coachMarkScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(coachMarkOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setOverlayVisible(false);
      setCoachMarkVisible(false);
    });
  }, [overlayOpacity, coachMarkScale, coachMarkOpacity]);

  const handleNext = useCallback(() => {
    if (currentStepData) {
      onStepComplete(currentStepData.id);
    }
    
    if (isLastStep) {
      onComplete();
    } else {
      onStepChange(currentStep + 1);
    }
  }, [currentStep, currentStepData, isLastStep, onStepChange, onStepComplete, onComplete]);

  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
    }
  }, [currentStep, isFirstStep, onStepChange]);

  const handleSkip = useCallback(() => {
    if (currentStepData) {
      onStepSkip(currentStepData.id);
    }
    onSkip();
  }, [currentStepData, onStepSkip, onSkip]);

  const handleSkipStep = useCallback(() => {
    if (currentStepData) {
      onStepSkip(currentStepData.id);
    }
    handleNext();
  }, [currentStepData, onStepSkip, handleNext]);

  // Render progress indicator
  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            { width: `${(currentStep / ONBOARDING_STEPS.length) * 100}%` }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>
        {currentStep} of {ONBOARDING_STEPS.length}
      </Text>
    </View>
  );

  // Render coach mark
  const renderCoachMark = () => {
    if (!currentStepData || !coachMarkVisible) return null;

    return (
      <Animated.View
        style={[
          styles.coachMarkContainer,
          {
            opacity: coachMarkOpacity,
            transform: [{ scale: coachMarkScale }],
          },
        ]}
      >
        <View style={styles.coachMark}>
          <View style={styles.coachMarkHeader}>
            <Text style={styles.coachMarkTitle}>{currentStepData.title}</Text>
            {currentStepData.skipable && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkipStep}
              >
                <Ionicons name="close" size={16} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.coachMarkDescription}>
            {currentStepData.description}
          </Text>
          
          {currentStepData.action && currentStepData.action !== 'none' && (
            <View style={styles.actionHint}>
              <Ionicons 
                name={getActionIcon(currentStepData.action)} 
                size={16} 
                color={theme.colors.primary[500]} 
              />
              <Text style={styles.actionText}>
                {getActionText(currentStepData.action)}
              </Text>
            </View>
          )}
          
          <View style={styles.coachMarkFooter}>
            <View style={styles.navigationButtons}>
              {!isFirstStep && (
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={handlePrevious}
                >
                  <Ionicons name="chevron-back" size={20} color={theme.colors.primary[500]} />
                  <Text style={styles.navButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.navButton, styles.primaryNavButton]}
                onPress={handleNext}
              >
                <Text style={styles.primaryNavButtonText}>
                  {isLastStep ? 'Complete' : 'Next'}
                </Text>
                <Ionicons 
                  name={isLastStep ? "checkmark" : "chevron-forward"} 
                  size={20} 
                  color={theme.colors.text.inverse} 
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.skipAllButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipAllText}>Skip Tour</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  // Render overlay
  const renderOverlay = () => {
    if (!overlayVisible) return null;

    return (
      <Animated.View
        style={[
          styles.overlay,
          { opacity: overlayOpacity },
        ]}
      >
        <BlurView
          style={styles.blurView}
          blurType="dark"
          blurAmount={10}
        />
      </Animated.View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleSkip}
    >
      <View style={styles.container}>
        {renderOverlay()}
        {renderCoachMark()}
        {renderProgressIndicator()}
      </View>
    </Modal>
  );
};

// Helper functions
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  
  // Overlay styles
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  // Coach mark styles
  coachMarkContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -100 }],
    width: 300,
    zIndex: 1000,
  },
  coachMark: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  coachMarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  coachMarkTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  skipButton: {
    padding: theme.spacing.xs,
  },
  coachMarkDescription: {
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
  
  // Footer styles
  coachMarkFooter: {
    marginTop: theme.spacing.md,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
  },
  navButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[500],
    marginLeft: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  primaryNavButton: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  primaryNavButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.inverse,
    marginRight: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  skipAllButton: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  skipAllText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textDecorationLine: 'underline',
  },
  
  // Progress indicator styles
  progressContainer: {
    position: 'absolute',
    top: 60,
    left: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 1001,
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.neutral[200],
    borderRadius: 2,
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary[500],
    borderRadius: 2,
  },
  progressText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default OnboardingCoach;
