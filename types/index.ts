export interface TradeSignal {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: Date;
  formulaId: string;
  formulaName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'FAILED';
  executionMode: 'AUTO' | 'MANUAL' | 'ALERT_ONLY';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number; // 0-100
  marketCondition: string;
  notes?: string;
}

export interface FormulaSubscription {
  id: string;
  name: string;
  description: string;
  executionMode: 'AUTO' | 'MANUAL' | 'ALERT_ONLY';
  isActive: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  maxPositionSize: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TradeExecution {
  id: string;
  tradeId: string;
  action: 'APPROVE' | 'REJECT' | 'EXECUTE' | 'CANCEL';
  timestamp: Date;
  userId: string;
  notes?: string;
  modifiedQuantity?: number;
  modifiedStopLoss?: number;
  modifiedTakeProfit?: number;
}

export interface TradeEvent {
  id: string;
  tradeId: string;
  eventType: 'SIGNAL_GENERATED' | 'USER_APPROVED' | 'USER_REJECTED' | 'EXECUTION_STARTED' | 'EXECUTION_COMPLETED' | 'EXECUTION_FAILED';
  timestamp: Date;
  details: Record<string, any>;
  userId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TradeApprovalRequest {
  tradeId: string;
  action: 'APPROVE' | 'REJECT';
  modifiedQuantity?: number;
  modifiedStopLoss?: number;
  modifiedTakeProfit?: number;
  notes?: string;
}
