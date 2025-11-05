/**
 * Frontend Test Setup
 * 
 * Global test setup for React Native testing with mocks and utilities.
 */

import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Silence Animated warning
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
  FontAwesome: 'FontAwesome',
}));

// Mock expo-blur
jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}), { virtual: true });

// Mock slider
jest.mock('@react-native-community/slider', () => 'Slider', { virtual: true });

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-svg
jest.mock('react-native-svg', () => ({
  Svg: 'Svg',
  Circle: 'Circle',
  Path: 'Path',
  G: 'G',
  Text: 'Text',
}));

// Mock styled-components/native ThemeProvider properly
// Use actual implementation but ensure it works in test environment
jest.mock('styled-components/native', () => {
  const actual = jest.requireActual('styled-components/native');
  // ThemeProvider needs to work with styled-components' internal theme system
  // Keep the actual implementation but ensure it works in tests
  return actual;
});

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({ width: 375, height: 812 })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Provide a unified mock for react-native that ensures Dimensions.get works
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Dimensions: {
      get: () => ({ width: 375, height: 812 }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  };
});

// Mock PixelRatio
jest.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
  get: jest.fn(() => 2),
  roundToNearestPixel: jest.fn((n: number) => n),
}));

// Mock StyleSheet to avoid accessing PixelRatio in RN internals
jest.mock('react-native/Libraries/StyleSheet/StyleSheet', () => {
  return {
    create: (styles: any) => styles,
    flatten: (styles: any) => styles,
    compose: (a: any, b: any) => ({ ...(a || {}), ...(b || {}) }),
    hairlineWidth: 1,
  };
});

// Mock NativeEventEmitter base to avoid warnings
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  class MockNativeEventEmitter {
    addListener() { return { remove: () => {} }; }
    removeListener() {}
    removeAllListeners() {}
  }
  return MockNativeEventEmitter;
});

// Mock Settings to avoid TurboModule issues
jest.mock('react-native/Libraries/Settings/Settings', () => ({
  get: jest.fn(() => ({})),
  set: jest.fn(),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Global test utilities
global.mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
};

global.mockRoute = {
  params: {},
  key: 'test-key',
  name: 'TestScreen',
};

// Mock theme
global.mockTheme = {
  colors: {
    primary: { 500: '#007AFF', 600: '#0056CC' },
    success: { 500: '#34C759', 600: '#28A745' },
    error: { 500: '#FF3B30', 600: '#DC3545' },
    warning: { 500: '#FF9500', 600: '#E67E22' },
    text: { primary: '#000000', secondary: '#666666' },
    background: { primary: '#FFFFFF', card: '#F8F9FA' },
    border: { light: '#E5E5E7' },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  typography: {
    fontSize: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20 },
    fontWeight: { normal: '400', medium: '500', semiBold: '600', bold: '700' },
  },
  borderRadius: { sm: 4, md: 8, lg: 12 },
  shadows: { sm: {}, md: {} },
};

// Console error suppression for tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
