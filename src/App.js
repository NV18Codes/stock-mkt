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

const ProtectedRoute = ({ children, role: requiredRole }) => {
  const { isAuthenticated, role, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#000',
        color: '#007bff'
      }}>
        Loading...
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
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', background: '#000' }}>
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
