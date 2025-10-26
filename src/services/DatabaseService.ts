import * as SQLite from 'expo-sqlite';
import { Basket, Stock, Signal, Trade, ScanResult, Analytics, User } from '@/types';

class DatabaseService {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabase('trading_app.db');
    this.initDatabase();
  }

  private initDatabase() {
    this.db.transaction(tx => {
      // Create stocks table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS stocks (
          id TEXT PRIMARY KEY,
          symbol TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          currentPrice REAL NOT NULL,
          change REAL NOT NULL,
          changePercent REAL NOT NULL,
          volume INTEGER NOT NULL,
          marketCap REAL NOT NULL,
          sector TEXT NOT NULL,
          lastUpdated TEXT NOT NULL
        );
      `);

      // Create baskets table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS baskets (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          type TEXT NOT NULL CHECK (type IN ('predefined', 'custom')),
          stocks TEXT NOT NULL, -- JSON array of stock IDs
          formula TEXT,
          createdAt TEXT NOT NULL,
          updatedAt TEXT NOT NULL,
          isActive INTEGER NOT NULL DEFAULT 1,
          createdBy TEXT
        );
      `);

      // Create signals table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS signals (
          id TEXT PRIMARY KEY,
          basketId TEXT NOT NULL,
          stockId TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'hold')),
          strength TEXT NOT NULL CHECK (strength IN ('weak', 'medium', 'strong')),
          price REAL NOT NULL,
          targetPrice REAL,
          stopLoss REAL,
          reason TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          isActive INTEGER NOT NULL DEFAULT 1,
          FOREIGN KEY (basketId) REFERENCES baskets (id),
          FOREIGN KEY (stockId) REFERENCES stocks (id)
        );
      `);

      // Create trades table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS trades (
          id TEXT PRIMARY KEY,
          basketId TEXT NOT NULL,
          stockId TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
          quantity INTEGER NOT NULL,
          price REAL NOT NULL,
          totalAmount REAL NOT NULL,
          timestamp TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
          orderId TEXT,
          FOREIGN KEY (basketId) REFERENCES baskets (id),
          FOREIGN KEY (stockId) REFERENCES stocks (id)
        );
      `);

      // Create scan_results table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS scan_results (
          id TEXT PRIMARY KEY,
          basketId TEXT NOT NULL,
          formula TEXT NOT NULL,
          results TEXT NOT NULL, -- JSON array of results
          executedAt TEXT NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
          FOREIGN KEY (basketId) REFERENCES baskets (id)
        );
      `);

      // Create analytics table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS analytics (
          id TEXT PRIMARY KEY,
          basketId TEXT NOT NULL,
          period TEXT NOT NULL CHECK (period IN ('1d', '1w', '1m', '3m', '1y')),
          performance TEXT NOT NULL, -- JSON object
          trades TEXT NOT NULL, -- JSON object
          generatedAt TEXT NOT NULL,
          FOREIGN KEY (basketId) REFERENCES baskets (id)
        );
      `);

      // Create users table
      tx.executeSql(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          preferences TEXT NOT NULL, -- JSON object
          createdAt TEXT NOT NULL
        );
      `);
    });
  }

  // Basket operations
  async createBasket(basket: Omit<Basket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Basket> {
    const id = this.generateId();
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO baskets (id, name, description, type, stocks, formula, createdAt, updatedAt, isActive, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            id,
            basket.name,
            basket.description || null,
            basket.type,
            JSON.stringify(basket.stocks),
            basket.formula || null,
            now,
            now,
            basket.isActive ? 1 : 0,
            basket.createdBy || null
          ],
          () => {
            const newBasket: Basket = {
              ...basket,
              id,
              createdAt: new Date(now),
              updatedAt: new Date(now)
            };
            resolve(newBasket);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getBaskets(): Promise<Basket[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM baskets WHERE isActive = 1 ORDER BY updatedAt DESC',
          [],
          (_, { rows }) => {
            const baskets: Basket[] = rows._array.map(row => ({
              id: row.id,
              name: row.name,
              description: row.description,
              type: row.type,
              stocks: JSON.parse(row.stocks),
              formula: row.formula,
              createdAt: new Date(row.createdAt),
              updatedAt: new Date(row.updatedAt),
              isActive: Boolean(row.isActive),
              createdBy: row.createdBy
            }));
            resolve(baskets);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getBasket(id: string): Promise<Basket | null> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM baskets WHERE id = ?',
          [id],
          (_, { rows }) => {
            if (rows.length > 0) {
              const row = rows.item(0);
              const basket: Basket = {
                id: row.id,
                name: row.name,
                description: row.description,
                type: row.type,
                stocks: JSON.parse(row.stocks),
                formula: row.formula,
                createdAt: new Date(row.createdAt),
                updatedAt: new Date(row.updatedAt),
                isActive: Boolean(row.isActive),
                createdBy: row.createdBy
              };
              resolve(basket);
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async updateBasket(id: string, updates: Partial<Basket>): Promise<void> {
    const now = new Date().toISOString();
    const fields = [];
    const values = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.stocks !== undefined) {
      fields.push('stocks = ?');
      values.push(JSON.stringify(updates.stocks));
    }
    if (updates.formula !== undefined) {
      fields.push('formula = ?');
      values.push(updates.formula);
    }
    if (updates.isActive !== undefined) {
      fields.push('isActive = ?');
      values.push(updates.isActive ? 1 : 0);
    }

    fields.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `UPDATE baskets SET ${fields.join(', ')} WHERE id = ?`,
          values,
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async deleteBasket(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'UPDATE baskets SET isActive = 0 WHERE id = ?',
          [id],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Stock operations
  async createStock(stock: Omit<Stock, 'id'>): Promise<Stock> {
    const id = this.generateId();
    
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO stocks (id, symbol, name, currentPrice, change, changePercent, volume, marketCap, sector, lastUpdated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            id,
            stock.symbol,
            stock.name,
            stock.currentPrice,
            stock.change,
            stock.changePercent,
            stock.volume,
            stock.marketCap,
            stock.sector,
            stock.lastUpdated.toISOString()
          ],
          () => {
            const newStock: Stock = { ...stock, id };
            resolve(newStock);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getStocks(): Promise<Stock[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM stocks ORDER BY symbol',
          [],
          (_, { rows }) => {
            const stocks: Stock[] = rows._array.map(row => ({
              id: row.id,
              symbol: row.symbol,
              name: row.name,
              currentPrice: row.currentPrice,
              change: row.change,
              changePercent: row.changePercent,
              volume: row.volume,
              marketCap: row.marketCap,
              sector: row.sector,
              lastUpdated: new Date(row.lastUpdated)
            }));
            resolve(stocks);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getStocksByIds(ids: string[]): Promise<Stock[]> {
    if (ids.length === 0) return [];
    
    const placeholders = ids.map(() => '?').join(',');
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM stocks WHERE id IN (${placeholders})`,
          ids,
          (_, { rows }) => {
            const stocks: Stock[] = rows._array.map(row => ({
              id: row.id,
              symbol: row.symbol,
              name: row.name,
              currentPrice: row.currentPrice,
              change: row.change,
              changePercent: row.changePercent,
              volume: row.volume,
              marketCap: row.marketCap,
              sector: row.sector,
              lastUpdated: new Date(row.lastUpdated)
            }));
            resolve(stocks);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Signal operations
  async createSignal(signal: Omit<Signal, 'id'>): Promise<Signal> {
    const id = this.generateId();
    
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO signals (id, basketId, stockId, type, strength, price, targetPrice, stopLoss, reason, createdAt, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            id,
            signal.basketId,
            signal.stockId,
            signal.type,
            signal.strength,
            signal.price,
            signal.targetPrice || null,
            signal.stopLoss || null,
            signal.reason,
            signal.createdAt.toISOString(),
            signal.isActive ? 1 : 0
          ],
          () => {
            const newSignal: Signal = { ...signal, id };
            resolve(newSignal);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getSignalsByBasket(basketId: string): Promise<Signal[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM signals WHERE basketId = ? AND isActive = 1 ORDER BY createdAt DESC',
          [basketId],
          (_, { rows }) => {
            const signals: Signal[] = rows._array.map(row => ({
              id: row.id,
              basketId: row.basketId,
              stockId: row.stockId,
              type: row.type,
              strength: row.strength,
              price: row.price,
              targetPrice: row.targetPrice,
              stopLoss: row.stopLoss,
              reason: row.reason,
              createdAt: new Date(row.createdAt),
              isActive: Boolean(row.isActive)
            }));
            resolve(signals);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Trade operations
  async createTrade(trade: Omit<Trade, 'id'>): Promise<Trade> {
    const id = this.generateId();
    
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO trades (id, basketId, stockId, type, quantity, price, totalAmount, timestamp, status, orderId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            id,
            trade.basketId,
            trade.stockId,
            trade.type,
            trade.quantity,
            trade.price,
            trade.totalAmount,
            trade.timestamp.toISOString(),
            trade.status,
            trade.orderId || null
          ],
          () => {
            const newTrade: Trade = { ...trade, id };
            resolve(newTrade);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getTradesByBasket(basketId: string, limit: number = 50): Promise<Trade[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM trades WHERE basketId = ? ORDER BY timestamp DESC LIMIT ?',
          [basketId, limit],
          (_, { rows }) => {
            const trades: Trade[] = rows._array.map(row => ({
              id: row.id,
              basketId: row.basketId,
              stockId: row.stockId,
              type: row.type,
              quantity: row.quantity,
              price: row.price,
              totalAmount: row.totalAmount,
              timestamp: new Date(row.timestamp),
              status: row.status,
              orderId: row.orderId
            }));
            resolve(trades);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Scan operations
  async createScanResult(scanResult: Omit<ScanResult, 'id'>): Promise<ScanResult> {
    const id = this.generateId();
    
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO scan_results (id, basketId, formula, results, executedAt, status) VALUES (?, ?, ?, ?, ?, ?)',
          [
            id,
            scanResult.basketId,
            scanResult.formula,
            JSON.stringify(scanResult.results),
            scanResult.executedAt.toISOString(),
            scanResult.status
          ],
          () => {
            const newScanResult: ScanResult = { ...scanResult, id };
            resolve(newScanResult);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getScanResultsByBasket(basketId: string): Promise<ScanResult[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM scan_results WHERE basketId = ? ORDER BY executedAt DESC',
          [basketId],
          (_, { rows }) => {
            const scanResults: ScanResult[] = rows._array.map(row => ({
              id: row.id,
              basketId: row.basketId,
              formula: row.formula,
              results: JSON.parse(row.results),
              executedAt: new Date(row.executedAt),
              status: row.status
            }));
            resolve(scanResults);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Analytics operations
  async createAnalytics(analytics: Omit<Analytics, 'id'>): Promise<Analytics> {
    const id = this.generateId();
    
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO analytics (id, basketId, period, performance, trades, generatedAt) VALUES (?, ?, ?, ?, ?, ?)',
          [
            id,
            analytics.basketId,
            analytics.period,
            JSON.stringify(analytics.performance),
            JSON.stringify(analytics.trades),
            analytics.generatedAt.toISOString()
          ],
          () => {
            const newAnalytics: Analytics = { ...analytics, id };
            resolve(newAnalytics);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getAnalyticsByBasket(basketId: string, period?: string): Promise<Analytics[]> {
    let query = 'SELECT * FROM analytics WHERE basketId = ?';
    const params = [basketId];
    
    if (period) {
      query += ' AND period = ?';
      params.push(period);
    }
    
    query += ' ORDER BY generatedAt DESC';

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          query,
          params,
          (_, { rows }) => {
            const analytics: Analytics[] = rows._array.map(row => ({
              id: row.id,
              basketId: row.basketId,
              period: row.period,
              performance: JSON.parse(row.performance),
              trades: JSON.parse(row.trades),
              generatedAt: new Date(row.generatedAt)
            }));
            resolve(analytics);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async updateScanResult(id: string, updates: Partial<ScanResult>): Promise<void> {
    const fields = [];
    const values = [];

    if (updates.results !== undefined) {
      fields.push('results = ?');
      values.push(JSON.stringify(updates.results));
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }

    values.push(id);

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `UPDATE scan_results SET ${fields.join(', ')} WHERE id = ?`,
          values,
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}

export default new DatabaseService();