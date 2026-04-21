/**
 * API Client - Centralized HTTP Communication
 * Handles all requests to backend with automatic retry, error handling, and token injection
 */

import { config } from '../config/env';
import type { ApiResponse, PaginatedResponse } from '../types/api';

export interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

interface ParsedResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * API Client singleton
 * Manages HTTP requests with JWT token injection and error handling
 */
export class APIClient {
  private baseUrl: string;
  private maxRetries: number;

  constructor(baseUrl: string = config.api.base, maxRetries: number = 3) {
    this.baseUrl = baseUrl;
    this.maxRetries = maxRetries;
  }

  /**
   * Get authentication token from localStorage
   */
  private getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
  }

  /**
   * Core fetch method with retry logic and error handling
   */
  private async fetchWithRetry<T>(
    endpoint: string,
    options: RequestOptions = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Inject JWT token if not skipped
    if (!options.skipAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        window.location.href = '/';
        throw new Error('Unauthorized: Session expired');
      }

      // Parse response
      let data: ParsedResponse<T>;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error('Invalid response format');
      }

      // Check for HTTP errors
      if (!response.ok) {
        const error = data.error || `HTTP ${response.status}`;
        throw new Error(error);
      }

      return data.data || (data as T);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      // Retry logic (skip for auth errors and 4xx client errors)
      if (retryCount < this.maxRetries && !message.includes('401') && !message.includes('40')) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.fetchWithRetry(endpoint, options, retryCount + 1);
      }

      throw new Error(`API Error: ${message}`);
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.fetchWithRetry<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.fetchWithRetry<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.fetchWithRetry<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.fetchWithRetry<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Update base URL (useful for environment changes)
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

/**
 * Default API client instance
 */
export const apiClient = new APIClient();

export default apiClient;
