import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getActiveRouteName = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Trading Portal';
    if (path === '/dashboard/broker-settings') return 'Broker Settings';
    if (path === '/dashboard/profile-settings') return 'Profile Settings';
    return 'Dashboard';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8f9fa', 
      color: '#333', 
      display: 'flex',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Sidebar */}
      <div style={{
        width: isSidebarCollapsed ? '80px' : '280px',
        background: '#ffffff',
        padding: isSidebarCollapsed ? '1.5em 0.5em' : '2em 1.5em',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '2em', 
          textAlign: 'center',
          paddingBottom: '1.5em',
          borderBottom: '1px solid #e0e0e0'
        }}>
          {!isSidebarCollapsed && (
            <>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #007bff, #0056b3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1em',
                color: '#fff',
                fontSize: '1.5em',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
              }}>
                {getInitials(user?.name)}
              </div>
              <h3 style={{ 
                color: '#2c3e50', 
                margin: '0 0 0.5em 0', 
                fontWeight: 600, 
                fontSize: '1.2em' 
              }}>
                Welcome back,
              </h3>
              <p style={{ 
                color: '#6c757d', 
                margin: 0, 
                fontSize: '0.9em',
                fontWeight: 500
              }}>
                {user?.name || 'Trader'}
              </p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3em',
                marginTop: '0.5em',
                padding: '0.3em 0.8em',
                background: '#d4edda',
                color: '#155724',
                borderRadius: '20px',
                fontSize: '0.8em',
                fontWeight: 600
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#28a745'
                }}></span>
                Active
              </div>
            </>
          )}
          
          {isSidebarCollapsed && (
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #007bff, #0056b3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              color: '#fff',
              fontSize: '1.2em',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,123,255,0.3)'
            }}>
              {getInitials(user?.name)}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.5em', 
          flex: 1 
        }}>
          <NavLink
            to="/dashboard"
            end
            style={({ isActive }) => ({
              padding: isSidebarCollapsed ? '1em 0.5em' : '1em 1.2em',
              borderRadius: '8px',
              color: isActive ? '#fff' : '#495057',
              background: isActive ? 'linear-gradient(135deg, #007bff, #0056b3)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? 600 : 500,
              border: isActive ? 'none' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: isSidebarCollapsed ? '0' : '0.8em',
              fontSize: '0.95em',
              boxShadow: isActive ? '0 2px 8px rgba(0,123,255,0.3)' : 'none'
            })}
          >
            <span style={{ fontSize: '1.2em' }}>📈</span>
            {!isSidebarCollapsed && 'Trading Portal'}
          </NavLink>
          
          <NavLink
            to="/dashboard/broker-settings"
            style={({ isActive }) => ({
              padding: isSidebarCollapsed ? '1em 0.5em' : '1em 1.2em',
              borderRadius: '8px',
              color: isActive ? '#fff' : '#495057',
              background: isActive ? 'linear-gradient(135deg, #007bff, #0056b3)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? 600 : 500,
              border: isActive ? 'none' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: isSidebarCollapsed ? '0' : '0.8em',
              fontSize: '0.95em',
              boxShadow: isActive ? '0 2px 8px rgba(0,123,255,0.3)' : 'none'
            })}
          >
            <span style={{ fontSize: '1.2em' }}>🏦</span>
            {!isSidebarCollapsed && 'Broker Settings'}
          </NavLink>
          
          <NavLink
            to="/dashboard/profile-settings"
            style={({ isActive }) => ({
              padding: isSidebarCollapsed ? '1em 0.5em' : '1em 1.2em',
              borderRadius: '8px',
              color: isActive ? '#fff' : '#495057',
              background: isActive ? 'linear-gradient(135deg, #007bff, #0056b3)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? 600 : 500,
              border: isActive ? 'none' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: isSidebarCollapsed ? '0' : '0.8em',
              fontSize: '0.95em',
              boxShadow: isActive ? '0 2px 8px rgba(0,123,255,0.3)' : 'none'
            })}
          >
            <span style={{ fontSize: '1.2em' }}>👤</span>
            {!isSidebarCollapsed && 'Profile Settings'}
          </NavLink>
        </nav>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          style={{
            background: '#f8f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            padding: '0.5em',
            cursor: 'pointer',
            marginBottom: '1em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <span style={{ fontSize: '1.2em' }}>
            {isSidebarCollapsed ? '→' : '←'}
          </span>
        </button>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #dc3545, #c82333)',
            color: '#fff',
            border: 'none',
            padding: isSidebarCollapsed ? '1em 0.5em' : '1em 1.2em',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: 600,
            fontSize: '0.9em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isSidebarCollapsed ? '0' : '0.5em',
            boxShadow: '0 2px 8px rgba(220,53,69,0.3)'
          }}
        >
          <span style={{ fontSize: '1.2em' }}>🚪</span>
          {!isSidebarCollapsed && 'Logout'}
        </button>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        background: '#f8f9fa', 
        overflowY: 'auto',
        minHeight: '100vh'
      }}>
        {/* Top Bar */}
        <div style={{
          background: '#fff',
          padding: '1em 2em',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div>
            <h1 style={{ 
              color: '#2c3e50', 
              margin: 0, 
              fontSize: '1.5em',
              fontWeight: 600
            }}>
              {getActiveRouteName()}
            </h1>
            <p style={{ 
              color: '#6c757d', 
              margin: '0.2em 0 0 0', 
              fontSize: '0.9em' 
            }}>
              Manage your trading account and preferences
            </p>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1em'
          }}>
            <div style={{
              textAlign: 'right'
            }}>
              <p style={{ 
                color: '#2c3e50', 
                margin: 0, 
                fontSize: '0.9em',
                fontWeight: 500
              }}>
                {user?.email || 'user@example.com'}
              </p>
              <p style={{ 
                color: '#6c757d', 
                margin: 0, 
                fontSize: '0.8em' 
              }}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #007bff, #0056b3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1em',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,123,255,0.3)'
            }}>
              {getInitials(user?.name)}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: '0' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserLayout; 