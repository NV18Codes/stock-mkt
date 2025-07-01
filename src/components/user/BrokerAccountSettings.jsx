import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'https://apistocktrading-production.up.railway.app/api';

const BROKERS = [
  { id: 'angelone', name: 'Angel One', apiEndpoint: 'https://apiconnect.angelbroking.com' },
  { id: 'zerodha', name: 'Zerodha', apiEndpoint: 'https://api.kite.trade' },
  { id: 'groww', name: 'Groww', apiEndpoint: 'https://groww.in/api' },
  { id: 'upstox', name: 'Upstox', apiEndpoint: 'https://api.upstox.com' }
];

// Test data for development
const TEST_BROKER_DATA = {
  name: 'User One',
  email: 'user1@gmail.com',
  phone: '+91 98765 43210',
  broker: {
    name: 'Angel One',
    status: 'ACTIVE',
    accountId: 'A123456',
    lastSync: new Date().toISOString()
  },
  portfolio: {
    capitalAmount: 1000000, // 10 Lakhs
    investedAmount: 750000, // 7.5 Lakhs
    availableFunds: 250000, // 2.5 Lakhs
    rmsLimit: 2000000, // 20 Lakhs
    portfolioValue: 825000, // 8.25 Lakhs
    todaysPnL: 15000,
    overallPnL: 75000,
    holdings: [
      {
        symbol: 'RELIANCE',
        quantity: 100,
        avgPrice: 2450.75,
        ltp: 2575.50,
        currentValue: 257550,
        pnl: 12475,
        pnlPercentage: 5.09,
        dayChange: 25.75,
        dayChangePercentage: 1.01
      },
      {
        symbol: 'TCS',
        quantity: 50,
        avgPrice: 3200.00,
        ltp: 3350.25,
        currentValue: 167512.50,
        pnl: 7512.50,
        pnlPercentage: 4.69,
        dayChange: 45.25,
        dayChangePercentage: 1.37
      },
      {
        symbol: 'INFY',
        quantity: 150,
        avgPrice: 1475.50,
        ltp: 1525.75,
        currentValue: 228862.50,
        pnl: 7537.50,
        pnlPercentage: 3.41,
        dayChange: 15.75,
        dayChangePercentage: 1.04
      }
    ],
    history: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      value: 750000 + Math.random() * 100000
    }))
  }
};

const BrokerAccountSettings = () => {
  const [formData, setFormData] = useState({
    broker: '',
    accountId: '',
    apiKey: '',
    apiSecret: '',
    mpin: '',
    totp: ''
  });
  const [brokerData, setBrokerData] = useState(null);
  const [status, setStatus] = useState('NOT_CONNECTED');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      setError('');
      try {
        // For testing, we'll simulate the API call
        const storedStatus = localStorage.getItem('testBrokerStatus');
        const storedBroker = localStorage.getItem('testBrokerData');
        
        if (storedStatus && storedBroker) {
          setStatus(storedStatus);
          setBrokerData(JSON.parse(storedBroker));
          if (storedStatus === 'ACTIVE') {
            setFormData(prev => ({
              ...prev,
              broker: 'angelone',
              accountId: 'A123456',
              mpin: '',
              totp: ''
            }));
          }
        } else {
          setStatus('NOT_CONNECTED');
        }
      } catch (err) {
        console.error('Error fetching broker status:', err);
        setError('Failed to fetch broker status');
        setStatus('NOT_CONNECTED');
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // For testing, we'll simulate the connection
      const initialData = {
        name: 'User One',
        email: 'user1@gmail.com',
        phone: '+91 98765 43210',
        broker: {
          name: formData.broker === 'angelone' ? 'Angel One' :
                formData.broker === 'zerodha' ? 'Zerodha' :
                formData.broker === 'groww' ? 'Groww' : 'Upstox',
          status: 'PENDING_VERIFICATION',
          accountId: formData.accountId,
          lastSync: new Date().toISOString()
        }
      };
      localStorage.setItem('testBrokerStatus', 'PENDING_VERIFICATION');
      localStorage.setItem('testBrokerData', JSON.stringify(initialData));
      setStatus('PENDING_VERIFICATION');
      setBrokerData(initialData);
      setSuccess('Broker connection initiated! Please verify your account.');
    } catch (err) {
      console.error('Error connecting broker:', err);
      setError('Failed to connect broker');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    setError('');
    setSuccess('');
    try {
      // For testing, we'll simulate verification
      const verifiedData = {
        ...TEST_BROKER_DATA,
        broker: {
          ...TEST_BROKER_DATA.broker,
          accountId: formData.accountId,
          lastSync: new Date().toISOString()
        }
      };
      localStorage.setItem('testBrokerStatus', 'ACTIVE');
      localStorage.setItem('testBrokerData', JSON.stringify(verifiedData));
      setStatus('ACTIVE');
      setBrokerData(verifiedData);
      setSuccess('Broker account verified successfully! Your trading information has been synced.');
      setFormData(prev => ({ ...prev, totp: '' }));
    } catch (err) {
      console.error('Error verifying broker:', err);
      setError('Failed to verify broker account');
    } finally {
      setVerifying(false);
    }
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const newStatus = status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      localStorage.setItem('testBrokerStatus', newStatus);
      if (newStatus === 'ACTIVE') {
        const updatedData = {
          ...TEST_BROKER_DATA,
          broker: {
            ...TEST_BROKER_DATA.broker,
            accountId: formData.accountId || 'A123456',
            lastSync: new Date().toISOString()
          }
        };
        localStorage.setItem('testBrokerData', JSON.stringify(updatedData));
        setBrokerData(updatedData);
        setSuccess('Broker account activated and trading information synced');
      } else {
        localStorage.removeItem('testBrokerData');
        setBrokerData(null);
        setSuccess('Broker account deactivated');
      }
      setStatus(newStatus);
    } catch (err) {
      console.error('Error updating broker status:', err);
      setError('Failed to update broker status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 'clamp(2em, 5vw, 4em)', background: '#fff', minHeight: '60vh' }}>
        <div className="loading-spinner" />
        <p style={{ color: '#2c3e50', marginTop: '1em', fontSize: 'clamp(14px, 2.5vw, 16px)', fontWeight: 500 }}>Loading broker settings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 'clamp(2em, 5vw, 3em)' }}>
      <h1 style={{ color: '#007bff', marginBottom: '1.5em', textAlign: 'center', fontWeight: 700, fontSize: 'clamp(1.5em, 4vw, 2.2em)' }}>Broker Settings</h1>

      {error && (
        <div className="error-message" style={{ background: '#f8d7da', color: '#721c24', padding: '1em', borderRadius: 8, marginBottom: '1em', border: '1px solid #f5c6cb', fontWeight: 500 }}>
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message" style={{ background: '#d4edda', color: '#155724', padding: '1em', borderRadius: 8, marginBottom: '1em', border: '1px solid #c3e6cb', fontWeight: 500 }}>
          {success}
        </div>
      )}

      <div className="card" style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.08)', padding: '2em', marginBottom: '2em' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '1em', fontWeight: 600, fontSize: 'clamp(1.1em, 3vw, 1.3em)' }}>Broker Status</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1em', flexWrap: 'wrap', gap: '1em' }}>
          <div>
            <p style={{ color: '#2c3e50', fontWeight: 500 }}>Current Status:
              <span style={{
                color: status === 'ACTIVE' ? '#28a745' : status === 'INACTIVE' ? '#ffc107' : '#dc3545',
                marginLeft: '0.5em',
                fontWeight: 700
              }}>
                {status.replace('_', ' ')}
              </span>
            </p>
            {formData.broker && (
              <p style={{ color: '#6c757d', marginTop: '0.5em', fontWeight: 500 }}>
                Broker: <span style={{ color: '#2c3e50', fontWeight: 600 }}>
                  {BROKERS.find(b => b.id === formData.broker)?.name}
                </span>
              </p>
            )}
          </div>
          {(status === 'ACTIVE' || status === 'INACTIVE') && (
            <button
              className="btn"
              onClick={handleToggleStatus}
              style={{
                background: status === 'ACTIVE' ? '#dc3545' : '#28a745',
                color: '#fff',
                minWidth: 120,
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 'clamp(13px, 2.5vw, 15px)',
                padding: '0.7em 1.2em',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              disabled={loading}
            >
              {loading ? 'Processing...' : status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>
          )}
        </div>

        {brokerData && (
          <div style={{ marginTop: '1em', padding: '1em', background: '#f8f9fa', borderRadius: '6px' }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '1em', fontWeight: 600, fontSize: 'clamp(1em, 2.5vw, 1.1em)' }}>Synced Trading Information</h3>
            <div style={{ display: 'grid', gap: '1em', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <div>
                <p style={{ color: '#6c757d', fontWeight: 500 }}>Capital Amount</p>
                <p style={{ color: '#2c3e50', fontWeight: 600, fontSize: 'clamp(1em, 2.5vw, 1.1em)' }}>
                  ₹{brokerData.portfolio?.capitalAmount?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p style={{ color: '#6c757d', fontWeight: 500 }}>Invested Amount</p>
                <p style={{ color: '#2c3e50', fontWeight: 600, fontSize: 'clamp(1em, 2.5vw, 1.1em)' }}>
                  ₹{brokerData.portfolio?.investedAmount?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p style={{ color: '#6c757d', fontWeight: 500 }}>RMS Limit</p>
                <p style={{ color: '#2c3e50', fontWeight: 600, fontSize: 'clamp(1em, 2.5vw, 1.1em)' }}>
                  ₹{brokerData.portfolio?.rmsLimit?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.08)', padding: '2em' }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#2c3e50', fontWeight: 600, marginBottom: 6, display: 'block' }}>Select Broker</label>
          <select
            name="broker"
            value={formData.broker}
            onChange={handleChange}
            required
            style={{ background: '#fff', color: '#2c3e50', border: '1px solid #e0e0e0', borderRadius: 4, padding: '0.6em', fontSize: 'clamp(13px, 2.5vw, 15px)', fontWeight: 500, width: '100%' }}
            disabled={status !== 'NOT_CONNECTED' && status !== 'PENDING_VERIFICATION'}
          >
            <option value="">Select a broker</option>
            {BROKERS.map(broker => (
              <option key={broker.id} value={broker.id}>
                {broker.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#2c3e50', fontWeight: 600, marginBottom: 6, display: 'block' }}>Account ID</label>
          <input
            type="text"
            name="accountId"
            value={formData.accountId}
            onChange={handleChange}
            placeholder="Enter your broker account ID"
            required
            disabled={status !== 'NOT_CONNECTED' && status !== 'PENDING_VERIFICATION'}
            style={{ background: '#fff', color: '#2c3e50', border: '1px solid #e0e0e0', borderRadius: 4, padding: '0.6em', fontSize: 'clamp(13px, 2.5vw, 15px)', width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#2c3e50', fontWeight: 600, marginBottom: 6, display: 'block' }}>API Key</label>
          <input
            type="text"
            name="apiKey"
            value={formData.apiKey}
            onChange={handleChange}
            placeholder="Enter your API key"
            required
            disabled={status !== 'NOT_CONNECTED' && status !== 'PENDING_VERIFICATION'}
            style={{ background: '#fff', color: '#2c3e50', border: '1px solid #e0e0e0', borderRadius: 4, padding: '0.6em', fontSize: 'clamp(13px, 2.5vw, 15px)', width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#2c3e50', fontWeight: 600, marginBottom: 6, display: 'block' }}>API Secret</label>
          <input
            type="password"
            name="apiSecret"
            value={formData.apiSecret}
            onChange={handleChange}
            placeholder="Enter your API secret"
            required
            disabled={status !== 'NOT_CONNECTED' && status !== 'PENDING_VERIFICATION'}
            style={{ background: '#fff', color: '#2c3e50', border: '1px solid #e0e0e0', borderRadius: 4, padding: '0.6em', fontSize: 'clamp(13px, 2.5vw, 15px)', width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#2c3e50', fontWeight: 600, marginBottom: 6, display: 'block' }}>Broker MPIN</label>
          <input
            type="password"
            name="mpin"
            value={formData.mpin}
            onChange={handleChange}
            placeholder="Enter your broker MPIN"
            required
            pattern="[0-9]{4}"
            maxLength={4}
            disabled={status !== 'NOT_CONNECTED' && status !== 'PENDING_VERIFICATION'}
            style={{ background: '#fff', color: '#2c3e50', border: '1px solid #e0e0e0', borderRadius: 4, padding: '0.6em', fontSize: 'clamp(13px, 2.5vw, 15px)', width: '100%' }}
          />
        </div>

        {status === 'PENDING_VERIFICATION' && (
          <div style={{ marginBottom: 18 }}>
            <label style={{ color: '#2c3e50', fontWeight: 600, marginBottom: 6, display: 'block' }}>TOTP Code</label>
            <div style={{ display: 'flex', gap: '1em' }}>
              <input
                type="text"
                name="totp"
                value={formData.totp}
                onChange={handleChange}
                placeholder="Enter TOTP code (any 6 digits)"
                pattern="[0-9]{6}"
                maxLength={6}
                style={{ flex: 1, background: '#fff', color: '#2c3e50', border: '1px solid #e0e0e0', borderRadius: 4, padding: '0.6em', fontSize: 'clamp(13px, 2.5vw, 15px)' }}
              />
              <button
                type="button"
                className="btn"
                onClick={handleVerify}
                disabled={verifying || !formData.totp}
                style={{ minWidth: 120, background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 'clamp(13px, 2.5vw, 15px)', padding: '0.7em 1.2em', cursor: 'pointer', transition: 'background 0.2s' }}
              >
                {verifying ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>
        )}

        {(status === 'NOT_CONNECTED' || status === 'PENDING_VERIFICATION') && (
          <button
            type="submit"
            className="btn"
            disabled={saving}
            style={{ width: '100%', background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 'clamp(15px, 2.5vw, 17px)', padding: '0.9em 0', marginTop: 8, cursor: 'pointer', transition: 'background 0.2s' }}
          >
            {saving ? 'Connecting...' : 'Connect Broker'}
          </button>
        )}
      </form>
    </div>
  );
};

export default BrokerAccountSettings; 