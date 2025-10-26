import { Formula, ApiResponse } from '../types';

const API_BASE_URL = 'https://api.marketplace.com/v1';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw new Error(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    }
  }

  async getFormulas(params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    category?: string;
    minRating?: number;
    maxPrice?: number;
  } = {}): Promise<ApiResponse<Formula[]>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.category) queryParams.append('category', params.category);
    if (params.minRating) queryParams.append('minRating', params.minRating.toString());
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());

    const endpoint = `/formulas?${queryParams.toString()}`;
    return this.request<Formula[]>(endpoint);
  }

  async getFormulaById(id: string): Promise<ApiResponse<Formula>> {
    return this.request<Formula>(`/formulas/${id}`);
  }

  async getTopFormulas(limit: number = 10): Promise<ApiResponse<Formula[]>> {
    return this.request<Formula[]>(`/formulas/top?limit=${limit}`);
  }

  async getTrendingFormulas(limit: number = 10): Promise<ApiResponse<Formula[]>> {
    return this.request<Formula[]>(`/formulas/trending?limit=${limit}`);
  }
}

// Mock data for development
export const mockFormulas: Formula[] = [
  {
    id: '1',
    name: 'Golden Cross Strategy',
    description: 'Advanced moving average crossover strategy with high success rate',
    rating: 4.8,
    totalRatings: 1247,
    price: 99.99,
    currency: 'USD',
    author: {
      id: 'author1',
      name: 'John Trader',
      avatar: 'https://via.placeholder.com/40',
    },
    category: 'Technical Analysis',
    tags: ['moving-average', 'crossover', 'trend-following'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:22:00Z',
    isVerified: true,
    downloads: 15420,
    profit: 12500,
    profitPercentage: 12.5,
    imageUrl: 'https://via.placeholder.com/300x200',
    isTrending: true,
    isTopGainer: true,
  },
  {
    id: '2',
    name: 'RSI Divergence Master',
    description: 'Spot RSI divergences for optimal entry and exit points',
    rating: 4.6,
    totalRatings: 892,
    price: 79.99,
    currency: 'USD',
    author: {
      id: 'author2',
      name: 'Sarah Analytics',
      avatar: 'https://via.placeholder.com/40',
    },
    category: 'Momentum',
    tags: ['rsi', 'divergence', 'momentum'],
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    isVerified: true,
    downloads: 9876,
    profit: 8900,
    profitPercentage: 8.9,
    imageUrl: 'https://via.placeholder.com/300x200',
    isTrending: false,
    isTopGainer: false,
  },
  {
    id: '3',
    name: 'Volume Breakout Pro',
    description: 'Identify high-probability volume breakouts with precision',
    rating: 4.9,
    totalRatings: 2103,
    price: 149.99,
    currency: 'USD',
    author: {
      id: 'author3',
      name: 'Mike Volume',
      avatar: 'https://via.placeholder.com/40',
    },
    category: 'Volume Analysis',
    tags: ['volume', 'breakout', 'high-probability'],
    createdAt: '2024-01-05T11:20:00Z',
    updatedAt: '2024-01-22T08:30:00Z',
    isVerified: true,
    downloads: 22340,
    profit: 18750,
    profitPercentage: 18.75,
    imageUrl: 'https://via.placeholder.com/300x200',
    isTrending: true,
    isTopGainer: true,
  },
  {
    id: '4',
    name: 'Fibonacci Retracement Expert',
    description: 'Master Fibonacci levels for support and resistance trading',
    rating: 4.4,
    totalRatings: 567,
    price: 59.99,
    currency: 'USD',
    author: {
      id: 'author4',
      name: 'Fibonacci Pro',
      avatar: 'https://via.placeholder.com/40',
    },
    category: 'Support & Resistance',
    tags: ['fibonacci', 'retracement', 'support-resistance'],
    createdAt: '2024-01-12T14:10:00Z',
    updatedAt: '2024-01-19T12:15:00Z',
    isVerified: false,
    downloads: 4321,
    profit: 3200,
    profitPercentage: 3.2,
    imageUrl: 'https://via.placeholder.com/300x200',
    isTrending: false,
    isTopGainer: false,
  },
  {
    id: '5',
    name: 'Bollinger Squeeze Strategy',
    description: 'Capitalize on volatility contractions before major moves',
    rating: 4.7,
    totalRatings: 1456,
    price: 89.99,
    currency: 'USD',
    author: {
      id: 'author5',
      name: 'Volatility King',
      avatar: 'https://via.placeholder.com/40',
    },
    category: 'Volatility',
    tags: ['bollinger-bands', 'squeeze', 'volatility'],
    createdAt: '2024-01-08T16:45:00Z',
    updatedAt: '2024-01-21T10:20:00Z',
    isVerified: true,
    downloads: 12340,
    profit: 11200,
    profitPercentage: 11.2,
    imageUrl: 'https://via.placeholder.com/300x200',
    isTrending: true,
    isTopGainer: false,
  },
];

export const apiService = new ApiService();

// Mock implementation for development
export const mockApiService = {
  async getFormulas(params: any = {}): Promise<ApiResponse<Formula[]>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let filteredFormulas = [...mockFormulas];
    
    // Apply sorting
    if (params.sortBy) {
      switch (params.sortBy) {
        case 'top_gainers':
          filteredFormulas.sort((a, b) => b.profitPercentage - a.profitPercentage);
          break;
        case 'highest_rating':
          filteredFormulas.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filteredFormulas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'most_downloaded':
          filteredFormulas.sort((a, b) => b.downloads - a.downloads);
          break;
      }
    }
    
    // Apply filters
    if (params.category) {
      filteredFormulas = filteredFormulas.filter(f => f.category === params.category);
    }
    if (params.minRating) {
      filteredFormulas = filteredFormulas.filter(f => f.rating >= params.minRating);
    }
    if (params.maxPrice) {
      filteredFormulas = filteredFormulas.filter(f => f.price <= params.maxPrice);
    }
    
    return {
      data: filteredFormulas,
      success: true,
      pagination: {
        page: params.page || 1,
        limit: params.limit || 20,
        total: filteredFormulas.length,
        totalPages: Math.ceil(filteredFormulas.length / (params.limit || 20)),
      },
    };
  },

  async getTopFormulas(limit: number = 10): Promise<ApiResponse<Formula[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const topFormulas = mockFormulas
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
    
    return {
      data: topFormulas,
      success: true,
    };
  },

  async getTrendingFormulas(limit: number = 10): Promise<ApiResponse<Formula[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const trendingFormulas = mockFormulas
      .filter(f => f.isTrending)
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit);
    
    return {
      data: trendingFormulas,
      success: true,
    };
  },
};