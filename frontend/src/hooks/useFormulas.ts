/**
 * Custom Hooks for Formula Management
 * 
 * Provides React hooks for fetching, managing, and interacting with formulas.
 * Includes caching, error handling, and loading states.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { FormulaResponse, FormulaSearchResponse, FormulaFilters } from '../types/api';
import { formulaApiService, FormulaService } from '../services/api/formulas';

// ============================================================================
// USE FORMULAS HOOK
// ============================================================================

export interface UseFormulasParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  filters?: Partial<FormulaFilters>;
  enabled?: boolean;
}

export interface UseFormulasReturn {
  formulas: FormulaResponse[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export const useFormulas = (params: UseFormulasParams = {}): UseFormulasReturn => {
  const {
    page: initialPage = 1,
    per_page = 20,
    search,
    sort_by = 'performance',
    sort_order = 'desc',
    filters = {},
    enabled = true,
  } = params;

  const [formulas, setFormulas] = useState<FormulaResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetchFormulas = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const service: any = (FormulaService as any) || formulaApiService;
      const params: any = {
        page: pageNum,
        perPage: per_page,
        sortBy: sort_by,
        sortOrder: sort_order,
      };
      if (search) params.search = search;
      if (filters && Object.keys(filters).length > 0) {
        if ((filters as any).is_free !== undefined) {
          params.isFree = (filters as any).is_free;
        }
        if ((filters as any).category) {
          params.category = (filters as any).category;
        }
      }
      const response = await service.getFormulas(params);

      const list: FormulaResponse[] = Array.isArray(response?.formulas) ? response.formulas : [];
      const dedupe = (items: FormulaResponse[]) => {
        const seen = new Set<string>();
        const out: FormulaResponse[] = [];
        for (const it of items) {
          if (!seen.has(it.id)) {
            seen.add(it.id);
            out.push(it);
          }
        }
        return out;
      };
      if (append) {
        setFormulas(prev => dedupe([...prev, ...list]));
      } else {
        setFormulas(dedupe(list));
      }

      setTotal(response?.total ?? list.length);
      setPage(response?.page ?? pageNum);
      const next = (response && 'has_next' in (response as any))
        ? Boolean((response as any).has_next)
        : (list.length >= per_page);
      setHasNext(next);
      setHasMore(next);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch formulas';
      setError(errorMessage);
      console.error('Error fetching formulas:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled, per_page, search, sort_by, sort_order, filters]);

  const refetch = useCallback(async () => {
    setPage(1);
    await fetchFormulas(1, false);
  }, [fetchFormulas]);

  const loadMore = useCallback(async () => {
    if (loading) return;
    const nextPage = page + 1;
    await fetchFormulas(nextPage, true);
  }, [loading, page, fetchFormulas]);

  useEffect(() => {
    fetchFormulas(1, false);
  }, [fetchFormulas]);

  return {
    formulas,
    total,
    page,
    per_page,
    has_next: hasNext,
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
  };
};

// ============================================================================
// USE FEATURED FORMULAS HOOK
// ============================================================================

export interface UseFeaturedFormulasReturn {
  formulas: FormulaResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFeaturedFormulas = (limit: number = 10): UseFeaturedFormulasReturn => {
  const [formulas, setFormulas] = useState<FormulaResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeaturedFormulas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const service: any = (FormulaService as any) || formulaApiService;
      const data = await service.getFeaturedFormulas(limit);
      setFormulas(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch featured formulas';
      setError(errorMessage);
      console.error('Error fetching featured formulas:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFeaturedFormulas();
  }, [fetchFeaturedFormulas]);

  return {
    formulas,
    loading,
    error,
    refetch: fetchFeaturedFormulas,
  };
};

// ============================================================================
// USE FORMULA DETAILS HOOK
// ============================================================================

export interface UseFormulaDetailsReturn {
  formula: FormulaResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useFormulaDetails = (formulaId: string | null): UseFormulaDetailsReturn => {
  const [formula, setFormula] = useState<FormulaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFormulaDetails = useCallback(async () => {
    if (!formulaId) return;

    setLoading(true);
    setError(null);

    try {
      const service: any = (FormulaService as any) || formulaApiService;
      const data = await service.getFormulaById(formulaId);
      setFormula(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch formula details';
      setError(errorMessage);
      console.error('Error fetching formula details:', err);
    } finally {
      setLoading(false);
    }
  }, [formulaId]);

  useEffect(() => {
    fetchFormulaDetails();
  }, [fetchFormulaDetails]);

  return {
    formula,
    loading,
    error,
    refetch: fetchFormulaDetails,
  };
};

// ============================================================================
// USE FORMULA SUBSCRIPTION HOOK
// ============================================================================

export interface UseFormulaSubscriptionReturn {
  isSubscribed: boolean;
  loading: boolean;
  error: string | null;
  subscribe: (billingPeriod: 'monthly' | 'yearly') => Promise<void>;
  unsubscribe: () => Promise<void>;
}

export const useFormulaSubscription = (
  formulaId: string,
  userSubscriptions: any[] = []
): UseFormulaSubscriptionReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSubscribed = userSubscriptions.some(
    sub => sub.formula_id === formulaId && sub.status === 'active'
  );

  const subscribe = useCallback(async (billingPeriod: 'monthly' | 'yearly') => {
    setLoading(true);
    setError(null);

    try {
      await formulaApiService.subscribeToFormula(formulaId, billingPeriod);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe to formula';
      setError(errorMessage);
      console.error('Error subscribing to formula:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formulaId]);

  const unsubscribe = useCallback(async () => {
    const subscription = userSubscriptions.find(
      sub => sub.formula_id === formulaId && sub.status === 'active'
    );

    if (!subscription) return;

    setLoading(true);
    setError(null);

    try {
      await formulaApiService.unsubscribeFromFormula(subscription.id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unsubscribe from formula';
      setError(errorMessage);
      console.error('Error unsubscribing from formula:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [formulaId, userSubscriptions]);

  return {
    isSubscribed,
    loading,
    error,
    subscribe,
    unsubscribe,
  };
};

// ============================================================================
// USE FORMULA SEARCH HOOK
// ============================================================================

export interface UseFormulaSearchReturn {
  results: FormulaResponse[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
}

export const useFormulaSearch = (): UseFormulaSearchReturn => {
  const [results, setResults] = useState<FormulaResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await formulaApiService.searchFormulas(query);
      setResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search formulas';
      setError(errorMessage);
      console.error('Error searching formulas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  };
};
