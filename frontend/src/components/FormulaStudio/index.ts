/**
 * FormulaStudio Index File
 * 
 * Central export file for all FormulaStudio components and utilities.
 * Provides a clean API for importing the visual strategy builder.
 */

// Core Components
export { default as BlockEditor } from './BlockEditor';
export { default as IndicatorBlock } from './IndicatorBlock';
export { default as ConditionBlock } from './ConditionBlock';
export { default as ActionBlock } from './ActionBlock';
export { default as ParameterInput } from './ParameterInput';
export { default as FormulaPreview } from './FormulaPreview';

// Types and Interfaces
export type {
  FormulaCanvas,
  Block,
  IndicatorBlock as IndicatorBlockType,
  ConditionBlock as ConditionBlockType,
  ActionBlock as ActionBlockType,
  GroupBlock,
  ParameterBlock,
  BlockConnection,
  BlockPosition,
  BlockPort,
  FormulaPreview as FormulaPreviewType,
  LogicNode,
} from './types';

// Constants and Enums
export {
  BlockTypes,
  IndicatorTypes,
  ConditionTypes,
  ActionTypes,
  GroupTypes,
  FormulaSchema,
  createBlockId,
  createConnectionId,
  validateFormula,
  serializeFormula,
  deserializeFormula,
} from './types';

// Registry and Metadata
export {
  INDICATOR_REGISTRY,
  CONDITION_REGISTRY,
  ACTION_REGISTRY,
  GROUP_REGISTRY,
  getAllIndicators,
  getAllConditions,
  getAllActions,
  getAllGroups,
  getIndicatorsByCategory,
  getConditionsByCategory,
  getActionsByCategory,
  getIndicatorMetadata,
  getConditionMetadata,
  getActionMetadata,
  getGroupMetadata,
} from './data/blocks/indicatorList';

// Utility Functions
export {
  generatePseudocode,
  generateNaturalLanguage,
  buildLogicTree,
  validateFormulaLogic,
} from './utils/formulaGenerator';

// Type Definitions for External Use
export type {
  IndicatorMetadata,
  ConditionMetadata,
  ActionMetadata,
  GroupMetadata,
  ParameterDefinition,
  OutputDefinition,
  InputDefinition,
} from './data/blocks/indicatorList';
