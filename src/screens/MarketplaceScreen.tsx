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

export const MarketplaceScreen: React.FC = () => {
  useCoachTrigger({
    screenName: 'MarketplaceScreen',
    componentId: 'marketplace-tab',
    delay: 1000, // Show after 1 second
  });

  return (
    <SafeAreaView style={styles.container}>
      <OnboardingCoach targetComponent="marketplace">
        <ScrollView style={styles.content}>
          <Text style={styles.title}>Marketplace</Text>
          <Text style={styles.subtitle}>
            Discover and explore trading strategies
          </Text>

          <View style={styles.categories}>
            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>Trend Following</Text>
              <Text style={styles.categoryDescription}>
                Strategies that follow market trends
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>Mean Reversion</Text>
              <Text style={styles.categoryDescription}>
                Strategies that bet on price reversals
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryCard}>
              <Text style={styles.categoryTitle}>Arbitrage</Text>
              <Text style={styles.categoryDescription}>
                Risk-free profit opportunities
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.featured}>
            <Text style={styles.sectionTitle}>Featured Strategies</Text>
            <View style={styles.strategyCard}>
              <Text style={styles.strategyName}>Golden Cross Strategy</Text>
              <Text style={styles.strategyDescription}>
                A popular trend-following strategy using moving averages
              </Text>
              <View style={styles.strategyStats}>
                <Text style={styles.stat}>+15.2% ROI</Text>
                <Text style={styles.stat}>4.2 Risk Score</Text>
                <Text style={styles.stat}>1.2k Users</Text>
              </View>
            </View>
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
  categories: {
    marginBottom: 32,
  },
  categoryCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
  },
  featured: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  strategyCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  strategyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  strategyDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  strategyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
});