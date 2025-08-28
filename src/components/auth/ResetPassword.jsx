import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../../api/auth';
import v4Logo from '../../assets/Logo-updated-removebg-preview.png';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // This code runs when the component mounts. It parses the URL hash fragment.
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1)); // Remove the '#'
      const token = params.get('access_token');
      if (token) {
        setAccessToken(token);
      } else {
        setError("No recovery token found in the URL. The link may be invalid.");
      }
    }
  }, []);

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push(`At least ${minLength} characters`);
    if (!hasUpperCase) errors.push('One uppercase letter');
    if (!hasLowerCase) errors.push('One lowercase letter');
    if (!hasNumbers) errors.push('One number');
    if (!hasSpecialChar) errors.push('One special character');

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (!accessToken) {
      setError('Could not update password. Token is missing.');
      return;
    }
    
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(`Password requirements: ${passwordErrors.join(', ')}`);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await resetPassword({ password, accessToken });
      setSuccess(true);
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || 'Failed to reset password');
      } else if (err.request) {
        setError('No response from server. Please check your network or try again later.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
          border: '1px solid var(--border-primary)',
          textAlign: 'center'
        }}>
          {/* Success Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2rem',
            color: 'white',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
          }}>
            <CheckCircle />
          </div>

          <h1 style={{ 
            color: 'var(--text-primary)', 
            fontSize: 'clamp(1.5rem, 3vw, 2rem)', 
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            Password Reset Successfully
          </h1>
          
          <p style={{ 
            color: '#475569', 
            fontSize: '1rem',
            marginBottom: '2rem',
            lineHeight: '1.6'
          }}>
            Your password has been successfully reset. You can now log in with your new password.
          </p>

          <Link to="/login" style={{
            display: 'inline-block',
            padding: '1rem 2rem',
            background: 'var(--gradient-primary)',
            color: 'var(--text-inverse)',
            textDecoration: 'none',
            borderRadius: '10px',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 30px rgba(0, 212, 170, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 15px 40px rgba(0, 212, 170, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 10px 30px rgba(0, 212, 170, 0.3)';
          }}>
            Go to Login
          </Link>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </div>
    );
  }

  if (!accessToken && !error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--gradient-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}>
        <div style={{
          background: 'var(--gradient-card)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          boxShadow: 'var(--shadow-xl)',
          padding: '3rem 2.5rem',
          width: '100%',
          maxWidth: '450px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '2rem',
            color: 'white',
            boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)'
          }}>
            ⏳
          </div>
          <h2 style={{ 
            color: 'var(--text-primary)', 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            Verifying Link...
          </h2>
          <p style={{ 
            color: '#475569', 
            fontSize: '1rem',
            margin: 0
          }}>
            Please wait while we verify your password reset link.
          </p>
        </div>
      </div>
    );
  }

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

      {/* Back to Login Button */}
      <Link to="/login" style={{
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
        <ArrowLeft />
        Back to Login
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
            Reset Password
          </h1>
          <p style={{ 
            color: '#475569', 
            fontSize: '1rem',
            margin: 0,
            fontWeight: '500'
          }}>
            Enter your new password below
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* New Password Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              color: 'var(--text-primary)', 
              fontWeight: '600',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              display: 'block'
            }}>
              New Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ 
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
                placeholder="Enter new password"
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
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              color: 'var(--text-primary)', 
              fontWeight: '600',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              display: 'block'
            }}>
              Confirm New Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ 
                position: 'absolute', 
                left: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--primary-color)', 
                fontSize: '1.1rem' 
              }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div style={{ 
            background: 'rgba(0, 212, 170, 0.1)', 
            border: '1px solid rgba(0, 212, 170, 0.2)',
            borderRadius: '10px',
            padding: '1rem',
            marginBottom: '2rem'
          }}>
            <p style={{ 
              color: '#065f46', 
              fontSize: '0.9rem',
              margin: '0 0 0.5rem 0',
              fontWeight: '600'
            }}>
              Password Requirements:
            </p>
            <ul style={{ 
              color: '#065f46', 
              fontSize: '0.85rem',
              margin: 0,
              paddingLeft: '1.2rem'
            }}>
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
              <li>One special character</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading ? '#6c757d' : 'var(--gradient-primary)',
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
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          {/* Back to Login Link */}
          <div style={{ 
            textAlign: 'center', 
            color: 'var(--text-secondary)',
            fontSize: '0.95rem'
          }}>
            Remember your password?{' '}
            <Link to="/login" style={{ 
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
              Back to Login
            </Link>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;
