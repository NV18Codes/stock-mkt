import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  addBrokerAccount,
  verifyBrokerConnection,
  fetchMyBrokerProfile,
  fetchBrokerConnectionStatus,
  clearBrokerProfile,
  getDematLimit
} from '../../api/auth';

const API = 'https://apistocktrading-production.up.railway.app/api';

const BROKERS = [
  { id: 'angelone', name: 'Angel One', apiEndpoint: 'https://apiconnect.angelbroking.com', logo: '🟢' },
  { id: 'zerodha', name: 'Zerodha', apiEndpoint: 'https://api.kite.trade', logo: '🔵' },
  { id: 'groww', name: 'Groww', apiEndpoint: 'https://groww.in/api', logo: '🟣' },
  { id: 'upstox', name: 'Upstox', apiEndpoint: 'https://api.upstox.com', logo: '🟠' }
];

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
  const [dematLimit, setDematLimit] = useState(null);
  const [showConnectForm, setShowConnectForm] = useState(false);

  const fetchBrokerInfo = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch broker connection status
      const statusRes = await fetchBrokerConnectionStatus();
      const statusValue = statusRes.data?.status || 'NOT_CONNECTED';
      setStatus(statusValue);
      
      // Fetch broker profile if connected
      if (statusValue === 'ACTIVE') {
        const profileRes = await fetchMyBrokerProfile();
        setBrokerData(profileRes.data);
        setFormData(prev => ({
          ...prev,
          broker: profileRes.data?.brokerName || '',
          accountId: profileRes.data?.accountId || '',
          mpin: '',
          totp: ''
        }));
        
        // Fetch demat limit
        try {
          const dematRes = await getDematLimit();
          setDematLimit(dematRes.data);
        } catch (dematErr) {
          console.error('Error fetching demat limit:', dematErr);
          setDematLimit(null);
        }
      } else {
        setBrokerData(null);
        setDematLimit(null);
      }
    } catch (err) {
      console.error('Error fetching broker info:', err);
      setError('Failed to fetch broker status');
      setStatus('NOT_CONNECTED');
      setBrokerData(null);
      setDematLimit(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokerInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.broker || !formData.accountId || !formData.apiKey || !formData.apiSecret) {
      setError('Please fill in all required fields');
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await addBrokerAccount({
        broker: formData.broker,
        accountId: formData.accountId,
        apiKey: formData.apiKey,
        apiSecret: formData.apiSecret
      });
      
      if (response.success) {
        setSuccess('Broker account connected successfully! Please complete the verification step below with your MPIN and TOTP.');
        setStatus('CONNECTED');
        setShowConnectForm(false);
        // Don't refresh - let user complete verification
        // Refresh broker data after a delay without page reload
        setTimeout(() => {
          fetchBrokerInfo();
        }, 1000);
      } else {
        setError(response.message || 'Failed to connect broker account');
      }
    } catch (err) {
      console.error('Error connecting broker:', err);
      setError(err.response?.data?.message || 'Failed to connect broker account');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    // Validation
    if (!formData.mpin || !formData.totp) {
      setError('Please enter both MPIN and TOTP code');
      return;
    }
    
    setVerifying(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await verifyBrokerConnection({
        mpin: formData.mpin,
        totp: formData.totp
      });
      
      if (response.success) {
        setSuccess('Broker connection verified successfully! Your account is now active for trading.');
        setStatus('ACTIVE');
        // Refresh broker data without page reload
        setTimeout(() => {
          fetchBrokerInfo();
        }, 1000);
      } else {
        setError(response.message || 'Failed to verify broker connection');
      }
    } catch (err) {
      console.error('Error verifying broker:', err);
      setError(err.response?.data?.message || 'Failed to verify broker connection');
    } finally {
      setVerifying(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to disconnect your broker account? This action cannot be undone.')) {
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await clearBrokerProfile();
      setSuccess('Broker account disconnected successfully');
      setStatus('NOT_CONNECTED');
      setBrokerData(null);
      setDematLimit(null);
      setFormData({
        broker: '',
        accountId: '',
        apiKey: '',
        apiSecret: '',
        mpin: '',
        totp: ''
      });
    } catch (err) {
      console.error('Error clearing broker:', err);
      setError(err.response?.data?.message || 'Failed to disconnect broker account');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'NOT_CONNECTED': { color: '#dc3545', bg: '#f8d7da', text: 'Not Connected', icon: '❌' },
      'CONNECTED': { color: '#856404', bg: '#fff3cd', text: 'Connected', icon: '⚠️' },
      'ACTIVE': { color: '#155724', bg: '#d4edda', text: 'Active', icon: '✅' },
      'VERIFYING': { color: '#0c5460', bg: '#d1ecf1', text: 'Verifying', icon: '🔄' }
    };
    
    const config = statusConfig[status] || statusConfig['NOT_CONNECTED'];
    
    return (
      <span style={{
        color: config.color,
        background: config.bg,
        padding: '0.4em 0.8em',
        borderRadius: '20px',
        fontSize: 'clamp(11px, 2.5vw, 13px)',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3em'
      }}>
        <span>{config.icon}</span>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '3em',
        background: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="loading-spinner" style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e3e3e3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1em'
        }} />
        <p style={{ 
          color: '#2c3e50', 
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          fontWeight: 500
        }}>
          Loading broker settings...
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      padding: 'clamp(1.5em, 3vw, 2em)', 
      background: '#f8f9fa', 
      minHeight: '100vh' 
    }}>
      <h1 style={{ 
        color: '#2c3e50', 
        marginBottom: '1.5em', 
        textAlign: 'center', 
        fontWeight: 600, 
        fontSize: 'clamp(1.8em, 4vw, 2.2em)'
      }}>
        Broker Account Settings
      </h1>
      
      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '1em', 
          borderRadius: '8px', 
          marginBottom: '1.5em', 
          border: '1px solid #f5c6cb', 
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5em'
        }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div style={{ 
          background: '#d4edda', 
          color: '#155724', 
          padding: '1em', 
          borderRadius: '8px', 
          marginBottom: '1.5em', 
          border: '1px solid #c3e6cb', 
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5em'
        }}>
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gap: '2em', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' 
      }}>
        {/* Current Status */}
        <div style={{ 
          padding: '2em', 
          background: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
          border: '1px solid #e0e0e0' 
        }}>
          <h2 style={{ 
            color: '#2c3e50', 
            marginBottom: '1.5em', 
            fontWeight: 600, 
            fontSize: '1.4em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}>
            <span>📊</span>
            Connection Status
          </h2>
          
          <div style={{ display: 'grid', gap: '1.5em' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '1em',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <span style={{ color: '#495057', fontSize: 14, fontWeight: 500 }}>Status</span>
              {getStatusBadge(status)}
            </div>
            
            {brokerData && (
              <>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1em',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <span style={{ color: '#495057', fontSize: 14, fontWeight: 500 }}>Broker</span>
                  <span style={{ color: '#2c3e50', fontSize: 14, fontWeight: 600 }}>
                    {brokerData.brokerName || 'Unknown'}
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1em',
                  background: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <span style={{ color: '#495057', fontSize: 14, fontWeight: 500 }}>Account ID</span>
                  <span style={{ color: '#2c3e50', fontSize: 14, fontWeight: 600 }}>
                    {brokerData.accountId || 'N/A'}
                  </span>
                </div>
              </>
            )}
            
            {dematLimit && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1em',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <span style={{ color: '#495057', fontSize: 14, fontWeight: 500 }}>Available Balance</span>
                <span style={{ color: '#28a745', fontSize: 14, fontWeight: 600 }}>
                  ₹{dematLimit.net?.toLocaleString() || '0'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ 
          padding: '2em', 
          background: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
          border: '1px solid #e0e0e0' 
        }}>
          <h2 style={{ 
            color: '#2c3e50', 
            marginBottom: '1.5em', 
            fontWeight: 600, 
            fontSize: '1.4em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}>
            <span>⚙️</span>
            Actions
          </h2>
          
          <div style={{ display: 'grid', gap: '1em' }}>
            {status === 'NOT_CONNECTED' && (
              <button
                onClick={() => setShowConnectForm(true)}
                style={{
                  width: '100%',
                  padding: '1em',
                  background: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Connect Broker Account
              </button>
            )}
            
            {status === 'CONNECTED' && (
              <button
                onClick={handleVerify}
                disabled={verifying}
                style={{
                  width: '100%',
                  padding: '1em',
                  background: verifying ? '#6c757d' : '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: verifying ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {verifying ? 'Verifying...' : 'Verify Connection'}
              </button>
            )}
            
            {(status === 'CONNECTED' || status === 'ACTIVE') && (
              <button
                onClick={handleClear}
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '1em',
                  background: saving ? '#6c757d' : '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {saving ? 'Disconnecting...' : 'Disconnect Broker'}
              </button>
            )}
          </div>
        </div>

        {/* Connect Form */}
        {showConnectForm && (
          <div style={{ 
            padding: '2em', 
            background: '#fff', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
            border: '1px solid #e0e0e0',
            gridColumn: '1 / -1'
          }}>
            <h2 style={{ 
              color: '#2c3e50', 
              marginBottom: '1.5em', 
              fontWeight: 600, 
              fontSize: '1.4em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}>
              <span>🔗</span>
              Connect New Broker
            </h2>
            
            <form onSubmit={handleConnect}>
              <div style={{ display: 'grid', gap: '1.5em' }}>
                <div>
                  <label style={{ 
                    color: '#495057', 
                    fontWeight: 500, 
                    display: 'block', 
                    marginBottom: '0.5em', 
                    fontSize: 14 
                  }}>
                    Select Broker *
                  </label>
                  <select
                    name="broker"
                    value={formData.broker}
                    onChange={handleChange}
                    required
                    style={{ 
                      width: '100%', 
                      padding: '0.8em', 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '6px', 
                      fontSize: 14, 
                      background: '#fff' 
                    }}
                  >
                    <option value="">Choose a broker</option>
                    {BROKERS.map(broker => (
                      <option key={broker.id} value={broker.id}>
                        {broker.logo} {broker.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ 
                    color: '#495057', 
                    fontWeight: 500, 
                    display: 'block', 
                    marginBottom: '0.5em', 
                    fontSize: 14 
                  }}>
                    Account ID *
                  </label>
                  <input
                    type="text"
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleChange}
                    placeholder="Enter your broker account ID"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '0.8em', 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '6px', 
                      fontSize: 14, 
                      background: '#fff' 
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    color: '#495057', 
                    fontWeight: 500, 
                    display: 'block', 
                    marginBottom: '0.5em', 
                    fontSize: 14 
                  }}>
                    API Key *
                  </label>
                  <input
                    type="password"
                    name="apiKey"
                    value={formData.apiKey}
                    onChange={handleChange}
                    placeholder="Enter your API key"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '0.8em', 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '6px', 
                      fontSize: 14, 
                      background: '#fff' 
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    color: '#495057', 
                    fontWeight: 500, 
                    display: 'block', 
                    marginBottom: '0.5em', 
                    fontSize: 14 
                  }}>
                    API Secret *
                  </label>
                  <input
                    type="password"
                    name="apiSecret"
                    value={formData.apiSecret}
                    onChange={handleChange}
                    placeholder="Enter your API secret"
                    required
                    style={{ 
                      width: '100%', 
                      padding: '0.8em', 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '6px', 
                      fontSize: 14, 
                      background: '#fff' 
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '1em' }}>
                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: '1em',
                      background: saving ? '#6c757d' : '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {saving ? 'Connecting...' : 'Connect Account'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowConnectForm(false)}
                    style={{
                      flex: 1,
                      padding: '1em',
                      background: '#6c757d',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Verification Form */}
        {status === 'CONNECTED' && (
          <div style={{ 
            padding: '2em', 
            background: '#fff', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
            border: '1px solid #e0e0e0',
            gridColumn: '1 / -1'
          }}>
            <h2 style={{ 
              color: '#2c3e50', 
              marginBottom: '1.5em', 
              fontWeight: 600, 
              fontSize: '1.4em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}>
              <span>🔐</span>
              Verify Connection
            </h2>
            
            <div style={{ 
              background: '#e7f3ff', 
              border: '1px solid #b3d9ff', 
              borderRadius: '8px', 
              padding: '1em', 
              marginBottom: '1.5em',
              fontSize: 14,
              color: '#0056b3'
            }}>
              <strong>📝 Note:</strong> In demo mode, you can use any values for MPIN and TOTP. In production, these would be your actual broker credentials.
            </div>
            
            <div style={{ display: 'grid', gap: '1.5em' }}>
              <div>
                <label style={{ 
                  color: '#495057', 
                  fontWeight: 500, 
                  display: 'block', 
                  marginBottom: '0.5em', 
                  fontSize: 14 
                }}>
                  MPIN *
                </label>
                <input
                  type="password"
                  name="mpin"
                  value={formData.mpin}
                  onChange={handleChange}
                  placeholder="Enter your MPIN (4-digit code)"
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.8em', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '6px', 
                    fontSize: 14, 
                    background: '#fff' 
                  }}
                />
                <small style={{ color: '#6c757d', fontSize: 12, marginTop: '0.25em', display: 'block' }}>
                  Your 4-digit MPIN from your broker account
                </small>
              </div>
              
              <div>
                <label style={{ 
                  color: '#495057', 
                  fontWeight: 500, 
                  display: 'block', 
                  marginBottom: '0.5em', 
                  fontSize: 14 
                }}>
                  TOTP Code *
                </label>
                <input
                  type="text"
                  name="totp"
                  value={formData.totp}
                  onChange={handleChange}
                  placeholder="Enter TOTP code from authenticator app"
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.8em', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '6px', 
                    fontSize: 14, 
                    background: '#fff' 
                  }}
                />
                <small style={{ color: '#6c757d', fontSize: 12, marginTop: '0.25em', display: 'block' }}>
                  6-digit code from your authenticator app (Google Authenticator, etc.)
                </small>
              </div>
              
              <button
                onClick={handleVerify}
                disabled={verifying}
                style={{
                  width: '100%',
                  padding: '1em',
                  background: verifying ? '#6c757d' : '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: verifying ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {verifying ? 'Verifying...' : 'Verify Connection'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrokerAccountSettings; 