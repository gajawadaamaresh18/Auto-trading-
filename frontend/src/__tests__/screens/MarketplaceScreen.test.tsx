/**
 * Marketplace Screen Tests
 * 
 * Comprehensive integration tests for the Marketplace screen covering
 * data loading, filtering, sorting, navigation, and error handling.
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from 'styled-components/native';

import { MarketplaceScreen } from '../../screens/marketplace/MarketplaceScreen';
import { FormulaService } from '../../services/api/formulas';
import theme from '../../theme';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
};

const mockRoute = {
  params: {},
  key: 'marketplace',
  name: 'Marketplace',
};

// Mock formulas data
const mockFormulas = [
  {
    id: 'formula-1',
    name: 'Momentum Strategy',
    description: 'A momentum-based trading strategy',
    category: 'momentum',
    performanceScore: 85.5,
    riskScore: 65.2,
    totalSubscribers: 1250,
    totalTrades: 3420,
    isFree: false,
    pricePerMonth: 29.99,
    creator: { id: 'user-1', name: 'John Trader' },
    sparklineData: [100, 105, 102, 108, 115, 110, 125, 130, 128, 135],
    averageReturn: 12.5,
    winRate: 68.5,
    createdAt: '2023-01-15T10:30:00Z',
  },
  {
    id: 'formula-2',
    name: 'Mean Reversion',
    description: 'A mean reversion strategy',
    category: 'mean_reversion',
    performanceScore: 78.3,
    riskScore: 45.1,
    totalSubscribers: 890,
    totalTrades: 2100,
    isFree: true,
    pricePerMonth: null,
    creator: { id: 'user-2', name: 'Jane Analyst' },
    sparklineData: [100, 98, 95, 102, 105, 103, 108, 110, 107, 112],
    averageReturn: 8.2,
    winRate: 72.1,
    createdAt: '2023-02-20T14:15:00Z',
  },
];

// Mock FormulaService
jest.mock('../../services/api/formulas');
const mockFormulaService = FormulaService as jest.Mocked<typeof FormulaService>;

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <NavigationContainer>
      {children}
    </NavigationContainer>
  </ThemeProvider>
);

describe('MarketplaceScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFormulaService.getFormulas.mockResolvedValue({
      formulas: mockFormulas,
      total: 2,
      page: 1,
      perPage: 20,
    });
  });

  describe('Data Loading', () => {
    it('loads and displays formulas on mount', async () => {
      const { getByText, getByTestId } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      // Should show loading state initially
      expect(getByTestId('loading-indicator')).toBeTruthy();

      // Wait for data to load
      await waitFor(() => {
        expect(getByText('Momentum Strategy')).toBeTruthy();
        expect(getByText('Mean Reversion')).toBeTruthy();
      });

      expect(mockFormulaService.getFormulas).toHaveBeenCalledWith({
        page: 1,
        perPage: 20,
        sortBy: 'performance',
        sortOrder: 'desc',
      });
    });

    it('handles loading error gracefully', async () => {
      mockFormulaService.getFormulas.mockRejectedValue(new Error('Network error'));

      const { getByText, getByTestId } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText('Failed to load formulas')).toBeTruthy();
        expect(getByTestId('retry-button')).toBeTruthy();
      });
    });

    it('retries loading when retry button is pressed', async () => {
      mockFormulaService.getFormulas
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          formulas: mockFormulas,
          total: 2,
          page: 1,
          perPage: 20,
        });

      const { getByTestId } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('retry-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('retry-button'));

      await waitFor(() => {
        expect(mockFormulaService.getFormulas).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Filtering and Sorting', () => {
    it('filters formulas by category', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('category-filter')).toBeTruthy();
      });

      fireEvent.press(getByTestId('category-filter'));
      fireEvent.press(getByTestId('category-momentum'));

      await waitFor(() => {
        expect(mockFormulaService.getFormulas).toHaveBeenCalledWith({
          page: 1,
          perPage: 20,
          sortBy: 'performance',
          sortOrder: 'desc',
          category: 'momentum',
        });
      });
    });

    it('sorts formulas by different criteria', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('sort-selector')).toBeTruthy();
      });

      fireEvent.press(getByTestId('sort-selector'));
      fireEvent.press(getByTestId('sort-rating'));

      await waitFor(() => {
        expect(mockFormulaService.getFormulas).toHaveBeenCalledWith({
          page: 1,
          perPage: 20,
          sortBy: 'rating',
          sortOrder: 'desc',
        });
      });
    });

    it('searches formulas by name', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('search-input')).toBeTruthy();
      });

      const searchInput = getByTestId('search-input');
      fireEvent.changeText(searchInput, 'momentum');

      await waitFor(() => {
        expect(mockFormulaService.getFormulas).toHaveBeenCalledWith({
          page: 1,
          perPage: 20,
          sortBy: 'performance',
          sortOrder: 'desc',
          search: 'momentum',
        });
      });
    });

    it('filters free vs paid formulas', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('price-filter')).toBeTruthy();
      });

      fireEvent.press(getByTestId('price-filter'));
      fireEvent.press(getByTestId('price-free'));

      await waitFor(() => {
        expect(mockFormulaService.getFormulas).toHaveBeenCalledWith({
          page: 1,
          perPage: 20,
          sortBy: 'performance',
          sortOrder: 'desc',
          isFree: true,
        });
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to formula details when card is pressed', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('formula-card-1')).toBeTruthy();
      });

      fireEvent.press(getByTestId('formula-card-1'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('FormulaDetail', {
        formulaId: 'formula-1',
      });
    });

    it('navigates to creator profile when creator name is pressed', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('creator-name-1')).toBeTruthy();
      });

      fireEvent.press(getByTestId('creator-name-1'));

      expect(mockNavigation.navigate).toHaveBeenCalledWith('CreatorProfile', {
        creatorId: 'user-1',
      });
    });
  });

  describe('Pagination', () => {
    it('loads next page when scrolled to bottom', async () => {
      mockFormulaService.getFormulas.mockResolvedValue({
        formulas: mockFormulas,
        total: 50,
        page: 1,
        perPage: 20,
      });

      const { getByTestId } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('formulas-list')).toBeTruthy();
      });

      const formulasList = getByTestId('formulas-list');
      fireEvent(formulasList, 'onEndReached');

      await waitFor(() => {
        expect(mockFormulaService.getFormulas).toHaveBeenCalledWith({
          page: 2,
          perPage: 20,
          sortBy: 'performance',
          sortOrder: 'desc',
        });
      });
    });

    it('shows loading indicator during pagination', async () => {
      mockFormulaService.getFormulas.mockResolvedValue({
        formulas: mockFormulas,
        total: 50,
        page: 1,
        perPage: 20,
      });

      const { getByTestId } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('formulas-list')).toBeTruthy();
      });

      const formulasList = getByTestId('formulas-list');
      fireEvent(formulasList, 'onEndReached');

      expect(getByTestId('pagination-loading')).toBeTruthy();
    });
  });

  describe('Subscription Actions', () => {
    it('handles subscription success', async () => {
      mockFormulaService.subscribeToFormula.mockResolvedValue({
        id: 'sub-1',
        status: 'active',
        subscribedAt: '2023-01-01T00:00:00Z',
      });

      const { getByTestId } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('subscribe-button-1')).toBeTruthy();
      });

      fireEvent.press(getByTestId('subscribe-button-1'));

      await waitFor(() => {
        expect(mockFormulaService.subscribeToFormula).toHaveBeenCalledWith('formula-1');
      });
    });

    it('handles subscription error', async () => {
      mockFormulaService.subscribeToFormula.mockRejectedValue(new Error('Subscription failed'));

      const { getByTestId, getByText } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('subscribe-button-1')).toBeTruthy();
      });

      fireEvent.press(getByTestId('subscribe-button-1'));

      await waitFor(() => {
        expect(getByText('Failed to subscribe to formula')).toBeTruthy();
      });
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no formulas match filters', async () => {
      mockFormulaService.getFormulas.mockResolvedValue({
        formulas: [],
        total: 0,
        page: 1,
        perPage: 20,
      });

      const { getByText, getByTestId } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByText('No formulas found')).toBeTruthy();
        expect(getByTestId('clear-filters-button')).toBeTruthy();
      });
    });

    it('clears filters when clear filters button is pressed', async () => {
      mockFormulaService.getFormulas.mockResolvedValue({
        formulas: [],
        total: 0,
        page: 1,
        perPage: 20,
      });

      const { getByTestId } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('clear-filters-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('clear-filters-button'));

      await waitFor(() => {
        expect(mockFormulaService.getFormulas).toHaveBeenCalledWith({
          page: 1,
          perPage: 20,
          sortBy: 'performance',
          sortOrder: 'desc',
        });
      });
    });
  });

  describe('Performance', () => {
    it('debounces search input', async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByTestId('search-input')).toBeTruthy();
      });

      const searchInput = getByTestId('search-input');
      
      // Rapid typing
      fireEvent.changeText(searchInput, 'm');
      fireEvent.changeText(searchInput, 'mo');
      fireEvent.changeText(searchInput, 'mom');
      fireEvent.changeText(searchInput, 'momentum');

      // Should only call API once after debounce
      await waitFor(() => {
        expect(mockFormulaService.getFormulas).toHaveBeenCalledTimes(2); // Initial load + debounced search
      });
    });

    it('caches formulas data', async () => {
      const { rerender } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockFormulaService.getFormulas).toHaveBeenCalledTimes(1);
      });

      // Re-render with same props
      rerender(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      // Should not call API again due to caching
      expect(mockFormulaService.getFormulas).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', async () => {
      const { getByLabelText } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(getByLabelText('Search formulas')).toBeTruthy();
        expect(getByLabelText('Filter by category')).toBeTruthy();
        expect(getByLabelText('Sort formulas')).toBeTruthy();
      });
    });

    it('announces loading states to screen readers', async () => {
      const { getByLabelText } = render(
        <TestWrapper>
          <MarketplaceScreen navigation={mockNavigation} route={mockRoute} />
        </TestWrapper>
      );

      expect(getByLabelText('Loading formulas')).toBeTruthy();
    });
  });
});
