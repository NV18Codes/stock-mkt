import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to console for debugging
    console.group('🚨 React Error Details');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <div style={{
          padding: '2rem',
          margin: '1rem',
          backgroundColor: '#fef2f2',
          border: '2px solid #fecaca',
          borderRadius: '8px',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚨</div>
          <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#7f1d1d', marginBottom: '1.5rem' }}>
            We've encountered an unexpected error. This is likely a backend issue, not a frontend problem.
          </p>
          
          <div style={{ 
            backgroundColor: '#fef3c7', 
            border: '1px solid #fde68a', 
            borderRadius: '6px', 
            padding: '1rem', 
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            <h4 style={{ color: '#92400e', marginBottom: '0.5rem' }}>Error Details:</h4>
            <p style={{ color: '#78350f', fontSize: '0.9rem', margin: 0 }}>
              {this.state.error?.message || 'Unknown error occurred'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
              🔄 Reload Page
            </button>
            
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#059669'}
            >
              🔧 Try Again
            </button>
          </div>

          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            backgroundColor: '#f0f9ff', 
            border: '1px solid #bae6fd', 
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}>
            <p style={{ color: '#0c4a6e', margin: 0 }}>
              <strong>Note:</strong> This error boundary ensures that any frontend issues are caught and displayed gracefully. 
              If you continue to see errors, they are likely backend-related and should be reported to the development team.
            </p>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
