import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaChartLine, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import v4Logo from '../../assets/Logo-updated-removebg-preview.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin-panel', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || JSON.stringify(err.response.data) || 'Login failed');
      } else if (err.request) {
        setError('No response from server. Please check your network or try again later.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--gradient-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Animation */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2300d4aa" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        animation: 'float 20s ease-in-out infinite'
      }} />

      {/* Back to Home Button */}
      <Link to="/" style={{
        position: 'absolute',
        top: '2rem',
        left: '2rem',
        color: 'var(--text-primary)',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '1rem',
        fontWeight: '500',
        zIndex: 10,
        transition: 'all 0.3s ease',
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = 'rgba(0, 212, 170, 0.1)';
        e.target.style.borderColor = 'var(--primary-color)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
        e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }}>
        <FaArrowLeft />
        Back to Home
      </Link>

      <div style={{
        background: 'var(--gradient-card)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-xl)',
        padding: '3rem 2.5rem',
        width: '100%',
        maxWidth: '450px',
        position: 'relative',
        zIndex: 2,
        border: '1px solid var(--border-primary)'
      }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '2.5rem' 
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            background: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2rem',
            color: 'var(--text-inverse)',
            boxShadow: '0 10px 30px rgba(0, 212, 170, 0.3)',
            border: '2px solid var(--primary-color)',
            padding: '8px'
          }}>
            <img 
              src={v4Logo} 
              alt="V4 Fintech Solutions" 
              style={{ 
                height: '120px', 
                width: 'auto',
                borderRadius: '50%'
              }}
            />
          </div>
          <h1 style={{ 
            color: 'var(--text-primary)', 
            fontSize: 'clamp(1.5rem, 3vw, 2rem)', 
            fontWeight: 'bold',
            marginBottom: '0.5rem'
          }}>
            Welcome Back
          </h1>
          <p style={{ 
            color: '#475569', 
            fontSize: '1rem',
            margin: 0,
            fontWeight: '500'
          }}>
            Sign in to your V4 Fintech Solutions account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            background: 'linear-gradient(135deg, var(--danger-color), var(--danger-hover))',
            color: 'var(--text-inverse)',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            boxShadow: '0 5px 15px rgba(239, 68, 68, 0.3)'
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              color: 'var(--text-primary)', 
              fontWeight: '600',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              display: 'block'
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <FaEnvelope style={{ 
                position: 'absolute', 
                left: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--primary-color)', 
                fontSize: '1.1rem' 
              }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  border: '2px solid var(--border-primary)',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 212, 170, 0.1)';
                  e.target.style.background = 'var(--bg-tertiary)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-primary)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = 'var(--bg-surface)';
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              color: 'var(--text-primary)', 
              fontWeight: '600',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              display: 'block'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ 
                position: 'absolute', 
                left: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--primary-color)', 
                fontSize: '1.1rem' 
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  border: '2px solid var(--border-primary)',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 212, 170, 0.1)';
                  e.target.style.background = 'var(--bg-tertiary)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-primary)';
                  e.target.style.boxShadow = 'none';
                  e.target.style.background = 'var(--bg-surface)';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary-color)',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div style={{ 
            textAlign: 'right', 
            marginBottom: '2rem' 
          }}>
            <Link to="/forgot-password" style={{ 
              color: 'var(--primary-color)', 
              fontSize: '0.9rem',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = 'var(--primary-light)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'var(--primary-color)';
            }}>
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'var(--gradient-primary)',
              color: 'var(--text-inverse)',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(0, 212, 170, 0.3)',
              marginBottom: '2rem'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 15px 40px rgba(0, 212, 170, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 30px rgba(0, 212, 170, 0.3)';
              }
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Sign Up Link */}
          <div style={{ 
            textAlign: 'center', 
            color: 'var(--text-secondary)',
            fontSize: '0.95rem'
          }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ 
              color: 'var(--primary-color)', 
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = 'var(--primary-light)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'var(--primary-color)';
            }}>
              Sign Up
            </Link>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @media (max-width: 768px) {
          .login-container {
            padding: 2rem 1rem;
          }
          
          .login-form {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Login; 