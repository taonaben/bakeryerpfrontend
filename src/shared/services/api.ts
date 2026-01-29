import axios from 'axios';

/**
 * API CLIENT
 * 
 * Centralized Axios instance with:
 * - Automatic token injection
 * - Automatic token refresh on 401
 * - Request/Response interceptors
 */

const apiClient = axios.create({
    // baseURL: 'https://bakeryerpbackend.onrender.com',
    baseURL: "http://localhost:8000", // Uncomment for local dev
    timeout: 10000,
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
 * REQUEST INTERCEPTOR
 * Automatically inject access token into every request
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get token from sessionStorage (set by authService during login)
    const token = sessionStorage.getItem('accessToken') || 
                  localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR
 * Automatically refresh token on 401 errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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
          'http://localhost:8000/api/token/refresh/',
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