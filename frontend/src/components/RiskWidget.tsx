import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { Card, ProgressBar, Button, Chip } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';

interface RiskWidgetProps {
  currentRisk: number;
  maxRisk: number;
  riskHistory: Array<{ date: string; risk: number }>;
  onRiskExceeded?: () => void;
  onAdjustRisk?: (newRisk: number) => void;
  isBlocked?: boolean;
}

export const RiskWidget: React.FC<RiskWidgetProps> = ({
  currentRisk,
  maxRisk,
  riskHistory,
  onRiskExceeded,
  onAdjustRisk,
  isBlocked = false,
}) => {
  const riskPercentage = (currentRisk / maxRisk) * 100;
  const isRiskHigh = riskPercentage > 80;
  const isRiskExceeded = currentRisk > maxRisk;

  React.useEffect(() => {
    if (isRiskExceeded && onRiskExceeded) {
      Alert.alert(
        'Risk Limit Exceeded',
        'Your current risk level exceeds the maximum allowed. Trading has been blocked.',
        [
          {
            text: 'OK',
            onPress: onRiskExceeded,
          },
        ]
      );
    }
  }, [isRiskExceeded, onRiskExceeded]);

  const handleAdjustRisk = () => {
    Alert.prompt(
      'Adjust Risk Limit',
      'Enter new maximum risk limit:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set',
          onPress: (value) => {
            const newRisk = parseFloat(value || '0');
            if (newRisk > 0 && onAdjustRisk) {
              onAdjustRisk(newRisk);
            }
          },
        },
      ],
      'plain-text',
      maxRisk.toString()
    );
  };

  const chartData = {
    labels: riskHistory.slice(-7).map(item => 
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        data: riskHistory.slice(-7).map(item => item.risk),
        color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const getRiskColor = () => {
    if (isRiskExceeded) return '#F44336';
    if (isRiskHigh) return '#FF9800';
    return '#4CAF50';
  };

  const getRiskStatus = () => {
    if (isRiskExceeded) return 'EXCEEDED';
    if (isRiskHigh) return 'HIGH';
    return 'NORMAL';
  };

  return (
    <Card style={[styles.container, isBlocked && styles.blocked]}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={styles.title}>Risk Management</Text>
          <Chip
            style={[styles.statusChip, { backgroundColor: getRiskColor() }]}
            textStyle={styles.statusText}
          >
            {getRiskStatus()}
          </Chip>
        </View>

        <View style={styles.riskInfo}>
          <Text style={styles.riskText}>
            Current Risk: ${currentRisk.toFixed(2)}
          </Text>
          <Text style={styles.riskText}>
            Max Risk: ${maxRisk.toFixed(2)}
          </Text>
        </View>

        <ProgressBar
          progress={Math.min(riskPercentage / 100, 1)}
          color={getRiskColor()}
          style={styles.progressBar}
        />

        <Text style={styles.percentageText}>
          {riskPercentage.toFixed(1)}% of max risk
        </Text>

        {riskHistory.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Risk History (7 days)</Text>
            <LineChart
              data={chartData}
              width={300}
              height={120}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={handleAdjustRisk}
            testID="adjust-risk-button"
          >
            Adjust Risk Limit
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 8,
    elevation: 4,
  },
  blocked: {
    borderColor: '#F44336',
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  riskInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  riskText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  actions: {
    marginTop: 16,
    alignItems: 'center',
  },
});