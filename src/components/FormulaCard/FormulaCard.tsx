import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { theme } from '@theme/theme';
import { FormulaData } from '@types/index';
import { Chart } from '../Chart/Chart';

interface FormulaCardProps {
  /**
   * Formula data to display
   */
  data: FormulaData;
  
  /**
   * Callback when subscribe button is pressed
   */
  onSubscribe?: (formulaId: string) => void;
  
  /**
   * Callback when card is pressed
   */
  onPress?: (formulaId: string) => void;
  
  /**
   * Card variant style
   * @default 'default'
   */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  
  /**
   * Whether the card is loading
   * @default false
   */
  loading?: boolean;
  
  /**
   * Custom styles for the card container
   */
  style?: any;
  
  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

/**
 * FormulaCard component displays formula information including stats, performance chart, and subscription status
 * 
 * @example
 * ```tsx
 * <FormulaCard
 *   data={{
 *     id: '1',
 *     name: 'Momentum Strategy',
 *     winRate: 0.75,
 *     profitFactor: 1.8,
 *     totalTrades: 150,
 *     avgReturn: 0.12,
 *     maxDrawdown: -0.08,
 *     sharpeRatio: 1.5,
 *     performanceData: [0, 0.05, 0.12, 0.08, 0.15, 0.18, 0.22],
 *     isSubscribed: false
 *   }}
 *   onSubscribe={(id) => console.log('Subscribe to', id)}
 *   onPress={(id) => console.log('View formula', id)}
 * />
 * ```
 */
export const FormulaCard: React.FC<FormulaCardProps> = ({
  data,
  onSubscribe,
  onPress,
  variant = 'default',
  loading = false,
  style,
  testID,
}) => {
  const handleSubscribe = () => {
    if (onSubscribe && !loading) {
      onSubscribe(data.id);
    }
  };

  const handlePress = () => {
    if (onPress && !loading) {
      onPress(data.id);
    }
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return value.toFixed(2);
  };

  const getCardStyle = () => {
    switch (variant) {
      case 'elevated':
        return [styles.card, styles.elevatedCard];
      case 'outlined':
        return [styles.card, styles.outlinedCard];
      case 'filled':
        return [styles.card, styles.filledCard];
      default:
        return styles.card;
    }
  };

  const getSubscribeButtonStyle = () => {
    if (data.isSubscribed) {
      return [styles.subscribeButton, styles.subscribedButton];
    }
    return [styles.subscribeButton, styles.subscribeButtonDefault];
  };

  const getSubscribeButtonTextStyle = () => {
    if (data.isSubscribed) {
      return [styles.subscribeButtonText, styles.subscribedButtonText];
    }
    return [styles.subscribeButtonText, styles.subscribeButtonTextDefault];
  };

  return (
    <TouchableOpacity
      style={[getCardStyle(), style]}
      onPress={handlePress}
      activeOpacity={0.7}
      testID={testID}
      disabled={loading}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.formulaName} numberOfLines={1}>
            {data.name}
          </Text>
          {data.category && (
            <Text style={styles.category} numberOfLines={1}>
              {data.category}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={getSubscribeButtonStyle()}
          onPress={handleSubscribe}
          disabled={loading}
          testID={`${testID}-subscribe-button`}
        >
          <Text style={getSubscribeButtonTextStyle()}>
            {data.isSubscribed ? 'Subscribed' : 'Subscribe'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Win Rate</Text>
          <Text style={styles.statValue}>
            {formatPercentage(data.winRate)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Profit Factor</Text>
          <Text style={styles.statValue}>
            {formatNumber(data.profitFactor)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Trades</Text>
          <Text style={styles.statValue}>
            {data.totalTrades}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Avg Return</Text>
          <Text style={styles.statValue}>
            {formatPercentage(data.avgReturn)}
          </Text>
        </View>
      </View>

      {/* Performance Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Performance</Text>
        <Chart
          data={{
            labels: data.performanceData.map((_, index) => `Day ${index + 1}`),
            datasets: [{
              data: data.performanceData,
              color: data.avgReturn >= 0 ? theme.colors.chartGreen : theme.colors.chartRed,
              strokeWidth: 2,
            }]
          }}
          height={60}
          showLabels={false}
          showGrid={false}
          variant="sparkline"
        />
      </View>

      {/* Additional Stats */}
      <View style={styles.additionalStats}>
        <View style={styles.additionalStatItem}>
          <Text style={styles.additionalStatLabel}>Max Drawdown</Text>
          <Text style={[styles.additionalStatValue, { color: theme.colors.error }]}>
            {formatPercentage(data.maxDrawdown)}
          </Text>
        </View>
        <View style={styles.additionalStatItem}>
          <Text style={styles.additionalStatLabel}>Sharpe Ratio</Text>
          <Text style={styles.additionalStatValue}>
            {formatNumber(data.sharpeRatio)}
          </Text>
        </View>
      </View>

      {/* Tags */}
      {data.tags && data.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {data.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {data.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{data.tags.length - 3} more</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.sm,
  },
  elevatedCard: {
    ...theme.shadows.md,
  },
  outlinedCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filledCard: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  formulaName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  category: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  subscribeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  subscribeButtonDefault: {
    backgroundColor: theme.colors.primary,
  },
  subscribedButton: {
    backgroundColor: theme.colors.success,
  },
  subscribeButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
  },
  subscribeButtonTextDefault: {
    color: theme.colors.white,
  },
  subscribedButtonText: {
    color: theme.colors.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  statItem: {
    width: '48%',
    marginBottom: theme.spacing.sm,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  chartContainer: {
    marginBottom: theme.spacing.md,
  },
  chartTitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  additionalStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  additionalStatLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  additionalStatValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  tagText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  moreTagsText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
  },
});