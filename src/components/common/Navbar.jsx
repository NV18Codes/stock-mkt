import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import v4Logo from '../../assets/logo-V4.png';

const Navbar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="navbar" style={{ 
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderBottom: '2px solid #00d4aa',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      boxShadow: '0 4px 20px rgba(0, 212, 170, 0.1)',
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
            alt="V4 Fintech Solutions" 
            style={{ 
              height: '70px', 
              width: 'auto',
              borderRadius: '12px',
              boxShadow: '0 8px 25px rgba(0, 212, 170, 0.2)',
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
              color: '#475569', 
              textDecoration: 'none',
              fontWeight: 500,
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              background: 'rgba(0, 212, 170, 0.05)',
              backdropFilter: 'blur(10px)',
              fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#00d4aa';
              e.target.style.background = 'rgba(0, 212, 170, 0.1)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'transparent';
              e.target.style.background = 'rgba(0, 212, 170, 0.05)';
              e.target.style.transform = 'translateY(0)';
            }}>
              Sign In
            </Link>
            <Link to="/signup" style={{ 
              color: '#ffffff',
              border: '2px solid #00d4aa',
              borderRadius: '12px',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 25px rgba(0, 212, 170, 0.3)',
              fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 12px 35px rgba(0, 212, 170, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 25px rgba(0, 212, 170, 0.3)';
            }}>
              Get Started
            </Link>
          </>
        )}
        {isAuthenticated && (
          <>
            <span style={{ 
              color: '#475569', 
              fontWeight: 500,
              background: 'rgba(0, 212, 170, 0.1)',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 212, 170, 0.2)',
              fontSize: '0.95rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <span>Welcome, {user?.name || 'User'}</span>
              <span style={{ 
                fontSize: '0.8rem', 
                color: '#00d4aa', 
                fontWeight: 600,
                textTransform: 'capitalize'
              }}>
                {role || 'User'}
              </span>
            </span>
            <button 
              style={{ 
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 25px rgba(239, 68, 68, 0.3)',
                fontSize: '0.95rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 12px 35px rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.3)';
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