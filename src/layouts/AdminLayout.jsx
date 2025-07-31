import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#333', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        background: '#f8f9fa',
        padding: '2em 1em',
        borderRight: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '2em', textAlign: 'center' }}>
          <h3 style={{ color: '#2c3e50', margin: 0, fontWeight: 600, fontSize: '1.5em' }}>Admin Panel</h3>
          <p style={{ color: '#6c757d', margin: '0.5em 0', fontSize: '0.9em' }}>{user?.name || 'Administrator'}</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', flex: 1 }}>
          <NavLink
            to="/admin-panel"
            end
            style={({ isActive }) => ({
              padding: '0.8em 1em',
              borderRadius: '6px',
              color: isActive ? '#fff' : '#495057',
              background: isActive ? '#007bff' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? 600 : 500,
              border: isActive ? 'none' : '1px solid transparent'
            })}
          >
            Dashboard Overview
          </NavLink>
          
          <NavLink
            to="/admin-panel/user-management"
            style={({ isActive }) => ({
              padding: '0.8em 1em',
              borderRadius: '6px',
              color: isActive ? '#fff' : '#495057',
              background: isActive ? '#007bff' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? 600 : 500,
              border: isActive ? 'none' : '1px solid transparent'
            })}
          >
            User Management
          </NavLink>
          
          <NavLink
            to="/admin-panel/admin-trading-portal"
            style={({ isActive }) => ({
              padding: '0.8em 1em',
              borderRadius: '6px',
              color: isActive ? '#fff' : '#495057',
              background: isActive ? '#007bff' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? 600 : 500,
              border: isActive ? 'none' : '1px solid transparent'
            })}
          >
            Trading Portal
          </NavLink>
          <NavLink
            to="/admin-panel/trades"
            style={({ isActive }) => ({
              padding: '0.8em 1em',
              borderRadius: '6px',
              color: isActive ? '#fff' : '#495057',
              background: isActive ? '#007bff' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? 600 : 500,
              border: isActive ? 'none' : '1px solid transparent'
            })}
          >
            Trade History
          </NavLink>
          <NavLink
            to="/admin-panel/logs"
            style={({ isActive }) => ({
              padding: '0.8em 1em',
              borderRadius: '6px',
              color: isActive ? '#fff' : '#495057',
              background: isActive ? '#007bff' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? 600 : 500,
              border: isActive ? 'none' : '1px solid transparent'
            })}
          >
            System Logs
          </NavLink>

          <NavLink
            to="/admin-panel/admin-settings"
            style={({ isActive }) => ({
              padding: '0.8em 1em',
              borderRadius: '6px',
              color: isActive ? '#fff' : '#495057',
              background: isActive ? '#007bff' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              fontWeight: isActive ? 600 : 500,
              border: isActive ? 'none' : '1px solid transparent'
            })}
          >
            Profile Settings
          </NavLink>
        </nav>

        {/* Logout Button */}
        <div style={{ marginTop: 'auto', paddingTop: '1em' }}>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              background: '#dc3545',
              color: '#fff',
              border: 'none',
              padding: '0.8em 1em',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: 600,
              fontSize: '0.9em'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, background: '#ffffff', overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout; 