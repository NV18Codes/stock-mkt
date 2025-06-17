import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const BrokerAccountSettings = () => {
  const [form, setForm] = useState({ brokerName: '', accountId: '', apiKey: '', apiSecret: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API}/users/me/broker/status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStatus(res.data.status || JSON.stringify(res.data));
      } catch (err) {
        setStatus('Not Connected');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/users/me/profileUpdate`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Broker account updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update broker account');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: '#007bff' }}>Broker Account Settings</h1>
      {loading ? (
        <p>Loading broker status...</p>
      ) : (
        <div className="card" style={{ minWidth: 320, marginBottom: '2em', textAlign: 'center' }}>
          <strong>Status:</strong> <span style={{ color: status === 'Connected' ? 'lightgreen' : 'orange' }}>{status}</span>
        </div>
      )}
      <form className="card" style={{ minWidth: 320 }} onSubmit={handleSubmit}>
        {error && <div style={{ color: 'red', marginBottom: '1em', textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: 'lightgreen', marginBottom: '1em', textAlign: 'center' }}>{success}</div>}
        <div>
          <label>Broker Name</label>
          <input name="brokerName" value={form.brokerName || ''} onChange={handleChange} required />
        </div>
        <div>
          <label>Account ID</label>
          <input name="accountId" value={form.accountId || ''} onChange={handleChange} required />
        </div>
        <div>
          <label>API Key</label>
          <input name="apiKey" value={form.apiKey || ''} onChange={handleChange} required />
        </div>
        <div>
          <label>API Secret</label>
          <input name="apiSecret" value={form.apiSecret || ''} onChange={handleChange} required />
        </div>
        <button className="btn" type="submit" style={{ width: '100%' }} disabled={saving}>{saving ? 'Saving...' : 'Save Broker Account'}</button>
      </form>
    </div>
  );
};

export default BrokerAccountSettings; 