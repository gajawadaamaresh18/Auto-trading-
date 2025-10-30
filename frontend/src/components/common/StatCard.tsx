/**
 * StatCard Component
 * 
 * Displays key performance metrics in a compact card format.
 * Used for portfolio overview, formula performance, and trading statistics.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

export interface StatCardProps {
  /** Stat title/label */
  title: string;
  /** Main stat value */
  value: string | number;
  /** Secondary value (e.g., percentage change) */
  secondaryValue?: string | number;
  /** Icon name from Ionicons */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Stat type for color coding */
  type?: 'profit' | 'loss' | 'neutral' | 'warning' | 'info';
  /** Whether the stat is clickable */
  clickable?: boolean;
  /** Callback when card is pressed */
  onPress?: () => void;
  /** Custom background color */
  backgroundColor?: string;
  /** Custom text color */
  textColor?: string;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Show trend indicator */
  showTrend?: boolean;
  /** Trend direction */
  trend?: 'up' | 'down' | 'neutral';
  /** Additional description */
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  secondaryValue,
  icon,
  type = 'neutral',
  clickable = false,
  onPress,
  backgroundColor,
  textColor,
  size = 'medium',
  showTrend = false,
  trend = 'neutral',
  description,
}) => {
  const getTypeColors = () => {
    switch (type) {
      case 'profit':
        return {
          primary: theme.colors.success[500],
          secondary: theme.colors.success[100],
          text: theme.colors.success[700],
        };
      case 'loss':
        return {
          primary: theme.colors.error[500],
          secondary: theme.colors.error[100],
          text: theme.colors.error[700],
        };
      case 'warning':
        return {
          primary: theme.colors.warning[500],
          secondary: theme.colors.warning[100],
          text: theme.colors.warning[700],
        };
      case 'info':
        return {
          primary: theme.colors.primary[500],
          secondary: theme.colors.primary[100],
          text: theme.colors.primary[700],
        };
      default:
        return {
          primary: theme.colors.neutral[500],
          secondary: theme.colors.neutral[100],
          text: theme.colors.neutral[700],
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          title: styles.smallTitle,
          value: styles.smallValue,
          secondaryValue: styles.smallSecondaryValue,
          iconSize: 16,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          title: styles.largeTitle,
          value: styles.largeValue,
          secondaryValue: styles.largeSecondaryValue,
          iconSize: 28,
        };
      default:
        return {
          container: styles.mediumContainer,
          title: styles.mediumTitle,
          value: styles.mediumValue,
          secondaryValue: styles.mediumSecondaryValue,
          iconSize: 20,
        };
    }
  };

  const getTrendIcon = () => {
    if (!showTrend) return null;
    
    switch (trend) {
      case 'up':
        return (
          <Ionicons 
            name="trending-up" 
            size={16} 
            color={theme.colors.success[500]} 
          />
        );
      case 'down':
        return (
          <Ionicons 
            name="trending-down" 
            size={16} 
            color={theme.colors.error[500]} 
          />
        );
      default:
        return (
          <Ionicons 
            name="remove" 
            size={16} 
            color={theme.colors.neutral[400]} 
          />
        );
    }
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      // Format numbers with appropriate precision
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      } else if (val % 1 === 0) {
        return val.toString();
      } else {
        return val.toFixed(2);
      }
    }
    return val;
  };

  const colors = getTypeColors();
  const sizeStyles = getSizeStyles();
  const cardBackgroundColor = backgroundColor || colors.secondary;
  const cardTextColor = textColor || colors.text;

  const CardContent = () => (
    <View style={[
      styles.container,
      sizeStyles.container,
      { backgroundColor: cardBackgroundColor },
    ]}>
      {/* Header with icon and title */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
              <Ionicons 
                name={icon} 
                size={sizeStyles.iconSize} 
                color={theme.colors.text.inverse} 
              />
            </View>
          )}
          <Text style={[
            styles.title,
            sizeStyles.title,
            { color: cardTextColor },
          ]}>
            {title}
          </Text>
        </View>
        
        {showTrend && (
          <View style={styles.trendContainer}>
            {getTrendIcon()}
          </View>
        )}
      </View>

      {/* Main value */}
      <View style={styles.valueContainer}>
        <Text style={[
          styles.value,
          sizeStyles.value,
          { color: cardTextColor },
        ]}>
          {formatValue(value)}
        </Text>
        
        {secondaryValue && (
          <Text style={[
            styles.secondaryValue,
            sizeStyles.secondaryValue,
            { color: colors.primary },
          ]}>
            {formatValue(secondaryValue)}
          </Text>
        )}
      </View>

      {/* Description */}
      {description && (
        <Text style={[
          styles.description,
          { color: cardTextColor },
        ]}>
          {description}
        </Text>
      )}
    </View>
  );

  if (clickable && onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.touchableContainer}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  touchableContainer: {
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  container: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  title: {
    fontWeight: theme.typography.fontWeight.medium,
    flex: 1,
  },
  trendContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.xs,
  },
  value: {
    fontWeight: theme.typography.fontWeight.bold,
    marginRight: theme.spacing.xs,
  },
  secondaryValue: {
    fontWeight: theme.typography.fontWeight.medium,
  },
  description: {
    fontSize: theme.typography.fontSize.xs,
    opacity: 0.8,
  },
  
  // Size variants
  smallContainer: {
    padding: theme.spacing.sm,
  },
  smallTitle: {
    fontSize: theme.typography.fontSize.xs,
  },
  smallValue: {
    fontSize: theme.typography.fontSize.lg,
  },
  smallSecondaryValue: {
    fontSize: theme.typography.fontSize.xs,
  },
  
  mediumContainer: {
    padding: theme.spacing.md,
  },
  mediumTitle: {
    fontSize: theme.typography.fontSize.sm,
  },
  mediumValue: {
    fontSize: theme.typography.fontSize.xl,
  },
  mediumSecondaryValue: {
    fontSize: theme.typography.fontSize.sm,
  },
  
  largeContainer: {
    padding: theme.spacing.lg,
  },
  largeTitle: {
    fontSize: theme.typography.fontSize.base,
  },
  largeValue: {
    fontSize: theme.typography.fontSize['3xl'],
  },
  largeSecondaryValue: {
    fontSize: theme.typography.fontSize.base,
  },
});

export default StatCard;
