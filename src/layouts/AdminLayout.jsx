import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

const AdminLayout = () => {
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      console.log('AdminLayout Mobile check:', { width: window.innerWidth, mobile });
      setIsMobile(mobile);
      if (mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Debug mobile state
  useEffect(() => {
    console.log('AdminLayout Mobile state changed:', { isMobile, isMobileMenuOpen });
  }, [isMobile, isMobileMenuOpen]);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--gradient-bg)', 
      color: 'var(--text-primary)', 
      display: 'flex',
      fontFamily: 'var(--font-family)',
      position: 'relative'
    }}>
      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 998,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            paddingTop: '5rem'
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '16px',
              margin: '1rem',
              minWidth: '250px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
              border: '1px solid #e2e8f0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#0f172a',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              Admin Menu
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link 
                to="/admin" 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  color: '#475569',
                  textDecoration: 'none',
                  fontWeight: '500',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f1f5f9';
                  e.target.style.borderColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = '#e2e8f0';
                }}
              >
                📊 Dashboard
              </Link>
              <Link 
                to="/admin/users" 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  color: '#475569',
                  textDecoration: 'none',
                  fontWeight: '500',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f1f5f9';
                  e.target.style.borderColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = '#e2e8f0';
                }}
              >
                👥 User Management
              </Link>
              <Link 
                to="/admin/trades" 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  color: '#475569',
                  textDecoration: 'none',
                  fontWeight: '500',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f1f5f9';
                  e.target.style.borderColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = '#e2e8f0';
                }}
              >
                📈 Trade Monitoring
              </Link>
              <Link 
                to="/admin/settings" 
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  color: '#475569',
                  textDecoration: 'none',
                  fontWeight: '500',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f1f5f9';
                  e.target.style.borderColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = '#e2e8f0';
                }}
              >
                ⚙️ System Settings
              </Link>
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: 'white',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Toggle - Always visible on mobile */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 10000,
            background: '#2563eb',
            border: '2px solid white',
            borderRadius: '12px',
            padding: '1rem',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)',
            minWidth: '56px',
            minHeight: '56px',
            fontSize: '1.2rem'
          }}
          title={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      )}

      {/* Sidebar */}
      <div style={{
        width: isMobile ? (isMobileMenuOpen ? '280px' : '0') : '250px',
        background: 'var(--gradient-card)',
        padding: '2em 1em',
        borderRight: '1px solid var(--border-primary)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        backdropFilter: 'blur(10px)',
        position: isMobile ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        height: '100vh',
        overflowY: 'auto',
        zIndex: 999,
        transform: isMobile && !isMobileMenuOpen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2em',
          paddingBottom: '1em',
          borderBottom: '1px solid var(--border-primary)'
        }}>
          <h2 style={{ 
            color: 'var(--text-primary)', 
            fontSize: '1.5em', 
            fontWeight: 600,
            margin: 0
          }}>
            Admin Panel
          </h2>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '0.9em', 
            margin: '0.5em 0 0 0' 
          }}>
            V4 Fintech Solutions
          </p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', flex: 1 }}>
          <NavLink
            to="/admin"
            end
            style={({ isActive }) => ({
              padding: '1em 1.2em',
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
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/users"
            style={({ isActive }) => ({
              padding: '1em 1.2em',
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
            to="/admin/trades"
            style={({ isActive }) => ({
              padding: '1em 1.2em',
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
            Trade Monitoring
          </NavLink>

          <NavLink
            to="/admin/settings"
            style={({ isActive }) => ({
              padding: '1em 1.2em',
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
            System Settings
          </NavLink>
        </nav>

        <button 
          onClick={handleLogout}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, var(--danger-color), var(--danger-hover))',
            color: 'var(--text-inverse)',
            border: 'none',
            padding: '1em 1.2em',
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

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        background: 'var(--gradient-bg)', 
        overflowY: 'auto',
        minHeight: '100vh',
        marginLeft: isMobile ? '0' : 'auto',
        width: isMobile ? '100%' : 'auto'
      }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout; 