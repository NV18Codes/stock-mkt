import React from 'react';
import { X, Calendar, Clock, TrendingUp, TrendingDown, DollarSign, Hash, Building, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const TradeDetails = ({ trade, isOpen, onClose }) => {
  if (!isOpen || !trade) return null;

  const getStatusIcon = (status) => {
    if (!status) return <AlertCircle size={20} color="#6c757d" />;
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed') || statusLower.includes('filled')) {
      return <CheckCircle size={20} color="#00d4aa" />;
    }
    if (statusLower.includes('pending') || statusLower.includes('open')) {
      return <AlertCircle size={20} color="#ffa726" />;
    }
    if (statusLower.includes('cancelled') || statusLower.includes('rejected')) {
      return <XCircle size={20} color="#ff6b6b" />;
    }
    return <AlertCircle size={20} color="#6c757d" />;
  };

  const getTypeIcon = (type) => {
    if (!type) return <TrendingUp size={20} color="#6c757d" />;
    const typeLower = type.toLowerCase();
    if (typeLower.includes('buy')) {
      return <TrendingUp size={20} color="#00d4aa" />;
    }
    if (typeLower.includes('sell')) {
      return <TrendingDown size={20} color="#ff6b6b" />;
    }
    return <TrendingUp size={20} color="#667eea" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return 'Invalid Time';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 'N/A') return '₹0.00';
    const num = parseFloat(amount);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toFixed(2)}`;
  };

  const formatNumber = (num) => {
    if (!num || num === 'N/A') return '0';
    const number = parseFloat(num);
    if (isNaN(number)) return '0';
    return number.toLocaleString();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1em'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '2em',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2em',
          paddingBottom: '1em',
          borderBottom: '2px solid #f8f9fa'
        }}>
          <div>
            <h2 style={{
              color: '#2c3e50',
              margin: '0 0 0.5em 0',
              fontSize: '1.8em',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}>
              {getTypeIcon(trade.type || trade.orderType)}
              Trade Details
            </h2>
            <p style={{
              color: '#6c757d',
              margin: 0,
              fontSize: '1.1em'
            }}>
              {trade.symbol || trade.tradingSymbol || 'Unknown Symbol'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5em',
              cursor: 'pointer',
              color: '#6c757d',
              padding: '0.5em',
              borderRadius: '50%',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px'
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
            <X size={24} />
          </button>
        </div>

        {/* Trade Information Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2em',
          marginBottom: '2em'
        }}>
          {/* Basic Trade Info */}
          <div style={{
            background: '#f8f9fa',
            padding: '1.5em',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{
              color: '#2c3e50',
              margin: '0 0 1em 0',
              fontSize: '1.2em',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}>
              <Hash size={20} color="#667eea" />
              Basic Information
            </h3>
            
            <div style={{ display: 'grid', gap: '1em' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.8em',
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <span style={{ color: '#495057', fontWeight: 500 }}>Trade ID:</span>
                <span style={{ color: '#2c3e50', fontWeight: 600, fontFamily: 'monospace' }}>
                  {trade.id || trade.tradeId || 'N/A'}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.8em',
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <span style={{ color: '#495057', fontWeight: 500 }}>Symbol:</span>
                <span style={{ color: '#2c3e50', fontWeight: 600 }}>
                  {trade.symbol || trade.tradingSymbol || 'N/A'}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.8em',
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <span style={{ color: '#495057', fontWeight: 500 }}>Type:</span>
                <span style={{
                  padding: '0.4em 0.8em',
                  borderRadius: '20px',
                  fontSize: '0.9em',
                  fontWeight: 600,
                  color: '#ffffff',
                  background: trade.type?.toLowerCase().includes('buy') ? '#00d4aa' : 
                             trade.type?.toLowerCase().includes('sell') ? '#ff6b6b' : '#667eea',
                  textTransform: 'uppercase'
                }}>
                  {trade.type || trade.orderType || 'N/A'}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.8em',
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <span style={{ color: '#495057', fontWeight: 500 }}>Status:</span>
                <span style={{
                  padding: '0.4em 0.8em',
                  borderRadius: '20px',
                  fontSize: '0.9em',
                  fontWeight: 600,
                  color: '#ffffff',
                  background: trade.status?.toLowerCase().includes('completed') || trade.status?.toLowerCase().includes('filled') ? '#00d4aa' :
                             trade.status?.toLowerCase().includes('pending') || trade.status?.toLowerCase().includes('open') ? '#ffa726' :
                             trade.status?.toLowerCase().includes('cancelled') || trade.status?.toLowerCase().includes('rejected') ? '#ff6b6b' : '#6c757d',
                  textTransform: 'capitalize'
                }}>
                  {getStatusIcon(trade.status)}
                  {trade.status || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Trade Details */}
          <div style={{
            background: '#f8f9fa',
            padding: '1.5em',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{
              color: '#2c3e50',
              margin: '0 0 1em 0',
              fontSize: '1.2em',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}>
              <DollarSign size={20} color="#28a745" />
              Trade Details
            </h3>
            
            <div style={{ display: 'grid', gap: '1em' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.8em',
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <span style={{ color: '#495057', fontWeight: 500 }}>Quantity:</span>
                <span style={{ color: '#2c3e50', fontWeight: 600 }}>
                  {formatNumber(trade.quantity)}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.8em',
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <span style={{ color: '#495057', fontWeight: 500 }}>Price:</span>
                <span style={{ color: '#2c3e50', fontWeight: 600 }}>
                  {formatCurrency(trade.price)}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.8em',
                background: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <span style={{ color: '#495057', fontWeight: 500 }}>Total Value:</span>
                <span style={{ color: '#2c3e50', fontWeight: 600 }}>
                  {formatCurrency(trade.quantity && trade.price ? trade.quantity * trade.price : 'N/A')}
                </span>
              </div>
              
              {trade.orderType && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.8em',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <span style={{ color: '#495057', fontWeight: 500 }}>Order Type:</span>
                  <span style={{ color: '#2c3e50', fontWeight: 600 }}>
                    {trade.orderType}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Timestamp Information */}
        <div style={{
          background: '#f8f9fa',
          padding: '1.5em',
          borderRadius: '12px',
          border: '1px solid #e9ecef',
          marginBottom: '2em'
        }}>
          <h3 style={{
            color: '#2c3e50',
            margin: '0 0 1em 0',
            fontSize: '1.2em',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}>
            <Calendar size={20} color="#17a2b8" />
            Timestamp Information
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1em'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.8em',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <span style={{ color: '#495057', fontWeight: 500 }}>Date:</span>
              <span style={{ color: '#2c3e50', fontWeight: 600 }}>
                {formatDate(trade.timestamp || trade.created_at)}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.8em',
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <span style={{ color: '#495057', fontWeight: 500 }}>Time:</span>
              <span style={{ color: '#2c3e50', fontWeight: 600 }}>
                {formatTime(trade.timestamp || trade.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {(trade.exchange || trade.product || trade.segment || trade.instrument) && (
          <div style={{
            background: '#f8f9fa',
            padding: '1.5em',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            marginBottom: '2em'
          }}>
            <h3 style={{
              color: '#2c3e50',
              margin: '0 0 1em 0',
              fontSize: '1.2em',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}>
              <Building size={20} color="#6f42c1" />
              Additional Information
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1em'
            }}>
              {trade.exchange && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.8em',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <span style={{ color: '#495057', fontWeight: 500 }}>Exchange:</span>
                  <span style={{ color: '#2c3e50', fontWeight: 600 }}>
                    {trade.exchange}
                  </span>
                </div>
              )}
              
              {trade.product && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.8em',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <span style={{ color: '#495057', fontWeight: 500 }}>Product:</span>
                  <span style={{ color: '#2c3e50', fontWeight: 600 }}>
                    {trade.product}
                  </span>
                </div>
              )}
              
              {trade.segment && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.8em',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <span style={{ color: '#495057', fontWeight: 500 }}>Segment:</span>
                  <span style={{ color: '#2c3e50', fontWeight: 600 }}>
                    {trade.segment}
                  </span>
                </div>
              )}
              
              {trade.instrument && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.8em',
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <span style={{ color: '#495057', fontWeight: 500 }}>Instrument:</span>
                  <span style={{ color: '#2c3e50', fontWeight: 600 }}>
                    {trade.instrument}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '1em 2em',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1em',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102,126,234,0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(102,126,234,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(102,126,234,0.3)';
            }}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeDetails;
