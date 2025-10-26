import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { FormulaCard, StatCard } from '../components';
import { theme } from '../theme/theme';
import { FormulaData, StatData } from '../types';

/**
 * Example usage of FormulaCard and StatCard components
 */
export const FormulaCardExample: React.FC = () => {
  const [formulas, setFormulas] = useState<FormulaData[]>([
    {
      id: '1',
      name: 'Momentum Strategy',
      description: 'A trend-following strategy based on price momentum',
      winRate: 0.75,
      profitFactor: 1.8,
      totalTrades: 150,
      avgReturn: 0.12,
      maxDrawdown: -0.08,
      sharpeRatio: 1.5,
      performanceData: [0, 0.05, 0.12, 0.08, 0.15, 0.18, 0.22, 0.19, 0.25, 0.28],
      isSubscribed: false,
      category: 'Trend Following',
      tags: ['Momentum', 'Trend', 'Medium Risk'],
    },
    {
      id: '2',
      name: 'Mean Reversion Bot',
      description: 'A contrarian strategy that profits from price reversals',
      winRate: 0.68,
      profitFactor: 1.4,
      totalTrades: 200,
      avgReturn: 0.08,
      maxDrawdown: -0.12,
      sharpeRatio: 1.2,
      performanceData: [0, -0.02, 0.03, 0.07, 0.05, 0.09, 0.06, 0.11, 0.08, 0.13],
      isSubscribed: true,
      category: 'Mean Reversion',
      tags: ['Contrarian', 'Short-term', 'High Frequency'],
    },
    {
      id: '3',
      name: 'Arbitrage Scanner',
      description: 'Identifies and exploits price discrepancies across exchanges',
      winRate: 0.92,
      profitFactor: 2.1,
      totalTrades: 50,
      avgReturn: 0.15,
      maxDrawdown: -0.03,
      sharpeRatio: 2.8,
      performanceData: [0, 0.02, 0.05, 0.08, 0.12, 0.15, 0.18, 0.21, 0.24, 0.27],
      isSubscribed: false,
      category: 'Arbitrage',
      tags: ['Low Risk', 'High Frequency', 'Automated'],
    },
  ]);

  const statsData: StatData[] = [
    {
      label: 'Total Formulas',
      value: formulas.length,
      change: 12.5,
      changeType: 'positive',
      icon: '📊',
      format: 'number',
    },
    {
      label: 'Active Subscriptions',
      value: formulas.filter(f => f.isSubscribed).length,
      change: -5.2,
      changeType: 'negative',
      icon: '🔔',
      format: 'number',
    },
    {
      label: 'Avg Win Rate',
      value: formulas.reduce((sum, f) => sum + f.winRate, 0) / formulas.length,
      change: 2.1,
      changeType: 'positive',
      icon: '🎯',
      format: 'percentage',
    },
    {
      label: 'Total Profit',
      value: 15420.50,
      change: 8.7,
      changeType: 'positive',
      icon: '💰',
      format: 'currency',
    },
  ];

  const handleSubscribe = (formulaId: string) => {
    setFormulas(prev => 
      prev.map(formula => 
        formula.id === formulaId 
          ? { ...formula, isSubscribed: !formula.isSubscribed }
          : formula
      )
    );
    
    const formula = formulas.find(f => f.id === formulaId);
    Alert.alert(
      'Subscription Updated',
      `You have ${formula?.isSubscribed ? 'unsubscribed from' : 'subscribed to'} ${formula?.name}`
    );
  };

  const handleFormulaPress = (formulaId: string) => {
    const formula = formulas.find(f => f.id === formulaId);
    Alert.alert('Formula Details', `Viewing details for ${formula?.name}`);
  };

  const handleStatPress = (statLabel: string) => {
    Alert.alert('Stat Details', `Viewing details for ${statLabel}`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Trading Components Example</Text>
      
      {/* Stats Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Overview</Text>
        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <StatCard
              key={index}
              data={stat}
              variant="elevated"
              size="md"
              clickable
              onPress={() => handleStatPress(stat.label)}
              style={styles.statCard}
            />
          ))}
        </View>
      </View>

      {/* Formula Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Formulas</Text>
        {formulas.map((formula) => (
          <FormulaCard
            key={formula.id}
            data={formula}
            variant="elevated"
            onSubscribe={handleSubscribe}
            onPress={handleFormulaPress}
            style={styles.formulaCard}
          />
        ))}
      </View>

      {/* Different Stat Card Variants */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stat Card Variants</Text>
        <View style={styles.variantsGrid}>
          <StatCard
            data={{
              label: 'Small Card',
              value: '42',
              change: 5.2,
              changeType: 'positive',
              icon: '📈',
            }}
            variant="default"
            size="sm"
            style={styles.variantCard}
          />
          <StatCard
            data={{
              label: 'Medium Card',
              value: '1,234',
              change: -2.1,
              changeType: 'negative',
              icon: '📉',
            }}
            variant="outlined"
            size="md"
            style={styles.variantCard}
          />
          <StatCard
            data={{
              label: 'Large Card',
              value: '$5,678',
              change: 0,
              changeType: 'neutral',
              icon: '💎',
            }}
            variant="filled"
            size="lg"
            style={styles.variantCard}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginVertical: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  statCard: {
    width: '48%',
    marginBottom: theme.spacing.sm,
  },
  formulaCard: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  variantsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.md,
  },
  variantCard: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
});