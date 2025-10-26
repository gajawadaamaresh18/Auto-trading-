import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useOnboarding } from '../../state/onboardingContext';

interface CoachSettingsProps {
  onStartWelcomeTour?: () => void;
  onStartCoach?: () => void;
}

export const CoachSettings: React.FC<CoachSettingsProps> = ({
  onStartWelcomeTour,
  onStartCoach,
}) => {
  const { state, startWelcomeTour, resetOnboarding } = useOnboarding();

  const handleStartWelcomeTour = () => {
    startWelcomeTour();
    onStartWelcomeTour?.();
  };

  const handleStartCoach = () => {
    resetOnboarding();
    onStartCoach?.();
  };

  const handleResetCoach = () => {
    Alert.alert(
      'Reset Onboarding Coach',
      'This will reset your onboarding progress and allow you to see all coach tips again. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetOnboarding();
            Alert.alert('Success', 'Onboarding coach has been reset.');
          },
        },
      ]
    );
  };

  const getProgressPercentage = () => {
    const totalSteps = 10; // Total number of onboarding steps
    const completedSteps = state.progress.completedSteps.length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onboarding Coach</Text>
      
      {/* Progress Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getProgressPercentage()}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {getProgressPercentage()}% Complete
          </Text>
        </View>
        <Text style={styles.progressSubtext}>
          {state.progress.completedSteps.length} of 10 steps completed
        </Text>
      </View>

      {/* Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleStartWelcomeTour}
        >
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Welcome Tour</Text>
            <Text style={styles.actionDescription}>
              Take the animated walkthrough
            </Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleStartCoach}
        >
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Start Coach</Text>
            <Text style={styles.actionDescription}>
              Begin guided tour of features
            </Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleResetCoach}
        >
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, styles.dangerText]}>Reset Coach</Text>
            <Text style={[styles.actionDescription, styles.dangerText]}>
              Clear progress and start over
            </Text>
          </View>
          <Text style={[styles.actionArrow, styles.dangerText]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Status Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Welcome Tour Seen:</Text>
          <Text style={[
            styles.statusValue,
            state.progress.hasSeenWelcome ? styles.statusTrue : styles.statusFalse
          ]}>
            {state.progress.hasSeenWelcome ? 'Yes' : 'No'}
          </Text>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Coach Active:</Text>
          <Text style={[
            styles.statusValue,
            state.isActive ? styles.statusTrue : styles.statusFalse
          ]}>
            {state.isActive ? 'Yes' : 'No'}
          </Text>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Completed:</Text>
          <Text style={[
            styles.statusValue,
            state.progress.isCompleted ? styles.statusTrue : styles.statusFalse
          ]}>
            {state.progress.isCompleted ? 'Yes' : 'No'}
          </Text>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Skipped Steps:</Text>
          <Text style={styles.statusValue}>
            {state.progress.skippedSteps.length}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  progressSubtext: {
    fontSize: 12,
    color: '#666',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  dangerButton: {
    backgroundColor: '#fff5f5',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionArrow: {
    fontSize: 18,
    color: '#999',
    fontWeight: 'bold',
  },
  dangerText: {
    color: '#dc3545',
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusTrue: {
    color: '#28a745',
  },
  statusFalse: {
    color: '#dc3545',
  },
});