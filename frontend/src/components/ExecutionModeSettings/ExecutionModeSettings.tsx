/**
 * Execution Mode Settings Component
 * 
 * Settings screen component for configuring trade execution modes
 * (auto, manual, alert-only) per formula subscription.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import theme from '../theme';

// Types and Interfaces
export interface ExecutionModeSettings {
  id: string;
  formulaId: string;
  formulaName: string;
  executionMode: 'AUTO' | 'MANUAL' | 'ALERT_ONLY';
  
  // Auto Mode Settings
  autoSettings: {
    enabled: boolean;
    maxRiskPerTrade: number;
    maxDailyTrades: number;
    requireConfirmation: boolean;
    confirmationTimeout: number; // seconds
  };
  
  // Manual Mode Settings
  manualSettings: {
    enabled: boolean;
    showPreview: boolean;
    allowAdjustments: boolean;
    defaultQuantity: number;
    defaultStopLoss: number;
    defaultTakeProfit: number;
  };
  
  // Alert Only Settings
  alertSettings: {
    enabled: boolean;
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    alertFrequency: 'IMMEDIATE' | 'HOURLY' | 'DAILY';
  };
  
  // Global Settings
  globalSettings: {
    riskManagement: boolean;
    positionSizing: boolean;
    stopLossRequired: boolean;
    takeProfitRequired: boolean;
    maxPositionSize: number;
    maxDailyRisk: number;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionModeSettingsProps {
  /** Current execution mode settings */
  settings: ExecutionModeSettings;
  /** Callback when settings are updated */
  onUpdateSettings: (settings: ExecutionModeSettings) => void;
  /** Callback when settings are saved */
  onSaveSettings: (settings: ExecutionModeSettings) => void;
  /** Additional styling */
  style?: any;
}

// Main Execution Mode Settings Component
const ExecutionModeSettings: React.FC<ExecutionModeSettingsProps> = ({
  settings,
  onUpdateSettings,
  onSaveSettings,
  style,
}) => {
  const [localSettings, setLocalSettings] = useState<ExecutionModeSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Handle execution mode change
  const handleExecutionModeChange = useCallback((mode: 'AUTO' | 'MANUAL' | 'ALERT_ONLY') => {
    const updatedSettings = {
      ...localSettings,
      executionMode: mode,
      autoSettings: {
        ...localSettings.autoSettings,
        enabled: mode === 'AUTO',
      },
      manualSettings: {
        ...localSettings.manualSettings,
        enabled: mode === 'MANUAL',
      },
      alertSettings: {
        ...localSettings.alertSettings,
        enabled: mode === 'ALERT_ONLY',
      },
    };
    
    setLocalSettings(updatedSettings);
    setHasChanges(true);
    onUpdateSettings(updatedSettings);
  }, [localSettings, onUpdateSettings]);

  // Handle auto settings change
  const handleAutoSettingsChange = useCallback((key: string, value: any) => {
    const updatedSettings = {
      ...localSettings,
      autoSettings: {
        ...localSettings.autoSettings,
        [key]: value,
      },
    };
    
    setLocalSettings(updatedSettings);
    setHasChanges(true);
    onUpdateSettings(updatedSettings);
  }, [localSettings, onUpdateSettings]);

  // Handle manual settings change
  const handleManualSettingsChange = useCallback((key: string, value: any) => {
    const updatedSettings = {
      ...localSettings,
      manualSettings: {
        ...localSettings.manualSettings,
        [key]: value,
      },
    };
    
    setLocalSettings(updatedSettings);
    setHasChanges(true);
    onUpdateSettings(updatedSettings);
  }, [localSettings, onUpdateSettings]);

  // Handle alert settings change
  const handleAlertSettingsChange = useCallback((key: string, value: any) => {
    const updatedSettings = {
      ...localSettings,
      alertSettings: {
        ...localSettings.alertSettings,
        [key]: value,
      },
    };
    
    setLocalSettings(updatedSettings);
    setHasChanges(true);
    onUpdateSettings(updatedSettings);
  }, [localSettings, onUpdateSettings]);

  // Handle global settings change
  const handleGlobalSettingsChange = useCallback((key: string, value: any) => {
    const updatedSettings = {
      ...localSettings,
      globalSettings: {
        ...localSettings.globalSettings,
        [key]: value,
      },
    };
    
    setLocalSettings(updatedSettings);
    setHasChanges(true);
    onUpdateSettings(updatedSettings);
  }, [localSettings, onUpdateSettings]);

  // Handle save settings
  const handleSaveSettings = useCallback(() => {
    if (hasChanges) {
      onSaveSettings(localSettings);
      setHasChanges(false);
      
      Alert.alert(
        'Settings Saved',
        'Your execution mode settings have been saved successfully.',
        [{ text: 'OK' }]
      );
    }
  }, [hasChanges, localSettings, onSaveSettings]);

  // Render execution mode selector
  const renderExecutionModeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Execution Mode</Text>
      <Text style={styles.sectionDescription}>
        Choose how trades from this formula should be executed.
      </Text>
      
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[
            styles.modeOption,
            localSettings.executionMode === 'AUTO' && styles.modeOptionActive
          ]}
          onPress={() => handleExecutionModeChange('AUTO')}
        >
          <View style={styles.modeHeader}>
            <Ionicons 
              name="play-circle" 
              size={24} 
              color={localSettings.executionMode === 'AUTO' ? theme.colors.success[500] : theme.colors.text.secondary} 
            />
            <Text style={[
              styles.modeTitle,
              localSettings.executionMode === 'AUTO' && styles.modeTitleActive
            ]}>
              Auto Execute
            </Text>
          </View>
          <Text style={styles.modeDescription}>
            Automatically execute trades without manual approval
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.modeOption,
            localSettings.executionMode === 'MANUAL' && styles.modeOptionActive
          ]}
          onPress={() => handleExecutionModeChange('MANUAL')}
        >
          <View style={styles.modeHeader}>
            <Ionicons 
              name="hand-left" 
              size={24} 
              color={localSettings.executionMode === 'MANUAL' ? theme.colors.warning[500] : theme.colors.text.secondary} 
            />
            <Text style={[
              styles.modeTitle,
              localSettings.executionMode === 'MANUAL' && styles.modeTitleActive
            ]}>
              Manual Approval
            </Text>
          </View>
          <Text style={styles.modeDescription}>
            Require manual approval before executing trades
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.modeOption,
            localSettings.executionMode === 'ALERT_ONLY' && styles.modeOptionActive
          ]}
          onPress={() => handleExecutionModeChange('ALERT_ONLY')}
        >
          <View style={styles.modeHeader}>
            <Ionicons 
              name="notifications" 
              size={24} 
              color={localSettings.executionMode === 'ALERT_ONLY' ? theme.colors.primary[500] : theme.colors.text.secondary} 
            />
            <Text style={[
              styles.modeTitle,
              localSettings.executionMode === 'ALERT_ONLY' && styles.modeTitleActive
            ]}>
              Alert Only
            </Text>
          </View>
          <Text style={styles.modeDescription}>
            Send alerts only, no automatic execution
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render auto mode settings
  const renderAutoModeSettings = () => {
    if (localSettings.executionMode !== 'AUTO') return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Auto Execution Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Max Risk Per Trade</Text>
            <Text style={styles.settingDescription}>
              Maximum risk percentage per trade
            </Text>
          </View>
          <Text style={styles.settingValue}>
            {localSettings.autoSettings.maxRiskPerTrade}%
          </Text>
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Max Daily Trades</Text>
            <Text style={styles.settingDescription}>
              Maximum number of trades per day
            </Text>
          </View>
          <Text style={styles.settingValue}>
            {localSettings.autoSettings.maxDailyTrades}
          </Text>
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Require Confirmation</Text>
            <Text style={styles.settingDescription}>
              Show confirmation before executing
            </Text>
          </View>
          <Switch
            value={localSettings.autoSettings.requireConfirmation}
            onValueChange={(value) => handleAutoSettingsChange('requireConfirmation', value)}
            trackColor={{ false: theme.colors.neutral[300], true: theme.colors.success[300] }}
            thumbColor={localSettings.autoSettings.requireConfirmation ? theme.colors.success[500] : theme.colors.neutral[500]}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Confirmation Timeout</Text>
            <Text style={styles.settingDescription}>
              Time to wait for confirmation (seconds)
            </Text>
          </View>
          <Text style={styles.settingValue}>
            {localSettings.autoSettings.confirmationTimeout}s
          </Text>
        </View>
      </View>
    );
  };

  // Render manual mode settings
  const renderManualModeSettings = () => {
    if (localSettings.executionMode !== 'MANUAL') return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manual Approval Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Show Preview</Text>
            <Text style={styles.settingDescription}>
              Display trade details before approval
            </Text>
          </View>
          <Switch
            value={localSettings.manualSettings.showPreview}
            onValueChange={(value) => handleManualSettingsChange('showPreview', value)}
            trackColor={{ false: theme.colors.neutral[300], true: theme.colors.warning[300] }}
            thumbColor={localSettings.manualSettings.showPreview ? theme.colors.warning[500] : theme.colors.neutral[500]}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Allow Adjustments</Text>
            <Text style={styles.settingDescription}>
              Allow modifying trade parameters
            </Text>
          </View>
          <Switch
            value={localSettings.manualSettings.allowAdjustments}
            onValueChange={(value) => handleManualSettingsChange('allowAdjustments', value)}
            trackColor={{ false: theme.colors.neutral[300], true: theme.colors.warning[300] }}
            thumbColor={localSettings.manualSettings.allowAdjustments ? theme.colors.warning[500] : theme.colors.neutral[500]}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Default Quantity</Text>
            <Text style={styles.settingDescription}>
              Default number of shares/units
            </Text>
          </View>
          <Text style={styles.settingValue}>
            {localSettings.manualSettings.defaultQuantity}
          </Text>
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Default Stop Loss</Text>
            <Text style={styles.settingDescription}>
              Default stop loss percentage
            </Text>
          </View>
          <Text style={styles.settingValue}>
            {localSettings.manualSettings.defaultStopLoss}%
          </Text>
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Default Take Profit</Text>
            <Text style={styles.settingDescription}>
              Default take profit percentage
            </Text>
          </View>
          <Text style={styles.settingValue}>
            {localSettings.manualSettings.defaultTakeProfit}%
          </Text>
        </View>
      </View>
    );
  };

  // Render alert mode settings
  const renderAlertModeSettings = () => {
    if (localSettings.executionMode !== 'ALERT_ONLY') return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alert Settings</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Send push notifications for signals
            </Text>
          </View>
          <Switch
            value={localSettings.alertSettings.pushNotifications}
            onValueChange={(value) => handleAlertSettingsChange('pushNotifications', value)}
            trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[300] }}
            thumbColor={localSettings.alertSettings.pushNotifications ? theme.colors.primary[500] : theme.colors.neutral[500]}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Email Notifications</Text>
            <Text style={styles.settingDescription}>
              Send email notifications for signals
            </Text>
          </View>
          <Switch
            value={localSettings.alertSettings.emailNotifications}
            onValueChange={(value) => handleAlertSettingsChange('emailNotifications', value)}
            trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[300] }}
            thumbColor={localSettings.alertSettings.emailNotifications ? theme.colors.primary[500] : theme.colors.neutral[500]}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>SMS Notifications</Text>
            <Text style={styles.settingDescription}>
              Send SMS notifications for signals
            </Text>
          </View>
          <Switch
            value={localSettings.alertSettings.smsNotifications}
            onValueChange={(value) => handleAlertSettingsChange('smsNotifications', value)}
            trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[300] }}
            thumbColor={localSettings.alertSettings.smsNotifications ? theme.colors.primary[500] : theme.colors.neutral[500]}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Alert Frequency</Text>
            <Text style={styles.settingDescription}>
              How often to send alerts
            </Text>
          </View>
          <Text style={styles.settingValue}>
            {localSettings.alertSettings.alertFrequency}
          </Text>
        </View>
      </View>
    );
  };

  // Render global settings
  const renderGlobalSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Global Risk Settings</Text>
      
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Risk Management</Text>
          <Text style={styles.settingDescription}>
            Enable automatic risk management
          </Text>
        </View>
        <Switch
          value={localSettings.globalSettings.riskManagement}
          onValueChange={(value) => handleGlobalSettingsChange('riskManagement', value)}
          trackColor={{ false: theme.colors.neutral[300], true: theme.colors.error[300] }}
          thumbColor={localSettings.globalSettings.riskManagement ? theme.colors.error[500] : theme.colors.neutral[500]}
        />
      </View>
      
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Position Sizing</Text>
          <Text style={styles.settingDescription}>
            Enable automatic position sizing
          </Text>
        </View>
        <Switch
          value={localSettings.globalSettings.positionSizing}
          onValueChange={(value) => handleGlobalSettingsChange('positionSizing', value)}
          trackColor={{ false: theme.colors.neutral[300], true: theme.colors.error[300] }}
          thumbColor={localSettings.globalSettings.positionSizing ? theme.colors.error[500] : theme.colors.neutral[500]}
        />
      </View>
      
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Stop Loss Required</Text>
          <Text style={styles.settingDescription}>
            Require stop loss for all trades
          </Text>
        </View>
        <Switch
          value={localSettings.globalSettings.stopLossRequired}
          onValueChange={(value) => handleGlobalSettingsChange('stopLossRequired', value)}
          trackColor={{ false: theme.colors.neutral[300], true: theme.colors.error[300] }}
          thumbColor={localSettings.globalSettings.stopLossRequired ? theme.colors.error[500] : theme.colors.neutral[500]}
        />
      </View>
      
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Take Profit Required</Text>
          <Text style={styles.settingDescription}>
            Require take profit for all trades
          </Text>
        </View>
        <Switch
          value={localSettings.globalSettings.takeProfitRequired}
          onValueChange={(value) => handleGlobalSettingsChange('takeProfitRequired', value)}
          trackColor={{ false: theme.colors.neutral[300], true: theme.colors.error[300] }}
          thumbColor={localSettings.globalSettings.takeProfitRequired ? theme.colors.error[500] : theme.colors.neutral[500]}
        />
      </View>
      
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Max Position Size</Text>
          <Text style={styles.settingDescription}>
            Maximum position size percentage
          </Text>
        </View>
        <Text style={styles.settingValue}>
          {localSettings.globalSettings.maxPositionSize}%
        </Text>
      </View>
      
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Max Daily Risk</Text>
          <Text style={styles.settingDescription}>
            Maximum daily risk percentage
          </Text>
        </View>
        <Text style={styles.settingValue}>
          {localSettings.globalSettings.maxDailyRisk}%
        </Text>
      </View>
    </View>
  );

  // Render save button
  const renderSaveButton = () => {
    if (!hasChanges) return null;

    return (
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveSettings}
      >
        <Ionicons name="save" size={20} color={theme.colors.text.inverse} />
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={[styles.container, style]}>
      {/* Formula Info */}
      <View style={styles.header}>
        <Text style={styles.formulaName}>{localSettings.formulaName}</Text>
        <Text style={styles.formulaId}>Formula ID: {localSettings.formulaId}</Text>
      </View>

      {/* Execution Mode Selector */}
      {renderExecutionModeSelector()}

      {/* Mode-Specific Settings */}
      {renderAutoModeSettings()}
      {renderManualModeSettings()}
      {renderAlertModeSettings()}

      {/* Global Settings */}
      {renderGlobalSettings()}

      {/* Save Button */}
      {renderSaveButton()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  
  // Header styles
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  formulaName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  formulaId: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  
  // Section styles
  section: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  sectionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  
  // Mode selector styles
  modeSelector: {
    gap: theme.spacing.md,
  },
  modeOption: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    ...theme.shadows.sm,
  },
  modeOptionActive: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.primary[50],
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  modeTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  modeTitleActive: {
    color: theme.colors.primary[600],
  },
  modeDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  
  // Setting row styles
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
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
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  
  // Save button styles
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary[500],
    margin: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  saveButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.inverse,
    marginLeft: theme.spacing.sm,
  },
});

export default ExecutionModeSettings;
