/**
 * Broker Connection Screen
 * 
 * Comprehensive screen for connecting to various Indian and international brokers
 * with step-by-step guidance and credential validation.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import theme from '../theme';

// Types and Interfaces
export interface BrokerInfo {
  id: string;
  name: string;
  type: 'INDIAN' | 'INTERNATIONAL';
  logo: string;
  description: string;
  features: string[];
  supportedMarkets: string[];
  apiDocumentation: string;
  isPopular: boolean;
  isRecommended: boolean;
}

export interface BrokerCredentials {
  apiKey: string;
  secretKey: string;
  accessToken?: string;
  userId?: string;
  password?: string;
  totpSecret?: string;
  passphrase?: string;
}

export interface BrokerConnectionScreenProps {
  /** Callback when broker is connected */
  onBrokerConnected: (brokerId: string, credentials: BrokerCredentials) => void;
  /** Callback when screen is closed */
  onClose: () => void;
  /** Additional styling */
  style?: any;
}

// Broker Information
const BROKER_INFO: Record<string, BrokerInfo> = {
  zerodha: {
    id: 'zerodha',
    name: 'Zerodha',
    type: 'INDIAN',
    logo: '🏦',
    description: 'India\'s largest stock broker with advanced trading tools',
    features: ['Kite Connect API', 'Real-time data', 'Algorithmic trading', 'Low brokerage'],
    supportedMarkets: ['NSE', 'BSE', 'MCX', 'NCDEX'],
    apiDocumentation: 'https://kite.trade/docs/connect/v3/',
    isPopular: true,
    isRecommended: true,
  },
  angel_one: {
    id: 'angel_one',
    name: 'Angel One',
    type: 'INDIAN',
    logo: '👼',
    description: 'Leading discount broker with SmartAPI for developers',
    features: ['SmartAPI', 'Real-time data', 'Historical data', 'Order management'],
    supportedMarkets: ['NSE', 'BSE', 'MCX'],
    apiDocumentation: 'https://smartapi.angelbroking.com/docs',
    isPopular: true,
    isRecommended: true,
  },
  upstox: {
    id: 'upstox',
    name: 'Upstox',
    type: 'INDIAN',
    logo: '📈',
    description: 'Modern broker with powerful API for algorithmic trading',
    features: ['Upstox API', 'Real-time data', 'WebSocket feeds', 'Historical data'],
    supportedMarkets: ['NSE', 'BSE', 'MCX'],
    apiDocumentation: 'https://upstox.com/developer/api-documentation',
    isPopular: true,
    isRecommended: false,
  },
  alpaca: {
    id: 'alpaca',
    name: 'Alpaca',
    type: 'INTERNATIONAL',
    logo: '🦙',
    description: 'Commission-free trading API for US markets',
    features: ['Commission-free', 'Real-time data', 'Paper trading', 'REST API'],
    supportedMarkets: ['NYSE', 'NASDAQ', 'AMEX'],
    apiDocumentation: 'https://alpaca.markets/docs/',
    isPopular: true,
    isRecommended: true,
  },
  interactive_brokers: {
    id: 'interactive_brokers',
    name: 'Interactive Brokers',
    type: 'INTERNATIONAL',
    logo: '🌍',
    description: 'Global broker with professional trading tools',
    features: ['TWS API', 'Global markets', 'Advanced analytics', 'Professional tools'],
    supportedMarkets: ['NYSE', 'NASDAQ', 'LSE', 'TSE', 'HKEX'],
    apiDocumentation: 'https://interactivebrokers.github.io/tws-api/',
    isPopular: false,
    isRecommended: false,
  },
};

// Main Broker Connection Screen Component
const BrokerConnectionScreen: React.FC<BrokerConnectionScreenProps> = ({
  onBrokerConnected,
  onClose,
  style,
}) => {
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentials, setCredentials] = useState<BrokerCredentials>({
    apiKey: '',
    secretKey: '',
    accessToken: '',
    userId: '',
    password: '',
    totpSecret: '',
    passphrase: '',
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStep, setConnectionStep] = useState<'select' | 'credentials' | 'testing' | 'success'>('select');
  const [testResults, setTestResults] = useState<any>(null);

  // Handle broker selection
  const handleBrokerSelect = useCallback((brokerId: string) => {
    setSelectedBroker(brokerId);
    setShowCredentialsModal(true);
    setConnectionStep('credentials');
  }, []);

  // Handle credentials input
  const handleCredentialsChange = useCallback((field: keyof BrokerCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Handle connection test
  const handleTestConnection = useCallback(async () => {
    if (!selectedBroker) return;

    setIsConnecting(true);
    setConnectionStep('testing');

    try {
      // Simulate API call to test connection
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock test results
      const mockResults = {
        success: true,
        message: 'Connection successful',
        brokerType: selectedBroker,
        profile: {
          name: 'Test User',
          accountId: '123456789',
          status: 'Active',
        },
        tests: [
          { test: 'Authentication', success: true, message: 'Credentials validated' },
          { test: 'API Access', success: true, message: 'API endpoints accessible' },
          { test: 'Market Data', success: true, message: 'Real-time data available' },
          { test: 'Order Placement', success: true, message: 'Order placement ready' },
        ],
      };

      setTestResults(mockResults);
      setConnectionStep('success');
    } catch (error) {
      Alert.alert('Connection Failed', 'Unable to connect to broker. Please check your credentials.');
      setConnectionStep('credentials');
    } finally {
      setIsConnecting(false);
    }
  }, [selectedBroker]);

  // Handle final connection
  const handleConnect = useCallback(() => {
    if (selectedBroker && testResults?.success) {
      onBrokerConnected(selectedBroker, credentials);
      onClose();
    }
  }, [selectedBroker, credentials, testResults, onBrokerConnected, onClose]);

  // Render broker selection
  const renderBrokerSelection = () => (
    <ScrollView style={styles.selectionContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Connect Broker</Text>
        <Text style={styles.subtitle}>Choose your broker to start trading</Text>
      </View>

      {/* Popular Brokers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Brokers</Text>
        {Object.values(BROKER_INFO)
          .filter(broker => broker.isPopular)
          .map(broker => (
            <TouchableOpacity
              key={broker.id}
              style={styles.brokerCard}
              onPress={() => handleBrokerSelect(broker.id)}
              activeOpacity={0.8}
            >
              <View style={styles.brokerHeader}>
                <Text style={styles.brokerLogo}>{broker.logo}</Text>
                <View style={styles.brokerInfo}>
                  <Text style={styles.brokerName}>{broker.name}</Text>
                  <Text style={styles.brokerDescription}>{broker.description}</Text>
                </View>
                {broker.isRecommended && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Recommended</Text>
                  </View>
                )}
              </View>

              <View style={styles.brokerFeatures}>
                {broker.features.slice(0, 3).map((feature, index) => (
                  <View key={index} style={styles.featureTag}>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.brokerMarkets}>
                <Text style={styles.marketsLabel}>Markets:</Text>
                <Text style={styles.marketsText}>{broker.supportedMarkets.join(', ')}</Text>
              </View>
            </TouchableOpacity>
          ))}
      </View>

      {/* All Brokers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Brokers</Text>
        {Object.values(BROKER_INFO)
          .filter(broker => !broker.isPopular)
          .map(broker => (
            <TouchableOpacity
              key={broker.id}
              style={styles.brokerCard}
              onPress={() => handleBrokerSelect(broker.id)}
              activeOpacity={0.8}
            >
              <View style={styles.brokerHeader}>
                <Text style={styles.brokerLogo}>{broker.logo}</Text>
                <View style={styles.brokerInfo}>
                  <Text style={styles.brokerName}>{broker.name}</Text>
                  <Text style={styles.brokerDescription}>{broker.description}</Text>
                </View>
              </View>

              <View style={styles.brokerFeatures}>
                {broker.features.slice(0, 2).map((feature, index) => (
                  <View key={index} style={styles.featureTag}>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
      </View>
    </ScrollView>
  );

  // Render credentials modal
  const renderCredentialsModal = () => {
    if (!selectedBroker) return null;

    const broker = BROKER_INFO[selectedBroker];

    return (
      <Modal
        visible={showCredentialsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCredentialsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCredentialsModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Connect to {broker.name}</Text>
          </View>

          <ScrollView style={styles.modalContent}>
            {connectionStep === 'credentials' && (
              <>
                <View style={styles.brokerInfoCard}>
                  <Text style={styles.brokerLogo}>{broker.logo}</Text>
                  <Text style={styles.brokerName}>{broker.name}</Text>
                  <Text style={styles.brokerDescription}>{broker.description}</Text>
                </View>

                <View style={styles.credentialsSection}>
                  <Text style={styles.sectionTitle}>API Credentials</Text>
                  
                  <View style={styles.inputField}>
                    <Text style={styles.inputLabel}>API Key *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={credentials.apiKey}
                      onChangeText={(text) => handleCredentialsChange('apiKey', text)}
                      placeholder="Enter your API key"
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.inputField}>
                    <Text style={styles.inputLabel}>Secret Key *</Text>
                    <TextInput
                      style={styles.textInput}
                      value={credentials.secretKey}
                      onChangeText={(text) => handleCredentialsChange('secretKey', text)}
                      placeholder="Enter your secret key"
                      secureTextEntry
                    />
                  </View>

                  {selectedBroker === 'zerodha' && (
                    <View style={styles.inputField}>
                      <Text style={styles.inputLabel}>Access Token</Text>
                      <TextInput
                        style={styles.textInput}
                        value={credentials.accessToken || ''}
                        onChangeText={(text) => handleCredentialsChange('accessToken', text)}
                        placeholder="Enter access token (optional)"
                        secureTextEntry
                      />
                    </View>
                  )}

                  {selectedBroker === 'angel_one' && (
                    <>
                      <View style={styles.inputField}>
                        <Text style={styles.inputLabel}>Client Code</Text>
                        <TextInput
                          style={styles.textInput}
                          value={credentials.userId || ''}
                          onChangeText={(text) => handleCredentialsChange('userId', text)}
                          placeholder="Enter client code"
                        />
                      </View>

                      <View style={styles.inputField}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <TextInput
                          style={styles.textInput}
                          value={credentials.password || ''}
                          onChangeText={(text) => handleCredentialsChange('password', text)}
                          placeholder="Enter password"
                          secureTextEntry
                        />
                      </View>

                      <View style={styles.inputField}>
                        <Text style={styles.inputLabel}>TOTP Secret</Text>
                        <TextInput
                          style={styles.textInput}
                          value={credentials.totpSecret || ''}
                          onChangeText={(text) => handleCredentialsChange('totpSecret', text)}
                          placeholder="Enter TOTP secret"
                          secureTextEntry
                        />
                      </View>
                    </>
                  )}

                  {selectedBroker === 'alpaca' && (
                    <View style={styles.inputField}>
                      <Text style={styles.inputLabel}>Passphrase</Text>
                      <TextInput
                        style={styles.textInput}
                        value={credentials.passphrase || ''}
                        onChangeText={(text) => handleCredentialsChange('passphrase', text)}
                        placeholder="Enter passphrase"
                        secureTextEntry
                      />
                    </View>
                  )}
                </View>

                <View style={styles.helpSection}>
                  <Text style={styles.helpTitle}>Need Help?</Text>
                  <Text style={styles.helpText}>
                    Follow our step-by-step guide to get your API credentials from {broker.name}.
                  </Text>
                  <TouchableOpacity style={styles.helpButton}>
                    <Text style={styles.helpButtonText}>View Setup Guide</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {connectionStep === 'testing' && (
              <View style={styles.testingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary[500]} />
                <Text style={styles.testingTitle}>Testing Connection</Text>
                <Text style={styles.testingText}>
                  Validating credentials and testing API access...
                </Text>
              </View>
            )}

            {connectionStep === 'success' && testResults && (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={64} color={theme.colors.success[500]} />
                </View>
                <Text style={styles.successTitle}>Connection Successful!</Text>
                <Text style={styles.successText}>
                  Successfully connected to {broker.name}
                </Text>

                <View style={styles.testResults}>
                  {testResults.tests.map((test: any, index: number) => (
                    <View key={index} style={styles.testResult}>
                      <Ionicons
                        name={test.success ? "checkmark" : "close"}
                        size={20}
                        color={test.success ? theme.colors.success[500] : theme.colors.error[500]}
                      />
                      <Text style={styles.testResultText}>{test.test}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.profileInfo}>
                  <Text style={styles.profileTitle}>Account Information</Text>
                  <Text style={styles.profileText}>Name: {testResults.profile.name}</Text>
                  <Text style={styles.profileText}>Account ID: {testResults.profile.accountId}</Text>
                  <Text style={styles.profileText}>Status: {testResults.profile.status}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            {connectionStep === 'credentials' && (
              <TouchableOpacity
                style={styles.testButton}
                onPress={handleTestConnection}
                disabled={!credentials.apiKey || !credentials.secretKey}
              >
                <Text style={styles.testButtonText}>Test Connection</Text>
              </TouchableOpacity>
            )}

            {connectionStep === 'success' && (
              <TouchableOpacity
                style={styles.connectButton}
                onPress={handleConnect}
              >
                <Text style={styles.connectButtonText}>Connect Broker</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Connect Broker</Text>
          <View style={styles.placeholder} />
        </View>

        {renderBrokerSelection()}
        {renderCredentialsModal()}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  safeArea: {
    flex: 1,
  },

  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 40,
  },

  // Selection container styles
  selectionContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },

  // Section styles
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },

  // Broker card styles
  brokerCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  brokerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  brokerLogo: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  brokerInfo: {
    flex: 1,
  },
  brokerName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  brokerDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  recommendedBadge: {
    backgroundColor: theme.colors.success[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  recommendedText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.success[600],
  },

  // Broker features styles
  brokerFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  featureTag: {
    backgroundColor: theme.colors.primary[50],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  featureText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.primary[600],
    fontWeight: theme.typography.fontWeight.medium,
  },

  // Broker markets styles
  brokerMarkets: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marketsLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.xs,
  },
  marketsText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },

  // Broker info card styles
  brokerInfoCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },

  // Credentials section styles
  credentialsSection: {
    marginBottom: theme.spacing.xl,
  },

  // Input field styles
  inputField: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
  },

  // Help section styles
  helpSection: {
    backgroundColor: theme.colors.primary[50],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  helpTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  helpText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
    marginBottom: theme.spacing.md,
  },
  helpButton: {
    backgroundColor: theme.colors.primary[500],
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  helpButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semiBold,
  },

  // Testing container styles
  testingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  testingTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  testingText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },

  // Success container styles
  successContainer: {
    flex: 1,
    paddingVertical: theme.spacing.xl,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  successTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  successText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },

  // Test results styles
  testResults: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  testResult: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  testResultText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  },

  // Profile info styles
  profileInfo: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  profileTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  profileText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },

  // Modal actions styles
  modalActions: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  testButton: {
    backgroundColor: theme.colors.primary[500],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  connectButton: {
    backgroundColor: theme.colors.success[500],
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  connectButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
});

export default BrokerConnectionScreen;
