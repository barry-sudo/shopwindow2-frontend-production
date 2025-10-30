import { useState, useEffect } from 'react';
import { ApiError } from '../types/models';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export function useApi<T>(
  apiFunction: () => Promise<any>,
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiFunction();
      const data = response.data || response;
      
      setState({
        data,
        loading: false,
        error: null
      });

      if (onSuccess) {
        onSuccess(data);
      }

      return data;
    } catch (err) {
      const apiError: ApiError = {
        message: err instanceof Error ? err.message : 'An error occurred',
        status_code: 500
      };

      setState({
        data: null,
        loading: false,
        error: apiError
      });

      if (onError) {
        onError(apiError);
      }

      throw apiError;
    }
  };

  const reset = () => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}