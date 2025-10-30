/**
 * Chart Components
 * 
 * Reusable chart components for displaying trading data and performance metrics.
 * Includes sparkline for compact displays and full chart for detailed analysis.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Svg, Path, Line, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

const { width: screenWidth } = Dimensions.get('window');

// ============================================================================
// SPARKLINE CHART COMPONENT
// ============================================================================

export interface SparklineChartProps {
  /** Chart data points */
  data: number[];
  /** Chart width */
  width?: number;
  /** Chart height */
  height?: number;
  /** Line color */
  color?: string;
  /** Fill color for area under line */
  fillColor?: string;
  /** Whether to show area fill */
  showFill?: boolean;
  /** Whether to show data points */
  showPoints?: boolean;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Callback when chart is pressed */
  onPress?: () => void;
  /** Additional styling */
  style?: any;
}

const SparklineChart: React.FC<SparklineChartProps> = ({
  data,
  width = 100,
  height = 30,
  color = theme.colors.primary[500],
  fillColor = theme.colors.primary[100],
  showFill = false,
  showPoints = false,
  animationDuration = 300,
  onPress,
  style,
}) => {
  if (!data || data.length < 2) {
    return (
      <View style={[styles.sparklineContainer, { width, height }, style]}>
        <Text style={styles.noDataText}>No Data</Text>
      </View>
    );
  }

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue;
  
  if (range === 0) {
    return (
      <View style={[styles.sparklineContainer, { width, height }, style]}>
        <Text style={styles.noDataText}>Flat</Text>
      </View>
    );
  }

  // Generate path data
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * width,
    y: height - ((value - minValue) / range) * height,
  }));

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  // Generate fill path
  const fillPathData = showFill 
    ? `${pathData} L ${width} ${height} L 0 ${height} Z`
    : '';

  const ChartContent = () => (
    <Svg width={width} height={height} style={styles.sparklineSvg}>
      <Defs>
        <LinearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={fillColor} stopOpacity="0.3" />
          <Stop offset="100%" stopColor={fillColor} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      
      {/* Area fill */}
      {showFill && (
        <Path
          d={fillPathData}
          fill="url(#sparklineGradient)"
        />
      )}
      
      {/* Line */}
      <Path
        d={pathData}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Data points */}
      {showPoints && points.map((point, index) => (
        <Circle
          key={index}
          cx={point.x}
          cy={point.y}
          r="2"
          fill={color}
        />
      ))}
    </Svg>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.sparklineContainer, { width, height }, style]}
      >
        <ChartContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.sparklineContainer, { width, height }, style]}>
      <ChartContent />
    </View>
  );
};

// ============================================================================
// PERFORMANCE CHART COMPONENT
// ============================================================================

export interface PerformanceChartProps {
  /** Chart data points */
  data: Array<{ date: string; value: number; label?: string }>;
  /** Chart width */
  width?: number;
  /** Chart height */
  height?: number;
  /** Chart title */
  title?: string;
  /** Chart subtitle */
  subtitle?: string;
  /** Line color */
  color?: string;
  /** Fill color for area under line */
  fillColor?: string;
  /** Whether to show grid lines */
  showGrid?: boolean;
  /** Whether to show data points */
  showPoints?: boolean;
  /** Whether to show value labels */
  showLabels?: boolean;
  /** Chart type */
  type?: 'line' | 'area' | 'candlestick';
  /** Time period */
  period?: '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';
  /** Callback when period changes */
  onPeriodChange?: (period: string) => void;
  /** Callback when chart is pressed */
  onPress?: () => void;
  /** Additional styling */
  style?: any;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  width = screenWidth - theme.spacing.xl,
  height = 200,
  title,
  subtitle,
  color = theme.colors.primary[500],
  fillColor = theme.colors.primary[100],
  showGrid = true,
  showPoints = true,
  showLabels = true,
  type = 'line',
  period = '1M',
  onPeriodChange,
  onPress,
  style,
}) => {
  if (!data || data.length < 2) {
    return (
      <View style={[styles.chartContainer, { width, height }, style]}>
        <View style={styles.chartHeader}>
          {title && <Text style={styles.chartTitle}>{title}</Text>}
          {subtitle && <Text style={styles.chartSubtitle}>{subtitle}</Text>}
        </View>
        <View style={styles.noDataContainer}>
          <Ionicons name="bar-chart-outline" size={48} color={theme.colors.neutral[300]} />
          <Text style={styles.noDataText}>No Data Available</Text>
        </View>
      </View>
    );
  }

  const minValue = Math.min(...data.map(d => d.value));
  const maxValue = Math.max(...data.map(d => d.value));
  const range = maxValue - minValue;
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2 - 60; // Account for header

  // Generate path data
  const points = data.map((item, index) => ({
    x: padding + (index / (data.length - 1)) * chartWidth,
    y: padding + 30 + ((maxValue - item.value) / range) * chartHeight,
    value: item.value,
    label: item.label || item.date,
  }));

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  // Generate fill path
  const fillPathData = type === 'area' 
    ? `${pathData} L ${padding + chartWidth} ${padding + 30 + chartHeight} L ${padding} ${padding + 30 + chartHeight} Z`
    : '';

  // Generate grid lines
  const gridLines = showGrid ? Array.from({ length: 5 }, (_, i) => {
    const y = padding + 30 + (i / 4) * chartHeight;
    const value = maxValue - (i / 4) * range;
    return { y, value };
  }) : [];

  const periods = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];

  return (
    <View style={[styles.chartContainer, { width, height }, style]}>
      {/* Header */}
      <View style={styles.chartHeader}>
        <View style={styles.titleContainer}>
          {title && <Text style={styles.chartTitle}>{title}</Text>}
          {subtitle && <Text style={styles.chartSubtitle}>{subtitle}</Text>}
        </View>
        
        {/* Period selector */}
        {onPeriodChange && (
          <View style={styles.periodSelector}>
            {periods.map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.periodButton,
                  period === p && styles.activePeriodButton,
                ]}
                onPress={() => onPeriodChange(p)}
              >
                <Text style={[
                  styles.periodButtonText,
                  period === p && styles.activePeriodButtonText,
                ]}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Chart */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.chartTouchable}
      >
        <Svg width={width} height={height - 60} style={styles.chartSvg}>
          <Defs>
            <LinearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={fillColor} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={fillColor} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          
          {/* Grid lines */}
          {gridLines.map((line, index) => (
            <Line
              key={index}
              x1={padding}
              y1={line.y}
              x2={padding + chartWidth}
              y2={line.y}
              stroke={theme.colors.neutral[200]}
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Area fill */}
          {type === 'area' && (
            <Path
              d={fillPathData}
              fill="url(#chartGradient)"
            />
          )}
          
          {/* Line */}
          <Path
            d={pathData}
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {showPoints && points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="3"
              fill={color}
              stroke={theme.colors.background.primary}
              strokeWidth="2"
            />
          ))}
        </Svg>
      </TouchableOpacity>

      {/* Value labels */}
      {showLabels && (
        <View style={styles.valueLabels}>
          <Text style={styles.minValue}>
            {minValue.toFixed(2)}
          </Text>
          <Text style={styles.maxValue}>
            {maxValue.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
};

// ============================================================================
// CHART CONTAINER COMPONENT
// ============================================================================

export interface ChartContainerProps {
  /** Chart title */
  title: string;
  /** Chart subtitle */
  subtitle?: string;
  /** Chart component */
  children: React.ReactNode;
  /** Additional actions */
  actions?: React.ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string;
  /** Refresh callback */
  onRefresh?: () => void;
  /** Additional styling */
  style?: any;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  children,
  actions,
  loading = false,
  error,
  onRefresh,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.containerHeader}>
        <View style={styles.titleSection}>
          <Text style={styles.containerTitle}>{title}</Text>
          {subtitle && <Text style={styles.containerSubtitle}>{subtitle}</Text>}
        </View>
        
        <View style={styles.actionsSection}>
          {onRefresh && (
            <TouchableOpacity
              onPress={onRefresh}
              style={styles.refreshButton}
              disabled={loading}
            >
              <Ionicons 
                name="refresh" 
                size={20} 
                color={theme.colors.primary[500]} 
              />
            </TouchableOpacity>
          )}
          {actions}
        </View>
      </View>

      <View style={styles.chartContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="hourglass-outline" size={32} color={theme.colors.neutral[400]} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={32} color={theme.colors.error[500]} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          children
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Sparkline styles
  sparklineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparklineSvg: {
    flex: 1,
  },
  
  // Chart container styles
  container: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  containerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  titleSection: {
    flex: 1,
  },
  containerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  containerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  
  // Chart styles
  chartContainer: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  chartTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  chartSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xs,
  },
  periodButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  activePeriodButton: {
    backgroundColor: theme.colors.primary[500],
  },
  periodButtonText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  activePeriodButtonText: {
    color: theme.colors.text.inverse,
  },
  chartTouchable: {
    flex: 1,
  },
  chartSvg: {
    flex: 1,
  },
  chartContent: {
    flex: 1,
  },
  
  // Value labels
  valueLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  minValue: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  maxValue: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  
  // State styles
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error[500],
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});

export { SparklineChart, PerformanceChart, ChartContainer };
