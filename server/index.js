const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (in production, use a database)
let trades = [];
let subscriptions = [];
let tradeEvents = [];

// Initialize sample data
const initializeSampleData = () => {
  // Sample formula subscriptions
  subscriptions = [
    {
      id: 'sub-1',
      name: 'Momentum Strategy',
      description: 'High-frequency momentum trading based on price action',
      executionMode: 'MANUAL',
      isActive: true,
      riskLevel: 'MEDIUM',
      maxPositionSize: 1000,
      stopLossPercentage: 2.0,
      takeProfitPercentage: 4.0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'sub-2',
      name: 'Mean Reversion',
      description: 'Mean reversion strategy for range-bound markets',
      executionMode: 'AUTO',
      isActive: true,
      riskLevel: 'LOW',
      maxPositionSize: 500,
      stopLossPercentage: 1.5,
      takeProfitPercentage: 3.0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'sub-3',
      name: 'Breakout Strategy',
      description: 'Breakout detection with volume confirmation',
      executionMode: 'ALERT_ONLY',
      isActive: true,
      riskLevel: 'HIGH',
      maxPositionSize: 2000,
      stopLossPercentage: 3.0,
      takeProfitPercentage: 6.0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Sample trade signals
  trades = [
    {
      id: 'trade-1',
      symbol: 'AAPL',
      side: 'BUY',
      quantity: 100,
      entryPrice: 150.25,
      stopLoss: 147.25,
      takeProfit: 156.25,
      timestamp: new Date(),
      formulaId: 'sub-1',
      formulaName: 'Momentum Strategy',
      status: 'PENDING',
      executionMode: 'MANUAL',
      riskLevel: 'MEDIUM',
      confidence: 85,
      marketCondition: 'Bullish momentum',
      notes: 'Strong volume confirmation'
    },
    {
      id: 'trade-2',
      symbol: 'TSLA',
      side: 'SELL',
      quantity: 50,
      entryPrice: 245.80,
      stopLoss: 250.00,
      takeProfit: 235.00,
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      formulaId: 'sub-2',
      formulaName: 'Mean Reversion',
      status: 'PENDING',
      executionMode: 'AUTO',
      riskLevel: 'LOW',
      confidence: 72,
      marketCondition: 'Overbought conditions',
      notes: 'RSI above 70'
    }
  ];
};

// Initialize sample data
initializeSampleData();

// Helper function to log trade events
const logTradeEvent = (tradeId, eventType, details, userId = 'system') => {
  const event = {
    id: uuidv4(),
    tradeId,
    eventType,
    timestamp: new Date(),
    details,
    userId
  };
  tradeEvents.push(event);
  console.log(`Trade Event: ${eventType} for trade ${tradeId}`, details);
  return event;
};

// Routes

// Get all trade signals
app.get('/api/trades', (req, res) => {
  try {
    res.json({
      success: true,
      data: trades,
      message: 'Trade signals retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve trade signals',
      message: error.message
    });
  }
});

// Get trade by ID
app.get('/api/trades/:id', (req, res) => {
  try {
    const trade = trades.find(t => t.id === req.params.id);
    if (!trade) {
      return res.status(404).json({
        success: false,
        error: 'Trade not found'
      });
    }
    
    res.json({
      success: true,
      data: trade,
      message: 'Trade retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve trade',
      message: error.message
    });
  }
});

// Approve or reject trade
app.patch('/api/trades/:id/approve', (req, res) => {
  try {
    const { action, modifiedQuantity, modifiedStopLoss, modifiedTakeProfit, notes } = req.body;
    const tradeId = req.params.id;
    
    const trade = trades.find(t => t.id === tradeId);
    if (!trade) {
      return res.status(404).json({
        success: false,
        error: 'Trade not found'
      });
    }

    if (trade.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'Trade is not in pending status'
      });
    }

    // Update trade based on action
    if (action === 'APPROVE') {
      trade.status = 'APPROVED';
      
      // Apply modifications if provided
      if (modifiedQuantity !== undefined) {
        trade.quantity = modifiedQuantity;
      }
      if (modifiedStopLoss !== undefined) {
        trade.stopLoss = modifiedStopLoss;
      }
      if (modifiedTakeProfit !== undefined) {
        trade.takeProfit = modifiedTakeProfit;
      }
      if (notes) {
        trade.notes = notes;
      }

      // Log approval event
      logTradeEvent(tradeId, 'USER_APPROVED', {
        action: 'APPROVE',
        modifiedQuantity,
        modifiedStopLoss,
        modifiedTakeProfit,
        notes
      }, req.headers['user-id'] || 'anonymous');

      // Simulate trade execution
      setTimeout(() => {
        trade.status = 'EXECUTED';
        logTradeEvent(tradeId, 'EXECUTION_COMPLETED', {
          executedAt: new Date(),
          finalQuantity: trade.quantity,
          finalStopLoss: trade.stopLoss,
          finalTakeProfit: trade.takeProfit
        });
      }, 2000);

      logTradeEvent(tradeId, 'EXECUTION_STARTED', {
        startedAt: new Date(),
        quantity: trade.quantity,
        stopLoss: trade.stopLoss,
        takeProfit: trade.takeProfit
      });

    } else if (action === 'REJECT') {
      trade.status = 'REJECTED';
      
      if (notes) {
        trade.notes = notes;
      }

      // Log rejection event
      logTradeEvent(tradeId, 'USER_REJECTED', {
        action: 'REJECT',
        notes
      }, req.headers['user-id'] || 'anonymous');
    }

    res.json({
      success: true,
      data: trade,
      message: `Trade ${action.toLowerCase()}ed successfully`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process trade approval',
      message: error.message
    });
  }
});

// Get all formula subscriptions
app.get('/api/subscriptions', (req, res) => {
  try {
    res.json({
      success: true,
      data: subscriptions,
      message: 'Subscriptions retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve subscriptions',
      message: error.message
    });
  }
});

// Update formula subscription
app.patch('/api/subscriptions/:id', (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const updates = req.body;
    
    const subscription = subscriptions.find(s => s.id === subscriptionId);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    // Update subscription
    Object.assign(subscription, updates, { updatedAt: new Date() });

    res.json({
      success: true,
      data: subscription,
      message: 'Subscription updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update subscription',
      message: error.message
    });
  }
});

// Get trade events
app.get('/api/trades/:id/events', (req, res) => {
  try {
    const tradeId = req.params.id;
    const tradeEventList = tradeEvents.filter(e => e.tradeId === tradeId);
    
    res.json({
      success: true,
      data: tradeEventList,
      message: 'Trade events retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve trade events',
      message: error.message
    });
  }
});

// Get all trade events
app.get('/api/events', (req, res) => {
  try {
    res.json({
      success: true,
      data: tradeEvents,
      message: 'All trade events retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve trade events',
      message: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
