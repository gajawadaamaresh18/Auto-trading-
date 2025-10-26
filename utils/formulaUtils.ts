import { BlockData } from '../types/Block';

export interface FormulaExport {
  version: string;
  name: string;
  description: string;
  blocks: BlockData[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    author?: string;
  };
}

export class FormulaSerializer {
  static serialize(blocks: BlockData[], name = 'Untitled Formula', description = ''): FormulaExport {
    return {
      version: '1.0.0',
      name,
      description,
      blocks: this.deepCloneBlocks(blocks),
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }

  static deserialize(exportData: FormulaExport): BlockData[] {
    return this.deepCloneBlocks(exportData.blocks);
  }

  static toJSON(blocks: BlockData[], pretty = true): string {
    const exportData = this.serialize(blocks);
    return pretty ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData);
  }

  static fromJSON(json: string): BlockData[] {
    try {
      const exportData = JSON.parse(json) as FormulaExport;
      return this.deserialize(exportData);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  private static deepCloneBlocks(blocks: BlockData[]): BlockData[] {
    return blocks.map(block => ({
      ...block,
      children: block.children ? this.deepCloneBlocks(block.children) : undefined,
    }));
  }
}

export class FormulaPreviewGenerator {
  static generatePlainEnglish(blocks: BlockData[]): string {
    if (blocks.length === 0) {
      return 'No strategy defined. Add blocks to build your formula.';
    }

    const descriptions = blocks.map(block => this.generateBlockDescription(block, 0));
    return descriptions.join('\n\n');
  }

  private static generateBlockDescription(block: BlockData, depth: number): string {
    const indent = '  '.repeat(depth);
    let description = `${indent}${block.name}`;

    // Add parameters description
    if (block.parameters && Object.keys(block.parameters).length > 0) {
      const paramDescriptions = this.formatParameters(block.parameters);
      if (paramDescriptions) {
        description += ` with ${paramDescriptions}`;
      }
    }

    // Add children description
    if (block.children && block.children.length > 0) {
      const childDescriptions = block.children
        .map(child => this.generateBlockDescription(child, depth + 1))
        .join('\n');
      description += ':\n' + childDescriptions;
    }

    return description;
  }

  private static formatParameters(parameters: Record<string, any>): string {
    const paramPairs = Object.entries(parameters)
      .filter(([key, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        if (typeof value === 'object') {
          return `${key}: ${JSON.stringify(value)}`;
        }
        return `${key}: ${value}`;
      });

    if (paramPairs.length === 0) return '';

    if (paramPairs.length === 1) {
      return paramPairs[0];
    }

    if (paramPairs.length === 2) {
      return paramPairs.join(' and ');
    }

    return paramPairs.slice(0, -1).join(', ') + ', and ' + paramPairs[paramPairs.length - 1];
  }

  static generateCode(blocks: BlockData[], language: 'javascript' | 'python' | 'pseudocode' = 'pseudocode'): string {
    switch (language) {
      case 'javascript':
        return this.generateJavaScript(blocks);
      case 'python':
        return this.generatePython(blocks);
      case 'pseudocode':
      default:
        return this.generatePseudocode(blocks);
    }
  }

  private static generatePseudocode(blocks: BlockData[]): string {
    const generateBlockCode = (block: BlockData, depth: number): string => {
      const indent = '  '.repeat(depth);
      let code = `${indent}${block.type.toUpperCase()}: ${block.name}`;

      if (block.parameters && Object.keys(block.parameters).length > 0) {
        const params = Object.entries(block.parameters)
          .map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
          .join(', ');
        code += `(${params})`;
      }

      if (block.children && block.children.length > 0) {
        code += ' {\n';
        code += block.children
          .map(child => generateBlockCode(child, depth + 1))
          .join('\n');
        code += `\n${indent}}`;
      }

      return code;
    };

    return blocks.map(block => generateBlockCode(block, 0)).join('\n\n');
  }

  private static generateJavaScript(blocks: BlockData[]): string {
    const generateBlockCode = (block: BlockData, depth: number): string => {
      const indent = '  '.repeat(depth);
      const functionName = block.name.toLowerCase().replace(/\s+/g, '_');
      let code = `${indent}function ${functionName}() {`;

      if (block.parameters && Object.keys(block.parameters).length > 0) {
        const params = Object.entries(block.parameters)
          .map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
          .join(', ');
        code += `\n${indent}  const { ${params} } = arguments[0] || {};`;
      }

      if (block.children && block.children.length > 0) {
        code += '\n';
        code += block.children
          .map(child => generateBlockCode(child, depth + 1))
          .join('\n');
      }

      code += `\n${indent}}`;
      return code;
    };

    return `// Generated Formula Code\n` +
           `// ${new Date().toISOString()}\n\n` +
           blocks.map(block => generateBlockCode(block, 0)).join('\n\n');
  }

  private static generatePython(blocks: BlockData[]): string {
    const generateBlockCode = (block: BlockData, depth: number): string => {
      const indent = '  '.repeat(depth);
      const functionName = block.name.toLowerCase().replace(/\s+/g, '_');
      let code = `${indent}def ${functionName}(**kwargs):`;

      if (block.parameters && Object.keys(block.parameters).length > 0) {
        const params = Object.entries(block.parameters)
          .map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
          .join(', ');
        code += `\n${indent}    ${params}`;
      }

      if (block.children && block.children.length > 0) {
        code += '\n';
        code += block.children
          .map(child => generateBlockCode(child, depth + 1))
          .join('\n');
      }

      return code;
    };

    return `# Generated Formula Code\n` +
           `# ${new Date().toISOString()}\n\n` +
           blocks.map(block => generateBlockCode(block, 0)).join('\n\n');
  }

  static generateSummary(blocks: BlockData[]): {
    totalBlocks: number;
    blockTypes: Record<string, number>;
    maxDepth: number;
    hasConditions: boolean;
    hasActions: boolean;
    hasIndicators: boolean;
  } {
    const blockTypes: Record<string, number> = {};
    let maxDepth = 0;

    const analyzeBlocks = (blocks: BlockData[], depth = 0) => {
      maxDepth = Math.max(maxDepth, depth);
      
      blocks.forEach(block => {
        blockTypes[block.type] = (blockTypes[block.type] || 0) + 1;
        
        if (block.children && block.children.length > 0) {
          analyzeBlocks(block.children, depth + 1);
        }
      });
    };

    analyzeBlocks(blocks);

    return {
      totalBlocks: Object.values(blockTypes).reduce((sum, count) => sum + count, 0),
      blockTypes,
      maxDepth,
      hasConditions: blockTypes.condition > 0,
      hasActions: blockTypes.action > 0,
      hasIndicators: blockTypes.indicator > 0,
    };
  }
}

export class FormulaValidator {
  static validate(blocks: BlockData[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const validateBlock = (block: BlockData, path: string = '') => {
      const currentPath = path ? `${path}.${block.name}` : block.name;

      // Check required fields
      if (!block.id) {
        errors.push(`${currentPath}: Missing block ID`);
      }
      if (!block.type) {
        errors.push(`${currentPath}: Missing block type`);
      }
      if (!block.name) {
        errors.push(`${currentPath}: Missing block name`);
      }

      // Check for circular references
      if (block.children) {
        block.children.forEach(child => {
          if (child.id === block.id) {
            errors.push(`${currentPath}: Circular reference detected`);
          }
          validateBlock(child, currentPath);
        });
      }
    };

    blocks.forEach(block => validateBlock(block));

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}