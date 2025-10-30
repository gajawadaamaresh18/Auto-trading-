/**
 * Risk Widget Index File
 * 
 * Central export file for all risk control components and utilities.
 */

// Main Components
export { default as RiskWidget } from './RiskWidget';
export { default as RiskAlert } from './RiskAlert';
export { default as RiskAnalytics } from './RiskAnalytics';

// Hooks
export {
  useRiskControl,
  useRiskProfile,
  useRiskAlert,
  useRiskHistory,
} from './hooks/useRiskControl';

// Types and Interfaces
export type {
  RiskSettings,
  RiskCalculation,
  RiskWidgetProps,
  RiskAlert as RiskAlertType,
  RiskProfile,
  RiskHistoryEntry,
  RiskAnalytics as RiskAnalyticsType,
} from './RiskWidget';

export type {
  UseRiskControlProps,
  UseRiskControlReturn,
  UseRiskProfileProps,
  UseRiskProfileReturn,
  UseRiskAlertProps,
  UseRiskAlertReturn,
  UseRiskHistoryProps,
  UseRiskHistoryReturn,
} from './hooks/useRiskControl';

// Utility Functions
export {
  calculateRisk,
  RISK_PROFILES,
} from './RiskWidget';

// Constants
export const RISK_CONSTANTS = {
  DEFAULT_STOP_LOSS: 2.0, // 2%
  DEFAULT_TAKE_PROFIT: 4.0, // 4%
  DEFAULT_MAX_RISK: 1.0, // 1% of portfolio
  DEFAULT_MAX_DAILY_LOSS: 2.0, // 2% of portfolio
  DEFAULT_MAX_CONCURRENT_TRADES: 5,
  MIN_RISK_REWARD_RATIO: 1.0,
  MAX_PORTFOLIO_RISK: 10.0, // 10% of portfolio
  MIN_POSITION_SIZE: 1,
  MAX_POSITION_SIZE: 10000,
} as const;

export const RISK_WARNINGS = {
  HIGH_PORTFOLIO_RISK: 'Portfolio risk exceeds maximum allowed',
  LOW_RISK_REWARD: 'Risk/Reward ratio is below recommended minimum',
  NO_STOP_LOSS: 'No stop loss set - unlimited downside risk',
  LARGE_POSITION: 'Position size is unusually large',
  HIGH_CONCENTRATION: 'Too much capital concentrated in single trade',
  INSUFFICIENT_CAPITAL: 'Insufficient capital for position size',
} as const;

export const RISK_RECOMMENDATIONS = {
  CONSERVATIVE: 'Use conservative position sizing for new strategies',
  DIVERSIFY: 'Diversify across multiple strategies to reduce risk',
  MONITOR: 'Monitor positions closely during high volatility',
  ADJUST: 'Adjust position size based on market conditions',
  REVIEW: 'Review and update risk settings regularly',
} as const;
