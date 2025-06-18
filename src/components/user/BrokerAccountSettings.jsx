import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'https://apistocktrading-production.up.railway.app/api';

const BROKERS = [
  { 
    id: 'angelone', 
    name: 'Angel One',
    apiEndpoint: 'https://apiconnect.angelbroking.com'
  },
  { 
    id: 'zerodha', 
    name: 'Zerodha',
    apiEndpoint: 'https://api.kite.trade'
  },
  { 
    id: 'groww', 
    name: 'Groww',
    apiEndpoint: 'https://groww.in/api'
  },
  { 
    id: 'upstox', 
    name: 'Upstox',
    apiEndpoint: 'https://api.upstox.com'
  }
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
      <div style={{ textAlign: 'center', padding: '2em' }}>
        <div className="loading-spinner" />
        <p style={{ color: '#fff', marginTop: '1em' }}>Loading broker settings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '2em' }}>
      <h1 style={{ color: '#007bff', marginBottom: '1.5em', textAlign: 'center' }}>Broker Settings</h1>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="card" style={{ padding: '2em', marginBottom: '2em' }}>
        <h2 style={{ color: '#fff', marginBottom: '1em' }}>Broker Status</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1em' }}>
          <div>
            <p style={{ color: '#cce3ff' }}>Current Status: 
              <span style={{ 
                color: status === 'ACTIVE' ? '#43e97b' : 
                       status === 'INACTIVE' ? '#ff9900' : '#ff4444',
                marginLeft: '0.5em',
                fontWeight: 600
              }}>
                {status.replace('_', ' ')}
              </span>
            </p>
            {formData.broker && (
              <p style={{ color: '#cce3ff', marginTop: '0.5em' }}>
                Broker: <span style={{ color: '#fff', fontWeight: 500 }}>
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
                background: status === 'ACTIVE' ? '#ff4444' : '#43e97b',
                minWidth: 120
              }}
              disabled={loading}
            >
              {loading ? 'Processing...' : status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>
          )}
        </div>

        {brokerData && (
          <div style={{ marginTop: '1em', padding: '1em', background: '#111', borderRadius: '4px' }}>
            <h3 style={{ color: '#fff', marginBottom: '1em' }}>Synced Trading Information</h3>
            <div style={{ display: 'grid', gap: '1em', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div>
                <p style={{ color: '#cce3ff' }}>Capital Amount</p>
                <p style={{ color: '#fff', fontWeight: 500 }}>
                  ₹{brokerData.portfolio?.capitalAmount?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p style={{ color: '#cce3ff' }}>Invested Amount</p>
                <p style={{ color: '#fff', fontWeight: 500 }}>
                  ₹{brokerData.portfolio?.investedAmount?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p style={{ color: '#cce3ff' }}>RMS Limit</p>
                <p style={{ color: '#fff', fontWeight: 500 }}>
                  ₹{brokerData.portfolio?.rmsLimit?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2em' }}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#cce3ff', fontWeight: 500 }}>Select Broker</label>
          <select
            name="broker"
            value={formData.broker}
            onChange={handleChange}
            required
            style={{ background: '#111' }}
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
          <label style={{ color: '#cce3ff', fontWeight: 500 }}>Account ID</label>
          <input
            type="text"
            name="accountId"
            value={formData.accountId}
            onChange={handleChange}
            placeholder="Enter your broker account ID"
            required
            disabled={status !== 'NOT_CONNECTED' && status !== 'PENDING_VERIFICATION'}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#cce3ff', fontWeight: 500 }}>API Key</label>
          <input
            type="text"
            name="apiKey"
            value={formData.apiKey}
            onChange={handleChange}
            placeholder="Enter your API key"
            required
            disabled={status !== 'NOT_CONNECTED' && status !== 'PENDING_VERIFICATION'}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#cce3ff', fontWeight: 500 }}>API Secret</label>
          <input
            type="password"
            name="apiSecret"
            value={formData.apiSecret}
            onChange={handleChange}
            placeholder="Enter your API secret"
            required
            disabled={status !== 'NOT_CONNECTED' && status !== 'PENDING_VERIFICATION'}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#cce3ff', fontWeight: 500 }}>Broker MPIN</label>
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
          />
        </div>

        {status === 'PENDING_VERIFICATION' && (
          <div style={{ marginBottom: 18 }}>
            <label style={{ color: '#cce3ff', fontWeight: 500 }}>TOTP Code</label>
            <div style={{ display: 'flex', gap: '1em' }}>
              <input
                type="text"
                name="totp"
                value={formData.totp}
                onChange={handleChange}
                placeholder="Enter TOTP code (any 6 digits)"
                pattern="[0-9]{6}"
                maxLength={6}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn"
                onClick={handleVerify}
                disabled={verifying || !formData.totp}
                style={{ minWidth: 120 }}
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
            style={{ width: '100%' }}
          >
            {saving ? 'Connecting...' : 'Connect Broker'}
          </button>
        )}
      </form>
    </div>
  );
};

export default BrokerAccountSettings; 