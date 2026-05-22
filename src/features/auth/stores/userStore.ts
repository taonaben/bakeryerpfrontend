import { create } from "zustand";
import { AuthState } from "../types/store";
import { authService } from "../services/authService";

/**
 * USER STORE (Zustand)
 * 
 * Central state management for authentication.
 * Similar to Flutter's AuthProvider or ChangeNotifier.
 * 
 * Features:
 * - Login/Logout
 * - Token refresh
 * - Persistent auth state
 * - Error handling
 */

export const useUserStore = create<AuthState>((set, get) => ({
  // Initial State
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  authCache: {
    lastFetched: null,
    isStale: false,
    isFetching: false,
  },

  /**
   * Login Action
   */
  login: async (empCode: string, password: string) => {
    const normalizedEmpCode = empCode.toUpperCase();

    // Validate format first
    if (!authService.validateEmpCode(normalizedEmpCode)) {
      set({ error: "Format error: Employee Code must be 'XXX-XXX'" });
      return;
    }

    set({ loading: true, error: null });

    try {
      const response = await authService.login({ emp_code: normalizedEmpCode, password });

      let userProfile = response.user;
      try {
        userProfile = await authService.getCurrentUser();
      } catch (profileError) {
        // Fallback to login response user if profile fetch fails
      }

      set({
        user: userProfile,
        accessToken: response.access,
        refreshToken: response.refresh,
        isAuthenticated: true,
        loading: false,
        authCache: {
          lastFetched: Date.now(),
          isStale: false,
          isFetching: false,
        },
      });
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.detail || 
        error.response?.data?.message ||
        error.message ||
        'Login failed. Please try again.';

      set({
        error: errorMessage,
        loading: false,
        isAuthenticated: false,
      });
      throw error; // Re-throw for component handling
    }
  },

  /**
   * Logout Action
   */
  logout: () => {
    authService.logout();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null,
      authCache: {
        lastFetched: null,
        isStale: false,
        isFetching: false,
      },
    });
  },

  /**
   * Refresh Access Token
   */
  refreshAccessToken: async () => {
    try {
      const newAccessToken = await authService.refreshToken();
      set({ accessToken: newAccessToken });
    } catch (error) {
      // If refresh fails, logout user
      get().logout();
      throw error;
    }
  },

  /**
   * Check if user is still authenticated (on app load)
   */
  checkAuth: () => {
    const isAuth = authService.isAuthenticated();
    if (isAuth) {
      // Optionally fetch user profile here
      set({ isAuthenticated: true });
    } else {
      set({ isAuthenticated: false });
    }
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));
