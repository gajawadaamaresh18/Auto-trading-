# Auto-Trading App with Onboarding Coach

A React Native application featuring a comprehensive onboarding coach system with animated walkthroughs, tooltips, and guided tours.

## Features

### Onboarding Coach System
- **Popovers and Tooltips**: Contextual guidance attached to UI components
- **Animated Welcome Tour**: Multi-step walkthrough with smooth animations
- **Progress Tracking**: Persistent state management with AsyncStorage
- **Skip/Resume/Replay**: Full control over the onboarding experience
- **Settings Integration**: Manage coach from Profile/Settings screen

### Key Components

#### 1. OnboardingCoach Component
- Wraps target components with coaching functionality
- Supports multiple positioning (top, bottom, left, right, center)
- Animated tooltips with arrows and progress indicators
- Highlighted target areas with customizable styling

#### 2. WelcomeTourScreen
- Full-screen animated walkthrough
- Gradient backgrounds and smooth transitions
- Progress dots and navigation controls
- Skip and completion handlers

#### 3. State Management
- Context-based state management with useReducer
- Persistent progress storage with AsyncStorage
- Support for completed, skipped, and current steps
- Welcome tour state management

#### 4. Coach Triggers
- Automatic triggering based on screen navigation
- Conditional logic support
- Configurable delays and conditions
- Component-specific targeting

## Usage

### Basic Implementation

```tsx
import { OnboardingProvider } from './src/state/onboardingContext';
import { OnboardingCoach } from './src/components/OnboardingCoach/OnboardingCoach';

function App() {
  return (
    <OnboardingProvider>
      <OnboardingCoach targetComponent="marketplace">
        <YourComponent />
      </OnboardingCoach>
    </OnboardingProvider>
  );
}
```

### Using Coach Triggers

```tsx
import { useCoachTrigger } from './src/hooks/useCoachTrigger';

function YourScreen() {
  useCoachTrigger({
    screenName: 'YourScreen',
    componentId: 'target-component',
    delay: 1000, // Show after 1 second
    condition: () => someCondition, // Optional condition
  });

  return <YourComponent />;
}
```

### Managing Coach from Settings

```tsx
import { CoachSettings } from './src/components/OnboardingCoach/CoachSettings';

function SettingsScreen() {
  return (
    <CoachSettings
      onStartWelcomeTour={() => {/* Handle welcome tour */}}
      onStartCoach={() => {/* Handle coach start */}}
    />
  );
}
```

## Configuration

### Onboarding Steps
Define your onboarding steps in `src/constants/onboardingSteps.ts`:

```tsx
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'marketplace',
    title: 'Marketplace',
    description: 'Discover trading strategies',
    targetComponent: 'marketplace',
    position: 'bottom',
    arrowDirection: 'up',
    action: 'tap',
    highlight: true,
    skipable: true,
    order: 1,
  },
  // ... more steps
];
```

### Coach Triggers
Configure automatic triggers in the same file:

```tsx
export const COACH_TRIGGERS = [
  { screenName: 'MarketplaceScreen', componentId: 'marketplace-tab', stepId: 'marketplace' },
  // ... more triggers
];
```

## State Management

The onboarding system uses React Context with useReducer for state management:

- **isActive**: Whether coaching is currently active
- **currentStep**: The currently displayed step
- **progress**: User's progress through onboarding
- **isWelcomeTourActive**: Whether welcome tour is active
- **welcomeTourStep**: Current welcome tour step

## Styling

The system includes comprehensive styling with:
- Gradient backgrounds
- Smooth animations using React Native Animated
- Responsive design for different screen sizes
- Customizable colors and themes
- Shadow and elevation effects

## Dependencies

- React Native
- React Native Reanimated
- React Native Linear Gradient
- React Native Vector Icons
- AsyncStorage (for persistence)

## Installation

1. Install dependencies:
```bash
npm install
```

2. For iOS, install pods:
```bash
cd ios && pod install
```

3. Run the app:
```bash
npm run ios
# or
npm run android
```

## Customization

### Adding New Steps
1. Add step definition to `ONBOARDING_STEPS`
2. Add corresponding trigger to `COACH_TRIGGERS`
3. Wrap target component with `OnboardingCoach`
4. Add `useCoachTrigger` hook to screen

### Custom Styling
Modify styles in component files or create a theme system for consistent styling across the app.

### Advanced Features
- Add haptic feedback for interactions
- Implement voice guidance
- Add accessibility features
- Create custom animations
- Add analytics tracking