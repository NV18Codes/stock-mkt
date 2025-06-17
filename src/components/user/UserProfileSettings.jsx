import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const UserProfileSettings = () => {
  const [user, setUser] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user || res.data);
      } catch (err) {
        setError('Failed to fetch user info');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/users/me/profileUpdate`, { name: user.name, email: user.email }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Profile update payload:', { name: user.name, email: user.email });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.log('Profile update error:', err.response?.data || err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #000 60%, #0a1a2f 100%)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2em 1em' }}>
      <form className="card" style={{ minWidth: 340, maxWidth: 400, width: '100%', boxShadow: '0 8px 32px #007bff33', padding: '2.5em 2em', position: 'relative' }} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email || 'User')}&background=007bff&color=fff&size=128&rounded=true`}
            alt="avatar"
            style={{ width: 80, height: 80, borderRadius: '50%', boxShadow: '0 2px 12px #007bff55', marginBottom: 10 }}
          />
          <h2 style={{ color: '#007bff', textAlign: 'center', margin: 0, fontWeight: 700, letterSpacing: 1 }}>Profile Settings</h2>
        </div>
        {error && <div style={{ color: 'red', marginBottom: '1em', textAlign: 'center', wordBreak: 'break-word' }}>{error}</div>}
        {success && <div style={{ color: 'lightgreen', marginBottom: '1em', textAlign: 'center' }}>{success}</div>}
        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#cce3ff', fontWeight: 500 }}>Name</label>
          <input
            name="name"
            value={user.name || ''}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#cce3ff', fontWeight: 500 }}>Email</label>
          <input
            name="email"
            value={user.email || ''}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>
        <button className="btn" type="submit" style={{ width: '100%', fontSize: 18, fontWeight: 600, marginBottom: 10 }} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
};

export default UserProfileSettings; 