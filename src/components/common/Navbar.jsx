import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="navbar" style={{ 
      background: '#000',
      borderBottom: '2px solid #007bff',
      padding: '1em 2em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap'
    }}>
      <div style={{ fontWeight: 700, fontSize: '1.3em', color: '#007bff' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>📈 Stock Trading Portal</Link>
      </div>
      <div style={{ display: 'flex', gap: '1.2em', alignItems: 'center', flexWrap: 'wrap' }}>
        {!isAuthenticated && (
          <>
            <Link to="/login" style={{ color: '#fff' }}>Login</Link>
            <Link to="/signup" style={{ 
              color: '#007bff',
              border: '1px solid #007bff',
              borderRadius: 4,
              padding: '0.3em 1em',
              background: '#fff'
            }}>Sign Up</Link>
          </>
        )}
        {isAuthenticated && (
          <>
            <span style={{ color: '#cce3ff' }}>Welcome, {user?.name || 'User'}</span>
            <button 
              className="btn"
              style={{ marginLeft: 8, background: '#fff', color: '#007bff' }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 