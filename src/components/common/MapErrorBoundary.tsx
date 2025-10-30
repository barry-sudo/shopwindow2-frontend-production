import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error details
    console.error('🚨 Map Error Boundary caught an error:', {
      error,
      errorInfo,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    this.setState({
      error,
      errorInfo
    });

    // Check for specific Google Maps errors
    if (error.message.includes('not a constructor') || 
        error.message.includes('google') || 
        error.message.includes('maps')) {
      console.error('🗺️ Google Maps specific error detected');
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    // Force a page reload for Google Maps issues
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div 
          className="map-error-boundary"
          style={{
            width: '100%',
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fed7d7',
            border: '2px solid #feb2b2',
            borderRadius: '8px',
            padding: '40px 20px',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
          
          <h2 style={{ 
            color: '#c53030', 
            margin: '0 0 12px 0',
            fontSize: '20px',
            fontWeight: 600
          }}>
            Map Loading Failed
          </h2>
          
          <p style={{ 
            color: '#742a2a', 
            margin: '0 0 16px 0',
            fontSize: '16px',
            maxWidth: '400px',
            lineHeight: 1.5
          }}>
            We're having trouble loading the property map. This might be due to a 
            Google Maps configuration issue or network connectivity problem.
          </p>

          {this.state.error && (
            <details 
              style={{ 
                marginBottom: '20px', 
                padding: '12px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#4a5568',
                maxWidth: '500px',
                textAlign: 'left'
              }}
            >
              <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '8px' }}>
                Technical Details
              </summary>
              <div>
                <strong>Error:</strong> {this.state.error.message}
              </div>
              {this.state.error.stack && (
                <div style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '11px' }}>
                  <strong>Stack:</strong>
                  <pre style={{ 
                    whiteSpace: 'pre-wrap', 
                    margin: '4px 0 0 0',
                    padding: '8px',
                    backgroundColor: '#f7fafc',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}>
                    {this.state.error.stack}
                  </pre>
                </div>
              )}
            </details>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleRetry}
              style={{
                backgroundColor: '#1a365d',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2d3748'}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1a365d'}
            >
              Retry Loading
            </button>
            
            <button
              onClick={() => window.location.href = '/properties'}
              style={{
                backgroundColor: 'transparent',
                color: '#1a365d',
                border: '2px solid #1a365d',
                padding: '10px 24px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#1a365d';
                (e.target as HTMLButtonElement).style.color = 'white';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                (e.target as HTMLButtonElement).style.color = '#1a365d';
              }}
            >
              View Property List
            </button>
          </div>

          <p style={{
            fontSize: '12px',
            color: '#a0aec0',
            margin: '20px 0 0 0',
            fontStyle: 'italic'
          }}>
            If this problem persists, please contact support.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;
