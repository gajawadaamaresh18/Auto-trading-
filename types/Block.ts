export interface BlockData {
  id: string;
  type: 'indicator' | 'condition' | 'action' | 'parameter';
  name: string;
  parameters: Record<string, any>;
  children?: BlockData[];
  parentId?: string;
}

export interface BlockPosition {
  x: number;
  y: number;
}

export interface BlockProps {
  data: BlockData;
  position: BlockPosition;
  isSelected?: boolean;
  isDragging?: boolean;
  onPress?: (blockId: string) => void;
  onLongPress?: (blockId: string) => void;
  onDragStart?: (blockId: string) => void;
  onDragEnd?: (blockId: string, position: BlockPosition) => void;
  onDrop?: (blockId: string, targetId: string) => void;
  style?: any;
}

export interface BlockGroupProps {
  data: BlockData;
  children: BlockData[];
  position: BlockPosition;
  isSelected?: boolean;
  onBlockPress?: (blockId: string) => void;
  onBlockLongPress?: (blockId: string) => void;
  onBlockDragStart?: (blockId: string) => void;
  onBlockDragEnd?: (blockId: string, position: BlockPosition) => void;
  onBlockDrop?: (blockId: string, targetId: string) => void;
  onAddBlock?: (parentId: string, blockType: string) => void;
  onRemoveBlock?: (blockId: string) => void;
  style?: any;
}