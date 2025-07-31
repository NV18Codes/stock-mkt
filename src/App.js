import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/common/LandingPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
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
          background: '#f8f9fa',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div>
            <h1 style={{ color: '#dc3545', marginBottom: '1rem' }}>Something went wrong</h1>
            <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                background: '#007bff',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
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
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f8f9fa',
      color: '#007bff',
      fontSize: '2rem',
      fontWeight: 'bold'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>🚀 React App is Working!</h1>
        <p style={{ fontSize: '1rem', marginTop: '1rem', color: '#6c757d' }}>
          If you can see this, React is rendering correctly.
        </p>
        <button 
          onClick={() => window.location.href = '/landing'} 
          style={{
            background: '#007bff',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Go to Landing Page
        </button>
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
        background: '#f8f9fa',
        color: '#007bff',
        fontSize: '1.2em',
        fontWeight: 500
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e3e3e3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1em'
          }} />
          <p>Loading...</p>
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
            background: '#f8f9fa',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
          }}>
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
