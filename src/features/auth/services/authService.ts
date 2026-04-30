import apiClient from '@/shared/services/api';
import type { LoginRequest, LoginResponse, TokenRefreshResponse, User } from '../types/models';

/**
 * AUTH SERVICE
 * 
 * Handles all authentication-related API calls and token management.
 * This is the single source of truth for auth operations.
 * 
 * Security Features:
 * - Tokens stored in memory (not localStorage)
 * - Automatic token refresh
 * - Request interceptors for auth headers
 * - Centralized error handling
 */

// In-memory token storage (more secure than localStorage against XSS)
let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

export const authService = {
  /**
   * Login user with employee code and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      '/account/login',
      credentials
    );

    // Store tokens in memory
    inMemoryAccessToken = response.data.access;
    inMemoryRefreshToken = response.data.refresh;

    // Also store tokens in sessionStorage for api client interceptor
    sessionStorage.setItem('accessToken', response.data.access);
    sessionStorage.setItem('refreshToken', response.data.refresh);

    return response.data;
  },

  /**
   * Logout user - Clear all tokens
   */
  logout(): void {
    inMemoryAccessToken = null;
    inMemoryRefreshToken = null;
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken'); // Clean up old implementation
    localStorage.removeItem('refreshToken'); // Clean up old implementation
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<string> {
    const refreshToken =
      inMemoryRefreshToken ||
      sessionStorage.getItem('refreshToken') ||
      localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiClient.post<TokenRefreshResponse>(
        '/api/token/refresh/',
        { refresh: refreshToken }
      );

      inMemoryAccessToken = response.data.access;
      sessionStorage.setItem('accessToken', response.data.access);
      return response.data.access;
    } catch (error) {
      // If refresh fails, user needs to login again
      this.logout();
      throw new Error('Session expired. Please login again.');
    }
  },

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    const storedToken =
      inMemoryAccessToken ||
      sessionStorage.getItem('accessToken') ||
      localStorage.getItem('accessToken');

    if (storedToken && storedToken !== inMemoryAccessToken) {
      inMemoryAccessToken = storedToken;
    }

    return storedToken;
  },

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    const storedToken =
      inMemoryRefreshToken ||
      sessionStorage.getItem('refreshToken') ||
      localStorage.getItem('refreshToken');

    if (storedToken && storedToken !== inMemoryRefreshToken) {
      inMemoryRefreshToken = storedToken;
    }

    return storedToken;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/account/users/me');
    return response.data;
  },

  /**
   * Validate employee code format
   */
  validateEmpCode(empCode: string): boolean {
    const codeRegex = /^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/;
    return codeRegex.test(empCode);
  },
};

// Export token getter for API client interceptor
export const getAuthToken = () => authService.getAccessToken();
