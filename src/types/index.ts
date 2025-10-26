// Core data types for the trading application

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
  lastUpdated: Date;
}

export interface Basket {
  id: string;
  name: string;
  description?: string;
  type: 'predefined' | 'custom';
  stocks: string[]; // Array of stock IDs
  formula?: string; // Custom formula for scanning
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  createdBy?: string; // User ID for custom baskets
}

export interface BasketStats {
  basketId: string;
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
  topGainer?: Stock;
  topLoser?: Stock;
  averageVolume: number;
  lastUpdated: Date;
}

export interface Signal {
  id: string;
  basketId: string;
  stockId: string;
  type: 'buy' | 'sell' | 'hold';
  strength: 'weak' | 'medium' | 'strong';
  price: number;
  targetPrice?: number;
  stopLoss?: number;
  reason: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Trade {
  id: string;
  basketId: string;
  stockId: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  totalAmount: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'cancelled';
  orderId?: string;
}

export interface ScanResult {
  id: string;
  basketId: string;
  formula: string;
  results: {
    stockId: string;
    score: number;
    signals: string[];
  }[];
  executedAt: Date;
  status: 'running' | 'completed' | 'failed';
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferences: {
    defaultBasket?: string;
    notifications: boolean;
    autoScan: boolean;
  };
  createdAt: Date;
}

export interface Analytics {
  basketId: string;
  period: '1d' | '1w' | '1m' | '3m' | '1y';
  performance: {
    totalReturn: number;
    totalReturnPercent: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
  trades: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    averageWin: number;
    averageLoss: number;
  };
  generatedAt: Date;
}