import DatabaseService from './DatabaseService';
import { Basket, Stock, Signal, Trade, ScanResult, Analytics, BasketStats } from '@/types';

class BasketService {
  // Basket CRUD operations
  async createBasket(basketData: {
    name: string;
    description?: string;
    type: 'predefined' | 'custom';
    stocks?: string[];
    formula?: string;
    createdBy?: string;
  }): Promise<Basket> {
    const basket = {
      ...basketData,
      stocks: basketData.stocks || [],
      isActive: true
    };
    
    return await DatabaseService.createBasket(basket);
  }

  async getBaskets(): Promise<Basket[]> {
    return await DatabaseService.getBaskets();
  }

  async getBasket(id: string): Promise<Basket | null> {
    return await DatabaseService.getBasket(id);
  }

  async updateBasket(id: string, updates: Partial<Basket>): Promise<void> {
    return await DatabaseService.updateBasket(id, updates);
  }

  async deleteBasket(id: string): Promise<void> {
    return await DatabaseService.deleteBasket(id);
  }

  // Stock management for baskets
  async addStocksToBasket(basketId: string, stockIds: string[]): Promise<void> {
    const basket = await this.getBasket(basketId);
    if (!basket) throw new Error('Basket not found');

    const updatedStocks = [...new Set([...basket.stocks, ...stockIds])];
    await this.updateBasket(basketId, { stocks: updatedStocks });
  }

  async removeStocksFromBasket(basketId: string, stockIds: string[]): Promise<void> {
    const basket = await this.getBasket(basketId);
    if (!basket) throw new Error('Basket not found');

    const updatedStocks = basket.stocks.filter(id => !stockIds.includes(id));
    await this.updateBasket(basketId, { stocks: updatedStocks });
  }

  async getBasketStocks(basketId: string): Promise<Stock[]> {
    const basket = await this.getBasket(basketId);
    if (!basket) throw new Error('Basket not found');

    return await DatabaseService.getStocksByIds(basket.stocks);
  }

  // Formula and scanning
  async updateBasketFormula(basketId: string, formula: string): Promise<void> {
    await this.updateBasket(basketId, { formula });
  }

  async runBasketScan(basketId: string, formula?: string): Promise<ScanResult> {
    const basket = await this.getBasket(basketId);
    if (!basket) throw new Error('Basket not found');

    const scanFormula = formula || basket.formula;
    if (!scanFormula) throw new Error('No formula provided for scanning');

    // Create scan result with running status
    const scanResult = await DatabaseService.createScanResult({
      basketId,
      formula: scanFormula,
      results: [],
      executedAt: new Date(),
      status: 'running'
    });

    // Simulate scan execution (in real app, this would call external APIs)
    setTimeout(async () => {
      try {
        const stocks = await this.getBasketStocks(basketId);
        const results = await this.executeFormula(stocks, scanFormula);
        
        await DatabaseService.updateScanResult(scanResult.id, {
          results,
          status: 'completed'
        });
      } catch (error) {
        await DatabaseService.updateScanResult(scanResult.id, {
          status: 'failed'
        });
      }
    }, 2000);

    return scanResult;
  }

  private async executeFormula(stocks: Stock[], formula: string): Promise<any[]> {
    // This is a simplified formula execution
    // In a real app, you'd have a proper formula parser and evaluator
    const results = stocks.map(stock => {
      let score = 0;
      
      // Simple scoring based on common technical indicators
      if (formula.includes('high_volume')) {
        score += stock.volume > 1000000 ? 10 : 0;
      }
      if (formula.includes('positive_change')) {
        score += stock.changePercent > 0 ? 15 : 0;
      }
      if (formula.includes('large_cap')) {
        score += stock.marketCap > 1000000000 ? 5 : 0;
      }
      if (formula.includes('tech_sector')) {
        score += stock.sector.toLowerCase().includes('technology') ? 10 : 0;
      }

      return {
        stockId: stock.id,
        score,
        signals: this.generateSignals(stock, score)
      };
    });

    return results.sort((a, b) => b.score - a.score);
  }

  private generateSignals(stock: Stock, score: number): string[] {
    const signals = [];
    
    if (score > 20) {
      signals.push('strong_buy');
    } else if (score > 10) {
      signals.push('buy');
    } else if (score < -10) {
      signals.push('sell');
    } else {
      signals.push('hold');
    }

    return signals;
  }

  // Analytics and statistics
  async getBasketStats(basketId: string): Promise<BasketStats> {
    const basket = await this.getBasket(basketId);
    if (!basket) throw new Error('Basket not found');

    const stocks = await this.getBasketStocks(basketId);
    
    if (stocks.length === 0) {
      return {
        basketId,
        totalValue: 0,
        totalChange: 0,
        totalChangePercent: 0,
        averageVolume: 0,
        lastUpdated: new Date()
      };
    }

    const totalValue = stocks.reduce((sum, stock) => sum + stock.currentPrice, 0);
    const totalChange = stocks.reduce((sum, stock) => sum + stock.change, 0);
    const totalChangePercent = stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / stocks.length;
    const averageVolume = stocks.reduce((sum, stock) => sum + stock.volume, 0) / stocks.length;

    const topGainer = stocks.reduce((max, stock) => 
      stock.changePercent > max.changePercent ? stock : max, stocks[0]);
    const topLoser = stocks.reduce((min, stock) => 
      stock.changePercent < min.changePercent ? stock : min, stocks[0]);

    return {
      basketId,
      totalValue,
      totalChange,
      totalChangePercent,
      topGainer: topGainer.changePercent > 0 ? topGainer : undefined,
      topLoser: topLoser.changePercent < 0 ? topLoser : undefined,
      averageVolume,
      lastUpdated: new Date()
    };
  }

  async getBasketSignals(basketId: string): Promise<Signal[]> {
    return await DatabaseService.getSignalsByBasket(basketId);
  }

  async getBasketTrades(basketId: string, limit: number = 50): Promise<Trade[]> {
    return await DatabaseService.getTradesByBasket(basketId, limit);
  }

  async getBasketAnalytics(basketId: string, period?: string): Promise<Analytics[]> {
    return await DatabaseService.getAnalyticsByBasket(basketId, period);
  }

  // Predefined baskets
  async createPredefinedBaskets(): Promise<void> {
    // Get all available stocks from database
    const allStocks = await DatabaseService.getStocks();
    
    // Create Nifty 50 basket with available stocks
    const nifty50StockIds = allStocks.slice(0, 10).map(stock => stock.id); // Use first 10 stocks as sample

    await this.createBasket({
      name: 'Nifty 50',
      description: 'Top 50 companies by market capitalization listed on NSE',
      type: 'predefined',
      stocks: nifty50StockIds,
      formula: 'high_volume AND large_cap'
    });

    // Create Banking Sector basket
    const bankingStocks = allStocks.filter(stock => 
      stock.sector.toLowerCase().includes('banking') || 
      stock.symbol.includes('BANK')
    );
    
    if (bankingStocks.length > 0) {
      await this.createBasket({
        name: 'Banking Sector',
        description: 'Major banking and financial services companies',
        type: 'predefined',
        stocks: bankingStocks.map(stock => stock.id),
        formula: 'banking_sector'
      });
    }

    // Create IT Sector basket
    const itStocks = allStocks.filter(stock => 
      stock.sector.toLowerCase().includes('technology') || 
      stock.sector.toLowerCase().includes('information')
    );
    
    if (itStocks.length > 0) {
      await this.createBasket({
        name: 'IT Sector',
        description: 'Information Technology companies',
        type: 'predefined',
        stocks: itStocks.map(stock => stock.id),
        formula: 'tech_sector AND positive_change'
      });
    }
  }
}

export default new BasketService();