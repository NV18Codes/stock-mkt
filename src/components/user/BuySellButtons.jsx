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
        gap: 'clamp(0.5em, 1.5vw, 0.8em)', 
        marginTop: 'clamp(0.8em, 2vw, 1em)',
        flexDirection: 'row',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => isAdmin && openModal('BUY')}
          disabled={!selectedOption || !isAdmin}
          style={{
            flex: '1 1 200px',
            padding: 'clamp(0.6em, 2vw, 0.8em)',
            background: '#28a745',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            fontWeight: 600,
            cursor: selectedOption && isAdmin ? 'pointer' : 'not-allowed',
            opacity: selectedOption && isAdmin ? 1 : 0.6,
            transition: 'all 0.2s ease',
            minHeight: 'clamp(40px, 8vw, 48px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => selectedOption && isAdmin && (e.target.style.background = '#1e7e34')}
          onMouseOut={(e) => selectedOption && isAdmin && (e.target.style.background = '#28a745')}
        >
          BUY
        </button>
        
        <button
          onClick={() => isAdmin && openModal('SELL')}
          disabled={!selectedOption || !isAdmin}
          style={{
            flex: '1 1 200px',
            padding: 'clamp(0.6em, 2vw, 0.8em)',
            background: '#dc3545',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            fontWeight: 600,
            cursor: selectedOption && isAdmin ? 'pointer' : 'not-allowed',
            opacity: selectedOption && isAdmin ? 1 : 0.6,
            transition: 'all 0.2s ease',
            minHeight: 'clamp(40px, 8vw, 48px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => selectedOption && isAdmin && (e.target.style.background = '#c82333')}
          onMouseOut={(e) => selectedOption && isAdmin && (e.target.style.background = '#dc3545')}
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
          zIndex: 1000,
          padding: 'clamp(0.5em, 2vw, 1em)'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            padding: 'clamp(1em, 3vw, 1.5em)',
            maxWidth: 'clamp(300px, 90vw, 400px)',
            width: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 'clamp(0.8em, 2vw, 1em)' 
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
                  fontSize: 'clamp(1.2em, 3vw, 1.5em)',
                  cursor: 'pointer',
                  color: '#6c757d',
                  padding: 'clamp(0.2em, 0.5vw, 0.4em)',
                  minWidth: 'clamp(30px, 6vw, 40px)',
                  minHeight: 'clamp(30px, 6vw, 40px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {selectedOption && (
              <div style={{ 
                background: '#f8f9fa', 
                padding: 'clamp(0.6em, 1.5vw, 0.8em)', 
                borderRadius: '4px', 
                marginBottom: 'clamp(0.8em, 2vw, 1em)',
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
                  Type: {selectedOption.optionType || 'N/A'}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 'clamp(0.8em, 2vw, 1em)' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.3em', 
                fontWeight: 500, 
                color: '#2c3e50',
                fontSize: 'clamp(11px, 2.2vw, 12px)'
              }}>
                Quantity:
              </label>
              <input
                type="number"
                name="quantity"
                value={tradeData.quantity}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                style={{
                  width: '100%',
                  padding: 'clamp(0.5em, 1.5vw, 0.7em)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  minHeight: 'clamp(36px, 8vw, 44px)'
                }}
              />
            </div>

            <div style={{ marginBottom: 'clamp(0.8em, 2vw, 1em)' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.3em', 
                fontWeight: 500, 
                color: '#2c3e50',
                fontSize: 'clamp(11px, 2.2vw, 12px)'
              }}>
                Price (₹):
              </label>
              <input
                type="number"
                name="price"
                value={tradeData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                step="0.01"
                style={{
                  width: '100%',
                  padding: 'clamp(0.5em, 1.5vw, 0.7em)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  minHeight: 'clamp(36px, 8vw, 44px)'
                }}
              />
            </div>

            <div style={{ marginBottom: 'clamp(1em, 2.5vw, 1.5em)' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.3em', 
                fontWeight: 500, 
                color: '#2c3e50',
                fontSize: 'clamp(11px, 2.2vw, 12px)'
              }}>
                Order Type:
              </label>
              <select
                name="orderType"
                value={tradeData.orderType}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: 'clamp(0.5em, 1.5vw, 0.7em)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  minHeight: 'clamp(36px, 8vw, 44px)'
                }}
              >
                <option value="MARKET">Market</option>
                <option value="LIMIT">Limit</option>
              </select>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: 'clamp(0.5em, 1.5vw, 0.8em)',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => handleTrade('BUY')}
                disabled={loading}
                style={{
                  flex: '1 1 120px',
                  padding: 'clamp(0.6em, 2vw, 0.8em)',
                  background: '#28a745',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: 'clamp(11px, 2.2vw, 13px)',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  minHeight: 'clamp(40px, 8vw, 48px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {loading ? 'Processing...' : 'Place Buy Order'}
              </button>
              
              <button
                onClick={closeModal}
                style={{
                  flex: '1 1 120px',
                  padding: 'clamp(0.6em, 2vw, 0.8em)',
                  background: '#6c757d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: 'clamp(11px, 2.2vw, 13px)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: 'clamp(40px, 8vw, 48px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
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
          zIndex: 1000,
          padding: 'clamp(0.5em, 2vw, 1em)'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '8px',
            padding: 'clamp(1em, 3vw, 1.5em)',
            maxWidth: 'clamp(300px, 90vw, 400px)',
            width: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 'clamp(0.8em, 2vw, 1em)' 
            }}>
              <h3 style={{ 
                color: '#dc3545', 
                margin: 0, 
                fontWeight: 600, 
                fontSize: 'clamp(1em, 3vw, 1.2em)' 
              }}>
                Sell Order
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 'clamp(1.2em, 3vw, 1.5em)',
                  cursor: 'pointer',
                  color: '#6c757d',
                  padding: 'clamp(0.2em, 0.5vw, 0.4em)',
                  minWidth: 'clamp(30px, 6vw, 40px)',
                  minHeight: 'clamp(30px, 6vw, 40px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {selectedOption && (
              <div style={{ 
                background: '#f8f9fa', 
                padding: 'clamp(0.6em, 1.5vw, 0.8em)', 
                borderRadius: '4px', 
                marginBottom: 'clamp(0.8em, 2vw, 1em)',
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
                  Type: {selectedOption.optionType || 'N/A'}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 'clamp(0.8em, 2vw, 1em)' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.3em', 
                fontWeight: 500, 
                color: '#2c3e50',
                fontSize: 'clamp(11px, 2.2vw, 12px)'
              }}>
                Quantity:
              </label>
              <input
                type="number"
                name="quantity"
                value={tradeData.quantity}
                onChange={handleInputChange}
                placeholder="Enter quantity"
                style={{
                  width: '100%',
                  padding: 'clamp(0.5em, 1.5vw, 0.7em)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  minHeight: 'clamp(36px, 8vw, 44px)'
                }}
              />
            </div>

            <div style={{ marginBottom: 'clamp(0.8em, 2vw, 1em)' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.3em', 
                fontWeight: 500, 
                color: '#2c3e50',
                fontSize: 'clamp(11px, 2.2vw, 12px)'
              }}>
                Price (₹):
              </label>
              <input
                type="number"
                name="price"
                value={tradeData.price}
                onChange={handleInputChange}
                placeholder="Enter price"
                step="0.01"
                style={{
                  width: '100%',
                  padding: 'clamp(0.5em, 1.5vw, 0.7em)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  minHeight: 'clamp(36px, 8vw, 44px)'
                }}
              />
            </div>

            <div style={{ marginBottom: 'clamp(1em, 2.5vw, 1.5em)' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.3em', 
                fontWeight: 500, 
                color: '#2c3e50',
                fontSize: 'clamp(11px, 2.2vw, 12px)'
              }}>
                Order Type:
              </label>
              <select
                name="orderType"
                value={tradeData.orderType}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: 'clamp(0.5em, 1.5vw, 0.7em)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  minHeight: 'clamp(36px, 8vw, 44px)'
                }}
              >
                <option value="MARKET">Market</option>
                <option value="LIMIT">Limit</option>
              </select>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: 'clamp(0.5em, 1.5vw, 0.8em)',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => handleTrade('SELL')}
                disabled={loading}
                style={{
                  flex: '1 1 120px',
                  padding: 'clamp(0.6em, 2vw, 0.8em)',
                  background: '#dc3545',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: 'clamp(11px, 2.2vw, 13px)',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  minHeight: 'clamp(40px, 8vw, 48px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {loading ? 'Processing...' : 'Place Sell Order'}
              </button>
              
              <button
                onClick={closeModal}
                style={{
                  flex: '1 1 120px',
                  padding: 'clamp(0.6em, 2vw, 0.8em)',
                  background: '#6c757d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: 'clamp(11px, 2.2vw, 13px)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: 'clamp(40px, 8vw, 48px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
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