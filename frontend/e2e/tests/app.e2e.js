/**
 * Detox E2E Test Suite
 * 
 * Comprehensive end-to-end tests covering complete user flows
 * including onboarding, broker connection, formula subscription,
 * strategy building, and trade execution.
 */

describe('Auto Trading App E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  describe('Onboarding Flow', () => {
    it('should complete user onboarding successfully', async () => {
      // Welcome screen
      await expect(element(by.id('welcome-screen'))).toBeVisible();
      await expect(element(by.text('Welcome to Auto Trading'))).toBeVisible();
      
      // Tap "Get Started"
      await element(by.id('get-started-button')).tap();
      
      // Onboarding steps
      await expect(element(by.id('onboarding-coach'))).toBeVisible();
      
      // Step 1: Formula Marketplace
      await expect(element(by.text('Discover Trading Formulas'))).toBeVisible();
      await element(by.id('next-button')).tap();
      
      // Step 2: Subscriptions
      await expect(element(by.text('Subscribe to Strategies'))).toBeVisible();
      await element(by.id('next-button')).tap();
      
      // Step 3: Backtesting
      await expect(element(by.text('Test Before You Trade'))).toBeVisible();
      await element(by.id('next-button')).tap();
      
      // Step 4: Risk Management
      await expect(element(by.text('Manage Your Risk'))).toBeVisible();
      await element(by.id('next-button')).tap();
      
      // Step 5: Live Trading
      await expect(element(by.text('Execute Trades'))).toBeVisible();
      await element(by.id('next-button')).tap();
      
      // Step 6: Notifications
      await expect(element(by.text('Stay Informed'))).toBeVisible();
      await element(by.id('next-button')).tap();
      
      // Complete onboarding
      await element(by.id('complete-onboarding-button')).tap();
      
      // Should navigate to main app
      await expect(element(by.id('main-tab-navigator'))).toBeVisible();
    });

    it('should allow skipping onboarding', async () => {
      await expect(element(by.id('welcome-screen'))).toBeVisible();
      
      // Tap "Skip" button
      await element(by.id('skip-button')).tap();
      
      // Should navigate to main app
      await expect(element(by.id('main-tab-navigator'))).toBeVisible();
    });
  });

  describe('Authentication Flow', () => {
    it('should register new user successfully', async () => {
      // Navigate to registration
      await element(by.id('auth-tab')).tap();
      await element(by.id('register-button')).tap();
      
      // Fill registration form
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('username-input')).typeText('testuser');
      await element(by.id('full-name-input')).typeText('Test User');
      await element(by.id('password-input')).typeText('testpassword123');
      await element(by.id('confirm-password-input')).typeText('testpassword123');
      
      // Accept terms
      await element(by.id('terms-checkbox')).tap();
      
      // Submit registration
      await element(by.id('register-submit-button')).tap();
      
      // Should show success message
      await expect(element(by.text('Registration successful'))).toBeVisible();
      
      // Should navigate to main app
      await expect(element(by.id('main-tab-navigator'))).toBeVisible();
    });

    it('should login existing user successfully', async () => {
      // Navigate to login
      await element(by.id('auth-tab')).tap();
      await element(by.id('login-button')).tap();
      
      // Fill login form
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('testpassword123');
      
      // Submit login
      await element(by.id('login-submit-button')).tap();
      
      // Should navigate to main app
      await expect(element(by.id('main-tab-navigator'))).toBeVisible();
    });

    it('should handle login errors gracefully', async () => {
      // Navigate to login
      await element(by.id('auth-tab')).tap();
      await element(by.id('login-button')).tap();
      
      // Fill with invalid credentials
      await element(by.id('email-input')).typeText('invalid@example.com');
      await element(by.id('password-input')).typeText('wrongpassword');
      
      // Submit login
      await element(by.id('login-submit-button')).tap();
      
      // Should show error message
      await expect(element(by.text('Invalid credentials'))).toBeVisible();
    });
  });

  describe('Broker Connection Flow', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('auth-tab')).tap();
      await element(by.id('login-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('testpassword123');
      await element(by.id('login-submit-button')).tap();
    });

    it('should connect Zerodha broker successfully', async () => {
      // Navigate to broker connection
      await element(by.id('settings-tab')).tap();
      await element(by.id('broker-connection-button')).tap();
      
      // Select Zerodha
      await element(by.id('broker-selector')).tap();
      await element(by.id('broker-zerodha')).tap();
      
      // Fill credentials
      await element(by.id('api-key-input')).typeText('test-api-key');
      await element(by.id('secret-key-input')).typeText('test-secret-key');
      await element(by.id('account-id-input')).typeText('test-account-id');
      
      // Connect
      await element(by.id('connect-broker-button')).tap();
      
      // Should show success message
      await expect(element(by.text('Broker connected successfully'))).toBeVisible();
      
      // Should show connected status
      await expect(element(by.text('Connected'))).toBeVisible();
    });

    it('should handle broker connection errors', async () => {
      // Navigate to broker connection
      await element(by.id('settings-tab')).tap();
      await element(by.id('broker-connection-button')).tap();
      
      // Select Zerodha
      await element(by.id('broker-selector')).tap();
      await element(by.id('broker-zerodha')).tap();
      
      // Fill invalid credentials
      await element(by.id('api-key-input')).typeText('invalid-key');
      await element(by.id('secret-key-input')).typeText('invalid-secret');
      await element(by.id('account-id-input')).typeText('invalid-account');
      
      // Connect
      await element(by.id('connect-broker-button')).tap();
      
      // Should show error message
      await expect(element(by.text('Broker validation failed'))).toBeVisible();
    });

    it('should disconnect broker successfully', async () => {
      // Navigate to broker settings
      await element(by.id('settings-tab')).tap();
      await element(by.id('broker-connection-button')).tap();
      
      // Should show connected broker
      await expect(element(by.id('connected-broker-card'))).toBeVisible();
      
      // Tap disconnect
      await element(by.id('disconnect-broker-button')).tap();
      
      // Confirm disconnect
      await element(by.id('confirm-disconnect-button')).tap();
      
      // Should show success message
      await expect(element(by.text('Broker disconnected successfully'))).toBeVisible();
    });
  });

  describe('Formula Marketplace Flow', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('auth-tab')).tap();
      await element(by.id('login-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('testpassword123');
      await element(by.id('login-submit-button')).tap();
    });

    it('should browse and filter formulas', async () => {
      // Navigate to marketplace
      await element(by.id('marketplace-tab')).tap();
      
      // Should show formulas list
      await expect(element(by.id('formulas-list'))).toBeVisible();
      
      // Filter by category
      await element(by.id('category-filter')).tap();
      await element(by.id('category-momentum')).tap();
      
      // Should show filtered results
      await expect(element(by.id('formulas-list'))).toBeVisible();
      
      // Search for specific formula
      await element(by.id('search-input')).typeText('momentum');
      
      // Should show search results
      await expect(element(by.id('formulas-list'))).toBeVisible();
    });

    it('should subscribe to formula successfully', async () => {
      // Navigate to marketplace
      await element(by.id('marketplace-tab')).tap();
      
      // Tap on a formula card
      await element(by.id('formula-card-1')).tap();
      
      // Should navigate to formula detail
      await expect(element(by.id('formula-detail-screen'))).toBeVisible();
      
      // Tap subscribe button
      await element(by.id('subscribe-button')).tap();
      
      // Select billing period
      await element(by.id('billing-period-selector')).tap();
      await element(by.id('billing-monthly')).tap();
      
      // Confirm subscription
      await element(by.id('confirm-subscription-button')).tap();
      
      // Should show success message
      await expect(element(by.text('Successfully subscribed'))).toBeVisible();
    });

    it('should view formula details and performance', async () => {
      // Navigate to marketplace
      await element(by.id('marketplace-tab')).tap();
      
      // Tap on a formula card
      await element(by.id('formula-card-1')).tap();
      
      // Should show formula details
      await expect(element(by.id('formula-detail-screen'))).toBeVisible();
      await expect(element(by.id('performance-chart'))).toBeVisible();
      await expect(element(by.id('risk-metrics'))).toBeVisible();
      await expect(element(by.id('backtest-results'))).toBeVisible();
    });
  });

  describe('Formula Studio Flow', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('auth-tab')).tap();
      await element(by.id('login-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('testpassword123');
      await element(by.id('login-submit-button')).tap();
    });

    it('should create new formula using visual builder', async () => {
      // Navigate to formula studio
      await element(by.id('formula-studio-tab')).tap();
      await element(by.id('create-new-formula-button')).tap();
      
      // Should show formula builder
      await expect(element(by.id('formula-builder-screen'))).toBeVisible();
      
      // Add RSI indicator block
      await element(by.id('add-block-button')).tap();
      await element(by.id('indicator-block')).tap();
      await element(by.id('rsi-indicator')).tap();
      
      // Configure RSI parameters
      await element(by.id('rsi-period-input')).typeText('14');
      
      // Add condition block
      await element(by.id('add-block-button')).tap();
      await element(by.id('condition-block')).tap();
      await element(by.id('greater-than-condition')).tap();
      
      // Connect blocks
      await element(by.id('rsi-output-port')).dragTo(element(by.id('condition-input-port')));
      
      // Add action block
      await element(by.id('add-block-button')).tap();
      await element(by.id('action-block')).tap();
      await element(by.id('buy-action')).tap();
      
      // Connect condition to action
      await element(by.id('condition-output-port')).dragTo(element(by.id('action-input-port')));
      
      // Save formula
      await element(by.id('save-formula-button')).tap();
      
      // Fill formula details
      await element(by.id('formula-name-input')).typeText('My RSI Strategy');
      await element(by.id('formula-description-input')).typeText('A simple RSI-based strategy');
      await element(by.id('formula-category-selector')).tap();
      await element(by.id('category-momentum')).tap();
      
      // Submit formula
      await element(by.id('submit-formula-button')).tap();
      
      // Should show success message
      await expect(element(by.text('Formula created successfully'))).toBeVisible();
    });

    it('should edit existing formula', async () => {
      // Navigate to formula studio
      await element(by.id('formula-studio-tab')).tap();
      
      // Tap on existing formula
      await element(by.id('formula-card-1')).tap();
      
      // Tap edit button
      await element(by.id('edit-formula-button')).tap();
      
      // Should show formula builder with existing blocks
      await expect(element(by.id('formula-builder-screen'))).toBeVisible();
      
      // Modify existing block
      await element(by.id('rsi-block')).tap();
      await element(by.id('rsi-period-input')).clearText();
      await element(by.id('rsi-period-input')).typeText('21');
      
      // Save changes
      await element(by.id('save-formula-button')).tap();
      
      // Should show success message
      await expect(element(by.text('Formula updated successfully'))).toBeVisible();
    });

    it('should preview formula logic', async () => {
      // Navigate to formula studio
      await element(by.id('formula-studio-tab')).tap();
      
      // Tap on existing formula
      await element(by.id('formula-card-1')).tap();
      
      // Tap preview button
      await element(by.id('preview-formula-button')).tap();
      
      // Should show formula preview
      await expect(element(by.id('formula-preview-screen'))).toBeVisible();
      await expect(element(by.id('logic-tree-view'))).toBeVisible();
      await expect(element(by.id('pseudocode-view'))).toBeVisible();
      await expect(element(by.id('natural-language-explanation'))).toBeVisible();
    });
  });

  describe('Risk Management Flow', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('auth-tab')).tap();
      await element(by.id('login-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('testpassword123');
      await element(by.id('login-submit-button')).tap();
    });

    it('should configure risk settings for subscription', async () => {
      // Navigate to subscriptions
      await element(by.id('subscriptions-tab')).tap();
      
      // Tap on subscription
      await element(by.id('subscription-card-1')).tap();
      
      // Tap risk settings
      await element(by.id('risk-settings-button')).tap();
      
      // Should show risk widget
      await expect(element(by.id('risk-widget'))).toBeVisible();
      
      // Configure stop loss
      await element(by.id('stop-loss-toggle')).tap();
      await element(by.id('stop-loss-type-selector')).tap();
      await element(by.id('stop-loss-percentage')).tap();
      await element(by.id('stop-loss-value-input')).typeText('2.0');
      
      // Configure take profit
      await element(by.id('take-profit-toggle')).tap();
      await element(by.id('take-profit-value-input')).typeText('4.0');
      
      // Configure position sizing
      await element(by.id('position-sizing-method-selector')).tap();
      await element(by.id('position-sizing-risk-based')).tap();
      await element(by.id('max-risk-per-trade-input')).typeText('1.0');
      
      // Save settings
      await element(by.id('save-risk-settings-button')).tap();
      
      // Should show success message
      await expect(element(by.text('Risk settings saved successfully'))).toBeVisible();
    });

    it('should show risk warnings', async () => {
      // Navigate to risk settings
      await element(by.id('subscriptions-tab')).tap();
      await element(by.id('subscription-card-1')).tap();
      await element(by.id('risk-settings-button')).tap();
      
      // Set high risk values
      await element(by.id('stop-loss-value-input')).typeText('10.0');
      await element(by.id('take-profit-value-input')).typeText('5.0');
      await element(by.id('max-risk-per-trade-input')).typeText('10.0');
      
      // Should show risk warnings
      await expect(element(by.text('Portfolio risk exceeds maximum'))).toBeVisible();
      await expect(element(by.text('Risk/Reward ratio is below 1:1'))).toBeVisible();
    });
  });

  describe('Trade Execution Flow', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('auth-tab')).tap();
      await element(by.id('login-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('testpassword123');
      await element(by.id('login-submit-button')).tap();
    });

    it('should execute trade in auto mode', async () => {
      // Navigate to trades
      await element(by.id('trades-tab')).tap();
      
      // Should show trade signals
      await expect(element(by.id('trade-signals-list'))).toBeVisible();
      
      // Tap on trade signal
      await element(by.id('trade-signal-card-1')).tap();
      
      // Should show trade details
      await expect(element(by.id('trade-detail-screen'))).toBeVisible();
      
      // Should show auto execution status
      await expect(element(by.text('Auto Execution Enabled'))).toBeVisible();
      
      // Tap execute button
      await element(by.id('execute-trade-button')).tap();
      
      // Should show execution confirmation
      await expect(element(by.text('Trade executed successfully'))).toBeVisible();
    });

    it('should execute trade in manual mode', async () => {
      // Navigate to trades
      await element(by.id('trades-tab')).tap();
      
      // Tap on trade signal
      await element(by.id('trade-signal-card-1')).tap();
      
      // Change to manual mode
      await element(by.id('execution-mode-selector')).tap();
      await element(by.id('execution-mode-manual')).tap();
      
      // Tap execute button
      await element(by.id('execute-trade-button')).tap();
      
      // Should show approval modal
      await expect(element(by.id('trade-approval-modal'))).toBeVisible();
      
      // Review trade details
      await expect(element(by.id('trade-quantity-input'))).toBeVisible();
      await expect(element(by.id('trade-price-input'))).toBeVisible();
      
      // Approve trade
      await element(by.id('approve-trade-button')).tap();
      
      // Should show execution confirmation
      await expect(element(by.text('Trade approved and executed'))).toBeVisible();
    });

    it('should reject trade', async () => {
      // Navigate to trades
      await element(by.id('trades-tab')).tap();
      
      // Tap on trade signal
      await element(by.id('trade-signal-card-1')).tap();
      
      // Tap execute button
      await element(by.id('execute-trade-button')).tap();
      
      // Should show approval modal
      await expect(element(by.id('trade-approval-modal'))).toBeVisible();
      
      // Reject trade
      await element(by.id('reject-trade-button')).tap();
      
      // Should show rejection confirmation
      await expect(element(by.text('Trade rejected'))).toBeVisible();
    });

    it('should switch between paper and live trading', async () => {
      // Navigate to settings
      await element(by.id('settings-tab')).tap();
      
      // Tap trading mode
      await element(by.id('trading-mode-button')).tap();
      
      // Should show mode selector
      await expect(element(by.id('trading-mode-selector'))).toBeVisible();
      
      // Switch to paper trading
      await element(by.id('paper-trading-mode')).tap();
      
      // Should show paper trading status
      await expect(element(by.text('Paper Trading Mode'))).toBeVisible();
      
      // Switch to live trading
      await element(by.id('live-trading-mode')).tap();
      
      // Should show confirmation
      await expect(element(by.id('live-trading-confirmation'))).toBeVisible();
      
      // Confirm live trading
      await element(by.id('confirm-live-trading-button')).tap();
      
      // Should show live trading status
      await expect(element(by.text('Live Trading Mode'))).toBeVisible();
    });
  });

  describe('Review and Rating Flow', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('auth-tab')).tap();
      await element(by.id('login-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('testpassword123');
      await element(by.id('login-submit-button')).tap();
    });

    it('should create review for formula', async () => {
      // Navigate to marketplace
      await element(by.id('marketplace-tab')).tap();
      
      // Tap on formula
      await element(by.id('formula-card-1')).tap();
      
      // Tap reviews tab
      await element(by.id('reviews-tab')).tap();
      
      // Tap add review button
      await element(by.id('add-review-button')).tap();
      
      // Should show review form
      await expect(element(by.id('review-form-screen'))).toBeVisible();
      
      // Fill review form
      await element(by.id('rating-selector')).tap();
      await element(by.id('rating-5-stars')).tap();
      await element(by.id('review-title-input')).typeText('Great formula!');
      await element(by.id('review-content-input')).typeText('This formula works really well for momentum trading.');
      
      // Submit review
      await element(by.id('submit-review-button')).tap();
      
      // Should show success message
      await expect(element(by.text('Review submitted successfully'))).toBeVisible();
    });

    it('should mark review as helpful', async () => {
      // Navigate to formula reviews
      await element(by.id('marketplace-tab')).tap();
      await element(by.id('formula-card-1')).tap();
      await element(by.id('reviews-tab')).tap();
      
      // Tap helpful button on review
      await element(by.id('review-helpful-button-1')).tap();
      
      // Should show updated helpful count
      await expect(element(by.id('helpful-count-1'))).toBeVisible();
    });
  });

  describe('Notification Flow', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('auth-tab')).tap();
      await element(by.id('login-button')).tap();
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('testpassword123');
      await element(by.id('login-submit-button')).tap();
    });

    it('should receive and view notifications', async () => {
      // Navigate to notifications
      await element(by.id('notifications-tab')).tap();
      
      // Should show notifications list
      await expect(element(by.id('notifications-list'))).toBeVisible();
      
      // Tap on notification
      await element(by.id('notification-card-1')).tap();
      
      // Should show notification details
      await expect(element(by.id('notification-detail-screen'))).toBeVisible();
    });

    it('should configure notification preferences', async () => {
      // Navigate to settings
      await element(by.id('settings-tab')).tap();
      
      // Tap notification settings
      await element(by.id('notification-settings-button')).tap();
      
      // Should show notification preferences
      await expect(element(by.id('notification-preferences-screen'))).toBeVisible();
      
      // Configure preferences
      await element(by.id('trade-notifications-toggle')).tap();
      await element(by.id('formula-alerts-toggle')).tap();
      await element(by.id('market-updates-toggle')).tap();
      
      // Save preferences
      await element(by.id('save-notification-preferences-button')).tap();
      
      // Should show success message
      await expect(element(by.text('Notification preferences saved'))).toBeVisible();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Simulate network error
      await device.setURLBlacklist(['.*api.*']);
      
      // Navigate to marketplace
      await element(by.id('marketplace-tab')).tap();
      
      // Should show error message
      await expect(element(by.text('Network error'))).toBeVisible();
      
      // Should show retry button
      await expect(element(by.id('retry-button'))).toBeVisible();
      
      // Restore network
      await device.clearURLBlacklist();
      
      // Tap retry
      await element(by.id('retry-button')).tap();
      
      // Should load data successfully
      await expect(element(by.id('formulas-list'))).toBeVisible();
    });

    it('should handle app crashes gracefully', async () => {
      // Simulate app crash
      await device.terminateApp();
      
      // Relaunch app
      await device.launchApp();
      
      // Should show crash recovery screen
      await expect(element(by.id('crash-recovery-screen'))).toBeVisible();
      
      // Tap recover
      await element(by.id('recover-button')).tap();
      
      // Should restore app state
      await expect(element(by.id('main-tab-navigator'))).toBeVisible();
    });
  });

  describe('Performance Tests', () => {
    it('should load marketplace quickly', async () => {
      const startTime = Date.now();
      
      // Navigate to marketplace
      await element(by.id('marketplace-tab')).tap();
      
      // Wait for content to load
      await expect(element(by.id('formulas-list'))).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    it('should handle large formula lists efficiently', async () => {
      // Navigate to marketplace
      await element(by.id('marketplace-tab')).tap();
      
      // Scroll through large list
      await element(by.id('formulas-list')).scroll(200, 'down');
      await element(by.id('formulas-list')).scroll(200, 'down');
      await element(by.id('formulas-list')).scroll(200, 'down');
      
      // Should maintain smooth scrolling
      await expect(element(by.id('formulas-list'))).toBeVisible();
    });
  });
});
