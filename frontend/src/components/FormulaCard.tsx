import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Card, Chip, IconButton } from 'react-native-paper';
import { Formula } from '@/types';

interface FormulaCardProps {
  formula: Formula;
  onPress: (formula: Formula) => void;
  onSubscribe: (formulaId: string) => void;
  onClone: (formulaId: string) => void;
  onEdit?: (formulaId: string) => void;
  isSubscribed?: boolean;
  showActions?: boolean;
}

export const FormulaCard: React.FC<FormulaCardProps> = ({
  formula,
  onPress,
  onSubscribe,
  onClone,
  onEdit,
  isSubscribed = false,
  showActions = true,
}) => {
  const handleSubscribe = () => {
    if (isSubscribed) {
      Alert.alert(
        'Unsubscribe',
        'Are you sure you want to unsubscribe from this formula?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Unsubscribe', onPress: () => onSubscribe(formula.id) },
        ]
      );
    } else {
      onSubscribe(formula.id);
    }
  };

  const handleClone = () => {
    Alert.alert(
      'Clone Formula',
      'This will create a copy of the formula that you can edit.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clone', onPress: () => onClone(formula.id) },
      ]
    );
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      default: return '#757575';
    }
  };

  return (
    <Card style={styles.card} onPress={() => onPress(formula)}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {formula.name}
          </Text>
          <Chip
            style={[styles.riskChip, { backgroundColor: getRiskColor(formula.riskLevel) }]}
            textStyle={styles.riskText}
          >
            {formula.riskLevel.toUpperCase()}
          </Chip>
        </View>
        
        <Text style={styles.description} numberOfLines={3}>
          {formula.description}
        </Text>
        
        {formula.performance && (
          <View style={styles.performance}>
            <Text style={styles.performanceText}>
              Return: {formula.performance.totalReturn.toFixed(2)}%
            </Text>
            <Text style={styles.performanceText}>
              Sharpe: {formula.performance.sharpeRatio.toFixed(2)}
            </Text>
          </View>
        )}
        
        <Text style={styles.blocksCount}>
          {formula.blocks.length} blocks
        </Text>
      </Card.Content>
      
      {showActions && (
        <Card.Actions>
          <IconButton
            icon={isSubscribed ? 'heart' : 'heart-outline'}
            iconColor={isSubscribed ? '#F44336' : '#757575'}
            onPress={handleSubscribe}
            testID="subscribe-button"
          />
          <IconButton
            icon="content-copy"
            onPress={handleClone}
            testID="clone-button"
          />
          {onEdit && (
            <IconButton
              icon="pencil"
              onPress={() => onEdit(formula.id)}
              testID="edit-button"
            />
          )}
        </Card.Actions>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  riskChip: {
    height: 24,
  },
  riskText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  performance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  performanceText: {
    fontSize: 12,
    color: '#666',
  },
  blocksCount: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});