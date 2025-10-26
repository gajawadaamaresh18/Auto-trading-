import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { BlockConnection, Block as BlockType } from '../../types';

interface ConnectionCanvasProps {
  connections: BlockConnection[];
  blocks: BlockType[];
}

export const ConnectionCanvas: React.FC<ConnectionCanvasProps> = ({
  connections,
  blocks,
}) => {
  const getBlockPosition = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    return block ? block.position : { x: 0, y: 0 };
  };

  const getPortPosition = (blockId: string, portId: string, isInput: boolean) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return { x: 0, y: 0 };

    const blockPos = block.position;
    const portIndex = isInput 
      ? block.ports.filter(p => p.type === 'input').findIndex(p => p.id === portId)
      : block.ports.filter(p => p.type === 'output').findIndex(p => p.id === portId);
    
    const portY = blockPos.y + 40 + (portIndex * 20); // Approximate port positions
    const portX = isInput ? blockPos.x : blockPos.x + block.size.width;

    return { x: portX, y: portY };
  };

  const renderConnection = (connection: BlockConnection, index: number) => {
    const fromPos = getPortPosition(connection.fromBlockId, connection.fromPort, false);
    const toPos = getPortPosition(connection.toBlockId, connection.toPort, true);

    const midX = (fromPos.x + toPos.x) / 2;
    const controlPoint1X = fromPos.x + (midX - fromPos.x) * 0.5;
    const controlPoint2X = toPos.x - (toPos.x - midX) * 0.5;

    return (
      <View key={`connection-${index}`} style={styles.connectionContainer}>
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
          {/* Connection line */}
          <Line
            x1={fromPos.x}
            y1={fromPos.y}
            x2={toPos.x}
            y2={toPos.y}
            stroke="#007AFF"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          
          {/* Start point */}
          <Circle
            cx={fromPos.x}
            cy={fromPos.y}
            r="4"
            fill="#007AFF"
          />
          
          {/* End point */}
          <Circle
            cx={toPos.x}
            cy={toPos.y}
            r="4"
            fill="#34C759"
          />
        </Svg>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {connections.map((connection, index) => renderConnection(connection, index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  connectionContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});