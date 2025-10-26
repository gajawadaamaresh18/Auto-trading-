import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { OnboardingCoach } from '../components/OnboardingCoach/OnboardingCoach';
import { useCoachTrigger } from '../hooks/useCoachTrigger';

export const FormulaBuilderScreen: React.FC = () => {
  useCoachTrigger({
    screenName: 'FormulaBuilderScreen',
    componentId: 'formula-builder-tab',
    delay: 1000,
  });

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingCoach targetComponent="formula-builder">
        <ScrollView style={styles.content}>
          <Text style={styles.title}>Formula Builder</Text>
          <Text style={styles.subtitle}>
            Create custom trading formulas and strategies
          </Text>

          <View style={styles.builderArea}>
            <View style={styles.canvas}>
              <Text style={styles.canvasPlaceholder}>
                Drag and drop components here
              </Text>
            </View>

            <View style={styles.toolbox}>
              <Text style={styles.toolboxTitle}>Components</Text>
              
              <View style={styles.componentGroup}>
                <Text style={styles.groupTitle}>Indicators</Text>
                <TouchableOpacity style={styles.component}>
                  <Text style={styles.componentText}>Moving Average</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.component}>
                  <Text style={styles.componentText}>RSI</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.component}>
                  <Text style={styles.componentText}>MACD</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.componentGroup}>
                <Text style={styles.groupTitle}>Conditions</Text>
                <TouchableOpacity style={styles.component}>
                  <Text style={styles.componentText}>Greater Than</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.component}>
                  <Text style={styles.componentText}>Less Than</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.component}>
                  <Text style={styles.componentText}>Cross Above</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.componentGroup}>
                <Text style={styles.groupTitle}>Actions</Text>
                <TouchableOpacity style={styles.component}>
                  <Text style={styles.componentText}>Buy Signal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.component}>
                  <Text style={styles.componentText}>Sell Signal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.component}>
                  <Text style={styles.componentText}>Alert</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Save Formula</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                Test Formula
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </OnboardingCoach>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  builderArea: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: 20,
  },
  canvas: {
    flex: 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  canvasPlaceholder: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  toolbox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toolboxTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  componentGroup: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  component: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  componentText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  primaryButtonText: {
    color: '#fff',
  },
});