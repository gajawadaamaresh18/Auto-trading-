import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Button,
  Chip,
  SegmentedButtons,
  DataTable,
  Divider,
  FAB,
  Portal,
  Dialog,
  Paragraph,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import BasketService from '@/services/BasketService';
import { Basket, Stock, Signal, Trade, Analytics, BasketStats } from '@/types';

interface BasketDetailScreenProps {
  route: {
    params: {
      basketId: string;
    };
  };
  navigation: any;
}

const BasketDetailScreen: React.FC<BasketDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { basketId } = route.params;
  const [basket, setBasket] = useState<Basket | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [stats, setStats] = useState<BasketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showRemoveStockModal, setShowRemoveStockModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadBasketData();
  }, [basketId]);

  const loadBasketData = async () => {
    try {
      setLoading(true);
      const [
        basketData,
        stocksData,
        signalsData,
        tradesData,
        analyticsData,
        statsData,
      ] = await Promise.all([
        BasketService.getBasket(basketId),
        BasketService.getBasketStocks(basketId),
        BasketService.getBasketSignals(basketId),
        BasketService.getBasketTrades(basketId),
        BasketService.getBasketAnalytics(basketId),
        BasketService.getBasketStats(basketId),
      ]);

      setBasket(basketData);
      setStocks(stocksData);
      setSignals(signalsData);
      setTrades(tradesData);
      setAnalytics(analyticsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading basket data:', error);
      Alert.alert('Error', 'Failed to load basket details');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBasketData();
    setRefreshing(false);
  };

  const handleRunScan = async () => {
    if (!basket) return;

    try {
      await BasketService.runBasketScan(basket.id);
      Alert.alert('Scan Started', 'Basket scan is running in the background');
      // Refresh data to show new signals
      setTimeout(() => {
        loadBasketData();
      }, 3000);
    } catch (error) {
      console.error('Error running scan:', error);
      Alert.alert('Error', 'Failed to start basket scan');
    }
  };

  const handleAddStock = async (stockId: string) => {
    if (!basket) return;

    try {
      await BasketService.addStocksToBasket(basket.id, [stockId]);
      await loadBasketData();
      setShowAddStockModal(false);
      Alert.alert('Success', 'Stock added to basket');
    } catch (error) {
      console.error('Error adding stock:', error);
      Alert.alert('Error', 'Failed to add stock to basket');
    }
  };

  const handleRemoveStock = async (stockId: string) => {
    if (!basket) return;

    try {
      await BasketService.removeStocksFromBasket(basket.id, [stockId]);
      await loadBasketData();
      setShowRemoveStockModal(false);
      setSelectedStock(null);
      Alert.alert('Success', 'Stock removed from basket');
    } catch (error) {
      console.error('Error removing stock:', error);
      Alert.alert('Error', 'Failed to remove stock from basket');
    }
  };

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      {/* Stats Cards */}
      {stats && (
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={styles.statValue}>₹{stats.totalValue.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Value</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={[styles.statValue, stats.totalChange >= 0 ? styles.positive : styles.negative]}>
                {stats.totalChange >= 0 ? '+' : ''}₹{stats.totalChange.toFixed(2)}
              </Text>
              <Text style={styles.statLabel}>Total Change</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content>
              <Text style={[styles.statValue, stats.totalChangePercent >= 0 ? styles.positive : styles.negative]}>
                {stats.totalChangePercent >= 0 ? '+' : ''}{stats.totalChangePercent.toFixed(2)}%
              </Text>
              <Text style={styles.statLabel}>Change %</Text>
            </Card.Content>
          </Card>
        </View>
      )}

      {/* Top Performers */}
      {stats && (stats.topGainer || stats.topLoser) && (
        <Card style={styles.card}>
          <Card.Title title="Top Performers" />
          <Card.Content>
            {stats.topGainer && (
              <View style={styles.performerItem}>
                <View style={styles.performerInfo}>
                  <Text style={styles.performerSymbol}>{stats.topGainer.symbol}</Text>
                  <Text style={styles.performerName}>{stats.topGainer.name}</Text>
                </View>
                <Text style={styles.positive}>
                  +{stats.topGainer.changePercent.toFixed(2)}%
                </Text>
              </View>
            )}
            {stats.topLoser && (
              <View style={styles.performerItem}>
                <View style={styles.performerInfo}>
                  <Text style={styles.performerSymbol}>{stats.topLoser.symbol}</Text>
                  <Text style={styles.performerName}>{stats.topLoser.name}</Text>
                </View>
                <Text style={styles.negative}>
                  {stats.topLoser.changePercent.toFixed(2)}%
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Recent Signals */}
      {signals.length > 0 && (
        <Card style={styles.card}>
          <Card.Title title="Recent Signals" />
          <Card.Content>
            {signals.slice(0, 5).map((signal) => (
              <View key={signal.id} style={styles.signalItem}>
                <View style={styles.signalInfo}>
                  <Text style={styles.signalStock}>{signal.stockId}</Text>
                  <Text style={styles.signalReason}>{signal.reason}</Text>
                </View>
                <Chip
                  mode="outlined"
                  textStyle={[
                    styles.signalChip,
                    signal.type === 'buy' ? styles.buySignal : 
                    signal.type === 'sell' ? styles.sellSignal : styles.holdSignal
                  ]}
                >
                  {signal.type.toUpperCase()}
                </Chip>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Performance Chart */}
      {analytics.length > 0 && (
        <Card style={styles.card}>
          <Card.Title title="Performance Chart" />
          <Card.Content>
            <LineChart
              data={{
                labels: ['1M', '3M', '6M', '1Y'],
                datasets: [
                  {
                    data: [0, 5, 10, 15], // Mock data - in real app, calculate from analytics
                    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                    strokeWidth: 2,
                  },
                ],
              }}
              width={screenWidth - 64}
              height={200}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#2196F3',
                },
              }}
              bezier
              style={styles.chart}
            />
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );

  const renderStocks = () => (
    <ScrollView style={styles.tabContent}>
      <Card style={styles.card}>
        <Card.Title title="Basket Stocks" />
        <Card.Content>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Symbol</DataTable.Title>
              <DataTable.Title numeric>Price</DataTable.Title>
              <DataTable.Title numeric>Change</DataTable.Title>
              <DataTable.Title>Actions</DataTable.Title>
            </DataTable.Header>

            {stocks.map((stock) => (
              <DataTable.Row key={stock.id}>
                <DataTable.Cell>
                  <View>
                    <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                    <Text style={styles.stockName}>{stock.name}</Text>
                  </View>
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  <Text style={styles.stockPrice}>₹{stock.currentPrice.toFixed(2)}</Text>
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  <Text style={[
                    styles.stockChange,
                    stock.change >= 0 ? styles.positive : styles.negative
                  ]}>
                    {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </Text>
                </DataTable.Cell>
                <DataTable.Cell>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedStock(stock);
                      setShowRemoveStockModal(true);
                    }}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash" size={16} color="#e74c3c" />
                  </TouchableOpacity>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderTrades = () => (
    <ScrollView style={styles.tabContent}>
      <Card style={styles.card}>
        <Card.Title title="Recent Trades" />
        <Card.Content>
          {trades.length > 0 ? (
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Stock</DataTable.Title>
                <DataTable.Title>Type</DataTable.Title>
                <DataTable.Title numeric>Qty</DataTable.Title>
                <DataTable.Title numeric>Price</DataTable.Title>
                <DataTable.Title>Status</DataTable.Title>
              </DataTable.Header>

              {trades.map((trade) => (
                <DataTable.Row key={trade.id}>
                  <DataTable.Cell>{trade.stockId}</DataTable.Cell>
                  <DataTable.Cell>
                    <Chip
                      mode="outlined"
                      textStyle={[
                        styles.tradeChip,
                        trade.type === 'buy' ? styles.buySignal : styles.sellSignal
                      ]}
                    >
                      {trade.type.toUpperCase()}
                    </Chip>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>{trade.quantity}</DataTable.Cell>
                  <DataTable.Cell numeric>₹{trade.price.toFixed(2)}</DataTable.Cell>
                  <DataTable.Cell>
                    <Chip
                      mode="outlined"
                      textStyle={[
                        styles.statusChip,
                        trade.status === 'completed' ? styles.positive : 
                        trade.status === 'pending' ? styles.negative : styles.neutral
                      ]}
                    >
                      {trade.status.toUpperCase()}
                    </Chip>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No trades found</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );

  const renderAnalytics = () => (
    <ScrollView style={styles.tabContent}>
      {analytics.length > 0 ? (
        analytics.map((analytic) => (
          <Card key={analytic.id} style={styles.card}>
            <Card.Title title={`Analytics - ${analytic.period}`} />
            <Card.Content>
              <View style={styles.analyticsGrid}>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsLabel}>Total Return</Text>
                  <Text style={[
                    styles.analyticsValue,
                    analytic.performance.totalReturn >= 0 ? styles.positive : styles.negative
                  ]}>
                    {analytic.performance.totalReturn >= 0 ? '+' : ''}{analytic.performance.totalReturnPercent.toFixed(2)}%
                  </Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsLabel}>Volatility</Text>
                  <Text style={styles.analyticsValue}>{analytic.performance.volatility.toFixed(2)}</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsLabel}>Sharpe Ratio</Text>
                  <Text style={styles.analyticsValue}>{analytic.performance.sharpeRatio.toFixed(2)}</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsLabel}>Max Drawdown</Text>
                  <Text style={[styles.analyticsValue, styles.negative]}>
                    {analytic.performance.maxDrawdown.toFixed(2)}%
                  </Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsLabel}>Win Rate</Text>
                  <Text style={styles.analyticsValue}>{analytic.trades.winRate.toFixed(1)}%</Text>
                </View>
                <View style={styles.analyticsItem}>
                  <Text style={styles.analyticsLabel}>Total Trades</Text>
                  <Text style={styles.analyticsValue}>{analytic.trades.totalTrades}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.emptyState}>
              <Ionicons name="analytics-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No analytics available</Text>
            </View>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading basket details...</Text>
      </View>
    );
  }

  if (!basket) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#e74c3c" />
        <Text style={styles.errorText}>Basket not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.backButton}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.basketName}>{basket.name}</Text>
          <Text style={styles.basketType}>
            {basket.type === 'predefined' ? 'Predefined' : 'Custom'} • {stocks.length} stocks
          </Text>
        </View>
        <TouchableOpacity onPress={handleRunScan} style={styles.scanButton}>
          <Ionicons name="refresh" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <SegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        buttons={[
          { value: 'overview', label: 'Overview' },
          { value: 'stocks', label: 'Stocks' },
          { value: 'trades', label: 'Trades' },
          { value: 'analytics', label: 'Analytics' },
        ]}
        style={styles.segmentedButtons}
      />

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'stocks' && renderStocks()}
        {activeTab === 'trades' && renderTrades()}
        {activeTab === 'analytics' && renderAnalytics()}
      </View>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowAddStockModal(true)}
      />

      {/* Add Stock Modal */}
      <Portal>
        <Dialog visible={showAddStockModal} onDismiss={() => setShowAddStockModal(false)}>
          <Dialog.Title>Add Stock to Basket</Dialog.Title>
          <Dialog.Content>
            <Paragraph>This feature would show a stock picker to add stocks to the basket.</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddStockModal(false)}>Cancel</Button>
            <Button onPress={() => setShowAddStockModal(false)}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Remove Stock Modal */}
      <Portal>
        <Dialog visible={showRemoveStockModal} onDismiss={() => setShowRemoveStockModal(false)}>
          <Dialog.Title>Remove Stock</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to remove {selectedStock?.symbol} from this basket?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowRemoveStockModal(false)}>Cancel</Button>
            <Button onPress={() => selectedStock && handleRemoveStock(selectedStock.id)}>
              Remove
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginTop: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  basketName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  basketType: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  scanButton: {
    padding: 8,
  },
  segmentedButtons: {
    margin: 16,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  card: {
    margin: 16,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    margin: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#e74c3c',
  },
  neutral: {
    color: '#666',
  },
  performerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  performerInfo: {
    flex: 1,
  },
  performerSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  performerName: {
    fontSize: 14,
    color: '#666',
  },
  signalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  signalInfo: {
    flex: 1,
  },
  signalStock: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  signalReason: {
    fontSize: 14,
    color: '#666',
  },
  signalChip: {
    fontSize: 12,
  },
  buySignal: {
    color: '#4CAF50',
  },
  sellSignal: {
    color: '#e74c3c',
  },
  holdSignal: {
    color: '#666',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  stockName: {
    fontSize: 14,
    color: '#666',
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  stockChange: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 8,
  },
  tradeChip: {
    fontSize: 12,
  },
  statusChip: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsItem: {
    width: '48%',
    marginBottom: 16,
  },
  analyticsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  analyticsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
});

export default BasketDetailScreen;