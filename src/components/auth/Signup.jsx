import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../../api/auth';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone, FaChartLine, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import v4Logo from '../../assets/logo-V4.png';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    try {
      const signupData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password
      };
      await signup(signupData);
      // After signup, log the user in
      const user = await login(formData.email, formData.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
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
        maxWidth: '500px',
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
            width: '80px',
            height: '80px',
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
                height: '80px', 
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
            Create Your Account
          </h1>
          <p style={{ 
            color: '#475569', 
            fontSize: '1rem',
            margin: 0,
            fontWeight: '500'
          }}>
            Join V4 Fintech Solutions and start your trading journey
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

        {/* Signup Form */}
        <form onSubmit={handleSubmit}>
          {/* Full Name Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              color: 'var(--text-primary)', 
              fontWeight: '600',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              display: 'block'
            }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <FaUser style={{ 
                position: 'absolute', 
                left: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--primary-color)', 
                fontSize: '1.1rem' 
              }} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
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

          {/* Phone Number Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              color: 'var(--text-primary)', 
              fontWeight: '600',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              display: 'block'
            }}>
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <FaPhone style={{ 
                position: 'absolute', 
                left: '1rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--primary-color)', 
                fontSize: '1.1rem' 
              }} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
                pattern="[0-9]{10}"
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
                name="email"
                value={formData.email}
                onChange={handleChange}
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
              Create Password
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                minLength={8}
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

          {/* Confirm Password Field */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              color: 'var(--text-primary)', 
              fontWeight: '600',
              fontSize: '0.9rem',
              marginBottom: '0.5rem',
              display: 'block'
            }}>
              Confirm Password
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
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                minLength={8}
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
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Create Account Button */}
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Login Link */}
          <div style={{ 
            textAlign: 'center', 
            color: 'var(--text-secondary)',
            fontSize: '0.95rem'
          }}>
            Already have an account?{' '}
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
              Sign In
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
          .signup-container {
            padding: 2rem 1rem;
          }
          
          .signup-form {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Signup; 