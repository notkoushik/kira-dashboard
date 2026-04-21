/**
 * Authentication Service
 * Handles login, registration, token management, and user profile
 */

import { apiClient } from './api';
import { stateManager, eventBus } from './state';
import { monitor } from './monitor';
import type { User } from '../types/domain';
import type { LoginRequest, RegisterRequest, ProfileUpdateRequest, AuthResponse } from '../types/api';

export class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  /**
   * Register new user
   */
  async register(request: RegisterRequest): Promise<AuthResponse> {
    const wrapped = monitor.wrap(async () => {
      const response = await apiClient.post<AuthResponse>('/auth/register', request, {
        skipAuth: true,
      });

      this.setToken(response.token);
      this.setUser(response.user);
      stateManager.setState('user', response.user);
      eventBus.emit('user:login', { user: response.user });

      return response;
    }, 'register');

    return wrapped();
  }

  /**
   * Login with email and password
   */
  async login(request: LoginRequest): Promise<AuthResponse> {
    const wrapped = monitor.wrap(async () => {
      const response = await apiClient.post<AuthResponse>('/auth/login', request, {
        skipAuth: true,
      });

      this.setToken(response.token);
      this.setUser(response.user);
      stateManager.setState('user', response.user);
      eventBus.emit('user:login', { user: response.user });

      return response;
    }, 'login');

    return wrapped();
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await apiClient.get<User>('/auth/me');
      stateManager.setState('user', user);
      return user;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(request: ProfileUpdateRequest): Promise<User> {
    const wrapped = monitor.wrap(async () => {
      const user = await apiClient.patch<User>('/auth/profile', request);
      this.setUser(user);
      stateManager.setState('user', user);
      eventBus.emit('user:updated', { user });
      return user;
    }, 'updateProfile');

    return wrapped();
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    const wrapped = monitor.wrap(async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        // Continue with logout even if API call fails
        monitor.warn('Logout API call failed', { operation: 'logout' });
      }

      this.clearAuth();
      stateManager.setState('user', null);
      eventBus.emit('user:logout');
      window.location.href = '/';
    }, 'logout');

    return wrapped();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Set authentication token
   */
  private setToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  /**
   * Get stored user data
   */
  getUser(): User | null {
    if (typeof localStorage === 'undefined') return null;
    const userJson = localStorage.getItem(this.userKey);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }

  /**
   * Set user data
   */
  private setUser(user: User): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  /**
   * Restore session from localStorage
   */
  async restoreSession(): Promise<User | null> {
    const user = this.getUser();
    if (!user) return null;

    try {
      const currentUser = await this.getCurrentUser();
      return currentUser;
    } catch (error) {
      this.clearAuth();
      return null;
    }
  }
}

/**
 * Global auth service instance
 */
export const authService = new AuthService();

export default authService;
