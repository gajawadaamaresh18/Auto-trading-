/**
 * Component Library Index
 * 
 * Central export file for all reusable components in the trading marketplace app.
 * Provides easy imports and component discovery.
 */

// Theme system
export { default as theme } from '../theme';

// Common components
export { default as StatCard } from './common/StatCard';
export { default as ModalPopup } from './common/ModalPopup';

// Formula components
export { default as FormulaCard } from './formulas/FormulaCard';

// Chart components
export { SparklineChart, PerformanceChart, ChartContainer } from './charts';

// Broker components
export { default as BrokerButton } from './brokers/BrokerButton';

// Notification components
export { default as NotificationCard } from './notifications/NotificationCard';

// Type exports for TypeScript support
export type { StatCardProps } from './common/StatCard';
export type { ModalAction, ModalPopupProps } from './common/ModalPopup';
export type { FormulaCardProps } from './formulas/FormulaCard';
export type { SparklineChartProps, PerformanceChartProps, ChartContainerProps } from './charts';
export type { BrokerButtonProps } from './brokers/BrokerButton';
export type { NotificationCardProps } from './notifications/NotificationCard';
