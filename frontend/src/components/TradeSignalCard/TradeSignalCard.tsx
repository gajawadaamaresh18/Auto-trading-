/**
 * Trade Signal Card Component
 * 
 * Displays new trading signals with complete trade details, confirmation options,
 * and approval/rejection actions. Supports different execution modes.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import theme from '../theme';

// Types and Interfaces
export interface TradeSignal {
  id: string;
  formulaId: string;
  formulaName: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
  trailingStop?: boolean;
  orderType: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  timeInForce: 'DAY' | 'GTC' | 'IOC' | 'FOK';
  executionMode: 'AUTO' | 'MANUAL' | 'ALERT_ONLY';
  
  // Signal Details
  signalStrength: number; // 1-10
  confidence: number; // 0-100%
  reason: string;
  indicators: string[];
  
  // Risk Management
  riskAmount: number;
  riskPercentage: number;
  positionSize: number;
  maxRisk: number;
  
  // Market Data
  currentPrice: number;
  bidPrice: number;
  askPrice: number;
  volume: number;
  volatility: number;
  
  // Timestamps
  signalTime: string;
  expiryTime?: string;
  
  // Status
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'EXECUTED';
  isExpired: boolean;
  
  // Additional Info
  brokerAccountId: string;
  tags: string[];
  notes?: string;
}

export interface TradeSignalCardProps {
  /** Trade signal data */
  signal: TradeSignal;
  /** Callback when signal is approved */
  onApprove: (signalId: string, adjustments?: TradeAdjustments) => void;
  /** Callback when signal is rejected */
  onReject: (signalId: string, reason?: string) => void;
  /** Callback when signal details are viewed */
  onViewDetails?: (signal: TradeSignal) => void;
  /** Callback when adjustments are made */
  onAdjust?: (signalId: string, adjustments: TradeAdjustments) => void;
  /** Whether card is expanded */
  expanded?: boolean;
  /** Additional styling */
  style?: any;
}

export interface TradeAdjustments {
  quantity?: number;
  stopLoss?: number;
  takeProfit?: number;
  orderType?: string;
  timeInForce?: string;
  notes?: string;
}

// Main Trade Signal Card Component
const TradeSignalCard: React.FC<TradeSignalCardProps> = ({
  signal,
  onApprove,
  onReject,
  onViewDetails,
  onAdjust,
  expanded = false,
  style,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [showAdjustments, setShowAdjustments] = useState(false);
  const [adjustments, setAdjustments] = useState<TradeAdjustments>({});
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  // Animate card appearance
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle approval with adjustments
  const handleApprove = useCallback(() => {
    if (signal.executionMode === 'MANUAL' && Object.keys(adjustments).length > 0) {
      onApprove(signal.id, adjustments);
    } else {
      onApprove(signal.id);
    }
    setShowAdjustments(false);
  }, [signal.id, signal.executionMode, adjustments, onApprove]);

  // Handle rejection
  const handleReject = useCallback(() => {
    Alert.alert(
      'Reject Trade Signal',
      'Are you sure you want to reject this trade signal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive',
          onPress: () => onReject(signal.id, 'User rejected')
        }
      ]
    );
  }, [signal.id, onReject]);

  // Handle adjustments
  const handleAdjustments = useCallback(() => {
    setShowAdjustments(true);
  }, []);

  // Handle signal expiration
  const handleExpiration = useCallback(() => {
    Alert.alert(
      'Signal Expired',
      'This trade signal has expired and can no longer be executed.',
      [{ text: 'OK' }]
    );
  }, []);

  // Get signal status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return theme.colors.warning[500];
      case 'APPROVED': return theme.colors.success[500];
      case 'REJECTED': return theme.colors.error[500];
      case 'EXPIRED': return theme.colors.neutral[500];
      case 'EXECUTED': return theme.colors.primary[500];
      default: return theme.colors.neutral[500];
    }
  };

  // Get action color
  const getActionColor = (action: string) => {
    return action === 'BUY' ? theme.colors.success[500] : theme.colors.error[500];
  };

  // Get signal strength color
  const getSignalStrengthColor = (strength: number) => {
    if (strength >= 8) return theme.colors.success[500];
    if (strength >= 6) return theme.colors.warning[500];
    return theme.colors.error[500];
  };

  // Render signal header
  const renderSignalHeader = () => (
    <View style={styles.signalHeader}>
      <View style={styles.signalInfo}>
        <Text style={styles.symbol}>{signal.symbol}</Text>
        <Text style={styles.formulaName}>{signal.formulaName}</Text>
      </View>
      
      <View style={styles.signalMeta}>
        <View style={[
          styles.actionBadge,
          { backgroundColor: getActionColor(signal.action) }
        ]}>
          <Text style={styles.actionText}>{signal.action}</Text>
        </View>
        
        <View style={[
          styles.strengthBadge,
          { backgroundColor: getSignalStrengthColor(signal.signalStrength) }
        ]}>
          <Text style={styles.strengthText}>{signal.signalStrength}/10</Text>
        </View>
      </View>
    </View>
  );

  // Render signal details
  const renderSignalDetails = () => (
    <View style={styles.signalDetails}>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Quantity:</Text>
        <Text style={styles.detailValue}>{signal.quantity}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Price:</Text>
        <Text style={styles.detailValue}>₹{signal.price.toFixed(2)}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Current Price:</Text>
        <Text style={styles.detailValue}>₹{signal.currentPrice.toFixed(2)}</Text>
      </View>
      
      {signal.stopLoss && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Stop Loss:</Text>
          <Text style={styles.detailValue}>₹{signal.stopLoss.toFixed(2)}</Text>
        </View>
      )}
      
      {signal.takeProfit && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Take Profit:</Text>
          <Text style={styles.detailValue}>₹{signal.takeProfit.toFixed(2)}</Text>
        </View>
      )}
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Risk Amount:</Text>
        <Text style={styles.detailValue}>₹{signal.riskAmount.toFixed(2)}</Text>
      </View>
      
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Risk %:</Text>
        <Text style={styles.detailValue}>{signal.riskPercentage.toFixed(1)}%</Text>
      </View>
    </View>
  );

  // Render signal indicators
  const renderSignalIndicators = () => (
    <View style={styles.indicatorsContainer}>
      <Text style={styles.indicatorsTitle}>Signal Indicators:</Text>
      <View style={styles.indicatorsList}>
        {signal.indicators.map((indicator, index) => (
          <View key={index} style={styles.indicatorTag}>
            <Text style={styles.indicatorText}>{indicator}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // Render signal reason
  const renderSignalReason = () => (
    <View style={styles.reasonContainer}>
      <Text style={styles.reasonTitle}>Signal Reason:</Text>
      <Text style={styles.reasonText}>{signal.reason}</Text>
    </View>
  );

  // Render action buttons
  const renderActionButtons = () => {
    if (signal.isExpired) {
      return (
        <TouchableOpacity
          style={[styles.actionButton, styles.expiredButton]}
          onPress={handleExpiration}
        >
          <Ionicons name="time" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.expiredButtonText}>Signal Expired</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.rejectButton]}
          onPress={handleReject}
        >
          <Ionicons name="close-circle" size={16} color={theme.colors.error[500]} />
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
        
        {signal.executionMode === 'MANUAL' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.adjustButton]}
            onPress={handleAdjustments}
          >
            <Ionicons name="settings" size={16} color={theme.colors.warning[500]} />
            <Text style={styles.adjustButtonText}>Adjust</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={handleApprove}
        >
          <Ionicons name="checkmark-circle" size={16} color={theme.colors.success[500]} />
          <Text style={styles.approveButtonText}>Approve & Execute</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render adjustments modal
  const renderAdjustmentsModal = () => {
    if (!showAdjustments) return null;

    return (
      <View style={styles.adjustmentsModal}>
        <View style={styles.adjustmentsContent}>
          <Text style={styles.adjustmentsTitle}>Adjust Trade Parameters</Text>
          
          <View style={styles.adjustmentField}>
            <Text style={styles.adjustmentLabel}>Quantity:</Text>
            <TextInput
              style={styles.adjustmentInput}
              value={adjustments.quantity?.toString() || signal.quantity.toString()}
              onChangeText={(text) => setAdjustments(prev => ({ ...prev, quantity: parseInt(text) || 0 }))}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.adjustmentField}>
            <Text style={styles.adjustmentLabel}>Stop Loss:</Text>
            <TextInput
              style={styles.adjustmentInput}
              value={adjustments.stopLoss?.toString() || signal.stopLoss?.toString() || ''}
              onChangeText={(text) => setAdjustments(prev => ({ ...prev, stopLoss: parseFloat(text) || 0 }))}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.adjustmentField}>
            <Text style={styles.adjustmentLabel}>Take Profit:</Text>
            <TextInput
              style={styles.adjustmentInput}
              value={adjustments.takeProfit?.toString() || signal.takeProfit?.toString() || ''}
              onChangeText={(text) => setAdjustments(prev => ({ ...prev, takeProfit: parseFloat(text) || 0 }))}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.adjustmentField}>
            <Text style={styles.adjustmentLabel}>Order Type:</Text>
            <Picker
              selectedValue={adjustments.orderType || signal.orderType}
              onValueChange={(value) => setAdjustments(prev => ({ ...prev, orderType: value }))}
            >
              <Picker.Item label="Market" value="MARKET" />
              <Picker.Item label="Limit" value="LIMIT" />
              <Picker.Item label="Stop" value="STOP" />
              <Picker.Item label="Stop Limit" value="STOP_LIMIT" />
            </Picker>
          </View>
          
          <View style={styles.adjustmentField}>
            <Text style={styles.adjustmentLabel}>Notes:</Text>
            <TextInput
              style={styles.adjustmentTextArea}
              value={adjustments.notes || ''}
              onChangeText={(text) => setAdjustments(prev => ({ ...prev, notes: text }))}
              multiline
              numberOfLines={3}
              placeholder="Add any notes about this trade..."
            />
          </View>
          
          <View style={styles.adjustmentActions}>
            <TouchableOpacity
              style={styles.adjustmentCancelButton}
              onPress={() => setShowAdjustments(false)}
            >
              <Text style={styles.adjustmentCancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.adjustmentSaveButton}
              onPress={() => {
                onAdjust?.(signal.id, adjustments);
                setShowAdjustments(false);
              }}
            >
              <Text style={styles.adjustmentSaveText}>Save Adjustments</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      {/* Signal Header */}
      {renderSignalHeader()}
      
      {/* Signal Details */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {renderSignalDetails()}
          {renderSignalIndicators()}
          {renderSignalReason()}
        </View>
      )}
      
      {/* Action Buttons */}
      {renderActionButtons()}
      
      {/* Expand/Collapse Button */}
      <TouchableOpacity
        style={styles.expandButton}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={16} 
          color={theme.colors.text.secondary} 
        />
        <Text style={styles.expandText}>
          {isExpanded ? 'Show Less' : 'Show More'}
        </Text>
      </TouchableOpacity>
      
      {/* Adjustments Modal */}
      {renderAdjustmentsModal()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  
  // Signal header styles
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  signalInfo: {
    flex: 1,
  },
  symbol: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  formulaName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  signalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  actionText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  strengthBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  strengthText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  
  // Expanded content styles
  expandedContent: {
    marginBottom: theme.spacing.md,
  },
  signalDetails: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  
  // Indicators styles
  indicatorsContainer: {
    marginBottom: theme.spacing.md,
  },
  indicatorsTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  indicatorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  indicatorTag: {
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  indicatorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
  },
  
  // Reason styles
  reasonContainer: {
    marginBottom: theme.spacing.md,
  },
  reasonTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  reasonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  
  // Action buttons styles
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  rejectButton: {
    backgroundColor: theme.colors.error[50],
    borderWidth: 1,
    borderColor: theme.colors.error[500],
  },
  rejectButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error[500],
    marginLeft: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  adjustButton: {
    backgroundColor: theme.colors.warning[50],
    borderWidth: 1,
    borderColor: theme.colors.warning[500],
  },
  adjustButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.warning[500],
    marginLeft: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  approveButton: {
    backgroundColor: theme.colors.success[50],
    borderWidth: 1,
    borderColor: theme.colors.success[500],
  },
  approveButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success[500],
    marginLeft: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  expiredButton: {
    backgroundColor: theme.colors.neutral[100],
    borderWidth: 1,
    borderColor: theme.colors.neutral[300],
    justifyContent: 'center',
  },
  expiredButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  
  // Expand button styles
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  expandText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  
  // Adjustments modal styles
  adjustmentsModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  adjustmentsContent: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '90%',
    maxHeight: '80%',
    ...theme.shadows.lg,
  },
  adjustmentsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  adjustmentField: {
    marginBottom: theme.spacing.md,
  },
  adjustmentLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  adjustmentInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
  },
  adjustmentTextArea: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
    height: 80,
    textAlignVertical: 'top',
  },
  adjustmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  adjustmentCancelButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  adjustmentCancelText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
  adjustmentSaveButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary[500],
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  adjustmentSaveText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.inverse,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.semiBold,
  },
});

export default TradeSignalCard;
