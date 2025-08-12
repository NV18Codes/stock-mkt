import React, { useEffect, useState } from 'react';
import {
  addBrokerAccount,
  fetchMyBrokerProfile,
  clearBrokerConnection,
  getDematLimit
} from '../../api/auth';
import {
  verifyBrokerTOTP,
  verifyBrokerMPIN
} from '../../api/broker';

const BrokerAccountSettings = () => {
  const [brokerData, setBrokerData] = useState({
    broker: 'Angel One',
    broker_name: 'angelone',
    broker_client_id: '',
    broker_api_key: '',
    broker_api_secret: '',
    angelone_token: '',
    password: '',
    mpin: '',
    totp: ''
  });
  
  const [brokerStep, setBrokerStep] = useState(1);
  const [brokerSessionId, setBrokerSessionId] = useState(null);
  const [brokerProfile, setBrokerProfile] = useState(null);
  const [status, setStatus] = useState('NOT_CONNECTED');
  const [loading, setLoading] = useState(true);
  const [brokerLoading, setBrokerLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dematLimit, setDematLimit] = useState(null);
  const [showBrokerForm, setShowBrokerForm] = useState(false);
  const [showHashedDetails, setShowHashedDetails] = useState(false);

  // Utility function to hash sensitive data
  const hashSensitiveData = (value) => {
    if (!value) return '';
    return '*'.repeat(Math.min(value.length, 8)) + value.slice(-4);
  };

  const fetchBrokerInfo = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch broker profile directly (same approach as UserProfileSettings)
      const profileRes = await fetchMyBrokerProfile();
      
      if (profileRes && profileRes.success && profileRes.data) {
        // Check if broker is connected and active
        const isBrokerConnected = profileRes.data.broker_name && 
                                profileRes.data.broker_name !== 'No Broker Connected';
        const isActiveForTrading = profileRes.data.is_active_for_trading;
        
        if (isBrokerConnected && isActiveForTrading) {
          setStatus('ACTIVE');
          setBrokerProfile(profileRes.data);
          
          // Fetch demat limit
          try {
            const dematRes = await getDematLimit();
            setDematLimit(dematRes.data);
          } catch (dematErr) {
            console.error('Error fetching demat limit:', dematErr);
            setDematLimit(null);
          }
        } else {
          setStatus('NOT_CONNECTED');
          setBrokerProfile(null);
          setDematLimit(null);
        }
      } else {
        setStatus('NOT_CONNECTED');
        setBrokerProfile(null);
        setDematLimit(null);
      }
    } catch (err) {
      console.error('Error fetching broker info:', err);
      setError('Failed to fetch broker status');
      setStatus('NOT_CONNECTED');
      setBrokerProfile(null);
      setDematLimit(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokerInfo();
  }, []);

  const handleBrokerChange = (e) => {
    const { name, value } = e.target;
    setBrokerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddBroker = async (e) => {
    e.preventDefault();
    setBrokerLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Step 1: Add broker account with MPIN
      if (brokerStep === 1) {
        const result = await addBrokerAccount({
          ...brokerData,
          mpin: brokerData.mpin
        });
        
        if (result && result.success) {
          setBrokerSessionId(result.data.session_id);
          setBrokerStep(2);
          setSuccess('MPIN verified! Please enter TOTP to complete connection.');
          setTimeout(() => setSuccess(''), 5000);
        } else {
          setError(result?.message || 'Failed to add broker account');
        }
      }
      // Step 2: Verify TOTP
      else if (brokerStep === 2) {
        const result = await verifyBrokerTOTP({
          session_id: brokerSessionId,
          totp: brokerData.totp
        });
        
        if (result && result.success) {
          setSuccess('Broker connected successfully!');
          setBrokerStep(1);
          setShowBrokerForm(false);
          setBrokerData({
            broker: 'Angel One',
            broker_name: 'angelone',
            broker_client_id: '',
            broker_api_key: '',
            broker_api_secret: '',
            angelone_token: '',
            password: '',
            mpin: '',
            totp: ''
          });
          
          // Refresh broker info
          setTimeout(() => {
            fetchBrokerInfo();
          }, 2000);
        } else {
          setError(result?.message || 'Failed to verify TOTP');
        }
      }
    } catch (err) {
      console.error('Error adding broker:', err);
      setError(err.message || 'Failed to add broker account');
    } finally {
      setBrokerLoading(false);
    }
  };

  const handleClearBroker = async () => {
    if (!window.confirm('Are you sure you want to disconnect your broker? This will remove all trading access.')) {
      return;
    }
    
    setBrokerLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await clearBrokerConnection();
      
      if (result && result.success) {
        setSuccess('Broker disconnected successfully');
        setStatus('NOT_CONNECTED');
        setBrokerProfile(null);
        setDematLimit(null);
        
        // Refresh broker info
        setTimeout(() => {
          fetchBrokerInfo();
        }, 2000);
      } else {
        setError(result?.message || 'Failed to disconnect broker');
      }
    } catch (err) {
      console.error('Error clearing broker:', err);
      setError(err.message || 'Failed to disconnect broker');
    } finally {
      setBrokerLoading(false);
    }
  };

  const resetForm = () => {
    setBrokerStep(1);
    setBrokerSessionId(null);
    setBrokerData({
      broker: 'Angel One',
      broker_name: 'angelone',
      broker_client_id: '',
      broker_api_key: '',
      angelone_token: '',
      password: '',
      mpin: '',
      totp: ''
    });
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 'clamp(2em, 5vw, 4em)',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1em'
        }} />
        <p style={{ 
          color: '#2c3e50', 
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          fontWeight: 500
        }}>
          Loading broker information...
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: 'clamp(1em, 3vw, 1.5em)', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
      minHeight: '100vh', 
      maxWidth: 1200, 
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 'clamp(2em, 4vw, 3em)' 
      }}>
        <h1 style={{ 
          color: '#2c3e50', 
          fontSize: 'clamp(1.8em, 4vw, 2.5em)', 
          fontWeight: 700,
          marginBottom: '0.5em',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          🔗 Broker Account Settings
        </h1>
        <p style={{ 
          color: '#6c757d', 
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Connect and manage your broker account to access trading functionality
        </p>
      </div>

      {/* Status Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: 'clamp(1em, 2vw, 1.5em)', 
        marginBottom: '2em' 
      }}>
        {/* Connection Status */}
        <div style={{ 
          background: status === 'ACTIVE' ? 'linear-gradient(135deg, #00d4aa, #00b894)' : 'linear-gradient(135deg, #ff6b6b, #ee5a52)', 
          color: '#ffffff', 
          padding: 'clamp(1.2em, 2.5vw, 1.5em)', 
          borderRadius: '16px', 
          boxShadow: status === 'ACTIVE' ? '0 8px 25px rgba(0,212,170,0.3)' : '0 8px 25px rgba(255,107,107,0.3)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h3 style={{ margin: '0 0 0.5em 0', fontSize: 'clamp(14px, 2.5vw, 16px)', opacity: 0.9 }}>Connection Status</h3>
          <div style={{ fontSize: 'clamp(1.2em, 2.5vw, 1.5em)', fontWeight: 700, marginBottom: '0.5em' }}>
            {status === 'ACTIVE' ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
          <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', opacity: 0.8 }}>
            {status === 'ACTIVE' ? 'Your broker is connected and ready for trading' : 'Connect your broker to start trading'}
          </div>
        </div>

        {/* Broker Info */}
        {brokerProfile && (
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea, #764ba2)', 
            color: '#ffffff', 
            padding: 'clamp(1.2em, 2.5vw, 1.5em)', 
            borderRadius: '16px', 
            boxShadow: '0 8px 25px rgba(102,126,234,0.3)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{ margin: '0 0 0.5em 0', fontSize: 'clamp(14px, 2.5vw, 16px)', opacity: 0.9 }}>Broker Details</h3>
            <div style={{ fontSize: 'clamp(1.2em, 2.5vw, 1.5em)', fontWeight: 700, marginBottom: '0.5em' }}>
              {brokerProfile.broker_name || 'Connected Broker'}
            </div>
            <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', opacity: 0.8 }}>
              Client ID: {brokerProfile.client_id || 'N/A'}
            </div>
          </div>
        )}

        {/* RMS Limit */}
        {dematLimit && (
          <div style={{ 
            background: 'linear-gradient(135deg, #ffa726, #ff9800)', 
            color: '#ffffff', 
            padding: 'clamp(1.2em, 2.5vw, 1.5em)', 
            borderRadius: '16px', 
            boxShadow: '0 8px 25px rgba(255,167,38,0.3)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{ margin: '0 0 0.5em 0', fontSize: 'clamp(14px, 2.5vw, 16px)', opacity: 0.9 }}>RMS Limit</h3>
            <div style={{ fontSize: 'clamp(1.2em, 2.5vw, 1.5em)', fontWeight: 700, marginBottom: '0.5em' }}>
              ₹{dematLimit.net?.toLocaleString() || '0'}
            </div>
            <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', opacity: 0.8 }}>
              Available for Trading
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div style={{ 
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)', 
          color: '#ffffff', 
          padding: 'clamp(0.8em, 2vw, 1em)', 
          borderRadius: '12px', 
          marginBottom: '1.5em', 
          border: '1px solid rgba(255,255,255,0.2)', 
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5em',
          boxShadow: '0 4px 15px rgba(255,107,107,0.3)'
        }}>
          <span>⚠️</span>
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}

      {success && (
        <div style={{ 
          background: 'linear-gradient(135deg, #00d4aa, #00b894)', 
          color: '#ffffff', 
          padding: 'clamp(0.8em, 2vw, 1em)', 
          borderRadius: '12px', 
          marginBottom: '1.5em', 
          border: '1px solid rgba(255,255,255,0.2)', 
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          fontWeight: 500,
          boxShadow: '0 4px 15px rgba(0,212,170,0.3)'
        }}>
          ✅ {success}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '1em', 
        marginBottom: '2em', 
        flexWrap: 'wrap', 
        justifyContent: 'center' 
      }}>
        {status === 'NOT_CONNECTED' ? (
          <button
            onClick={() => setShowBrokerForm(true)}
            style={{
              padding: 'clamp(0.8em, 2vw, 1em) clamp(1.5em, 3vw, 2em)',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #00d4aa, #0099cc)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0,212,170,0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(0,212,170,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,212,170,0.3)';
            }}
          >
            🔗 Connect Broker Account
          </button>
        ) : (
          <button
            onClick={handleClearBroker}
            disabled={brokerLoading}
            style={{
              padding: 'clamp(0.8em, 2vw, 1em) clamp(1.5em, 3vw, 2em)',
              borderRadius: '12px',
              border: 'none',
              background: brokerLoading ? '#ccc' : 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              cursor: brokerLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: brokerLoading ? 'none' : '0 4px 15px rgba(255,107,107,0.3)'
            }}
            onMouseEnter={(e) => {
              if (!brokerLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(255,107,107,0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!brokerLoading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = brokerLoading ? 'none' : '0 4px 15px rgba(255,107,107,0.3)';
              }
            }}
          >
            {brokerLoading ? '🔄 Processing...' : '❌ Disconnect Broker'}
          </button>
        )}
      </div>

      {/* Broker Connection Form */}
      {showBrokerForm && (
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          borderRadius: '20px', 
          padding: 'clamp(2em, 4vw, 3em)', 
          marginBottom: '2em',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '2em' 
          }}>
            <h2 style={{ 
              color: '#2c3e50', 
              margin: 0, 
              fontSize: 'clamp(1.5em, 3vw, 2em)',
              fontWeight: 700
            }}>
              {brokerStep === 1 ? '🔐 Step 1: Enter Credentials' : '🔑 Step 2: Enter TOTP'}
            </h2>
            <button
              onClick={() => {
                setShowBrokerForm(false);
                resetForm();
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5em',
                cursor: 'pointer',
                color: '#6c757d',
                padding: '0.5em',
                borderRadius: '50%',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f8f9fa';
                e.target.style.color = '#dc3545';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#6c757d';
              }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleAddBroker}>
            {brokerStep === 1 ? (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: 'clamp(1em, 2vw, 1.5em)' 
              }}>
                {/* Broker Selection */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5em', 
                    color: '#2c3e50', 
                    fontSize: 'clamp(13px, 2.5vw, 14px)', 
                    fontWeight: 600 
                  }}>
                    Broker
                  </label>
                  <select
                    name="broker"
                    value={brokerData.broker}
                    onChange={handleBrokerChange}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.8em, 2vw, 1em)',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      fontSize: 'clamp(13px, 2.5vw, 14px)',
                      background: '#ffffff',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <option value="Angel One">Angel One</option>
                    <option value="Zerodha">Zerodha</option>
                    <option value="Upstox">Upstox</option>
                    <option value="ICICI Direct">ICICI Direct</option>
                  </select>
                </div>

                {/* Client ID */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5em', 
                    color: '#2c3e50', 
                    fontSize: 'clamp(13px, 2.5vw, 14px)', 
                    fontWeight: 600 
                  }}>
                    Client ID
                  </label>
                  <input
                    type="text"
                    name="broker_client_id"
                    value={brokerData.broker_client_id}
                    onChange={handleBrokerChange}
                    placeholder="Enter your client ID"
                    required
                    style={{
                      width: '100%',
                      padding: 'clamp(0.8em, 2vw, 1em)',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      fontSize: 'clamp(13px, 2.5vw, 14px)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5em', 
                    color: '#2c3e50', 
                    fontSize: 'clamp(13px, 2.5vw, 14px)', 
                    fontWeight: 600 
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={brokerData.password}
                    onChange={handleBrokerChange}
                    placeholder="Enter your password"
                    required
                    style={{
                      width: '100%',
                      padding: 'clamp(0.8em, 2vw, 1em)',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      fontSize: 'clamp(13px, 2.5vw, 14px)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>

                {/* MPIN */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5em', 
                    color: '#2c3e50', 
                    fontSize: 'clamp(13px, 2.5vw, 14px)', 
                    fontWeight: 600 
                  }}>
                    MPIN
                  </label>
                  <input
                    type="password"
                    name="mpin"
                    value={brokerData.mpin}
                    onChange={handleBrokerChange}
                    placeholder="Enter your MPIN"
                    required
                    maxLength={4}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.8em, 2vw, 1em)',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      fontSize: 'clamp(13px, 2.5vw, 14px)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  background: 'rgba(0,212,170,0.1)', 
                  padding: 'clamp(1.5em, 3vw, 2em)', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(0,212,170,0.2)',
                  marginBottom: '2em'
                }}>
                  <h3 style={{ 
                    color: '#00d4aa', 
                    marginBottom: '1em',
                    fontSize: 'clamp(1.2em, 3vw, 1.5em)'
                  }}>
                    🔐 MPIN Verified Successfully!
                  </h3>
                  <p style={{ 
                    color: '#2c3e50', 
                    fontSize: 'clamp(14px, 2.5vw, 16px)',
                    lineHeight: '1.6'
                  }}>
                    Please enter the TOTP from your authenticator app to complete the broker connection.
                  </p>
                </div>

                <div style={{ maxWidth: '300px', margin: '0 auto' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5em', 
                    color: '#2c3e50', 
                    fontSize: 'clamp(13px, 2.5vw, 14px)', 
                    fontWeight: 600 
                  }}>
                    TOTP Code
                  </label>
                  <input
                    type="text"
                    name="totp"
                    value={brokerData.totp}
                    onChange={handleBrokerChange}
                    placeholder="Enter 6-digit TOTP"
                    required
                    maxLength={6}
                    style={{
                      width: '100%',
                      padding: 'clamp(0.8em, 2vw, 1em)',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      fontSize: 'clamp(16px, 3vw, 18px)',
                      textAlign: 'center',
                      letterSpacing: '0.5em',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginTop: '2em' 
            }}>
              <button
                type="submit"
                disabled={brokerLoading}
                style={{
                  padding: 'clamp(0.8em, 2vw, 1em) clamp(2em, 4vw, 3em)',
                  borderRadius: '12px',
                  border: 'none',
                  background: brokerLoading ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  cursor: brokerLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: brokerLoading ? 'none' : '0 4px 15px rgba(102,126,234,0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!brokerLoading) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102,126,234,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!brokerLoading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = brokerLoading ? 'none' : '0 4px 15px rgba(102,126,234,0.3)';
                  }
                }}
              >
                {brokerLoading ? '🔄 Processing...' : (brokerStep === 1 ? '🔐 Verify MPIN' : '🔑 Complete Connection')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Broker Profile Display */}
      {brokerProfile && (
        <div style={{ 
          background: 'rgba(255,255,255,0.95)', 
          borderRadius: '20px', 
          padding: 'clamp(2em, 4vw, 3em)', 
          marginBottom: '2em',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '2em',
            flexWrap: 'wrap',
            gap: '1em'
          }}>
            <h2 style={{ 
              color: '#2c3e50', 
              margin: 0, 
              fontSize: 'clamp(1.5em, 3vw, 2em)',
              fontWeight: 700
            }}>
              📊 Broker Profile
            </h2>
            <div style={{ display: 'flex', gap: '0.5em', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowHashedDetails(!showHashedDetails)}
                style={{
                  padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(1em, 2vw, 1.2em)',
                  borderRadius: '8px',
                  border: '1px solid #667eea',
                  background: showHashedDetails ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
                  color: showHashedDetails ? '#ffffff' : '#667eea',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: 'clamp(12px, 2.5vw, 14px)'
                }}
                onMouseEnter={(e) => {
                  if (!showHashedDetails) {
                    e.target.style.background = 'rgba(102,126,234,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showHashedDetails) {
                    e.target.style.background = showHashedDetails ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent';
                  }
                }}
              >
                {showHashedDetails ? '👁️ Hide Details' : '👁️ View Details'}
              </button>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: 'clamp(1em, 2vw, 1.5em)' 
          }}>
            <div style={{ 
              background: 'rgba(102,126,234,0.1)', 
              padding: 'clamp(1em, 2vw, 1.2em)', 
              borderRadius: '12px', 
              border: '1px solid rgba(102,126,234,0.2)' 
            }}>
              <div style={{ fontWeight: 600, color: '#2c3e50', marginBottom: '0.5em', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Broker Name</div>
              <div style={{ color: '#667eea', fontSize: 'clamp(14px, 2.5vw, 16px)' }}>{brokerProfile.broker_name || 'N/A'}</div>
            </div>
            
            <div style={{ 
              background: 'rgba(0,212,170,0.1)', 
              padding: 'clamp(1em, 2vw, 1.2em)', 
              borderRadius: '12px', 
              border: '1px solid rgba(0,212,170,0.2)' 
            }}>
              <div style={{ fontWeight: 600, color: '#2c3e50', marginBottom: '0.5em', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Client ID</div>
              <div style={{ color: '#00d4aa', fontSize: 'clamp(14px, 2.5vw, 16px)' }}>
                {showHashedDetails ? brokerProfile.client_id : hashSensitiveData(brokerProfile.client_id)}
              </div>
            </div>
            
            <div style={{ 
              background: 'rgba(255,167,38,0.1)', 
              padding: 'clamp(1em, 2vw, 1.2em)', 
              borderRadius: '12px', 
              border: '1px solid rgba(255,167,38,0.2)' 
            }}>
              <div style={{ fontWeight: 600, color: '#2c3e50', marginBottom: '0.5em', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Trading Status</div>
              <div style={{ color: '#ffa726', fontSize: 'clamp(14px, 2.5vw, 16px)' }}>
                {brokerProfile.is_active_for_trading ? '🟢 Active' : '🔴 Inactive'}
              </div>
            </div>
            
            <div style={{ 
              background: 'rgba(156,39,176,0.1)', 
              padding: 'clamp(1em, 2vw, 1.2em)', 
              borderRadius: '12px', 
              border: '1px solid rgba(156,39,176,0.2)' 
            }}>
              <div style={{ fontWeight: 600, color: '#2c3e50', marginBottom: '0.5em', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Connection Date</div>
              <div style={{ color: '#9c27b0', fontSize: 'clamp(14px, 2.5vw, 16px)' }}>
                {brokerProfile.created_at ? new Date(brokerProfile.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{ 
        background: 'rgba(255,255,255,0.9)', 
        borderRadius: '16px', 
        padding: 'clamp(1.5em, 3vw, 2em)', 
        marginBottom: '2em',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.3)'
      }}>
        <h3 style={{ 
          color: '#2c3e50', 
          marginBottom: '1em',
          fontSize: 'clamp(1.2em, 3vw, 1.5em)',
          fontWeight: 600
        }}>
          📋 Connection Instructions
        </h3>
        <div style={{ 
          display: 'grid', 
          gap: '1em',
          fontSize: 'clamp(13px, 2.5vw, 14px)',
          lineHeight: '1.6',
          color: '#2c3e50'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '1em',
            padding: '1em',
            background: 'rgba(102,126,234,0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(102,126,234,0.2)'
          }}>
            <span style={{ fontSize: '1.2em' }}>🔐</span>
            <div>
              <strong>Step 1:</strong> Enter your broker credentials including MPIN. This will verify your identity with the broker.
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '1em',
            padding: '1em',
            background: 'rgba(0,212,170,0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(0,212,170,0.2)'
          }}>
            <span style={{ fontSize: '1.2em' }}>🔑</span>
            <div>
              <strong>Step 2:</strong> Enter the TOTP code from your authenticator app to complete the two-factor authentication.
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '1em',
            padding: '1em',
            background: 'rgba(255,167,38,0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255,167,38,0.2)'
          }}>
            <span style={{ fontSize: '1.2em' }}>✅</span>
            <div>
              <strong>Success:</strong> Once connected, you'll have access to real-time market data, order placement, and portfolio management.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerAccountSettings; 