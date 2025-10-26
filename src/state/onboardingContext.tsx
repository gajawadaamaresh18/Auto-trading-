import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingState, OnboardingAction, OnboardingProgress } from '../types/onboarding';
import { ONBOARDING_STEPS } from '../constants/onboardingSteps';

const STORAGE_KEY = 'onboarding_progress';

const initialState: OnboardingState = {
  isActive: false,
  currentStep: null,
  progress: {
    currentStep: 0,
    completedSteps: [],
    skippedSteps: [],
    isCompleted: false,
    lastAccessed: new Date(),
    hasSeenWelcome: false,
  },
  isWelcomeTourActive: false,
  welcomeTourStep: 0,
};

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'START_ONBOARDING':
      const step = ONBOARDING_STEPS.find(s => s.id === action.payload.stepId);
      return {
        ...state,
        isActive: true,
        currentStep: step || null,
        progress: {
          ...state.progress,
          currentStep: step?.order || 0,
        },
      };

    case 'NEXT_STEP':
      const nextStepIndex = state.progress.currentStep + 1;
      const nextStep = ONBOARDING_STEPS.find(s => s.order === nextStepIndex);
      
      if (nextStep) {
        return {
          ...state,
          currentStep: nextStep,
          progress: {
            ...state.progress,
            currentStep: nextStepIndex,
          },
        };
      } else {
        return {
          ...state,
          isActive: false,
          currentStep: null,
          progress: {
            ...state.progress,
            isCompleted: true,
            lastAccessed: new Date(),
          },
        };
      }

    case 'PREVIOUS_STEP':
      const prevStepIndex = Math.max(0, state.progress.currentStep - 1);
      const prevStep = ONBOARDING_STEPS.find(s => s.order === prevStepIndex);
      
      return {
        ...state,
        currentStep: prevStep || null,
        progress: {
          ...state.progress,
          currentStep: prevStepIndex,
        },
      };

    case 'SKIP_STEP':
      return {
        ...state,
        progress: {
          ...state.progress,
          skippedSteps: [...state.progress.skippedSteps, action.payload.stepId],
        },
      };

    case 'COMPLETE_STEP':
      return {
        ...state,
        progress: {
          ...state.progress,
          completedSteps: [...state.progress.completedSteps, action.payload.stepId],
        },
      };

    case 'RESET_ONBOARDING':
      return {
        ...initialState,
        progress: {
          ...initialState.progress,
          hasSeenWelcome: state.progress.hasSeenWelcome,
        },
      };

    case 'START_WELCOME_TOUR':
      return {
        ...state,
        isWelcomeTourActive: true,
        welcomeTourStep: 0,
      };

    case 'NEXT_WELCOME_STEP':
      return {
        ...state,
        welcomeTourStep: state.welcomeTourStep + 1,
      };

    case 'SKIP_WELCOME_TOUR':
      return {
        ...state,
        isWelcomeTourActive: false,
        welcomeTourStep: 0,
        progress: {
          ...state.progress,
          hasSeenWelcome: true,
        },
      };

    case 'COMPLETE_WELCOME_TOUR':
      return {
        ...state,
        isWelcomeTourActive: false,
        welcomeTourStep: 0,
        progress: {
          ...state.progress,
          hasSeenWelcome: true,
        },
      };

    case 'SET_WELCOME_SEEN':
      return {
        ...state,
        progress: {
          ...state.progress,
          hasSeenWelcome: true,
        },
      };

    default:
      return state;
  }
}

interface OnboardingContextType {
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
  startOnboarding: (stepId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipStep: (stepId: string) => void;
  completeStep: (stepId: string) => void;
  resetOnboarding: () => void;
  startWelcomeTour: () => void;
  nextWelcomeStep: () => void;
  skipWelcomeTour: () => void;
  completeWelcomeTour: () => void;
  setWelcomeSeen: () => void;
  saveProgress: () => Promise<void>;
  loadProgress: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  const startOnboarding = (stepId: string) => {
    dispatch({ type: 'START_ONBOARDING', payload: { stepId } });
  };

  const nextStep = () => {
    if (state.currentStep) {
      dispatch({ type: 'COMPLETE_STEP', payload: { stepId: state.currentStep.id } });
    }
    dispatch({ type: 'NEXT_STEP' });
  };

  const previousStep = () => {
    dispatch({ type: 'PREVIOUS_STEP' });
  };

  const skipStep = (stepId: string) => {
    dispatch({ type: 'SKIP_STEP', payload: { stepId } });
    dispatch({ type: 'NEXT_STEP' });
  };

  const completeStep = (stepId: string) => {
    dispatch({ type: 'COMPLETE_STEP', payload: { stepId } });
  };

  const resetOnboarding = () => {
    dispatch({ type: 'RESET_ONBOARDING' });
  };

  const startWelcomeTour = () => {
    dispatch({ type: 'START_WELCOME_TOUR' });
  };

  const nextWelcomeStep = () => {
    dispatch({ type: 'NEXT_WELCOME_STEP' });
  };

  const skipWelcomeTour = () => {
    dispatch({ type: 'SKIP_WELCOME_TOUR' });
  };

  const completeWelcomeTour = () => {
    dispatch({ type: 'COMPLETE_WELCOME_TOUR' });
  };

  const setWelcomeSeen = () => {
    dispatch({ type: 'SET_WELCOME_SEEN' });
  };

  const saveProgress = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
    } catch (error) {
      console.error('Failed to save onboarding progress:', error);
    }
  };

  const loadProgress = async () => {
    try {
      const savedProgress = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedProgress) {
        const progress: OnboardingProgress = JSON.parse(savedProgress);
        dispatch({ type: 'SET_WELCOME_SEEN' });
        // Update progress in state
      }
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  useEffect(() => {
    saveProgress();
  }, [state.progress]);

  const value: OnboardingContextType = {
    state,
    dispatch,
    startOnboarding,
    nextStep,
    previousStep,
    skipStep,
    completeStep,
    resetOnboarding,
    startWelcomeTour,
    nextWelcomeStep,
    skipWelcomeTour,
    completeWelcomeTour,
    setWelcomeSeen,
    saveProgress,
    loadProgress,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};