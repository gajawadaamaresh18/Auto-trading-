/**
 * TypeScript type definitions for React Native trading components
 */

export interface FormulaData {
  id: string;
  name: string;
  description?: string;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  avgReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  performanceData: number[];
  isSubscribed: boolean;
  category?: string;
  tags?: string[];
}

export interface StatData {
  label: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
  format?: 'percentage' | 'currency' | 'number';
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: string;
    strokeWidth?: number;
  }[];
}

export interface BrokerData {
  id: string;
  name: string;
  icon: string;
  isConnected: boolean;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  lastSync?: Date;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'signal' | 'alert' | 'trade' | 'info';
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionRequired?: boolean;
}

export interface ModalData {
  title: string;
  message: string;
  type: 'confirmation' | 'warning' | 'error' | 'success';
  primaryAction: {
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  isVisible: boolean;
}

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';