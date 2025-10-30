/**
 * Formula Generator Utilities
 * 
 * Utility functions for generating pseudocode, natural language explanations,
 * and logic trees from formula canvas data.
 */

import { FormulaCanvas, LogicNode, Block } from './types';

/**
 * Generate pseudocode from formula canvas
 */
export const generatePseudocode = (formula: FormulaCanvas): string => {
  const lines: string[] = [];
  
  lines.push(`// Trading Strategy: ${formula.name}`);
  lines.push(`// Generated on ${new Date().toLocaleDateString()}`);
  lines.push('');
  
  // Find starting blocks (blocks with no input connections)
  const startingBlocks = formula.blocks.filter(block => 
    !formula.connections.some(conn => conn.targetBlockId === block.id)
  );
  
  // Generate pseudocode for each starting block
  startingBlocks.forEach(block => {
    generateBlockPseudocode(block, formula, lines, 0);
  });
  
  return lines.join('\n');
};

/**
 * Generate pseudocode for a specific block
 */
const generateBlockPseudocode = (
  block: Block, 
  formula: FormulaCanvas, 
  lines: string[], 
  indent: number
): void => {
  const indentStr = '  '.repeat(indent);
  
  switch (block.type) {
    case 'indicator':
      lines.push(`${indentStr}// Calculate ${block.metadata.label}`);
      lines.push(`${indentStr}${block.indicatorType} = calculate_${block.indicatorType}(${block.symbol}, ${block.timeframe})`);
      
      // Add parameter assignments
      Object.entries(block.parameters).forEach(([key, value]) => {
        lines.push(`${indentStr}${block.indicatorType}.${key} = ${value}`);
      });
      break;
      
    case 'condition':
      lines.push(`${indentStr}// Check condition: ${block.metadata.label}`);
      
      // Get input connections
      const inputConnections = formula.connections.filter(conn => conn.targetBlockId === block.id);
      const inputs = inputConnections.map(conn => {
        const sourceBlock = formula.blocks.find(b => b.id === conn.sourceBlockId);
        return sourceBlock ? getBlockOutputName(sourceBlock) : 'unknown';
      });
      
      if (inputs.length >= 2) {
        lines.push(`${indentStr}if (${inputs[0]} ${block.operator} ${inputs[1]}) {`);
        
        // Find output connections
        const outputConnections = formula.connections.filter(conn => conn.sourceBlockId === block.id);
        outputConnections.forEach(conn => {
          const targetBlock = formula.blocks.find(b => b.id === conn.targetBlockId);
          if (targetBlock) {
            generateBlockPseudocode(targetBlock, formula, lines, indent + 1);
          }
        });
        
        lines.push(`${indentStr}}`);
      }
      break;
      
    case 'action':
      lines.push(`${indentStr}// Execute action: ${block.metadata.label}`);
      
      switch (block.actionType) {
        case 'buy':
          lines.push(`${indentStr}place_buy_order(symbol=${block.parameters.symbol || 'current'}, quantity=${block.parameters.quantity || 100})`);
          break;
        case 'sell':
          lines.push(`${indentStr}place_sell_order(symbol=${block.parameters.symbol || 'current'}, quantity=${block.parameters.quantity || 100})`);
          break;
        case 'alert':
          lines.push(`${indentStr}send_alert(message="${block.parameters.message || 'Alert triggered'}")`);
          break;
        case 'set_stop_loss':
          lines.push(`${indentStr}set_stop_loss(price=${block.parameters.stop_price || 'calculated'})`);
          break;
        case 'set_take_profit':
          lines.push(`${indentStr}set_take_profit(price=${block.parameters.take_profit || 'calculated'})`);
          break;
      }
      break;
      
    case 'group':
      lines.push(`${indentStr}// Group: ${block.metadata.label}`);
      
      // Find child blocks
      const childBlocks = formula.blocks.filter(childBlock => 
        block.children.includes(childBlock.id)
      );
      
      childBlocks.forEach(childBlock => {
        generateBlockPseudocode(childBlock, formula, lines, indent);
      });
      break;
  }
};

/**
 * Generate natural language explanation
 */
export const generateNaturalLanguage = (formula: FormulaCanvas): string => {
  const explanation: string[] = [];
  
  explanation.push(`This trading strategy "${formula.name}" works as follows:`);
  explanation.push('');
  
  // Find action blocks
  const actionBlocks = formula.blocks.filter(block => block.type === 'action');
  
  if (actionBlocks.length === 0) {
    explanation.push('This strategy has no defined actions.');
    return explanation.join('\n');
  }
  
  // Generate explanation for each action
  actionBlocks.forEach((actionBlock, index) => {
    const conditionPath = findConditionPath(actionBlock, formula);
    
    explanation.push(`${index + 1}. ${generateActionExplanation(actionBlock, conditionPath)}`);
  });
  
  // Add risk management info
  const hasStopLoss = actionBlocks.some(block => block.actionType === 'set_stop_loss');
  const hasTakeProfit = actionBlocks.some(block => block.actionType === 'set_take_profit');
  
  if (hasStopLoss || hasTakeProfit) {
    explanation.push('');
    explanation.push('Risk Management:');
    if (hasStopLoss) explanation.push('- Stop loss orders are placed to limit downside risk');
    if (hasTakeProfit) explanation.push('- Take profit orders are placed to secure gains');
  }
  
  return explanation.join('\n');
};

/**
 * Find the condition path leading to an action
 */
const findConditionPath = (actionBlock: Block, formula: FormulaCanvas): Block[] => {
  const path: Block[] = [];
  const visited = new Set<string>();
  
  const findPathRecursive = (block: Block): void => {
    if (visited.has(block.id)) return;
    visited.add(block.id);
    
    // Find blocks that connect to this block
    const inputConnections = formula.connections.filter(conn => conn.targetBlockId === block.id);
    
    inputConnections.forEach(conn => {
      const sourceBlock = formula.blocks.find(b => b.id === conn.sourceBlockId);
      if (sourceBlock) {
        findPathRecursive(sourceBlock);
        path.push(sourceBlock);
      }
    });
  };
  
  findPathRecursive(actionBlock);
  return path.reverse(); // Reverse to get correct order
};

/**
 * Generate explanation for an action and its conditions
 */
const generateActionExplanation = (actionBlock: Block, conditionPath: Block[]): string => {
  let explanation = '';
  
  // Build condition description
  if (conditionPath.length > 0) {
    const conditionDescriptions = conditionPath.map(block => {
      switch (block.type) {
        case 'indicator':
          return `${block.metadata.label} (${block.indicatorType})`;
        case 'condition':
          return `${block.metadata.label}`;
        default:
          return block.metadata.label;
      }
    });
    
    explanation += `When ${conditionDescriptions.join(' and ')}`;
  } else {
    explanation += 'When triggered';
  }
  
  // Add action description
  switch (actionBlock.actionType) {
    case 'buy':
      explanation += `, the strategy will buy ${actionBlock.parameters.quantity || 100} shares`;
      break;
    case 'sell':
      explanation += `, the strategy will sell ${actionBlock.parameters.quantity || 100} shares`;
      break;
    case 'alert':
      explanation += `, the strategy will send an alert: "${actionBlock.parameters.message || 'Alert triggered'}"`;
      break;
    case 'set_stop_loss':
      explanation += `, the strategy will set a stop loss at ${actionBlock.parameters.stop_price || 'calculated price'}`;
      break;
    case 'set_take_profit':
      explanation += `, the strategy will set a take profit at ${actionBlock.parameters.take_profit || 'calculated price'}`;
      break;
    default:
      explanation += `, the strategy will execute ${actionBlock.metadata.label}`;
  }
  
  return explanation + '.';
};

/**
 * Build logic tree from formula canvas
 */
export const buildLogicTree = (formula: FormulaCanvas): LogicNode => {
  // Find root blocks (blocks with no input connections)
  const rootBlocks = formula.blocks.filter(block => 
    !formula.connections.some(conn => conn.targetBlockId === block.id)
  );
  
  if (rootBlocks.length === 0) {
    return {
      id: 'empty',
      type: 'empty',
      label: 'Empty Strategy',
      children: [],
    };
  }
  
  // If multiple root blocks, create a group
  if (rootBlocks.length > 1) {
    return {
      id: 'root',
      type: 'group',
      label: 'Strategy Root',
      children: rootBlocks.map(block => buildBlockTree(block, formula)),
    };
  }
  
  // Single root block
  return buildBlockTree(rootBlocks[0], formula);
};

/**
 * Build tree for a specific block
 */
const buildBlockTree = (block: Block, formula: FormulaCanvas): LogicNode => {
  const node: LogicNode = {
    id: block.id,
    type: block.type,
    label: block.metadata.label,
    children: [],
    parameters: {},
  };
  
  // Add parameters
  switch (block.type) {
    case 'indicator':
      node.parameters = {
        symbol: block.symbol,
        timeframe: block.timeframe,
        ...block.parameters,
      };
      break;
    case 'condition':
      node.parameters = {
        operator: block.operator,
        ...block.parameters,
      };
      break;
    case 'action':
      node.parameters = {
        actionType: block.actionType,
        ...block.parameters,
      };
      break;
  }
  
  // Find child blocks (blocks connected to this block's outputs)
  const outputConnections = formula.connections.filter(conn => conn.sourceBlockId === block.id);
  
  outputConnections.forEach(conn => {
    const childBlock = formula.blocks.find(b => b.id === conn.targetBlockId);
    if (childBlock) {
      node.children.push(buildBlockTree(childBlock, formula));
    }
  });
  
  return node;
};

/**
 * Get output name for a block
 */
const getBlockOutputName = (block: Block): string => {
  switch (block.type) {
    case 'indicator':
      return `${block.indicatorType}_${block.symbol}`;
    case 'condition':
      return `${block.metadata.label.toLowerCase().replace(/\s+/g, '_')}_result`;
    case 'action':
      return `${block.actionType}_executed`;
    default:
      return `${block.metadata.label.toLowerCase().replace(/\s+/g, '_')}`;
  }
};

/**
 * Validate formula logic
 */
export const validateFormulaLogic = (formula: FormulaCanvas): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check for action blocks
  const actionBlocks = formula.blocks.filter(block => block.type === 'action');
  if (actionBlocks.length === 0) {
    errors.push('Strategy must have at least one action block');
  }
  
  // Check for orphaned blocks
  const connectedBlocks = new Set<string>();
  formula.connections.forEach(conn => {
    connectedBlocks.add(conn.sourceBlockId);
    connectedBlocks.add(conn.targetBlockId);
  });
  
  const orphanedBlocks = formula.blocks.filter(block => !connectedBlocks.has(block.id));
  if (orphanedBlocks.length > 0) {
    errors.push(`Found ${orphanedBlocks.length} orphaned blocks that are not connected`);
  }
  
  // Check for circular dependencies
  const hasCircularDependency = checkCircularDependency(formula);
  if (hasCircularDependency) {
    errors.push('Strategy contains circular dependencies');
  }
  
  // Check for required connections
  actionBlocks.forEach(actionBlock => {
    const hasInputConnection = formula.connections.some(conn => conn.targetBlockId === actionBlock.id);
    if (!hasInputConnection) {
      errors.push(`Action block "${actionBlock.metadata.label}" has no input connections`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Check for circular dependencies
 */
const checkCircularDependency = (formula: FormulaCanvas): boolean => {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  
  const hasCycle = (blockId: string): boolean => {
    visited.add(blockId);
    recursionStack.add(blockId);
    
    const outputConnections = formula.connections.filter(conn => conn.sourceBlockId === blockId);
    
    for (const conn of outputConnections) {
      if (!visited.has(conn.targetBlockId)) {
        if (hasCycle(conn.targetBlockId)) return true;
      } else if (recursionStack.has(conn.targetBlockId)) {
        return true;
      }
    }
    
    recursionStack.delete(blockId);
    return false;
  };
  
  for (const block of formula.blocks) {
    if (!visited.has(block.id)) {
      if (hasCycle(block.id)) return true;
    }
  }
  
  return false;
};
