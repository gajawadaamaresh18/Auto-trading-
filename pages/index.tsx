import React, { useState, useEffect } from 'react';
import TradeSignalCard from '../components/TradeSignalCard';
import SettingsScreen from '../components/SettingsScreen';
import { TradeSignal, FormulaSubscription, TradeApprovalRequest, ApiResponse } from '../types';
import { Activity, Settings, Bell, TrendingUp } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'signals' | 'settings'>('signals');
  const [trades, setTrades] = useState<TradeSignal[]>([]);
  const [subscriptions, setSubscriptions] = useState<FormulaSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  const fetchTrades = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/trades`);
      const result: ApiResponse<TradeSignal[]> = await response.json();
      
      if (result.success && result.data) {
        setTrades(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch trades');
      }
    } catch (err) {
      console.error('Error fetching trades:', err);
      setError('Failed to load trade signals');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions`);
      const result: ApiResponse<FormulaSubscription[]> = await response.json();
      
      if (result.success && result.data) {
        setSubscriptions(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch subscriptions');
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError('Failed to load subscriptions');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([fetchTrades(), fetchSubscriptions()]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle trade approval/rejection
  const handleTradeApproval = async (request: TradeApprovalRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}/trades/${request.tradeId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'User-ID': 'user-123' // In a real app, this would come from auth
        },
        body: JSON.stringify(request)
      });

      const result: ApiResponse<TradeSignal> = await response.json();
      
      if (result.success && result.data) {
        // Update the trade in our local state
        setTrades(prev => 
          prev.map(trade => 
            trade.id === request.tradeId ? result.data! : trade
          )
        );
      } else {
        throw new Error(result.error || 'Failed to process trade approval');
      }
    } catch (err) {
      console.error('Error processing trade approval:', err);
      setError('Failed to process trade action');
    }
  };

  // Handle subscription updates
  const handleUpdateSubscription = async (id: string, updates: Partial<FormulaSubscription>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const result: ApiResponse<FormulaSubscription> = await response.json();
      
      if (result.success && result.data) {
        setSubscriptions(prev => 
          prev.map(sub => 
            sub.id === id ? result.data! : sub
          )
        );
      } else {
        throw new Error(result.error || 'Failed to update subscription');
      }
    } catch (err) {
      console.error('Error updating subscription:', err);
      setError('Failed to update subscription');
    }
  };

  const handleSaveSettings = async () => {
    // Settings are already saved individually, this is just for UI feedback
    console.log('Settings saved successfully');
  };

  const handleEditTrade = (signal: TradeSignal) => {
    // In a real app, this would open an edit modal or navigate to edit page
    console.log('Edit trade:', signal);
  };

  // Filter trades by status and execution mode
  const pendingManualTrades = trades.filter(trade => 
    trade.status === 'PENDING' && trade.executionMode === 'MANUAL'
  );

  const allTrades = trades;

  // Get stats
  const stats = {
    totalTrades: trades.length,
    pendingTrades: trades.filter(t => t.status === 'PENDING').length,
    executedTrades: trades.filter(t => t.status === 'EXECUTED').length,
    activeSubscriptions: subscriptions.filter(s => s.isActive).length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Auto Trading</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab('signals')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'signals'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Trade Signals</span>
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Trades</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTrades}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Bell className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingTrades}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Executed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.executedTrades}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Strategies</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'signals' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Trade Signals</h2>
              <p className="text-gray-600">
                Review and approve pending trade signals. Only manual execution mode trades require approval.
              </p>
            </div>

            {/* Pending Manual Trades */}
            {pendingManualTrades.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Pending Approval ({pendingManualTrades.length})
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pendingManualTrades.map((trade) => (
                    <TradeSignalCard
                      key={trade.id}
                      signal={trade}
                      onApprove={handleTradeApproval}
                      onReject={handleTradeApproval}
                      onEdit={handleEditTrade}
                      isLoading={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Trades */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">All Trade Signals</h3>
              {allTrades.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No trade signals available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {allTrades.map((trade) => (
                    <TradeSignalCard
                      key={trade.id}
                      signal={trade}
                      onApprove={handleTradeApproval}
                      onReject={handleTradeApproval}
                      onEdit={handleEditTrade}
                      isLoading={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsScreen
            subscriptions={subscriptions}
            onUpdateSubscription={handleUpdateSubscription}
            onSaveSettings={handleSaveSettings}
            isLoading={false}
          />
        )}
      </main>
    </div>
  );
}
