import React, { useState } from 'react';

const BuySellButtons = ({ selectedOption, onTrade, isAdmin = false }) => {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [tradeData, setTradeData] = useState({
    quantity: '',
    price: '',
    orderType: 'MARKET'
  });
  const [loading, setLoading] = useState(false);

  const handleTrade = async (action) => {
    if (!selectedOption) {
      alert('Please select an option first');
      return;
    }

    if (!tradeData.quantity || !tradeData.price) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const tradeInfo = {
        ...selectedOption,
        action,
        quantity: parseInt(tradeData.quantity),
        price: parseFloat(tradeData.price),
        orderType: tradeData.orderType,
        timestamp: new Date().toISOString()
      };

      if (onTrade) {
        await onTrade(tradeInfo);
      }

      // Reset form and close modal
      setTradeData({ quantity: '', price: '', orderType: 'MARKET' });
      setShowBuyModal(false);
      setShowSellModal(false);
      
      alert(`${action} order placed successfully!`);
    } catch (error) {
      console.error('Trade error:', error);
      alert(`Failed to place ${action.toLowerCase()} order`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTradeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openModal = (action) => {
    if (!selectedOption) {
      alert('Please select an option first');
      return;
    }
    
    if (action === 'BUY') {
      setShowBuyModal(true);
    } else {
      setShowSellModal(true);
    }
  };

  const closeModal = () => {
    setShowBuyModal(false);
    setShowSellModal(false);
    setTradeData({ quantity: '', price: '', orderType: 'MARKET' });
  };

  return (
    <>
      <div style={{ 
        display: 'flex', 
        gap: '0.8em', 
        marginTop: '1em',
        flexDirection: 'row'
      }}>
        <button
          onClick={() => isAdmin && openModal('BUY')}
          disabled={!selectedOption || !isAdmin}
          style={{
            flex: 1,
            padding: 'clamp(0.6em, 2vw, 0.8em)',
            background: '#28a745',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            fontWeight: 600,
            cursor: selectedOption && isAdmin ? 'pointer' : 'not-allowed',
            opacity: selectedOption && isAdmin ? 1 : 0.6,
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => selectedOption && (e.target.style.background = '#1e7e34')}
          onMouseOut={(e) => selectedOption && (e.target.style.background = '#28a745')}
        >
          BUY
        </button>
        
        <button
          onClick={() => isAdmin && openModal('SELL')}
          disabled={!selectedOption || !isAdmin}
          style={{
            flex: 1,
            padding: 'clamp(0.6em, 2vw, 0.8em)',
            background: '#dc3545',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            fontWeight: 600,
            cursor: selectedOption && isAdmin ? 'pointer' : 'not-allowed',
            opacity: selectedOption && isAdmin ? 1 : 0.6,
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => selectedOption && (e.target.style.background = '#c82333')}
          onMouseOut={(e) => selectedOption && (e.target.style.background = '#dc3545')}
        >
          SELL
        </button>
      </div>

      {/* Buy Modal */}
      {isAdmin && showBuyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            padding: 'clamp(1em, 3vw, 1.5em)',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1em' 
            }}>
              <h3 style={{ 
                color: '#28a745', 
                margin: 0, 
                fontWeight: 600, 
                fontSize: 'clamp(1em, 3vw, 1.2em)' 
              }}>
                Buy Order
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5em',
                  cursor: 'pointer',
                  color: '#6c757d',
                  padding: 0
                }}
              >
                ×
              </button>
            </div>

            {selectedOption && (
              <div style={{ 
                background: '#f8f9fa', 
                padding: '0.8em', 
                borderRadius: '4px', 
                marginBottom: '1em',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ 
                  fontSize: 'clamp(11px, 2.2vw, 12px)', 
                  color: '#2c3e50', 
                  marginBottom: '0.3em',
                  fontWeight: 500
                }}>
                  Selected Option: {selectedOption.tradingSymbol || selectedOption.symbol || 'N/A'}
                </div>
                <div style={{ 
                  fontSize: 'clamp(10px, 2vw, 11px)', 
                  color: '#6c757d' 
                }}>
                  Strike: {selectedOption.strikePrice || 'N/A'} | 
                  Type: {selectedOption.optionType || 'N/A'} | 
                  Token: {selectedOption.token || 'N/A'}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '1em' }}>
              <label style={{ 
                color: '#2c3e50', 
                fontWeight: 500, 
                display: 'block', 
                marginBottom: '0.3em', 
                fontSize: 'clamp(12px, 2.5vw, 13px)' 
              }}>
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={tradeData.quantity}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                min="1"
                required
                style={{
                  width: '100%',
                  padding: '0.6em',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  background: '#ffffff',
                  color: '#2c3e50'
                }}
              />
            </div>

            <div style={{ marginBottom: '1em' }}>
              <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={tradeData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                min="0"
                step="0.01"
                required
                style={{
                  width: '100%',
                  padding: '0.6em',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: 14,
                  background: '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5em' }}>
              <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>
                Order Type
              </label>
              <select
                name="orderType"
                value={tradeData.orderType}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.6em',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: 14,
                  background: '#fff'
                }}
              >
                <option value="MARKET">Market Order</option>
                <option value="LIMIT">Limit Order</option>
                <option value="STOP">Stop Order</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.8em' }}>
              <button
                onClick={() => handleTrade('BUY')}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.8em',
                  background: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Processing...' : 'Confirm Buy'}
              </button>
              <button
                onClick={closeModal}
                style={{
                  flex: 1,
                  padding: '0.8em',
                  background: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sell Modal */}
      {isAdmin && showSellModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            padding: '1.5em',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1em' }}>
              <h3 style={{ color: '#dc3545', margin: 0, fontWeight: 600, fontSize: '1.2em' }}>Sell Order</h3>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5em',
                  cursor: 'pointer',
                  color: '#6c757d',
                  padding: 0
                }}
              >
                ×
              </button>
            </div>

            {selectedOption && (
              <div style={{ 
                background: '#f8f9fa', 
                padding: '0.8em', 
                borderRadius: '4px', 
                marginBottom: '1em',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: 12, color: '#6c757d', marginBottom: '0.3em' }}>
                  Selected Option: {selectedOption.tradingSymbol || selectedOption.symbol || 'N/A'}
                </div>
                <div style={{ fontSize: 12, color: '#6c757d' }}>
                  Strike: {selectedOption.strikePrice || 'N/A'} | 
                  Type: {selectedOption.optionType || 'N/A'} | 
                  Token: {selectedOption.token || 'N/A'}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '1em' }}>
              <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={tradeData.quantity}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                min="1"
                required
                style={{
                  width: '100%',
                  padding: '0.6em',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: 14,
                  background: '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: '1em' }}>
              <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>
                Price *
              </label>
              <input
                type="number"
                name="price"
                value={tradeData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                min="0"
                step="0.01"
                required
                style={{
                  width: '100%',
                  padding: '0.6em',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: 14,
                  background: '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5em' }}>
              <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>
                Order Type
              </label>
              <select
                name="orderType"
                value={tradeData.orderType}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.6em',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: 14,
                  background: '#fff'
                }}
              >
                <option value="MARKET">Market Order</option>
                <option value="LIMIT">Limit Order</option>
                <option value="STOP">Stop Order</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.8em' }}>
              <button
                onClick={() => handleTrade('SELL')}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.8em',
                  background: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Processing...' : 'Confirm Sell'}
              </button>
              <button
                onClick={closeModal}
                style={{
                  flex: 1,
                  padding: '0.8em',
                  background: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
  </div>
      )}
    </>
);
};

export default BuySellButtons; 