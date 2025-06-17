import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../../api/auth';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
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
      const res = await signup({ name, email, password });
      // After signup, log the user in
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin-panel', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #000 60%, #0a1a2f 100%)', padding: '2em 1em' }}>
      <form className="card" style={{ minWidth: 340, maxWidth: 400, width: '100%', boxShadow: '0 8px 32px #007bff33', padding: '2.5em 2em', position: 'relative' }} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 44, color: '#007bff', marginBottom: 8 }}>📈</span>
          <h2 style={{ color: '#007bff', textAlign: 'center', margin: 0, fontWeight: 700, letterSpacing: 1 }}>Create Your Account</h2>
        </div>
        {error && <div style={{ color: 'red', marginBottom: '1em', textAlign: 'center', wordBreak: 'break-word' }}>{error}</div>}
        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#cce3ff', fontWeight: 500 }}>Name</label>
          <div style={{ position: 'relative' }}>
            <FaUser style={{ position: 'absolute', left: 12, top: 13, color: '#007bff', fontSize: 18 }} />
            <input
              type="text"
              value={name || ''}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              required
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
              value={email || ''}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{ paddingLeft: 38, width: '100%' }}
            />
          </div>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ color: '#cce3ff', fontWeight: 500 }}>Password</label>
          <div style={{ position: 'relative' }}>
            <FaLock style={{ position: 'absolute', left: 12, top: 13, color: '#007bff', fontSize: 18 }} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password || ''}
              onChange={e => setPassword(e.target.value)}
              placeholder="Create a password"
              required
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
        <button className="btn" type="submit" style={{ width: '100%', fontSize: 18, fontWeight: 600, marginBottom: 10 }} disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
        <div style={{ marginTop: '1em', textAlign: 'center', color: '#cce3ff', fontSize: 15 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#007bff', fontWeight: 600 }}>Login</Link>
        </div>
      </form>
    </div>
  );
};

export default Signup; 