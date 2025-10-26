export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetComponent: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  arrowDirection?: 'up' | 'down' | 'left' | 'right';
  action?: 'tap' | 'swipe' | 'none';
  highlight?: boolean;
  skipable?: boolean;
  order: number;
}

export interface OnboardingProgress {
  currentStep: number;
  completedSteps: string[];
  skippedSteps: string[];
  isCompleted: boolean;
  lastAccessed: Date;
  hasSeenWelcome: boolean;
}

export interface CoachTrigger {
  screenName: string;
  componentId: string;
  stepId: string;
  condition?: () => boolean;
}

export interface OnboardingState {
  isActive: boolean;
  currentStep: OnboardingStep | null;
  progress: OnboardingProgress;
  isWelcomeTourActive: boolean;
  welcomeTourStep: number;
}

export type OnboardingAction = 
  | { type: 'START_ONBOARDING'; payload: { stepId: string } }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'SKIP_STEP'; payload: { stepId: string } }
  | { type: 'COMPLETE_STEP'; payload: { stepId: string } }
  | { type: 'RESET_ONBOARDING' }
  | { type: 'START_WELCOME_TOUR' }
  | { type: 'NEXT_WELCOME_STEP' }
  | { type: 'SKIP_WELCOME_TOUR' }
  | { type: 'COMPLETE_WELCOME_TOUR' }
  | { type: 'SET_WELCOME_SEEN' };