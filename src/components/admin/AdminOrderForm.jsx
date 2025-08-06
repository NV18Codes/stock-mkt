import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Use relative API URLs with proxy configuration

const AdminOrderForm = ({ onOrderSubmit, selectedUserIds }) => {
  const [formData, setFormData] = useState({
    instrument_token: '',
    trading_symbol: '',
    transaction_type: 'BUY',
    order_type: 'MARKET',
    quantity: 1,
    limit_price: '',
    target_user_ids: [],
    target_all_active_users: false,
    remarks: ''
  });

  const [underlyings, setUnderlyings] = useState([]);
  const [expiries, setExpiries] = useState([]);
  const [optionChain, setOptionChain] = useState([]);
  const [loading, setLoading] = useState({
    underlyings: true,
    expiries: false,
    options: false
  });
  const [error, setError] = useState('');
  const [selectedUnderlying, setSelectedUnderlying] = useState('');
  const [selectedExpiry, setSelectedExpiry] = useState('');

  // Set static underlyings data
  useEffect(() => {
    const staticUnderlyings = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'BANKEX'];
    setUnderlyings(staticUnderlyings);
    setSelectedUnderlying(staticUnderlyings[0]);
    setLoading(prev => ({ ...prev, underlyings: false }));
  }, []);

  // Set static expiries when underlying changes
  useEffect(() => {
    if (!selectedUnderlying) return;
    setLoading(prev => ({ ...prev, expiries: true }));
    
    const staticExpiries = ['10JUL2025', '17JUL2025', '24JUL2025', '31JUL2025', '07AUG2025', '14AUG2025', '21AUG2025'];
    setExpiries(staticExpiries);
    setSelectedExpiry(staticExpiries[0]);
    
    setLoading(prev => ({ ...prev, expiries: false }));
  }, [selectedUnderlying]);

  // Generate static option chain when underlying or expiry changes
  useEffect(() => {
    if (!selectedUnderlying || !selectedExpiry) return;
    setLoading(prev => ({ ...prev, options: true }));
    
    // Generate static option chain data
    const basePrice = selectedUnderlying === 'NIFTY' ? 22000 : selectedUnderlying === 'BANKNIFTY' ? 48000 : 20000;
    const staticOptions = [];
    
    for (let i = -5; i <= 5; i++) {
      const strikePrice = basePrice + (i * 100);
      staticOptions.push({
        strikePrice: strikePrice,
        CE: {
          token: `${selectedUnderlying}${selectedExpiry}${strikePrice}CE`,
          tradingSymbol: `${selectedUnderlying}${selectedExpiry}${strikePrice}CE`,
          ltp: (Math.random() * 200 + 50).toFixed(2)
        },
        PE: {
          token: `${selectedUnderlying}${selectedExpiry}${strikePrice}PE`,
          tradingSymbol: `${selectedUnderlying}${selectedExpiry}${strikePrice}PE`,
          ltp: (Math.random() * 200 + 50).toFixed(2)
        }
      });
    }
    
    setOptionChain(staticOptions);
    setLoading(prev => ({ ...prev, options: false }));
  }, [selectedUnderlying, selectedExpiry]);

  // Update target_user_ids when selectedUserIds changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      target_user_ids: selectedUserIds
    }));
  }, [selectedUserIds]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTargetAllActiveChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      target_all_active_users: checked,
      target_user_ids: checked ? [] : selectedUserIds
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.instrument_token || !formData.trading_symbol) {
      setError('Please select an option from the dropdown');
      return;
    }

    if (formData.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (formData.order_type === 'LIMIT' && !formData.limit_price) {
      setError('Limit price is required for LIMIT orders');
      return;
    }

    if (!formData.target_all_active_users && formData.target_user_ids.length === 0) {
      setError('Please select either "All Active Users" or specific users');
      return;
    }

    // Prepare order data
    const orderData = {
      ...formData,
      quantity: parseInt(formData.quantity),
      limit_price: formData.limit_price ? parseFloat(formData.limit_price) : undefined
    };

    // Remove empty fields
    if (!orderData.limit_price) {
      delete orderData.limit_price;
    }

    onOrderSubmit(orderData);
    setError('');
  };

  const handleOptionSelect = (option) => {
    setFormData(prev => ({
      ...prev,
      instrument_token: option.instrumentToken || option.token || '',
      trading_symbol: option.tradingSymbol || option.symbol || ''
    }));
  };

  return (
    <div style={{ 
      padding: 'clamp(1em, 3vw, 1.5em)', 
      background: '#fff', 
      borderRadius: '12px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
      border: '1px solid #e0e0e0',
      marginBottom: '2em'
    }}>
      <h3 style={{ 
        color: '#2c3e50', 
        marginBottom: '1.5em', 
        fontSize: 'clamp(1.2em, 3vw, 1.4em)',
        fontWeight: 600
      }}>
        Place Group Order
      </h3>

      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: 'clamp(0.8em, 2vw, 1em)', 
          borderRadius: '8px', 
          marginBottom: '1.5em', 
          border: '1px solid #f5c6cb', 
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          fontWeight: 500
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5em' 
        }}>
          {/* Option Selection */}
          <div>
            <h4 style={{ 
              color: '#2c3e50', 
              marginBottom: '1em', 
              fontSize: 'clamp(1em, 2.5vw, 1.1em)',
              fontWeight: 600
            }}>
              Option Selection
            </h4>
            
            <div style={{ marginBottom: '1em' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5em', 
                fontWeight: 500, 
                color: '#2c3e50',
                fontSize: 'clamp(12px, 2.5vw, 14px)'
              }}>
                Underlying:
              </label>
              <select
                value={selectedUnderlying}
                onChange={(e) => setSelectedUnderlying(e.target.value)}
                disabled={loading.underlyings}
                style={{
                  width: '100%',
                  padding: '0.8em',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  background: '#fff'
                }}
              >
                {loading.underlyings ? (
                  <option>Loading...</option>
                ) : (
                  underlyings.map(und => (
                    <option key={und} value={und}>{und}</option>
                  ))
                )}
              </select>
            </div>

            <div style={{ marginBottom: '1em' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5em', 
                fontWeight: 500, 
                color: '#2c3e50',
                fontSize: 'clamp(12px, 2.5vw, 14px)'
              }}>
                Expiry:
              </label>
              <select
                value={selectedExpiry}
                onChange={(e) => setSelectedExpiry(e.target.value)}
                disabled={loading.expiries || !selectedUnderlying}
                style={{
                  width: '100%',
                  padding: '0.8em',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  background: '#fff'
                }}
              >
                {loading.expiries ? (
                  <option>Loading...</option>
                ) : (
                  expiries.map(exp => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))
                )}
              </select>
            </div>

            <div style={{ marginBottom: '1em' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5em', 
                fontWeight: 500, 
                color: '#2c3e50',
                fontSize: 'clamp(12px, 2.5vw, 14px)'
              }}>
                Select Option:
              </label>
              <select
                value={formData.trading_symbol}
                onChange={(e) => {
                  const selectedOption = optionChain.find(opt => 
                    opt.CE?.tradingSymbol === e.target.value || opt.PE?.tradingSymbol === e.target.value
                  );
                  if (selectedOption) {
                    const option = e.target.value.includes('CE') ? selectedOption.CE : selectedOption.PE;
                    handleOptionSelect(option);
                  }
                }}
                disabled={loading.options || optionChain.length === 0}
                style={{
                  width: '100%',
                  padding: '0.8em',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  background: '#fff'
                }}
              >
                <option value="">Select an option...</option>
                {optionChain.map((row, index) => (
                  <React.Fragment key={index}>
                    {row.CE && (
                      <option value={row.CE.tradingSymbol}>
                        {row.CE.tradingSymbol} (CE - {row.strikePrice})
                      </option>
                    )}
                    {row.PE && (
                      <option value={row.PE.tradingSymbol}>
                        {row.PE.tradingSymbol} (PE - {row.strikePrice})
                      </option>
                    )}
                  </React.Fragment>
                ))}
              </select>
            </div>

            {formData.instrument_token && (
              <div style={{ 
                background: '#e3f2fd', 
                padding: '0.8em', 
                borderRadius: '6px', 
                border: '1px solid #bbdefb',
                fontSize: 'clamp(11px, 2.5vw, 13px)',
                color: '#1976d2'
              }}>
                <strong>Selected:</strong> {formData.trading_symbol}<br/>
                <strong>Token:</strong> {formData.instrument_token}
              </div>
            )}
          </div>

          {/* Order Details */}
          <div>
            <h4 style={{ 
              color: '#2c3e50', 
              marginBottom: '1em', 
              fontSize: 'clamp(1em, 2.5vw, 1.1em)',
              fontWeight: 600
            }}>
              Order Details
            </h4>

            <div style={{ marginBottom: '1em' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5em', 
                fontWeight: 500, 
                color: '#2c3e50',
                fontSize: 'clamp(12px, 2.5vw, 14px)'
              }}>
                Transaction Type:
              </label>
              <select
                name="transaction_type"
                value={formData.transaction_type}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.8em',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  background: '#fff'
                }}
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>

            <div style={{ marginBottom: '1em' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5em', 
                fontWeight: 500, 
                color: '#2c3e50',
                fontSize: 'clamp(12px, 2.5vw, 14px)'
              }}>
                Order Type:
              </label>
              <select
                name="order_type"
                value={formData.order_type}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.8em',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  background: '#fff'
                }}
              >
                <option value="MARKET">MARKET</option>
                <option value="LIMIT">LIMIT</option>
              </select>
            </div>

            <div style={{ marginBottom: '1em' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5em', 
                fontWeight: 500, 
                color: '#2c3e50',
                fontSize: 'clamp(12px, 2.5vw, 14px)'
              }}>
                Quantity (Lots):
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                style={{
                  width: '100%',
                  padding: '0.8em',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  background: '#fff'
                }}
              />
            </div>

            {formData.order_type === 'LIMIT' && (
              <div style={{ marginBottom: '1em' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5em', 
                  fontWeight: 500, 
                  color: '#2c3e50',
                  fontSize: 'clamp(12px, 2.5vw, 14px)'
                }}>
                  Limit Price:
                </label>
                <input
                  type="number"
                  name="limit_price"
                  value={formData.limit_price}
                  onChange={handleInputChange}
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.8em',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: 'clamp(12px, 2.5vw, 14px)',
                    background: '#fff'
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: '1em' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5em', 
                fontWeight: 500, 
                color: '#2c3e50',
                fontSize: 'clamp(12px, 2.5vw, 14px)'
              }}>
                Remarks:
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                rows="3"
                placeholder="Enter order remarks..."
                style={{
                  width: '100%',
                  padding: '0.8em',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  background: '#fff',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {/* Target Selection */}
          <div>
            <h4 style={{ 
              color: '#2c3e50', 
              marginBottom: '1em', 
              fontSize: 'clamp(1em, 2.5vw, 1.1em)',
              fontWeight: 600
            }}>
              Target Users
            </h4>

            <div style={{ marginBottom: '1em' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5em',
                fontWeight: 500, 
                color: '#2c3e50',
                fontSize: 'clamp(12px, 2.5vw, 14px)'
              }}>
                <input
                  type="checkbox"
                  name="target_all_active_users"
                  checked={formData.target_all_active_users}
                  onChange={(e) => handleTargetAllActiveChange(e.target.checked)}
                  style={{ transform: 'scale(1.2)' }}
                />
                Target All Active Users
              </label>
            </div>

            {!formData.target_all_active_users && (
              <div style={{ 
                background: '#f8f9fa', 
                padding: '1em', 
                borderRadius: '6px', 
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ 
                  fontSize: 'clamp(11px, 2.5vw, 13px)', 
                  color: '#6c757d',
                  marginBottom: '0.5em'
                }}>
                  <strong>Selected Users:</strong> {selectedUserIds.length}
                </div>
                <div style={{ 
                  fontSize: 'clamp(10px, 2.5vw, 12px)', 
                  color: '#6c757d',
                  fontStyle: 'italic'
                }}>
                  Use the user selection table above to choose specific users for this order.
                </div>
              </div>
            )}

            {formData.target_all_active_users && (
              <div style={{ 
                background: '#e3f2fd', 
                padding: '0.8em', 
                borderRadius: '6px', 
                border: '1px solid #bbdefb',
                fontSize: 'clamp(11px, 2.5vw, 13px)',
                color: '#1976d2'
              }}>
                <strong>Target:</strong> All active users will receive this order.
              </div>
            )}
          </div>
        </div>

        <div style={{ 
          marginTop: '2em', 
          textAlign: 'center' 
        }}>
          <button
            type="submit"
            disabled={!formData.instrument_token || (!formData.target_all_active_users && selectedUserIds.length === 0)}
            style={{
              padding: 'clamp(0.8em, 2vw, 1em) clamp(2em, 4vw, 3em)',
              background: (!formData.instrument_token || (!formData.target_all_active_users && selectedUserIds.length === 0)) ? '#6c757d' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              fontWeight: 600,
              cursor: (!formData.instrument_token || (!formData.target_all_active_users && selectedUserIds.length === 0)) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,123,255,0.2)',
              opacity: (!formData.instrument_token || (!formData.target_all_active_users && selectedUserIds.length === 0)) ? 0.6 : 1
            }}
          >
            Place Group Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminOrderForm; 