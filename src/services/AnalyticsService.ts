import DatabaseService from './DatabaseService';
import { Analytics, Basket, Trade } from '@/types';

class AnalyticsService {
  async generateAnalytics(basketId: string, period: '1d' | '1w' | '1m' | '3m' | '1y'): Promise<Analytics> {
    const basket = await DatabaseService.getBasket(basketId);
    if (!basket) throw new Error('Basket not found');

    // Get trades for the specified period
    const trades = await this.getTradesForPeriod(basketId, period);
    
    // Calculate performance metrics
    const performance = this.calculatePerformance(trades, period);
    
    // Calculate trade statistics
    const tradeStats = this.calculateTradeStats(trades);

    const analytics: Analytics = {
      basketId,
      period,
      performance,
      trades: tradeStats,
      generatedAt: new Date()
    };

    // Save analytics to database
    await DatabaseService.createAnalytics(analytics);
    
    return analytics;
  }

  private async getTradesForPeriod(basketId: string, period: string): Promise<Trade[]> {
    const allTrades = await DatabaseService.getTradesByBasket(basketId);
    const now = new Date();
    const periodMs = this.getPeriodMs(period);
    const startDate = new Date(now.getTime() - periodMs);

    return allTrades.filter(trade => trade.timestamp >= startDate);
  }

  private getPeriodMs(period: string): number {
    switch (period) {
      case '1d': return 24 * 60 * 60 * 1000;
      case '1w': return 7 * 24 * 60 * 60 * 1000;
      case '1m': return 30 * 24 * 60 * 60 * 1000;
      case '3m': return 90 * 24 * 60 * 60 * 1000;
      case '1y': return 365 * 24 * 60 * 60 * 1000;
      default: return 30 * 24 * 60 * 60 * 1000;
    }
  }

  private calculatePerformance(trades: Trade[], period: string): any {
    if (trades.length === 0) {
      return {
        totalReturn: 0,
        totalReturnPercent: 0,
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0
      };
    }

    // Calculate total return
    const totalReturn = trades.reduce((sum, trade) => {
      const multiplier = trade.type === 'buy' ? 1 : -1;
      return sum + (trade.totalAmount * multiplier);
    }, 0);

    // Calculate return percentage (simplified)
    const totalInvested = trades
      .filter(trade => trade.type === 'buy')
      .reduce((sum, trade) => sum + trade.totalAmount, 0);
    
    const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    // Calculate volatility (simplified)
    const returns = trades.map(trade => {
      const multiplier = trade.type === 'buy' ? 1 : -1;
      return (trade.totalAmount * multiplier) / 1000; // Normalize
    });
    
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);

    // Calculate Sharpe ratio (simplified)
    const riskFreeRate = 0.05; // 5% annual risk-free rate
    const sharpeRatio = volatility > 0 ? (avgReturn - riskFreeRate) / volatility : 0;

    // Calculate max drawdown (simplified)
    let maxDrawdown = 0;
    let peak = 0;
    let current = 0;

    for (const trade of trades) {
      const multiplier = trade.type === 'buy' ? 1 : -1;
      current += trade.totalAmount * multiplier;
      
      if (current > peak) {
        peak = current;
      }
      
      const drawdown = (peak - current) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return {
      totalReturn,
      totalReturnPercent,
      volatility: volatility * 100, // Convert to percentage
      sharpeRatio,
      maxDrawdown: maxDrawdown * 100 // Convert to percentage
    };
  }

  private calculateTradeStats(trades: Trade[]): any {
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        averageWin: 0,
        averageLoss: 0
      };
    }

    const totalTrades = trades.length;
    
    // Group trades by stock and calculate P&L
    const stockTrades = new Map<string, Trade[]>();
    trades.forEach(trade => {
      if (!stockTrades.has(trade.stockId)) {
        stockTrades.set(trade.stockId, []);
      }
      stockTrades.get(trade.stockId)!.push(trade);
    });

    let winningTrades = 0;
    let losingTrades = 0;
    let totalWins = 0;
    let totalLosses = 0;

    stockTrades.forEach(stockTradeList => {
      // Calculate P&L for this stock
      let position = 0;
      let costBasis = 0;
      let realizedPnL = 0;

      stockTradeList.forEach(trade => {
        if (trade.type === 'buy') {
          position += trade.quantity;
          costBasis += trade.totalAmount;
        } else {
          const sellPrice = trade.price;
          const avgCost = costBasis / position;
          const pnl = (sellPrice - avgCost) * trade.quantity;
          realizedPnL += pnl;
          position -= trade.quantity;
          costBasis -= avgCost * trade.quantity;
        }
      });

      if (realizedPnL > 0) {
        winningTrades++;
        totalWins += realizedPnL;
      } else if (realizedPnL < 0) {
        losingTrades++;
        totalLosses += Math.abs(realizedPnL);
      }
    });

    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const averageWin = winningTrades > 0 ? totalWins / winningTrades : 0;
    const averageLoss = losingTrades > 0 ? totalLosses / losingTrades : 0;

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      averageWin,
      averageLoss
    };
  }

  async getAnalyticsForBasket(basketId: string, period?: string): Promise<Analytics[]> {
    return await DatabaseService.getAnalyticsByBasket(basketId, period);
  }

  async generateAllAnalytics(basketId: string): Promise<void> {
    const periods: ('1d' | '1w' | '1m' | '3m' | '1y')[] = ['1d', '1w', '1m', '3m', '1y'];
    
    for (const period of periods) {
      try {
        await this.generateAnalytics(basketId, period);
      } catch (error) {
        console.error(`Error generating analytics for period ${period}:`, error);
      }
    }
  }
}

export default new AnalyticsService();