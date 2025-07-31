import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import v4Logo from '../assets/logo-V4.png';

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
      background: 'var(--gradient-bg)', 
      color: 'var(--text-primary)', 
      display: 'flex',
      fontFamily: 'var(--font-family)'
    }}>
      {/* Sidebar */}
      <div style={{
        width: isSidebarCollapsed ? '80px' : '280px',
        background: 'var(--gradient-card)',
        padding: isSidebarCollapsed ? '1.5em 0.5em' : '2em 1.5em',
        borderRight: '1px solid var(--border-primary)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        transition: 'all 0.3s ease',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '2em', 
          textAlign: 'center',
          paddingBottom: '1.5em',
          borderBottom: '1px solid var(--border-primary)'
        }}>
          {!isSidebarCollapsed && (
            <>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1em',
                color: 'var(--text-inverse)',
                fontSize: '1.5em',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(0, 212, 170, 0.3)',
                border: '2px solid var(--primary-color)',
                padding: '6px'
              }}>
                <img 
                  src={v4Logo} 
                  alt="V4 Fintech Solutions" 
                  style={{ 
                    height: '55px', 
                    width: 'auto',
                    borderRadius: '50%'
                  }}
                />
              </div>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                margin: '0 0 0.5em 0', 
                fontWeight: 600, 
                fontSize: '1.2em' 
              }}>
                Welcome back,
              </h3>
              <p style={{ 
                color: 'var(--text-secondary)', 
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
                background: 'var(--gradient-secondary)',
                color: 'var(--text-inverse)',
                borderRadius: '20px',
                fontSize: '0.8em',
                fontWeight: 600
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--text-inverse)'
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
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              color: 'var(--text-inverse)',
              fontSize: '1.2em',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0, 212, 170, 0.3)',
              border: '2px solid var(--primary-color)',
              padding: '4px'
            }}>
              <img 
                src={v4Logo} 
                alt="V4 Fintech Solutions" 
                style={{ 
                  height: '40px', 
                  width: 'auto',
                  borderRadius: '50%'
                }}
              />
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
              color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
              background: isActive ? 'var(--gradient-primary)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? 600 : 500,
              border: isActive ? 'none' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: isSidebarCollapsed ? '0' : '0.8em',
              fontSize: '0.95em',
              boxShadow: isActive ? '0 2px 8px rgba(0, 212, 170, 0.3)' : 'none'
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
              color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
              background: isActive ? 'var(--gradient-primary)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? 600 : 500,
              border: isActive ? 'none' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: isSidebarCollapsed ? '0' : '0.8em',
              fontSize: '0.95em',
              boxShadow: isActive ? '0 2px 8px rgba(0, 212, 170, 0.3)' : 'none'
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
              color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
              background: isActive ? 'var(--gradient-primary)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? 600 : 500,
              border: isActive ? 'none' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: isSidebarCollapsed ? '0' : '0.8em',
              fontSize: '0.95em',
              boxShadow: isActive ? '0 2px 8px rgba(0, 212, 170, 0.3)' : 'none'
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
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-primary)',
            borderRadius: '6px',
            padding: '0.5em',
            cursor: 'pointer',
            marginBottom: '1em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            color: 'var(--text-primary)'
          }}
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'var(--primary-color)';
            e.target.style.background = 'var(--bg-tertiary)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'var(--border-primary)';
            e.target.style.background = 'var(--bg-surface)';
          }}
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
            background: 'linear-gradient(135deg, var(--danger-color), var(--danger-hover))',
            color: 'var(--text-inverse)',
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
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
          }}
        >
          <span style={{ fontSize: '1.2em' }}>🚪</span>
          {!isSidebarCollapsed && 'Logout'}
        </button>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        background: 'var(--gradient-bg)', 
        overflowY: 'auto',
        minHeight: '100vh'
      }}>
        {/* Top Bar */}
        <div style={{
          background: 'var(--gradient-card)',
          padding: '1em 2em',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-md)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(10px)'
        }}>
          <div>
            <h1 style={{ 
              color: 'var(--text-primary)', 
              margin: 0, 
              fontSize: '1.5em',
              fontWeight: 600
            }}>
              {getActiveRouteName()}
            </h1>
            <p style={{ 
              color: 'var(--text-secondary)', 
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
                color: 'var(--text-primary)', 
                margin: 0, 
                fontSize: '0.9em',
                fontWeight: 500
              }}>
                {user?.email || 'user@example.com'}
              </p>
              <p style={{ 
                color: 'var(--text-secondary)', 
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
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-inverse)',
              fontSize: '1em',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0, 212, 170, 0.3)',
              border: '2px solid var(--primary-color)'
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