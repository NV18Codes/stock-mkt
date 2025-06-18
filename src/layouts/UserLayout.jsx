import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserLayout = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        background: '#111',
        padding: '2em 1em',
        borderRight: '1px solid #222',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '2em', textAlign: 'center' }}>
          <h3 style={{ color: '#007bff', margin: 0 }}>Welcome,</h3>
          <p style={{ color: '#cce3ff', margin: '0.5em 0' }}>{user?.name || 'Trader'}</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', flex: 1 }}>
          <NavLink
            to="/dashboard"
            end
            style={({ isActive }) => ({
              padding: '0.8em 1em',
              borderRadius: '4px',
              color: isActive ? '#fff' : '#cce3ff',
              background: isActive ? '#007bff' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            })}
          >
            Trading Portal
          </NavLink>
          
          <NavLink
            to="/dashboard/broker-settings"
            style={({ isActive }) => ({
              padding: '0.8em 1em',
              borderRadius: '4px',
              color: isActive ? '#fff' : '#cce3ff',
              background: isActive ? '#007bff' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            })}
          >
            Broker Settings
          </NavLink>
          
          <NavLink
            to="/dashboard/profile-settings"
            style={({ isActive }) => ({
              padding: '0.8em 1em',
              borderRadius: '4px',
              color: isActive ? '#fff' : '#cce3ff',
              background: isActive ? '#007bff' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.3s ease'
            })}
          >
            Profile Settings
          </NavLink>
        </nav>

        {/* Logout Button */}
        <div style={{ marginTop: 'auto', paddingTop: '1em' }}>
          <button 
            className="btn"
            onClick={handleLogout}
            style={{
              width: '100%',
              background: '#ff4444',
              color: '#fff',
              border: 'none',
              padding: '0.8em 1em',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2em', overflowY: 'auto' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default UserLayout; 