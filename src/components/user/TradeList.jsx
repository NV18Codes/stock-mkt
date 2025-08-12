import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';

const TradeList = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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
      const response = await axios.get('https://apistocktrading-production.up.railway.app/api/users/me/broker/trades');
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

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0', padding: 'clamp(1em, 3vw, 1.5em)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1em' }}>
        <h3 style={{ color: '#2c3e50', fontSize: 'clamp(1em, 3vw, 1.2em)', margin: 0 }}>Trade List</h3>
        
        {/* Search and Refresh Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search trades by symbol, type, status, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.5em 0.8em',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              minWidth: '250px',
              transition: 'border-color 0.3s ease'
            }}
          />
          
          {/* Clear Search Button */}
          {searchTerm && (
            <button
              onClick={clearSearch}
              style={{
                padding: '0.5em 0.8em',
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#5a6268'}
              onMouseLeave={(e) => e.target.style.background = '#6c757d'}
            >
              Clear
            </button>
          )}
          
          {/* Refresh Button */}
          <button
            onClick={refreshTrades}
            disabled={refreshing}
            style={{
              padding: '0.5em 0.8em',
              background: refreshing ? '#6c757d' : '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3em'
            }}
            onMouseEnter={(e) => !refreshing && (e.target.style.background = '#0056b3')}
            onMouseLeave={(e) => !refreshing && (e.target.style.background = '#007bff')}
          >
            {refreshing ? '🔄' : '🔄'} {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div style={{ 
          marginBottom: '1em',
          padding: '0.5em',
          background: '#e3f2fd',
          color: '#1976d2',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          Showing {filteredTrades.length} of {trades.length} trades
          {searchTerm && ` matching "${searchTerm}"`}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2em', color: '#666' }}>
          <div style={{ fontSize: '1.2em', marginBottom: '0.5em' }}>🔄</div>
          Loading trades...
        </div>
      ) : error ? (
        <div style={{ color: '#dc3545', textAlign: 'center', padding: '1em' }}>{error}</div>
      ) : filteredTrades.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2em', color: '#666' }}>
          {searchTerm ? 'No trades found matching your search.' : 'No trades found.'}
          {!searchTerm && (
            <div style={{ marginTop: '1em' }}>
              <button 
                onClick={refreshTrades}
                style={{
                  padding: '0.5em 1em',
                  background: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Refresh Trades
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(11px, 2.5vw, 13px)', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e0e0', background: '#f8f9fa' }}>
                <th style={{ padding: '0.8em', textAlign: 'left' }}>Trade ID</th>
                <th style={{ padding: '0.8em', textAlign: 'left' }}>Symbol</th>
                <th style={{ padding: '0.8em', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '0.8em', textAlign: 'left' }}>Qty</th>
                <th style={{ padding: '0.8em', textAlign: 'left' }}>Price</th>
                <th style={{ padding: '0.8em', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '0.8em', textAlign: 'left' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade, idx) => (
                <tr key={trade.id || idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '0.8em' }}>{trade.id || trade.tradeId || '-'}</td>
                  <td style={{ padding: '0.8em' }}>{trade.symbol || trade.tradingSymbol || '-'}</td>
                  <td style={{ padding: '0.8em' }}>{trade.type || trade.orderType || '-'}</td>
                  <td style={{ padding: '0.8em' }}>{trade.quantity || '-'}</td>
                  <td style={{ padding: '0.8em' }}>{trade.price || '-'}</td>
                  <td style={{ padding: '0.8em' }}>
                    <span style={{
                      padding: '0.2em 0.6em',
                      borderRadius: '12px',
                      fontSize: '0.8em',
                      fontWeight: '500',
                      background: trade.status === 'COMPLETED' ? '#d4edda' : 
                                 trade.status === 'PENDING' ? '#fff3cd' : 
                                 trade.status === 'CANCELLED' ? '#f8d7da' : '#e2e3e5',
                      color: trade.status === 'COMPLETED' ? '#155724' : 
                             trade.status === 'PENDING' ? '#856404' : 
                             trade.status === 'CANCELLED' ? '#721c24' : '#6c757d'
                    }}>
                      {trade.status || '-'}
                    </span>
                  </td>
                  <td style={{ padding: '0.8em' }}>
                    {trade.time || trade.timestamp ? new Date(trade.time || trade.timestamp).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TradeList; 