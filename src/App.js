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

const PORT = process.env.PORT || 8000;
const ProtectedRoute = ({ children, role: requiredRole }) => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <div style={{ color: '#007bff', textAlign: 'center', marginTop: '2em' }}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to={role === 'admin' ? '/admin-panel' : '/dashboard'} replace />;
  return children;
};

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();
  return (
    <>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 60px)' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to={role === 'admin' ? '/admin-panel' : '/dashboard'} /> : <Login />} />
          <Route path="/signup" element={isAuthenticated ? <Navigate to={role === 'admin' ? '/admin-panel' : '/dashboard'} /> : <Signup />} />

          {/* User Role Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute role="user">
              <UserLayout />
            </ProtectedRoute>
          }>
            <Route index element={<TradingPortal />} />
            <Route path="profile-settings" element={<UserProfileSettings />} />
            <Route path="broker-settings" element={<BrokerAccountSettings />} />
            <Route path="trading" element={<TradingPortal />} />
          </Route>

          {/* Admin Role Routes */}
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
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
