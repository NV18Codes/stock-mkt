import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import v4Logo from '../../assets/Logo-updated-removebg-preview.png';

const Navbar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="navbar" style={{ 
      background: 'var(--gradient-bg)',
      borderBottom: '2px solid var(--primary-color)',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      boxShadow: 'var(--shadow-lg)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        fontWeight: 600, 
        fontSize: '1.3rem'
      }}>
        <Link to="/" style={{ 
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
        }}>
          <img 
            src={v4Logo} 
            alt="Trading Platform Logo" 
            style={{ 
              height: '150px', 
              width: 'auto',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-xl)',
              background: 'white',
              padding: '8px'
            }}
          />
        </Link>
      </div>
      <div style={{ 
        display: 'flex', 
        gap: '1.5rem', 
        alignItems: 'center', 
        flexWrap: 'wrap' 
      }}>
        {!isAuthenticated && (
          <>
            <Link to="/login" style={{ 
              color: 'var(--text-muted)', 
              textDecoration: 'none',
              fontWeight: 500,
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              background: 'rgba(211, 80, 63, 0.05)',
              backdropFilter: 'blur(10px)',
              fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--primary-color)';
              e.target.style.background = 'rgba(211, 80, 63, 0.1)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'transparent';
              e.target.style.background = 'rgba(211, 80, 63, 0.05)';
              e.target.style.transform = 'translateY(0)';
            }}>
              Sign In
            </Link>
            <Link to="/signup" style={{ 
              color: 'var(--text-inverse)',
              border: '2px solid var(--primary-color)',
              borderRadius: '12px',
              padding: '0.75rem 1.5rem',
              background: 'var(--gradient-primary)',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              boxShadow: 'var(--shadow-lg)',
              fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = 'var(--shadow-2xl)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'var(--shadow-lg)';
            }}>
              Get Started
            </Link>
          </>
        )}
        {isAuthenticated && (
          <>
            <span style={{ 
              color: 'var(--text-muted)', 
              fontWeight: 500,
              background: 'rgba(211, 80, 63, 0.1)',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(211, 80, 63, 0.2)',
              fontSize: '0.95rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <span>Welcome, {user?.name || 'User'}</span>
              <span style={{ 
                fontSize: '0.8rem', 
                color: 'var(--primary-color)', 
                fontWeight: 600,
                textTransform: 'capitalize'
              }}>
                {role || 'User'}
              </span>
            </span>
            <button 
              style={{ 
                background: 'var(--danger-color)',
                color: 'var(--text-inverse)',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: 'var(--shadow-lg)',
                fontSize: '0.95rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = 'var(--shadow-2xl)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'var(--shadow-lg)';
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