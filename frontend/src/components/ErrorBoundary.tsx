import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container"
          style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <div className="card" style={{ textAlign: 'center', maxWidth: '600px' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(45deg, #ff6b6b, #ff8e8e)',
                borderRadius: '50%',
                margin: '0 auto 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                boxShadow: '0 0 20px #ff6b6b, 0 0 40px #ff6b6b'
              }}
            >
              ⚠️
            </motion.div>
            
            <h1 style={{ 
              color: '#ff6b6b', 
              marginBottom: '20px',
              fontSize: '2rem'
            }}>
              This page hit an unexpected error
            </h1>
            
            <p style={{ 
              color: 'var(--text-secondary)',
              marginBottom: '30px',
              fontSize: '1.1rem'
            }}>
              The app crashed while rendering this screen. Refreshing usually fixes a one-off glitch.
              If it happens again on register or login, confirm your email is a full address (not a username)
              and that the API is reachable.
            </p>
            
            <div style={{ marginBottom: '30px' }}>
              <motion.button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ marginRight: '15px' }}
              >
                Refresh Page
              </motion.button>
              
              <motion.button
                className="btn btn-secondary"
                onClick={() => window.location.href = '/home'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Go Home
              </motion.button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ 
                textAlign: 'left', 
                marginTop: '20px',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 107, 107, 0.3)'
              }}>
                <summary style={{ 
                  color: '#ff6b6b', 
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}>
                  Error Details (Development)
                </summary>
                <pre style={{ 
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
