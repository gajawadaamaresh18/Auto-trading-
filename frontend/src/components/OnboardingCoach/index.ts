/**
 * Onboarding Coach Index File
 * 
 * Central export file for all onboarding components and utilities.
 */

// Main Components
export { default as OnboardingCoach } from './OnboardingCoach';
export { default as CoachMark } from './CoachMark';
export { default as OnboardingTrigger } from './hooks/useOnboardingManager';

// Hooks
export {
  useOnboardingManager,
  useOnboarding,
  OnboardingProvider,
} from './hooks/useOnboardingManager';

// Types and Interfaces
export type {
  OnboardingStep,
  OnboardingProgress,
  OnboardingCoachProps,
  OnboardingManagerProps,
  OnboardingManagerReturn,
  OnboardingState,
  OnboardingContextType,
  OnboardingProviderProps,
  OnboardingTriggerProps,
  CoachMarkProps,
} from './OnboardingCoach';

export type {
  OnboardingManagerProps,
  OnboardingManagerReturn,
  OnboardingState,
  OnboardingContextType,
  OnboardingProviderProps,
} from './hooks/useOnboardingManager';

// Constants
export {
  ONBOARDING_STEPS,
} from './OnboardingCoach';

// Utility Functions
export const ONBOARDING_CONSTANTS = {
  TOTAL_STEPS: 8,
  DEFAULT_STEP: 1,
  ANIMATION_DURATION: 300,
  PULSE_DURATION: 1000,
  COACH_MARK_WIDTH: 280,
  COACH_MARK_HEIGHT: 200,
  HIGHLIGHT_MARGIN: 10,
  SCREEN_MARGIN: 20,
} as const;

export const ONBOARDING_STEP_IDS = {
  WELCOME: 'welcome',
  MARKETPLACE: 'marketplace',
  SUBSCRIPTIONS: 'subscriptions',
  BACKTEST: 'backtest',
  ALERTS: 'alerts',
  RISK: 'risk',
  EXECUTION: 'execution',
  NOTIFICATIONS: 'notifications',
} as const;

export const ONBOARDING_POSITIONS = {
  TOP: 'top',
  BOTTOM: 'bottom',
  LEFT: 'left',
  RIGHT: 'right',
  CENTER: 'center',
} as const;

export const ONBOARDING_ACTIONS = {
  TAP: 'tap',
  SWIPE: 'swipe',
  SCROLL: 'scroll',
  NONE: 'none',
} as const;

// Storage Keys
export const ONBOARDING_STORAGE_KEYS = {
  PROGRESS: 'onboarding_progress',
  COMPLETED: 'onboarding_completed',
  SKIPPED: 'onboarding_skipped',
  LAST_STEP: 'onboarding_last_step',
} as const;

// Helper Functions
export const getOnboardingStepById = (stepId: string) => {
  return ONBOARDING_STEPS.find(step => step.id === stepId);
};

export const getOnboardingStepByOrder = (order: number) => {
  return ONBOARDING_STEPS.find(step => step.order === order);
};

export const isOnboardingStepCompleted = (stepId: string, completedSteps: string[]) => {
  return completedSteps.includes(stepId);
};

export const isOnboardingStepSkipped = (stepId: string, skippedSteps: string[]) => {
  return skippedSteps.includes(stepId);
};

export const calculateOnboardingProgress = (currentStep: number, totalSteps: number) => {
  return Math.round((currentStep / totalSteps) * 100);
};

export const getOnboardingCompletionStatus = (progress: OnboardingProgress) => {
  const completedCount = progress.completedSteps.length;
  const skippedCount = progress.skippedSteps.length;
  const totalCount = completedCount + skippedCount;
  
  return {
    completedCount,
    skippedCount,
    totalCount,
    completionRate: (totalCount / progress.totalSteps) * 100,
    isCompleted: progress.isCompleted,
  };
};

// Default Onboarding Configuration
export const DEFAULT_ONBOARDING_CONFIG = {
  autoStart: false,
  allowSkip: true,
  showProgress: true,
  highlightTargets: true,
  animateTransitions: true,
  saveProgress: true,
  resetOnAppUpdate: false,
} as const;
