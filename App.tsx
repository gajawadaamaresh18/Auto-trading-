import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { theme } from './src/utils/theme';
import BasketManager from './src/components/BasketManager';
import BasketDetailScreen from './src/screens/BasketDetailScreen';
import BasketService from './src/services/BasketService';
import SampleDataService from './src/services/SampleDataService';
import { Basket } from './src/types';

type RootStackParamList = {
  Home: undefined;
  BasketDetail: { basketId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize sample stocks first
      await SampleDataService.initializeSampleData();
      
      // Initialize predefined baskets
      await BasketService.createPredefinedBaskets();
      
      // Create sample signals and trades after baskets are created
      await SampleDataService.createSampleSignals([]);
      await SampleDataService.createSampleTrades([]);
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsInitialized(true); // Continue anyway
    }
  };

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Initializing Auto Trading App...</Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Basket Manager',
            }}
          />
          <Stack.Screen
            name="BasketDetail"
            component={BasketDetailScreen}
            options={({ route }) => ({
              title: 'Basket Details',
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

function HomeScreen({ navigation }: any) {
  const handleBasketSelect = (basket: Basket) => {
    navigation.navigate('BasketDetail', { basketId: basket.id });
  };

  const handleNavigateToDetail = (basketId: string) => {
    navigation.navigate('BasketDetail', { basketId });
  };

  return (
    <BasketManager
      onBasketSelect={handleBasketSelect}
      onNavigateToDetail={handleNavigateToDetail}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});