import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Modal,
  PanResponder,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useOnboarding } from '../../state/onboardingContext';
import { OnboardingStep } from '../../types/onboarding';
import { ONBOARDING_STEPS } from '../../constants/onboardingSteps';

interface OnboardingCoachProps {
  children: React.ReactNode;
  targetComponent?: string;
  onStepComplete?: (stepId: string) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const OnboardingCoach: React.FC<OnboardingCoachProps> = ({
  children,
  targetComponent,
  onStepComplete,
}) => {
  const { state, nextStep, previousStep, skipStep, completeStep } = useOnboarding();
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [tooltipScale] = useState(new Animated.Value(0));
  const [highlightPosition, setHighlightPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const targetRef = useRef<View>(null);

  const currentStep = state.currentStep;

  useEffect(() => {
    if (currentStep && targetComponent === currentStep.targetComponent) {
      setIsVisible(true);
      measureTarget();
      animateIn();
    } else {
      setIsVisible(false);
    }
  }, [currentStep, targetComponent]);

  const measureTarget = () => {
    if (targetRef.current) {
      targetRef.current.measureInWindow((x, y, width, height) => {
        setHighlightPosition({ x, y, width, height });
      });
    }
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(tooltipScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(tooltipScale, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  const handleNext = () => {
    if (currentStep) {
      completeStep(currentStep.id);
      onStepComplete?.(currentStep.id);
    }
    animateOut(() => {
      nextStep();
    });
  };

  const handleSkip = () => {
    if (currentStep) {
      skipStep(currentStep.id);
    }
    animateOut(() => {
      nextStep();
    });
  };

  const handlePrevious = () => {
    animateOut(() => {
      previousStep();
    });
  };

  const getTooltipPosition = () => {
    if (!currentStep) return { top: 0, left: 0 };

    const { position, arrowDirection } = currentStep;
    const { x, y, width, height } = highlightPosition;
    const tooltipWidth = screenWidth * 0.8;
    const tooltipHeight = 120;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = y - tooltipHeight - 20;
        left = x + (width - tooltipWidth) / 2;
        break;
      case 'bottom':
        top = y + height + 20;
        left = x + (width - tooltipWidth) / 2;
        break;
      case 'left':
        top = y + (height - tooltipHeight) / 2;
        left = x - tooltipWidth - 20;
        break;
      case 'right':
        top = y + (height - tooltipHeight) / 2;
        left = x + width + 20;
        break;
      case 'center':
        top = screenHeight / 2 - tooltipHeight / 2;
        left = (screenWidth - tooltipWidth) / 2;
        break;
    }

    return { top: Math.max(0, top), left: Math.max(0, left) };
  };

  const getArrowStyle = () => {
    if (!currentStep) return {};

    const { arrowDirection } = currentStep;
    const { x, y, width, height } = highlightPosition;

    const arrowSize = 10;
    let arrowStyle: any = {
      position: 'absolute',
      width: 0,
      height: 0,
    };

    switch (arrowDirection) {
      case 'up':
        arrowStyle.borderLeftWidth = arrowSize;
        arrowStyle.borderRightWidth = arrowSize;
        arrowStyle.borderBottomWidth = arrowSize;
        arrowStyle.borderLeftColor = 'transparent';
        arrowStyle.borderRightColor = 'transparent';
        arrowStyle.borderBottomColor = '#fff';
        arrowStyle.top = -arrowSize;
        arrowStyle.left = x + width / 2 - arrowSize;
        break;
      case 'down':
        arrowStyle.borderLeftWidth = arrowSize;
        arrowStyle.borderRightWidth = arrowSize;
        arrowStyle.borderTopWidth = arrowSize;
        arrowStyle.borderLeftColor = 'transparent';
        arrowStyle.borderRightColor = 'transparent';
        arrowStyle.borderTopColor = '#fff';
        arrowStyle.bottom = -arrowSize;
        arrowStyle.left = x + width / 2 - arrowSize;
        break;
      case 'left':
        arrowStyle.borderTopWidth = arrowSize;
        arrowStyle.borderBottomWidth = arrowSize;
        arrowStyle.borderRightWidth = arrowSize;
        arrowStyle.borderTopColor = 'transparent';
        arrowStyle.borderBottomColor = 'transparent';
        arrowStyle.borderRightColor = '#fff';
        arrowStyle.left = -arrowSize;
        arrowStyle.top = y + height / 2 - arrowSize;
        break;
      case 'right':
        arrowStyle.borderTopWidth = arrowSize;
        arrowStyle.borderBottomWidth = arrowSize;
        arrowStyle.borderLeftWidth = arrowSize;
        arrowStyle.borderTopColor = 'transparent';
        arrowStyle.borderBottomColor = 'transparent';
        arrowStyle.borderLeftColor = '#fff';
        arrowStyle.right = -arrowSize;
        arrowStyle.top = y + height / 2 - arrowSize;
        break;
    }

    return arrowStyle;
  };

  if (!isVisible || !currentStep) {
    return <>{children}</>;
  }

  const tooltipPosition = getTooltipPosition();
  const arrowStyle = getArrowStyle();
  const progress = ((currentStep.order + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <>
      <View ref={targetRef} style={styles.targetContainer}>
        {children}
      </View>

      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={handleSkip}
      >
        <StatusBar backgroundColor="rgba(0,0,0,0.7)" barStyle="light-content" />
        
        {/* Overlay */}
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        >
          {/* Highlighted area */}
          {currentStep.highlight && (
            <View
              style={[
                styles.highlight,
                {
                  left: highlightPosition.x,
                  top: highlightPosition.y,
                  width: highlightPosition.width,
                  height: highlightPosition.height,
                },
              ]}
            />
          )}

          {/* Tooltip */}
          <Animated.View
            style={[
              styles.tooltip,
              tooltipPosition,
              {
                transform: [{ scale: tooltipScale }],
              },
            ]}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.tooltipGradient}
            >
              {/* Arrow */}
              <View style={arrowStyle} />

              {/* Content */}
              <View style={styles.tooltipContent}>
                <Text style={styles.tooltipTitle}>{currentStep.title}</Text>
                <Text style={styles.tooltipDescription}>
                  {currentStep.description}
                </Text>

                {/* Progress bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    {currentStep.order + 1} of {ONBOARDING_STEPS.length}
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.actionContainer}>
                  {currentStep.order > 0 && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handlePrevious}
                    >
                      <Text style={styles.actionButtonText}>Previous</Text>
                    </TouchableOpacity>
                  )}

                  {currentStep.skipable && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.skipButton]}
                      onPress={handleSkip}
                    >
                      <Text style={[styles.actionButtonText, styles.skipButtonText]}>
                        Skip
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.actionButton, styles.nextButton]}
                    onPress={handleNext}
                  >
                    <Text style={[styles.actionButtonText, styles.nextButtonText]}>
                      {currentStep.order === ONBOARDING_STEPS.length - 1 ? 'Finish' : 'Next'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  targetContainer: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#667eea',
    borderRadius: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  tooltip: {
    position: 'absolute',
    width: screenWidth * 0.8,
    maxWidth: 320,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipGradient: {
    borderRadius: 12,
    padding: 20,
  },
  tooltipContent: {
    alignItems: 'center',
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  tooltipDescription: {
    fontSize: 14,
    color: '#f0f0f0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#f0f0f0',
    textAlign: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  nextButton: {
    backgroundColor: '#fff',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  skipButtonText: {
    color: '#fff',
  },
  nextButtonText: {
    color: '#667eea',
  },
});