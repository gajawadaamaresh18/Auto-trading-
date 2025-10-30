/**
 * Trade Confirmation Modal Component
 * 
 * Modal for confirming trade execution with quantity and SL/TP adjustments.
 * Shows final trade details before execution and allows last-minute modifications.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  Animated,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import theme from '../theme';

// Types and Interfaces
export interface TradeConfirmationData {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
  orderType: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  timeInForce: 'DAY' | 'GTC' | 'IOC' | 'FOK';
  
  // Market Data
  currentPrice: number;
  bidPrice: number;
  askPrice: number;
  volume: number;
  
  // Risk Management
  riskAmount: number;
  riskPercentage: number;
  positionSize: number;
  maxRisk: number;
  
  // Additional Info
  formulaName: string;
  signalStrength: number;
  confidence: number;
  reason: string;
  brokerAccountId: string;
  notes?: string;
}

export interface TradeConfirmationModalProps {
  /** Whether modal is visible */
  visible: boolean;
  /** Trade confirmation data */
  tradeData: TradeConfirmationData | null;
  /** Callback when trade is confirmed */
  onConfirm: (tradeData: TradeConfirmationData, adjustments: TradeAdjustments) => void;
  /** Callback when trade is cancelled */
  onCancel: () => void;
  /** Callback when adjustments are made */
  onAdjust?: (adjustments: TradeAdjustments) => void;
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

// Main Trade Confirmation Modal Component
const TradeConfirmationModal: React.FC<TradeConfirmationModalProps> = ({
  visible,
  tradeData,
  onConfirm,
  onCancel,
  onAdjust,
  style,
}) => {
  const [adjustments, setAdjustments] = useState<TradeAdjustments>({});
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Reset adjustments when modal opens
  useEffect(() => {
    if (visible && tradeData) {
      setAdjustments({});
      setIsAdjusting(false);
      setValidationErrors({});
      
      // Animate modal in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate modal out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, tradeData, slideAnim, fadeAnim]);

  // Validate trade data
  const validateTradeData = useCallback((data: TradeConfirmationData, adj: TradeAdjustments) => {
    const errors: Record<string, string> = {};
    
    const quantity = adj.quantity || data.quantity;
    const stopLoss = adj.stopLoss || data.stopLoss;
    const takeProfit = adj.takeProfit || data.takeProfit;
    
    if (quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }
    
    if (data.action === 'BUY' && stopLoss && stopLoss >= data.currentPrice) {
      errors.stopLoss = 'Stop loss must be below current price for buy orders';
    }
    
    if (data.action === 'SELL' && stopLoss && stopLoss <= data.currentPrice) {
      errors.stopLoss = 'Stop loss must be above current price for sell orders';
    }
    
    if (data.action === 'BUY' && takeProfit && takeProfit <= data.currentPrice) {
      errors.takeProfit = 'Take profit must be above current price for buy orders';
    }
    
    if (data.action === 'SELL' && takeProfit && takeProfit >= data.currentPrice) {
      errors.takeProfit = 'Take profit must be below current price for sell orders';
    }
    
    const riskAmount = Math.abs((stopLoss || data.currentPrice) - data.currentPrice) * quantity;
    const riskPercentage = (riskAmount / data.positionSize) * 100;
    
    if (riskPercentage > data.maxRisk) {
      errors.risk = `Risk percentage (${riskPercentage.toFixed(1)}%) exceeds maximum allowed (${data.maxRisk}%)`;
    }
    
    return errors;
  }, []);

  // Handle adjustment change
  const handleAdjustmentChange = useCallback((key: string, value: any) => {
    const newAdjustments = { ...adjustments, [key]: value };
    setAdjustments(newAdjustments);
    
    if (tradeData) {
      const errors = validateTradeData(tradeData, newAdjustments);
      setValidationErrors(errors);
      
      onAdjust?.(newAdjustments);
    }
  }, [adjustments, tradeData, validateTradeData, onAdjust]);

  // Handle confirm trade
  const handleConfirmTrade = useCallback(() => {
    if (!tradeData) return;
    
    const errors = validateTradeData(tradeData, adjustments);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      Alert.alert(
        'Validation Error',
        'Please fix the errors before confirming the trade.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    Alert.alert(
      'Confirm Trade',
      `Are you sure you want to execute this ${tradeData.action} order for ${tradeData.symbol}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            onConfirm(tradeData, adjustments);
            setAdjustments({});
            setIsAdjusting(false);
          }
        }
      ]
    );
  }, [tradeData, adjustments, validateTradeData, onConfirm]);

  // Handle cancel trade
  const handleCancelTrade = useCallback(() => {
    Alert.alert(
      'Cancel Trade',
      'Are you sure you want to cancel this trade?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: () => {
            onCancel();
            setAdjustments({});
            setIsAdjusting(false);
          }
        }
      ]
    );
  }, [onCancel]);

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

  // Render trade header
  const renderTradeHeader = () => {
    if (!tradeData) return null;

    return (
      <View style={styles.tradeHeader}>
        <View style={styles.tradeInfo}>
          <Text style={styles.symbol}>{tradeData.symbol}</Text>
          <Text style={styles.formulaName}>{tradeData.formulaName}</Text>
        </View>
        
        <View style={styles.tradeMeta}>
          <View style={[
            styles.actionBadge,
            { backgroundColor: getActionColor(tradeData.action) }
          ]}>
            <Text style={styles.actionText}>{tradeData.action}</Text>
          </View>
          
          <View style={[
            styles.strengthBadge,
            { backgroundColor: getSignalStrengthColor(tradeData.signalStrength) }
          ]}>
            <Text style={styles.strengthText}>{tradeData.signalStrength}/10</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render trade details
  const renderTradeDetails = () => {
    if (!tradeData) return null;

    const finalQuantity = adjustments.quantity || tradeData.quantity;
    const finalStopLoss = adjustments.stopLoss || tradeData.stopLoss;
    const finalTakeProfit = adjustments.takeProfit || tradeData.takeProfit;
    const finalOrderType = adjustments.orderType || tradeData.orderType;
    const finalTimeInForce = adjustments.timeInForce || tradeData.timeInForce;

    return (
      <View style={styles.tradeDetails}>
        <Text style={styles.detailsTitle}>Trade Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Quantity:</Text>
          <Text style={styles.detailValue}>{finalQuantity}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={styles.detailValue}>₹{tradeData.price.toFixed(2)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Current Price:</Text>
          <Text style={styles.detailValue}>₹{tradeData.currentPrice.toFixed(2)}</Text>
        </View>
        
        {finalStopLoss && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stop Loss:</Text>
            <Text style={styles.detailValue}>₹{finalStopLoss.toFixed(2)}</Text>
          </View>
        )}
        
        {finalTakeProfit && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Take Profit:</Text>
            <Text style={styles.detailValue}>₹{finalTakeProfit.toFixed(2)}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Order Type:</Text>
          <Text style={styles.detailValue}>{finalOrderType}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time in Force:</Text>
          <Text style={styles.detailValue}>{finalTimeInForce}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Risk Amount:</Text>
          <Text style={styles.detailValue}>₹{tradeData.riskAmount.toFixed(2)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Risk %:</Text>
          <Text style={styles.detailValue}>{tradeData.riskPercentage.toFixed(1)}%</Text>
        </View>
      </View>
    );
  };

  // Render adjustments section
  const renderAdjustmentsSection = () => {
    if (!tradeData) return null;

    return (
      <View style={styles.adjustmentsSection}>
        <View style={styles.adjustmentsHeader}>
          <Text style={styles.adjustmentsTitle}>Adjustments</Text>
          <TouchableOpacity
            style={styles.adjustButton}
            onPress={() => setIsAdjusting(!isAdjusting)}
          >
            <Ionicons 
              name={isAdjusting ? "chevron-up" : "chevron-down"} 
              size={16} 
              color={theme.colors.primary[500]} 
            />
            <Text style={styles.adjustButtonText}>
              {isAdjusting ? 'Hide' : 'Show'} Adjustments
            </Text>
          </TouchableOpacity>
        </View>
        
        {isAdjusting && (
          <View style={styles.adjustmentsContent}>
            <View style={styles.adjustmentField}>
              <Text style={styles.adjustmentLabel}>Quantity:</Text>
              <TextInput
                style={[
                  styles.adjustmentInput,
                  validationErrors.quantity && styles.adjustmentInputError
                ]}
                value={adjustments.quantity?.toString() || tradeData.quantity.toString()}
                onChangeText={(text) => handleAdjustmentChange('quantity', parseInt(text) || 0)}
                keyboardType="numeric"
                placeholder="Enter quantity"
              />
              {validationErrors.quantity && (
                <Text style={styles.errorText}>{validationErrors.quantity}</Text>
              )}
            </View>
            
            <View style={styles.adjustmentField}>
              <Text style={styles.adjustmentLabel}>Stop Loss:</Text>
              <TextInput
                style={[
                  styles.adjustmentInput,
                  validationErrors.stopLoss && styles.adjustmentInputError
                ]}
                value={adjustments.stopLoss?.toString() || tradeData.stopLoss?.toString() || ''}
                onChangeText={(text) => handleAdjustmentChange('stopLoss', parseFloat(text) || 0)}
                keyboardType="numeric"
                placeholder="Enter stop loss"
              />
              {validationErrors.stopLoss && (
                <Text style={styles.errorText}>{validationErrors.stopLoss}</Text>
              )}
            </View>
            
            <View style={styles.adjustmentField}>
              <Text style={styles.adjustmentLabel}>Take Profit:</Text>
              <TextInput
                style={[
                  styles.adjustmentInput,
                  validationErrors.takeProfit && styles.adjustmentInputError
                ]}
                value={adjustments.takeProfit?.toString() || tradeData.takeProfit?.toString() || ''}
                onChangeText={(text) => handleAdjustmentChange('takeProfit', parseFloat(text) || 0)}
                keyboardType="numeric"
                placeholder="Enter take profit"
              />
              {validationErrors.takeProfit && (
                <Text style={styles.errorText}>{validationErrors.takeProfit}</Text>
              )}
            </View>
            
            <View style={styles.adjustmentField}>
              <Text style={styles.adjustmentLabel}>Order Type:</Text>
              <View style={styles.orderTypeSelector}>
                {['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.orderTypeOption,
                      (adjustments.orderType || tradeData.orderType) === type && styles.orderTypeOptionActive
                    ]}
                    onPress={() => handleAdjustmentChange('orderType', type)}
                  >
                    <Text style={[
                      styles.orderTypeText,
                      (adjustments.orderType || tradeData.orderType) === type && styles.orderTypeTextActive
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.adjustmentField}>
              <Text style={styles.adjustmentLabel}>Time in Force:</Text>
              <View style={styles.timeInForceSelector}>
                {['DAY', 'GTC', 'IOC', 'FOK'].map((tif) => (
                  <TouchableOpacity
                    key={tif}
                    style={[
                      styles.timeInForceOption,
                      (adjustments.timeInForce || tradeData.timeInForce) === tif && styles.timeInForceOptionActive
                    ]}
                    onPress={() => handleAdjustmentChange('timeInForce', tif)}
                  >
                    <Text style={[
                      styles.timeInForceText,
                      (adjustments.timeInForce || tradeData.timeInForce) === tif && styles.timeInForceTextActive
                    ]}>
                      {tif}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.adjustmentField}>
              <Text style={styles.adjustmentLabel}>Notes:</Text>
              <TextInput
                style={styles.adjustmentTextArea}
                value={adjustments.notes || ''}
                onChangeText={(text) => handleAdjustmentChange('notes', text)}
                multiline
                numberOfLines={3}
                placeholder="Add any notes about this trade..."
              />
            </View>
            
            {validationErrors.risk && (
              <View style={styles.riskWarning}>
                <Ionicons name="warning" size={16} color={theme.colors.error[500]} />
                <Text style={styles.riskWarningText}>{validationErrors.risk}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  // Render action buttons
  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={handleCancelTrade}
      >
        <Ionicons name="close-circle" size={20} color={theme.colors.error[500]} />
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirmTrade}
      >
        <Ionicons name="checkmark-circle" size={20} color={theme.colors.text.inverse} />
        <Text style={styles.confirmButtonText}>Confirm & Execute</Text>
      </TouchableOpacity>
    </View>
  );

  if (!visible || !tradeData) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="pageSheet"
      onRequestClose={handleCancelTrade}
    >
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim }
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Trade</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCancelTrade}
              >
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContent}>
              {/* Trade Header */}
              {renderTradeHeader()}
              
              {/* Trade Details */}
              {renderTradeDetails()}
              
              {/* Adjustments Section */}
              {renderAdjustmentsSection()}
            </ScrollView>

            {/* Action Buttons */}
            {renderActionButtons()}
          </Animated.View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '90%',
    ...theme.shadows.lg,
  },
  
  // Modal header styles
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  
  // Scroll content styles
  scrollContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  
  // Trade header styles
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  tradeInfo: {
    flex: 1,
  },
  symbol: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  formulaName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  tradeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
  },
  actionText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  strengthBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  strengthText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  
  // Trade details styles
  tradeDetails: {
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  detailsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  
  // Adjustments section styles
  adjustmentsSection: {
    paddingVertical: theme.spacing.lg,
  },
  adjustmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  adjustmentsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  adjustButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adjustButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
    marginLeft: theme.spacing.xs,
  },
  adjustmentsContent: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  
  // Adjustment field styles
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
  adjustmentInputError: {
    borderColor: theme.colors.error[500],
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
  errorText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error[500],
    marginTop: theme.spacing.xs,
  },
  
  // Order type selector styles
  orderTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  orderTypeOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  },
  orderTypeOptionActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  orderTypeText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  orderTypeTextActive: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  // Time in force selector styles
  timeInForceSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  timeInForceOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  },
  timeInForceOptionActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  timeInForceText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  timeInForceTextActive: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  // Risk warning styles
  riskWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error[50],
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  riskWarningText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error[600],
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  
  // Action buttons styles
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    gap: theme.spacing.md,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.error[500],
    backgroundColor: theme.colors.error[50],
    flex: 1,
  },
  cancelButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.error[500],
    marginLeft: theme.spacing.sm,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.success[500],
    flex: 1,
  },
  confirmButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.inverse,
    marginLeft: theme.spacing.sm,
  },
});

export default TradeConfirmationModal;
