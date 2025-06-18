import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../../api/auth';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #000 60%, #0a1a2f 100%)', padding: '2em 1em' }}>
      <form className="card" style={{ minWidth: 340, maxWidth: 400, width: '100%', boxShadow: '0 8px 32px #007bff33', padding: '2.5em 2em' }} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 44, color: '#007bff', marginBottom: 8 }}>📈</span>
          <h2 style={{ color: '#007bff', textAlign: 'center', margin: 0, fontWeight: 700, letterSpacing: 1 }}>Create Your Account</h2>
        </div>

        {error && (
          <div style={{ color: '#ff4444', background: '#ff444422', padding: '0.75em', borderRadius: 4, marginBottom: '1em', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#cce3ff', fontWeight: 500 }}>Full Name</label>
          <div style={{ position: 'relative' }}>
            <FaUser style={{ position: 'absolute', left: 12, top: 13, color: '#007bff', fontSize: 18 }} />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              style={{ paddingLeft: 38, width: '100%' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#cce3ff', fontWeight: 500 }}>Phone Number</label>
          <div style={{ position: 'relative' }}>
            <FaPhone style={{ position: 'absolute', left: 12, top: 13, color: '#007bff', fontSize: 18 }} />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
              pattern="[0-9]{10}"
              style={{ paddingLeft: 38, width: '100%' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#cce3ff', fontWeight: 500 }}>Email</label>
          <div style={{ position: 'relative' }}>
            <FaEnvelope style={{ position: 'absolute', left: 12, top: 13, color: '#007bff', fontSize: 18 }} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              style={{ paddingLeft: 38, width: '100%' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#cce3ff', fontWeight: 500 }}>Create Password</label>
          <div style={{ position: 'relative' }}>
            <FaLock style={{ position: 'absolute', left: 12, top: 13, color: '#007bff', fontSize: 18 }} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              minLength={8}
              style={{ paddingLeft: 38, width: '100%' }}
            />
            <span
              onClick={() => setShowPassword(v => !v)}
              style={{ position: 'absolute', right: 12, top: 12, cursor: 'pointer', color: '#007bff', fontSize: 18 }}
              tabIndex={0}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#cce3ff', fontWeight: 500 }}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <FaLock style={{ position: 'absolute', left: 12, top: 13, color: '#007bff', fontSize: 18 }} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              minLength={8}
              style={{ paddingLeft: 38, width: '100%' }}
            />
            <span
              onClick={() => setShowConfirmPassword(v => !v)}
              style={{ position: 'absolute', right: 12, top: 12, cursor: 'pointer', color: '#007bff', fontSize: 18 }}
              tabIndex={0}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        <button 
          className="btn" 
          type="submit" 
          style={{ width: '100%', fontSize: 18, fontWeight: 600, marginBottom: 10 }} 
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <div style={{ marginTop: '1em', textAlign: 'center', color: '#cce3ff', fontSize: 15 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#007bff', fontWeight: 600 }}>Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Signup; 