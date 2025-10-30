/**
 * BrokerButton Component
 * 
 * Displays broker connection status with icon, name, and connect/disconnect actions.
 * Used in broker management screens and settings.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

export interface BrokerButtonProps {
  /** Broker type identifier */
  brokerType: 'alpaca' | 'interactive_brokers' | 'robinhood' | 'custom';
  /** Broker display name */
  brokerName: string;
  /** Connection status */
  isConnected: boolean;
  /** Whether the broker is active */
  isActive: boolean;
  /** Account identifier */
  accountId?: string;
  /** Account display name */
  accountName?: string;
  /** Connection status message */
  statusMessage?: string;
  /** Whether to show loading state */
  loading?: boolean;
  /** Callback when connect button is pressed */
  onConnect: () => void;
  /** Callback when disconnect button is pressed */
  onDisconnect: () => void;
  /** Callback when button is pressed */
  onPress?: () => void;
  /** Button size variant */
  size?: 'small' | 'medium' | 'large';
  /** Button style variant */
  variant?: 'card' | 'button' | 'minimal';
  /** Whether to show account details */
  showAccountDetails?: boolean;
  /** Additional styling */
  style?: any;
}

const BrokerButton: React.FC<BrokerButtonProps> = ({
  brokerType,
  brokerName,
  isConnected,
  isActive,
  accountId,
  accountName,
  statusMessage,
  loading = false,
  onConnect,
  onDisconnect,
  onPress,
  size = 'medium',
  variant = 'card',
  showAccountDetails = true,
  style,
}) => {
  const getBrokerIcon = () => {
    switch (brokerType) {
      case 'alpaca':
        return 'trending-up';
      case 'interactive_brokers':
        return 'business';
      case 'robinhood':
        return 'shield-checkmark';
      case 'custom':
        return 'settings';
      default:
        return 'link';
    }
  };

  const getBrokerColor = () => {
    switch (brokerType) {
      case 'alpaca':
        return theme.colors.primary[500];
      case 'interactive_brokers':
        return theme.colors.secondary[500];
      case 'robinhood':
        return theme.colors.success[500];
      case 'custom':
        return theme.colors.neutral[500];
      default:
        return theme.colors.neutral[500];
    }
  };

  const getStatusColor = () => {
    if (!isActive) return theme.colors.neutral[400];
    if (isConnected) return theme.colors.success[500];
    return theme.colors.warning[500];
  };

  const getStatusText = () => {
    if (!isActive) return 'Inactive';
    if (isConnected) return 'Connected';
    return 'Disconnected';
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          iconSize: 16,
          title: styles.smallTitle,
          subtitle: styles.smallSubtitle,
          button: styles.smallButton,
          buttonText: styles.smallButtonText,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          iconSize: 28,
          title: styles.largeTitle,
          subtitle: styles.largeSubtitle,
          button: styles.largeButton,
          buttonText: styles.largeButtonText,
        };
      default:
        return {
          container: styles.mediumContainer,
          iconSize: 20,
          title: styles.mediumTitle,
          subtitle: styles.mediumSubtitle,
          button: styles.mediumButton,
          buttonText: styles.mediumButtonText,
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'button':
        return styles.buttonVariant;
      case 'minimal':
        return styles.minimalVariant;
      default:
        return styles.cardVariant;
    }
  };

  const brokerColor = getBrokerColor();
  const statusColor = getStatusColor();
  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const handleAction = () => {
    if (loading) return;
    
    if (isConnected) {
      onDisconnect();
    } else {
      onConnect();
    }
  };

  const CardContent = () => (
    <View style={[
      styles.container,
      sizeStyles.container,
      variantStyles,
      { borderLeftColor: brokerColor },
      style,
    ]}>
      {/* Header with icon and status */}
      <View style={styles.header}>
        <View style={styles.brokerInfo}>
          <View style={[styles.iconContainer, { backgroundColor: brokerColor }]}>
            <Ionicons 
              name={getBrokerIcon()} 
              size={sizeStyles.iconSize} 
              color={theme.colors.text.inverse} 
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={[styles.title, sizeStyles.title]}>
              {brokerName}
            </Text>
            
            {showAccountDetails && accountName && (
              <Text style={[styles.accountName, sizeStyles.subtitle]}>
                {accountName}
              </Text>
            )}
            
            {showAccountDetails && accountId && (
              <Text style={[styles.accountId, sizeStyles.subtitle]}>
                ID: {accountId}
              </Text>
            )}
          </View>
        </View>

        {/* Status indicator */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      {/* Status message */}
      {statusMessage && (
        <Text style={[styles.statusMessage, sizeStyles.subtitle]}>
          {statusMessage}
        </Text>
      )}

      {/* Action button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            sizeStyles.button,
            isConnected ? styles.disconnectButton : styles.connectButton,
            loading && styles.loadingButton,
          ]}
          onPress={handleAction}
          disabled={loading || !isActive}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator 
              size="small" 
              color={theme.colors.text.inverse} 
            />
          ) : (
            <>
              <Ionicons 
                name={isConnected ? 'close-circle' : 'add-circle'} 
                size={16} 
                color={theme.colors.text.inverse} 
              />
              <Text style={[
                styles.actionButtonText,
                sizeStyles.buttonText,
              ]}>
                {isConnected ? 'Disconnect' : 'Connect'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (onPress && variant === 'card') {
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
    borderLeftWidth: 4,
    ...theme.shadows.sm,
  },
  
  // Variant styles
  cardVariant: {
    backgroundColor: theme.colors.background.card,
  },
  buttonVariant: {
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  minimalVariant: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  brokerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  accountName: {
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  accountId: {
    color: theme.colors.text.tertiary,
    fontSize: theme.typography.fontSize.xs,
  },
  
  // Status styles
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  statusMessage: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  
  // Action styles
  actionContainer: {
    alignItems: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  connectButton: {
    backgroundColor: theme.colors.success[500],
  },
  disconnectButton: {
    backgroundColor: theme.colors.error[500],
  },
  loadingButton: {
    backgroundColor: theme.colors.neutral[400],
  },
  actionButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: theme.spacing.xs,
  },
  
  // Size variants
  smallContainer: {
    padding: theme.spacing.sm,
  },
  smallTitle: {
    fontSize: theme.typography.fontSize.sm,
  },
  smallSubtitle: {
    fontSize: theme.typography.fontSize.xs,
  },
  smallButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  smallButtonText: {
    fontSize: theme.typography.fontSize.xs,
  },
  
  mediumContainer: {
    padding: theme.spacing.md,
  },
  mediumTitle: {
    fontSize: theme.typography.fontSize.base,
  },
  mediumSubtitle: {
    fontSize: theme.typography.fontSize.sm,
  },
  mediumButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  mediumButtonText: {
    fontSize: theme.typography.fontSize.sm,
  },
  
  largeContainer: {
    padding: theme.spacing.lg,
  },
  largeTitle: {
    fontSize: theme.typography.fontSize.lg,
  },
  largeSubtitle: {
    fontSize: theme.typography.fontSize.base,
  },
  largeButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  largeButtonText: {
    fontSize: theme.typography.fontSize.base,
  },
});

export default BrokerButton;
