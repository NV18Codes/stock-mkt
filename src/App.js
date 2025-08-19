import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/common/LandingPage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import UserProfileSettings from './components/user/UserProfileSettings';

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

// Import our comprehensive ErrorBoundary
import ErrorBoundary from './components/common/ErrorBoundary';



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
