/**
 * Risk Control Hook
 * 
 * Custom hook for managing risk settings and calculations.
 * Provides real-time risk calculations and validation.
 */

import { useState, useEffect, useCallback } from 'react';
import { RiskSettings, RiskCalculation, calculateRisk } from './RiskWidget';

export interface UseRiskControlProps {
  /** Initial risk settings */
  initialSettings: RiskSettings;
  /** Current market price */
  currentPrice: number;
  /** Available portfolio value */
  portfolioValue: number;
  /** Callback when settings change */
  onSettingsChange?: (settings: RiskSettings) => void;
}

export interface UseRiskControlReturn {
  /** Current risk settings */
  riskSettings: RiskSettings;
  /** Current risk calculation */
  calculation: RiskCalculation;
  /** Update risk settings */
  updateSettings: (updates: Partial<RiskSettings>) => void;
  /** Reset to default settings */
  resetSettings: () => void;
  /** Validate current settings */
  validateSettings: () => boolean;
  /** Get risk profile recommendations */
  getRiskRecommendations: () => string[];
}

export const useRiskControl = ({
  initialSettings,
  currentPrice,
  portfolioValue,
  onSettingsChange,
}: UseRiskControlProps): UseRiskControlReturn => {
  const [riskSettings, setRiskSettings] = useState<RiskSettings>(initialSettings);
  const [calculation, setCalculation] = useState<RiskCalculation>(
    calculateRisk(initialSettings, currentPrice, portfolioValue)
  );

  // Update calculation when settings, price, or portfolio value changes
  useEffect(() => {
    const newCalculation = calculateRisk(riskSettings, currentPrice, portfolioValue);
    setCalculation(newCalculation);
  }, [riskSettings, currentPrice, portfolioValue]);

  // Update settings helper
  const updateSettings = useCallback((updates: Partial<RiskSettings>) => {
    const newSettings = {
      ...riskSettings,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    setRiskSettings(newSettings);
    onSettingsChange?.(newSettings);
  }, [riskSettings, onSettingsChange]);

  // Reset to default settings
  const resetSettings = useCallback(() => {
    const defaultSettings = {
      ...initialSettings,
      updatedAt: new Date().toISOString()
    };
    setRiskSettings(defaultSettings);
    onSettingsChange?.(defaultSettings);
  }, [initialSettings, onSettingsChange]);

  // Validate current settings
  const validateSettings = useCallback(() => {
    return calculation.isValid;
  }, [calculation.isValid]);

  // Get risk recommendations
  const getRiskRecommendations = useCallback(() => {
    const recommendations: string[] = [];

    if (calculation.riskRewardRatio < 1 && riskSettings.takeProfit.enabled) {
      recommendations.push('Consider increasing take profit target for better risk/reward ratio');
    }

    if (calculation.portfolioRiskPercent > riskSettings.riskProfile.maxPortfolioRisk) {
      recommendations.push('Reduce position size to stay within risk limits');
    }

    if (!riskSettings.stopLoss.enabled) {
      recommendations.push('Enable stop loss to limit downside risk');
    }

    if (riskSettings.positionSizing.method === 'fixed' && calculation.positionSize > 1000) {
      recommendations.push('Consider using percentage-based position sizing for large positions');
    }

    if (riskSettings.riskProfile.riskTolerance === 'high' && calculation.portfolioRiskPercent < 1) {
      recommendations.push('You may be able to increase position size given your risk tolerance');
    }

    return recommendations;
  }, [calculation, riskSettings]);

  return {
    riskSettings,
    calculation,
    updateSettings,
    resetSettings,
    validateSettings,
    getRiskRecommendations,
  };
};

/**
 * Risk Profile Hook
 * 
 * Hook for managing risk profiles and presets.
 */

import { useState, useCallback } from 'react';

export interface RiskProfile {
  id: string;
  name: string;
  description: string;
  maxPortfolioRisk: number;
  maxDailyLoss: number;
  maxConcurrentTrades: number;
  riskTolerance: 'low' | 'medium' | 'high';
  isDefault: boolean;
}

export interface UseRiskProfileProps {
  /** Initial risk profiles */
  initialProfiles: RiskProfile[];
  /** Current active profile */
  activeProfileId?: string;
  /** Callback when profile changes */
  onProfileChange?: (profile: RiskProfile) => void;
}

export interface UseRiskProfileReturn {
  /** Available risk profiles */
  profiles: RiskProfile[];
  /** Active risk profile */
  activeProfile: RiskProfile | null;
  /** Set active profile */
  setActiveProfile: (profileId: string) => void;
  /** Create new profile */
  createProfile: (profile: Omit<RiskProfile, 'id'>) => void;
  /** Update profile */
  updateProfile: (profileId: string, updates: Partial<RiskProfile>) => void;
  /** Delete profile */
  deleteProfile: (profileId: string) => void;
  /** Get profile recommendations */
  getProfileRecommendations: (portfolioValue: number, experience: string) => RiskProfile[];
}

export const useRiskProfile = ({
  initialProfiles,
  activeProfileId,
  onProfileChange,
}: UseRiskProfileProps): UseRiskProfileReturn => {
  const [profiles, setProfiles] = useState<RiskProfile[]>(initialProfiles);
  const [activeProfile, setActiveProfileState] = useState<RiskProfile | null>(
    initialProfiles.find(p => p.id === activeProfileId) || initialProfiles.find(p => p.isDefault) || null
  );

  // Set active profile
  const setActiveProfile = useCallback((profileId: string) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      setActiveProfileState(profile);
      onProfileChange?.(profile);
    }
  }, [profiles, onProfileChange]);

  // Create new profile
  const createProfile = useCallback((profileData: Omit<RiskProfile, 'id'>) => {
    const newProfile: RiskProfile = {
      ...profileData,
      id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setProfiles(prev => [...prev, newProfile]);
  }, []);

  // Update profile
  const updateProfile = useCallback((profileId: string, updates: Partial<RiskProfile>) => {
    setProfiles(prev => prev.map(profile => 
      profile.id === profileId ? { ...profile, ...updates } : profile
    ));
    
    if (activeProfile?.id === profileId) {
      setActiveProfileState(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [activeProfile?.id]);

  // Delete profile
  const deleteProfile = useCallback((profileId: string) => {
    setProfiles(prev => prev.filter(profile => profile.id !== profileId));
    
    if (activeProfile?.id === profileId) {
      const defaultProfile = profiles.find(p => p.isDefault && p.id !== profileId);
      setActiveProfileState(defaultProfile || null);
    }
  }, [activeProfile?.id, profiles]);

  // Get profile recommendations
  const getProfileRecommendations = useCallback((portfolioValue: number, experience: string) => {
    const recommendations: RiskProfile[] = [];

    if (experience === 'beginner' || portfolioValue < 10000) {
      recommendations.push(
        profiles.find(p => p.riskTolerance === 'low') || profiles[0]
      );
    } else if (experience === 'intermediate' || portfolioValue < 100000) {
      recommendations.push(
        profiles.find(p => p.riskTolerance === 'medium') || profiles[0]
      );
    } else {
      recommendations.push(
        profiles.find(p => p.riskTolerance === 'high') || profiles[0]
      );
    }

    return recommendations.filter(Boolean);
  }, [profiles]);

  return {
    profiles,
    activeProfile,
    setActiveProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    getProfileRecommendations,
  };
};

/**
 * Risk Alert Hook
 * 
 * Hook for managing risk alerts and notifications.
 */

import { useState, useEffect, useCallback } from 'react';

export interface RiskAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  isDismissed: boolean;
}

export interface UseRiskAlertProps {
  /** Initial alerts */
  initialAlerts?: RiskAlert[];
  /** Callback when alerts change */
  onAlertsChange?: (alerts: RiskAlert[]) => void;
}

export interface UseRiskAlertReturn {
  /** Current alerts */
  alerts: RiskAlert[];
  /** Add new alert */
  addAlert: (alert: Omit<RiskAlert, 'id' | 'timestamp' | 'isRead' | 'isDismissed'>) => void;
  /** Mark alert as read */
  markAsRead: (alertId: string) => void;
  /** Dismiss alert */
  dismissAlert: (alertId: string) => void;
  /** Clear all alerts */
  clearAllAlerts: () => void;
  /** Get unread count */
  getUnreadCount: () => number;
  /** Get alerts by type */
  getAlertsByType: (type: RiskAlert['type']) => RiskAlert[];
}

export const useRiskAlert = ({
  initialAlerts = [],
  onAlertsChange,
}: UseRiskAlertProps): UseRiskAlertReturn => {
  const [alerts, setAlerts] = useState<RiskAlert[]>(initialAlerts);

  // Notify parent of alerts change
  useEffect(() => {
    onAlertsChange?.(alerts);
  }, [alerts, onAlertsChange]);

  // Add new alert
  const addAlert = useCallback((alertData: Omit<RiskAlert, 'id' | 'timestamp' | 'isRead' | 'isDismissed'>) => {
    const newAlert: RiskAlert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      isDismissed: false,
    };
    setAlerts(prev => [newAlert, ...prev]);
  }, []);

  // Mark alert as read
  const markAsRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  }, []);

  // Dismiss alert
  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isDismissed: true } : alert
    ));
  }, []);

  // Clear all alerts
  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    return alerts.filter(alert => !alert.isRead && !alert.isDismissed).length;
  }, [alerts]);

  // Get alerts by type
  const getAlertsByType = useCallback((type: RiskAlert['type']) => {
    return alerts.filter(alert => alert.type === type && !alert.isDismissed);
  }, [alerts]);

  return {
    alerts,
    addAlert,
    markAsRead,
    dismissAlert,
    clearAllAlerts,
    getUnreadCount,
    getAlertsByType,
  };
};

/**
 * Risk History Hook
 * 
 * Hook for managing risk history and analytics.
 */

import { useState, useCallback } from 'react';

export interface RiskHistoryEntry {
  id: string;
  timestamp: string;
  formulaId: string;
  entryPrice: number;
  exitPrice: number;
  positionSize: number;
  riskAmount: number;
  actualLoss: number;
  riskRewardRatio: number;
  portfolioRiskPercent: number;
  stopLossHit: boolean;
  takeProfitHit: boolean;
}

export interface RiskAnalytics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageRisk: number;
  averageReward: number;
  averageRiskRewardRatio: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalPnL: number;
}

export interface UseRiskHistoryProps {
  /** Initial history entries */
  initialHistory: RiskHistoryEntry[];
  /** Callback when history changes */
  onHistoryChange?: (history: RiskHistoryEntry[]) => void;
}

export interface UseRiskHistoryReturn {
  /** Risk history entries */
  history: RiskHistoryEntry[];
  /** Add new entry */
  addEntry: (entry: Omit<RiskHistoryEntry, 'id' | 'timestamp'>) => void;
  /** Get analytics */
  getAnalytics: () => RiskAnalytics;
  /** Get entries by formula */
  getEntriesByFormula: (formulaId: string) => RiskHistoryEntry[];
  /** Get entries by date range */
  getEntriesByDateRange: (startDate: string, endDate: string) => RiskHistoryEntry[];
  /** Clear history */
  clearHistory: () => void;
}

export const useRiskHistory = ({
  initialHistory = [],
  onHistoryChange,
}: UseRiskHistoryProps): UseRiskHistoryReturn => {
  const [history, setHistory] = useState<RiskHistoryEntry[]>(initialHistory);

  // Notify parent of history change
  const notifyChange = useCallback(() => {
    onHistoryChange?.(history);
  }, [history, onHistoryChange]);

  // Add new entry
  const addEntry = useCallback((entryData: Omit<RiskHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: RiskHistoryEntry = {
      ...entryData,
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };
    setHistory(prev => [newEntry, ...prev]);
    notifyChange();
  }, [notifyChange]);

  // Get analytics
  const getAnalytics = useCallback((): RiskAnalytics => {
    if (history.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        averageRisk: 0,
        averageReward: 0,
        averageRiskRewardRatio: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        totalPnL: 0,
      };
    }

    const winningTrades = history.filter(entry => entry.actualLoss < 0).length;
    const losingTrades = history.filter(entry => entry.actualLoss >= 0).length;
    const totalTrades = history.length;
    const winRate = (winningTrades / totalTrades) * 100;

    const averageRisk = history.reduce((sum, entry) => sum + entry.riskAmount, 0) / totalTrades;
    const averageReward = history.reduce((sum, entry) => sum + Math.abs(entry.actualLoss), 0) / totalTrades;
    const averageRiskRewardRatio = history.reduce((sum, entry) => sum + entry.riskRewardRatio, 0) / totalTrades;

    const totalPnL = history.reduce((sum, entry) => sum - entry.actualLoss, 0);

    // Calculate max drawdown (simplified)
    let maxDrawdown = 0;
    let peak = 0;
    let current = 0;
    
    for (const entry of history) {
      current -= entry.actualLoss;
      if (current > peak) {
        peak = current;
      }
      const drawdown = peak - current;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    // Calculate Sharpe ratio (simplified)
    const returns = history.map(entry => -entry.actualLoss / entry.riskAmount);
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const sharpeRatio = Math.sqrt(variance) > 0 ? avgReturn / Math.sqrt(variance) : 0;

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      averageRisk,
      averageReward,
      averageRiskRewardRatio,
      maxDrawdown,
      sharpeRatio,
      totalPnL,
    };
  }, [history]);

  // Get entries by formula
  const getEntriesByFormula = useCallback((formulaId: string) => {
    return history.filter(entry => entry.formulaId === formulaId);
  }, [history]);

  // Get entries by date range
  const getEntriesByDateRange = useCallback((startDate: string, endDate: string) => {
    return history.filter(entry => 
      entry.timestamp >= startDate && entry.timestamp <= endDate
    );
  }, [history]);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    notifyChange();
  }, [notifyChange]);

  return {
    history,
    addEntry,
    getAnalytics,
    getEntriesByFormula,
    getEntriesByDateRange,
    clearHistory,
  };
};
