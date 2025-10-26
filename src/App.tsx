import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { OnboardingProvider, useOnboarding } from './state/onboardingContext';
import { WelcomeTourScreen } from './screens/WelcomeTourScreen';
import { MarketplaceScreen } from './screens/MarketplaceScreen';
import { FormulaBuilderScreen } from './screens/FormulaBuilderScreen';
import { ProfileScreen } from './screens/ProfileScreen';

const AppContent: React.FC = () => {
  const { state } = useOnboarding();
  const [currentScreen, setCurrentScreen] = useState('marketplace');
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);

  useEffect(() => {
    // Show welcome tour if user hasn't seen it
    if (!state.progress.hasSeenWelcome) {
      setShowWelcomeTour(true);
    }
  }, [state.progress.hasSeenWelcome]);

  const handleWelcomeTourComplete = () => {
    setShowWelcomeTour(false);
  };

  const handleWelcomeTourSkip = () => {
    setShowWelcomeTour(false);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'marketplace':
        return <MarketplaceScreen />;
      case 'formula-builder':
        return <FormulaBuilderScreen />;
      case 'profile':
        return <ProfileScreen onNavigateToSettings={() => setCurrentScreen('settings')} />;
      case 'settings':
        return (
          <View style={styles.settingsContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentScreen('profile')}
            >
              <Text style={styles.backButtonText}>← Back to Profile</Text>
            </TouchableOpacity>
            <ProfileScreen onNavigateToSettings={() => setCurrentScreen('settings')} />
          </View>
        );
      default:
        return <MarketplaceScreen />;
    }
  };

  if (showWelcomeTour) {
    return (
      <WelcomeTourScreen
        onComplete={handleWelcomeTourComplete}
        onSkip={handleWelcomeTourSkip}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentScreen === 'marketplace' && styles.activeNavButton]}
          onPress={() => setCurrentScreen('marketplace')}
        >
          <Text style={[styles.navButtonText, currentScreen === 'marketplace' && styles.activeNavButtonText]}>
            Marketplace
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, currentScreen === 'formula-builder' && styles.activeNavButton]}
          onPress={() => setCurrentScreen('formula-builder')}
        >
          <Text style={[styles.navButtonText, currentScreen === 'formula-builder' && styles.activeNavButtonText]}>
            Formula Builder
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, currentScreen === 'profile' && styles.activeNavButton]}
          onPress={() => setCurrentScreen('profile')}
        >
          <Text style={[styles.navButtonText, currentScreen === 'profile' && styles.activeNavButtonText]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {renderScreen()}
      </View>

      {/* Onboarding Status Indicator */}
      {state.isActive && (
        <View style={styles.onboardingIndicator}>
          <Text style={styles.onboardingText}>
            Onboarding Active - Step {state.progress.currentStep + 1}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const App: React.FC = () => {
  return (
    <OnboardingProvider>
      <AppContent />
    </OnboardingProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  navigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeNavButton: {
    backgroundColor: '#667eea',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeNavButtonText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  settingsContainer: {
    flex: 1,
  },
  backButton: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButtonText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  onboardingIndicator: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#667eea',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  onboardingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default App;