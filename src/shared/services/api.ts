import axios, { InternalAxiosRequestConfig } from 'axios';


declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      retryCount: number;
    };
  }
}

/**
 * API CLIENT
 * 
 * Centralized Axios instance with:
 * - Automatic token injection
 * - Automatic token refresh on 401
 * - Request/Response interceptors
 * - Exponential backoff retry on timeout/network errors
 * - Extended timeout for slow DB wake-up
 */

// Configuration for retry logic
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504], // Timeout, Rate limit, Server errors
};

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

/**
 * Exponential backoff delay calculator
 * Returns delay in milliseconds with jitter to avoid thundering herd
 */
const getRetryDelay = (retryCount: number): number => {
  const exponentialDelay = Math.min(
    RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount),
    RETRY_CONFIG.maxDelay
  );
  // Add random jitter (±20%)
  const jitter = exponentialDelay * 0.2 * Math.random();
  return exponentialDelay + jitter;
};


const isRetryableError = (error: any): boolean => {
  // Timeout or network errors
  if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return true;
  }
  
  // Retryable status codes
  if (error.response?.status && RETRY_CONFIG.retryableStatusCodes.includes(error.response.status)) {
    return true;
  }
  
  // Network timeout
  if (error.message?.includes('timeout')) {
    return true;
  }
  
  return false;
};

/**
 * REQUEST INTERCEPTOR
 * Automatically inject access token into every request
 * Initialize retry counter
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get token from sessionStorage (set by authService during login)
    const token = sessionStorage.getItem('accessToken') || 
                  localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Initialize retry counter if not already set
    if (!config.metadata) {
      config.metadata = { retryCount: 0 };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * - Automatically refresh token on 401 errors
 * - Retry with exponential backoff on timeout/network errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Get retry count from metadata
    if (!originalRequest.metadata) {
      originalRequest.metadata = { retryCount: 0 };
    }

    // ==================== RETRY LOGIC ====================
    // Retry if error is retryable AND we haven't exceeded max retries
    if (isRetryableError(error) && originalRequest.metadata.retryCount < RETRY_CONFIG.maxRetries) {
      originalRequest.metadata.retryCount += 1;
      const delayMs = getRetryDelay(originalRequest.metadata.retryCount - 1);
      
      console.warn(
        `[API] Request failed (${error.response?.status || error.code}). ` +
        `Retrying in ${Math.round(delayMs)}ms... (Attempt ${originalRequest.metadata.retryCount}/${RETRY_CONFIG.maxRetries})`
      );

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return apiClient(originalRequest);
    }

    // ==================== TOKEN REFRESH LOGIC ====================
    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get refresh token from storage
        const refreshToken = sessionStorage.getItem('refreshToken') || 
                             localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // No refresh token available, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(
          'https://bakeryerpbackend.onrender.com/api/token/refresh/',
          { refresh: refreshToken }
        );
        
        const newToken = response.data.access;
        sessionStorage.setItem('accessToken', newToken);
        
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // If refresh fails, clear storage and redirect to login
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;