import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useOnboarding } from '../state/onboardingContext';
import { WELCOME_TOUR_STEPS } from '../constants/onboardingSteps';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface WelcomeTourScreenProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export const WelcomeTourScreen: React.FC<WelcomeTourScreenProps> = ({
  onComplete,
  onSkip,
}) => {
  const { state, nextWelcomeStep, skipWelcomeTour, completeWelcomeTour } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));
  const scrollViewRef = useRef<any>(null);

  const isLastStep = currentStep === WELCOME_TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    animateIn();
  }, [currentStep]);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.9);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      animateOut(() => {
        setCurrentStep(prev => prev + 1);
        nextWelcomeStep();
      });
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      animateOut(() => {
        setCurrentStep(prev => prev - 1);
      });
    }
  };

  const handleSkip = () => {
    skipWelcomeTour();
    onSkip?.();
  };

  const handleFinish = () => {
    completeWelcomeTour();
    onComplete?.();
  };

  const getStepImage = (imageName: string) => {
    // In a real app, you would import actual images
    // For now, we'll use placeholder content
    return (
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>
          {imageName.toUpperCase()}
        </Text>
      </View>
    );
  };

  const step = WELCOME_TOUR_STEPS[currentStep];
  const progress = ((currentStep + 1) / WELCOME_TOUR_STEPS.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        {/* Skip button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Image */}
          <View style={styles.imageContainer}>
            {getStepImage(step.image)}
          </View>

          {/* Title */}
          <Text style={styles.title}>{step.title}</Text>

          {/* Description */}
          <Text style={styles.description}>{step.description}</Text>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {currentStep + 1} of {WELCOME_TOUR_STEPS.length}
            </Text>
          </View>
        </Animated.View>

        {/* Navigation */}
        <View style={styles.navigation}>
          {/* Dots indicator */}
          <View style={styles.dotsContainer}>
            {WELCOME_TOUR_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep && styles.activeDot,
                ]}
              />
            ))}
          </View>

          {/* Action buttons */}
          <View style={styles.actionContainer}>
            {!isFirstStep && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handlePrevious}
              >
                <Text style={styles.actionButtonText}>Previous</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleNext}
            >
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                {isLastStep ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  imageContainer: {
    width: 200,
    height: 200,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  imagePlaceholderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#f0f0f0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
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
    color: '#f0f0f0',
    fontSize: 12,
  },
  navigation: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 24,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 100,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#fff',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  primaryButtonText: {
    color: '#667eea',
  },
});