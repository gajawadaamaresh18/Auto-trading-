/**
 * Basket Detail Screen
 * 
 * Comprehensive screen showing basket statistics, signals, recent trades,
 * formula assignment, and management options.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
  Alert,
  Animated,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Basket, BasketSymbol } from '../components/BasketManager/BasketManager';
import theme from '../theme';

// Types and Interfaces
export interface BasketSignal {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
  signalStrength: number;
  confidence: number;
  reason: string;
  formulaId: string;
  formulaName: string;
  createdAt: string;
  status: 'ACTIVE' | 'EXECUTED' | 'EXPIRED' | 'CANCELLED';
}

export interface BasketTrade {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  pnl?: number;
  pnlPercentage?: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  createdAt: string;
  closedAt?: string;
  formulaId: string;
  formulaName: string;
}

export interface BasketAnalytics {
  totalSignals: number;
  activeSignals: number;
  executedSignals: number;
  expiredSignals: number;
  
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  sharpeRatio: number;
  
  totalPnL: number;
  totalPnLPercentage: number;
  
  bestPerformer: string;
  worstPerformer: string;
  
  signalsByFormula: Record<string, number>;
  tradesBySymbol: Record<string, number>;
  
  performanceByPeriod: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
}

export interface BasketDetailScreenProps {
  /** Basket data */
  basket: Basket;
  /** Basket signals */
  signals: BasketSignal[];
  /** Basket trades */
  trades: BasketTrade[];
  /** Basket analytics */
  analytics: BasketAnalytics;
  /** Callback when signal is selected */
  onSelectSignal: (signal: BasketSignal) => void;
  /** Callback when trade is selected */
  onSelectTrade: (trade: BasketTrade) => void;
  /** Callback when formula is assigned */
  onAssignFormula: (formulaId: string) => void;
  /** Callback when formula is unassigned */
  onUnassignFormula: (formulaId: string) => void;
  /** Callback when scan is triggered */
  onTriggerScan: () => void;
  /** Callback when basket is refreshed */
  onRefresh: () => void;
  /** Callback when basket settings are updated */
  onUpdateSettings: (settings: Partial<Basket['settings']>) => void;
  /** Additional styling */
  style?: any;
}

// Main Basket Detail Screen Component
const BasketDetailScreen: React.FC<BasketDetailScreenProps> = ({
  basket,
  signals,
  trades,
  analytics,
  onSelectSignal,
  onSelectTrade,
  onAssignFormula,
  onUnassignFormula,
  onTriggerScan,
  onRefresh,
  onUpdateSettings,
  style,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'signals' | 'trades' | 'formulas' | 'settings'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Animate screen appearance
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  }, [onRefresh]);

  // Handle trigger scan
  const handleTriggerScan = useCallback(() => {
    Alert.alert(
      'Trigger Scan',
      `Start scanning "${basket.name}" for trading signals?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Scan', 
          onPress: () => onTriggerScan()
        }
      ]
    );
  }, [basket.name, onTriggerScan]);

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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return theme.colors.success[500];
      case 'EXECUTED': return theme.colors.primary[500];
      case 'EXPIRED': return theme.colors.neutral[500];
      case 'CANCELLED': return theme.colors.error[500];
      case 'OPEN': return theme.colors.warning[500];
      case 'CLOSED': return theme.colors.success[500];
      default: return theme.colors.neutral[500];
    }
  };

  // Render basket header
  const renderBasketHeader = () => (
    <View style={styles.basketHeader}>
      <View style={styles.basketInfo}>
        <Text style={styles.basketName}>{basket.name}</Text>
        <Text style={styles.basketDescription}>{basket.description}</Text>
        <View style={styles.basketMeta}>
          <View style={[
            styles.typeBadge,
            { backgroundColor: getTypeColor(basket.type) }
          ]}>
            <Text style={styles.typeText}>{basket.type}</Text>
          </View>
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{basket.category}</Text>
          </View>
          
          {basket.isActive && (
            <View style={styles.activeBadge}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success[500]} />
              <Text style={styles.activeText}>Active</Text>
            </View>
          )}
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.scanButton}
        onPress={handleTriggerScan}
      >
        <Ionicons name="scan" size={20} color={theme.colors.text.inverse} />
        <Text style={styles.scanButtonText}>Scan</Text>
      </TouchableOpacity>
    </View>
  );

  // Render tab navigation
  const renderTabNavigation = () => (
    <View style={styles.tabNavigation}>
      {[
        { key: 'overview', label: 'Overview', icon: 'analytics' },
        { key: 'signals', label: 'Signals', icon: 'notifications' },
        { key: 'trades', label: 'Trades', icon: 'trending-up' },
        { key: 'formulas', label: 'Formulas', icon: 'calculator' },
        { key: 'settings', label: 'Settings', icon: 'settings' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabButton,
            activeTab === tab.key && styles.tabButtonActive
          ]}
          onPress={() => setActiveTab(tab.key as any)}
        >
          <Ionicons 
            name={tab.icon as any} 
            size={16} 
            color={activeTab === tab.key ? theme.colors.primary[500] : theme.colors.text.secondary} 
          />
          <Text style={[
            styles.tabButtonText,
            activeTab === tab.key && styles.tabButtonTextActive
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render overview tab
  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* Key Metrics */}
      <View style={styles.metricsSection}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Signals</Text>
            <Text style={styles.metricValue}>{analytics.totalSignals}</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Active Signals</Text>
            <Text style={styles.metricValue}>{analytics.activeSignals}</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Trades</Text>
            <Text style={styles.metricValue}>{analytics.totalTrades}</Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Win Rate</Text>
            <Text style={[
              styles.metricValue,
              { color: analytics.winRate >= 60 ? theme.colors.success[600] : theme.colors.text.primary }
            ]}>
              {analytics.winRate.toFixed(1)}%
            </Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total P&L</Text>
            <Text style={[
              styles.metricValue,
              { color: analytics.totalPnL >= 0 ? theme.colors.success[600] : theme.colors.error[600] }
            ]}>
              ₹{analytics.totalPnL.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Profit Factor</Text>
            <Text style={[
              styles.metricValue,
              { color: analytics.profitFactor >= 1.5 ? theme.colors.success[600] : theme.colors.text.primary }
            ]}>
              {analytics.profitFactor.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Performance by Period */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance by Period</Text>
        
        <View style={styles.performanceGrid}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Daily</Text>
            <Text style={[
              styles.performanceValue,
              { color: analytics.performanceByPeriod.daily >= 0 ? theme.colors.success[600] : theme.colors.error[600] }
            ]}>
              {analytics.performanceByPeriod.daily >= 0 ? '+' : ''}{analytics.performanceByPeriod.daily.toFixed(2)}%
            </Text>
          </View>
          
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Weekly</Text>
            <Text style={[
              styles.performanceValue,
              { color: analytics.performanceByPeriod.weekly >= 0 ? theme.colors.success[600] : theme.colors.error[600] }
            ]}>
              {analytics.performanceByPeriod.weekly >= 0 ? '+' : ''}{analytics.performanceByPeriod.weekly.toFixed(2)}%
            </Text>
          </View>
          
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Monthly</Text>
            <Text style={[
              styles.performanceValue,
              { color: analytics.performanceByPeriod.monthly >= 0 ? theme.colors.success[600] : theme.colors.error[600] }
            ]}>
              {analytics.performanceByPeriod.monthly >= 0 ? '+' : ''}{analytics.performanceByPeriod.monthly.toFixed(2)}%
            </Text>
          </View>
          
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Yearly</Text>
            <Text style={[
              styles.performanceValue,
              { color: analytics.performanceByPeriod.yearly >= 0 ? theme.colors.success[600] : theme.colors.error[600] }
            ]}>
              {analytics.performanceByPeriod.yearly >= 0 ? '+' : ''}{analytics.performanceByPeriod.yearly.toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Top Performers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Performers</Text>
        
        <View style={styles.performersGrid}>
          <View style={styles.performerItem}>
            <Text style={styles.performerLabel}>Best Performer</Text>
            <Text style={styles.performerValue}>{analytics.bestPerformer}</Text>
          </View>
          
          <View style={styles.performerItem}>
            <Text style={styles.performerLabel}>Worst Performer</Text>
            <Text style={styles.performerValue}>{analytics.worstPerformer}</Text>
          </View>
        </View>
      </View>

      {/* Basket Symbols */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basket Symbols ({basket.symbols.length})</Text>
        
        <View style={styles.symbolsGrid}>
          {basket.symbols.slice(0, 12).map((symbol, index) => (
            <View key={index} style={styles.symbolItem}>
              <Text style={styles.symbolText}>{symbol}</Text>
            </View>
          ))}
          {basket.symbols.length > 12 && (
            <View style={styles.symbolItem}>
              <Text style={styles.symbolText}>+{basket.symbols.length - 12} more</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );

  // Render signals tab
  const renderSignalsTab = () => (
    <FlatList
      data={signals}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.signalCard}
          onPress={() => onSelectSignal(item)}
          activeOpacity={0.8}
        >
          <View style={styles.signalHeader}>
            <View style={styles.signalInfo}>
              <Text style={styles.signalSymbol}>{item.symbol}</Text>
              <Text style={styles.signalFormula}>{item.formulaName}</Text>
            </View>
            
            <View style={styles.signalMeta}>
              <View style={[
                styles.actionBadge,
                { backgroundColor: getActionColor(item.action) }
              ]}>
                <Text style={styles.actionText}>{item.action}</Text>
              </View>
              
              <View style={[
                styles.strengthBadge,
                { backgroundColor: getSignalStrengthColor(item.signalStrength) }
              ]}>
                <Text style={styles.strengthText}>{item.signalStrength}/10</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.signalDetails}>
            <View style={styles.signalDetailRow}>
              <Text style={styles.signalDetailLabel}>Price:</Text>
              <Text style={styles.signalDetailValue}>₹{item.price.toFixed(2)}</Text>
            </View>
            
            <View style={styles.signalDetailRow}>
              <Text style={styles.signalDetailLabel}>Quantity:</Text>
              <Text style={styles.signalDetailValue}>{item.quantity}</Text>
            </View>
            
            {item.stopLoss && (
              <View style={styles.signalDetailRow}>
                <Text style={styles.signalDetailLabel}>Stop Loss:</Text>
                <Text style={styles.signalDetailValue}>₹{item.stopLoss.toFixed(2)}</Text>
              </View>
            )}
            
            {item.takeProfit && (
              <View style={styles.signalDetailRow}>
                <Text style={styles.signalDetailLabel}>Take Profit:</Text>
                <Text style={styles.signalDetailValue}>₹{item.takeProfit.toFixed(2)}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.signalFooter}>
            <Text style={styles.signalReason}>{item.reason}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) }
            ]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.tabContent}
      showsVerticalScrollIndicator={false}
    />
  );

  // Render trades tab
  const renderTradesTab = () => (
    <FlatList
      data={trades}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.tradeCard}
          onPress={() => onSelectTrade(item)}
          activeOpacity={0.8}
        >
          <View style={styles.tradeHeader}>
            <View style={styles.tradeInfo}>
              <Text style={styles.tradeSymbol}>{item.symbol}</Text>
              <Text style={styles.tradeFormula}>{item.formulaName}</Text>
            </View>
            
            <View style={styles.tradeMeta}>
              <View style={[
                styles.actionBadge,
                { backgroundColor: getActionColor(item.action) }
              ]}>
                <Text style={styles.actionText}>{item.action}</Text>
              </View>
              
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) }
              ]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.tradeDetails}>
            <View style={styles.tradeDetailRow}>
              <Text style={styles.tradeDetailLabel}>Entry Price:</Text>
              <Text style={styles.tradeDetailValue}>₹{item.entryPrice.toFixed(2)}</Text>
            </View>
            
            {item.exitPrice && (
              <View style={styles.tradeDetailRow}>
                <Text style={styles.tradeDetailLabel}>Exit Price:</Text>
                <Text style={styles.tradeDetailValue}>₹{item.exitPrice.toFixed(2)}</Text>
              </View>
            )}
            
            <View style={styles.tradeDetailRow}>
              <Text style={styles.tradeDetailLabel}>Quantity:</Text>
              <Text style={styles.tradeDetailValue}>{item.quantity}</Text>
            </View>
            
            {item.pnl !== undefined && (
              <View style={styles.tradeDetailRow}>
                <Text style={styles.tradeDetailLabel}>P&L:</Text>
                <Text style={[
                  styles.tradeDetailValue,
                  { color: item.pnl >= 0 ? theme.colors.success[600] : theme.colors.error[600] }
                ]}>
                  ₹{item.pnl.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.tradeFooter}>
            <Text style={styles.tradeDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            {item.pnlPercentage !== undefined && (
              <Text style={[
                styles.tradePnLPercentage,
                { color: item.pnlPercentage >= 0 ? theme.colors.success[600] : theme.colors.error[600] }
              ]}>
                {item.pnlPercentage >= 0 ? '+' : ''}{item.pnlPercentage.toFixed(2)}%
              </Text>
            )}
          </View>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.tabContent}
      showsVerticalScrollIndicator={false}
    />
  );

  // Render formulas tab
  const renderFormulasTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.formulasSection}>
        <View style={styles.formulasHeader}>
          <Text style={styles.sectionTitle}>Assigned Formulas ({basket.assignedFormulas.length})</Text>
          
          <TouchableOpacity
            style={styles.assignButton}
            onPress={() => setShowFormulaModal(true)}
          >
            <Ionicons name="add" size={16} color={theme.colors.primary[500]} />
            <Text style={styles.assignButtonText}>Assign Formula</Text>
          </TouchableOpacity>
        </View>
        
        {basket.assignedFormulas.map((formulaId, index) => (
          <View key={index} style={styles.formulaItem}>
            <View style={styles.formulaInfo}>
              <Text style={styles.formulaName}>Formula {formulaId}</Text>
              <Text style={styles.formulaDescription}>Trading formula for basket analysis</Text>
            </View>
            
            <View style={styles.formulaActions}>
              <TouchableOpacity
                style={styles.formulaActionButton}
                onPress={() => onUnassignFormula(formulaId)}
              >
                <Ionicons name="close-circle" size={20} color={theme.colors.error[500]} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {basket.assignedFormulas.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calculator" size={48} color={theme.colors.text.tertiary} />
            <Text style={styles.emptyStateTitle}>No Formulas Assigned</Text>
            <Text style={styles.emptyStateDescription}>
              Assign formulas to start generating trading signals for this basket.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  // Render settings tab
  const renderSettingsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Basket Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto Scan</Text>
            <Text style={styles.settingDescription}>
              Automatically scan basket for trading signals
            </Text>
          </View>
          <Switch
            value={basket.settings.autoScan}
            onValueChange={(value) => onUpdateSettings({ autoScan: value })}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive notifications for basket signals
            </Text>
          </View>
          <Switch
            value={basket.settings.notifications}
            onValueChange={(value) => onUpdateSettings({ notifications: value })}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Risk Management</Text>
            <Text style={styles.settingDescription}>
              Apply risk management rules to basket trades
            </Text>
          </View>
          <Switch
            value={basket.settings.riskManagement}
            onValueChange={(value) => onUpdateSettings({ riskManagement: value })}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Position Sizing</Text>
            <Text style={styles.settingDescription}>
              Automatically calculate position sizes
            </Text>
          </View>
          <Switch
            value={basket.settings.positionSizing}
            onValueChange={(value) => onUpdateSettings({ positionSizing: value })}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Scan Frequency</Text>
            <Text style={styles.settingDescription}>
              How often to scan the basket
            </Text>
          </View>
          <Text style={styles.settingValue}>{basket.scanFrequency}</Text>
        </View>
      </View>
    </ScrollView>
  );

  // Render active tab content
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'signals':
        return renderSignalsTab();
      case 'trades':
        return renderTradesTab();
      case 'formulas':
        return renderFormulasTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ scale: slideAnim }] },
        style,
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Basket Header */}
        {renderBasketHeader()}
        
        {/* Tab Navigation */}
        {renderTabNavigation()}
        
        {/* Active Tab Content */}
        <View style={styles.content}>
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          >
            {renderActiveTabContent()}
          </RefreshControl>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

// Helper functions
const getTypeColor = (type: string) => {
  switch (type) {
    case 'PREBUILT': return theme.colors.primary[100];
    case 'CUSTOM': return theme.colors.success[100];
    case 'SECTOR': return theme.colors.warning[100];
    case 'THEME': return theme.colors.error[100];
    default: return theme.colors.neutral[100];
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },
  
  // Basket header styles
  basketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  basketInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  basketName: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  basketDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  basketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  typeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  categoryBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.success[500],
    marginLeft: theme.spacing.xs,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  scanButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.inverse,
    marginLeft: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  // Tab navigation styles
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary[50],
  },
  tabButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  tabButtonTextActive: {
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  // Content styles
  content: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  
  // Section styles
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  
  // Metrics section styles
  metricsSection: {
    marginBottom: theme.spacing.xl,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.sm,
  },
  metricCard: {
    width: '50%',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  metricLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  metricValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  
  // Performance section styles
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.sm,
  },
  performanceItem: {
    width: '50%',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  performanceLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  performanceValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  // Performers section styles
  performersGrid: {
    flexDirection: 'row',
    marginHorizontal: -theme.spacing.sm,
  },
  performerItem: {
    flex: 1,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.sm,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  performerLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  performerValue: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  
  // Symbols section styles
  symbolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  symbolItem: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  symbolText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  // Signal card styles
  signalCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  signalInfo: {
    flex: 1,
  },
  signalSymbol: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  signalFormula: {
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
  signalDetails: {
    marginBottom: theme.spacing.md,
  },
  signalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  signalDetailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  signalDetailValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  signalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signalReason: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  
  // Trade card styles
  tradeCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  tradeInfo: {
    flex: 1,
  },
  tradeSymbol: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  tradeFormula: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  tradeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tradeDetails: {
    marginBottom: theme.spacing.md,
  },
  tradeDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  tradeDetailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  tradeDetailValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  tradeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tradeDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  tradePnLPercentage: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  // Formulas section styles
  formulasSection: {
    marginBottom: theme.spacing.xl,
  },
  formulasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
  },
  assignButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
    marginLeft: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  formulaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  formulaInfo: {
    flex: 1,
  },
  formulaName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  formulaDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  formulaActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formulaActionButton: {
    padding: theme.spacing.sm,
  },
  
  // Empty state styles
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyStateTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  emptyStateDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  
  // Settings section styles
  settingsSection: {
    marginBottom: theme.spacing.xl,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  settingDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  settingValue: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
});

export default BasketDetailScreen;
