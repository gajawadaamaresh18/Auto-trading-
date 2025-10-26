export interface Formula {
  id: string;
  name: string;
  description: string;
  blocks: Block[];
  riskLevel: 'low' | 'medium' | 'high';
  isPublic: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  performance?: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
}

export interface Block {
  id: string;
  type: 'indicator' | 'condition' | 'action';
  name: string;
  parameters: Record<string, any>;
  position: { x: number; y: number };
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: string;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  formulaId: string;
  brokerAccountId: string;
}

export interface BrokerAccount {
  id: string;
  name: string;
  broker: string;
  isConnected: boolean;
  isPaper: boolean;
  balance: number;
  lastSync: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  formulaId: string;
  isActive: boolean;
  subscribedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  formulaId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Basket {
  id: string;
  name: string;
  formulas: string[];
  userId: string;
  createdAt: string;
}