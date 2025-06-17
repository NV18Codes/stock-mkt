import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signout } from '../../api/auth';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');
        const res = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('User info API response:', res.data);
        const userData = res.data.data?.user || res.data.data || res.data.user || res.data;
        setUser(userData);
      } catch (err) {
        console.log('User info fetch error:', err);
        setError('Failed to fetch user info. Please login again.');
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signout();
    } catch (e) {}
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2em 1em' }}>
      <h1 style={{ color: '#007bff', marginBottom: '1.5em', fontWeight: 700 }}>Welcome to Your Dashboard</h1>
      {loading ? (
        <p style={{ color: '#fff' }}>Loading user info...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : user ? (
        <div className="card" style={{ minWidth: 320, maxWidth: 400, textAlign: 'center', margin: '0 auto', padding: '2em 1.5em', borderRadius: 18, boxShadow: '0 8px 32px #007bff33' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18 }}>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email || 'User')}&background=007bff&color=fff&size=128&rounded=true`}
              alt="avatar"
              style={{ width: 80, height: 80, borderRadius: '50%', boxShadow: '0 2px 12px #007bff55', marginBottom: 10 }}
            />
            <h2 style={{ color: '#fff', margin: 0 }}>{user.name || user.email || user.id}</h2>
            {user.email && <p style={{ color: '#007bff', margin: 0 }}>{user.email}</p>}
            {user.id && <p style={{ color: '#ccc', margin: 0, fontSize: '0.95em' }}>User ID: {user.id}</p>}
            {user.role && <p style={{ color: '#cce3ff', margin: 0, fontSize: '0.95em' }}>Role: {user.role}</p>}
          </div>
          {/* Quick Actions */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1em', margin: '1.5em 0' }}>
            <Link to="/profile"><button className="btn" style={{ minWidth: 90 }}>Profile</button></Link>
            <Link to="/trade"><button className="btn" style={{ minWidth: 90, background: 'linear-gradient(90deg, #00c6ff 60%, #0072ff 100%)' }}>Trade</button></Link>
            <Link to="/broker"><button className="btn" style={{ minWidth: 90, background: 'linear-gradient(90deg, #43e97b 60%, #38f9d7 100%)', color: '#000' }}>Broker</button></Link>
          </div>
          <button className="btn" onClick={handleLogout} style={{ width: '100%', marginTop: 10 }}>Logout</button>
        </div>
      ) : null}
    </div>
  );
};

export default UserDashboard; 