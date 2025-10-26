import { useEffect, useRef } from 'react';
import { useOnboarding } from '../state/onboardingContext';
import { COACH_TRIGGERS } from '../constants/onboardingSteps';

interface UseCoachTriggerProps {
  screenName: string;
  componentId: string;
  condition?: () => boolean;
  delay?: number;
}

export const useCoachTrigger = ({
  screenName,
  componentId,
  condition = () => true,
  delay = 0,
}: UseCoachTriggerProps) => {
  const { state, startOnboarding } = useOnboarding();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Find the trigger for this component
    const trigger = COACH_TRIGGERS.find(
      t => t.screenName === screenName && t.componentId === componentId
    );

    if (!trigger) return;

    // Check if this step has already been completed or skipped
    const isCompleted = state.progress.completedSteps.includes(trigger.stepId);
    const isSkipped = state.progress.skippedSteps.includes(trigger.stepId);
    const isActive = state.isActive;

    if (isCompleted || isSkipped || isActive || hasTriggeredRef.current) {
      return;
    }

    // Check if welcome tour has been seen
    if (!state.progress.hasSeenWelcome) {
      return;
    }

    // Check custom condition
    if (!condition()) {
      return;
    }

    // Trigger the coach with delay
    timeoutRef.current = setTimeout(() => {
      hasTriggeredRef.current = true;
      startOnboarding(trigger.stepId);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [screenName, componentId, condition, delay, state, startOnboarding]);

  const retrigger = () => {
    hasTriggeredRef.current = false;
  };

  return { retrigger };
};