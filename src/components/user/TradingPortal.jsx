import React, { useState, useEffect } from 'react';
import OrderForm from './OrderForm';
import { 
  placeTradeOrder
} from '../../api/trading';
import { useNavigate } from 'react-router-dom';
import OrderList from './OrderList';
import TradeList from './TradeList';
import {
  fetchMyBrokerProfile,
  clearBrokerConnection,
  getDematLimit
} from '../../api/auth';

const TradingViewWidget = ({ symbol }) => (
  <div style={{ width: '100%', height: 320, borderRadius: 8, overflow: 'hidden', margin: '0 auto' }}>
    <iframe
      title="TradingView Chart"
      src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_12345&symbol=NSE%3A${symbol}&interval=5&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Asia%2FKolkata&withdateranges=1&hidevolume=1&hideideas=1&studies_overrides={}`}
      style={{ width: '100%', height: 320, border: 'none' }}
      allowFullScreen
    />
  </div>
);

const TradingPortal = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [clearBrokerStatus, setClearBrokerStatus] = useState('');
  const [clearBrokerLoading, setClearBrokerLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);

  const [dematLimit, setDematLimit] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchUserData = async () => {
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
          
          console.log('Broker profile data:', profileRes.data);
          console.log('Is broker connected:', isBrokerConnected);
          console.log('Is active for trading:', isActiveForTrading);
          
          if (isBrokerConnected && isActiveForTrading) {
            setUserData({ 
              broker: {
                ...profileRes.data,
                status: 'ACTIVE' // Add the status field that the component expects
              }
            });
            
            // Fetch additional data for connected users
            try {
              const dematRes = await getDematLimit();
              
              if (dematRes.data) {
                setDematLimit(dematRes.data);
              }
            } catch (dataError) {
              console.error('Error fetching additional broker data:', dataError);
              // Don't fail the entire request if additional data fails
            }
          } else {
            // Broker is not connected or not active
            console.log('Broker not connected or not active, setting userData to null');
            setUserData(null);
            setPortfolioData(null);
            setDematLimit(null);
          }
        } else {
          console.log('No broker profile data, setting userData to null');
          setUserData(null);
          setPortfolioData(null);
          setDematLimit(null);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data. Please try again later.');
        setUserData(null);
        setPortfolioData(null);
        setDematLimit(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);



  const handleOrderSubmit = async (orderData) => {
    try {
      setOrderStatus('Placing order...');
      console.log('Placing order:', orderData);
      
      // Call the actual trading API
      const result = await placeTradeOrder(orderData);
      
      if (result && result.success) {
        console.log('Order placed successfully:', result);
        setOrderStatus('Order placed successfully!');
        
        // Refresh user data to show updated positions/orders
        // await fetchUserData();
        
        // Trigger trade history refresh after successful order
        setTimeout(() => {
          // Dispatch a custom event to notify TradeList to refresh
          window.dispatchEvent(new CustomEvent('refreshTradeHistory'));
          console.log('Trade history refresh triggered');
        }, 1000);
        
      } else {
        console.error('Order placement failed:', result);
        setOrderStatus('Failed to place order. Please check your inputs and try again.');
      }
      
      // Clear status after 5 seconds
      setTimeout(() => setOrderStatus(''), 5000);
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderStatus(`Failed to place order: ${error.message || 'Unknown error'}`);
      setTimeout(() => setOrderStatus(''), 5000);
    }
  };

  const handleClearBroker = async () => {
    setClearBrokerLoading(true);
    setClearBrokerStatus('');
    try {
      const result = await clearBrokerConnection();
      console.log('Clear broker result:', result);
      
      if (result && result.success) {
        setClearBrokerStatus('Broker connection cleared successfully');
        // Force a complete reset of all broker-related data
        setUserData(null);
        setPortfolioData(null);
        setDematLimit(null);
        
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

  const handleConnectBroker = () => {
    navigate('/dashboard/profile-settings');
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

  if (!userData?.broker?.status || userData.broker.status !== 'ACTIVE') {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 'clamp(2em, 4vw, 3em)', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px', 
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)', 
        border: '1px solid rgba(255,255,255,0.2)',
        margin: 'clamp(1em, 3vw, 2em)',
        color: 'white'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: 'clamp(1.5em, 3vw, 2em)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <h2 style={{ 
            marginBottom: '1em', 
            fontWeight: 700,
            fontSize: 'clamp(1.5em, 4vw, 2em)',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            🚀 Connect Your Broker
          </h2>
          <p style={{ 
            marginBottom: '2em',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            lineHeight: '1.6',
            opacity: 0.9
          }}>
            Connect your broker account to unlock powerful trading features, real-time market data, and portfolio management tools.
          </p>
          <button 
            onClick={handleConnectBroker}
            style={{
              display: 'inline-block',
              background: 'linear-gradient(45deg, #00d4aa, #0099cc)',
              color: '#ffffff',
              padding: 'clamp(0.8em, 2vw, 1em) clamp(1.5em, 3vw, 2em)',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0,212,170,0.3)',
              border: 'none',
              cursor: 'pointer'
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
        </div>
      </div>
    );
  }

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
          background: clearBrokerStatus.includes('successfully') ? 'linear-gradient(135deg, #00d4aa, #00b894)' : 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
          color: '#ffffff', 
          padding: 'clamp(0.8em, 2vw, 1em)', 
          borderRadius: '12px', 
          marginBottom: '1.5em', 
          border: '1px solid rgba(255,255,255,0.2)', 
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          fontWeight: 500,
          boxShadow: clearBrokerStatus.includes('successfully') ? '0 4px 15px rgba(0,212,170,0.3)' : '0 4px 15px rgba(255,107,107,0.3)'
        }}>
          {clearBrokerStatus}
        </div>
      )}

      {orderStatus && (
        <div style={{ 
          background: orderStatus.includes('successfully') ? 'linear-gradient(135deg, #00d4aa, #00b894)' : 'linear-gradient(135deg, #ffa726, #ff9800)',
          color: '#ffffff', 
          padding: 'clamp(0.8em, 2vw, 1em)', 
          borderRadius: '12px', 
          marginBottom: '1.5em', 
          border: '1px solid rgba(255,255,255,0.2)', 
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          fontWeight: 500,
          boxShadow: orderStatus.includes('successfully') ? '0 4px 15px rgba(0,212,170,0.3)' : '0 4px 15px rgba(255,167,38,0.3)'
        }}>
          {orderStatus}
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
        {['overview', 'trading', 'history', 'portfolio'].map((tab) => (
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
            {tab === 'trading' && '📈 Trading'}
            {tab === 'history' && '📋 History'}
            {tab === 'portfolio' && '💼 Portfolio'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Header Section */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 'clamp(1em, 2vw, 1.5em)', 
            marginBottom: '2em' 
          }}>
            {/* Portfolio Overview */}
            {portfolioData && (
              <div style={{ 
                background: 'linear-gradient(135deg, #667eea, #764ba2)', 
                color: '#ffffff', 
                padding: 'clamp(1.2em, 2.5vw, 1.5em)', 
                borderRadius: '16px', 
                boxShadow: '0 8px 25px rgba(102,126,234,0.3)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <h3 style={{ margin: '0 0 0.5em 0', fontSize: 'clamp(14px, 2.5vw, 16px)', opacity: 0.9 }}>Portfolio Value</h3>
                <div style={{ fontSize: 'clamp(1.5em, 3vw, 2em)', fontWeight: 700, marginBottom: '0.5em' }}>
                  ₹{portfolioData.totalValue?.toLocaleString() || '0'}
                </div>
                <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', opacity: 0.8 }}>
                  {portfolioData.change >= 0 ? '+' : ''}{portfolioData.change}% today
                </div>
              </div>
            )}

            {/* Broker Status */}
            <div style={{ 
              background: 'linear-gradient(135deg, #00d4aa, #00b894)', 
              color: '#ffffff', 
              padding: 'clamp(1.2em, 2.5vw, 1.5em)', 
              borderRadius: '16px', 
              boxShadow: '0 8px 25px rgba(0,212,170,0.3)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <h3 style={{ margin: '0 0 0.5em 0', fontSize: 'clamp(14px, 2.5vw, 16px)', opacity: 0.9 }}>Broker Status</h3>
              <div style={{ fontSize: 'clamp(1.2em, 2.5vw, 1.5em)', fontWeight: 700, marginBottom: '0.5em' }}>
                {userData.broker.broker_name || 'Connected'}
              </div>
              <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', opacity: 0.8 }}>
                Active for Trading
              </div>
            </div>

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

          {/* Chart Section */}
          <div style={{ 
            background: 'rgba(255,255,255,0.9)', 
            borderRadius: '16px', 
            padding: 'clamp(1.5em, 3vw, 2em)', 
            marginBottom: '2em',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <h3 style={{ margin: '0 0 1em 0', color: '#2c3e50', fontSize: 'clamp(1.2em, 3vw, 1.5em)' }}>Portfolio Performance</h3>
            <TradingViewWidget symbol="NIFTY" />
          </div>
        </>
      )}

      {activeTab === 'trading' && (
        <div style={{ 
          background: 'rgba(255,255,255,0.9)', 
          borderRadius: '16px', 
          padding: 'clamp(1.5em, 3vw, 2em)', 
          marginBottom: '2em',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <h3 style={{ margin: '0 0 1em 0', color: '#2c3e50', fontSize: 'clamp(1.2em, 3vw, 1.5em)' }}>Place Orders</h3>
          <OrderForm onSubmit={handleOrderSubmit} />
        </div>
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

      {activeTab === 'portfolio' && (
        <div style={{ 
          background: 'rgba(255,255,255,0.9)', 
          borderRadius: '16px', 
          padding: 'clamp(1.5em, 3vw, 2em)', 
          marginBottom: '2em',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          <h3 style={{ margin: '0 0 1em 0', color: '#2c3e50', fontSize: 'clamp(1.2em, 3vw, 1.5em)' }}>Positions & Orders</h3>
          <div style={{ display: 'grid', gap: '1.5em', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <div>
              <h4 style={{ color: '#2c3e50', marginBottom: '1em' }}>Current Positions</h4>
              <OrderList />
            </div>
            <div>
              <h4 style={{ color: '#2c3e50', marginBottom: '1em' }}>Order History</h4>
              <OrderList />
            </div>
          </div>
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
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1em' 
        }}>
          <div style={{ 
            background: 'rgba(102,126,234,0.1)', 
            padding: '1em', 
            borderRadius: '8px', 
            border: '1px solid rgba(102,126,234,0.2)' 
          }}>
            <div style={{ fontWeight: 600, color: '#2c3e50', marginBottom: '0.5em' }}>Broker Name</div>
            <div style={{ color: '#667eea' }}>{userData.broker.broker_name || 'N/A'}</div>
          </div>
          <div style={{ 
            background: 'rgba(0,212,170,0.1)', 
            padding: '1em', 
            borderRadius: '8px', 
            border: '1px solid rgba(0,212,170,0.2)' 
          }}>
            <div style={{ fontWeight: 600, color: '#2c3e50', marginBottom: '0.5em' }}>Status</div>
            <div style={{ color: '#00d4aa' }}>Active</div>
          </div>
          <div style={{ 
            background: 'rgba(255,167,38,0.1)', 
            padding: '1em', 
            borderRadius: '8px', 
            border: '1px solid rgba(255,167,38,0.2)' 
          }}>
            <div style={{ fontWeight: 600, color: '#2c3e50', marginBottom: '0.5em' }}>Trading Enabled</div>
            <div style={{ color: '#ffa726' }}>Yes</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPortal;
