import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Card,
  TextInput,
  Button,
  SegmentedButtons,
  Chip,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';

interface RiskConfig {
  maxPortfolioRisk: number;
  maxPositionSize: number;
  maxRiskPerTrade: number;
  maxDrawdown: number;
}

interface TradeData {
  symbol: string;
  entryPrice: number;
  positionSize: number;
  stopLoss: number;
  takeProfit: number;
  stopLossType: 'fixed' | 'percentage' | 'trailing';
  takeProfitType: 'fixed' | 'percentage' | 'trailing';
  currentPrice: number;
  portfolioValue: number;
}

interface RiskMetrics {
  riskAmount: number;
  rewardAmount: number;
  riskRewardRatio: number;
  portfolioRisk: number;
  positionRisk: number;
  isRisky: boolean;
  warnings: string[];
}

const RiskWidget: React.FC = () => {
  const [tradeData, setTradeData] = useState<TradeData>({
    symbol: 'BTC/USDT',
    entryPrice: 50000,
    positionSize: 0.1,
    stopLoss: 48000,
    takeProfit: 52000,
    stopLossType: 'fixed',
    takeProfitType: 'fixed',
    currentPrice: 50000,
    portfolioValue: 10000,
  });

  const [riskConfig, setRiskConfig] = useState<RiskConfig>({
    maxPortfolioRisk: 0.02, // 2%
    maxPositionSize: 0.1, // 10%
    maxRiskPerTrade: 0.01, // 1%
    maxDrawdown: 0.05, // 5%
  });

  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    riskAmount: 0,
    rewardAmount: 0,
    riskRewardRatio: 0,
    portfolioRisk: 0,
    positionRisk: 0,
    isRisky: false,
    warnings: [],
  });

  const [isValidating, setIsValidating] = useState(false);

  // Calculate risk metrics
  const calculateRiskMetrics = useCallback(() => {
    const { entryPrice, positionSize, stopLoss, takeProfit, portfolioValue } = tradeData;
    
    // Calculate risk and reward amounts
    const riskAmount = Math.abs(entryPrice - stopLoss) * positionSize;
    const rewardAmount = Math.abs(takeProfit - entryPrice) * positionSize;
    const riskRewardRatio = riskAmount > 0 ? rewardAmount / riskAmount : 0;
    
    // Calculate portfolio risk percentages
    const portfolioRisk = (riskAmount / portfolioValue) * 100;
    const positionRisk = (positionSize * entryPrice / portfolioValue) * 100;
    
    // Check if trade is risky
    const warnings: string[] = [];
    let isRisky = false;
    
    if (portfolioRisk > riskConfig.maxPortfolioRisk * 100) {
      warnings.push(`Portfolio risk (${portfolioRisk.toFixed(2)}%) exceeds maximum (${(riskConfig.maxPortfolioRisk * 100).toFixed(2)}%)`);
      isRisky = true;
    }
    
    if (positionRisk > riskConfig.maxPositionSize * 100) {
      warnings.push(`Position size (${positionRisk.toFixed(2)}%) exceeds maximum (${(riskConfig.maxPositionSize * 100).toFixed(2)}%)`);
      isRisky = true;
    }
    
    if (riskAmount / portfolioValue > riskConfig.maxRiskPerTrade) {
      warnings.push(`Risk per trade (${((riskAmount / portfolioValue) * 100).toFixed(2)}%) exceeds maximum (${(riskConfig.maxRiskPerTrade * 100).toFixed(2)}%)`);
      isRisky = true;
    }
    
    if (riskRewardRatio < 1) {
      warnings.push(`Risk:Reward ratio (${riskRewardRatio.toFixed(2)}) is below 1:1`);
    }
    
    setRiskMetrics({
      riskAmount,
      rewardAmount,
      riskRewardRatio,
      portfolioRisk,
      positionRisk,
      isRisky,
      warnings,
    });
  }, [tradeData, riskConfig]);

  // Validate trade with backend
  const validateTrade = async () => {
    setIsValidating(true);
    try {
      const response = await fetch('http://localhost:8000/api/risk/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trade: tradeData,
          risk_config: riskConfig,
        }),
      });
      
      const result = await response.json();
      
      if (result.status === 'rejected') {
        Alert.alert(
          'Trade Rejected',
          result.message,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Trade Approved',
          'Trade passes risk validation',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Validation Error',
        'Failed to validate trade with backend',
        [{ text: 'OK' }]
      );
    } finally {
      setIsValidating(false);
    }
  };

  // Auto-block risky trades
  const handleTradeExecution = () => {
    if (riskMetrics.isRisky) {
      Alert.alert(
        'Risky Trade Blocked',
        `This trade has been blocked due to risk violations:\n\n${riskMetrics.warnings.join('\n')}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Override', onPress: validateTrade },
        ]
      );
    } else {
      validateTrade();
    }
  };

  useEffect(() => {
    calculateRiskMetrics();
  }, [calculateRiskMetrics]);

  const updateTradeData = (field: keyof TradeData, value: string | number) => {
    setTradeData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value,
    }));
  };

  const updateRiskConfig = (field: keyof RiskConfig, value: string) => {
    setRiskConfig(prev => ({
      ...prev,
      [field]: parseFloat(value) / 100 || 0,
    }));
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Risk Control Widget" />
        <Card.Content>
          {/* Trade Inputs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trade Details</Text>
            
            <TextInput
              label="Symbol"
              value={tradeData.symbol}
              onChangeText={(value) => updateTradeData('symbol', value)}
              style={styles.input}
            />
            
            <TextInput
              label="Entry Price"
              value={tradeData.entryPrice.toString()}
              onChangeText={(value) => updateTradeData('entryPrice', value)}
              keyboardType="numeric"
              style={styles.input}
            />
            
            <TextInput
              label="Position Size"
              value={tradeData.positionSize.toString()}
              onChangeText={(value) => updateTradeData('positionSize', value)}
              keyboardType="numeric"
              style={styles.input}
            />
            
            <TextInput
              label="Portfolio Value"
              value={tradeData.portfolioValue.toString()}
              onChangeText={(value) => updateTradeData('portfolioValue', value)}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <Divider style={styles.divider} />

          {/* Stop Loss Configuration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stop Loss</Text>
            
            <SegmentedButtons
              value={tradeData.stopLossType}
              onValueChange={(value) => updateTradeData('stopLossType', value)}
              buttons={[
                { value: 'fixed', label: 'Fixed' },
                { value: 'percentage', label: '%' },
                { value: 'trailing', label: 'Trailing' },
              ]}
              style={styles.segmentedButtons}
            />
            
            <TextInput
              label={tradeData.stopLossType === 'percentage' ? 'Stop Loss %' : 'Stop Loss Price'}
              value={tradeData.stopLoss.toString()}
              onChangeText={(value) => updateTradeData('stopLoss', value)}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <Divider style={styles.divider} />

          {/* Take Profit Configuration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Take Profit</Text>
            
            <SegmentedButtons
              value={tradeData.takeProfitType}
              onValueChange={(value) => updateTradeData('takeProfitType', value)}
              buttons={[
                { value: 'fixed', label: 'Fixed' },
                { value: 'percentage', label: '%' },
                { value: 'trailing', label: 'Trailing' },
              ]}
              style={styles.segmentedButtons}
            />
            
            <TextInput
              label={tradeData.takeProfitType === 'percentage' ? 'Take Profit %' : 'Take Profit Price'}
              value={tradeData.takeProfit.toString()}
              onChangeText={(value) => updateTradeData('takeProfit', value)}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <Divider style={styles.divider} />

          {/* Risk Configuration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Risk Configuration</Text>
            
            <TextInput
              label="Max Portfolio Risk (%)"
              value={(riskConfig.maxPortfolioRisk * 100).toString()}
              onChangeText={(value) => updateRiskConfig('maxPortfolioRisk', value)}
              keyboardType="numeric"
              style={styles.input}
            />
            
            <TextInput
              label="Max Position Size (%)"
              value={(riskConfig.maxPositionSize * 100).toString()}
              onChangeText={(value) => updateRiskConfig('maxPositionSize', value)}
              keyboardType="numeric"
              style={styles.input}
            />
            
            <TextInput
              label="Max Risk Per Trade (%)"
              value={(riskConfig.maxRiskPerTrade * 100).toString()}
              onChangeText={(value) => updateRiskConfig('maxRiskPerTrade', value)}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <Divider style={styles.divider} />

          {/* Risk Metrics Display */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Risk Metrics</Text>
            
            <View style={styles.metricsGrid}>
              <Chip 
                icon="trending-up" 
                style={[styles.chip, riskMetrics.riskRewardRatio >= 1 ? styles.chipGood : styles.chipWarning]}
              >
                R:R {riskMetrics.riskRewardRatio.toFixed(2)}
              </Chip>
              
              <Chip 
                icon="shield" 
                style={[styles.chip, riskMetrics.portfolioRisk <= riskConfig.maxPortfolioRisk * 100 ? styles.chipGood : styles.chipDanger]}
              >
                Portfolio Risk: {riskMetrics.portfolioRisk.toFixed(2)}%
              </Chip>
              
              <Chip 
                icon="chart-line" 
                style={[styles.chip, riskMetrics.positionRisk <= riskConfig.maxPositionSize * 100 ? styles.chipGood : styles.chipDanger]}
              >
                Position Risk: {riskMetrics.positionRisk.toFixed(2)}%
              </Chip>
            </View>

            {/* Risk Progress Bar */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Portfolio Risk Level</Text>
              <ProgressBar 
                progress={riskMetrics.portfolioRisk / (riskConfig.maxPortfolioRisk * 100)} 
                color={riskMetrics.portfolioRisk > riskConfig.maxPortfolioRisk * 100 ? '#f44336' : '#4caf50'}
                style={styles.progressBar}
              />
            </View>

            {/* Warnings */}
            {riskMetrics.warnings.length > 0 && (
              <View style={styles.warningsContainer}>
                <Text style={styles.warningsTitle}>⚠️ Warnings:</Text>
                {riskMetrics.warnings.map((warning, index) => (
                  <Text key={index} style={styles.warningText}>• {warning}</Text>
                ))}
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleTradeExecution}
              loading={isValidating}
              disabled={isValidating}
              style={[styles.button, riskMetrics.isRisky && styles.buttonDanger]}
            >
              {riskMetrics.isRisky ? 'Blocked - Override?' : 'Execute Trade'}
            </Button>
            
            <Button
              mode="outlined"
              onPress={validateTrade}
              style={styles.button}
            >
              Validate Only
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    elevation: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 12,
  },
  divider: {
    marginVertical: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    margin: 4,
  },
  chipGood: {
    backgroundColor: '#e8f5e8',
  },
  chipWarning: {
    backgroundColor: '#fff3cd',
  },
  chipDanger: {
    backgroundColor: '#f8d7da',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  warningsContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#856404',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  buttonDanger: {
    backgroundColor: '#f44336',
  },
});

export default RiskWidget;