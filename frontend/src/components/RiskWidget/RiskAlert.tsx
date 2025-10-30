/**
 * Risk Alert Component
 * 
 * Component for displaying risk alerts and notifications.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { RiskAlert } from './RiskWidget';
import theme from '../../theme';

export interface RiskAlertProps {
  /** Alert data */
  alert: RiskAlert;
  /** Callback when alert is dismissed */
  onDismiss: (alertId: string) => void;
  /** Callback when alert is read */
  onRead: (alertId: string) => void;
  /** Additional styling */
  style?: any;
}

const RiskAlertComponent: React.FC<RiskAlertProps> = ({
  alert,
  onDismiss,
  onRead,
  style,
}) => {
  const getAlertIcon = (type: RiskAlert['type']) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'error':
        return 'close-circle';
      case 'info':
        return 'information-circle';
      default:
        return 'alert-circle';
    }
  };

  const getAlertColor = (type: RiskAlert['type']) => {
    switch (type) {
      case 'warning':
        return theme.colors.warning[500];
      case 'error':
        return theme.colors.error[500];
      case 'info':
        return theme.colors.primary[500];
      default:
        return theme.colors.neutral[500];
    }
  };

  const getAlertBackgroundColor = (type: RiskAlert['type']) => {
    switch (type) {
      case 'warning':
        return theme.colors.warning[50];
      case 'error':
        return theme.colors.error[50];
      case 'info':
        return theme.colors.primary[50];
      default:
        return theme.colors.neutral[50];
    }
  };

  const handlePress = () => {
    if (!alert.isRead) {
      onRead(alert.id);
    }
  };

  const handleDismiss = () => {
    onDismiss(alert.id);
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getAlertBackgroundColor(alert.type) },
        !alert.isRead && styles.unreadContainer,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons
              name={getAlertIcon(alert.type) as any}
              size={20}
              color={getAlertColor(alert.type)}
            />
            <Text style={[styles.title, { color: getAlertColor(alert.type) }]}>
              {alert.title}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
          >
            <Ionicons name="close" size={16} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.message}>{alert.message}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.timestamp}>
            {new Date(alert.timestamp).toLocaleString()}
          </Text>
          {!alert.isRead && (
            <View style={styles.unreadDot} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  unreadContainer: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary[500],
  },
  
  content: {
    padding: theme.spacing.md,
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
  title: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    marginLeft: theme.spacing.sm,
  },
  dismissButton: {
    padding: theme.spacing.xs,
  },
  
  message: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
    marginBottom: theme.spacing.sm,
  },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
});

export default RiskAlertComponent;
