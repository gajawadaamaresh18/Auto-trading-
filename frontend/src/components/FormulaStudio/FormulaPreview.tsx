/**
 * Formula Preview Component
 * 
 * Displays a visual preview of the formula logic tree, generated pseudocode,
 * and natural language explanation of the trading strategy.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { FormulaCanvas, LogicNode, FormulaPreview as FormulaPreviewType } from './types';
import { generatePseudocode, generateNaturalLanguage, buildLogicTree } from './utils/formulaGenerator';
import theme from '../../theme';

export interface FormulaPreviewProps {
  /** Whether preview modal is visible */
  visible: boolean;
  /** Formula canvas to preview */
  formula: FormulaCanvas;
  /** Callback when preview is closed */
  onClose: () => void;
  /** Additional styling */
  style?: any;
}

const FormulaPreview: React.FC<FormulaPreviewProps> = ({
  visible,
  formula,
  onClose,
  style,
}) => {
  const [activeTab, setActiveTab] = useState<'tree' | 'code' | 'explanation'>('tree');

  // Generate preview data
  const previewData = useMemo((): FormulaPreviewType => {
    const logicTree = buildLogicTree(formula);
    const pseudocode = generatePseudocode(formula);
    const naturalLanguage = generateNaturalLanguage(formula);

    return {
      pseudocode,
      naturalLanguage,
      logicTree,
      estimatedComplexity: calculateComplexity(formula),
      riskLevel: calculateRiskLevel(formula),
      executionTime: calculateExecutionTime(formula),
    };
  }, [formula]);

  // Calculate formula complexity
  const calculateComplexity = (formula: FormulaCanvas): 'low' | 'medium' | 'high' => {
    const blockCount = formula.blocks.length;
    const connectionCount = formula.connections.length;
    const hasGroups = formula.blocks.some(block => block.type === 'group');

    if (blockCount <= 3 && connectionCount <= 2 && !hasGroups) return 'low';
    if (blockCount <= 8 && connectionCount <= 6) return 'medium';
    return 'high';
  };

  // Calculate risk level
  const calculateRiskLevel = (formula: FormulaCanvas): 'low' | 'medium' | 'high' => {
    const hasStopLoss = formula.blocks.some(block => 
      block.type === 'action' && block.actionType === 'set_stop_loss'
    );
    const hasTakeProfit = formula.blocks.some(block => 
      block.type === 'action' && block.actionType === 'set_take_profit'
    );
    const actionCount = formula.blocks.filter(block => block.type === 'action').length;

    if (hasStopLoss && hasTakeProfit && actionCount <= 2) return 'low';
    if (hasStopLoss || hasTakeProfit) return 'medium';
    return 'high';
  };

  // Calculate execution time
  const calculateExecutionTime = (formula: FormulaCanvas): number => {
    const blockCount = formula.blocks.length;
    const connectionCount = formula.connections.length;
    
    // Base time + complexity factors
    return 100 + (blockCount * 50) + (connectionCount * 25);
  };

  // Share formula
  const handleShare = useCallback(async () => {
    try {
      const shareText = `Trading Strategy: ${formula.name}\n\n${previewData.naturalLanguage}`;
      await Share.share({
        message: shareText,
        title: formula.name,
      });
    } catch (error) {
      console.error('Error sharing formula:', error);
    }
  }, [formula, previewData]);

  // Render logic tree
  const renderLogicTree = () => (
    <ScrollView style={styles.treeContainer}>
      <LogicTreeNode node={previewData.logicTree} level={0} />
    </ScrollView>
  );

  // Render pseudocode
  const renderPseudocode = () => (
    <ScrollView style={styles.codeContainer}>
      <View style={styles.codeBlock}>
        <Text style={styles.codeText}>{previewData.pseudocode}</Text>
      </View>
    </ScrollView>
  );

  // Render natural language explanation
  const renderExplanation = () => (
    <ScrollView style={styles.explanationContainer}>
      <View style={styles.explanationBlock}>
        <Text style={styles.explanationText}>{previewData.naturalLanguage}</Text>
      </View>
    </ScrollView>
  );

  // Render stats
  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Complexity</Text>
        <View style={[
          styles.statBadge,
          { backgroundColor: getComplexityColor(previewData.estimatedComplexity) }
        ]}>
          <Text style={styles.statValue}>{previewData.estimatedComplexity.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Risk Level</Text>
        <View style={[
          styles.statBadge,
          { backgroundColor: getRiskColor(previewData.riskLevel) }
        ]}>
          <Text style={styles.statValue}>{previewData.riskLevel.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Execution Time</Text>
        <Text style={styles.statValue}>{previewData.executionTime}ms</Text>
      </View>

      <View style={styles.statItem}>
        <Text style={styles.statLabel}>Blocks</Text>
        <Text style={styles.statValue}>{formula.blocks.length}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, style]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{formula.name}</Text>
            <Text style={styles.subtitle}>Formula Preview</Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Ionicons name="share" size={20} color={theme.colors.primary[500]} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        {renderStats()}

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tree' && styles.activeTab]}
            onPress={() => setActiveTab('tree')}
          >
            <Ionicons 
              name="git-branch" 
              size={16} 
              color={activeTab === 'tree' ? theme.colors.primary[500] : theme.colors.text.secondary} 
            />
            <Text style={[
              styles.tabText,
              activeTab === 'tree' && styles.activeTabText
            ]}>
              Logic Tree
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'code' && styles.activeTab]}
            onPress={() => setActiveTab('code')}
          >
            <Ionicons 
              name="code" 
              size={16} 
              color={activeTab === 'code' ? theme.colors.primary[500] : theme.colors.text.secondary} 
            />
            <Text style={[
              styles.tabText,
              activeTab === 'code' && styles.activeTabText
            ]}>
              Pseudocode
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'explanation' && styles.activeTab]}
            onPress={() => setActiveTab('explanation')}
          >
            <Ionicons 
              name="document-text" 
              size={16} 
              color={activeTab === 'explanation' ? theme.colors.primary[500] : theme.colors.text.secondary} 
            />
            <Text style={[
              styles.tabText,
              activeTab === 'explanation' && styles.activeTabText
            ]}>
              Explanation
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'tree' && renderLogicTree()}
          {activeTab === 'code' && renderPseudocode()}
          {activeTab === 'explanation' && renderExplanation()}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Logic Tree Node Component
interface LogicTreeNodeProps {
  node: LogicNode;
  level: number;
}

const LogicTreeNode: React.FC<LogicTreeNodeProps> = ({ node, level }) => {
  const indent = level * 20;

  return (
    <View style={[styles.treeNode, { marginLeft: indent }]}>
      <View style={styles.nodeHeader}>
        <View style={[
          styles.nodeIcon,
          { backgroundColor: getNodeColor(node.type) }
        ]}>
          <Ionicons 
            name={getNodeIcon(node.type)} 
            size={16} 
            color={theme.colors.text.inverse} 
          />
        </View>
        <Text style={styles.nodeLabel}>{node.label}</Text>
      </View>

      {node.parameters && Object.keys(node.parameters).length > 0 && (
        <View style={styles.nodeParameters}>
          {Object.entries(node.parameters).map(([key, value]) => (
            <Text key={key} style={styles.parameterText}>
              {key}: {String(value)}
            </Text>
          ))}
        </View>
      )}

      {node.children.map((child, index) => (
        <LogicTreeNode key={index} node={child} level={level + 1} />
      ))}
    </View>
  );
};

// Helper functions
const getComplexityColor = (complexity: string) => {
  switch (complexity) {
    case 'low': return theme.colors.success[100];
    case 'medium': return theme.colors.warning[100];
    case 'high': return theme.colors.error[100];
    default: return theme.colors.neutral[100];
  }
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'low': return theme.colors.success[100];
    case 'medium': return theme.colors.warning[100];
    case 'high': return theme.colors.error[100];
    default: return theme.colors.neutral[100];
  }
};

const getNodeColor = (type: string) => {
  switch (type) {
    case 'indicator': return theme.colors.primary[500];
    case 'condition': return theme.colors.warning[500];
    case 'action': return theme.colors.success[500];
    case 'group': return theme.colors.secondary[500];
    default: return theme.colors.neutral[500];
  }
};

const getNodeIcon = (type: string) => {
  switch (type) {
    case 'indicator': return 'trending-up';
    case 'condition': return 'checkmark-circle';
    case 'action': return 'play-circle';
    case 'group': return 'git-branch';
    default: return 'ellipse';
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
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  
  // Stats styles
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  statBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.secondary,
    paddingHorizontal: theme.spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary[500],
  },
  tabText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  activeTabText: {
    color: theme.colors.primary[500],
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  // Content styles
  content: {
    flex: 1,
  },
  
  // Tree styles
  treeContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  treeNode: {
    marginBottom: theme.spacing.sm,
  },
  nodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  nodeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  nodeLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  nodeParameters: {
    marginLeft: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  parameterText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  
  // Code styles
  codeContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  codeBlock: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  codeText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: 'monospace',
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  
  // Explanation styles
  explanationContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  explanationBlock: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  explanationText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
});

export default FormulaPreview;
