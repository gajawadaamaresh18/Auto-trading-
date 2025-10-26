import DatabaseService from './DatabaseService';
import { Stock, Signal, Trade } from '@/types';

class SampleDataService {
  private sampleStocks: Omit<Stock, 'id'>[] = [
    {
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd',
      currentPrice: 2456.50,
      change: 45.20,
      changePercent: 1.87,
      volume: 1234567,
      marketCap: 16600000000000,
      sector: 'Oil & Gas',
      lastUpdated: new Date(),
    },
    {
      symbol: 'TCS',
      name: 'Tata Consultancy Services Ltd',
      currentPrice: 3456.80,
      change: -23.40,
      changePercent: -0.67,
      volume: 987654,
      marketCap: 12600000000000,
      sector: 'Information Technology',
      lastUpdated: new Date(),
    },
    {
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Ltd',
      currentPrice: 1654.30,
      change: 12.80,
      changePercent: 0.78,
      volume: 2345678,
      marketCap: 12500000000000,
      sector: 'Banking',
      lastUpdated: new Date(),
    },
    {
      symbol: 'INFY',
      name: 'Infosys Ltd',
      currentPrice: 1456.90,
      change: 8.50,
      changePercent: 0.59,
      volume: 1876543,
      marketCap: 6100000000000,
      sector: 'Information Technology',
      lastUpdated: new Date(),
    },
    {
      symbol: 'HINDUNILVR',
      name: 'Hindustan Unilever Ltd',
      currentPrice: 2345.60,
      change: -15.30,
      changePercent: -0.65,
      volume: 543210,
      marketCap: 5500000000000,
      sector: 'FMCG',
      lastUpdated: new Date(),
    },
    {
      symbol: 'ICICIBANK',
      name: 'ICICI Bank Ltd',
      currentPrice: 987.40,
      change: 18.70,
      changePercent: 1.93,
      volume: 3456789,
      marketCap: 6800000000000,
      sector: 'Banking',
      lastUpdated: new Date(),
    },
    {
      symbol: 'KOTAKBANK',
      name: 'Kotak Mahindra Bank Ltd',
      currentPrice: 1876.20,
      change: -5.40,
      changePercent: -0.29,
      volume: 876543,
      marketCap: 3700000000000,
      sector: 'Banking',
      lastUpdated: new Date(),
    },
    {
      symbol: 'HDFC',
      name: 'HDFC Ltd',
      currentPrice: 2678.90,
      change: 22.10,
      changePercent: 0.83,
      volume: 654321,
      marketCap: 4900000000000,
      sector: 'Housing Finance',
      lastUpdated: new Date(),
    },
    {
      symbol: 'ITC',
      name: 'ITC Ltd',
      currentPrice: 456.80,
      change: 3.20,
      changePercent: 0.71,
      volume: 1234567,
      marketCap: 5700000000000,
      sector: 'FMCG',
      lastUpdated: new Date(),
    },
    {
      symbol: 'BHARTIARTL',
      name: 'Bharti Airtel Ltd',
      currentPrice: 789.30,
      change: -12.50,
      changePercent: -1.56,
      volume: 2345678,
      marketCap: 4400000000000,
      sector: 'Telecommunications',
      lastUpdated: new Date(),
    },
  ];

  async initializeSampleData(): Promise<void> {
    try {
      // Create sample stocks
      const createdStocks = await Promise.all(
        this.sampleStocks.map(stock => DatabaseService.createStock(stock))
      );

      console.log(`Created ${createdStocks.length} sample stocks`);

      // Create sample signals
      await this.createSampleSignals(createdStocks);

      // Create sample trades
      await this.createSampleTrades(createdStocks);

      console.log('Sample data initialization completed');
    } catch (error) {
      console.error('Error initializing sample data:', error);
      throw error;
    }
  }

  async createSampleSignals(stocks: Stock[]): Promise<void> {
    // Get baskets to use their IDs
    const baskets = await DatabaseService.getBaskets();
    if (baskets.length === 0) {
      console.log('No baskets found, skipping signal creation');
      return;
    }

    const niftyBasket = baskets.find(b => b.name === 'Nifty 50');
    const bankingBasket = baskets.find(b => b.name === 'Banking Sector');

    const signals: Omit<Signal, 'id'>[] = [];

    if (niftyBasket) {
      signals.push(
        {
          basketId: niftyBasket.id,
          stockId: stocks[0].id, // RELIANCE
          type: 'buy',
          strength: 'strong',
          price: stocks[0].currentPrice,
          targetPrice: stocks[0].currentPrice * 1.15,
          stopLoss: stocks[0].currentPrice * 0.95,
          reason: 'Strong quarterly results and positive outlook',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          isActive: true,
        },
        {
          basketId: niftyBasket.id,
          stockId: stocks[1].id, // TCS
          type: 'hold',
          strength: 'medium',
          price: stocks[1].currentPrice,
          reason: 'Mixed signals, wait for better entry point',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          isActive: true,
        },
        {
          basketId: niftyBasket.id,
          stockId: stocks[2].id, // HDFCBANK
          type: 'buy',
          strength: 'medium',
          price: stocks[2].currentPrice,
          targetPrice: stocks[2].currentPrice * 1.08,
          stopLoss: stocks[2].currentPrice * 0.97,
          reason: 'Banking sector showing strength',
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          isActive: true,
        }
      );
    }

    if (bankingBasket) {
      signals.push({
        basketId: bankingBasket.id,
        stockId: stocks[5].id, // ICICIBANK
        type: 'buy',
        strength: 'strong',
        price: stocks[5].currentPrice,
        targetPrice: stocks[5].currentPrice * 1.12,
        stopLoss: stocks[5].currentPrice * 0.93,
        reason: 'Strong fundamentals and growth prospects',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        isActive: true,
      });
    }

    for (const signal of signals) {
      await DatabaseService.createSignal(signal);
    }

    console.log(`Created ${signals.length} sample signals`);
  }

  async createSampleTrades(stocks: Stock[]): Promise<void> {
    // Get baskets to use their IDs
    const baskets = await DatabaseService.getBaskets();
    if (baskets.length === 0) {
      console.log('No baskets found, skipping trade creation');
      return;
    }

    const niftyBasket = baskets.find(b => b.name === 'Nifty 50');
    const bankingBasket = baskets.find(b => b.name === 'Banking Sector');

    const trades: Omit<Trade, 'id'>[] = [];

    if (niftyBasket) {
      trades.push(
        {
          basketId: niftyBasket.id,
          stockId: stocks[0].id, // RELIANCE
          type: 'buy',
          quantity: 100,
          price: stocks[0].currentPrice * 0.98,
          totalAmount: stocks[0].currentPrice * 0.98 * 100,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          status: 'completed',
          orderId: 'ORD001',
        },
        {
          basketId: niftyBasket.id,
          stockId: stocks[1].id, // TCS
          type: 'sell',
          quantity: 50,
          price: stocks[1].currentPrice * 1.02,
          totalAmount: stocks[1].currentPrice * 1.02 * 50,
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          status: 'completed',
          orderId: 'ORD002',
        }
      );
    }

    if (bankingBasket) {
      trades.push(
        {
          basketId: bankingBasket.id,
          stockId: stocks[2].id, // HDFCBANK
          type: 'buy',
          quantity: 200,
          price: stocks[2].currentPrice * 0.99,
          totalAmount: stocks[2].currentPrice * 0.99 * 200,
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          status: 'completed',
          orderId: 'ORD003',
        },
        {
          basketId: bankingBasket.id,
          stockId: stocks[5].id, // ICICIBANK
          type: 'buy',
          quantity: 150,
          price: stocks[5].currentPrice * 1.01,
          totalAmount: stocks[5].currentPrice * 1.01 * 150,
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          status: 'pending',
          orderId: 'ORD004',
        }
      );
    }

    for (const trade of trades) {
      await DatabaseService.createTrade(trade);
    }

    console.log(`Created ${trades.length} sample trades`);
  }
}

export default new SampleDataService();