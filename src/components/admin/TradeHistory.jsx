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
      
      // Handle different response formats
      let tradesData = [];
      if (response && response.data) {
        tradesData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        tradesData = response;
      } else if (response && response.trades) {
        tradesData = Array.isArray(response.trades) ? response.trades : [];
      }
      
      setTrades(tradesData);
    } catch (err) {
      console.error('Error fetching trades:', err);
      setError('Failed to fetch trade history');
      // Set fallback data for demo
      setTrades([
        {
          id: '5055badf-53be-45b7-a662-d65b26a8173a',
          quantity: 4,
          status: 'FAILED_ALL_USERS'
        },
        {
          id: '6a7b8c9d-1e2f-3g4h-5i6j-7k8l9m0n1o2p',
          quantity: 4,
          status: 'FAILED_ALL_USERS'
        },
        {
          id: '9o8i7u6y-5t4r-3e2w-1q0p-9o8i7u6y5t4r',
          quantity: 4,
          status: 'FAILED_ALL_USERS'
        },
        {
          id: '1a2s3d4f-5g6h-7j8k-9l0z-1x2c3v4b5n6m',
          quantity: 4,
          status: 'FAILED_ALL_USERS'
        },
        {
          id: '7y8u9i0o-1p2a-3s4d-5f6g-7h8j9k0l1z2x',
          quantity: 4,
          status: 'FAILED_ALL_USERS'
        },
        {
          id: '3c4v5b6n-7m8q-9w0e-1r2t-3y4u5i6o7p8a',
          quantity: 2,
          status: 'COMPLETED_NO_USERS'
        },
        {
          id: '9s0d1f2g-3h4j-5k6l-7z8x-9c0v1b2n3m4q',
          quantity: 4,
          status: 'COMPLETED_NO_USERS'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount) => {
    if (!amount) return '-';
    return `₹${parseFloat(amount).toLocaleString()}`;
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
          <h2 style={{ color: '#333', margin: 0, fontWeight: '600' }}>All Trades</h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Trade ID</th>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>User</th>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Symbol</th>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Type</th>
                <th style={{ padding: '1em', textAlign: 'right', color: '#495057', fontWeight: '600' }}>Quantity</th>
                <th style={{ padding: '1em', textAlign: 'right', color: '#495057', fontWeight: '600' }}>Price</th>
                <th style={{ padding: '1em', textAlign: 'right', color: '#495057', fontWeight: '600' }}>Amount</th>
                <th style={{ padding: '1em', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '1em', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {currentTrades.map((trade, index) => (
                <tr 
                  key={trade.id || trade._id || index} 
                  style={{ 
                    borderBottom: '1px solid #e9ecef',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '1em', color: '#333' }}>
                    {trade.id || trade._id || '-'}
                  </td>
                  <td style={{ padding: '1em', color: '#333' }}>
                    {trade.userName || trade.user?.name || trade.user || '-'}
                  </td>
                  <td style={{ padding: '1em', color: '#333' }}>
                    {trade.symbol || trade.underlying || trade.trading_symbol || '-'}
                  </td>
                  <td style={{ padding: '1em', color: '#333' }}>
                    {trade.type || trade.transaction_type || '-'}
                  </td>
                  <td style={{ padding: '1em', textAlign: 'right', color: '#333' }}>
                    {trade.quantity || trade.qty || '-'}
                  </td>
                  <td style={{ padding: '1em', textAlign: 'right', color: '#333' }}>
                    {formatAmount(trade.price || trade.executionPrice || trade.limit_price)}
                  </td>
                  <td style={{ padding: '1em', textAlign: 'right', color: '#333' }}>
                    {formatAmount(trade.amount || trade.totalAmount)}
                  </td>
                  <td style={{ padding: '1em', textAlign: 'center' }}>
                    <span style={{
                      padding: '0.25em 0.75em',
                      borderRadius: '1em',
                      fontSize: '0.85em',
                      backgroundColor: trade.status === 'COMPLETED' || trade.status === 'COMPLETED_NO_USERS' ? '#d4edda' : 
                                     trade.status === 'PENDING' ? '#fff3cd' : '#f8d7da',
                      color: trade.status === 'COMPLETED' || trade.status === 'COMPLETED_NO_USERS' ? '#155724' : 
                             trade.status === 'PENDING' ? '#856404' : '#721c24'
                    }}>
                      {trade.status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td style={{ padding: '1em', textAlign: 'center', color: '#6c757d', fontSize: '0.9em' }}>
                    {formatDate(trade.createdAt || trade.timestamp || trade.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {trades.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3em', color: '#6c757d' }}>
            No trades found
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