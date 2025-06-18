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

  useEffect(() => {
    const loadUnderlyings = async () => {
      setLoading(prev => ({ ...prev, underlyings: true }));
      setError(prev => ({ ...prev, underlyings: '' }));
      try {
        const data = await fetchUnderlyings();
        if (Array.isArray(data) && data.length > 0) {
          setUnderlyings(data);
          setUnderlying(data[0]);
        } else {
          throw new Error('Invalid data format');
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
        const data = await fetchOptionExpiries(underlying);
        if (Array.isArray(data) && data.length > 0) {
          setExpiries(data);
          setExpiry(data[0]);
        } else {
          throw new Error('Invalid expiry data format');
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
        const data = await fetchOptionChain({ underlying, expiry });
        if (Array.isArray(data)) {
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
      const order = { underlying, expiry, type: tradeType };
      const res = await placeTradeOrder(order);
      if (res.success) {
        setTradeStatus('Order placed successfully!');
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

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '2em' }}>
      <h1 style={{ color: '#007bff', textAlign: 'center', marginBottom: '2em' }}>Admin Trading Portal</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2em', maxWidth: 1200, margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '1.5em' }}>
          <h2 style={{ marginBottom: '1em' }}>Market Selection</h2>
          {error.underlyings && (
            <div className="error-message" style={{ marginBottom: '1em' }}>
              {error.underlyings}
            </div>
          )}
          {error.expiries && (
            <div className="error-message" style={{ marginBottom: '1em' }}>
              {error.expiries}
            </div>
          )}
          <div style={{ display: 'flex', gap: '1em', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div>
              <label style={{ marginRight: '0.5em' }}>Underlying:</label>
              <select
                value={underlying}
                onChange={e => setUnderlying(e.target.value)}
                style={{ background: '#111', color: '#fff', border: '1px solid #007bff', borderRadius: 4, padding: '0.5em' }}
                disabled={loading.underlyings}
              >
                {Array.isArray(underlyings) && underlyings.map(und => (
                  <option key={und} value={und}>{und}</option>
                ))}
              </select>
              {loading.underlyings && <span className="loading-spinner" style={{ marginLeft: '0.5em' }} />}
            </div>
            <div>
              <label style={{ marginRight: '0.5em' }}>Expiry:</label>
              <select
                value={expiry}
                onChange={e => setExpiry(e.target.value)}
                style={{ background: '#111', color: '#fff', border: '1px solid #007bff', borderRadius: 4, padding: '0.5em' }}
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
        <div style={{ display: 'flex', gap: '2em', flexWrap: 'wrap' }}>
          <div className="card" style={{ flex: 1, textAlign: 'center', minWidth: 320, padding: '1.5em' }}>
            <h2 style={{ marginBottom: '1em' }}>Option Chain</h2>
            <OptionTable 
              options={options} 
              loading={loading.options} 
              error={error.options}
            />
          </div>
          <div className="card" style={{ flex: 2, textAlign: 'center', minWidth: 320, padding: '1.5em' }}>
            <h2 style={{ marginBottom: '1em' }}>Chart</h2>
            {/* You can add a chart component here if needed */}
            <BuySellButtons onBuy={handleBuy} onSell={handleSell} />
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
          background: 'rgba(0, 0, 0, 0.8)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000 
        }}>
          <div className="card" style={{ 
            minWidth: 320, 
            maxWidth: 400, 
            textAlign: 'center', 
            padding: '2em',
            background: '#181c24',
            border: '1px solid #007bff',
            borderRadius: 8
          }}>
            <h2 style={{ color: tradeType === 'Buy' ? '#43e97b' : '#ff4b2b' }}>{tradeType} Order</h2>
            <p style={{ color: '#fff', marginBottom: 20 }}>
              {tradeStatus || 'Confirm your order details below:'}
            </p>
            <div style={{ marginBottom: 20, textAlign: 'left' }}>
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
                color: '#000'
              }} 
              onClick={handlePlaceOrder} 
              disabled={placingOrder}
            >
              {placingOrder ? 'Placing Order...' : 'Place Order'}
            </button>
            <button 
              className="btn"
              style={{ width: '100%', background: '#333' }}
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