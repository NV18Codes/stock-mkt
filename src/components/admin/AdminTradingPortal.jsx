import React, { useState, useEffect } from 'react';
import { fetchOptionExpiries, fetchOptionChain, fetchUnderlyings, placeTradeOrder } from '../../api/trading';
import OptionTable from '../user/OptionTable';
import BuySellButtons from '../user/BuySellButtons';

const AdminTradingPortal = () => {
  const [underlying, setUnderlying] = useState('NIFTY');
  const [expiry, setExpiry] = useState('');
  const [underlyings, setUnderlyings] = useState(['NIFTY']);
  const [expiries, setExpiries] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState({
    underlyings: true,
    expiries: true,
    options: true
  });
  const [error, setError] = useState({
    underlyings: '',
    expiries: '',
    options: ''
  });
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeType, setTradeType] = useState('');
  const [tradeStatus, setTradeStatus] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Helper function to format expiry date
  const formatExpiryForAPI = (expiryString) => {
    if (!expiryString) return '';
    
    // If it's already in the correct format (like "10JUL2025"), return as is
    if (expiryString.match(/^\d{1,2}[A-Z]{3}\d{4}$/)) {
      return expiryString;
    }
    
    // If it's a date object or different format, convert it
    try {
      const date = new Date(expiryString);
      if (isNaN(date.getTime())) {
        return expiryString; // Return original if can't parse
      }
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const year = date.getFullYear();
      
      return `${day}${month}${year}`;
    } catch (error) {
      console.error('Error formatting expiry:', error);
      return expiryString; // Return original if error
    }
  };

  useEffect(() => {
    const loadUnderlyings = async () => {
      setLoading(prev => ({ ...prev, underlyings: true }));
      setError(prev => ({ ...prev, underlyings: '' }));
      try {
        const response = await fetchUnderlyings();
        console.log('Underlyings data:', response); // Debug log
        
        // Handle the API response structure
        let data;
        if (response && response.success && response.data) {
          data = response.data;
        } else if (Array.isArray(response)) {
          data = response;
        } else if (response && typeof response === 'object' && response.underlyings) {
          data = response.underlyings;
        } else {
          throw new Error('Invalid data format');
        }
        
        if (Array.isArray(data) && data.length > 0) {
          setUnderlyings(data);
          setUnderlying(data[0]);
        } else {
          throw new Error('No underlyings available');
        }
      } catch (err) {
        console.error('Error loading underlyings:', err);
        setError(prev => ({ ...prev, underlyings: 'Failed to load underlyings' }));
        setUnderlyings(['NIFTY']);
        setUnderlying('NIFTY');
      } finally {
        setLoading(prev => ({ ...prev, underlyings: false }));
      }
    };
    loadUnderlyings();
  }, []);

  useEffect(() => {
    const loadExpiries = async () => {
      if (!underlying) return;
      setLoading(prev => ({ ...prev, expiries: true }));
      setError(prev => ({ ...prev, expiries: '' }));
      try {
        const response = await fetchOptionExpiries(underlying);
        console.log('Expiries data:', response); // Debug log
        
        // Handle the API response structure
        let data;
        if (response && response.success && response.data) {
          data = response.data;
        } else if (Array.isArray(response)) {
          data = response;
        } else if (response && typeof response === 'object' && response.expiries) {
          data = response.expiries;
        } else {
          throw new Error('Invalid expiry data format');
        }
        
        if (Array.isArray(data) && data.length > 0) {
          setExpiries(data);
          setExpiry(data[0]);
        } else {
          throw new Error('No expiries available');
        }
      } catch (err) {
        console.error('Error loading expiries:', err);
        setError(prev => ({ ...prev, expiries: 'Failed to load expiries' }));
        setExpiries([]);
        setExpiry('');
      } finally {
        setLoading(prev => ({ ...prev, expiries: false }));
      }
    };
    loadExpiries();
  }, [underlying]);

  useEffect(() => {
    const loadOptions = async () => {
      if (!underlying || !expiry) return;
      setLoading(prev => ({ ...prev, options: true }));
      setError(prev => ({ ...prev, options: '' }));
      try {
        const formattedExpiry = formatExpiryForAPI(expiry);
        console.log('Loading options for:', { underlying, expiry, formattedExpiry });
        const response = await fetchOptionChain({ underlying, expiry: formattedExpiry });
        console.log('Option chain data:', response); // Debug log
        
        // Handle the API response structure
        let data;
        if (response && response.success && response.data) {
          data = response.data;
        } else if (Array.isArray(response)) {
          data = response;
        } else if (response && typeof response === 'object' && response.options) {
          data = response.options;
        } else if (response && typeof response === 'object' && response.data) {
          data = response.data;
        }
        
        if (Array.isArray(data)) {
          console.log('Setting options data:', data);
          // Log first few rows to see CE and PE structure
          if (data.length > 0) {
            console.log('Sample row structure:', data[0]);
            console.log('CE data sample:', data[0]?.CE);
            console.log('PE data sample:', data[0]?.PE);
            console.log('CE OI:', data[0]?.CE?.openInterest || data[0]?.CE?.oi || data[0]?.CE?.open_interest);
            console.log('PE OI:', data[0]?.PE?.openInterest || data[0]?.PE?.oi || data[0]?.PE?.open_interest);
          }
          setOptions(data);
        } else {
          throw new Error('Invalid option chain data format');
        }
      } catch (err) {
        console.error('Error loading option chain:', err);
        setError(prev => ({ ...prev, options: 'Failed to load option chain' }));
        setOptions([]);
      } finally {
        setLoading(prev => ({ ...prev, options: false }));
      }
    };
    loadOptions();
  }, [underlying, expiry]);

  const handleBuy = () => {
    setTradeType('Buy');
    setShowTradeModal(true);
    setTradeStatus('');
  };
  const handleSell = () => {
    setTradeType('Sell');
    setShowTradeModal(true);
    setTradeStatus('');
  };
  const closeModal = () => {
    setShowTradeModal(false);
    setTradeType('');
    setTradeStatus('');
  };
  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    setTradeStatus('');
    try {
      const formattedExpiry = formatExpiryForAPI(expiry);
      const order = { 
        underlying, 
        expiry: formattedExpiry, 
        type: tradeType,
        timestamp: new Date().toISOString()
      };
      console.log('Placing order:', order); // Debug log
      const response = await placeTradeOrder(order);
      console.log('Order response:', response); // Debug log
      
      // Handle the API response structure
      const success = response && (response.success || response.statusCode === 200);
      
      if (success) {
        setTradeStatus('Order placed successfully!');
        // Refresh option chain after successful order
        setTimeout(() => {
          if (underlying && expiry) {
            const loadOptions = async () => {
              try {
                const refreshResponse = await fetchOptionChain({ underlying, expiry: formattedExpiry });
                let data;
                if (refreshResponse && refreshResponse.success && refreshResponse.data) {
                  data = refreshResponse.data;
                } else if (Array.isArray(refreshResponse)) {
                  data = refreshResponse;
                } else if (refreshResponse && typeof refreshResponse === 'object' && refreshResponse.options) {
                  data = refreshResponse.options;
                } else if (refreshResponse && typeof refreshResponse === 'object' && refreshResponse.data) {
                  data = refreshResponse.data;
                }
                
                if (Array.isArray(data)) {
                  setOptions(data);
                }
              } catch (err) {
                console.error('Error refreshing option chain:', err);
              }
            };
            loadOptions();
          }
        }, 1000);
      } else {
        setTradeStatus('Failed to place order.');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setTradeStatus('Error placing order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Function to refresh option chain data
  const refreshOptionChain = async () => {
    if (!underlying || !expiry) return;
    
    setLoading(prev => ({ ...prev, options: true }));
    setError(prev => ({ ...prev, options: '' }));
    
    try {
      const formattedExpiry = formatExpiryForAPI(expiry);
      console.log('Refreshing options for:', { underlying, expiry, formattedExpiry });
      const response = await fetchOptionChain({ underlying, expiry: formattedExpiry });
      console.log('Refresh response:', response);
      
      let data;
      if (response && response.success && response.data) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      } else if (response && typeof response === 'object' && response.options) {
        data = response.options;
      } else if (response && typeof response === 'object' && response.data) {
        data = response.data;
      }
      
      if (Array.isArray(data)) {
        console.log('Setting refreshed options data:', data);
        // Log first few rows to see CE and PE structure during refresh
        if (data.length > 0) {
          console.log('Refresh - Sample row structure:', data[0]);
          console.log('Refresh - CE data sample:', data[0]?.CE);
          console.log('Refresh - PE data sample:', data[0]?.PE);
          console.log('Refresh - CE OI:', data[0]?.CE?.openInterest || data[0]?.CE?.oi || data[0]?.CE?.open_interest);
          console.log('Refresh - PE OI:', data[0]?.PE?.openInterest || data[0]?.PE?.oi || data[0]?.PE?.open_interest);
        }
        setOptions(data);
      } else {
        throw new Error('Invalid option chain data format');
      }
    } catch (err) {
      console.error('Error refreshing option chain:', err);
      setError(prev => ({ ...prev, options: 'Failed to refresh option chain' }));
    } finally {
      setLoading(prev => ({ ...prev, options: false }));
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)', color: '#fff', padding: '3em 1em' }}>
      <h1 style={{ color: '#43e97b', textAlign: 'center', marginBottom: '2.5em', fontWeight: 800, letterSpacing: 1 }}>Admin Trading Portal</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5em', maxWidth: 1300, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '2.5em 2em', borderRadius: 16, background: 'rgba(24,28,36,0.95)', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)', border: '1.5px solid #232a3a', marginBottom: 0 }}>
          <h2 style={{ marginBottom: '1.5em', fontWeight: 700, fontSize: 28, color: '#43e97b' }}>Market Selection</h2>
          {error.underlyings && (
            <div className="error-message" style={{ marginBottom: '1em', color: '#ff4b2b' }}>
              {error.underlyings}
            </div>
          )}
          {error.expiries && (
            <div className="error-message" style={{ marginBottom: '1em', color: '#ff4b2b' }}>
              {error.expiries}
            </div>
          )}
          <div style={{ display: 'flex', gap: '2em', justifyContent: 'center', flexWrap: 'wrap', marginTop: 10 }}>
            <div>
              <label style={{ marginRight: '0.5em', fontWeight: 500 }}>Underlying:</label>
              <select
                value={underlying}
                onChange={e => setUnderlying(e.target.value)}
                style={{ background: '#181c24', color: '#fff', border: '1.5px solid #43e97b', borderRadius: 6, padding: '0.7em 1.2em', fontSize: 16, minWidth: 120 }}
                disabled={loading.underlyings}
              >
                {Array.isArray(underlyings) && underlyings.map(und => (
                  <option key={und} value={und}>{und}</option>
                ))}
              </select>
              {loading.underlyings && <span className="loading-spinner" style={{ marginLeft: '0.5em' }} />}
            </div>
            <div>
              <label style={{ marginRight: '0.5em', fontWeight: 500 }}>Expiry:</label>
              <select
                value={expiry}
                onChange={e => setExpiry(e.target.value)}
                style={{ background: '#181c24', color: '#fff', border: '1.5px solid #43e97b', borderRadius: 6, padding: '0.7em 1.2em', fontSize: 16, minWidth: 160 }}
                disabled={loading.expiries || !underlying}
              >
                {Array.isArray(expiries) && expiries.map(exp => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>
              {loading.expiries && <span className="loading-spinner" style={{ marginLeft: '0.5em' }} />}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '2.5em', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div className="card" style={{ flex: 1, textAlign: 'center', minWidth: 400, padding: '2em 1.5em', borderRadius: 16, background: 'rgba(24,28,36,0.97)', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.13)', border: '1.5px solid #232a3a' }}>
            <h2 style={{ marginBottom: '1.2em', fontWeight: 700, fontSize: 24, color: '#43e97b' }}>Option Chain</h2>
            <OptionTable 
              optionChain={options} 
              loading={loading.options} 
              error={error.options}
              onRefresh={refreshOptionChain}
            />
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center', minWidth: 400, padding: '2em 1.5em', borderRadius: 16, background: 'rgba(24,28,36,0.97)', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.13)', border: '1.5px solid #232a3a' }}>
            <h2 style={{ marginBottom: '1.2em', fontWeight: 700, fontSize: 24, color: '#43e97b' }}>Chart</h2>
            {/* You can add a chart component here if needed */}
            <div style={{ 
              height: '400px', 
              background: 'linear-gradient(135deg, #1a1f2e 0%, #2a2f3e 100%)', 
              borderRadius: 12, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid #232a3a',
              marginBottom: '1em'
            }}>
              <div style={{ textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: 48, marginBottom: '0.5em' }}>📈</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Chart Component</div>
                <div style={{ fontSize: 14, marginTop: '0.5em' }}>Price visualization will appear here</div>
              </div>
            </div>
            <BuySellButtons onBuy={handleBuy} onSell={handleSell} />
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center', minWidth: 400, padding: '2em 1.5em', borderRadius: 16, background: 'rgba(24,28,36,0.97)', boxShadow: '0 4px 32px 0 rgba(0,0,0,0.13)', border: '1.5px solid #232a3a' }}>
            <h2 style={{ marginBottom: '1.2em', fontWeight: 700, fontSize: 24, color: '#43e97b' }}>Market Info</h2>
            <div style={{ 
              height: '400px', 
              background: 'linear-gradient(135deg, #1a1f2e 0%, #2a2f3e 100%)', 
              borderRadius: 12, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid #232a3a',
              marginBottom: '1em'
            }}>
              <div style={{ textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: 48, marginBottom: '0.5em' }}>📊</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Market Data</div>
                <div style={{ fontSize: 14, marginTop: '0.5em' }}>Additional market information</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Trade Modal */}
      {showTradeModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          background: 'rgba(0, 0, 0, 0.85)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000 
        }}>
          <div className="card" style={{ 
            minWidth: 340, 
            maxWidth: 420, 
            textAlign: 'center', 
            padding: '2.5em 2em',
            background: '#181c24',
            border: '1.5px solid #43e97b',
            borderRadius: 12,
            boxShadow: '0 4px 32px 0 rgba(0,0,0,0.18)'
          }}>
            <h2 style={{ color: tradeType === 'Buy' ? '#43e97b' : '#ff4b2b', fontWeight: 700 }}>{tradeType} Order</h2>
            <p style={{ color: '#fff', marginBottom: 20 }}>
              {tradeStatus || 'Confirm your order details below:'}
            </p>
            <div style={{ marginBottom: 20, textAlign: 'left', fontSize: 16 }}>
              <p><strong>Underlying:</strong> {underlying}</p>
              <p><strong>Expiry:</strong> {expiry}</p>
              <p><strong>Type:</strong> {tradeType}</p>
            </div>
            <button 
              className="btn" 
              style={{ 
                width: '100%', 
                marginBottom: 10,
                background: tradeType === 'Buy' ? '#43e97b' : '#ff4b2b',
                color: '#000',
                fontWeight: 700,
                fontSize: 18,
                borderRadius: 6
              }} 
              onClick={handlePlaceOrder} 
              disabled={placingOrder}
            >
              {placingOrder ? 'Placing Order...' : 'Place Order'}
            </button>
            <button 
              className="btn"
              style={{ width: '100%', background: '#333', color: '#fff', fontWeight: 600, fontSize: 16, borderRadius: 6 }}
              onClick={closeModal}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTradingPortal; 