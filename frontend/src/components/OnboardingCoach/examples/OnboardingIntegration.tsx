/**
 * Onboarding Integration Example
 * 
 * Example of how to integrate the onboarding system into your app.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

import {
  OnboardingProvider,
  useOnboarding,
  OnboardingCoach,
  OnboardingTrigger,
} from './components/OnboardingCoach';
import WelcomeTourScreen from './screens/WelcomeTourScreen';

// Main App Component with Onboarding
const AppWithOnboarding: React.FC = () => {
  const userId = 'user_123'; // Get from auth context
  
  return (
    <OnboardingProvider userId={userId}>
      <MainApp />
    </OnboardingProvider>
  );
};

// Main App Component
const MainApp: React.FC = () => {
  const { state, startOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();
  
  // Show welcome tour for new users
  useEffect(() => {
    if (!state.isCompleted && !state.isSkipped) {
      // Show welcome tour screen
    }
  }, [state.isCompleted, state.isSkipped]);

  return (
    <View style={styles.container}>
      {/* Your main app content */}
      <MainAppContent />
      
      {/* Onboarding Coach */}
      <OnboardingCoach
        visible={state.isVisible}
        currentStep={state.currentStep}
        progress={state.progress}
        onStepChange={(step) => {
          // Handle step change
        }}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
        onStepComplete={(stepId) => {
          // Handle step completion
        }}
        onStepSkip={(stepId) => {
          // Handle step skip
        }}
      />
    </View>
  );
};

// Main App Content
const MainAppContent: React.FC = () => {
  return (
    <View style={styles.content}>
      {/* Your app screens and components */}
      <MarketplaceScreen />
      <SubscriptionsScreen />
      <BacktestScreen />
      <AlertsScreen />
      <RiskScreen />
      <ExecutionScreen />
      <NotificationsScreen />
    </View>
  );
};

// Example Screen Components
const MarketplaceScreen: React.FC = () => {
  return (
    <View style={styles.screen}>
      {/* Marketplace content */}
      <OnboardingTrigger text="Take Marketplace Tour" />
    </View>
  );
};

const SubscriptionsScreen: React.FC = () => {
  return (
    <View style={styles.screen}>
      {/* Subscriptions content */}
    </View>
  );
};

const BacktestScreen: React.FC = () => {
  return (
    <View style={styles.screen}>
      {/* Backtest content */}
    </View>
  );
};

const AlertsScreen: React.FC = () => {
  return (
    <View style={styles.screen}>
      {/* Alerts content */}
    </View>
  );
};

const RiskScreen: React.FC = () => {
  return (
    <View style={styles.screen}>
      {/* Risk management content */}
    </View>
  );
};

const ExecutionScreen: React.FC = () => {
  return (
    <View style={styles.screen}>
      {/* Trade execution content */}
    </View>
  );
};

const NotificationsScreen: React.FC = () => {
  return (
    <View style={styles.screen}>
      {/* Notifications content */}
    </View>
  );
};

// Profile/Settings Screen with Onboarding Trigger
const ProfileScreen: React.FC = () => {
  const { hasCompletedOnboarding, startOnboarding } = useOnboarding();
  
  return (
    <View style={styles.screen}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & Support</Text>
        
        <OnboardingTrigger 
          text={hasCompletedOnboarding() ? "Retake Tour" : "Take App Tour"}
          asButton={false}
        />
        
        <OnboardingTrigger 
          text="Reset Onboarding"
          asButton={true}
        />
      </View>
    </View>
  );
};

// Welcome Tour Screen Integration
const WelcomeTourIntegration: React.FC = () => {
  const { startOnboarding, skipOnboarding } = useOnboarding();
  
  return (
    <WelcomeTourScreen
      onStartOnboarding={startOnboarding}
      onSkipOnboarding={skipOnboarding}
      onExploreDemo={() => {
        // Handle demo exploration
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  screen: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
});

export default AppWithOnboarding;
