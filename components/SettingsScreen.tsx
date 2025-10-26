import React, { useState, useEffect } from 'react';
import { FormulaSubscription } from '../types';
import { Settings, Save, AlertTriangle, Bot, User, Bell } from 'lucide-react';

interface SettingsScreenProps {
  subscriptions: FormulaSubscription[];
  onUpdateSubscription: (id: string, updates: Partial<FormulaSubscription>) => void;
  onSaveSettings: () => void;
  isLoading?: boolean;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({
  subscriptions,
  onUpdateSubscription,
  onSaveSettings,
  isLoading = false
}) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [localSubscriptions, setLocalSubscriptions] = useState<FormulaSubscription[]>([]);

  useEffect(() => {
    setLocalSubscriptions([...subscriptions]);
  }, [subscriptions]);

  const handleExecutionModeChange = (id: string, mode: 'AUTO' | 'MANUAL' | 'ALERT_ONLY') => {
    setLocalSubscriptions(prev => 
      prev.map(sub => 
        sub.id === id 
          ? { ...sub, executionMode: mode, updatedAt: new Date() }
          : sub
      )
    );
    setHasChanges(true);
  };

  const handleRiskLevelChange = (id: string, riskLevel: 'LOW' | 'MEDIUM' | 'HIGH') => {
    setLocalSubscriptions(prev => 
      prev.map(sub => 
        sub.id === id 
          ? { ...sub, riskLevel, updatedAt: new Date() }
          : sub
      )
    );
    setHasChanges(true);
  };

  const handleMaxPositionSizeChange = (id: string, maxPositionSize: number) => {
    setLocalSubscriptions(prev => 
      prev.map(sub => 
        sub.id === id 
          ? { ...sub, maxPositionSize, updatedAt: new Date() }
          : sub
      )
    );
    setHasChanges(true);
  };

  const handleStopLossChange = (id: string, stopLossPercentage: number) => {
    setLocalSubscriptions(prev => 
      prev.map(sub => 
        sub.id === id 
          ? { ...sub, stopLossPercentage, updatedAt: new Date() }
          : sub
      )
    );
    setHasChanges(true);
  };

  const handleTakeProfitChange = (id: string, takeProfitPercentage: number) => {
    setLocalSubscriptions(prev => 
      prev.map(sub => 
        sub.id === id 
          ? { ...sub, takeProfitPercentage, updatedAt: new Date() }
          : sub
      )
    );
    setHasChanges(true);
  };

  const handleToggleActive = (id: string) => {
    setLocalSubscriptions(prev => 
      prev.map(sub => 
        sub.id === id 
          ? { ...sub, isActive: !sub.isActive, updatedAt: new Date() }
          : sub
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    localSubscriptions.forEach(sub => {
      onUpdateSubscription(sub.id, sub);
    });
    setHasChanges(false);
    onSaveSettings();
  };

  const getExecutionModeIcon = (mode: string) => {
    switch (mode) {
      case 'AUTO': return <Bot className="w-4 h-4" />;
      case 'MANUAL': return <User className="w-4 h-4" />;
      case 'ALERT_ONLY': return <Bell className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getExecutionModeColor = (mode: string) => {
    switch (mode) {
      case 'AUTO': return 'bg-green-100 text-green-800 border-green-200';
      case 'MANUAL': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ALERT_ONLY': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trading Settings</h1>
        <p className="text-gray-600">
          Configure execution modes and risk parameters for your formula subscriptions.
        </p>
      </div>

      {/* Execution Mode Legend */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Execution Modes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bot className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Auto</h4>
              <p className="text-sm text-gray-600">Automatically execute trades without confirmation</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Manual</h4>
              <p className="text-sm text-gray-600">Require user approval before execution</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Bell className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Alert Only</h4>
              <p className="text-sm text-gray-600">Send notifications without executing trades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formula Subscriptions */}
      <div className="space-y-6">
        {localSubscriptions.map((subscription) => (
          <div key={subscription.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{subscription.name}</h3>
                <p className="text-sm text-gray-600">{subscription.description}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(subscription.riskLevel)}`}>
                  {subscription.riskLevel}
                </span>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={subscription.isActive}
                    onChange={() => handleToggleActive(subscription.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>

            {/* Execution Mode Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Execution Mode</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(['AUTO', 'MANUAL', 'ALERT_ONLY'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleExecutionModeChange(subscription.id, mode)}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                      subscription.executionMode === mode
                        ? getExecutionModeColor(mode)
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {getExecutionModeIcon(mode)}
                    <span className="font-medium">
                      {mode === 'AUTO' && 'Auto'}
                      {mode === 'MANUAL' && 'Manual'}
                      {mode === 'ALERT_ONLY' && 'Alert Only'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                <select
                  value={subscription.riskLevel}
                  onChange={(e) => handleRiskLevelChange(subscription.id, e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Position Size</label>
                <input
                  type="number"
                  value={subscription.maxPositionSize}
                  onChange={(e) => handleMaxPositionSizeChange(subscription.id, Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stop Loss %</label>
                <input
                  type="number"
                  value={subscription.stopLossPercentage}
                  onChange={(e) => handleStopLossChange(subscription.id, Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Take Profit %</label>
                <input
                  type="number"
                  value={subscription.takeProfitPercentage}
                  onChange={(e) => handleTakeProfitChange(subscription.id, Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="1000"
                  step="0.1"
                />
              </div>
            </div>

            {/* Warning for Auto Mode */}
            {subscription.executionMode === 'AUTO' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Auto mode will execute trades immediately without confirmation. Use with caution.
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsScreen;
