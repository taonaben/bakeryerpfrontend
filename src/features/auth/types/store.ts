import { CacheMetadata } from "@/features/inventory/types/store";
import { User } from "./models";

export interface AuthState {
  // Data
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // UI State
  loading: boolean;
  error: string | null;

  // Cache metadata
  authCache: CacheMetadata;
  
  // Actions
  login: (empCode: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  checkAuth: () => void;
  clearError: () => void;
}