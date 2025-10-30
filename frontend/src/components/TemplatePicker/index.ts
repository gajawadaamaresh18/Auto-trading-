/**
 * Template Picker Index File
 * 
 * Central export file for template picker components and utilities.
 */

// Main Components
export { default as TemplatePicker } from './TemplatePicker';

// Types and Interfaces
export type {
  TemplatePickerProps,
} from './TemplatePicker';

// Template Data
export {
  TEMPLATE_FORMULAS,
  TEMPLATE_CATEGORIES,
  DIFFICULTY_LEVELS,
  ASSET_CLASSES,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByDifficulty,
  getTemplatesByAssetClass,
  getPopularTemplates,
  getVerifiedTemplates,
  searchTemplates,
} from '../data/templateFormulas.json';

export type {
  TemplateFormula,
} from '../data/templateFormulas.json';

// Utility Functions
export const TEMPLATE_PICKER_CONSTANTS = {
  CARD_WIDTH: 0.85, // Percentage of screen width
  CARD_SPACING: 16,
  MAX_TAGS_DISPLAY: 3,
  ANIMATION_DURATION: 300,
  FILTER_ANIMATION_DURATION: 200,
} as const;

export const TEMPLATE_ACTIONS = {
  TRY_PAPER_MODE: 'try_paper_mode',
  EDIT_IN_STUDIO: 'edit_in_studio',
  VIEW_DETAILS: 'view_details',
  CLONE_TEMPLATE: 'clone_template',
} as const;

// Template Filter Utilities
export const getFilteredTemplates = (
  templates: TemplateFormula[],
  category: string,
  difficulty: string,
  searchQuery?: string
): TemplateFormula[] => {
  return templates.filter(template => {
    const categoryMatch = category === 'all' || template.category === category;
    const difficultyMatch = difficulty === 'all' || template.difficulty === difficulty;
    const searchMatch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return categoryMatch && difficultyMatch && searchMatch;
  });
};

export const getTemplateStats = (template: TemplateFormula) => {
  const { sampleStats } = template;
  
  return {
    winRate: sampleStats.winRate,
    profitFactor: sampleStats.profitFactor,
    maxDrawdown: sampleStats.maxDrawdown,
    sharpeRatio: sampleStats.sharpeRatio,
    totalTrades: sampleStats.totalTrades,
    avgHoldingPeriod: sampleStats.avgHoldingPeriod,
    bestMonth: sampleStats.bestMonth,
    worstMonth: sampleStats.worstMonth,
  };
};

export const getTemplateRiskProfile = (template: TemplateFormula) => {
  const { riskParams } = template;
  
  return {
    stopLoss: riskParams.stopLoss,
    takeProfit: riskParams.takeProfit,
    positionSize: riskParams.positionSize,
    maxRiskPerTrade: riskParams.maxRiskPerTrade,
  };
};

export const getTemplateMarketConditions = (template: TemplateFormula) => {
  const { marketConditions } = template;
  
  return {
    trending: marketConditions.trending,
    sideways: marketConditions.sideways,
    volatile: marketConditions.volatile,
    lowVolatility: marketConditions.lowVolatility,
  };
};

// Template Validation
export const validateTemplate = (template: TemplateFormula): boolean => {
  return !!(
    template.id &&
    template.name &&
    template.description &&
    template.category &&
    template.assetClass &&
    template.difficulty &&
    template.indicators &&
    template.logicBlocks &&
    template.sampleStats &&
    template.riskParams &&
    template.marketConditions &&
    template.tags &&
    template.tags.length > 0
  );
};

// Template Comparison
export const compareTemplates = (a: TemplateFormula, b: TemplateFormula, sortBy: string) => {
  switch (sortBy) {
    case 'winRate':
      return b.sampleStats.winRate - a.sampleStats.winRate;
    case 'profitFactor':
      return b.sampleStats.profitFactor - a.sampleStats.profitFactor;
    case 'sharpeRatio':
      return b.sampleStats.sharpeRatio - a.sampleStats.sharpeRatio;
    case 'maxDrawdown':
      return a.sampleStats.maxDrawdown - b.sampleStats.maxDrawdown;
    case 'totalTrades':
      return b.sampleStats.totalTrades - a.sampleStats.totalTrades;
    case 'name':
      return a.name.localeCompare(b.name);
    case 'popularity':
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    case 'verified':
      return (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0);
    default:
      return 0;
  }
};

// Template Recommendations
export const getRecommendedTemplates = (
  userPreferences: {
    experience: 'beginner' | 'intermediate' | 'advanced';
    riskTolerance: 'low' | 'medium' | 'high';
    preferredAssetClass: string;
    preferredCategory: string;
  }
): TemplateFormula[] => {
  return TEMPLATE_FORMULAS.filter(template => {
    const experienceMatch = template.difficulty === userPreferences.experience;
    const assetClassMatch = userPreferences.preferredAssetClass === 'all' || 
      template.assetClass === userPreferences.preferredAssetClass;
    const categoryMatch = userPreferences.preferredCategory === 'all' || 
      template.category === userPreferences.preferredCategory;
    
    // Risk tolerance matching
    const riskMatch = (
      (userPreferences.riskTolerance === 'low' && template.sampleStats.maxDrawdown < -8) ||
      (userPreferences.riskTolerance === 'medium' && template.sampleStats.maxDrawdown >= -8 && template.sampleStats.maxDrawdown < -12) ||
      (userPreferences.riskTolerance === 'high' && template.sampleStats.maxDrawdown >= -12)
    );
    
    return experienceMatch && assetClassMatch && categoryMatch && riskMatch;
  });
};

// Template Analytics
export const getTemplateAnalytics = (templates: TemplateFormula[]) => {
  const totalTemplates = templates.length;
  const categories = templates.reduce((acc, template) => {
    acc[template.category] = (acc[template.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const difficulties = templates.reduce((acc, template) => {
    acc[template.difficulty] = (acc[template.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const assetClasses = templates.reduce((acc, template) => {
    acc[template.assetClass] = (acc[template.assetClass] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const avgWinRate = templates.reduce((sum, template) => sum + template.sampleStats.winRate, 0) / totalTemplates;
  const avgProfitFactor = templates.reduce((sum, template) => sum + template.sampleStats.profitFactor, 0) / totalTemplates;
  const avgMaxDrawdown = templates.reduce((sum, template) => sum + template.sampleStats.maxDrawdown, 0) / totalTemplates;
  
  return {
    totalTemplates,
    categories,
    difficulties,
    assetClasses,
    avgWinRate,
    avgProfitFactor,
    avgMaxDrawdown,
  };
};

export default TemplatePicker;
