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
      background: '#ffffff',
      borderBottom: '2px solid #e0e0e0',
      padding: '1em 2em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontWeight: 600, fontSize: '1.3em', color: '#2c3e50' }}>
        <Link to="/" style={{ color: '#2c3e50', textDecoration: 'none' }}>📈 Stock Trading Portal</Link>
      </div>
      <div style={{ display: 'flex', gap: '1.2em', alignItems: 'center', flexWrap: 'wrap' }}>
        {!isAuthenticated && (
          <>
            <Link to="/login" style={{ 
              color: '#495057', 
              textDecoration: 'none',
              fontWeight: 500,
              padding: '0.5em 1em',
              borderRadius: '6px',
              transition: 'all 0.3s ease'
            }}>Login</Link>
            <Link to="/signup" style={{ 
              color: '#fff',
              border: '1px solid #007bff',
              borderRadius: '6px',
              padding: '0.5em 1em',
              background: '#007bff',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'all 0.3s ease'
            }}>Sign Up</Link>
          </>
        )}
        {isAuthenticated && (
          <>
            <span style={{ color: '#6c757d', fontWeight: 500 }}>Welcome, {user?.name || 'User'}</span>
            <button 
              style={{ 
                marginLeft: 8, 
                background: '#dc3545', 
                color: '#fff',
                border: 'none',
                padding: '0.5em 1em',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
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