import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { Formula, FormulaPreview as FormulaPreviewType } from '../../types';

interface FormulaPreviewProps {
  formula: Formula;
  isVisible: boolean;
  onClose: () => void;
}

export const FormulaPreview: React.FC<FormulaPreviewProps> = ({
  formula,
  isVisible,
  onClose,
}) => {
  const generatePreview = (formula: Formula): FormulaPreviewType => {
    const blockCount = formula.blocks.length;
    const connectionCount = formula.connections.length;
    
    let naturalLanguage = '';
    let pseudoCode = '';
    let complexity: 'simple' | 'medium' | 'complex' = 'simple';

    if (blockCount === 0) {
      naturalLanguage = 'No blocks defined yet. Add some blocks to create your strategy.';
      pseudoCode = '// Empty formula';
    } else {
      // Generate natural language description
      const indicators = formula.blocks.filter(b => b.type === 'indicator');
      const signals = formula.blocks.filter(b => b.type === 'signal');
      const conditions = formula.blocks.filter(b => b.type === 'condition');
      const actions = formula.blocks.filter(b => b.type === 'action');

      naturalLanguage = 'This strategy ';
      
      if (indicators.length > 0) {
        naturalLanguage += `uses ${indicators.map(i => i.name).join(', ')} indicators`;
      }
      
      if (signals.length > 0) {
        naturalLanguage += ` and generates ${signals.length} signal(s)`;
      }
      
      if (conditions.length > 0) {
        naturalLanguage += ` with ${conditions.length} logical condition(s)`;
      }
      
      if (actions.length > 0) {
        naturalLanguage += ` to execute ${actions.map(a => a.name).join(', ')} actions`;
      }

      // Generate pseudo code
      pseudoCode = '// Trading Strategy Formula\n';
      pseudoCode += `// Generated on ${new Date().toLocaleDateString()}\n\n`;
      
      if (indicators.length > 0) {
        pseudoCode += '// Indicators\n';
        indicators.forEach(indicator => {
          pseudoCode += `let ${indicator.name.toLowerCase().replace(/\s+/g, '_')} = ${indicator.name}(${indicator.parameters.map(p => p.value).join(', ')});\n`;
        });
        pseudoCode += '\n';
      }

      if (signals.length > 0) {
        pseudoCode += '// Signals\n';
        signals.forEach(signal => {
          pseudoCode += `if (${signal.name.toLowerCase().replace(/\s+/g, '_')}_condition) {\n`;
          pseudoCode += `  generate_signal("${signal.name}");\n`;
          pseudoCode += '}\n\n';
        });
      }

      if (actions.length > 0) {
        pseudoCode += '// Actions\n';
        actions.forEach(action => {
          pseudoCode += `if (action_triggered) {\n`;
          pseudoCode += `  execute_action("${action.name}");\n`;
          pseudoCode += '}\n';
        });
      }

      // Determine complexity
      if (blockCount <= 3 && connectionCount <= 2) {
        complexity = 'simple';
      } else if (blockCount <= 8 && connectionCount <= 6) {
        complexity = 'medium';
      } else {
        complexity = 'complex';
      }
    }

    return {
      naturalLanguage,
      pseudoCode,
      complexity,
      estimatedBlocks: blockCount,
    };
  };

  const preview = generatePreview(formula);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return '#34C759';
      case 'medium':
        return '#FF9500';
      case 'complex':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return '🟢';
      case 'medium':
        return '🟡';
      case 'complex':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Formula Preview</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.formulaInfo}>
            <Text style={styles.formulaName}>{formula.name}</Text>
            <Text style={styles.formulaDescription}>{formula.description}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formula.blocks.length}</Text>
                <Text style={styles.statLabel}>Blocks</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formula.connections.length}</Text>
                <Text style={styles.statLabel}>Connections</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: getComplexityColor(preview.complexity) }]}>
                  {getComplexityIcon(preview.complexity)}
                </Text>
                <Text style={styles.statLabel}>{preview.complexity}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Natural Language Description</Text>
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>{preview.naturalLanguage}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Generated Pseudo Code</Text>
            <View style={styles.codeContainer}>
              <Text style={styles.codeText}>{preview.pseudoCode}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>JSON Export</Text>
            <View style={styles.jsonContainer}>
              <Text style={styles.jsonText}>
                {JSON.stringify(formula, null, 2)}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeText: {
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formulaInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  formulaName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  formulaDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  descriptionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 24,
  },
  codeContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
  },
  codeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  jsonContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  jsonText: {
    fontSize: 10,
    color: '#1C1C1E',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
});