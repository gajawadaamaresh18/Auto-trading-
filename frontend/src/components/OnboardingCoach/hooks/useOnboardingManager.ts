/**
 * Onboarding Manager Hook
 * 
 * Custom hook for managing onboarding state, progress, and navigation.
 */

import { useState, useEffect, useCallback } from 'react';
import { OnboardingProgress, OnboardingStep, ONBOARDING_STEPS } from './OnboardingCoach';

export interface OnboardingManagerProps {
  /** User ID */
  userId: string;
  /** Callback when onboarding state changes */
  onStateChange?: (state: OnboardingState) => void;
  /** Callback when progress is saved */
  onProgressSave?: (progress: OnboardingProgress) => void;
}

export interface OnboardingState {
  isVisible: boolean;
  currentStep: number;
  progress: OnboardingProgress;
  isCompleted: boolean;
  isSkipped: boolean;
}

export interface OnboardingManagerReturn {
  /** Current onboarding state */
  state: OnboardingState;
  /** Start onboarding */
  startOnboarding: () => void;
  /** Complete onboarding */
  completeOnboarding: () => void;
  /** Skip onboarding */
  skipOnboarding: () => void;
  /** Go to specific step */
  goToStep: (step: number) => void;
  /** Complete current step */
  completeStep: (stepId: string) => void;
  /** Skip current step */
  skipStep: (stepId: string) => void;
  /** Reset onboarding */
  resetOnboarding: () => void;
  /** Check if user has completed onboarding */
  hasCompletedOnboarding: () => boolean;
  /** Get onboarding progress percentage */
  getProgressPercentage: () => number;
  /** Get current step data */
  getCurrentStepData: () => OnboardingStep | undefined;
  /** Get next step data */
  getNextStepData: () => OnboardingStep | undefined;
  /** Get previous step data */
  getPreviousStepData: () => OnboardingStep | undefined;
}

// Default onboarding progress
const createDefaultProgress = (userId: string): OnboardingProgress => ({
  currentStep: 1,
  completedSteps: [],
  skippedSteps: [],
  totalSteps: ONBOARDING_STEPS.length,
  isCompleted: false,
  startedAt: new Date().toISOString(),
});

// Onboarding Manager Hook
export const useOnboardingManager = ({
  userId,
  onStateChange,
  onProgressSave,
}: OnboardingManagerProps): OnboardingManagerReturn => {
  const [state, setState] = useState<OnboardingState>({
    isVisible: false,
    currentStep: 1,
    progress: createDefaultProgress(userId),
    isCompleted: false,
    isSkipped: false,
  });

  // Load onboarding progress from storage
  useEffect(() => {
    loadOnboardingProgress();
  }, [userId]);

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  // Load onboarding progress
  const loadOnboardingProgress = useCallback(async () => {
    try {
      // In a real app, this would load from AsyncStorage or API
      const savedProgress = await getOnboardingProgress(userId);
      if (savedProgress) {
        setState(prev => ({
          ...prev,
          progress: savedProgress,
          currentStep: savedProgress.currentStep,
          isCompleted: savedProgress.isCompleted,
        }));
      }
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
    }
  }, [userId]);

  // Save onboarding progress
  const saveOnboardingProgress = useCallback(async (progress: OnboardingProgress) => {
    try {
      // In a real app, this would save to AsyncStorage or API
      await setOnboardingProgress(userId, progress);
      onProgressSave?.(progress);
    } catch (error) {
      console.error('Failed to save onboarding progress:', error);
    }
  }, [userId, onProgressSave]);

  // Start onboarding
  const startOnboarding = useCallback(() => {
    const newProgress = {
      ...state.progress,
      currentStep: 1,
      startedAt: new Date().toISOString(),
    };
    
    setState(prev => ({
      ...prev,
      isVisible: true,
      currentStep: 1,
      progress: newProgress,
      isCompleted: false,
      isSkipped: false,
    }));
    
    saveOnboardingProgress(newProgress);
  }, [state.progress, saveOnboardingProgress]);

  // Complete onboarding
  const completeOnboarding = useCallback(() => {
    const newProgress = {
      ...state.progress,
      currentStep: ONBOARDING_STEPS.length,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    };
    
    setState(prev => ({
      ...prev,
      isVisible: false,
      progress: newProgress,
      isCompleted: true,
    }));
    
    saveOnboardingProgress(newProgress);
  }, [state.progress, saveOnboardingProgress]);

  // Skip onboarding
  const skipOnboarding = useCallback(() => {
    const newProgress = {
      ...state.progress,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    };
    
    setState(prev => ({
      ...prev,
      isVisible: false,
      progress: newProgress,
      isCompleted: true,
      isSkipped: true,
    }));
    
    saveOnboardingProgress(newProgress);
  }, [state.progress, saveOnboardingProgress]);

  // Go to specific step
  const goToStep = useCallback((step: number) => {
    const clampedStep = Math.max(1, Math.min(step, ONBOARDING_STEPS.length));
    const newProgress = {
      ...state.progress,
      currentStep: clampedStep,
    };
    
    setState(prev => ({
      ...prev,
      currentStep: clampedStep,
      progress: newProgress,
    }));
    
    saveOnboardingProgress(newProgress);
  }, [state.progress, saveOnboardingProgress]);

  // Complete current step
  const completeStep = useCallback((stepId: string) => {
    const newProgress = {
      ...state.progress,
      completedSteps: [...state.progress.completedSteps, stepId],
      currentStep: Math.min(state.currentStep + 1, ONBOARDING_STEPS.length),
    };
    
    setState(prev => ({
      ...prev,
      currentStep: newProgress.currentStep,
      progress: newProgress,
    }));
    
    saveOnboardingProgress(newProgress);
  }, [state.progress, state.currentStep, saveOnboardingProgress]);

  // Skip current step
  const skipStep = useCallback((stepId: string) => {
    const newProgress = {
      ...state.progress,
      skippedSteps: [...state.progress.skippedSteps, stepId],
      currentStep: Math.min(state.currentStep + 1, ONBOARDING_STEPS.length),
    };
    
    setState(prev => ({
      ...prev,
      currentStep: newProgress.currentStep,
      progress: newProgress,
    }));
    
    saveOnboardingProgress(newProgress);
  }, [state.progress, state.currentStep, saveOnboardingProgress]);

  // Reset onboarding
  const resetOnboarding = useCallback(() => {
    const newProgress = createDefaultProgress(userId);
    
    setState(prev => ({
      ...prev,
      isVisible: false,
      currentStep: 1,
      progress: newProgress,
      isCompleted: false,
      isSkipped: false,
    }));
    
    saveOnboardingProgress(newProgress);
  }, [userId, saveOnboardingProgress]);

  // Check if user has completed onboarding
  const hasCompletedOnboarding = useCallback(() => {
    return state.isCompleted;
  }, [state.isCompleted]);

  // Get onboarding progress percentage
  const getProgressPercentage = useCallback(() => {
    return (state.currentStep / ONBOARDING_STEPS.length) * 100;
  }, [state.currentStep]);

  // Get current step data
  const getCurrentStepData = useCallback(() => {
    return ONBOARDING_STEPS.find(step => step.order === state.currentStep);
  }, [state.currentStep]);

  // Get next step data
  const getNextStepData = useCallback(() => {
    return ONBOARDING_STEPS.find(step => step.order === state.currentStep + 1);
  }, [state.currentStep]);

  // Get previous step data
  const getPreviousStepData = useCallback(() => {
    return ONBOARDING_STEPS.find(step => step.order === state.currentStep - 1);
  }, [state.currentStep]);

  return {
    state,
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    goToStep,
    completeStep,
    skipStep,
    resetOnboarding,
    hasCompletedOnboarding,
    getProgressPercentage,
    getCurrentStepData,
    getNextStepData,
    getPreviousStepData,
  };
};

// Storage utilities (mock implementations)
const getOnboardingProgress = async (userId: string): Promise<OnboardingProgress | null> => {
  try {
    // In a real app, this would use AsyncStorage or API
    const key = `onboarding_progress_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to get onboarding progress:', error);
    return null;
  }
};

const setOnboardingProgress = async (userId: string, progress: OnboardingProgress): Promise<void> => {
  try {
    // In a real app, this would use AsyncStorage or API
    const key = `onboarding_progress_${userId}`;
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to set onboarding progress:', error);
  }
};

/**
 * Onboarding Context Provider
 * 
 * React Context for sharing onboarding state across components.
 */

import React, { createContext, useContext, ReactNode } from 'react';

interface OnboardingContextType {
  state: OnboardingState;
  startOnboarding: () => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  goToStep: (step: number) => void;
  completeStep: (stepId: string) => void;
  skipStep: (stepId: string) => void;
  resetOnboarding: () => void;
  hasCompletedOnboarding: () => boolean;
  getProgressPercentage: () => number;
  getCurrentStepData: () => OnboardingStep | undefined;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export interface OnboardingProviderProps {
  children: ReactNode;
  userId: string;
  onStateChange?: (state: OnboardingState) => void;
  onProgressSave?: (progress: OnboardingProgress) => void;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  children,
  userId,
  onStateChange,
  onProgressSave,
}) => {
  const onboardingManager = useOnboardingManager({
    userId,
    onStateChange,
    onProgressSave,
  });

  return (
    <OnboardingContext.Provider value={onboardingManager}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

/**
 * Onboarding Trigger Component
 * 
 * Component for triggering onboarding from profile/settings.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useOnboarding } from './useOnboardingManager';
import theme from '../theme';

export interface OnboardingTriggerProps {
  /** Trigger text */
  text?: string;
  /** Whether to show as a button */
  asButton?: boolean;
  /** Additional styling */
  style?: any;
}

const OnboardingTrigger: React.FC<OnboardingTriggerProps> = ({
  text = 'Take Tour',
  asButton = true,
  style,
}) => {
  const { startOnboarding, hasCompletedOnboarding } = useOnboarding();
  const hasCompleted = hasCompletedOnboarding();

  if (asButton) {
    return (
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={startOnboarding}
      >
        <Ionicons name="play-circle" size={20} color={theme.colors.primary[500]} />
        <Text style={styles.buttonText}>{text}</Text>
        {hasCompleted && (
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.success[500]} />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.link, style]}
      onPress={startOnboarding}
    >
      <Text style={styles.linkText}>{text}</Text>
      <Ionicons name="chevron-forward" size={16} color={theme.colors.text.secondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
    ...theme.shadows.sm,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.primary[500],
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  linkText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
});

export default OnboardingTrigger;
