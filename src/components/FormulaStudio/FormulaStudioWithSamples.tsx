import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { FormulaStudio } from './FormulaStudio';
import { Formula } from '../../types';
import { sampleFormulas, getSampleFormulaById } from '../../samples/sampleFormulas';

interface FormulaStudioWithSamplesProps {
  initialFormula?: Formula;
  onFormulaChange?: (formula: Formula) => void;
  onSave?: (formula: Formula) => void;
}

export const FormulaStudioWithSamples: React.FC<FormulaStudioWithSamplesProps> = ({
  initialFormula,
  onFormulaChange,
  onSave,
}) => {
  const [currentFormula, setCurrentFormula] = useState<Formula | undefined>(initialFormula);
  const [isSampleModalVisible, setIsSampleModalVisible] = useState(false);

  const handleLoadSample = (sampleId: string) => {
    const sample = getSampleFormulaById(sampleId);
    if (sample) {
      setCurrentFormula(sample);
      setIsSampleModalVisible(false);
    }
  };

  const handleFormulaChange = (formula: Formula) => {
    setCurrentFormula(formula);
    onFormulaChange?.(formula);
  };

  const renderSampleFormula = (formula: Formula) => (
    <TouchableOpacity
      key={formula.id}
      style={styles.sampleItem}
      onPress={() => handleLoadSample(formula.id)}
    >
      <View style={styles.sampleHeader}>
        <Text style={styles.sampleName}>{formula.name}</Text>
        <Text style={styles.sampleComplexity}>
          {formula.blocks.length} blocks
        </Text>
      </View>
      <Text style={styles.sampleDescription} numberOfLines={2}>
        {formula.description}
      </Text>
      <View style={styles.sampleStats}>
        <Text style={styles.sampleStat}>
          📊 {formula.blocks.filter(b => b.type === 'indicator').length} indicators
        </Text>
        <Text style={styles.sampleStat}>
          🔗 {formula.connections.length} connections
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FormulaStudio
        initialFormula={currentFormula}
        onFormulaChange={handleFormulaChange}
        onSave={onSave}
      />
      
      <TouchableOpacity
        style={styles.samplesButton}
        onPress={() => setIsSampleModalVisible(true)}
      >
        <Text style={styles.samplesButtonText}>📚 Load Sample</Text>
      </TouchableOpacity>

      <Modal
        visible={isSampleModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsSampleModalVisible(false)}
      >
        <View style={styles.sampleModal}>
          <View style={styles.sampleModalHeader}>
            <TouchableOpacity
              onPress={() => setIsSampleModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.sampleModalTitle}>Sample Formulas</Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView style={styles.sampleList}>
            <Text style={styles.sectionTitle}>Trading Strategies</Text>
            {sampleFormulas.map(renderSampleFormula)}
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Getting Started</Text>
              <Text style={styles.helpText}>
                Choose a sample formula to see how FormulaStudio works. You can modify any sample or start from scratch.
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  samplesButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  samplesButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sampleModal: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  sampleModalHeader: {
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
  sampleModalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  placeholder: {
    width: 60,
  },
  sampleList: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
    marginTop: 8,
  },
  sampleItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sampleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  sampleComplexity: {
    fontSize: 12,
    color: '#8E8E93',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sampleDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 12,
  },
  sampleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sampleStat: {
    fontSize: 12,
    color: '#6D6D70',
    fontWeight: '500',
  },
  section: {
    marginTop: 20,
  },
  helpText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
});