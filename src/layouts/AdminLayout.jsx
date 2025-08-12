import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
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
        width: '250px',
        background: 'var(--gradient-card)',
        padding: '2em 1em',
        borderRight: '1px solid var(--border-primary)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '1.5em 1em',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '1.5em'
        }}>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', flex: 1 }}>
          <NavLink
            to="/admin-panel"
            end
            style={({ isActive }) => ({
              padding: '0.8em 1em',
              borderRadius: '8px',
              color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
              background: isActive ? 'var(--gradient-primary)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? 600 : 500,
              border: isActive ? 'none' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8em',
              fontSize: '0.95em',
              boxShadow: isActive ? '0 2px 8px rgba(0, 212, 170, 0.3)' : 'none'
            })}
          >
            <span style={{ fontSize: '1.2em' }}>📊</span>
            Dashboard Overview
          </NavLink>
          
          <NavLink
            to="/admin-panel/user-management"
            style={({ isActive }) => ({
              padding: '0.8em 1em',
              borderRadius: '8px',
              color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
              background: isActive ? 'var(--gradient-primary)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? 600 : 500,
              border: isActive ? 'none' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8em',
              fontSize: '0.95em',
              boxShadow: isActive ? '0 2px 8px rgba(0, 212, 170, 0.3)' : 'none'
            })}
          >
            <span style={{ fontSize: '1.2em' }}>👥</span>
            User Management
          </NavLink>
          
          <NavLink
            to="/admin-panel/admin-trading-portal"
            style={({ isActive }) => ({
              padding: '0.8em 1em',
              borderRadius: '8px',
              color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
              background: isActive ? 'var(--gradient-primary)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? 600 : 500,
              border: isActive ? 'none' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8em',
              fontSize: '0.95em',
              boxShadow: isActive ? '0 2px 8px rgba(0, 212, 170, 0.3)' : 'none'
            })}
          >
            <span style={{ fontSize: '1.2em' }}>📈</span>
            Trading Portal
          </NavLink>
          <NavLink
            to="/admin-panel/trades"
            style={({ isActive }) => ({
              padding: '0.8em 1em',
              borderRadius: '8px',
              color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
              background: isActive ? 'var(--gradient-primary)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? 600 : 500,
              border: isActive ? 'none' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8em',
              fontSize: '0.95em',
              boxShadow: isActive ? '0 2px 8px rgba(0, 212, 170, 0.3)' : 'none'
            })}
          >
            <span style={{ fontSize: '1.2em' }}>📋</span>
            Trade History
          </NavLink>

          <NavLink
            to="/admin-panel/admin-settings"
            style={({ isActive }) => ({
              padding: '0.8em 1em',
              borderRadius: '8px',
              color: isActive ? 'var(--text-inverse)' : 'var(--text-secondary)',
              background: isActive ? 'var(--gradient-primary)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? 600 : 500,
              border: isActive ? 'none' : '1px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8em',
              fontSize: '0.95em',
              boxShadow: isActive ? '0 2px 8px rgba(0, 212, 170, 0.3)' : 'none'
            })}
          >
            <span style={{ fontSize: '1.2em' }}>⚙️</span>
            Profile Settings
          </NavLink>
        </nav>

        {/* Logout Button */}
        <div style={{ marginTop: 'auto', paddingTop: '1em' }}>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, var(--danger-color), var(--danger-hover))',
              color: 'var(--text-inverse)',
              border: 'none',
              padding: '0.8em 1em',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: 600,
              fontSize: '0.9em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5em',
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
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        background: 'var(--gradient-bg)', 
        overflowY: 'auto',
        minHeight: '100vh'
      }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout; 