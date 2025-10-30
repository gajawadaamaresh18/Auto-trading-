/**
 * Navigation Types
 * 
 * TypeScript definitions for React Navigation
 */

export type RootStackParamList = {
  Marketplace: undefined;
  FormulaDetail: { formulaId: string };
  Profile: undefined;
  Settings: undefined;
  BrokerManagement: undefined;
  Portfolio: undefined;
  Notifications: undefined;
  Login: undefined;
  Register: undefined;
};

export type TabParamList = {
  Marketplace: undefined;
  Portfolio: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type DrawerParamList = {
  Main: undefined;
  Settings: undefined;
  Help: undefined;
  About: undefined;
};

// Navigation prop types
export type MarketplaceScreenNavigationProp = import('@react-navigation/stack').StackNavigationProp<RootStackParamList, 'Marketplace'>;
export type FormulaDetailScreenNavigationProp = import('@react-navigation/stack').StackNavigationProp<RootStackParamList, 'FormulaDetail'>;
export type ProfileScreenNavigationProp = import('@react-navigation/stack').StackNavigationProp<RootStackParamList, 'Profile'>;

// Route prop types
export type MarketplaceScreenRouteProp = import('@react-navigation/stack').StackScreenProps<RootStackParamList, 'Marketplace'>['route'];
export type FormulaDetailScreenRouteProp = import('@react-navigation/stack').StackScreenProps<RootStackParamList, 'FormulaDetail'>['route'];
export type ProfileScreenRouteProp = import('@react-navigation/stack').StackScreenProps<RootStackParamList, 'Profile'>['route'];

// Screen props types
export type MarketplaceScreenProps = {
  navigation: MarketplaceScreenNavigationProp;
  route: MarketplaceScreenRouteProp;
};

export type FormulaDetailScreenProps = {
  navigation: FormulaDetailScreenNavigationProp;
  route: FormulaDetailScreenRouteProp;
};

export type ProfileScreenProps = {
  navigation: ProfileScreenNavigationProp;
  route: ProfileScreenRouteProp;
};
