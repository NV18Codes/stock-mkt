import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TradeList from './TradeList';
import {
  clearBrokerConnection
} from '../../api/auth';
import {
  fetchMyBrokerProfile,
  fetchBrokerConnectionStatus,
  getDematLimit
} from '../../api/auth';
import {
  getUserBrokerTrades
} from '../../api/broker';
import { exitTrade } from '../../api/admin';

const TradingPortal = () => {
  const navigate = useNavigate();
  const [brokerProfile, setBrokerProfile] = useState(null);
  const [brokerConnection, setBrokerConnection] = useState({ is_connected: false, message: '' });
  const [rmsLimit, setRmsLimit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clearBrokerStatus, setClearBrokerStatus] = useState('');
  const [clearBrokerLoading, setClearBrokerLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [exitTradeStatus, setExitTradeStatus] = useState('');
  const [exitTradeLoading, setExitTradeLoading] = useState(false);

  useEffect(() => {
		const fetchAll = async () => {
			setLoading(true);
			setError('');
			try {
				// Broker profile
				const profile = await fetchMyBrokerProfile();
				const profileData = profile?.data || profile;
				setBrokerProfile(profileData || null);

				// Connection status
				const statusRes = await fetchBrokerConnectionStatus();
				const statusData = statusRes?.data || statusRes;
				setBrokerConnection({
					is_connected: !!(statusData?.is_connected || profileData?.is_active_for_trading),
					message: statusData?.message || ''
				});

				// RMS limit (may fallback gracefully if not connected)
				const rmsRes = await getDematLimit();
				setRmsLimit(rmsRes?.data || rmsRes);

				// Trades history (show regardless of connection)
				try {
					await getUserBrokerTrades();
					// TradeList component will handle its own data fetching
				} catch (tradeErr) {
					console.log('Trades fetch failed (likely not connected). Showing empty history.');
				}
			} catch (err) {
				console.error('Error loading dashboard data:', err);
				setError('Failed to load dashboard data. Please try again later.');
			} finally {
				setLoading(false);
			}
		};

		fetchAll();
  }, []);



  const handleClearBroker = async () => {
    setClearBrokerLoading(true);
    setClearBrokerStatus('');
    try {
      const result = await clearBrokerConnection();
      console.log('Clear broker result:', result);
      
      if (result && result.success) {
        setClearBrokerStatus('Broker connection cleared successfully');
        // Force a complete reset of all broker-related data
        setBrokerProfile(null);
        setBrokerConnection({ is_connected: false, message: '' });
        setRmsLimit(null);
        
        // Force a refresh of the component to show "Broker Not Connected" state
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setClearBrokerStatus('Failed to clear broker connection');
      }
    } catch (err) {
      console.error('Error clearing broker:', err);
      setClearBrokerStatus('Failed to clear broker connection');
    } finally {
      setClearBrokerLoading(false);
    }
  };

  const handleExitTrade = async (tradeId) => {
    if (!tradeId) {
      setExitTradeStatus('Error: No trade ID provided');
      return;
    }

    setExitTradeLoading(true);
    setExitTradeStatus('');
    
    try {
      console.log(`Attempting to exit trade with ID: ${tradeId}`);
      const result = await exitTrade(tradeId);
      
      if (result && result.success) {
        setExitTradeStatus('✅ Trade exit initiated successfully!');
        // Refresh the trade list after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setExitTradeStatus('❌ Failed to exit trade. Please try again.');
      }
    } catch (err) {
      console.error('Error exiting trade:', err);
      setExitTradeStatus('❌ Error exiting trade: ' + (err.message || 'Unknown error'));
    } finally {
      setExitTradeLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 'clamp(2em, 5vw, 4em)',
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
          Loading your trading dashboard...
        </p>
      </div>
    );
  }

  // Always render dashboard; show sections conditionally based on connection

  return (
    <div style={{ 
      padding: 'clamp(1em, 3vw, 1.5em)', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
      minHeight: '100vh', 
      maxWidth: 1400, 
      margin: '0 auto'
    }}>
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

      {clearBrokerStatus && (
        <div style={{ 
          background: clearBrokerStatus.includes('successfully') ? 'var(--gradient-primary)' : 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
          color: '#ffffff', 
          padding: 'clamp(0.8em, 2vw, 1em)', 
          borderRadius: '12px', 
          marginBottom: '1.5em', 
          border: '1px solid rgba(255,255,255,0.2)', 
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          fontWeight: 500,
                      boxShadow: clearBrokerStatus.includes('successfully') ? '0 4px 15px rgba(211, 80, 63, 0.3)' : '0 4px 15px rgba(255,107,107,0.3)'
        }}>
          {clearBrokerStatus}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5em',
        marginBottom: '2em',
        flexWrap: 'wrap',
        background: 'rgba(255,255,255,0.8)',
        padding: '1em',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.3)'
      }}>
        {['overview', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(1em, 2vw, 1.2em)',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
              color: activeTab === tab ? '#ffffff' : '#2c3e50',
              fontWeight: activeTab === tab ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              textTransform: 'capitalize'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) {
                e.target.style.background = 'rgba(102,126,234,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) {
                e.target.style.background = 'transparent';
              }
            }}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'history' && '📋 History'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Broker Profile & Connection Status */}
          <div style={{ 
            background: 'rgba(255,255,255,0.9)', 
            borderRadius: '16px', 
            padding: 'clamp(1.5em, 3vw, 2em)', 
            marginBottom: '2em',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1em', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, color: '#2c3e50', fontSize: 'clamp(1.2em, 3vw, 1.5em)' }}>Broker Profile & Connection</h3>
              <div style={{ fontSize: '13px', fontWeight: 600, color: brokerConnection.is_connected ? '#2e7d32' : '#c62828' }}>
                {brokerConnection.is_connected ? '🟢 Connected' : '🔴 Not Connected'}
              </div>
            </div>
            <div style={{ marginTop: '1em', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1em' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: 12 }}>Broker</div>
                <div style={{ color: '#1f2937', fontWeight: 600 }}>{brokerProfile?.broker_name || '—'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: 12 }}>Client ID</div>
                <div style={{ color: '#1f2937', fontWeight: 600 }}>{brokerProfile?.broker_client_id || '—'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: 12 }}>Active For Trading</div>
                <div style={{ color: '#1f2937', fontWeight: 600 }}>{brokerProfile?.is_active_for_trading ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: 12 }}>Message</div>
                <div style={{ color: '#1f2937', fontWeight: 600 }}>{brokerConnection?.message || '—'}</div>
              </div>
            </div>
          </div>

          {/* Order History (always visible) */}
          <div style={{ 
            background: 'rgba(255,255,255,0.9)', 
            borderRadius: '16px', 
            padding: 'clamp(1.5em, 3vw, 2em)', 
            marginBottom: '2em',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <h3 style={{ margin: '0 0 1em 0', color: '#2c3e50', fontSize: 'clamp(1.2em, 3vw, 1.5em)' }}>Order History</h3>
            <TradeList />
          </div>

          {/* Exit Trade Section */}
          <div style={{ 
            background: 'rgba(255,255,255,0.9)', 
            borderRadius: '16px', 
            padding: 'clamp(1.5em, 3vw, 2em)', 
            marginBottom: '2em',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1em', flexWrap: 'wrap', gap: '1em' }}>
              <h3 style={{ margin: 0, color: '#2c3e50', fontSize: 'clamp(1.2em, 3vw, 1.5em)' }}>Exit Trade</h3>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#d3503f' }}>
                🚨 Exit Active Trades
              </div>
            </div>
            
            {/* Status Message */}
            {exitTradeStatus && (
              <div style={{ 
                background: exitTradeStatus.includes('✅') ? '#f0fff4' : '#fff5f5', 
                border: `1px solid ${exitTradeStatus.includes('✅') ? '#9ae6b4' : '#fed7d7'}`, 
                borderRadius: '8px', 
                padding: '1em',
                marginBottom: '1em',
                color: exitTradeStatus.includes('✅') ? '#22543d' : '#c53030',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {exitTradeStatus}
              </div>
            )}
            
            <div style={{ 
              background: '#fff5f5', 
              border: '1px solid #fed7d7', 
              borderRadius: '8px', 
              padding: '1em',
              marginBottom: '1em'
            }}>
              <div style={{ color: '#c53030', fontSize: '14px', marginBottom: '0.5em' }}>
                <strong>⚠️ Important:</strong> This will exit all active trades for your account.
              </div>
              <div style={{ color: '#744210', fontSize: '13px' }}>
                Use this feature carefully as it will close all open positions and may result in losses.
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1em', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/admin/trading-portal')}
                style={{
                  padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(1em, 2vw, 1.2em)',
                  borderRadius: '8px',
                  border: '1px solid #d3503f',
                  background: 'linear-gradient(135deg, #d3503f, #c53030)',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5em'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 15px rgba(211, 80, 63, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                🚪 Exit All Trades
              </button>
              <button
                onClick={() => navigate('/admin/trade-history')}
                style={{
                  padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(1em, 2vw, 1.2em)',
                  borderRadius: '8px',
                  border: '1px solid #2d6fa0',
                  background: 'linear-gradient(135deg, #2d6fa0, #146fb4)',
                  color: '#ffffff',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5em'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 15px rgba(45, 111, 160, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                📊 View Trade History
              </button>
              <button
                onClick={() => handleExitTrade('demo-trade-id')}
                disabled={exitTradeLoading}
                style={{
                  padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(1em, 2vw, 1.2em)',
                  borderRadius: '8px',
                  border: '1px solid #e79a7e',
                  background: exitTradeLoading ? '#ccc' : 'linear-gradient(135deg, #e79a7e, #d3503f)',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: exitTradeLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5em'
                }}
                onMouseEnter={(e) => {
                  if (!exitTradeLoading) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 15px rgba(231, 154, 126, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!exitTradeLoading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {exitTradeLoading ? '🔄 Processing...' : '🔄 Exit Demo Trade'}
              </button>
            </div>
          </div>

          {/* Broker Details (RMS & Profile) - only if connected */}
          <div style={{ 
            background: 'rgba(255,255,255,0.9)', 
            borderRadius: '16px', 
            padding: 'clamp(1.5em, 3vw, 2em)', 
            marginBottom: '2em',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <h3 style={{ margin: '0 0 1em 0', color: '#2c3e50', fontSize: 'clamp(1.2em, 3vw, 1.5em)' }}>Broker Details</h3>
            {brokerConnection.is_connected ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1em' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.8em' }}>
                  <div style={{ color: '#64748b', fontSize: 12 }}>RMS Net</div>
                  <div style={{ color: '#1f2937', fontWeight: 700 }}>{rmsLimit?.net ?? rmsLimit?.available ?? '—'}</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.8em' }}>
                  <div style={{ color: '#64748b', fontSize: 12 }}>RMS Available</div>
                  <div style={{ color: '#1f2937', fontWeight: 700 }}>{rmsLimit?.available ?? '—'}</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.8em' }}>
                  <div style={{ color: '#64748b', fontSize: 12 }}>RMS Used</div>
                  <div style={{ color: '#1f2937', fontWeight: 700 }}>{rmsLimit?.used ?? '—'}</div>
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.8em' }}>
                  <div style={{ color: '#64748b', fontSize: 12 }}>Products</div>
                  <div style={{ color: '#1f2937', fontWeight: 700 }}>{Array.isArray(brokerProfile?.products) ? brokerProfile.products.join(', ') || '—' : '—'}</div>
                </div>
              </div>
            ) : (
              <div style={{ color: '#c62828', fontWeight: 600 }}>Not connected — connect your broker to view RMS and broker details.</div>
            )}
          </div>
        </>
      )}

      {activeTab === 'history' && (
            <div style={{ 
          background: 'rgba(255,255,255,0.9)', 
          borderRadius: '16px', 
          padding: 'clamp(1.5em, 3vw, 2em)', 
          marginBottom: '2em',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <h3 style={{ margin: '0 0 1em 0', color: '#2c3e50', fontSize: 'clamp(1.2em, 3vw, 1.5em)' }}>Trade History</h3>
          <TradeList />
            </div>
      )}

      

      {/* Broker Management Section */}
        <div style={{ 
        background: 'rgba(255,255,255,0.9)', 
        borderRadius: '16px', 
        padding: 'clamp(1.5em, 3vw, 2em)', 
        marginBottom: '2em',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1em', flexWrap: 'wrap', gap: '1em' }}>
          <h3 style={{ margin: 0, color: '#2c3e50', fontSize: 'clamp(1.2em, 3vw, 1.5em)' }}>Broker Management</h3>
          <div style={{ display: 'flex', gap: '0.5em', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/dashboard/profile-settings')}
              style={{
                padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(1em, 2vw, 1.2em)',
                borderRadius: '8px',
                border: '1px solid #667eea',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: '#ffffff',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: 'clamp(12px, 2.5vw, 14px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 15px rgba(102,126,234,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              ⚙️ Profile Settings
            </button>
            <button
              onClick={handleClearBroker}
              disabled={clearBrokerLoading}
              style={{
                padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(1em, 2vw, 1.2em)',
                borderRadius: '8px',
                border: '1px solid #ff6b6b',
                background: clearBrokerLoading ? '#ccc' : 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                color: '#ffffff',
                fontWeight: 500,
                cursor: clearBrokerLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                fontSize: 'clamp(12px, 2.5vw, 14px)'
              }}
              onMouseEnter={(e) => {
                if (!clearBrokerLoading) {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 15px rgba(255,107,107,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!clearBrokerLoading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {clearBrokerLoading ? '🔄 Processing...' : '❌ Disconnect Broker'}
            </button>
        </div>
      </div>


        </div>

        
    </div>
  );
};

export default TradingPortal;
