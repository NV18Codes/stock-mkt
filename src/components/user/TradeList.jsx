import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import TradeDetails from './TradeDetails';
import { motion } from 'framer-motion';
import { RefreshCw, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_ENDPOINTS } from '../../config/environment';
import { exitTrade } from '../../api/admin';

const TradeList = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [showTradeDetails, setShowTradeDetails] = useState(false);
  const [exitTradeStatus, setExitTradeStatus] = useState('');
  const [exitTradeLoading, setExitTradeLoading] = useState(false);

  // Filter trades based on search term with active search
  const filteredTrades = useMemo(() => {
    if (!searchTerm.trim()) return trades;
    
    const searchLower = searchTerm.toLowerCase();
    return trades.filter(trade => 
      (trade.symbol && trade.symbol.toLowerCase().includes(searchLower)) ||
      (trade.tradingSymbol && trade.tradingSymbol.toLowerCase().includes(searchLower)) ||
      (trade.type && trade.type.toLowerCase().includes(searchLower)) ||
      (trade.orderType && trade.orderType.toLowerCase().includes(searchLower)) ||
      (trade.status && trade.status.toLowerCase().includes(searchLower)) ||
      (trade.id && trade.id.toString().includes(searchLower)) ||
      (trade.tradeId && trade.tradeId.toString().includes(searchLower)) ||
      (trade.quantity && trade.quantity.toString().includes(searchLower)) ||
      (trade.price && trade.price.toString().includes(searchLower))
    );
  }, [trades, searchTerm]);

  const fetchTrades = useCallback(async () => {
      setLoading(true);
      setError('');
      try {
        // New Railway URL
        const response = await axios.get(API_ENDPOINTS.USERS.BROKER.TRADES);
        // Legacy AWS URL (commented out)
        // const response = await axios.get('https://y9tyscpumt.us-east-1.awsapprunner.com/api/users/me/broker/trades');
        if (response.data && response.data.success) {
          setTrades(response.data.trades || []);
        } else if (response.data && Array.isArray(response.data)) {
          setTrades(response.data);
        } else {
          setTrades([]);
        }
      } catch (error) {
        console.error('Error fetching trades:', error);
        setError('Failed to fetch trade history. Please try again later.');
        setTrades([]);
      } finally {
        setLoading(false);
      }
  }, []);

  const refreshTrades = useCallback(async () => {
    setRefreshing(true);
    await fetchTrades();
    setRefreshing(false);
  }, [fetchTrades]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  // Listen for trade history refresh events (e.g., after placing an order)
  useEffect(() => {
    const handleRefreshEvent = () => {
      console.log('TradeList: Received refresh event, refreshing trades...');
      refreshTrades();
    };

    window.addEventListener('refreshTradeHistory', handleRefreshEvent);
    
    return () => {
      window.removeEventListener('refreshTradeHistory', handleRefreshEvent);
    };
  }, [refreshTrades]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleTradeClick = (trade) => {
    setSelectedTrade(trade);
    setShowTradeDetails(true);
  };

  const closeTradeDetails = () => {
    setShowTradeDetails(false);
    setSelectedTrade(null);
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
          refreshTrades();
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

  const getStatusColor = (status) => {
    if (!status) return '#6c757d';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed') || statusLower.includes('filled')) return 'var(--primary-color)';
    if (statusLower.includes('pending') || statusLower.includes('open')) return '#ffa726';
    if (statusLower.includes('cancelled') || statusLower.includes('rejected')) return '#ff6b6b';
    if (statusLower.includes('partial')) return '#667eea';
    return '#6c757d';
  };

  const getTypeColor = (type) => {
    if (!type) return '#6c757d';
    const typeLower = type.toLowerCase();
    if (typeLower.includes('buy')) return 'var(--primary-color)';
    if (typeLower.includes('sell')) return '#ff6b6b';
    return '#667eea';
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 'clamp(2em, 5vw, 4em)',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.3)'
      }}>
        <div className="loading-spinner" style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e3e3e3',
          borderTop: '4px solid #667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1em'
        }} />
        <p style={{ 
          color: '#2c3e50', 
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          fontWeight: 500
        }}>
          Loading trade history...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 'clamp(2em, 5vw, 4em)',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.3)'
      }}>
        <div style={{ 
          fontSize: '3em', 
          marginBottom: '0.5em',
          color: '#ff6b6b'
        }}>
          ⚠️
        </div>
        <p style={{ 
          color: '#2c3e50', 
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          fontWeight: 500,
          marginBottom: '1em'
        }}>
          {error}
        </p>
        <button
          onClick={fetchTrades}
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
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'rgba(255,255,255,0.95)', 
      borderRadius: '16px', 
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)', 
      border: '1px solid rgba(255,255,255,0.3)', 
      padding: 'clamp(1.5em, 3vw, 2em)',
      backdropFilter: 'blur(10px)'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 'clamp(1.5em, 3vw, 2em)',
        flexWrap: 'wrap',
        gap: '1em'
      }}>
        <div>
          <h3 style={{ 
            color: '#2c3e50', 
            fontSize: 'clamp(1.2em, 3vw, 1.5em)', 
            margin: '0 0 0.5em 0',
            fontWeight: 700
          }}>
            📋 Trade History
          </h3>
          <p style={{ 
            color: '#6c757d', 
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            margin: 0
          }}>
            {filteredTrades.length} {filteredTrades.length === 1 ? 'trade' : 'trades'} found
          </p>
        </div>
        
        {/* Search and Refresh Controls */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'clamp(0.5em, 1vw, 0.8em)', 
          flexWrap: 'wrap' 
        }}>
          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search trades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(2.5em, 3vw, 3em) clamp(0.6em, 1.5vw, 0.8em) clamp(0.8em, 2vw, 1em)',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                minWidth: 'clamp(200px, 25vw, 300px)',
                transition: 'all 0.3s ease',
                background: '#ffffff'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102,126,234,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            />
            <span style={{
              position: 'absolute',
              left: 'clamp(0.8em, 2vw, 1em)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6c757d',
              fontSize: 'clamp(14px, 2.5vw, 16px)'
            }}>
              🔍
            </span>
            {searchTerm && (
              <button
                onClick={clearSearch}
                style={{
                  position: 'absolute',
                  right: 'clamp(0.8em, 2vw, 1em)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#6c757d',
                  cursor: 'pointer',
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  padding: '0.2em',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease'
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
                ✕
              </button>
            )}
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={refreshTrades}
            disabled={refreshing}
            style={{
              padding: 'clamp(0.6em, 1.5vw, 0.8em)',
              borderRadius: '12px',
                      border: '1px solid var(--primary-color)',
        background: refreshing ? '#ccc' : 'var(--gradient-primary)',
              color: '#ffffff',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              fontSize: 'clamp(14px, 2.5vw, 16px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 'clamp(40px, 5vw, 50px)',
              height: 'clamp(40px, 5vw, 50px)'
            }}
            onMouseEnter={(e) => {
              if (!refreshing) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 15px rgba(211, 80, 63, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!refreshing) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {refreshing ? '🔄' : '🔄'}
          </button>
        </div>
      </div>

      {/* Trades Table */}
      {filteredTrades.length > 0 ? (
        <>
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
              fontWeight: '500',
              textAlign: 'center'
            }}>
              {exitTradeStatus}
            </div>
          )}
          
          {/* Clickable indicator */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: '#ffffff',
            padding: '1em',
            borderRadius: '12px',
            marginBottom: '1em',
            textAlign: 'center',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            fontWeight: 500
          }}>
            💡 <strong>Tip:</strong> Click on any trade row to view detailed information
          </div>
          
          <div style={{ 
            overflowX: 'auto',
            borderRadius: '12px',
            border: '1px solid rgba(0,0,0,0.1)'
          }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            background: '#ffffff',
            fontSize: 'clamp(11px, 2.5vw, 13px)',
            minWidth: '800px'
          }}>
            <thead>
              <tr style={{ 
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: '#ffffff'
              }}>
                <th style={{ 
                  padding: 'clamp(0.8em, 2vw, 1em)', 
                  textAlign: 'left', 
                  fontWeight: 600,
                  fontSize: 'clamp(12px, 2.5vw, 14px)'
                }}>
                  Symbol
                </th>
                <th style={{ 
                  padding: 'clamp(0.8em, 2vw, 1em)', 
                  textAlign: 'center', 
                  fontWeight: 600,
                  fontSize: 'clamp(12px, 2.5vw, 14px)'
                }}>
                  Type
                </th>
                <th style={{ 
                  padding: 'clamp(0.8em, 2vw, 1em)', 
                  textAlign: 'center', 
                  fontWeight: 600,
                  fontSize: 'clamp(12px, 2.5vw, 14px)'
                }}>
                  Quantity
                </th>
                <th style={{ 
                  padding: 'clamp(0.8em, 2vw, 1em)', 
                  textAlign: 'center', 
                  fontWeight: 600,
                  fontSize: 'clamp(12px, 2.5vw, 14px)'
                }}>
                  Price
                </th>
                <th style={{ 
                  padding: 'clamp(0.8em, 2vw, 1em)', 
                  textAlign: 'center', 
                  fontWeight: 600,
                  fontSize: 'clamp(12px, 2.5vw, 14px)'
                }}>
                  Status
                </th>
                <th style={{ 
                  padding: 'clamp(0.8em, 2vw, 1em)', 
                  textAlign: 'center', 
                  fontWeight: 600,
                  fontSize: 'clamp(12px, 2.5vw, 14px)'
                }}>
                  Date
                </th>
                <th style={{ 
                  padding: 'clamp(0.8em, 2vw, 1em)', 
                  textAlign: 'center', 
                  fontWeight: 600,
                  fontSize: 'clamp(12px, 2.5vw, 14px)'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade, index) => (
                <tr key={trade.id || trade.tradeId || index} 
                    style={{ 
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleTradeClick(trade)}
                    onMouseEnter={(e) => {
                      e.target.parentElement.style.background = '#f8f9fa';
                      e.target.parentElement.style.transform = 'scale(1.01)';
                      e.target.parentElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.parentElement.style.background = '#ffffff';
                      e.target.parentElement.style.transform = 'scale(1)';
                      e.target.parentElement.style.boxShadow = 'none';
                    }}>
                  <td style={{ 
                    padding: 'clamp(0.8em, 2vw, 1em)', 
                    fontWeight: 600,
                    color: '#2c3e50'
                  }}>
                    {trade.symbol || trade.tradingSymbol || 'N/A'}
                  </td>
                  <td style={{ 
                    padding: 'clamp(0.8em, 2vw, 1em)', 
                    textAlign: 'center' 
                  }}>
                    <span style={{
                      padding: 'clamp(0.3em, 1vw, 0.5em) clamp(0.6em, 1.5vw, 0.8em)',
                      borderRadius: '20px',
                      fontSize: 'clamp(10px, 2vw, 12px)',
                      fontWeight: 600,
                      color: '#ffffff',
                      background: getTypeColor(trade.type || trade.orderType),
                      textTransform: 'uppercase'
                    }}>
                      {trade.type || trade.orderType || 'N/A'}
                    </span>
                  </td>
                  <td style={{ 
                    padding: 'clamp(0.8em, 2vw, 1em)', 
                    textAlign: 'center',
                    fontWeight: 500,
                    color: '#2c3e50'
                  }}>
                    {trade.quantity || 'N/A'}
                  </td>
                  <td style={{ 
                    padding: 'clamp(0.8em, 2vw, 1em)', 
                    textAlign: 'center',
                    fontWeight: 500,
                    color: '#2c3e50'
                  }}>
                    ₹{trade.price || 'N/A'}
                  </td>
                  <td style={{ 
                    padding: 'clamp(0.8em, 2vw, 1em)', 
                    textAlign: 'center' 
                  }}>
                    <span style={{
                      padding: 'clamp(0.3em, 1vw, 0.5em) clamp(0.6em, 1.5vw, 0.8em)',
                      borderRadius: '20px',
                      fontSize: 'clamp(10px, 2vw, 12px)',
                      fontWeight: 600,
                      color: '#ffffff',
                      background: getStatusColor(trade.status),
                      textTransform: 'capitalize'
                    }}>
                      {trade.status || 'N/A'}
                    </span>
                  </td>
                  <td style={{ 
                    padding: 'clamp(0.8em, 2vw, 1em)', 
                    textAlign: 'center',
                    fontSize: 'clamp(10px, 2vw, 12px)',
                    color: '#6c757d'
                  }}>
                    {trade.timestamp ? new Date(trade.timestamp).toLocaleDateString() : 
                     trade.created_at ? new Date(trade.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ 
                    padding: 'clamp(0.8em, 2vw, 1em)', 
                    textAlign: 'center'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        handleExitTrade(trade.id || trade.tradeId);
                      }}
                      disabled={(!trade.id && !trade.tradeId) || exitTradeLoading}
                      style={{
                        padding: '0.4em 0.8em',
                        borderRadius: '6px',
                        border: '1px solid #d3503f',
                        background: (!trade.id && !trade.tradeId) || exitTradeLoading ? '#ccc' : 'linear-gradient(135deg, #d3503f, #c53030)',
                        color: '#ffffff',
                        fontWeight: 600,
                        cursor: (!trade.id && !trade.tradeId) || exitTradeLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        fontSize: 'clamp(10px, 2vw, 12px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3em',
                        margin: '0 auto'
                      }}
                      onMouseEnter={(e) => {
                        if ((trade.id || trade.tradeId) && !exitTradeLoading) {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 2px 8px rgba(211, 80, 63, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if ((trade.id || trade.tradeId) && !exitTradeLoading) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {exitTradeLoading ? '🔄' : '🚪'} {exitTradeLoading ? 'Exiting...' : 'Exit'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: 'clamp(3em, 6vw, 5em)',
          color: '#6c757d'
        }}>
          <div style={{ 
            fontSize: 'clamp(3em, 6vw, 5em)', 
            marginBottom: '1em',
            opacity: 0.5
          }}>
            📊
          </div>
          <h4 style={{ 
            margin: '0 0 0.5em 0',
            fontSize: 'clamp(1.2em, 3vw, 1.5em)',
            color: '#2c3e50'
          }}>
            {searchTerm ? 'No trades found' : 'No trades yet'}
          </h4>
          <p style={{ 
            margin: 0,
            fontSize: 'clamp(12px, 2.5vw, 14px)'
          }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Start trading to see your trade history here'}
          </p>
        </div>
      )}

      {showTradeDetails && selectedTrade && (
        <TradeDetails trade={selectedTrade} onClose={closeTradeDetails} />
      )}
    </div>
  );
};

export default TradeList; 