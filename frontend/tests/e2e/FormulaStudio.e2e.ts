import { device, expect, element, by, waitFor } from 'detox';

describe('Formula Studio E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Navigation Flow', () => {
    it('should navigate to Formula Studio from main screen', async () => {
      // Assuming there's a button to navigate to Formula Studio
      await waitFor(element(by.id('formula-studio-button')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id('formula-studio-button')).tap();
      
      await expect(element(by.text('Formula Studio'))).toBeVisible();
    });

    it('should navigate back to main screen', async () => {
      await element(by.id('formula-studio-button')).tap();
      await element(by.id('back-button')).tap();
      
      await expect(element(by.text('Trading Dashboard'))).toBeVisible();
    });
  });

  describe('Block Management', () => {
    beforeEach(async () => {
      await element(by.id('formula-studio-button')).tap();
    });

    it('should add a new indicator block', async () => {
      await element(by.id('add-block-button')).tap();
      await element(by.text('Indicator')).tap();
      await element(by.text('SMA')).tap();
      
      await expect(element(by.id('block-sma-1'))).toBeVisible();
    });

    it('should add a new condition block', async () => {
      await element(by.id('add-block-button')).tap();
      await element(by.text('Condition')).tap();
      await element(by.text('Price > SMA')).tap();
      
      await expect(element(by.id('block-price-gt-sma-1'))).toBeVisible();
    });

    it('should add a new action block', async () => {
      await element(by.id('add-block-button')).tap();
      await element(by.text('Action')).tap();
      await element(by.text('Buy')).tap();
      
      await expect(element(by.id('block-buy-1'))).toBeVisible();
    });

    it('should edit a block', async () => {
      // Add a block first
      await element(by.id('add-block-button')).tap();
      await element(by.text('Indicator')).tap();
      await element(by.text('SMA')).tap();
      
      // Edit the block
      await element(by.id('block-sma-1')).tap();
      await element(by.id('edit-block-button')).tap();
      
      await element(by.id('block-name-input')).clearText();
      await element(by.id('block-name-input')).typeText('Custom SMA');
      
      await element(by.id('save-block-button')).tap();
      
      await expect(element(by.text('Custom SMA'))).toBeVisible();
    });

    it('should delete a block', async () => {
      // Add a block first
      await element(by.id('add-block-button')).tap();
      await element(by.text('Indicator')).tap();
      await element(by.text('SMA')).tap();
      
      // Delete the block
      await element(by.id('block-sma-1')).tap();
      await element(by.id('delete-block-button')).tap();
      
      await expect(element(by.id('block-sma-1'))).not.toBeVisible();
    });
  });

  describe('Drag and Drop', () => {
    beforeEach(async () => {
      await element(by.id('formula-studio-button')).tap();
      
      // Add some blocks for testing
      await element(by.id('add-block-button')).tap();
      await element(by.text('Indicator')).tap();
      await element(by.text('SMA')).tap();
      
      await element(by.id('add-block-button')).tap();
      await element(by.text('Condition')).tap();
      await element(by.text('Price > SMA')).tap();
    });

    it('should drag and drop blocks', async () => {
      const smaBlock = element(by.id('block-sma-1'));
      const conditionBlock = element(by.id('block-price-gt-sma-1'));
      
      // Get initial positions
      const smaInitialPosition = await smaBlock.getAttributes();
      const conditionInitialPosition = await conditionBlock.getAttributes();
      
      // Drag SMA block
      await smaBlock.drag(100, 100, 'fast', 0);
      
      // Drag condition block
      await conditionBlock.drag(-50, 50, 'fast', 0);
      
      // Verify blocks moved (positions should be different)
      const smaNewPosition = await smaBlock.getAttributes();
      const conditionNewPosition = await conditionBlock.getAttributes();
      
      expect(smaNewPosition).not.toEqual(smaInitialPosition);
      expect(conditionNewPosition).not.toEqual(conditionInitialPosition);
    });

    it('should connect blocks with lines', async () => {
      // This would test the visual connection between blocks
      // Implementation depends on how connections are rendered
      await element(by.id('block-sma-1')).tap();
      await element(by.id('connect-button')).tap();
      await element(by.id('block-price-gt-sma-1')).tap();
      
      await expect(element(by.id('connection-line-1'))).toBeVisible();
    });
  });

  describe('Formula Management', () => {
    beforeEach(async () => {
      await element(by.id('formula-studio-button')).tap();
    });

    it('should save a new formula', async () => {
      // Add some blocks
      await element(by.id('add-block-button')).tap();
      await element(by.text('Indicator')).tap();
      await element(by.text('SMA')).tap();
      
      // Save formula
      await element(by.id('save-formula-button')).tap();
      
      await element(by.id('formula-name-input')).typeText('Test Formula');
      await element(by.id('formula-description-input')).typeText('A test formula');
      
      await element(by.id('confirm-save-button')).tap();
      
      await expect(element(by.text('Formula saved successfully'))).toBeVisible();
    });

    it('should load an existing formula', async () => {
      await element(by.id('load-formula-button')).tap();
      await element(by.text('Test Formula')).tap();
      
      await expect(element(by.id('block-sma-1'))).toBeVisible();
    });

    it('should validate formula before saving', async () => {
      // Try to save empty formula
      await element(by.id('save-formula-button')).tap();
      
      await expect(element(by.text('Formula must contain at least one block'))).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await element(by.id('formula-studio-button')).tap();
    });

    it('should handle network errors gracefully', async () => {
      // Simulate network error by turning off network
      await device.setURLBlacklist(['.*']);
      
      await element(by.id('save-formula-button')).tap();
      
      await expect(element(by.text('Network error. Please check your connection.'))).toBeVisible();
      
      // Restore network
      await device.clearURLBlacklist();
    });

    it('should handle invalid block configurations', async () => {
      await element(by.id('add-block-button')).tap();
      await element(by.text('Indicator')).tap();
      await element(by.text('SMA')).tap();
      
      // Edit block with invalid parameters
      await element(by.id('block-sma-1')).tap();
      await element(by.id('edit-block-button')).tap();
      
      await element(by.id('block-parameters-input')).clearText();
      await element(by.id('block-parameters-input')).typeText('invalid json');
      
      await element(by.id('save-block-button')).tap();
      
      await expect(element(by.text('Invalid parameters. Please check your input.'))).toBeVisible();
    });
  });

  describe('Performance', () => {
    it('should handle many blocks without performance issues', async () => {
      await element(by.id('formula-studio-button')).tap();
      
      // Add many blocks
      for (let i = 0; i < 20; i++) {
        await element(by.id('add-block-button')).tap();
        await element(by.text('Indicator')).tap();
        await element(by.text('SMA')).tap();
      }
      
      // Verify all blocks are visible and responsive
      await expect(element(by.id('block-sma-1'))).toBeVisible();
      await expect(element(by.id('block-sma-20'))).toBeVisible();
      
      // Test scrolling performance
      await element(by.id('canvas-scroll-view')).scroll(0, 500, 'fast', 0.5);
      await element(by.id('canvas-scroll-view')).scroll(0, -500, 'fast', 0.5);
    });
  });
});