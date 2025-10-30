/**
 * NotificationCard Component
 * 
 * Displays real-time notifications for trade signals, alerts, and system messages.
 * Used in notification feeds and real-time alert systems.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

export interface NotificationCardProps {
  /** Notification unique identifier */
  id: string;
  /** Notification type */
  type: 'trade_executed' | 'formula_trigger' | 'subscription_expired' | 'review_received' | 'system_alert';
  /** Notification title */
  title: string;
  /** Notification message */
  message: string;
  /** Notification timestamp */
  timestamp: Date;
  /** Whether notification is read */
  isRead: boolean;
  /** Priority level */
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  /** Related formula ID */
  formulaId?: string;
  /** Related trade ID */
  tradeId?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
  /** Callback when notification is pressed */
  onPress: (notificationId: string) => void;
  /** Callback when mark as read is pressed */
  onMarkAsRead: (notificationId: string) => void;
  /** Callback when dismiss is pressed */
  onDismiss?: (notificationId: string) => void;
  /** Card style variant */
  variant?: 'default' | 'compact' | 'expanded';
  /** Whether to show actions */
  showActions?: boolean;
  /** Whether to show timestamp */
  showTimestamp?: boolean;
  /** Additional styling */
  style?: any;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  id,
  type,
  title,
  message,
  timestamp,
  isRead,
  priority = 'medium',
  formulaId,
  tradeId,
  metadata,
  onPress,
  onMarkAsRead,
  onDismiss,
  variant = 'default',
  showActions = true,
  showTimestamp = true,
  style,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(isRead ? 1 : 0.7)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isRead ? 1 : 0.7,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isRead, fadeAnim]);

  const getNotificationIcon = () => {
    switch (type) {
      case 'trade_executed':
        return 'checkmark-circle';
      case 'formula_trigger':
        return 'flash';
      case 'subscription_expired':
        return 'time';
      case 'review_received':
        return 'star';
      case 'system_alert':
        return 'warning';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = () => {
    switch (type) {
      case 'trade_executed':
        return theme.colors.success[500];
      case 'formula_trigger':
        return theme.colors.primary[500];
      case 'subscription_expired':
        return theme.colors.warning[500];
      case 'review_received':
        return theme.colors.secondary[500];
      case 'system_alert':
        return theme.colors.error[500];
      default:
        return theme.colors.neutral[500];
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'urgent':
        return theme.colors.error[500];
      case 'high':
        return theme.colors.warning[500];
      case 'medium':
        return theme.colors.primary[500];
      case 'low':
        return theme.colors.neutral[400];
      default:
        return theme.colors.neutral[400];
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          container: styles.compactContainer,
          title: styles.compactTitle,
          message: styles.compactMessage,
          iconSize: 16,
        };
      case 'expanded':
        return {
          container: styles.expandedContainer,
          title: styles.expandedTitle,
          message: styles.expandedMessage,
          iconSize: 24,
        };
      default:
        return {
          container: styles.defaultContainer,
          title: styles.defaultTitle,
          message: styles.defaultMessage,
          iconSize: 20,
        };
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const notificationColor = getNotificationColor();
  const priorityColor = getPriorityColor();
  const variantStyles = getVariantStyles();

  const handlePress = () => {
    onPress(id);
    if (!isRead) {
      onMarkAsRead(id);
    }
  };

  const handleMarkAsRead = (e: any) => {
    e.stopPropagation();
    onMarkAsRead(id);
  };

  const handleDismiss = (e: any) => {
    e.stopPropagation();
    onDismiss?.(id);
  };

  return (
    <Animated.View style={[{ opacity: fadeAnim }, style]}>
      <TouchableOpacity
        style={[
          styles.container,
          variantStyles.container,
          !isRead && styles.unreadContainer,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* Priority indicator */}
        <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />

        {/* Main content */}
        <View style={styles.content}>
          {/* Header with icon and timestamp */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <View style={[styles.iconBackground, { backgroundColor: notificationColor }]}>
                <Ionicons 
                  name={getNotificationIcon()} 
                  size={variantStyles.iconSize} 
                  color={theme.colors.text.inverse} 
                />
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={[styles.title, variantStyles.title]} numberOfLines={2}>
                {title}
              </Text>
              
              {showTimestamp && (
                <Text style={styles.timestamp}>
                  {formatTimestamp(timestamp)}
                </Text>
              )}
            </View>

            {/* Unread indicator */}
            {!isRead && (
              <View style={styles.unreadDot} />
            )}
          </View>

          {/* Message content */}
          <Text style={[styles.message, variantStyles.message]} numberOfLines={variant === 'expanded' ? undefined : 3}>
            {message}
          </Text>

          {/* Metadata */}
          {metadata && Object.keys(metadata).length > 0 && (
            <View style={styles.metadataContainer}>
              {Object.entries(metadata).map(([key, value]) => (
                <View key={key} style={styles.metadataItem}>
                  <Text style={styles.metadataKey}>{key}:</Text>
                  <Text style={styles.metadataValue}>{String(value)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          {showActions && (
            <View style={styles.actionsContainer}>
              {!isRead && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleMarkAsRead}
                >
                  <Ionicons name="checkmark" size={16} color={theme.colors.success[500]} />
                  <Text style={styles.actionButtonText}>Mark Read</Text>
                </TouchableOpacity>
              )}
              
              {onDismiss && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleDismiss}
                >
                  <Ionicons name="close" size={16} color={theme.colors.neutral[500]} />
                  <Text style={styles.actionButtonText}>Dismiss</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  unreadContainer: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[500],
  },
  priorityIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 1,
  },
  
  // Content styles
  content: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  iconBackground: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  timestamp: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary[500],
    marginLeft: theme.spacing.sm,
  },
  
  // Message styles
  message: {
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
    marginBottom: theme.spacing.sm,
  },
  
  // Metadata styles
  metadataContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  metadataItem: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  metadataKey: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.xs,
  },
  metadataValue: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.primary,
    flex: 1,
  },
  
  // Actions styles
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  actionButtonText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  
  // Variant styles
  defaultContainer: {
    padding: theme.spacing.md,
  },
  defaultTitle: {
    fontSize: theme.typography.fontSize.base,
  },
  defaultMessage: {
    fontSize: theme.typography.fontSize.sm,
  },
  
  compactContainer: {
    padding: theme.spacing.sm,
  },
  compactTitle: {
    fontSize: theme.typography.fontSize.sm,
  },
  compactMessage: {
    fontSize: theme.typography.fontSize.xs,
  },
  
  expandedContainer: {
    padding: theme.spacing.lg,
  },
  expandedTitle: {
    fontSize: theme.typography.fontSize.lg,
  },
  expandedMessage: {
    fontSize: theme.typography.fontSize.base,
  },
});

export default NotificationCard;
