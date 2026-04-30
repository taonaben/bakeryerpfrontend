import { useState, useCallback } from 'react';
import axios from 'axios';

interface ApiCallState {
  data: any | null;
  loading: boolean;
  error: Error | null;
  isRetrying: boolean;
}

/**
 * Hook for handling API calls with built-in loading, error, and retry states
 * Useful for handling slow DB wake-ups and providing user feedback
 */
export const useApiCall = () => {
  const [state, setState] = useState<ApiCallState>({
    data: null,
    loading: false,
    error: null,
    isRetrying: false,
  });

  const execute = useCallback(async (
    apiFunction: () => Promise<any>,
    options = { showLoadingMessage: true }
  ) => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const response = await apiFunction();
      setState({
        data: response,
        loading: false,
        error: null,
        isRetrying: false,
      });
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      // Check if it's a timeout or network error
      const isTimeoutError = 
        error.message?.includes('timeout') || 
        axios.isAxiosError(err) && err.code === 'ECONNABORTED';

      setState(prev => ({
        ...prev,
        loading: false,
        error,
        isRetrying: isTimeoutError,
      }));
      
      throw error;
    }
  }, []);

  return {
    ...state,
    execute,
  };
};

export default useApiCall;
