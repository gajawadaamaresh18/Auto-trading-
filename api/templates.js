const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// Load template formulas data
let templateFormulas = [];
const loadTemplates = async () => {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/templateFormulas.json'), 'utf8');
    templateFormulas = JSON.parse(data);
  } catch (error) {
    console.error('Error loading template formulas:', error);
    templateFormulas = [];
  }
};

// Initialize templates on startup
loadTemplates();

// GET /api/templates - Get all available templates
router.get('/', async (req, res) => {
  try {
    // Add unique IDs to templates if they don't exist
    const templatesWithIds = templateFormulas.map((template, index) => ({
      id: template.id || `template_${index}`,
      ...template
    }));
    
    res.json(templatesWithIds);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// GET /api/templates/:id - Get specific template by ID
router.get('/:id', async (req, res) => {
  try {
    const templateId = req.params.id;
    const template = templateFormulas.find(t => t.id === templateId || t.templateName === templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({
      id: template.id || templateId,
      ...template
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// POST /api/templates/clone - Clone a template for user
router.post('/clone', async (req, res) => {
  try {
    const { templateId, userId, customizations } = req.body;
    
    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }
    
    // Find the original template
    const originalTemplate = templateFormulas.find(t => 
      t.id === templateId || t.templateName === templateId
    );
    
    if (!originalTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Create cloned template with user-specific modifications
    const clonedTemplate = {
      id: `user_${userId || 'anonymous'}_${Date.now()}`,
      templateName: `${originalTemplate.templateName} (Clone)`,
      description: originalTemplate.description,
      serializedLogic: { ...originalTemplate.serializedLogic },
      winRate: originalTemplate.winRate,
      riskLevel: originalTemplate.riskLevel,
      assetType: originalTemplate.assetType,
      recommendedUniverse: [...originalTemplate.recommendedUniverse],
      isCloned: true,
      originalTemplateId: templateId,
      createdAt: new Date().toISOString(),
      userId: userId || 'anonymous',
      customizations: customizations || {}
    };
    
    // Apply any customizations if provided
    if (customizations) {
      if (customizations.templateName) {
        clonedTemplate.templateName = customizations.templateName;
      }
      if (customizations.description) {
        clonedTemplate.description = customizations.description;
      }
      if (customizations.riskLevel) {
        clonedTemplate.riskLevel = customizations.riskLevel;
      }
      if (customizations.assetType) {
        clonedTemplate.assetType = customizations.assetType;
      }
      if (customizations.serializedLogic) {
        clonedTemplate.serializedLogic = {
          ...clonedTemplate.serializedLogic,
          ...customizations.serializedLogic
        };
      }
    }
    
    // In a real application, you would save this to a database
    // For now, we'll just return the cloned template
    res.json(clonedTemplate);
  } catch (error) {
    console.error('Error cloning template:', error);
    res.status(500).json({ error: 'Failed to clone template' });
  }
});

// POST /api/templates/create-new-for-user - Create new template for user
router.post('/create-new-for-user', async (req, res) => {
  try {
    const { 
      templateName, 
      description, 
      serializedLogic, 
      riskLevel, 
      assetType, 
      recommendedUniverse,
      userId 
    } = req.body;
    
    // Validate required fields
    if (!templateName || !description || !serializedLogic) {
      return res.status(400).json({ 
        error: 'Template name, description, and serialized logic are required' 
      });
    }
    
    // Create new template
    const newTemplate = {
      id: `user_${userId || 'anonymous'}_custom_${Date.now()}`,
      templateName,
      description,
      serializedLogic,
      winRate: 0, // Will be calculated based on backtesting
      riskLevel: riskLevel || 'Medium',
      assetType: assetType || 'Stocks',
      recommendedUniverse: recommendedUniverse || [],
      isCustom: true,
      createdAt: new Date().toISOString(),
      userId: userId || 'anonymous',
      status: 'draft' // Will be 'active' after validation
    };
    
    // In a real application, you would save this to a database
    // and potentially validate the serialized logic
    res.json(newTemplate);
  } catch (error) {
    console.error('Error creating new template:', error);
    res.status(500).json({ error: 'Failed to create new template' });
  }
});

// PUT /api/templates/:id - Update existing template
router.put('/:id', async (req, res) => {
  try {
    const templateId = req.params.id;
    const updates = req.body;
    
    // In a real application, you would:
    // 1. Find the template in the database
    // 2. Verify user ownership
    // 3. Update the template
    // 4. Save changes
    
    res.json({ 
      message: 'Template updated successfully',
      templateId,
      updates 
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// DELETE /api/templates/:id - Delete template
router.delete('/:id', async (req, res) => {
  try {
    const templateId = req.params.id;
    
    // In a real application, you would:
    // 1. Find the template in the database
    // 2. Verify user ownership
    // 3. Delete the template
    
    res.json({ 
      message: 'Template deleted successfully',
      templateId 
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// GET /api/templates/user/:userId - Get user's templates
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // In a real application, you would fetch from database
    // For now, return empty array
    res.json([]);
  } catch (error) {
    console.error('Error fetching user templates:', error);
    res.status(500).json({ error: 'Failed to fetch user templates' });
  }
});

// POST /api/templates/validate - Validate template logic
router.post('/validate', async (req, res) => {
  try {
    const { serializedLogic } = req.body;
    
    if (!serializedLogic) {
      return res.status(400).json({ error: 'Serialized logic is required' });
    }
    
    // Basic validation - in a real application, you would have more sophisticated validation
    const isValid = validateTemplateLogic(serializedLogic);
    
    res.json({ 
      isValid,
      errors: isValid ? [] : ['Invalid template logic structure']
    });
  } catch (error) {
    console.error('Error validating template:', error);
    res.status(500).json({ error: 'Failed to validate template' });
  }
});

// Helper function to validate template logic
function validateTemplateLogic(logic) {
  if (!logic || typeof logic !== 'object') {
    return false;
  }
  
  // Check for required fields based on strategy type
  const requiredFields = ['type', 'entryCondition', 'exitCondition'];
  
  for (const field of requiredFields) {
    if (!logic[field]) {
      return false;
    }
  }
  
  // Additional validation based on strategy type
  switch (logic.type) {
    case 'crossover':
      return logic.fastMA && logic.slowMA;
    case 'meanReversion':
      return logic.rsiPeriod && logic.oversoldThreshold && logic.overboughtThreshold;
    case 'breakout':
      return logic.bbPeriod && logic.bbStdDev;
    case 'momentum':
      return logic.lookbackPeriod && logic.volumeMultiplier;
    case 'pairs':
      return logic.correlationPeriod && logic.zScoreThreshold;
    case 'divergence':
      return logic.macdFast && logic.macdSlow && logic.macdSignal;
    case 'supportResistance':
      return logic.lookbackPeriod && logic.touchesRequired;
    case 'volatility':
      return logic.vixThreshold && logic.meanReversionPeriod;
    case 'earnings':
      return logic.daysBeforeEarnings && logic.volatilityThreshold;
    case 'sectorRotation':
      return logic.lookbackPeriod && logic.relativeStrengthThreshold;
    case 'grid':
      return logic.gridSize && logic.gridLevels;
    case 'arbitrage':
      return logic.minSpread && logic.maxSlippage;
    default:
      return true; // Allow custom strategy types
  }
}

module.exports = router;