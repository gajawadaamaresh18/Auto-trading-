import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Card, Button, Chip, FAB, Portal, Dialog, Paragraph } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import BasketService from '@/services/BasketService';
import { Basket, Stock } from '@/types';

interface BasketManagerProps {
  onBasketSelect?: (basket: Basket) => void;
  onNavigateToDetail?: (basketId: string) => void;
}

const BasketManager: React.FC<BasketManagerProps> = ({
  onBasketSelect,
  onNavigateToDetail,
}) => {
  const [baskets, setBaskets] = useState<Basket[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockSelector, setShowStockSelector] = useState(false);
  const [selectedBasket, setSelectedBasket] = useState<Basket | null>(null);
  const [newBasket, setNewBasket] = useState({
    name: '',
    description: '',
    type: 'custom' as 'predefined' | 'custom',
    formula: '',
  });
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [basketsData, stocksData] = await Promise.all([
        BasketService.getBaskets(),
        BasketService.getBasketStocks(''), // Get all stocks
      ]);
      setBaskets(basketsData);
      setStocks(stocksData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load baskets and stocks');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateBasket = async () => {
    if (!newBasket.name.trim()) {
      Alert.alert('Error', 'Please enter a basket name');
      return;
    }

    try {
      const basket = await BasketService.createBasket({
        ...newBasket,
        stocks: selectedStocks,
      });
      
      setBaskets([basket, ...baskets]);
      setShowCreateModal(false);
      setNewBasket({ name: '', description: '', type: 'custom', formula: '' });
      setSelectedStocks([]);
      Alert.alert('Success', 'Basket created successfully');
    } catch (error) {
      console.error('Error creating basket:', error);
      Alert.alert('Error', 'Failed to create basket');
    }
  };

  const handleEditBasket = async () => {
    if (!selectedBasket || !newBasket.name.trim()) {
      Alert.alert('Error', 'Please enter a basket name');
      return;
    }

    try {
      await BasketService.updateBasket(selectedBasket.id, {
        name: newBasket.name,
        description: newBasket.description,
        formula: newBasket.formula,
        stocks: selectedStocks,
      });
      
      const updatedBaskets = baskets.map(basket =>
        basket.id === selectedBasket.id
          ? { ...basket, name: newBasket.name, description: newBasket.description, formula: newBasket.formula, stocks: selectedStocks }
          : basket
      );
      setBaskets(updatedBaskets);
      setShowEditModal(false);
      setSelectedBasket(null);
      setNewBasket({ name: '', description: '', type: 'custom', formula: '' });
      setSelectedStocks([]);
      Alert.alert('Success', 'Basket updated successfully');
    } catch (error) {
      console.error('Error updating basket:', error);
      Alert.alert('Error', 'Failed to update basket');
    }
  };

  const handleDeleteBasket = async (basketId: string) => {
    Alert.alert(
      'Delete Basket',
      'Are you sure you want to delete this basket?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await BasketService.deleteBasket(basketId);
              setBaskets(baskets.filter(basket => basket.id !== basketId));
              Alert.alert('Success', 'Basket deleted successfully');
            } catch (error) {
              console.error('Error deleting basket:', error);
              Alert.alert('Error', 'Failed to delete basket');
            }
          },
        },
      ]
    );
  };

  const handleRunScan = async (basket: Basket) => {
    try {
      const scanResult = await BasketService.runBasketScan(basket.id);
      Alert.alert('Scan Started', 'Basket scan is running in the background');
    } catch (error) {
      console.error('Error running scan:', error);
      Alert.alert('Error', 'Failed to start basket scan');
    }
  };

  const openEditModal = (basket: Basket) => {
    setSelectedBasket(basket);
    setNewBasket({
      name: basket.name,
      description: basket.description || '',
      type: basket.type,
      formula: basket.formula || '',
    });
    setSelectedStocks([...basket.stocks]);
    setShowEditModal(true);
  };

  const filteredStocks = stocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStockSelection = (stockId: string) => {
    setSelectedStocks(prev =>
      prev.includes(stockId)
        ? prev.filter(id => id !== stockId)
        : [...prev, stockId]
    );
  };

  const renderBasketItem = ({ item }: { item: Basket }) => (
    <Card style={styles.basketCard}>
      <Card.Content>
        <View style={styles.basketHeader}>
          <View style={styles.basketInfo}>
            <Text style={styles.basketName}>{item.name}</Text>
            <Text style={styles.basketType}>
              {item.type === 'predefined' ? 'Predefined' : 'Custom'}
            </Text>
            {item.description && (
              <Text style={styles.basketDescription}>{item.description}</Text>
            )}
          </View>
          <View style={styles.basketActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEditModal(item)}
            >
              <Ionicons name="pencil" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteBasket(item.id)}
            >
              <Ionicons name="trash" size={20} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.basketStats}>
          <Chip icon="chart-line" style={styles.statChip}>
            {item.stocks.length} stocks
          </Chip>
          {item.formula && (
            <Chip icon="function" style={styles.statChip}>
              Formula
            </Chip>
          )}
        </View>

        <View style={styles.basketFooter}>
          <Button
            mode="outlined"
            onPress={() => handleRunScan(item)}
            style={styles.scanButton}
            icon="magnify"
          >
            Run Scan
          </Button>
          <Button
            mode="contained"
            onPress={() => onNavigateToDetail?.(item.id)}
            style={styles.detailButton}
            icon="arrow-right"
          >
            View Details
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderStockItem = ({ item }: { item: Stock }) => (
    <TouchableOpacity
      style={[
        styles.stockItem,
        selectedStocks.includes(item.id) && styles.selectedStockItem,
      ]}
      onPress={() => toggleStockSelection(item.id)}
    >
      <View style={styles.stockInfo}>
        <Text style={styles.stockSymbol}>{item.symbol}</Text>
        <Text style={styles.stockName}>{item.name}</Text>
        <Text style={styles.stockPrice}>₹{item.currentPrice.toFixed(2)}</Text>
      </View>
      {selectedStocks.includes(item.id) && (
        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading baskets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={baskets}
        keyExtractor={(item) => item.id}
        renderItem={renderBasketItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No baskets found</Text>
            <Text style={styles.emptySubtext}>
              Create your first basket to get started
            </Text>
          </View>
        }
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowCreateModal(true)}
      />

      {/* Create Basket Modal */}
      <Portal>
        <Dialog visible={showCreateModal} onDismiss={() => setShowCreateModal(false)}>
          <Dialog.Title>Create New Basket</Dialog.Title>
          <Dialog.Content>
            <TextInput
              style={styles.input}
              placeholder="Basket Name"
              value={newBasket.name}
              onChangeText={(text) => setNewBasket({ ...newBasket, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={newBasket.description}
              onChangeText={(text) => setNewBasket({ ...newBasket, description: text })}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Formula (optional)"
              value={newBasket.formula}
              onChangeText={(text) => setNewBasket({ ...newBasket, formula: text })}
            />
            <Button
              mode="outlined"
              onPress={() => setShowStockSelector(true)}
              style={styles.selectStocksButton}
              icon="plus"
            >
              Select Stocks ({selectedStocks.length})
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onPress={handleCreateBasket}>Create</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Edit Basket Modal */}
      <Portal>
        <Dialog visible={showEditModal} onDismiss={() => setShowEditModal(false)}>
          <Dialog.Title>Edit Basket</Dialog.Title>
          <Dialog.Content>
            <TextInput
              style={styles.input}
              placeholder="Basket Name"
              value={newBasket.name}
              onChangeText={(text) => setNewBasket({ ...newBasket, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={newBasket.description}
              onChangeText={(text) => setNewBasket({ ...newBasket, description: text })}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Formula (optional)"
              value={newBasket.formula}
              onChangeText={(text) => setNewBasket({ ...newBasket, formula: text })}
            />
            <Button
              mode="outlined"
              onPress={() => setShowStockSelector(true)}
              style={styles.selectStocksButton}
              icon="plus"
            >
              Select Stocks ({selectedStocks.length})
            </Button>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEditModal(false)}>Cancel</Button>
            <Button onPress={handleEditBasket}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Stock Selector Modal */}
      <Portal>
        <Dialog visible={showStockSelector} onDismiss={() => setShowStockSelector(false)}>
          <Dialog.Title>Select Stocks</Dialog.Title>
          <Dialog.Content>
            <TextInput
              style={styles.input}
              placeholder="Search stocks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <FlatList
              data={filteredStocks}
              keyExtractor={(item) => item.id}
              renderItem={renderStockItem}
              style={styles.stockList}
              showsVerticalScrollIndicator={false}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowStockSelector(false)}>Done</Button>
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
  listContainer: {
    padding: 16,
  },
  basketCard: {
    marginBottom: 16,
    elevation: 2,
  },
  basketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  basketInfo: {
    flex: 1,
  },
  basketName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  basketType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  basketDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  basketActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  basketStats: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  statChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  basketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  scanButton: {
    flex: 1,
    marginRight: 8,
  },
  detailButton: {
    flex: 1,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  selectStocksButton: {
    marginTop: 8,
  },
  stockList: {
    maxHeight: 300,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedStockItem: {
    backgroundColor: '#e8f5e8',
  },
  stockInfo: {
    flex: 1,
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
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default BasketManager;