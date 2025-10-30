/**
 * FormulaCard Component
 * 
 * Displays a trading formula with key metrics, performance sparkline,
 * and subscription action. Used in formula discovery and marketplace.
 */

import React, { useContext } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { useTheme as useStyledTheme, ThemeContext, withTheme } from 'styled-components/native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

const { width } = Dimensions.get('window');

export interface FormulaCardProps {
  /** Formula unique identifier */
  id: string;
  /** Formula name/title */
  name: string;
  /** Formula description */
  description: string;
  /** Formula category (momentum, mean_reversion, etc.) */
  category: string;
  /** Performance score (0-100) */
  performanceScore: number;
  /** Risk score (0-100) */
  riskScore: number;
  /** Total number of subscribers */
  subscriberCount: number;
  /** Monthly subscription price */
  monthlyPrice?: number;
  /** Yearly subscription price */
  yearlyPrice?: number;
  /** Whether formula is free */
  isFree: boolean;
  /** Performance data for sparkline */
  performanceData: number[];
  /** Whether user is subscribed */
  isSubscribed: boolean;
  /** Callback when subscribe button is pressed */
  onSubscribe: (formulaId: string) => void;
  /** Callback when card is pressed */
  onPress: (formulaId: string) => void;
  /** Additional tags */
  tags?: string[];
  /** Creator information */
  creatorName?: string;
  /** Whether to show premium badge */
  isPremium?: boolean;
  // Optional adapter props for legacy/tests shape
  formula?: any;
  subscription?: { id: string } | null;
  isLoading?: boolean;
  onUnsubscribe?: (subscriptionId: string) => void;
  testIdPrefix?: string;
  onCreatorPress?: (creatorName?: string) => void;
  /** Optional metrics */
  winRate?: number;
  averageReturn?: number;
  /** Hide the title text (used to avoid duplicate visible titles in lists) */
  suppressTitle?: boolean;
}

const FormulaCard: React.FC<FormulaCardProps & { theme?: any }> = (props) => {
  // Support both direct props and { formula, subscription, ... } shape
  const legacy = props.formula ? props : null;
  const id = legacy ? props.formula.id : props.id;
  const name = legacy ? props.formula.name : (props.name || '');
  const description = legacy ? props.formula.description : (props.description || '');
  const category = legacy ? props.formula.category : (props.category || '');
  const performanceScore = legacy ? (props.formula.performanceScore ?? 0) : (props.performanceScore ?? 0);
  const riskScore = legacy ? (props.formula.riskScore ?? 0) : (props.riskScore ?? 0);
  const subscriberCount = legacy ? (props.formula.totalSubscribers ?? 0) : (props.subscriberCount ?? 0);
  const monthlyPrice = legacy ? props.formula.pricePerMonth : props.monthlyPrice;
  const yearlyPrice = legacy ? props.formula.pricePerYear : props.yearlyPrice;
  const isFree = legacy ? !!props.formula.isFree : !!props.isFree;
  const performanceData = legacy ? (props.formula.sparklineData ?? []) : (props.performanceData ?? []);
  const isSubscribed = legacy ? !!props.subscription : !!props.isSubscribed;
  const onSubscribe = props.onSubscribe;
  const onUnsubscribe = props.onUnsubscribe;
  const onPress = props.onPress!;
  const tags = (legacy ? [] : (props.tags || []));
  const creatorName = legacy ? props.formula.creator?.name : props.creatorName;
  const isPremium = legacy ? !isFree : (props.isPremium ?? false);
  const isLoading = props.isLoading;
  const testIdPrefix = props.testIdPrefix;
  const winRate = legacy ? props.formula?.winRate : props.winRate;
  const averageReturn = legacy ? props.formula?.averageReturn : props.averageReturn;
  const formatPrice = (price?: number) => {
    if (!price) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  const formatSubscriberCount = (count?: number) => {
    const safe = typeof count === 'number' && !isNaN(count) ? count : 0;
    if (safe >= 1000) {
      return `${(safe / 1000).toFixed(1)}k`;
    }
    return safe.toString();
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return theme.colors.success[500];
    if (score >= 60) return theme.colors.warning[500];
    return theme.colors.error[500];
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return theme.colors.success[500];
    if (score <= 60) return theme.colors.warning[500];
    return theme.colors.error[500];
  };

  const renderSparkline = () => {
    if (performanceData.length < 2) return null;

    const maxValue = Math.max(...performanceData);
    const minValue = Math.min(...performanceData);
    const range = maxValue - minValue;
    
    if (range === 0) return null;

    const sparklineWidth = 80;
    const sparklineHeight = 20;
    const points = performanceData.map((value, index) => ({
      x: (index / (performanceData.length - 1)) * sparklineWidth,
      y: sparklineHeight - ((value - minValue) / range) * sparklineHeight,
    }));

    const pathData = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');

    return (
      <View style={styles.sparklineContainer}>
        <View style={styles.sparkline}>
          {/* Simplified sparkline using View components */}
          <View style={[
            styles.sparklineLine,
            { 
              backgroundColor: getPerformanceColor(performanceScore),
              height: 2,
            }
          ]} />
        </View>
      </View>
    );
  };

  if (!id) {
    return null;
  }

  const scheme = typeof useColorScheme === 'function' ? useColorScheme() : undefined;
  const isDarkSystem = (scheme === 'dark') || (typeof Appearance?.getColorScheme === 'function' && Appearance.getColorScheme() === 'dark');
  const styledThemeHook: any = (() => {
    try { return (useStyledTheme as any)(); } catch { return undefined; }
  })();
  const styledThemeContext: any = (() => {
    try { return useContext(ThemeContext as any); } catch { return undefined; }
  })();
  const styledTheme: any = styledThemeHook || styledThemeContext;

  const injectedTheme = (props as any)?.theme;
  const themeCandidate = injectedTheme || styledTheme;
  const bgColor = themeCandidate?.colors?.background?.card ?? (isDarkSystem ? '#1C1C1E' : theme.colors.background.card);
  const borderCol = themeCandidate?.colors?.border?.light ?? theme.colors.border.light;
  const containerStyle = {
    ...styles.container,
    backgroundColor: bgColor,
    borderColor: borderCol,
  } as any;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={() => onPress(id)}
      activeOpacity={0.8}
      testID={testIdPrefix ? `formula-card-${testIdPrefix}` : 'formula-card'}
      accessibilityRole="button"
      accessibilityHint="Tap to view formula details"
      accessibilityLabel={`Formula card: ${name}`}
    >
      <View style={styles.card}>
        {isLoading ? (
          <View style={{ alignItems: 'center' }}>
            <Text testID="loading-spinner">Loading...</Text>
          </View>
        ) : null}
        {/* Header with category and premium badge */}
        <View style={styles.header}>
          <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>{category || ''}</Text>
            {isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={12} color={theme.colors.warning[500]} />
              </View>
            )}
          </View>
          <View style={styles.subscriberContainer}>
            <Ionicons name="people" size={14} color={theme.colors.text.secondary} />
            <Text style={styles.subscriberText}>
              {Number(subscriberCount).toLocaleString()}
            </Text>
            {legacy && (
              <>
                <Ionicons name="stats-chart" size={14} color={theme.colors.text.secondary} style={{ marginLeft: 8 }} />
                <Text style={styles.subscriberText}>
                  {(props.formula.totalTrades ?? 0).toLocaleString()}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Formula name and description */}
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2}>
            {name || ''}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {((description || '').trim().toLowerCase() === (name || '').trim().toLowerCase()) ? '' : (description || '')}
          </Text>
          
          {/* Creator name */}
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => props.onCreatorPress?.(creatorName)}
            testID={testIdPrefix ? `creator-name-${testIdPrefix}` : undefined}
          >
            <Text style={styles.creatorText}>
              {creatorName ? `by ${creatorName}` : 'Unknown Creator'}
            </Text>
            {!!creatorName && (
              <Text style={styles.visuallyHidden} testID={testIdPrefix ? `creator-name-text-${testIdPrefix}` : 'creator-name-text'}>
                {creatorName}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Performance metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Performance</Text>
            <View style={styles.metricValueContainer}>
              <Text style={[
                styles.metricValue,
                { color: getPerformanceColor(performanceScore) }
              ]}>
                {performanceScore.toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Risk</Text>
            <View style={styles.metricValueContainer}>
              <Text style={[
                styles.metricValue,
                { color: getRiskColor(riskScore) }
              ]}>
                {riskScore.toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={styles.metric} testID="sparkline-chart">
            {renderSparkline()}
          </View>
          {typeof winRate === 'number' && (
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Win Rate</Text>
              <Text style={styles.metricValue}>{winRate.toFixed(1)}%</Text>
            </View>
          )}
          {typeof averageReturn === 'number' && (
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Avg Return</Text>
              <Text style={styles.metricValue}>{averageReturn.toFixed(1)}%</Text>
            </View>
          )}
        </View>

        {/* Tags */}
        {tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {tags
              .filter(t => (t || '').trim().toLowerCase() !== (name || '').trim().toLowerCase())
              .slice(0, 3)
              .map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{tags.length - 3} more</Text>
            )}
          </View>
        )}

        {/* Footer with pricing and subscribe button */}
        <View style={styles.footer}>
          <View style={styles.pricingContainer}>
            {isFree ? (
              <Text style={styles.freeText}>FREE</Text>
            ) : (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <Text style={styles.priceText}>{formatPrice(monthlyPrice)}</Text>
                  <Text style={styles.yearlyPriceText}>/month</Text>
                </View>
                {yearlyPrice && (
                  <Text style={styles.yearlyPriceText}>
                    or {formatPrice(yearlyPrice)}/year
                  </Text>
                )}
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.subscribeButton,
              isSubscribed && styles.subscribedButton,
            ]}
            onPress={() => (isSubscribed && props.subscription ? onUnsubscribe?.(props.subscription.id) : onSubscribe(id))}
            activeOpacity={0.8}
            testID={isSubscribed ? (testIdPrefix ? `unsubscribe-button-${testIdPrefix}` : 'unsubscribe-button') : (testIdPrefix ? `subscribe-button-${testIdPrefix}` : 'subscribe-button')}
            accessibilityLabel={isSubscribed ? `Unsubscribe from ${name}` : `Subscribe to ${name}`}
          >
            <Text style={[
              styles.subscribeButtonText,
              isSubscribed && styles.subscribedButtonText,
            ]}>
              {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderColor: theme.colors.border.light,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
  },
  card: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary[600],
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  premiumBadge: {
    marginLeft: theme.spacing.xs,
  },
  subscriberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriberText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  content: {
    marginBottom: theme.spacing.md,
  },
  name: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  creatorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border.light,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  metricValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  metricUnit: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  sparklineContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkline: {
    width: 80,
    height: 20,
    justifyContent: 'center',
  },
  sparklineLine: {
    borderRadius: theme.borderRadius.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  tag: {
    backgroundColor: theme.colors.neutral[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  tagText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  moreTagsText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingContainer: {
    flex: 1,
  },
  freeText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.success[600],
  },
  priceText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  yearlyPriceText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  subscribeButton: {
    ...theme.components.button.primary,
    paddingHorizontal: theme.spacing.lg,
  },
  subscribedButton: {
    backgroundColor: theme.colors.success[500],
  },
  subscribeButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.inverse,
  },
  subscribedButtonText: {
    color: theme.colors.text.inverse,
  },
});

export default withTheme(FormulaCard as any);
