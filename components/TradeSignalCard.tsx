import React, { useState } from 'react';
import { TradeSignal, TradeApprovalRequest } from '../types';
import { CheckCircle, XCircle, Edit3, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface TradeSignalCardProps {
  signal: TradeSignal;
  onApprove: (request: TradeApprovalRequest) => void;
  onReject: (request: TradeApprovalRequest) => void;
  onEdit: (signal: TradeSignal) => void;
  isLoading?: boolean;
}

const TradeSignalCard: React.FC<TradeSignalCardProps> = ({
  signal,
  onApprove,
  onReject,
  onEdit,
  isLoading = false
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<'APPROVE' | 'REJECT' | null>(null);

  const handleAction = (action: 'APPROVE' | 'REJECT') => {
    setPendingAction(action);
    setShowConfirmation(true);
  };

  const handleConfirm = (modifiedData?: {
    quantity?: number;
    stopLoss?: number;
    takeProfit?: number;
    notes?: string;
  }) => {
    if (pendingAction) {
      const request: TradeApprovalRequest = {
        tradeId: signal.id,
        action: pendingAction,
        ...modifiedData
      };

      if (pendingAction === 'APPROVE') {
        onApprove(request);
      } else {
        onReject(request);
      }
    }
    setShowConfirmation(false);
    setPendingAction(null);
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatQuantity = (qty: number) => qty.toLocaleString();

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${signal.side === 'BUY' ? 'bg-green-100' : 'bg-red-100'}`}>
            {signal.side === 'BUY' ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{signal.symbol}</h3>
            <p className="text-sm text-gray-500">{signal.formulaName}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(signal.riskLevel)}`}>
            {signal.riskLevel}
          </span>
          <span className={`text-sm font-medium ${getConfidenceColor(signal.confidence)}`}>
            {signal.confidence}%
          </span>
        </div>
      </div>

      {/* Trade Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Side</label>
          <p className={`text-lg font-semibold ${signal.side === 'BUY' ? 'text-green-600' : 'text-red-600'}`}>
            {signal.side}
          </p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quantity</label>
          <p className="text-lg font-semibold text-gray-900">{formatQuantity(signal.quantity)}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Entry Price</label>
          <p className="text-lg font-semibold text-gray-900">{formatPrice(signal.entryPrice)}</p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Market Condition</label>
          <p className="text-sm text-gray-600">{signal.marketCondition}</p>
        </div>
      </div>

      {/* Stop Loss & Take Profit */}
      {(signal.stopLoss || signal.takeProfit) && (
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          {signal.stopLoss && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Stop Loss</label>
              <p className="text-sm font-semibold text-red-600">{formatPrice(signal.stopLoss)}</p>
            </div>
          )}
          {signal.takeProfit && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Take Profit</label>
              <p className="text-sm font-semibold text-green-600">{formatPrice(signal.takeProfit)}</p>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {signal.notes && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notes</label>
          <p className="text-sm text-gray-700 mt-1">{signal.notes}</p>
        </div>
      )}

      {/* Execution Mode Badge */}
      <div className="mb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {signal.executionMode === 'AUTO' && '🤖 Auto'}
          {signal.executionMode === 'MANUAL' && '👤 Manual'}
          {signal.executionMode === 'ALERT_ONLY' && '🔔 Alert Only'}
        </span>
      </div>

      {/* Action Buttons */}
      {signal.status === 'PENDING' && signal.executionMode === 'MANUAL' && (
        <div className="flex space-x-3">
          <button
            onClick={() => handleAction('APPROVE')}
            disabled={isLoading}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Approve & Execute</span>
          </button>
          <button
            onClick={() => handleAction('REJECT')}
            disabled={isLoading}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject</span>
          </button>
          <button
            onClick={() => onEdit(signal)}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Status for non-pending signals */}
      {signal.status !== 'PENDING' && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            signal.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
            signal.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
            signal.status === 'EXECUTED' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {signal.status}
          </span>
        </div>
      )}

      {/* Alert Only Mode Notice */}
      {signal.executionMode === 'ALERT_ONLY' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              This signal is in alert-only mode. No automatic execution will occur.
            </span>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <TradeConfirmationModal
          signal={signal}
          action={pendingAction!}
          onConfirm={handleConfirm}
          onCancel={() => {
            setShowConfirmation(false);
            setPendingAction(null);
          }}
        />
      )}
    </div>
  );
};

// Trade Confirmation Modal Component
interface TradeConfirmationModalProps {
  signal: TradeSignal;
  action: 'APPROVE' | 'REJECT';
  onConfirm: (modifiedData?: {
    quantity?: number;
    stopLoss?: number;
    takeProfit?: number;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

const TradeConfirmationModal: React.FC<TradeConfirmationModalProps> = ({
  signal,
  action,
  onConfirm,
  onCancel
}) => {
  const [modifiedQuantity, setModifiedQuantity] = useState(signal.quantity);
  const [modifiedStopLoss, setModifiedStopLoss] = useState(signal.stopLoss || 0);
  const [modifiedTakeProfit, setModifiedTakeProfit] = useState(signal.takeProfit || 0);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      quantity: modifiedQuantity !== signal.quantity ? modifiedQuantity : undefined,
      stopLoss: modifiedStopLoss !== (signal.stopLoss || 0) ? modifiedStopLoss : undefined,
      takeProfit: modifiedTakeProfit !== (signal.takeProfit || 0) ? modifiedTakeProfit : undefined,
      notes: notes || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {action === 'APPROVE' ? 'Confirm Trade Execution' : 'Reject Trade Signal'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {action === 'APPROVE' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={modifiedQuantity}
                  onChange={(e) => setModifiedQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  step="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stop Loss</label>
                <input
                  type="number"
                  value={modifiedStopLoss}
                  onChange={(e) => setModifiedStopLoss(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Take Profit</label>
                <input
                  type="number"
                  value={modifiedTakeProfit}
                  onChange={(e) => setModifiedTakeProfit(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add any notes about this trade..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 rounded-md text-white font-medium ${
                action === 'APPROVE' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {action === 'APPROVE' ? 'Approve & Execute' : 'Reject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeSignalCard;
