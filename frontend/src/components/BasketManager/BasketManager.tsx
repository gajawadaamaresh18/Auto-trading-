/**
 * Basket Manager Component
 * 
 * Component for creating, customizing, and managing named scrip lists (baskets).
 * Supports Nifty50, custom baskets, formula assignment, and bulk scans.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  Alert,
  Animated,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import theme from '../theme';

// Types and Interfaces
export interface Basket {
  id: string;
  name: string;
  description: string;
  type: 'PREBUILT' | 'CUSTOM' | 'SECTOR' | 'THEME';
  category: 'NIFTY50' | 'NIFTY100' | 'NIFTY500' | 'SECTORAL' | 'CUSTOM' | 'THEMATIC';
  
  // Basket Configuration
  symbols: string[];
  maxSymbols: number;
  isActive: boolean;
  isPublic: boolean;
  
  // Formula Assignment
  assignedFormulas: string[];
  scanFrequency: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY';
  lastScanTime?: string;
  
  // Analytics
  totalSignals: number;
  activeSignals: number;
  totalTrades: number;
  winRate: number;
  avgReturn: number;
  maxDrawdown: number;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  
  // Settings
  settings: {
    autoScan: boolean;
    notifications: boolean;
    riskManagement: boolean;
    positionSizing: boolean;
  };
}

export interface BasketSymbol {
  symbol: string;
  name: string;
  sector: string;
  marketCap: number;
  weight: number;
  isActive: boolean;
  addedAt: string;
  addedBy: string;
}

export interface BasketManagerProps {
  /** Current baskets */
  baskets: Basket[];
  /** Callback when basket is created */
  onCreateBasket: (basket: Omit<Basket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  /** Callback when basket is updated */
  onUpdateBasket: (basketId: string, updates: Partial<Basket>) => void;
  /** Callback when basket is deleted */
  onDeleteBasket: (basketId: string) => void;
  /** Callback when basket is selected */
  onSelectBasket: (basket: Basket) => void;
  /** Callback when formula is assigned */
  onAssignFormula: (basketId: string, formulaId: string) => void;
  /** Callback when formula is unassigned */
  onUnassignFormula: (basketId: string, formulaId: string) => void;
  /** Callback when scan is triggered */
  onTriggerScan: (basketId: string) => void;
  /** Additional styling */
  style?: any;
}

// Prebuilt Basket Templates
const PREBUILT_BASKETS = [
  {
    name: 'Nifty 50',
    description: 'Top 50 companies by market capitalization',
    type: 'PREBUILT' as const,
    category: 'NIFTY50' as const,
    symbols: [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'ICICIBANK', 'KOTAKBANK',
      'HDFC', 'ITC', 'BHARTIARTL', 'SBIN', 'ASIANPAINT', 'AXISBANK', 'MARUTI',
      'LT', 'NESTLEIND', 'ULTRACEMCO', 'SUNPHARMA', 'TITAN', 'POWERGRID',
      'NTPC', 'ONGC', 'TECHM', 'WIPRO', 'COALINDIA', 'JSWSTEEL', 'TATASTEEL',
      'BAJFINANCE', 'BAJAJFINSV', 'DRREDDY', 'CIPLA', 'EICHERMOT', 'HEROMOTOCO',
      'INDUSINDBK', 'GRASIM', 'SHREECEM', 'UPL', 'BRITANNIA', 'DIVISLAB',
      'HCLTECH', 'ADANIPORTS', 'TATAMOTORS', 'APOLLOHOSP', 'BAJAJHLDNG', 'BPCL',
      'HINDALCO', 'TATACONSUM', 'SBILIFE', 'HDFCLIFE'
    ],
    maxSymbols: 50,
    tags: ['large-cap', 'blue-chip', 'nifty']
  },
  {
    name: 'Nifty 100',
    description: 'Top 100 companies by market capitalization',
    type: 'PREBUILT' as const,
    category: 'NIFTY100' as const,
    symbols: [],
    maxSymbols: 100,
    tags: ['large-cap', 'mid-cap', 'nifty']
  },
  {
    name: 'Banking Sector',
    description: 'All banking and financial services companies',
    type: 'SECTOR' as const,
    category: 'SECTORAL' as const,
    symbols: [
      'HDFCBANK', 'ICICIBANK', 'KOTAKBANK', 'AXISBANK', 'SBIN', 'INDUSINDBK',
      'FEDERALBNK', 'BANDHANBNK', 'RBLBANK', 'IDFCFIRSTB', 'YESBANK'
    ],
    maxSymbols: 20,
    tags: ['banking', 'financial-services', 'sectoral']
  },
  {
    name: 'IT Sector',
    description: 'Information technology companies',
    type: 'SECTOR' as const,
    category: 'SECTORAL' as const,
    symbols: [
      'TCS', 'INFY', 'HCLTECH', 'WIPRO', 'TECHM', 'MINDTREE', 'LTI', 'MPHASIS',
      'PERSISTENT', 'COFORGE', 'LTTS', 'HEXAWARE'
    ],
    maxSymbols: 15,
    tags: ['technology', 'software', 'sectoral']
  }
];

// Main Basket Manager Component
const BasketManager: React.FC<BasketManagerProps> = ({
  baskets,
  onCreateBasket,
  onUpdateBasket,
  onDeleteBasket,
  onSelectBasket,
  onAssignFormula,
  onUnassignFormula,
  onTriggerScan,
  style,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSymbolsModal, setShowSymbolsModal] = useState(false);
  const [showFormulasModal, setShowFormulasModal] = useState(false);
  const [selectedBasket, setSelectedBasket] = useState<Basket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const [newBasket, setNewBasket] = useState({
    name: '',
    description: '',
    type: 'CUSTOM' as const,
    category: 'CUSTOM' as const,
    symbols: [] as string[],
    maxSymbols: 50,
    tags: [] as string[],
    settings: {
      autoScan: true,
      notifications: true,
      riskManagement: true,
      positionSizing: true,
    }
  });

  // Filter baskets based on search and category
  const filteredBaskets = baskets.filter(basket => {
    const matchesSearch = basket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         basket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         basket.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = filterCategory === 'all' || basket.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle create basket
  const handleCreateBasket = useCallback(() => {
    if (!newBasket.name.trim()) {
      Alert.alert('Error', 'Basket name is required');
      return;
    }
    
    if (newBasket.symbols.length === 0) {
      Alert.alert('Error', 'At least one symbol is required');
      return;
    }
    
    onCreateBasket(newBasket);
    setNewBasket({
      name: '',
      description: '',
      type: 'CUSTOM',
      category: 'CUSTOM',
      symbols: [],
      maxSymbols: 50,
      tags: [],
      settings: {
        autoScan: true,
        notifications: true,
        riskManagement: true,
        positionSizing: true,
      }
    });
    setShowCreateModal(false);
  }, [newBasket, onCreateBasket]);

  // Handle delete basket
  const handleDeleteBasket = useCallback((basket: Basket) => {
    Alert.alert(
      'Delete Basket',
      `Are you sure you want to delete "${basket.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDeleteBasket(basket.id)
        }
      ]
    );
  }, [onDeleteBasket]);

  // Handle trigger scan
  const handleTriggerScan = useCallback((basket: Basket) => {
    Alert.alert(
      'Trigger Scan',
      `Start scanning "${basket.name}" for trading signals?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Start Scan', 
          onPress: () => onTriggerScan(basket.id)
        }
      ]
    );
  }, [onTriggerScan]);

  // Render basket card
  const renderBasketCard = useCallback((basket: Basket) => (
    <TouchableOpacity
      key={basket.id}
      style={styles.basketCard}
      onPress={() => onSelectBasket(basket)}
      activeOpacity={0.8}
    >
      {/* Basket Header */}
      <View style={styles.basketHeader}>
        <View style={styles.basketInfo}>
          <Text style={styles.basketName}>{basket.name}</Text>
          <Text style={styles.basketDescription}>{basket.description}</Text>
        </View>
        
        <View style={styles.basketMeta}>
          <View style={[
            styles.typeBadge,
            { backgroundColor: getTypeColor(basket.type) }
          ]}>
            <Text style={styles.typeText}>{basket.type}</Text>
          </View>
          
          {basket.isActive && (
            <View style={styles.activeBadge}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success[500]} />
            </View>
          )}
        </View>
      </View>

      {/* Basket Stats */}
      <View style={styles.basketStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Symbols</Text>
          <Text style={styles.statValue}>{basket.symbols.length}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Formulas</Text>
          <Text style={styles.statValue}>{basket.assignedFormulas.length}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Signals</Text>
          <Text style={styles.statValue}>{basket.activeSignals}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Win Rate</Text>
          <Text style={[
            styles.statValue,
            { color: basket.winRate >= 60 ? theme.colors.success[600] : theme.colors.text.primary }
          ]}>
            {basket.winRate.toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Basket Tags */}
      <View style={styles.basketTags}>
        {basket.tags.slice(0, 3).map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        {basket.tags.length > 3 && (
          <Text style={styles.moreTagsText}>+{basket.tags.length - 3} more</Text>
        )}
      </View>

      {/* Basket Actions */}
      <View style={styles.basketActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSelectedBasket(basket);
            setShowSymbolsModal(true);
          }}
        >
          <Ionicons name="list" size={16} color={theme.colors.primary[500]} />
          <Text style={styles.actionButtonText}>Symbols</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSelectedBasket(basket);
            setShowFormulasModal(true);
          }}
        >
          <Ionicons name="calculator" size={16} color={theme.colors.warning[500]} />
          <Text style={styles.actionButtonText}>Formulas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleTriggerScan(basket)}
        >
          <Ionicons name="scan" size={16} color={theme.colors.success[500]} />
          <Text style={styles.actionButtonText}>Scan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteBasket(basket)}
        >
          <Ionicons name="trash" size={16} color={theme.colors.error[500]} />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), [onSelectBasket, handleDeleteBasket, handleTriggerScan]);

  // Render create basket modal
  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Create New Basket</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowCreateModal(false)}
          >
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Basket Name */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Basket Name *</Text>
            <TextInput
              style={styles.textInput}
              value={newBasket.name}
              onChangeText={(text) => setNewBasket(prev => ({ ...prev, name: text }))}
              placeholder="Enter basket name"
            />
          </View>

          {/* Basket Description */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={styles.textArea}
              value={newBasket.description}
              onChangeText={(text) => setNewBasket(prev => ({ ...prev, description: text }))}
              placeholder="Enter basket description"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Basket Type */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Basket Type</Text>
            <View style={styles.typeSelector}>
              {['CUSTOM', 'SECTOR', 'THEME'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    newBasket.type === type && styles.typeOptionActive
                  ]}
                  onPress={() => setNewBasket(prev => ({ ...prev, type: type as any }))}
                >
                  <Text style={[
                    styles.typeOptionText,
                    newBasket.type === type && styles.typeOptionTextActive
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Basket Category */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.categorySelector}>
              {['CUSTOM', 'NIFTY50', 'NIFTY100', 'NIFTY500', 'SECTORAL', 'THEMATIC'].map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryOption,
                    newBasket.category === category && styles.categoryOptionActive
                  ]}
                  onPress={() => setNewBasket(prev => ({ ...prev, category: category as any }))}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    newBasket.category === category && styles.categoryOptionTextActive
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Max Symbols */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Max Symbols</Text>
            <TextInput
              style={styles.textInput}
              value={newBasket.maxSymbols.toString()}
              onChangeText={(text) => setNewBasket(prev => ({ ...prev, maxSymbols: parseInt(text) || 50 }))}
              keyboardType="numeric"
              placeholder="50"
            />
          </View>

          {/* Prebuilt Templates */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Prebuilt Templates</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {PREBUILT_BASKETS.map((template, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.templateCard}
                  onPress={() => {
                    setNewBasket(prev => ({
                      ...prev,
                      name: template.name,
                      description: template.description,
                      type: template.type,
                      category: template.category,
                      symbols: template.symbols,
                      maxSymbols: template.maxSymbols,
                      tags: template.tags
                    }));
                  }}
                >
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateDescription}>{template.description}</Text>
                  <Text style={styles.templateSymbols}>{template.symbols.length} symbols</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Settings */}
          <View style={styles.inputField}>
            <Text style={styles.inputLabel}>Settings</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Auto Scan</Text>
              <Switch
                value={newBasket.settings.autoScan}
                onValueChange={(value) => setNewBasket(prev => ({
                  ...prev,
                  settings: { ...prev.settings, autoScan: value }
                }))}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Switch
                value={newBasket.settings.notifications}
                onValueChange={(value) => setNewBasket(prev => ({
                  ...prev,
                  settings: { ...prev.settings, notifications: value }
                }))}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Risk Management</Text>
              <Switch
                value={newBasket.settings.riskManagement}
                onValueChange={(value) => setNewBasket(prev => ({
                  ...prev,
                  settings: { ...prev.settings, riskManagement: value }
                }))}
              />
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Position Sizing</Text>
              <Switch
                value={newBasket.settings.positionSizing}
                onValueChange={(value) => setNewBasket(prev => ({
                  ...prev,
                  settings: { ...prev.settings, positionSizing: value }
                }))}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowCreateModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateBasket}
          >
            <Text style={styles.createButtonText}>Create Basket</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  // Render symbols modal
  const renderSymbolsModal = () => (
    <Modal
      visible={showSymbolsModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowSymbolsModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {selectedBasket?.name} - Symbols ({selectedBasket?.symbols.length})
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowSymbolsModal(false)}
          >
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {selectedBasket?.symbols.map((symbol, index) => (
            <View key={index} style={styles.symbolItem}>
              <Text style={styles.symbolText}>{symbol}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                  if (selectedBasket) {
                    const updatedSymbols = selectedBasket.symbols.filter((_, i) => i !== index);
                    onUpdateBasket(selectedBasket.id, { symbols: updatedSymbols });
                  }
                }}
              >
                <Ionicons name="close-circle" size={20} color={theme.colors.error[500]} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  // Render formulas modal
  const renderFormulasModal = () => (
    <Modal
      visible={showFormulasModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFormulasModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {selectedBasket?.name} - Formulas ({selectedBasket?.assignedFormulas.length})
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowFormulasModal(false)}
          >
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {selectedBasket?.assignedFormulas.map((formulaId, index) => (
            <View key={index} style={styles.formulaItem}>
              <Text style={styles.formulaText}>Formula {formulaId}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                  if (selectedBasket) {
                    onUnassignFormula(selectedBasket.id, formulaId);
                  }
                }}
              >
                <Ionicons name="close-circle" size={20} color={theme.colors.error[500]} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="basket" size={24} color={theme.colors.primary[500]} />
          <Text style={styles.title}>Basket Manager</Text>
        </View>
        
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={20} color={theme.colors.text.inverse} />
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Ionicons name="search" size={20} color={theme.colors.text.secondary} />
          <TextInput
            style={styles.searchTextInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search baskets..."
          />
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterCategory === 'all' && styles.filterChipActive
            ]}
            onPress={() => setFilterCategory('all')}
          >
            <Text style={[
              styles.filterChipText,
              filterCategory === 'all' && styles.filterChipTextActive
            ]}>
              All
            </Text>
          </TouchableOpacity>
          
          {['NIFTY50', 'NIFTY100', 'SECTORAL', 'CUSTOM', 'THEMATIC'].map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterChip,
                filterCategory === category && styles.filterChipActive
              ]}
              onPress={() => setFilterCategory(category)}
            >
              <Text style={[
                styles.filterChipText,
                filterCategory === category && styles.filterChipTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Baskets List */}
      <FlatList
        data={filteredBaskets}
        renderItem={({ item }) => renderBasketCard(item)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.basketsList}
        showsVerticalScrollIndicator={false}
      />

      {/* Modals */}
      {renderCreateModal()}
      {renderSymbolsModal()}
      {renderFormulasModal()}
    </View>
  );
};

// Helper functions
const getTypeColor = (type: string) => {
  switch (type) {
    case 'PREBUILT': return theme.colors.primary[100];
    case 'CUSTOM': return theme.colors.success[100];
    case 'SECTOR': return theme.colors.warning[100];
    case 'THEME': return theme.colors.error[100];
    default: return theme.colors.neutral[100];
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  createButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  
  // Search and filters styles
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  searchTextInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },
  filterContainer: {
    marginBottom: theme.spacing.sm,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  filterChipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  filterChipTextActive: {
    color: theme.colors.text.inverse,
  },
  
  // Baskets list styles
  basketsList: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  
  // Basket card styles
  basketCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  
  // Basket header styles
  basketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  basketInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  basketName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  basketDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  basketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  typeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  activeBadge: {
    padding: theme.spacing.xs,
  },
  
  // Basket stats styles
  basketStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  
  // Basket tags styles
  basketTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  tag: {
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  tagText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
  },
  moreTagsText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
    alignSelf: 'center',
  },
  
  // Basket actions styles
  basketActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  actionButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  
  // Input field styles
  inputField: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
  },
  textArea: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
    height: 80,
    textAlignVertical: 'top',
  },
  
  // Type selector styles
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  typeOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  },
  typeOptionActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  typeOptionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  typeOptionTextActive: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  // Category selector styles
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.primary,
  },
  categoryOptionActive: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  categoryOptionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  categoryOptionTextActive: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  // Template card styles
  templateCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginRight: theme.spacing.sm,
    width: 150,
    ...theme.shadows.sm,
  },
  templateName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  templateDescription: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  templateSymbols: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
  },
  
  // Setting row styles
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  settingLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  
  // Modal actions styles
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  createButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primary[500],
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  // Symbol item styles
  symbolItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  symbolText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  removeButton: {
    padding: theme.spacing.sm,
  },
  
  // Formula item styles
  formulaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  formulaText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
});

export default BasketManager;
