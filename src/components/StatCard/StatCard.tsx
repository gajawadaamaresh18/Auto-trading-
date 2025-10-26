import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@theme/theme';
import { StatData } from '@types/index';

interface StatCardProps {
  /**
   * Stat data to display
   */
  data: StatData;
  
  /**
   * Card variant style
   * @default 'default'
   */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  
  /**
   * Card size
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Whether the card is clickable
   * @default false
   */
  clickable?: boolean;
  
  /**
   * Callback when card is pressed (only works if clickable is true)
   */
  onPress?: () => void;
  
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
 * StatCard component displays a single statistic with optional change indicator and icon
 * 
 * @example
 * ```tsx
 * <StatCard
 *   data={{
 *     label: 'Win Rate',
 *     value: '75.2%',
 *     change: 2.1,
 *     changeType: 'positive',
 *     icon: 'trending-up'
 *   }}
 *   variant="elevated"
 *   size="lg"
 *   clickable
 *   onPress={() => console.log('Stat pressed')}
 * />
 * ```
 */
export const StatCard: React.FC<StatCardProps> = ({
  data,
  variant = 'default',
  size = 'md',
  clickable = false,
  onPress,
  loading = false,
  style,
  testID,
}) => {
  const handlePress = () => {
    if (onPress && clickable && !loading) {
      onPress();
    }
  };

  const formatValue = (value: string | number, format?: string) => {
    if (typeof value === 'number') {
      switch (format) {
        case 'percentage':
          return `${(value * 100).toFixed(1)}%`;
        case 'currency':
          return `$${value.toFixed(2)}`;
        case 'number':
          return value.toLocaleString();
        default:
          return value.toString();
      }
    }
    return value.toString();
  };

  const getChangeColor = () => {
    switch (data.changeType) {
      case 'positive':
        return theme.colors.success;
      case 'negative':
        return theme.colors.error;
      case 'neutral':
      default:
        return theme.colors.textSecondary;
    }
  };

  const getChangeIcon = () => {
    switch (data.changeType) {
      case 'positive':
        return '↗';
      case 'negative':
        return '↘';
      case 'neutral':
      default:
        return '→';
    }
  };

  const getCardStyle = () => {
    const baseStyle = [styles.card];
    
    switch (variant) {
      case 'elevated':
        baseStyle.push(styles.elevatedCard);
        break;
      case 'outlined':
        baseStyle.push(styles.outlinedCard);
        break;
      case 'filled':
        baseStyle.push(styles.filledCard);
        break;
    }
    
    switch (size) {
      case 'sm':
        baseStyle.push(styles.smallCard);
        break;
      case 'lg':
        baseStyle.push(styles.largeCard);
        break;
      default:
        baseStyle.push(styles.mediumCard);
    }
    
    if (clickable) {
      baseStyle.push(styles.clickableCard);
    }
    
    return baseStyle;
  };

  const getValueStyle = () => {
    const baseStyle = [styles.value];
    
    switch (size) {
      case 'sm':
        baseStyle.push(styles.smallValue);
        break;
      case 'lg':
        baseStyle.push(styles.largeValue);
        break;
      default:
        baseStyle.push(styles.mediumValue);
    }
    
    return baseStyle;
  };

  const getLabelStyle = () => {
    const baseStyle = [styles.label];
    
    switch (size) {
      case 'sm':
        baseStyle.push(styles.smallLabel);
        break;
      case 'lg':
        baseStyle.push(styles.largeLabel);
        break;
      default:
        baseStyle.push(styles.mediumLabel);
    }
    
    return baseStyle;
  };

  const CardComponent = clickable ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[getCardStyle(), style]}
      onPress={handlePress}
      activeOpacity={clickable ? 0.7 : 1}
      testID={testID}
      disabled={loading}
    >
      {/* Icon */}
      {data.icon && (
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{data.icon}</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <Text style={getLabelStyle()} numberOfLines={2}>
          {data.label}
        </Text>
        
        <Text style={getValueStyle()} numberOfLines={1}>
          {formatValue(data.value, data.format)}
        </Text>
        
        {/* Change Indicator */}
        {data.change !== undefined && (
          <View style={styles.changeContainer}>
            <Text style={[styles.changeIcon, { color: getChangeColor() }]}>
              {getChangeIcon()}
            </Text>
            <Text style={[styles.changeText, { color: getChangeColor() }]}>
              {Math.abs(data.change).toFixed(1)}%
            </Text>
          </View>
        )}
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>...</Text>
        </View>
      )}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  elevatedCard: {
    ...theme.shadows.sm,
  },
  outlinedCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filledCard: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  clickableCard: {
    // Additional styles for clickable cards can be added here
  },
  smallCard: {
    minHeight: 60,
    padding: theme.spacing.sm,
  },
  mediumCard: {
    minHeight: 80,
    padding: theme.spacing.md,
  },
  largeCard: {
    minHeight: 100,
    padding: theme.spacing.lg,
  },
  iconContainer: {
    marginBottom: theme.spacing.sm,
  },
  icon: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.primary,
  },
  content: {
    alignItems: 'center',
    flex: 1,
  },
  label: {
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  smallLabel: {
    fontSize: theme.typography.fontSize.xs,
  },
  mediumLabel: {
    fontSize: theme.typography.fontSize.sm,
  },
  largeLabel: {
    fontSize: theme.typography.fontSize.md,
  },
  value: {
    textAlign: 'center',
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  smallValue: {
    fontSize: theme.typography.fontSize.md,
  },
  mediumValue: {
    fontSize: theme.typography.fontSize.lg,
  },
  largeValue: {
    fontSize: theme.typography.fontSize.xl,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeIcon: {
    fontSize: theme.typography.fontSize.sm,
    marginRight: theme.spacing.xs,
  },
  changeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '500',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
  },
});