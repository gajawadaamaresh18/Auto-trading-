import { useState, useEffect, useCallback } from 'react';
import { Formula, MarketplaceState, SortOption, FilterOption } from '../types';
import { mockApiService } from '../services/api';

const SORT_OPTIONS: SortOption[] = [
  { key: 'top_gainers', label: 'Top Gainers', value: 'top_gainers' },
  { key: 'highest_rating', label: 'Highest Rating', value: 'highest_rating' },
  { key: 'newest', label: 'Newest', value: 'newest' },
  { key: 'most_downloaded', label: 'Most Downloaded', value: 'most_downloaded' },
];

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'All Categories', value: '' },
  { key: 'technical', label: 'Technical Analysis', value: 'Technical Analysis' },
  { key: 'momentum', label: 'Momentum', value: 'Momentum' },
  { key: 'volume', label: 'Volume Analysis', value: 'Volume Analysis' },
  { key: 'support', label: 'Support & Resistance', value: 'Support & Resistance' },
  { key: 'volatility', label: 'Volatility', value: 'Volatility' },
];

export const useMarketplace = () => {
  const [state, setState] = useState<MarketplaceState>({
    formulas: [],
    loading: 'idle',
    error: null,
    sortBy: 'top_gainers',
    filters: {},
    pagination: {
      page: 1,
      hasMore: true,
    },
  });

  const [topFormulas, setTopFormulas] = useState<Formula[]>([]);
  const [trendingFormulas, setTrendingFormulas] = useState<Formula[]>([]);

  const fetchFormulas = useCallback(async (reset = false) => {
    try {
      setState(prev => ({
        ...prev,
        loading: reset ? 'loading' : prev.loading,
        error: null,
      }));

      const page = reset ? 1 : state.pagination.page;
      const response = await mockApiService.getFormulas({
        page,
        limit: 20,
        sortBy: state.sortBy,
        category: state.filters.category,
        minRating: state.filters.rating,
        maxPrice: state.filters.priceRange?.[1],
      });

      if (response.success) {
        setState(prev => ({
          ...prev,
          formulas: reset ? response.data : [...prev.formulas, ...response.data],
          loading: 'success',
          pagination: {
            page: response.pagination?.page || page,
            hasMore: (response.pagination?.page || page) < (response.pagination?.totalPages || 1),
          },
        }));
      } else {
        throw new Error(response.message || 'Failed to fetch formulas');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: 'error',
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }));
    }
  }, [state.sortBy, state.filters, state.pagination.page]);

  const fetchTopFormulas = useCallback(async () => {
    try {
      const response = await mockApiService.getTopFormulas(5);
      if (response.success) {
        setTopFormulas(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch top formulas:', error);
    }
  }, []);

  const fetchTrendingFormulas = useCallback(async () => {
    try {
      const response = await mockApiService.getTrendingFormulas(5);
      if (response.success) {
        setTrendingFormulas(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch trending formulas:', error);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (state.pagination.hasMore && state.loading !== 'loading') {
      setState(prev => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          page: prev.pagination.page + 1,
        },
      }));
    }
  }, [state.pagination.hasMore, state.loading]);

  const setSortBy = useCallback((sortBy: SortOption['value']) => {
    setState(prev => ({
      ...prev,
      sortBy,
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  const setFilters = useCallback((filters: Partial<MarketplaceState['filters']>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  const refresh = useCallback(() => {
    fetchFormulas(true);
    fetchTopFormulas();
    fetchTrendingFormulas();
  }, [fetchFormulas, fetchTopFormulas, fetchTrendingFormulas]);

  // Initial load
  useEffect(() => {
    refresh();
  }, []);

  // Fetch formulas when sort or filters change
  useEffect(() => {
    if (state.loading !== 'idle') {
      fetchFormulas(true);
    }
  }, [state.sortBy, state.filters]);

  // Load more when page changes
  useEffect(() => {
    if (state.pagination.page > 1) {
      fetchFormulas(false);
    }
  }, [state.pagination.page]);

  return {
    // State
    formulas: state.formulas,
    topFormulas,
    trendingFormulas,
    loading: state.loading,
    error: state.error,
    sortBy: state.sortBy,
    filters: state.filters,
    hasMore: state.pagination.hasMore,
    
    // Options
    sortOptions: SORT_OPTIONS,
    filterOptions: FILTER_OPTIONS,
    
    // Actions
    setSortBy,
    setFilters,
    loadMore,
    refresh,
  };
};