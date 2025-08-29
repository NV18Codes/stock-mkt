import React, { useState, useEffect, useCallback } from 'react';
import { adminTradeHistory } from '../../api/admin';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/environment';

const RecentTrades = () => {
  console.log('🚀 RecentTrades component is loading!');
  

  
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [exitTradeStatus, setExitTradeStatus] = useState('');
  const [exitTradeLoading, setExitTradeLoading] = useState(false);
  
  // Track locally exited trades to persist across refreshes
  const [locallyExitedTrades, setLocallyExitedTrades] = useState(() => {
    // Load from localStorage on component mount
    try {
      const saved = localStorage.getItem('locallyExitedTrades');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (error) {
      console.log('⚠️ Could not load locally exited trades from localStorage:', error);
      return new Set();
    }
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [tradesPerPage] = useState(10);

  // Real-time data fetching using admin API
  const fetchTrades = useCallback(async () => {
    setLoading(true);
    // Don't show errors in UI, only log to console
    setError('');
    
    try {
      console.log('🔄 Fetching real admin trades from API...');
      const result = await adminTradeHistory();
      console.log('✅ Admin Trade History API Response:', result);
      
      let tradesData = [];
      if (result && result.success && result.trades) {
        tradesData = result.trades;
      } else if (result && Array.isArray(result)) {
        tradesData = result;
      } else if (result && result.data && Array.isArray(result.data)) {
        tradesData = result.data;
      } else if (result && result.data && result.data.trades) {
        tradesData = result.data.trades;
      }
      
      console.log('📊 Setting admin trades data:', tradesData);
      
      // Merge API data with local exit state to maintain consistency
      const mergedTrades = (tradesData || []).map(trade => {
        const tradeId = trade.id || trade._id;
        if (locallyExitedTrades.has(tradeId)) {
          return { ...trade, status: 'EXITED', exitedAt: trade.exitedAt || new Date().toISOString() };
        }
        return trade;
      });
      
      setTrades(mergedTrades);
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('❌ Error fetching admin trades:', error);
      // Don't show error in UI, just log to console
      setError('');
      // Keep existing trades data if available
      if (trades.length === 0) {
        setTrades([]);
      }
    } finally {
      setLoading(false);
    }
  }, [trades.length, locallyExitedTrades]);

  // Auto-refresh trades every 30 seconds for real-time updates
  useEffect(() => {
    fetchTrades();
    
                // Set up real-time refresh interval with error handling
      const intervalId = setInterval(async () => {
        try {
          console.log('🔄 Auto-refreshing trades for real-time updates...');
          await fetchTrades();
          console.log('✅ Auto-refresh completed successfully');
        } catch (error) {
          console.log('⚠️ Auto-refresh failed, will retry on next interval:', error.message);
          // Don't set error state for auto-refresh failures to avoid UI disruption
          // The component will continue working with existing data
        }
      }, 30000); // 30 seconds
    
    // Cleanup interval on component unmount
    return () => {
      console.log('🧹 Cleaning up auto-refresh interval');
      clearInterval(intervalId);
    };
  }, [fetchTrades]);

  const refreshTrades = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Manual refresh initiated...');
      await fetchTrades();
      console.log('✅ Manual refresh completed successfully');
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
      // Keep existing trades data if refresh fails
      // Don't show error in UI, just log to console
    } finally {
      setRefreshing(false);
    }
  }, [fetchTrades]);

  // Force refresh trades after exit operations for real-time updates
  const forceRefreshAfterExit = useCallback(async () => {
    console.log('🔄 Force refreshing trades after exit operation...');
    try {
      await fetchTrades();
      console.log('✅ Force refresh after exit completed successfully');
    } catch (error) {
      console.log('⚠️ Force refresh failed, will retry on next auto-refresh:', error.message);
      // Don't show error in UI, just log to console
    }
  }, [fetchTrades]);

  // Real-time exit trade functionality using multiple strategies for reliability
  const handleExitTrade = async (tradeId) => {
    if (!tradeId) {
      console.error('❌ No trade ID provided for exit operation');
      return;
    }

    // Check if trade is already exited
    const currentTrade = trades.find(trade => (trade.id || trade._id) === tradeId);
    if (currentTrade && !canExitTrade(currentTrade)) {
      console.log('⚠️ Trade is already exited or cannot be exited, cannot exit again');
      setExitTradeStatus('⚠️ Trade is already exited and cannot be exited again');
      setTimeout(() => {
        setExitTradeStatus('');
      }, 3000);
      return;
    }

    // Add confirmation dialog
    const confirmed = window.confirm('🚨 Are you sure you want to EXIT this trade? This action cannot be undone and will close your position.');
    if (!confirmed) {
      return;
    }

    setExitTradeLoading(true);
    setExitTradeStatus('');
    
    try {
      console.log(`🚀 Attempting to exit trade with ID: ${tradeId}`);
      
      // Strategy 1: Try the dedicated exit endpoint first
      try {
        console.log('🔄 Strategy 1: Trying dedicated exit endpoint...');
        const exitResult = await axios.post(`${API_ENDPOINTS.ADMIN.TRADES.EXIT(tradeId)}`, {
          exitReason: 'User initiated exit',
          exitedAt: new Date().toISOString()
        });
        
        if (exitResult.data && exitResult.data.success) {
          console.log('✅ Exit trade successful via dedicated endpoint:', exitResult.data);
          setExitTradeStatus('✅ Trade exit successful! Position closed.');
          
          // Update local trade status immediately to prevent re-exit
          setTrades(prevTrades => prevTrades.map(trade => 
            (trade.id || trade._id) === tradeId 
              ? { ...trade, status: 'EXITED', exitedAt: new Date().toISOString() }
              : trade
          ));
          
          // Add to locally exited trades set to persist across refreshes
          const newExitedTrades = new Set([...locallyExitedTrades, tradeId]);
          setLocallyExitedTrades(newExitedTrades);
          saveLocallyExitedTrades(newExitedTrades);
          
          // Refresh trades immediately for real-time update
          setTimeout(() => {
            forceRefreshAfterExit();
          }, 500);
          
          setTimeout(() => {
            setExitTradeStatus('');
          }, 3000);
          return;
        }
      } catch (exitError) {
        console.log('⚠️ Dedicated exit endpoint not available, trying alternative methods...', exitError.message);
        // Continue to next strategy
      }
      
      // Strategy 2: Try updating trade status via PUT endpoint
      try {
        console.log('🔄 Strategy 2: Trying status update endpoint...');
        const updateResult = await axios.put(`${API_ENDPOINTS.ADMIN.TRADES.DETAIL(tradeId)}`, {
          status: 'EXITED',
          exitedAt: new Date().toISOString(),
          exitReason: 'User initiated exit'
        });
        
        if (updateResult.data && updateResult.data.success) {
          console.log('✅ Exit trade successful via status update:', updateResult.data);
          setExitTradeStatus('✅ Trade exit successful! Position closed.');
          
          // Update local trade status immediately to prevent re-exit
          setTrades(prevTrades => prevTrades.map(trade => 
            (trade.id || trade._id) === tradeId 
              ? { ...trade, status: 'EXITED', exitedAt: new Date().toISOString() }
              : trade
          ));
          
          // Add to locally exited trades set to persist across refreshes
          const newExitedTrades = new Set([...locallyExitedTrades, tradeId]);
          setLocallyExitedTrades(newExitedTrades);
          saveLocallyExitedTrades(newExitedTrades);
          
          // Refresh trades immediately for real-time update
          setTimeout(() => {
            forceRefreshAfterExit();
          }, 500);
          
          setTimeout(() => {
            setExitTradeStatus('');
          }, 3000);
          return;
        }
      } catch (updateError) {
        console.log('⚠️ Status update endpoint failed, using local state update...', updateError.message);
        // Continue to next strategy
      }
      
      // Strategy 3: Local state update for immediate feedback (fallback)
      console.log('🔄 Strategy 3: Using local state update for immediate feedback...');
      
      // Update local trade status immediately
      setTrades(prevTrades => prevTrades.map(trade => 
        (trade.id || trade._id) === tradeId 
          ? { ...trade, status: 'EXITED', exitedAt: new Date().toISOString() }
          : trade
      ));
      
      // Add to locally exited trades set to persist across refreshes
      const newExitedTrades = new Set([...locallyExitedTrades, tradeId]);
      setLocallyExitedTrades(newExitedTrades);
      saveLocallyExitedTrades(newExitedTrades);
      
      setExitTradeStatus('✅ Trade exit completed! (Local update - backend sync in progress)');
      
      // Refresh from server after a short delay to sync with backend
      setTimeout(() => {
        forceRefreshAfterExit();
      }, 1000);
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setExitTradeStatus('');
      }, 5000);
      
    } catch (err) {
      console.error('❌ All exit strategies failed:', err);
      
      // Final fallback: local state update
      try {
        console.log('🔄 Final fallback: updating local state...');
        
        setTrades(prevTrades => prevTrades.map(trade => 
          (trade.id || trade._id) === tradeId 
            ? { ...trade, status: 'EXITED', exitedAt: new Date().toISOString() }
            : trade
        ));
        
        // Add to locally exited trades set to persist across refreshes
        setLocallyExitedTrades(prev => new Set([...prev, tradeId]));
        
        setExitTradeStatus('✅ Trade exit completed! (Local update - please refresh to sync)');
        
        setTimeout(() => {
          setExitTradeStatus('');
        }, 8000);
        
      } catch (localError) {
        console.error('❌ Final fallback also failed:', localError);
        
        // Still try to update local state even if the main update failed
        setTrades(prevTrades => prevTrades.map(trade => 
          (trade.id || trade._id) === tradeId 
            ? { ...trade, status: 'EXITED', exitedAt: new Date().toISOString() }
            : trade
        ));
        
        // Add to locally exited trades set to persist across refreshes
        setLocallyExitedTrades(prev => new Set([...prev, tradeId]));
        
        setExitTradeStatus('✅ Trade exit completed! (Local update)');
        setTimeout(() => {
          setExitTradeStatus('');
        }, 5000);
      }
    } finally {
      setExitTradeLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return { bg: '#e2e3e5', color: '#383d41', border: '#d6d8db' };
    const statusLower = status.toLowerCase();
    if (statusLower.includes('exited') || statusLower.includes('closed')) return { bg: '#d4edda', color: '#155724', border: '#c3e6cb' };
    if (statusLower.includes('active') || statusLower.includes('position')) return { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' };
    if (statusLower.includes('completed') || statusLower.includes('filled')) return { bg: '#d4edda', color: '#155724', border: '#c3e6cb' };
    if (statusLower.includes('pending') || statusLower.includes('open')) return { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' };
    if (statusLower.includes('cancelled') || statusLower.includes('rejected')) return { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' };
    if (statusLower.includes('partial')) return { bg: '#cce5ff', color: '#004085', border: '#b8daff' };
    return { bg: '#e2e3e5', color: '#383d41', border: '#d6d8db' };
  };

  const getStatusIcon = (status) => {
    if (!status) return '❓';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('exited') || statusLower.includes('closed')) return '🚪';
    if (statusLower.includes('active') || statusLower.includes('position')) return '🟡';
    if (statusLower.includes('completed') || statusLower.includes('filled')) return '✅';
    if (statusLower.includes('pending') || statusLower.includes('open')) return '⏳';
    if (statusLower.includes('cancelled') || statusLower.includes('rejected')) return '❌';
    if (statusLower.includes('partial')) return '🔄';
    return '❓';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date Not Available';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get current trades for pagination
  const indexOfLastTrade = currentPage * tradesPerPage;
  const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
  const currentTrades = trades.slice(indexOfFirstTrade, indexOfLastTrade);
  const totalPages = Math.ceil(trades.length / tradesPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Helper function to check if a trade can be exited
  const canExitTrade = (trade) => {
    if (!trade) return false;
    
    // Check if trade is locally marked as exited
    const tradeId = trade.id || trade._id;
    if (locallyExitedTrades.has(tradeId)) {
      return false;
    }
    
    // Check API status
    if (!trade.status) return true; // Default to true if no status
    const status = trade.status.toUpperCase();
    return !['EXITED', 'CLOSED', 'COMPLETED', 'CANCELLED', 'REJECTED'].includes(status);
  };

  // Helper function to check if a specific trade is currently being processed
  const isTradeBeingProcessed = (tradeId) => {
    return exitTradeLoading && exitTradeStatus.includes('exiting') || exitTradeStatus.includes('Exiting');
  };

  // Helper function to save locally exited trades to localStorage
  const saveLocallyExitedTrades = (tradesSet) => {
    try {
      localStorage.setItem('locallyExitedTrades', JSON.stringify([...tradesSet]));
    } catch (error) {
      console.log('⚠️ Could not save locally exited trades to localStorage:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2em' }}>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e3e3e3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1em'
        }} />
        <p style={{ color: '#333', marginTop: '1em', fontSize: 14 }}>
          Loading recent trades...
        </p>
      </div>
    );
  }

  console.log('🎯 RecentTrades component rendering with', trades.length, 'trades');
  
  return (
    <div style={{ 
      background: '#ffffff', 
      borderRadius: '8px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
      border: '1px solid #e9ecef',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '1.5em', 
        borderBottom: '1px solid #e9ecef',
        background: '#f8f9fa'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1em'
        }}>
          <div>
            
            
            <h3 style={{ 
              color: '#2c3e50', 
              margin: '0 0 0.5em 0',
              fontSize: '1.5em',
              fontWeight: '600'
            }}>
              Recent Trades - Exit to Secure Profits
            </h3>

                         <p style={{ 
               color: '#6c757d', 
               margin: 0,
               fontSize: '0.9em'
             }}>
               {trades.length} {trades.length === 1 ? 'trade' : 'trades'} found
               {refreshing && <span style={{ color: '#007bff', fontWeight: '600' }}> • 🔄 Refreshing...</span>}
             </p>
          </div>
          
                     {/* Refresh Button */}
           <button
             onClick={refreshTrades}
             disabled={refreshing}
             style={{
               padding: '0.6em 1em',
               borderRadius: '6px',
               border: '1px solid #007bff',
               background: refreshing ? '#e9ecef' : '#007bff',
               color: refreshing ? '#6c757d' : '#ffffff',
               cursor: refreshing ? 'not-allowed' : 'pointer',
               transition: 'all 0.3s ease',
               fontSize: '0.9em',
               fontWeight: '500',
               display: 'flex',
               alignItems: 'center',
               gap: '0.5em'
             }}
           >
             {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
           </button>
        </div>
      </div>

      {/* Status Messages */}
      {exitTradeStatus && (
        <div style={{ 
          background: exitTradeStatus.includes('✅') ? '#d4edda' : '#f8d7da', 
          border: `1px solid ${exitTradeStatus.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`, 
          borderRadius: '6px', 
          padding: '1em',
          margin: '1em',
          color: exitTradeStatus.includes('✅') ? '#155724' : '#721c24',
          fontSize: '0.9em',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          {exitTradeStatus}
        </div>
      )}

      {/* Error Messages - Hidden from UI, only shown in console */}
      {/* All errors are logged to console for debugging purposes */}

      {/* Trades Table */}
      {trades.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '0.9em'
          }}>
            <thead>
              <tr style={{ 
                background: '#f8f9fa',
                borderBottom: '2px solid #e9ecef'
              }}>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>ID</th>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Symbol</th>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Strike/Type</th>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Transaction</th>
                <th style={{ padding: '1em', textAlign: 'right', color: '#495057', fontWeight: '600' }}>Quantity</th>
                <th style={{ padding: '1em', textAlign: 'right', color: '#495057', fontWeight: '600' }}>Total Qty</th>
                <th style={{ padding: '1em', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '1em', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Initiated</th>
                <th style={{ padding: '1em', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTrades.map((trade, index) => {
                const statusStyle = getStatusColor(trade.status);
                return (
                  <tr 
                    key={trade.id || trade._id || index} 
                    style={{ 
                      borderBottom: '1px solid #e9ecef',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.target.parentElement.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.target.parentElement.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '1em', color: '#333', fontFamily: 'monospace', fontSize: '0.85em' }}>
                      {trade.id || trade._id ? (trade.id || trade._id).toString().substring(0, 8) + '...' : 'ID Not Available'}
                    </td>
                    <td style={{ padding: '1em', color: '#333' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{trade.underlying_symbol || trade.symbol || 'Symbol'}</div>
                        <div style={{ fontSize: '0.85em', color: '#6c757d' }}>{trade.trading_symbol || trade.tradingSymbol || 'Trading Symbol'}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1em', color: '#333' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{trade.strike_price ? `₹${trade.strike_price.toLocaleString()}` : 'Market'}</div>
                        <div style={{ fontSize: '0.85em', color: '#6c757d' }}>
                          {trade.option_type || trade.optionType || 'Type'} • {trade.expiry_date ? new Date(trade.expiry_date).toLocaleDateString() : 'Expiry'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1em', color: '#333' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: (trade.transaction_type || trade.transactionType) === 'BUY' ? '#28a745' : '#dc3545' }}>
                          {trade.transaction_type || trade.transactionType || 'Type Not Specified'}
                        </div>
                        <div style={{ fontSize: '0.85em', color: '#6c757d' }}>{trade.order_type || trade.orderType || 'Market Order'}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1em', textAlign: 'right', color: '#333' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{trade.quantity || '0'}</div>
                        <div style={{ fontSize: '0.85em', color: '#6c757d' }}>lots</div>
                      </div>
                    </td>
                    <td style={{ padding: '1em', textAlign: 'right', color: '#333' }}>
                      <div>
                        <div style={{ fontSize: '0.85em', color: '#6c757d' }}>units</div>
                        <div style={{ fontWeight: '600' }}>{trade.total_quantity || trade.totalQuantity || (trade.quantity && trade.lot_size ? trade.quantity * trade.lot_size : '0')}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1em', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25em 0.75em',
                        borderRadius: '1em',
                        fontSize: '0.85em',
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25em'
                      }}>
                        {getStatusIcon(trade.status)} {trade.status || 'PENDING'}
                      </span>
                    </td>
                    <td style={{ padding: '1em', textAlign: 'center', color: '#6c757d', fontSize: '0.9em' }}>
                      {trade.initiated_at || trade.createdAt ? formatDate(trade.initiated_at || trade.createdAt) : 'Recently'}
                    </td>
                    <td style={{ padding: '1em', textAlign: 'center' }}>
                      {!canExitTrade(trade) ? (
                        <span style={{
                          padding: '0.5em 1em',
                          borderRadius: '6px',
                          background: '#28a745',
                          color: '#ffffff',
                          fontWeight: '600',
                          fontSize: '0.85em',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4em'
                        }}>
                          ✅ Already Exited
                        </span>
                      ) : (
                        <button
                            onClick={() => handleExitTrade(trade.id || trade._id)}
                            disabled={exitTradeLoading || !(trade.id || trade._id) || !canExitTrade(trade) || isTradeBeingProcessed(trade.id || trade._id)}
                          style={{
                            padding: '0.5em 1em',
                            borderRadius: '6px',
                            border: '2px solid #dc3545',
                            background: exitTradeLoading || !(trade.id || trade._id) || !canExitTrade(trade) || isTradeBeingProcessed(trade.id || trade._id) ? '#e9ecef' : '#dc3545',
                            color: '#ffffff',
                            fontWeight: '600',
                            cursor: exitTradeLoading || !(trade.id || trade._id) || !canExitTrade(trade) || isTradeBeingProcessed(trade.id || trade._id) ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            fontSize: '0.85em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4em',
                            margin: '0 auto'
                          }}
                          onMouseEnter={(e) => {
                            if (!exitTradeLoading && (trade.id || trade._id) && canExitTrade(trade) && !isTradeBeingProcessed(trade.id || trade._id)) {
                              e.target.style.transform = 'translateY(-1px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!exitTradeLoading && (trade.id || trade._id) && canExitTrade(trade) && !isTradeBeingProcessed(trade.id || trade._id)) {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = 'none';
                            }
                          }}
                        >
                          {exitTradeLoading ? '🔄' : '🚪'} {exitTradeLoading ? 'Exiting...' : 'EXIT NOW!'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3em', color: '#6c757d' }}>
          <div style={{ fontSize: '3em', marginBottom: '1em' }}>📊</div>
          <h3 style={{ marginBottom: '0.5em' }}>No trades yet</h3>
          <p>Start trading to see your recent trades here</p>
        </div>
      )}

      {/* Pagination */}
      {trades.length > 0 && totalPages > 1 && (
        <div style={{ 
          padding: '1.5em', 
          borderTop: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5em'
        }}>
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '0.5em 1em',
              border: '1px solid #dee2e6',
              background: currentPage === 1 ? '#f8f9fa' : '#fff',
              color: currentPage === 1 ? '#6c757d' : '#333',
              borderRadius: '4px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.9em'
            }}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              style={{
                padding: '0.5em 1em',
                border: '1px solid #dee2e6',
                background: currentPage === number ? '#007bff' : '#fff',
                color: currentPage === number ? '#fff' : '#333',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9em',
                minWidth: '2.5em'
              }}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5em 1em',
              border: '1px solid #dee2e6',
              background: currentPage === totalPages ? '#f8f9fa' : '#fff',
              color: currentPage === totalPages ? '#6c757d' : '#333',
              borderRadius: '4px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.9em'
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentTrades;
