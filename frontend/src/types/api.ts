/**
 * Type Definitions for API
 * 
 * TypeScript interfaces for API requests and responses
 */

export interface FormulaResponse {
  id: string;
  creator_id: string;
  name: string;
  description: string;
  category: string;
  tags?: string;
  formula_code: string;
  parameters?: string;
  version: string;
  is_free: boolean;
  price_per_month?: number;
  price_per_year?: number;
  status: 'draft' | 'published' | 'archived' | 'suspended';
  performance_score?: number;
  risk_score?: number;
  total_subscribers: number;
  total_trades: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface FormulaSearchResponse {
  formulas: FormulaResponse[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
}

export interface FormulaFilters {
  category?: string;
  min_performance_score?: number;
  max_risk_score?: number;
  is_free?: boolean;
  creator_id?: string;
}

export interface SubscriptionResponse {
  id: string;
  user_id: string;
  formula_id: string;
  billing_period: string;
  amount_paid: number;
  currency: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  started_at: string;
  expires_at: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  bio?: string;
  avatar_url?: string;
  risk_tolerance?: string;
  trading_experience?: string;
  role: 'normal' | 'creator' | 'admin';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface TradeResponse {
  id: string;
  user_id: string;
  formula_id: string;
  broker_account_id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  order_type: 'market' | 'limit' | 'stop';
  price?: number;
  stop_price?: number;
  status: 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected';
  filled_quantity: number;
  average_fill_price?: number;
  commission?: number;
  broker_order_id?: string;
  broker_trade_id?: string;
  created_at: string;
  updated_at: string;
  filled_at?: string;
}

export interface BrokerAccountResponse {
  id: string;
  user_id: string;
  broker_type: 'alpaca' | 'interactive_brokers' | 'robinhood';
  account_id: string;
  account_name?: string;
  is_active: boolean;
  is_connected: boolean;
  last_sync_at?: string;
  buying_power?: number;
  cash_balance?: number;
  portfolio_value?: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewResponse {
  id: string;
  reviewer_id: string;
  formula_id: string;
  formula_creator_id: string;
  rating: number;
  title?: string;
  content?: string;
  is_verified_purchase: boolean;
  is_helpful_count: number;
  is_moderated: boolean;
  moderation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationResponse {
  id: string;
  user_id: string;
  type: 'trade_executed' | 'formula_trigger' | 'subscription_expired' | 'review_received' | 'system_alert';
  title: string;
  message: string;
  is_read: boolean;
  is_sent_push: boolean;
  is_sent_email: boolean;
  related_formula_id?: string;
  related_trade_id?: string;
  metadata?: string;
  created_at: string;
  read_at?: string;
}

// Request interfaces
export interface CreateSubscriptionRequest {
  formula_id: string;
  billing_period: 'monthly' | 'yearly';
}

export interface CreateReviewRequest {
  formula_id: string;
  rating: number;
  title?: string;
  content?: string;
}

export interface CreateTradeRequest {
  formula_id: string;
  broker_account_id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  order_type: 'market' | 'limit' | 'stop';
  price?: number;
  stop_price?: number;
}

export interface BrokerConnectRequest {
  broker_type: 'alpaca' | 'interactive_brokers' | 'robinhood';
  account_id: string;
  account_name?: string;
  api_key: string;
  secret_key: string;
  passphrase?: string;
}

// Error response interface
export interface ApiErrorResponse {
  detail: string;
  code?: string;
  field?: string;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Pagination interface
export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Search interface
export interface SearchParams extends PaginationParams {
  search?: string;
  filters?: Record<string, any>;
}
