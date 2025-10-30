/**
 * Template Picker Component
 * 
 * Interactive carousel for browsing, viewing, and cloning starter formula templates.
 * Features one-tap "Try in Paper Mode" and "Edit in FormulaStudio" actions.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Animated,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { TemplateFormula, TEMPLATE_FORMULAS, TEMPLATE_CATEGORIES, DIFFICULTY_LEVELS } from '../data/templateFormulas.json';
import theme from '../theme';

// Types and Interfaces
export interface TemplatePickerProps {
  /** Callback when template is selected for paper mode */
  onTryPaperMode: (template: TemplateFormula) => void;
  /** Callback when template is selected for editing */
  onEditInStudio: (template: TemplateFormula) => void;
  /** Callback when template details are viewed */
  onViewDetails?: (template: TemplateFormula) => void;
  /** Whether picker is visible */
  visible?: boolean;
  /** Callback when picker is closed */
  onClose?: () => void;
  /** Additional styling */
  style?: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.85;
const CARD_SPACING = 16;

// Main Template Picker Component
const TemplatePicker: React.FC<TemplatePickerProps> = ({
  onTryPaperMode,
  onEditInStudio,
  onViewDetails,
  visible = true,
  onClose,
  style,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateFormula | null>(null);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Filter templates based on selected criteria
  const filteredTemplates = TEMPLATE_FORMULAS.filter(template => {
    const categoryMatch = selectedCategory === 'all' || template.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  // Animate in when visible
  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  // Handle template selection
  const handleTemplateSelect = useCallback((template: TemplateFormula) => {
    setSelectedTemplate(template);
  }, []);

  // Handle paper mode action
  const handleTryPaperMode = useCallback((template: TemplateFormula) => {
    onTryPaperMode(template);
    setSelectedTemplate(null);
  }, [onTryPaperMode]);

  // Handle edit in studio action
  const handleEditInStudio = useCallback((template: TemplateFormula) => {
    onEditInStudio(template);
    setSelectedTemplate(null);
  }, [onEditInStudio]);

  // Handle view details action
  const handleViewDetails = useCallback((template: TemplateFormula) => {
    onViewDetails?.(template);
    setSelectedTemplate(null);
  }, [onViewDetails]);

  // Render template card
  const renderTemplateCard = useCallback((template: TemplateFormula, index: number) => (
    <TouchableOpacity
      key={template.id}
      style={[
        styles.templateCard,
        { marginLeft: index === 0 ? theme.spacing.md : 0 }
      ]}
      onPress={() => handleTemplateSelect(template)}
      activeOpacity={0.8}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {template.name}
          </Text>
          <View style={styles.cardBadges}>
            <View style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(template.difficulty) }
            ]}>
              <Text style={styles.difficultyText}>
                {template.difficulty.toUpperCase()}
              </Text>
            </View>
            {template.isPopular && (
              <View style={styles.popularBadge}>
                <Ionicons name="star" size={12} color={theme.colors.warning[500]} />
                <Text style={styles.popularText}>Popular</Text>
              </View>
            )}
            {template.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={12} color={theme.colors.success[500]} />
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.categoryIcon}>
          <Ionicons 
            name={getCategoryIcon(template.category) as any} 
            size={24} 
            color={getCategoryColor(template.category)} 
          />
        </View>
      </View>

      {/* Card Description */}
      <Text style={styles.cardDescription} numberOfLines={3}>
        {template.description}
      </Text>

      {/* Card Stats */}
      <View style={styles.cardStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Win Rate</Text>
          <Text style={[
            styles.statValue,
            { color: template.sampleStats.winRate >= 70 ? theme.colors.success[600] : theme.colors.text.primary }
          ]}>
            {template.sampleStats.winRate}%
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Profit Factor</Text>
          <Text style={[
            styles.statValue,
            { color: template.sampleStats.profitFactor >= 1.5 ? theme.colors.success[600] : theme.colors.text.primary }
          ]}>
            {template.sampleStats.profitFactor}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Trades</Text>
          <Text style={styles.statValue}>
            {template.sampleStats.totalTrades}
          </Text>
        </View>
      </View>

      {/* Card Tags */}
      <View style={styles.cardTags}>
        {template.tags.slice(0, 3).map((tag, tagIndex) => (
          <View key={tagIndex} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        {template.tags.length > 3 && (
          <Text style={styles.moreTagsText}>+{template.tags.length - 3} more</Text>
        )}
      </View>

      {/* Card Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleTryPaperMode(template)}
        >
          <Ionicons name="play-circle" size={16} color={theme.colors.primary[500]} />
          <Text style={styles.actionButtonText}>Try Paper</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryActionButton]}
          onPress={() => handleEditInStudio(template)}
        >
          <Ionicons name="create" size={16} color={theme.colors.text.inverse} />
          <Text style={styles.primaryActionButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  ), [handleTemplateSelect, handleTryPaperMode, handleEditInStudio]);

  // Render category filter
  const renderCategoryFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.filterContainer}
    >
      <TouchableOpacity
        style={[
          styles.filterChip,
          selectedCategory === 'all' && styles.filterChipActive
        ]}
        onPress={() => setSelectedCategory('all')}
      >
        <Text style={[
          styles.filterChipText,
          selectedCategory === 'all' && styles.filterChipTextActive
        ]}>
          All
        </Text>
      </TouchableOpacity>
      
      {TEMPLATE_CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.key}
          style={[
            styles.filterChip,
            selectedCategory === category.key && styles.filterChipActive
          ]}
          onPress={() => setSelectedCategory(category.key)}
        >
          <Ionicons 
            name={category.icon as any} 
            size={16} 
            color={selectedCategory === category.key ? theme.colors.text.inverse : category.color} 
          />
          <Text style={[
            styles.filterChipText,
            selectedCategory === category.key && styles.filterChipTextActive
          ]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Render difficulty filter
  const renderDifficultyFilter = () => (
    <View style={styles.difficultyFilter}>
      {DIFFICULTY_LEVELS.map((difficulty) => (
        <TouchableOpacity
          key={difficulty.key}
          style={[
            styles.difficultyChip,
            selectedDifficulty === difficulty.key && styles.difficultyChipActive
          ]}
          onPress={() => setSelectedDifficulty(difficulty.key)}
        >
          <View style={[
            styles.difficultyDot,
            { backgroundColor: difficulty.color }
          ]} />
          <Text style={[
            styles.difficultyChipText,
            selectedDifficulty === difficulty.key && styles.difficultyChipTextActive
          ]}>
            {difficulty.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render template details modal
  const renderTemplateDetailsModal = () => (
    <Modal
      visible={!!selectedTemplate}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setSelectedTemplate(null)}
    >
      <SafeAreaView style={styles.modalContainer}>
        {selectedTemplate && (
          <>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedTemplate.name}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedTemplate(null)}
              >
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Template Info */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Strategy Overview</Text>
                <Text style={styles.modalDescription}>{selectedTemplate.description}</Text>
                <Text style={styles.modalUseCase}>{selectedTemplate.useCase}</Text>
              </View>

              {/* Performance Stats */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Performance Stats</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statCard}>
                    <Text style={styles.statCardLabel}>Win Rate</Text>
                    <Text style={styles.statCardValue}>{selectedTemplate.sampleStats.winRate}%</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statCardLabel}>Profit Factor</Text>
                    <Text style={styles.statCardValue}>{selectedTemplate.sampleStats.profitFactor}</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statCardLabel}>Max Drawdown</Text>
                    <Text style={styles.statCardValue}>{selectedTemplate.sampleStats.maxDrawdown}%</Text>
                  </View>
                  <View style={styles.statCard}>
                    <Text style={styles.statCardLabel}>Sharpe Ratio</Text>
                    <Text style={styles.statCardValue}>{selectedTemplate.sampleStats.sharpeRatio}</Text>
                  </View>
                </View>
              </View>

              {/* Logic Blocks */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Strategy Logic</Text>
                
                <View style={styles.logicBlock}>
                  <Text style={styles.logicBlockTitle}>Entry Conditions</Text>
                  {selectedTemplate.logicBlocks.entry.map((condition, index) => (
                    <Text key={index} style={styles.logicCondition}>• {condition}</Text>
                  ))}
                </View>

                <View style={styles.logicBlock}>
                  <Text style={styles.logicBlockTitle}>Exit Conditions</Text>
                  {selectedTemplate.logicBlocks.exit.map((condition, index) => (
                    <Text key={index} style={styles.logicCondition}>• {condition}</Text>
                  ))}
                </View>

                <View style={styles.logicBlock}>
                  <Text style={styles.logicBlockTitle}>Risk Management</Text>
                  {selectedTemplate.logicBlocks.riskManagement.map((condition, index) => (
                    <Text key={index} style={styles.logicCondition}>• {condition}</Text>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={() => handleTryPaperMode(selectedTemplate)}
                >
                  <Ionicons name="play-circle" size={20} color={theme.colors.primary[500]} />
                  <Text style={styles.modalActionButtonText}>Try in Paper Mode</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalActionButton, styles.modalPrimaryActionButton]}
                  onPress={() => handleEditInStudio(selectedTemplate)}
                >
                  <Ionicons name="create" size={20} color={theme.colors.text.inverse} />
                  <Text style={styles.modalPrimaryActionButtonText}>Edit in FormulaStudio</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="library" size={24} color={theme.colors.primary[500]} />
          <Text style={styles.title}>Template Library</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="filter" size={20} color={theme.colors.primary[500]} />
          </TouchableOpacity>
          
          {onClose && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={theme.colors.text.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          {renderCategoryFilter()}
          {renderDifficultyFilter()}
        </View>
      )}

      {/* Templates Carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.carousel}
        contentContainerStyle={styles.carouselContent}
      >
        {filteredTemplates.map((template, index) => 
          renderTemplateCard(template, index)
        )}
      </ScrollView>

      {/* Template Details Modal */}
      {renderTemplateDetailsModal()}
    </Animated.View>
  );
};

// Helper functions
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return theme.colors.success[100];
    case 'intermediate': return theme.colors.warning[100];
    case 'advanced': return theme.colors.error[100];
    default: return theme.colors.neutral[100];
  }
};

const getCategoryIcon = (category: string) => {
  const categoryData = TEMPLATE_CATEGORIES.find(c => c.key === category);
  return categoryData?.icon || 'help-circle';
};

const getCategoryColor = (category: string) => {
  const categoryData = TEMPLATE_CATEGORIES.find(c => c.key === category);
  return categoryData?.color || theme.colors.neutral[500];
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  
  // Filters styles
  filtersContainer: {
    backgroundColor: theme.colors.background.secondary,
    paddingVertical: theme.spacing.md,
  },
  filterContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: theme.spacing.xs,
  },
  filterChipTextActive: {
    color: theme.colors.text.inverse,
  },
  
  // Difficulty filter styles
  difficultyFilter: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
  },
  difficultyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  difficultyChipActive: {
    backgroundColor: theme.colors.primary[50],
    borderColor: theme.colors.primary[500],
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  difficultyChipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  difficultyChipTextActive: {
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  // Carousel styles
  carousel: {
    flex: 1,
  },
  carouselContent: {
    paddingVertical: theme.spacing.md,
  },
  
  // Template card styles
  templateCard: {
    width: CARD_WIDTH,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginRight: CARD_SPACING,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  
  // Card header styles
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  cardBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  difficultyText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.warning[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  popularText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.warning[600],
    marginLeft: theme.spacing.xs,
  },
  verifiedBadge: {
    backgroundColor: theme.colors.success[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  categoryIcon: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
  },
  
  // Card content styles
  cardDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
    marginBottom: theme.spacing.md,
  },
  
  // Card stats styles
  cardStats: {
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
  
  // Card tags styles
  cardTags: {
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
  
  // Card actions styles
  cardActions: {
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
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  actionButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary[500],
    marginLeft: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.medium,
  },
  primaryActionButton: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
    marginRight: 0,
  },
  primaryActionButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.inverse,
    marginLeft: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.semiBold,
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
    paddingHorizontal: theme.spacing.md,
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
    paddingHorizontal: theme.spacing.md,
  },
  
  // Modal section styles
  modalSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  modalDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
    marginBottom: theme.spacing.sm,
  },
  modalUseCase: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  
  // Stats grid styles
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -theme.spacing.xs,
  },
  statCard: {
    width: '50%',
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  statCardLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  statCardValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  
  // Logic block styles
  logicBlock: {
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  logicBlockTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  logicCondition: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  
  // Modal actions styles
  modalActions: {
    paddingBottom: theme.spacing.xl,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary[500],
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  modalActionButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.primary[500],
    marginLeft: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  modalPrimaryActionButton: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  modalPrimaryActionButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.inverse,
    marginLeft: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
});

export default TemplatePicker;
