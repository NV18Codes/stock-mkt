import React, { useEffect, useState } from 'react';
import {
  addBrokerAccount,
  fetchMyBrokerProfile,
  clearBrokerProfile,
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
      let response;
      
      if (brokerStep === 1) {
        // Step 1: Send API credentials and get session ID for TOTP verification
        response = await addBrokerAccount({
          broker: brokerData.broker,
          broker_name: brokerData.broker_name,
          broker_client_id: brokerData.broker_client_id,
          broker_api_key: brokerData.broker_api_key,
          broker_api_secret: brokerData.broker_api_secret,
          angelone_token: brokerData.angelone_token
        });
        
        if (response && response.success) {
          // Store session ID for next step
          setBrokerSessionId(response.data?.sessionId || response.sessionId);
          setBrokerStep(2);
          setSuccess('Please enter your TOTP to continue');
        }
      } else if (brokerStep === 2) {
        // Step 2: Send TOTP
        response = await verifyBrokerTOTP({
          sessionId: brokerSessionId,
          totp: brokerData.totp
        });
        
        if (response && response.success) {
          setBrokerStep(3);
          setSuccess('Please enter your MPIN to complete the connection');
        }
      } else if (brokerStep === 3) {
        // Step 3: Send MPIN and complete connection
        response = await verifyBrokerMPIN({
          sessionId: brokerSessionId,
          mpin: brokerData.mpin
        });
        
        if (response && response.success) {
          setSuccess('Broker account connected successfully!');
          setShowBrokerForm(false);
          setBrokerStep(1);
          setBrokerSessionId(null);
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
          await fetchBrokerInfo();
        }
      }
    } catch (err) {
      console.error('Error in broker connection step:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to connect broker account';
      setError(errorMessage);
      
      // Reset to step 1 if there's a critical error
      if (err.response?.status === 400 || err.response?.status === 401) {
        setBrokerStep(1);
        setBrokerSessionId(null);
      }
    } finally {
      setBrokerLoading(false);
    }
  };

  const handleClearBroker = async () => {
    if (!window.confirm('Are you sure you want to disconnect your broker account? This action cannot be undone.')) {
      return;
    }
    
    try {
      await clearBrokerProfile();
      setBrokerProfile(null);
      setSuccess('Broker account disconnected successfully!');
      setStatus('NOT_CONNECTED');
      setDematLimit(null);
    } catch (err) {
      console.error('Error clearing broker profile:', err);
      setError('Failed to disconnect broker account');
    }
  };

  const resetBrokerForm = () => {
    setBrokerStep(1);
    setBrokerSessionId(null);
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
    setShowBrokerForm(false);
    setError('');
    setSuccess('');
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
            
            {brokerProfile && (
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
                    {brokerProfile.broker_name || brokerProfile.brokerName || 'Unknown'}
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
                    {brokerProfile.broker_client_id || brokerProfile.accountId || 'N/A'}
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
                onClick={() => setShowBrokerForm(true)}
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
            
            {(status === 'CONNECTED' || status === 'ACTIVE') && (
              <button
                onClick={handleClearBroker}
                style={{
                  width: '100%',
                  padding: '1em',
                  background: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Disconnect Broker
              </button>
            )}
          </div>
        </div>

        {/* Broker Connection Form */}
        {showBrokerForm && (
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
            
            <form onSubmit={handleAddBroker}>
              {/* Progress Indicator */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '2rem',
                position: 'relative'
              }}>
                {[1, 2, 3].map((step) => (
                  <div key={step} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: brokerStep >= step ? '#007bff' : '#e0e0e0',
                      color: brokerStep >= step ? 'white' : '#6c757d',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      marginBottom: '0.5rem'
                    }}>
                      {brokerStep > step ? '✓' : step}
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: brokerStep >= step ? '#2c3e50' : '#6c757d',
                      fontWeight: '500',
                      textAlign: 'center'
                    }}>
                      {step === 1 ? 'API Credentials' : step === 2 ? 'TOTP Verification' : 'MPIN Verification'}
                    </span>
                  </div>
                ))}
                {/* Progress Line */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  right: '20px',
                  height: '2px',
                  background: '#e0e0e0',
                  zIndex: -1
                }}>
                  <div style={{
                    width: `${((brokerStep - 1) / 2) * 100}%`,
                    height: '100%',
                    background: '#007bff',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Step 1: API Credentials */}
              {brokerStep === 1 && (
                <>
                  <div style={{ marginBottom: '1.5em' }}>
                    <label style={{ 
                      color: '#2c3e50', 
                      fontWeight: 600, 
                      display: 'block', 
                      marginBottom: '0.5em', 
                      fontSize: 'clamp(12px, 2.5vw, 14px)' 
                    }}>
                      Select Broker *
                    </label>
                    <select
                      name="broker"
                      value={brokerData.broker}
                      onChange={handleBrokerChange}
                      required
                      style={{ 
                        width: '100%', 
                        padding: '0.75em', 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '8px', 
                        fontSize: 'clamp(12px, 2.5vw, 14px)', 
                        background: 'white',
                        color: '#2c3e50',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <option value="Angel One">Angel One</option>
                      <option value="Zerodha">Zerodha</option>
                      <option value="Upstox">Upstox</option>
                      <option value="ICICI Direct">ICICI Direct</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1.5em' }}>
                    <label style={{ 
                      color: '#2c3e50', 
                      fontWeight: 600, 
                      display: 'block', 
                      marginBottom: '0.5em', 
                      fontSize: 'clamp(12px, 2.5vw, 14px)' 
                    }}>
                      Broker Client ID *
                    </label>
                    <input
                      type="text"
                      name="broker_client_id"
                      value={brokerData.broker_client_id}
                      onChange={handleBrokerChange}
                      placeholder="Enter your Broker Client ID (e.g., Y69925)"
                      required
                      style={{ 
                        width: '100%', 
                        padding: '0.75em', 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '8px', 
                        fontSize: 'clamp(12px, 2.5vw, 14px)', 
                        background: 'white',
                        color: '#2c3e50',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5em' }}>
                    <label style={{ 
                      color: '#2c3e50', 
                      fontWeight: 600, 
                      display: 'block', 
                      marginBottom: '0.5em', 
                      fontSize: 'clamp(12px, 2.5vw, 14px)' 
                    }}>
                      Broker API Key *
                    </label>
                    <input
                      type="text"
                      name="broker_api_key"
                      value={brokerData.broker_api_key}
                      onChange={handleBrokerChange}
                      placeholder="Enter your Broker API Key (e.g., lY8ntMyP)"
                      required
                      style={{ 
                        width: '100%', 
                        padding: '0.75em', 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '8px', 
                        fontSize: 'clamp(12px, 2.5vw, 14px)', 
                        background: 'white',
                        color: '#2c3e50',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5em' }}>
                    <label style={{ 
                      color: '#2c3e50', 
                      fontWeight: 600, 
                      display: 'block', 
                      marginBottom: '0.5em', 
                      fontSize: 'clamp(12px, 2.5vw, 14px)' 
                    }}>
                      Broker API Secret *
                    </label>
                    <input
                      type="password"
                      name="broker_api_secret"
                      value={brokerData.broker_api_secret}
                      onChange={handleBrokerChange}
                      placeholder="Enter your Broker API Secret (e.g., Smarttest@123)"
                      required
                      style={{ 
                        width: '100%', 
                        padding: '0.75em', 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '8px', 
                        fontSize: 'clamp(12px, 2.5vw, 14px)', 
                        background: 'white',
                        color: '#2c3e50',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.5em' }}>
                    <label style={{ 
                      color: '#2c3e50', 
                      fontWeight: 600, 
                      display: 'block', 
                      marginBottom: '0.5em', 
                      fontSize: 'clamp(12px, 2.5vw, 14px)' 
                    }}>
                      Angel One Token *
                    </label>
                    <input
                      type="text"
                      name="angelone_token"
                      value={brokerData.angelone_token}
                      onChange={handleBrokerChange}
                      placeholder="Enter your Angel One Token (e.g., VXJB7SPIYYNI6CRUNCUZYWJFTA)"
                      required
                      style={{ 
                        width: '100%', 
                        padding: '0.75em', 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '8px', 
                        fontSize: 'clamp(12px, 2.5vw, 14px)', 
                        background: 'white',
                        color: '#2c3e50',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </div>
                </>
              )}

              {/* Step 2: TOTP Verification */}
              {brokerStep === 2 && (
                <>
                  <div style={{ marginBottom: '2em' }}>
                    <label style={{ 
                      color: '#2c3e50', 
                      fontWeight: 600, 
                      display: 'block', 
                      marginBottom: '0.5em', 
                      fontSize: 'clamp(12px, 2.5vw, 14px)' 
                    }}>
                      TOTP Code *
                    </label>
                    <input
                      type="text"
                      name="totp"
                      value={brokerData.totp}
                      onChange={handleBrokerChange}
                      placeholder="Enter 6-digit TOTP from your authenticator app"
                      maxLength="6"
                      pattern="[0-9]{6}"
                      required
                      style={{ 
                        width: '100%', 
                        padding: '0.75em', 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '8px', 
                        fontSize: 'clamp(12px, 2.5vw, 14px)', 
                        background: 'white',
                        color: '#2c3e50',
                        transition: 'all 0.2s ease',
                        textAlign: 'center',
                        letterSpacing: '0.5em'
                      }}
                    />
                    <p style={{
                      color: '#6c757d',
                      fontSize: '0.75rem',
                      marginTop: '0.5rem',
                      textAlign: 'center'
                    }}>
                      Enter the 6-digit code from your authenticator app
                    </p>
                  </div>
                </>
              )}

              {/* Step 3: MPIN Verification */}
              {brokerStep === 3 && (
                <>
                  <div style={{ marginBottom: '2em' }}>
                    <label style={{ 
                      color: '#2c3e50', 
                      fontWeight: 600, 
                      display: 'block', 
                      marginBottom: '0.5em', 
                      fontSize: 'clamp(12px, 2.5vw, 14px)' 
                    }}>
                      MPIN *
                    </label>
                    <input
                      type="password"
                      name="mpin"
                      value={brokerData.mpin}
                      onChange={handleBrokerChange}
                      placeholder="Enter your 4-digit MPIN"
                      maxLength="4"
                      pattern="[0-9]{4}"
                      required
                      style={{ 
                        width: '100%', 
                        padding: '0.75em', 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '8px', 
                        fontSize: 'clamp(12px, 2.5vw, 14px)', 
                        background: 'white',
                        color: '#2c3e50',
                        transition: 'all 0.2s ease',
                        textAlign: 'center',
                        letterSpacing: '0.5em'
                      }}
                    />
                    <p style={{
                      color: '#6c757d',
                      fontSize: '0.75rem',
                      marginTop: '0.5rem',
                      textAlign: 'center'
                    }}>
                      Enter your 4-digit MPIN for broker authentication
                    </p>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '1em', marginTop: '1.5em' }}>
                <button
                  type="submit"
                  disabled={brokerLoading}
                  style={{
                    flex: 1,
                    background: brokerLoading ? '#6c757d' : '#007bff',
                    color: '#fff',
                    border: 'none',
                    padding: '0.75em 1em',
                    borderRadius: '8px',
                    fontSize: 'clamp(12px, 2.5vw, 14px)',
                    fontWeight: 600,
                    cursor: brokerLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5em',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    opacity: brokerLoading ? 0.7 : 1
                  }}
                >
                  {brokerLoading ? (
                    <>
                      <span style={{ animation: 'spin 1s linear infinite' }}>🔄</span>
                      {brokerStep === 1 ? 'Verifying...' : brokerStep === 2 ? 'Verifying TOTP...' : 'Verifying MPIN...'}
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      {brokerStep === 1 ? 'Continue' : brokerStep === 2 ? 'Verify TOTP' : 'Complete Connection'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={brokerStep === 1 ? resetBrokerForm : () => setBrokerStep(brokerStep - 1)}
                  style={{
                    flex: 1,
                    background: 'white',
                    color: '#2c3e50',
                    border: '2px solid #e0e0e0',
                    padding: '0.75em 1em',
                    borderRadius: '8px',
                    fontSize: 'clamp(12px, 2.5vw, 14px)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {brokerStep === 1 ? 'Cancel' : 'Back'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrokerAccountSettings; 