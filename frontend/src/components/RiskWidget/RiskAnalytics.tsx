/**
 * Risk Analytics Component
 * 
 * Component for displaying risk analytics and performance metrics.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { RiskAnalytics } from './hooks/useRiskControl';
import theme from '../../theme';

export interface RiskAnalyticsProps {
  /** Analytics data */
  analytics: RiskAnalytics;
  /** Callback when period changes */
  onPeriodChange?: (period: string) => void;
  /** Current time period */
  currentPeriod?: string;
  /** Additional styling */
  style?: any;
}

const RiskAnalyticsComponent: React.FC<RiskAnalyticsProps> = ({
  analytics,
  onPeriodChange,
  currentPeriod = '30d',
  style,
}) => {
  const periods = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
    { key: '1y', label: '1 Year' },
    { key: 'all', label: 'All Time' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatRatio = (value: number) => {
    return `${value.toFixed(2)}:1`;
  };

  const getPerformanceColor = (value: number) => {
    if (value > 0) return theme.colors.success[600];
    if (value < 0) return theme.colors.error[600];
    return theme.colors.text.secondary;
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {periods.map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodButton,
            currentPeriod === period.key && styles.periodButtonActive,
          ]}
          onPress={() => onPeriodChange?.(period.key)}
        >
          <Text style={[
            styles.periodButtonText,
            currentPeriod === period.key && styles.periodButtonTextActive,
          ]}>
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverviewMetrics = () => (
    <View style={styles.overviewContainer}>
      <Text style={styles.sectionTitle}>Overview</Text>
      
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Trades</Text>
          <Text style={styles.metricValue}>{analytics.totalTrades}</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Win Rate</Text>
          <Text style={[
            styles.metricValue,
            { color: getPerformanceColor(analytics.winRate - 50) }
          ]}>
            {formatPercentage(analytics.winRate)}
          </Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total P&L</Text>
          <Text style={[
            styles.metricValue,
            { color: getPerformanceColor(analytics.totalPnL) }
          ]}>
            {formatCurrency(analytics.totalPnL)}
          </Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Max Drawdown</Text>
          <Text style={[
            styles.metricValue,
            { color: theme.colors.error[600] }
          ]}>
            {formatCurrency(analytics.maxDrawdown)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderRiskMetrics = () => (
    <View style={styles.riskContainer}>
      <Text style={styles.sectionTitle}>Risk Metrics</Text>
      
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Avg Risk</Text>
          <Text style={styles.metricValue}>{formatCurrency(analytics.averageRisk)}</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Avg Reward</Text>
          <Text style={styles.metricValue}>{formatCurrency(analytics.averageReward)}</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Avg R/R Ratio</Text>
          <Text style={[
            styles.metricValue,
            { color: analytics.averageRiskRewardRatio >= 1 ? theme.colors.success[600] : theme.colors.warning[600] }
          ]}>
            {formatRatio(analytics.averageRiskRewardRatio)}
          </Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Sharpe Ratio</Text>
          <Text style={[
            styles.metricValue,
            { color: getPerformanceColor(analytics.sharpeRatio) }
          ]}>
            {analytics.sharpeRatio.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTradeBreakdown = () => (
    <View style={styles.breakdownContainer}>
      <Text style={styles.sectionTitle}>Trade Breakdown</Text>
      
      <View style={styles.breakdownGrid}>
        <View style={styles.breakdownItem}>
          <View style={styles.breakdownHeader}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success[500]} />
            <Text style={styles.breakdownLabel}>Winning Trades</Text>
          </View>
          <Text style={styles.breakdownValue}>{analytics.winningTrades}</Text>
          <Text style={styles.breakdownPercentage}>
            {formatPercentage((analytics.winningTrades / analytics.totalTrades) * 100)}
          </Text>
        </View>
        
        <View style={styles.breakdownItem}>
          <View style={styles.breakdownHeader}>
            <Ionicons name="close-circle" size={20} color={theme.colors.error[500]} />
            <Text style={styles.breakdownLabel}>Losing Trades</Text>
          </View>
          <Text style={styles.breakdownValue}>{analytics.losingTrades}</Text>
          <Text style={styles.breakdownPercentage}>
            {formatPercentage((analytics.losingTrades / analytics.totalTrades) * 100)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderPerformanceChart = () => (
    <View style={styles.chartContainer}>
      <Text style={styles.sectionTitle}>Performance</Text>
      
      <View style={styles.chartPlaceholder}>
        <Ionicons name="bar-chart" size={48} color={theme.colors.neutral[400]} />
        <Text style={styles.chartPlaceholderText}>
          Performance chart will be displayed here
        </Text>
        <Text style={styles.chartPlaceholderSubtext}>
          Track your P&L over time
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="analytics" size={24} color={theme.colors.primary[500]} />
          <Text style={styles.title}>Risk Analytics</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        {renderPeriodSelector()}

        {/* Overview Metrics */}
        {renderOverviewMetrics()}

        {/* Risk Metrics */}
        {renderRiskMetrics()}

        {/* Trade Breakdown */}
        {renderTradeBreakdown()}

        {/* Performance Chart */}
        {renderPerformanceChart()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  
  // Content styles
  content: {
    flex: 1,
  },
  
  // Period selector styles
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary[500],
  },
  periodButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  periodButtonTextActive: {
    color: theme.colors.text.inverse,
  },
  
  // Section styles
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  
  // Overview container styles
  overviewContainer: {
    marginBottom: theme.spacing.lg,
  },
  
  // Risk container styles
  riskContainer: {
    marginBottom: theme.spacing.lg,
  },
  
  // Breakdown container styles
  breakdownContainer: {
    marginBottom: theme.spacing.lg,
  },
  
  // Chart container styles
  chartContainer: {
    marginBottom: theme.spacing.lg,
  },
  
  // Metrics grid styles
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  metricCard: {
    width: '50%',
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  metricLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  metricValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  
  // Breakdown grid styles
  breakdownGrid: {
    flexDirection: 'row',
    marginHorizontal: -theme.spacing.xs,
  },
  breakdownItem: {
    flex: 1,
    paddingHorizontal: theme.spacing.xs,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  breakdownLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  breakdownValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  breakdownPercentage: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  
  // Chart placeholder styles
  chartPlaceholder: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  chartPlaceholderText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  chartPlaceholderSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});

export default RiskAnalyticsComponent;
