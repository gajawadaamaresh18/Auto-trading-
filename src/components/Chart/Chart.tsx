import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Svg, { Path, Line, Circle, G } from 'react-native-svg';
import { theme } from '@theme/theme';
import { ChartData } from '@types/index';

interface ChartProps {
  /**
   * Chart data to display
   */
  data: ChartData;
  
  /**
   * Chart height
   * @default 200
   */
  height?: number;
  
  /**
   * Chart width
   * @default screen width - 32
   */
  width?: number;
  
  /**
   * Chart variant
   * @default 'line'
   */
  variant?: 'line' | 'sparkline' | 'area';
  
  /**
   * Whether to show grid lines
   * @default true
   */
  showGrid?: boolean;
  
  /**
   * Whether to show labels
   * @default true
   */
  showLabels?: boolean;
  
  /**
   * Whether to show data points
   * @default false
   */
  showPoints?: boolean;
  
  /**
   * Custom styles for the chart container
   */
  style?: any;
  
  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

/**
 * Chart component for displaying line charts, sparklines, and area charts
 * 
 * @example
 * ```tsx
 * <Chart
 *   data={{
 *     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
 *     datasets: [{
 *       data: [10, 20, 15, 30, 25],
 *       color: '#10B981',
 *       strokeWidth: 2
 *     }]
 *   }}
 *   height={200}
 *   variant="line"
 *   showGrid
 *   showLabels
 * />
 * ```
 */
export const Chart: React.FC<ChartProps> = ({
  data,
  height = 200,
  width,
  variant = 'line',
  showGrid = true,
  showLabels = true,
  showPoints = false,
  style,
  testID,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = width || screenWidth - 32;
  const chartHeight = height;
  
  const padding = 20;
  const chartAreaWidth = chartWidth - (padding * 2);
  const chartAreaHeight = chartHeight - (padding * 2);
  
  // Calculate data bounds
  const allValues = data.datasets.flatMap(dataset => dataset.data);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const valueRange = maxValue - minValue;
  
  // Add some padding to the value range
  const paddedMinValue = minValue - (valueRange * 0.1);
  const paddedMaxValue = maxValue + (valueRange * 0.1);
  const paddedValueRange = paddedMaxValue - paddedMinValue;
  
  // Convert data points to SVG coordinates
  const convertToSVGPoint = (value: number, index: number) => {
    const x = padding + (index / (data.labels.length - 1)) * chartAreaWidth;
    const y = padding + chartAreaHeight - ((value - paddedMinValue) / paddedValueRange) * chartAreaHeight;
    return { x, y };
  };
  
  // Generate path data for line chart
  const generatePathData = (dataset: { data: number[]; color?: string; strokeWidth?: number }) => {
    if (dataset.data.length === 0) return '';
    
    const points = dataset.data.map((value, index) => convertToSVGPoint(value, index));
    const firstPoint = points[0];
    
    let pathData = `M ${firstPoint.x} ${firstPoint.y}`;
    
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      pathData += ` L ${point.x} ${point.y}`;
    }
    
    return pathData;
  };
  
  // Generate area path data
  const generateAreaPathData = (dataset: { data: number[]; color?: string; strokeWidth?: number }) => {
    if (dataset.data.length === 0) return '';
    
    const points = dataset.data.map((value, index) => convertToSVGPoint(value, index));
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    
    let pathData = `M ${firstPoint.x} ${chartHeight - padding}`;
    pathData += ` L ${firstPoint.x} ${firstPoint.y}`;
    
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      pathData += ` L ${point.x} ${point.y}`;
    }
    
    pathData += ` L ${lastPoint.x} ${chartHeight - padding}`;
    pathData += ` Z`;
    
    return pathData;
  };
  
  // Generate grid lines
  const generateGridLines = () => {
    const lines = [];
    const gridLines = 5;
    
    // Horizontal grid lines
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (i / gridLines) * chartAreaHeight;
      const value = paddedMaxValue - (i / gridLines) * paddedValueRange;
      
      lines.push(
        <Line
          key={`h-${i}`}
          x1={padding}
          y1={y}
          x2={chartWidth - padding}
          y2={y}
          stroke={theme.colors.border}
          strokeWidth={0.5}
          strokeDasharray="2,2"
        />
      );
    }
    
    // Vertical grid lines
    for (let i = 0; i <= data.labels.length; i++) {
      const x = padding + (i / data.labels.length) * chartAreaWidth;
      
      lines.push(
        <Line
          key={`v-${i}`}
          x1={x}
          y1={padding}
          x2={x}
          y2={chartHeight - padding}
          stroke={theme.colors.border}
          strokeWidth={0.5}
          strokeDasharray="2,2"
        />
      );
    }
    
    return lines;
  };
  
  // Generate data points
  const generateDataPoints = (dataset: { data: number[]; color?: string; strokeWidth?: number }) => {
    if (!showPoints) return null;
    
    return dataset.data.map((value, index) => {
      const point = convertToSVGPoint(value, index);
      return (
        <Circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={3}
          fill={dataset.color || theme.colors.primary}
        />
      );
    });
  };
  
  // Generate labels
  const generateLabels = () => {
    if (!showLabels) return null;
    
    return data.labels.map((label, index) => {
      const x = padding + (index / (data.labels.length - 1)) * chartAreaWidth;
      return (
        <Text
          key={index}
          x={x}
          y={chartHeight - 5}
          fontSize={theme.typography.fontSize.xs}
          fill={theme.colors.textSecondary}
          textAnchor="middle"
        >
          {label}
        </Text>
      );
    });
  };

  return (
    <View style={[styles.container, { height: chartHeight }, style]} testID={testID}>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Grid lines */}
        {showGrid && generateGridLines()}
        
        {/* Area fill for area charts */}
        {variant === 'area' && data.datasets.map((dataset, datasetIndex) => (
          <Path
            key={`area-${datasetIndex}`}
            d={generateAreaPathData(dataset)}
            fill={dataset.color || theme.colors.primary}
            fillOpacity={0.1}
          />
        ))}
        
        {/* Line paths */}
        {data.datasets.map((dataset, datasetIndex) => (
          <Path
            key={`line-${datasetIndex}`}
            d={generatePathData(dataset)}
            stroke={dataset.color || theme.colors.primary}
            strokeWidth={dataset.strokeWidth || 2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        
        {/* Data points */}
        {data.datasets.map((dataset, datasetIndex) => (
          <G key={`points-${datasetIndex}`}>
            {generateDataPoints(dataset)}
          </G>
        ))}
        
        {/* Labels */}
        {generateLabels()}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});