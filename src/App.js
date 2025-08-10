import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/common/LandingPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import UserProfileSettings from './components/user/UserProfileSettings';
import BrokerAccountSettings from './components/user/BrokerAccountSettings';
import TradingPortal from './components/user/TradingPortal';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminProfileSettings from './components/admin/AdminProfileSettings';
import UserManagement from './components/admin/UserManagement';
import AdminTradingPortal from './components/admin/AdminTradingPortal';
import Navbar from './components/common/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import TradeHistory from './components/admin/TradeHistory';
import TradeLog from './components/admin/TradeLog';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'var(--gradient-bg)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'var(--gradient-card)',
            padding: '2rem',
            borderRadius: '12px',
            border: '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h1 style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>Something went wrong</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                background: 'var(--gradient-primary)',
                color: 'var(--text-inverse)',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple test component
const TestComponent = () => {
  const { logout } = useAuth();
  
  const clearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--gradient-bg)',
      color: 'var(--text-primary)',
      fontSize: '2rem',
      fontWeight: 'bold'
    }}>
      <div style={{ 
        textAlign: 'center',
        background: 'var(--gradient-card)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h1 style={{ 
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>🚀 Stock Trading Portal is Working!</h1>
        <p style={{ fontSize: '1rem', marginTop: '1rem', color: 'var(--text-secondary)' }}>
          If you can see this, React is rendering correctly.
        </p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => window.location.href = '/landing'} 
            style={{
              background: 'var(--gradient-primary)',
              color: 'var(--text-inverse)',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Go to Landing Page
          </button>
          <button 
            onClick={clearStorage} 
            style={{
              background: 'var(--danger-color)',
              color: 'var(--text-inverse)',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Clear Storage
          </button>
          <button 
            onClick={handleLogout} 
            style={{
              background: 'var(--warning-color)',
              color: 'var(--text-inverse)',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => window.location.href = '/forgot-password'} 
            style={{
              background: 'var(--gradient-primary)',
              color: 'var(--text-inverse)',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            Forgot Password
          </button>
          <button 
            onClick={() => window.location.href = '/reset-password'} 
            style={{
              background: 'var(--gradient-primary)',
              color: 'var(--text-inverse)',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
          >
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, role: requiredRole }) => {
  const { isAuthenticated, role, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--gradient-bg)',
        color: 'var(--text-primary)',
        fontSize: '1.2em',
        fontWeight: 500
      }}>
        <div style={{ 
          textAlign: 'center',
          background: 'var(--gradient-card)',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid var(--border-primary)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <div className="loading-spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--bg-tertiary)',
            borderTop: '4px solid var(--primary-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1em'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'admin' ? '/admin-panel' : '/dashboard'} replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Test Route */}
        <Route path="/test" element={<TestComponent />} />
        
        {/* Debug Routes */}

        
        {/* Public Routes */}
        <Route path="/" element={
          isAuthenticated ? 
            <Navigate to={role === 'admin' ? '/admin-panel' : '/dashboard'} replace /> : 
            <LandingPage />
        } />
        
        <Route path="/landing" element={<LandingPage />} />
        
        <Route path="/login" element={
          isAuthenticated ? 
            <Navigate to={role === 'admin' ? '/admin-panel' : '/dashboard'} replace /> : 
            <Login />
        } />
        
        <Route path="/signup" element={
          isAuthenticated ? 
            <Navigate to={role === 'admin' ? '/admin-panel' : '/dashboard'} replace /> : 
            <Signup />
        } />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password" element={<ResetPassword />} />

        {/* User Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute role="user">
            <UserLayout />
          </ProtectedRoute>
        }>
          <Route index element={<TradingPortal />} />
          <Route path="profile-settings" element={<UserProfileSettings />} />
          <Route path="broker-settings" element={<BrokerAccountSettings />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin-panel" element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="admin-settings" element={<AdminProfileSettings />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="admin-trading-portal" element={<AdminTradingPortal />} />
          <Route path="trades" element={<TradeHistory />} />
          <Route path="logs" element={<TradeLog />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div style={{ 
            minHeight: '100vh', 
            background: 'var(--gradient-bg)',
            fontFamily: 'var(--font-family)'
          }}>
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
