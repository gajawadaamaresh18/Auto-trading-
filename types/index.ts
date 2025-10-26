export interface Formula {
  id: string;
  name: string;
  description: string;
  rating: number;
  totalRatings: number;
  price: number;
  currency: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isVerified: boolean;
  downloads: number;
  profit: number;
  profitPercentage: number;
  imageUrl?: string;
  isTrending: boolean;
  isTopGainer: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SortOption {
  key: string;
  label: string;
  value: 'top_gainers' | 'highest_rating' | 'newest' | 'most_downloaded';
}

export interface FilterOption {
  key: string;
  label: string;
  value: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface MarketplaceState {
  formulas: Formula[];
  loading: LoadingState;
  error: string | null;
  sortBy: SortOption['value'];
  filters: {
    category?: string;
    priceRange?: [number, number];
    rating?: number;
  };
  pagination: {
    page: number;
    hasMore: boolean;
  };
}