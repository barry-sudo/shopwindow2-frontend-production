// src/services/api.ts
// Complete API service layer for Shop Window frontend
// Handles authentication, data fetching, and error handling

import { ShoppingCenter, Tenant, CreateShoppingCenterData, CreateTenantData } from '../types/api';

// =============================================================================
// API CONFIGURATION
// =============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://shopwindow2-backend-production.onrender.com/api';

// API client class to handle all backend communication
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokenFromStorage();
  }

  // =============================================================================
  // AUTHENTICATION METHODS
  // =============================================================================

  private loadTokenFromStorage(): void {
    this.token = localStorage.getItem('access_token');
  }

  private saveTokenToStorage(token: string): void {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  private clearTokenFromStorage(): void {
    this.token = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  public async login(username: string, password: string): Promise<{ access: string; refresh: string }> {
    const response = await this.makeRequest('/auth/jwt/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError('Login failed', response.status, errorData);
    }

    const tokens = await response.json();
    this.saveTokenToStorage(tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    
    return tokens;
  }

  public logout(): void {
    this.clearTokenFromStorage();
  }

  public isAuthenticated(): boolean {
    return this.token !== null && !this.isTokenExpired();
  }

  private isTokenExpired(): boolean {
    if (!this.token) return true;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  // =============================================================================
  // HTTP REQUEST METHODS
  // =============================================================================

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if authenticated
    if (this.token && this.isAuthenticated()) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 errors by attempting to refresh token
      if (response.status === 401 && this.token) {
        const refreshed = await this.attemptTokenRefresh();
        if (refreshed) {
          // Retry the original request with new token
          headers.Authorization = `Bearer ${this.token}`;
          return await fetch(url, { ...config, headers });
        } else {
          this.clearTokenFromStorage();
          throw new ApiError('Authentication failed', 401, { detail: 'Token expired' });
        }
      }

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 0, { detail: 'Failed to connect to server' });
    }
  }

  private async attemptTokenRefresh(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/jwt/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const tokens = await response.json();
        this.saveTokenToStorage(tokens.access);
        return true;
      }
    } catch {
      // Refresh failed, user needs to log in again
    }

    return false;
  }

  // =============================================================================
  // SHOPPING CENTER API METHODS
  // =============================================================================

  public async getShoppingCenters(params: {
    page?: number;
    page_size?: number;
    search?: string;
    city?: string;
    state?: string;
    center_type?: string;
  } = {}): Promise<PaginatedResponse<ShoppingCenter>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const endpoint = `/properties/shopping-centers/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await this.makeRequest(endpoint);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError('Failed to fetch shopping centers', response.status, errorData);
    }

    return await response.json();
  }

  public async getShoppingCenter(id: number): Promise<ShoppingCenter> {
    const response = await this.makeRequest(`/properties/shopping-centers/${id}/`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError('Shopping center not found', 404, { detail: 'Shopping center does not exist' });
      }
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError('Failed to fetch shopping center', response.status, errorData);
    }

    return await response.json();
  }

  public async createShoppingCenter(data: CreateShoppingCenterData): Promise<ShoppingCenter> {
    const response = await this.makeRequest('/properties/shopping-centers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError('Failed to create shopping center', response.status, errorData);
    }

    return await response.json();
  }

  public async updateShoppingCenter(id: number, data: Partial<CreateShoppingCenterData>): Promise<ShoppingCenter> {
    const response = await this.makeRequest(`/properties/shopping-centers/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError('Failed to update shopping center', response.status, errorData);
    }

    return await response.json();
  }

  // =============================================================================
  // DATA ANALYSIS METHODS
  // =============================================================================

  public async getDataQualityMetrics(): Promise<DataQualityMetrics> {
    const response = await this.makeRequest('/properties/shopping-centers/data_quality/');

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError('Failed to fetch data quality metrics', response.status, errorData);
    }

    return await response.json();
  }

  // =============================================================================
  // HEALTH CHECK METHOD
  // =============================================================================

  public async healthCheck(): Promise<HealthStatus> {
    const response = await this.makeRequest('/health/');
    
    if (!response.ok) {
      throw new ApiError('Health check failed', response.status, {});
    }

    return await response.json();
  }
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  public isNetworkError(): boolean {
    return this.status === 0;
  }

  public isAuthenticationError(): boolean {
    return this.status === 401;
  }

  public isPermissionError(): boolean {
    return this.status === 403;
  }

  public isNotFoundError(): boolean {
    return this.status === 404;
  }

  public isValidationError(): boolean {
    return this.status === 400;
  }

  public getErrorMessage(): string {
    if (this.data && this.data.detail) {
      return this.data.detail;
    }
    if (this.data && typeof this.data === 'string') {
      return this.data;
    }
    return this.message;
  }
}

// =============================================================================
// TYPE DEFINITIONS FOR API RESPONSES
// =============================================================================

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface DataQualityMetrics {
  total_centers: number;
  data_completeness: {
    complete_addresses: {
      count: number;
      percentage: number;
    };
    has_gla_data: {
      count: number;
      percentage: number;
    };
    has_tenant_data: {
      count: number;
      percentage: number;
    };
    has_coordinates: {
      count: number;
      percentage: number;
    };
  };
}

interface HealthStatus {
  status: string;
  database: string;
  postgis: string;
  timestamp: string;
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export the class for testing purposes
export { ApiClient };