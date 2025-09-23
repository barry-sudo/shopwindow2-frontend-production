import React, { ReactNode } from 'react';

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h2>Something went wrong</h2>
            <p>The application encountered an unexpected error.</p>
            <button 
              className="btn btn-primary"
              onClick={() => this.setState({ hasError: false })}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  className = ''
}) => {
  const sizeClass = `spinner-${size}`;
  
  return (
    <div className={`loading-spinner ${sizeClass} ${className}`}>
      <div className="spinner">
        <div className="spinner-circle"></div>
      </div>
      {message && <div className="spinner-message">{message}</div>}
    </div>
  );
};

// Error Message Component
interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  onRetry,
  className = ''
}) => {
  return (
    <div className={`error-message ${className}`}>
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h3 className="error-title">{title}</h3>
        <p className="error-text">{message}</p>
        {onRetry && (
          <button 
            className="btn btn-primary"
            onClick={onRetry}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

// Search Bar Component
interface SearchBarProps {
  value: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onSearch,
  placeholder = 'Search...',
  className = '',
  disabled = false
}) => {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Debounced search on empty or after 3+ characters
    if (newValue === '' || newValue.length >= 3) {
      const timeoutId = setTimeout(() => {
        onSearch(newValue);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`search-bar ${className}`}>
      <div className="search-input-container">
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className="form-control search-input"
        />
        <button 
          type="submit" 
          className="search-button"
          disabled={disabled}
          aria-label="Search"
        >
          🔍
        </button>
      </div>
    </form>
  );
};