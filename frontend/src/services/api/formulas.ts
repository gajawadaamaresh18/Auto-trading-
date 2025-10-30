/**
 * Formula API Service
 * 
 * Handles all API calls related to formulas including fetching,
 * filtering, sorting, and subscription management.
 */

import { FormulaResponse, FormulaSearchResponse, FormulaFilters } from '../types/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class FormulaApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set authentication token for API requests
   */
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Fetch formulas with filtering, sorting, and pagination
   */
  async getFormulas(params: {
    page?: number;
    per_page?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    filters?: Partial<FormulaFilters>;
  } = {}): Promise<FormulaSearchResponse> {
    const {
      page = 1,
      per_page = 20,
      search,
      sort_by = 'created_at',
      sort_order = 'desc',
      filters = {},
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: per_page.toString(),
      sort_by,
      sort_order,
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>),
    });

    if (search) {
      queryParams.append('search', search);
    }

    try {
      const response = await fetch(`${this.baseUrl}/formulas?${queryParams}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching formulas:', error);
      throw new Error('Failed to fetch formulas');
    }
  }

  /**
   * Get featured/top formulas
   */
  async getFeaturedFormulas(limit: number = 10): Promise<FormulaResponse[]> {
    try {
      const response = await this.getFormulas({
        per_page: limit,
        sort_by: 'performance_score',
        sort_order: 'desc',
        filters: { min_performance_score: 70 },
      });

      return response.formulas;
    } catch (error) {
      console.error('Error fetching featured formulas:', error);
      throw new Error('Failed to fetch featured formulas');
    }
  }

  /**
   * Get top gainers (formulas with highest recent performance)
   */
  async getTopGainers(limit: number = 10): Promise<FormulaResponse[]> {
    try {
      const response = await this.getFormulas({
        per_page: limit,
        sort_by: 'performance_score',
        sort_order: 'desc',
      });

      return response.formulas;
    } catch (error) {
      console.error('Error fetching top gainers:', error);
      throw new Error('Failed to fetch top gainers');
    }
  }

  /**
   * Get highest rated formulas
   */
  async getHighestRated(limit: number = 10): Promise<FormulaResponse[]> {
    try {
      const response = await this.getFormulas({
        per_page: limit,
        sort_by: 'total_subscribers',
        sort_order: 'desc',
      });

      return response.formulas;
    } catch (error) {
      console.error('Error fetching highest rated formulas:', error);
      throw new Error('Failed to fetch highest rated formulas');
    }
  }

  /**
   * Get newest formulas
   */
  async getNewestFormulas(limit: number = 10): Promise<FormulaResponse[]> {
    try {
      const response = await this.getFormulas({
        per_page: limit,
        sort_by: 'created_at',
        sort_order: 'desc',
      });

      return response.formulas;
    } catch (error) {
      console.error('Error fetching newest formulas:', error);
      throw new Error('Failed to fetch newest formulas');
    }
  }

  /**
   * Get formula details by ID
   */
  async getFormulaById(id: string): Promise<FormulaResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/formulas/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching formula details:', error);
      throw new Error('Failed to fetch formula details');
    }
  }

  /**
   * Subscribe to a formula
   */
  async subscribeToFormula(formulaId: string, billingPeriod: 'monthly' | 'yearly'): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          formula_id: formulaId,
          billing_period: billingPeriod,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error subscribing to formula:', error);
      throw new Error('Failed to subscribe to formula');
    }
  }

  /**
   * Unsubscribe from a formula
   */
  async unsubscribeFromFormula(subscriptionId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error unsubscribing from formula:', error);
      throw new Error('Failed to unsubscribe from formula');
    }
  }

  /**
   * Search formulas by query
   */
  async searchFormulas(query: string, limit: number = 20): Promise<FormulaResponse[]> {
    try {
      const response = await this.getFormulas({
        search: query,
        per_page: limit,
      });

      return response.formulas;
    } catch (error) {
      console.error('Error searching formulas:', error);
      throw new Error('Failed to search formulas');
    }
  }
}

// Create singleton instance
export const formulaApiService = new FormulaApiService();

// Backwards-compatible named export used by tests
export const FormulaService = {
  getFormulas: (...args: any[]) => formulaApiService.getFormulas(...(args as [any])),
  getFeaturedFormulas: (...args: any[]) => formulaApiService.getFeaturedFormulas(...(args as [any])),
  getTopGainers: (...args: any[]) => formulaApiService.getTopGainers(...(args as [any])),
  getHighestRated: (...args: any[]) => formulaApiService.getHighestRated(...(args as [any])),
  getNewestFormulas: (...args: any[]) => formulaApiService.getNewestFormulas(...(args as [any])),
  getFormulaById: (...args: any[]) => formulaApiService.getFormulaById(...(args as [any])),
  subscribeToFormula: (...args: any[]) => formulaApiService.subscribeToFormula(...(args as [any])),
  unsubscribeFromFormula: (...args: any[]) => formulaApiService.unsubscribeFromFormula(...(args as [any])),
  searchFormulas: (...args: any[]) => formulaApiService.searchFormulas(...(args as [any])),
};

export default FormulaApiService;
