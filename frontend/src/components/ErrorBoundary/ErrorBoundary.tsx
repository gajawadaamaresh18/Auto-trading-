/**
 * Error Boundary and Monitoring System
 * 
 * Comprehensive error handling, monitoring, and logging system for both
 * frontend and backend components.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import theme from '../theme';

// Types and Interfaces
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorScreen?: boolean;
}

export interface ErrorReport {
  id: string;
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: {
    componentStack: string;
    userId?: string;
    sessionId?: string;
    userAgent?: string;
    platform?: string;
    version?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'ui' | 'api' | 'broker' | 'formula' | 'trading' | 'system';
  resolved: boolean;
  metadata?: Record<string, any>;
}

// Error Boundary Component
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    this.logError(error, errorInfo);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport: ErrorReport = {
      id: this.state.errorId,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context: {
        componentStack: errorInfo.componentStack,
        userId: 'current_user_id', // Get from context
        sessionId: 'current_session_id', // Get from context
        userAgent: 'React Native App',
        platform: 'mobile',
        version: '1.0.0',
      },
      severity: this.determineSeverity(error),
      category: this.determineCategory(error),
      resolved: false,
    };

    // Send to monitoring service
    ErrorMonitoringService.logError(errorReport);
  };

  private determineSeverity = (error: Error): ErrorReport['severity'] => {
    if (error.message.includes('Network') || error.message.includes('API')) {
      return 'medium';
    }
    if (error.message.includes('Broker') || error.message.includes('Trading')) {
      return 'high';
    }
    if (error.message.includes('Critical') || error.message.includes('Fatal')) {
      return 'critical';
    }
    return 'low';
  };

  private determineCategory = (error: Error): ErrorReport['category'] => {
    if (error.message.includes('broker') || error.message.includes('Broker')) {
      return 'broker';
    }
    if (error.message.includes('formula') || error.message.includes('Formula')) {
      return 'formula';
    }
    if (error.message.includes('trade') || error.message.includes('Trade')) {
      return 'trading';
    }
    if (error.message.includes('api') || error.message.includes('API')) {
      return 'api';
    }
    return 'ui';
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  private handleReportError = () => {
    Alert.alert(
      'Report Error',
      'Would you like to send this error report to our development team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Report', onPress: () => this.sendErrorReport() },
      ]
    );
  };

  private sendErrorReport = () => {
    // Send error report to backend
    ErrorMonitoringService.sendErrorReport(this.state.errorId);
    Alert.alert('Report Sent', 'Thank you for helping us improve the app!');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      if (this.props.showErrorScreen) {
        return (
          <ErrorScreen
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            errorId={this.state.errorId}
            onRetry={this.handleRetry}
            onReportError={this.handleReportError}
          />
        );
      }

      return null;
    }

    return this.props.children;
  }
}

// Error Screen Component
interface ErrorScreenProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  onRetry: () => void;
  onReportError: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({
  error,
  errorInfo,
  errorId,
  onRetry,
  onReportError,
}) => {
  return (
    <View style={styles.errorContainer}>
      <ScrollView style={styles.errorContent}>
        <View style={styles.errorHeader}>
          <View style={styles.errorIcon}>
            <Ionicons name="warning" size={48} color={theme.colors.error[500]} />
          </View>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSubtitle}>
            We're sorry for the inconvenience. The app encountered an unexpected error.
          </Text>
        </View>

        <View style={styles.errorDetails}>
          <Text style={styles.errorDetailsTitle}>Error Details</Text>
          <Text style={styles.errorId}>Error ID: {errorId}</Text>
          
          {error && (
            <View style={styles.errorInfo}>
              <Text style={styles.errorInfoTitle}>Error Message:</Text>
              <Text style={styles.errorInfoText}>{error.message}</Text>
              
              {error.stack && (
                <>
                  <Text style={styles.errorInfoTitle}>Stack Trace:</Text>
                  <Text style={styles.errorInfoText}>{error.stack}</Text>
                </>
              )}
            </View>
          )}

          {errorInfo && (
            <View style={styles.errorInfo}>
              <Text style={styles.errorInfoTitle}>Component Stack:</Text>
              <Text style={styles.errorInfoText}>{errorInfo.componentStack}</Text>
            </View>
          )}
        </View>

        <View style={styles.errorActions}>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Ionicons name="refresh" size={20} color={theme.colors.text.inverse} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.reportButton} onPress={onReportError}>
            <Ionicons name="bug" size={20} color={theme.colors.primary[500]} />
            <Text style={styles.reportButtonText}>Report Error</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// Error Monitoring Service
export class ErrorMonitoringService {
  private static errorReports: ErrorReport[] = [];
  private static isInitialized = false;

  static initialize() {
    if (this.isInitialized) return;

    // Initialize error monitoring
    this.setupGlobalErrorHandlers();
    this.isInitialized = true;
  }

  private static setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        this.logError({
          id: `promise_${Date.now()}`,
          timestamp: new Date().toISOString(),
          error: {
            name: 'UnhandledPromiseRejection',
            message: event.reason?.message || 'Unknown promise rejection',
            stack: event.reason?.stack,
          },
          context: {
            componentStack: 'Global',
            userAgent: 'React Native App',
            platform: 'mobile',
            version: '1.0.0',
          },
          severity: 'medium',
          category: 'system',
          resolved: false,
        });
      });
    }
  }

  static logError(errorReport: ErrorReport) {
    // Add to local storage
    this.errorReports.push(errorReport);

    // Send to backend if connected
    this.sendToBackend(errorReport);

    // Log to console in development
    if (__DEV__) {
      console.error('Error logged:', errorReport);
    }
  }

  private static async sendToBackend(errorReport: ErrorReport) {
    try {
      // Send to backend API
      const response = await fetch('/api/v1/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      });

      if (!response.ok) {
        console.warn('Failed to send error report to backend');
      }
    } catch (error) {
      console.warn('Error sending error report:', error);
    }
  }

  static sendErrorReport(errorId: string) {
    const errorReport = this.errorReports.find(report => report.id === errorId);
    if (errorReport) {
      this.sendToBackend(errorReport);
    }
  }

  static getErrorReports(): ErrorReport[] {
    return this.errorReports;
  }

  static clearErrorReports() {
    this.errorReports = [];
  }

  static getErrorStats() {
    const reports = this.errorReports;
    const total = reports.length;
    const bySeverity = reports.reduce((acc, report) => {
      acc[report.severity] = (acc[report.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = reports.reduce((acc, report) => {
      acc[report.category] = (acc[report.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      bySeverity,
      byCategory,
      resolved: reports.filter(r => r.resolved).length,
      unresolved: reports.filter(r => !r.resolved).length,
    };
  }
}

// Error Context Provider
interface ErrorContextType {
  logError: (error: Error, context?: any) => void;
  logWarning: (message: string, context?: any) => void;
  logInfo: (message: string, context?: any) => void;
}

export const ErrorContext = React.createContext<ErrorContextType | null>(null);

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const logError = (error: Error, context?: any) => {
    ErrorMonitoringService.logError({
      id: `manual_${Date.now()}`,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context: {
        componentStack: 'Manual',
        ...context,
      },
      severity: 'medium',
      category: 'system',
      resolved: false,
    });
  };

  const logWarning = (message: string, context?: any) => {
    ErrorMonitoringService.logError({
      id: `warning_${Date.now()}`,
      timestamp: new Date().toISOString(),
      error: {
        name: 'Warning',
        message,
      },
      context: {
        componentStack: 'Manual',
        ...context,
      },
      severity: 'low',
      category: 'system',
      resolved: false,
    });
  };

  const logInfo = (message: string, context?: any) => {
    ErrorMonitoringService.logError({
      id: `info_${Date.now()}`,
      timestamp: new Date().toISOString(),
      error: {
        name: 'Info',
        message,
      },
      context: {
        componentStack: 'Manual',
        ...context,
      },
      severity: 'low',
      category: 'system',
      resolved: false,
    });
  };

  return (
    <ErrorContext.Provider value={{ logError, logWarning, logInfo }}>
      {children}
    </ErrorContext.Provider>
  );
};

// Hook for using error context
export const useErrorLogger = () => {
  const context = React.useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorLogger must be used within an ErrorProvider');
  }
  return context;
};

// Higher-order component for error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) => {
  return (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  errorContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },

  // Error header styles
  errorHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  errorIcon: {
    marginBottom: theme.spacing.lg,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  errorSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },

  // Error details styles
  errorDetails: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  errorDetailsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  errorId: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontFamily: 'monospace',
    marginBottom: theme.spacing.md,
  },
  errorInfo: {
    marginBottom: theme.spacing.md,
  },
  errorInfoTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  errorInfoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontFamily: 'monospace',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },

  // Error actions styles
  errorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[500],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  retryButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semiBold,
    marginLeft: theme.spacing.sm,
  },
  reportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.card,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
  },
  reportButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.semiBold,
    marginLeft: theme.spacing.sm,
  },
});

export default ErrorBoundary;
