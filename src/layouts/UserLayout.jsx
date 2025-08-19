import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

const UserLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      console.log('Mobile check:', { width: window.innerWidth, mobile });
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarCollapsed(true);
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Debug mobile state
  useEffect(() => {
    console.log('Mobile state changed:', { isMobile, isMobileMenuOpen });
  }, [isMobile, isMobileMenuOpen]);

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
    if (path === '/dashboard/profile-settings') return 'Profile Settings';
    return 'Dashboard';
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
              Menu
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link 
                to="/dashboard" 
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
                📈 Trading Portal
              </Link>
              <Link 
                to="/dashboard/profile-settings" 
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
                👤 Profile Settings
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
        width: isMobile ? (isMobileMenuOpen ? '280px' : '0') : (isSidebarCollapsed ? '80px' : '280px'),
        background: 'var(--gradient-card)',
        padding: isSidebarCollapsed && !isMobile ? '1.5em 0.5em' : '2em 1.5em',
        borderRight: '1px solid var(--border-primary)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        transition: 'all 0.3s ease',
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        left: 0,
        height: '100vh',
        overflowY: 'auto',
        backdropFilter: 'blur(10px)',
        zIndex: 999,
        transform: isMobile && !isMobileMenuOpen ? 'translateX(-100%)' : 'translateX(0)'
      }}>
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

        {/* Sidebar Toggle - Only show on desktop */}
        {!isMobile && (
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
        )}

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
        minHeight: '100vh',
        marginLeft: isMobile ? '0' : 'auto',
        width: isMobile ? '100%' : 'auto'
      }}>
        {/* Top Bar */}
        <div style={{
          background: 'var(--gradient-card)',
          padding: isMobile ? '1em' : '1em 2em',
          borderBottom: '1px solid var(--border-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-md)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(10px)',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? '0.5em' : '0'
        }}>
          <div>
            <h1 style={{ 
              color: 'var(--text-primary)', 
              margin: 0, 
              fontSize: isMobile ? '1.2em' : '1.5em',
              fontWeight: 600
            }}>
              {getActiveRouteName()}
            </h1>
            {!isMobile && (
              <p style={{ 
                color: 'var(--text-secondary)', 
                margin: '0.2em 0 0 0', 
                fontSize: '0.9em' 
              }}>
                Manage your trading account and preferences
              </p>
            )}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '0.5em' : '1em',
            flexWrap: isMobile ? 'wrap' : 'nowrap'
          }}>
            {!isMobile && (
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
            )}
            
            <div style={{
              width: isMobile ? '35px' : '40px',
              height: isMobile ? '35px' : '40px',
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-inverse)',
              fontSize: isMobile ? '0.8em' : '1em',
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