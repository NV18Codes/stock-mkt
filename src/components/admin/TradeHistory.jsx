import React, { useState, useEffect } from 'react';
import { getAdminTrades } from '../../api/admin';

const TradeHistory = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [tradesPerPage] = useState(10);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminTrades();
      console.log('Trade history response:', response);
      
      // Handle the specific response structure from the backend
      let tradesData = [];
      if (response && response.success && response.data && Array.isArray(response.data)) {
        tradesData = response.data;
      } else if (response && response.data && Array.isArray(response.data)) {
        tradesData = response.data;
      } else if (Array.isArray(response)) {
        tradesData = response;
      }
      
      setTrades(tradesData);
    } catch (err) {
      console.error('Error fetching trades:', err);
      setError('Failed to fetch trade history');
      // Set fallback data for demo
      setTrades([
        {
          id: '5055badf-53be-45b7-a662-d65b26a8173a',
          trading_symbol: 'NIFTY07AUG2522950CE',
          underlying_symbol: 'NIFTY',
          strike_price: 22950,
          option_type: 'CE',
          expiry_date: '2025-08-07',
          transaction_type: 'BUY',
          order_type: 'MARKET',
          quantity: 4,
          lot_size: 75,
          total_quantity: 300,
          limit_price: null,
          target_segment_ids: ['8c01b6a0-a500-444d-a5bc-9deed5a77a50'],
          target_all_active_users: false,
          status: 'FAILED_ALL_USERS',
          initiated_at: '2025-07-31T16:11:19.743+00:00',
          last_processed_at: '2025-07-31T16:11:21.217+00:00',
          remarks: 'Nifty looking bullish, entering market order.',
          user_trades_count: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    if (!amount) return '-';
    return `₹${parseFloat(amount).toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'COMPLETED_NO_USERS':
        return { bg: '#d4edda', color: '#155724', border: '#c3e6cb' };
      case 'QUEUED':
      case 'PENDING':
        return { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' };
      case 'FAILED_ALL_USERS':
      case 'FAILED':
        return { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' };
      case 'PROCESSING':
        return { bg: '#cce5ff', color: '#004085', border: '#b8daff' };
      default:
        return { bg: '#e2e3e5', color: '#383d41', border: '#d6d8db' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'COMPLETED_NO_USERS':
        return '✅';
      case 'QUEUED':
      case 'PENDING':
        return '⏳';
      case 'FAILED_ALL_USERS':
      case 'FAILED':
        return '❌';
      case 'PROCESSING':
        return '🔄';
      default:
        return '❓';
    }
  };

  // Get current trades for pagination
  const indexOfLastTrade = currentPage * tradesPerPage;
  const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
  const currentTrades = trades.slice(indexOfFirstTrade, indexOfLastTrade);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(trades.length / tradesPerPage);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2em' }}>
        <div className="loading-spinner" />
        <p style={{ color: '#333', marginTop: '1em' }}>Loading trade history...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2em', background: '#ffffff', minHeight: '100vh' }}>
      <h1 style={{ color: '#333', marginBottom: '1.5em', textAlign: 'center', fontWeight: '600' }}>
        Trade History
      </h1>

      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '1em', 
          borderRadius: '8px', 
          marginBottom: '1em' 
        }}>
          {error}
        </div>
      )}

      <div style={{ 
        background: '#fff', 
        borderRadius: '12px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
        overflow: 'hidden' 
      }}>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1.5em', 
          borderBottom: '1px solid #e9ecef' 
        }}>
          <h2 style={{ color: '#333', margin: 0, fontWeight: '600' }}>All Trades ({trades.length})</h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Trade ID</th>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Symbol</th>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Strike/Type</th>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Transaction</th>
                <th style={{ padding: '1em', textAlign: 'right', color: '#495057', fontWeight: '600' }}>Quantity</th>
                <th style={{ padding: '1em', textAlign: 'right', color: '#495057', fontWeight: '600' }}>Total Qty</th>
                <th style={{ padding: '1em', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Target</th>
                <th style={{ padding: '1em', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '1em', textAlign: 'center', color: '#495057', fontWeight: '600' }}>User Trades</th>
                <th style={{ padding: '1em', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Initiated</th>
              </tr>
            </thead>
            <tbody>
              {currentTrades.map((trade, index) => {
                const statusStyle = getStatusColor(trade.status);
                return (
                  <tr 
                    key={trade.id || index} 
                    style={{ 
                      borderBottom: '1px solid #e9ecef',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '1em', color: '#333', fontFamily: 'monospace', fontSize: '0.85em' }}>
                      {trade.id ? trade.id.substring(0, 8) + '...' : '-'}
                    </td>
                    <td style={{ padding: '1em', color: '#333' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{trade.underlying_symbol || '-'}</div>
                        <div style={{ fontSize: '0.85em', color: '#6c757d' }}>{trade.trading_symbol || '-'}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1em', color: '#333' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{trade.strike_price ? `₹${trade.strike_price.toLocaleString()}` : '-'}</div>
                        <div style={{ fontSize: '0.85em', color: '#6c757d' }}>
                          {trade.option_type || '-'} • {trade.expiry_date ? new Date(trade.expiry_date).toLocaleDateString() : '-'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1em', color: '#333' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: trade.transaction_type === 'BUY' ? '#28a745' : '#dc3545' }}>
                          {trade.transaction_type || '-'}
                        </div>
                        <div style={{ fontSize: '0.85em', color: '#6c757d' }}>{trade.order_type || '-'}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1em', textAlign: 'right', color: '#333' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{trade.quantity || '-'}</div>
                        <div style={{ fontSize: '0.85em', color: '#6c757d' }}>lots</div>
                      </div>
                    </td>
                    <td style={{ padding: '1em', textAlign: 'right', color: '#333' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{trade.total_quantity || '-'}</div>
                        <div style={{ fontSize: '0.85em', color: '#6c757d' }}>units</div>
                      </div>
                    </td>
                    <td style={{ padding: '1em', textAlign: 'center', color: '#333' }}>
                      <div style={{ fontSize: '0.85em' }}>
                        {trade.target_all_active_users ? (
                          <span style={{ color: '#007bff', fontWeight: '600' }}>All Active</span>
                        ) : trade.target_segment_ids && trade.target_segment_ids.length > 0 ? (
                          <span style={{ color: '#6f42c1', fontWeight: '600' }}>
                            {trade.target_segment_ids.length} Segment{trade.target_segment_ids.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span style={{ color: '#6c757d' }}>-</span>
                        )}
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
                        {getStatusIcon(trade.status)} {trade.status || 'UNKNOWN'}
                      </span>
                    </td>
                    <td style={{ padding: '1em', textAlign: 'center', color: '#333' }}>
                      <span style={{
                        padding: '0.25em 0.5em',
                        borderRadius: '0.5em',
                        fontSize: '0.85em',
                        backgroundColor: trade.user_trades_count > 0 ? '#d4edda' : '#e2e3e5',
                        color: trade.user_trades_count > 0 ? '#155724' : '#6c757d',
                        fontWeight: '600'
                      }}>
                        {trade.user_trades_count || 0}
                      </span>
                    </td>
                    <td style={{ padding: '1em', textAlign: 'center', color: '#6c757d', fontSize: '0.9em' }}>
                      {formatDate(trade.initiated_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {trades.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3em', color: '#6c757d' }}>
            <div style={{ fontSize: '3em', marginBottom: '1em' }}>📊</div>
            <h3 style={{ marginBottom: '0.5em' }}>No trades found</h3>
            <p>No trade history available at the moment.</p>
          </div>
        )}

        {/* Pagination */}
        {trades.length > 0 && (
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
    </div>
  );
};

export default TradeHistory; 