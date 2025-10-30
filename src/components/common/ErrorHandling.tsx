// src/components/common/ErrorHandling.tsx
// Essential error handling components for production use
// Provides user-friendly error messages and loading states

import React, { useEffect } from 'react';
import { ApiError } from '../../services/api';

// =============================================================================
// ERROR DISPLAY COMPONENT
// =============================================================================

interface ErrorMessageProps {
  error: Error | ApiError | string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  onDismiss,
  className = '',
}) => {
  if (!error) return null;

  // Determine error type and message
  const getErrorInfo = () => {
    if (typeof error === 'string') {
      return {
        title: 'Error',
        message: error,
        type: 'generic',
        canRetry: false,
      };
    }

    if (error instanceof ApiError) {
      return {
        title: getApiErrorTitle(error),
        message: error.getErrorMessage(),
        type: getApiErrorType(error),
        canRetry: !error.isAuthenticationError(),
      };
    }

    return {
      title: 'Unexpected Error',
      message: error.message || 'An unexpected error occurred',
      type: 'generic',
      canRetry: true,
    };
  };

  const errorInfo = getErrorInfo();

  return (
    <div className={`error-message ${className}`} style={{ 
      padding: '16px',
      border: '1px solid #f87171',
      borderRadius: '8px',
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ fontSize: '20px' }}>
          {getErrorIcon(errorInfo.type)}
        </div>
        
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600 }}>
            {errorInfo.title}
          </h3>
          <p style={{ margin: '0', fontSize: '14px' }}>
            {errorInfo.message}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {onRetry && errorInfo.canRetry && (
            <button 
              onClick={onRetry}
              style={{
                padding: '6px 12px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          )}
          
          {onDismiss && (
            <button 
              onClick={onDismiss}
              style={{
                padding: '6px 12px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions for error categorization
const getApiErrorTitle = (error: ApiError): string => {
  if (error.isNetworkError()) return 'Connection Problem';
  if (error.isAuthenticationError()) return 'Authentication Required';
  if (error.isPermissionError()) return 'Access Denied';
  if (error.isNotFoundError()) return 'Not Found';
  if (error.isValidationError()) return 'Invalid Data';
  return 'Server Error';
};

const getApiErrorType = (error: ApiError): string => {
  if (error.isNetworkError()) return 'network';
  if (error.isAuthenticationError()) return 'auth';
  if (error.isPermissionError()) return 'permission';
  if (error.isNotFoundError()) return 'not-found';
  if (error.isValidationError()) return 'validation';
  return 'server';
};

const getErrorIcon = (type: string): string => {
  const iconMap: { [key: string]: string } = {
    network: '🌐',
    auth: '🔒',
    permission: '⛔',
    'not-found': '🔍',
    validation: '⚠️',
    server: '🔧',
    generic: '❗',
  };
  
  return iconMap[type] || iconMap.generic;
};

// =============================================================================
// LOADING STATE COMPONENT
// =============================================================================

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  className = '',
}) => {
  return (
    <div className={`loading-spinner ${className}`} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      minHeight: '200px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}>
      </div>
      {message && (
        <p style={{
          marginTop: '16px',
          color: '#6b7280',
          fontSize: '14px'
        }}>
          {message}
        </p>
      )}
    </div>
  );
};

// =============================================================================
// ASYNC STATE WRAPPER COMPONENT
// =============================================================================

interface AsyncStateWrapperProps<T> {
  data: T | null;
  loading: boolean;
  error: Error | ApiError | string | null;
  onRetry?: () => void;
  loadingMessage?: string;
  emptyMessage?: string;
  children: (data: T) => React.ReactNode;
  className?: string;
}

export const AsyncStateWrapper = <T,>({
  data,
  loading,
  error,
  onRetry,
  loadingMessage = 'Loading data...',
  emptyMessage = 'No data available',
  children,
  className = '',
}: AsyncStateWrapperProps<T>): React.ReactElement => {
  if (loading) {
    return (
      <div className={`async-state-wrapper ${className}`}>
        <LoadingSpinner message={loadingMessage} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`async-state-wrapper ${className}`}>
        <ErrorMessage error={error} onRetry={onRetry} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`async-state-wrapper ${className}`} style={{
        textAlign: 'center',
        padding: '32px',
        color: '#6b7280'
      }}>
        <p>{emptyMessage}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`async-state-wrapper ${className}`}>
      {children(data)}
    </div>
  );
};

// =============================================================================
// SUCCESS MESSAGE COMPONENT
// =============================================================================

interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
  autoHide?: boolean;
  hideAfter?: number; // milliseconds
  className?: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  onDismiss,
  autoHide = true,
  hideAfter = 5000,
  className = '',
}) => {
  useEffect(() => {
    if (autoHide && onDismiss) {
      const timer = setTimeout(onDismiss, hideAfter);
      return () => clearTimeout(timer);
    }
  }, [autoHide, hideAfter, onDismiss]);

  return (
    <div className={`success-message ${className}`} style={{
      padding: '12px 16px',
      backgroundColor: '#dcfce7',
      border: '1px solid #22c55e',
      borderRadius: '8px',
      color: '#15803d',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>✅</span>
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#15803d'
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

// =============================================================================
// CUSTOM HOOKS FOR ERROR HANDLING
// =============================================================================

export const useAsyncOperation = <T,>() => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | ApiError | string | null>(null);

  const execute = async (operation: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

// Add CSS animation for spinner
const spinKeyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Inject CSS styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinKeyframes;
  document.head.appendChild(style);
}