/**
 * Detox E2E Test Setup
 * 
 * Global setup for Detox end-to-end tests including
 * device configuration and test utilities.
 */

const { device, element, by, expect } = require('detox');

// Global test setup
beforeAll(async () => {
  // Set up device configuration
  await device.setOrientation('portrait');
  await device.setURLBlacklist(['.*localhost.*']);
});

// Global test teardown
afterAll(async () => {
  // Clean up after all tests
  await device.clearURLBlacklist();
});

// Test utilities
global.testUtils = {
  // Wait for element to be visible
  waitForElement: async (elementId, timeout = 10000) => {
    await waitFor(element(by.id(elementId)))
      .toBeVisible()
      .withTimeout(timeout);
  },

  // Wait for text to be visible
  waitForText: async (text, timeout = 10000) => {
    await waitFor(element(by.text(text)))
      .toBeVisible()
      .withTimeout(timeout);
  },

  // Tap element and wait for response
  tapAndWait: async (elementId, waitElementId, timeout = 5000) => {
    await element(by.id(elementId)).tap();
    await global.testUtils.waitForElement(waitElementId, timeout);
  },

  // Type text with delay
  typeTextWithDelay: async (elementId, text, delay = 100) => {
    await element(by.id(elementId)).typeText(text);
    await new Promise(resolve => setTimeout(resolve, delay));
  },

  // Scroll to element
  scrollToElement: async (scrollViewId, elementId, direction = 'down') => {
    await element(by.id(scrollViewId)).scrollTo(element(by.id(elementId)), direction);
  },

  // Take screenshot
  takeScreenshot: async (name) => {
    await device.takeScreenshot(name);
  },

  // Simulate network conditions
  simulateNetworkConditions: async (condition) => {
    switch (condition) {
      case 'slow':
        await device.setURLBlacklist(['.*api.*']);
        break;
      case 'offline':
        await device.setURLBlacklist(['.*']);
        break;
      case 'online':
        await device.clearURLBlacklist();
        break;
    }
  },

  // Reset app state
  resetAppState: async () => {
    await device.reloadReactNative();
  },

  // Login helper
  login: async (email = 'test@example.com', password = 'testpassword123') => {
    await element(by.id('auth-tab')).tap();
    await element(by.id('login-button')).tap();
    await element(by.id('email-input')).typeText(email);
    await element(by.id('password-input')).typeText(password);
    await element(by.id('login-submit-button')).tap();
    await global.testUtils.waitForElement('main-tab-navigator');
  },

  // Logout helper
  logout: async () => {
    await element(by.id('settings-tab')).tap();
    await element(by.id('logout-button')).tap();
    await element(by.id('confirm-logout-button')).tap();
    await global.testUtils.waitForElement('welcome-screen');
  }
};

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Test timeout handling
jest.setTimeout(120000);
