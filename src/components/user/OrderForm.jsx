import React, { useState, useEffect } from 'react';
import { getOptionExpiries, getOptionChainStructure, getOptionsUnderlying } from '../../api/admin';

const OrderForm = ({ onOrderSubmit }) => {
  const [formData, setFormData] = useState({
    instrument_token: '',
    trading_symbol: '',
    transaction_type: 'BUY',
    order_type: 'MARKET',
    quantity: 1,
    limit_price: '',
    target_segment_ids: [],
    target_all_active_users: false,
    remarks: ''
  });

  const [underlyings, setUnderlyings] = useState([]);
  const [expiries, setExpiries] = useState([]);
  const [optionChain, setOptionChain] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState({
    underlyings: true,
    expiries: false,
    options: false,
    segments: true
  });
  const [error, setError] = useState('');
  const [selectedUnderlying, setSelectedUnderlying] = useState('');
  const [selectedExpiry, setSelectedExpiry] = useState('');

  // Fetch real underlyings data from API
  useEffect(() => {
    const fetchUnderlyings = async () => {
      try {
        setLoading(prev => ({ ...prev, underlyings: true }));
        const response = await getOptionsUnderlying();
        
        if (response && response.success && Array.isArray(response.data)) {
          setUnderlyings(response.data);
          setSelectedUnderlying(response.data[0]);
        } else if (response && Array.isArray(response)) {
          setUnderlyings(response);
          setSelectedUnderlying(response[0]);
        } else {
          // Fallback to static underlyings if API fails
          const staticUnderlyings = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'BANKEX'];
          setUnderlyings(staticUnderlyings);
          setSelectedUnderlying(staticUnderlyings[0]);
        }
      } catch (err) {
        console.error('Error fetching underlyings:', err);
        // Fallback to static underlyings
        const staticUnderlyings = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'BANKEX'];
        setUnderlyings(staticUnderlyings);
        setSelectedUnderlying(staticUnderlyings[0]);
      } finally {
        setLoading(prev => ({ ...prev, underlyings: false }));
      }
    };
    
    fetchUnderlyings();
  }, []);

  // Fetch segments on mount
  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const response = await fetch('/api/admin/segments');
        if (response.ok) {
          const data = await response.json();
          if (data && data.data && Array.isArray(data.data)) {
            setSegments(data.data);
          }
        }
      } catch (err) {
        console.error('Error fetching segments:', err);
      } finally {
        setLoading(prev => ({ ...prev, segments: false }));
      }
    };
    fetchSegments();
  }, []);

  // Fetch real expiries when underlying changes
  useEffect(() => {
    if (!selectedUnderlying) return;
    
    const fetchExpiries = async () => {
      try {
        setLoading(prev => ({ ...prev, expiries: true }));
        const response = await getOptionExpiries(selectedUnderlying);
        
        if (response && response.success && Array.isArray(response.data)) {
          setExpiries(response.data);
          setSelectedExpiry(response.data[0]);
        } else if (response && Array.isArray(response)) {
          setExpiries(response);
          setSelectedExpiry(response[0]);
        } else {
          // Fallback to static expiries if API fails
          const staticExpiries = ['10AUG2025', '17AUG2025', '24AUG2025', '31AUG2025', '07SEP2025', '14SEP2025', '21SEP2025'];
          setExpiries(staticExpiries);
          setSelectedExpiry(staticExpiries[0]);
        }
      } catch (err) {
        console.error('Error fetching expiries:', err);
        // Fallback to current month expiries
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const currentYear = currentDate.getFullYear();
        const staticExpiries = [
          `10${currentMonth}${currentYear}`, 
          `17${currentMonth}${currentYear}`, 
          `24${currentMonth}${currentYear}`, 
          `31${currentMonth}${currentYear}`,
          `07${currentMonth === 'DEC' ? 'JAN' : currentMonth === 'NOV' ? 'DEC' : currentMonth === 'OCT' ? 'NOV' : currentMonth === 'SEP' ? 'OCT' : currentMonth === 'AUG' ? 'SEP' : 'AUG'}${currentMonth === 'DEC' ? currentYear + 1 : currentYear}`,
          `14${currentMonth === 'DEC' ? 'JAN' : currentMonth === 'NOV' ? 'DEC' : currentMonth === 'OCT' ? 'NOV' : currentMonth === 'SEP' ? 'OCT' : currentMonth === 'AUG' ? 'SEP' : 'AUG'}${currentMonth === 'DEC' ? currentYear + 1 : currentYear}`,
          `21${currentMonth === 'DEC' ? 'JAN' : currentMonth === 'NOV' ? 'DEC' : currentMonth === 'OCT' ? 'NOV' : currentMonth === 'SEP' ? 'OCT' : currentMonth === 'AUG' ? 'SEP' : 'AUG'}${currentMonth === 'DEC' ? currentYear + 1 : currentYear}`
        ];
        setExpiries(staticExpiries);
        setSelectedExpiry(staticExpiries[0]);
      } finally {
        setLoading(prev => ({ ...prev, expiries: false }));
      }
    };
    
    fetchExpiries();
  }, [selectedUnderlying]);

  // Fetch real option chain when underlying or expiry changes
  useEffect(() => {
    if (!selectedUnderlying || !selectedExpiry) return;
    
    const fetchOptionChain = async () => {
      try {
        setLoading(prev => ({ ...prev, options: true }));
        const response = await getOptionChainStructure(selectedUnderlying, selectedExpiry);
        
        if (response && response.success && response.data) {
          setOptionChain(response.data);
        } else if (response && Array.isArray(response)) {
          setOptionChain(response);
        } else {
          // Fallback to generated option chain if API fails
          generateFallbackOptionChain();
        }
      } catch (err) {
        console.error('Error fetching option chain:', err);
        // Fallback to generated option chain
        generateFallbackOptionChain();
      } finally {
        setLoading(prev => ({ ...prev, options: false }));
      }
    };
    
    fetchOptionChain();
  }, [selectedUnderlying, selectedExpiry]);

  // Fallback option chain generation
  const generateFallbackOptionChain = () => {
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
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSegmentChange = (segmentId) => {
    setFormData(prev => ({
      ...prev,
      target_segment_ids: prev.target_segment_ids.includes(segmentId)
        ? prev.target_segment_ids.filter(id => id !== segmentId)
        : [...prev.target_segment_ids, segmentId]
    }));
  };

  const handleTargetAllActiveChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      target_all_active_users: checked,
      target_segment_ids: checked ? [] : prev.target_segment_ids
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

    if (!formData.target_all_active_users && formData.target_segment_ids.length === 0) {
      setError('Please select either "All Active Users" or specific segments');
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
        Place Order
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
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5em', 
                  fontWeight: 500, 
                  color: '#2c3e50',
                  fontSize: 'clamp(12px, 2.5vw, 14px)'
                }}>
                  Select Segments:
                </label>
                {loading.segments ? (
                  <div style={{ color: '#6c757d', fontSize: 'clamp(11px, 2.5vw, 13px)' }}>
                    Loading segments...
                  </div>
                ) : (
                  <div style={{ 
                    maxHeight: '200px', 
                    overflowY: 'auto', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '6px',
                    padding: '0.5em'
                  }}>
                    {segments.map(segment => (
                      <label key={segment.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5em',
                        padding: '0.3em 0',
                        fontSize: 'clamp(11px, 2.5vw, 13px)',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.target_segment_ids.includes(segment.id)}
                          onChange={() => handleSegmentChange(segment.id)}
                          style={{ transform: 'scale(1.1)' }}
                        />
                        {segment.name}
                        {segment.description && (
                          <span style={{ color: '#6c757d', fontSize: 'clamp(10px, 2.5vw, 12px)' }}>
                            ({segment.description})
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {formData.target_segment_ids.length > 0 && (
              <div style={{ 
                marginTop: '1em',
                background: '#e3f2fd', 
                padding: '0.8em', 
                borderRadius: '6px', 
                border: '1px solid #bbdefb',
                fontSize: 'clamp(11px, 2.5vw, 13px)',
                color: '#1976d2'
              }}>
                <strong>Selected Segments:</strong>
                <ul style={{ margin: '0.5em 0 0 1.5em', padding: 0 }}>
                  {segments
                    .filter(seg => formData.target_segment_ids.includes(seg.id))
                    .map(seg => (
                      <li key={seg.id}>{seg.name}</li>
                    ))}
                </ul>
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
            style={{
              padding: 'clamp(0.8em, 2vw, 1em) clamp(2em, 4vw, 3em)',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,123,255,0.2)'
            }}
          >
            Place Order
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm; 