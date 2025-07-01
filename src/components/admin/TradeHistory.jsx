import React, { useState, useEffect } from 'react';
import { getAdminTrades, getAdminTradeById } from '../../api/admin';

const TradeHistory = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getAdminTrades();
      const tradesData = response.data || response || [];
      setTrades(Array.isArray(tradesData) ? tradesData : []);
    } catch (err) {
      console.error('Error fetching trades:', err);
      setError('Failed to fetch trade history');
    } finally {
      setLoading(false);
    }
  };

  const handleTradeClick = async (tradeId) => {
    try {
      const response = await getAdminTradeById(tradeId);
      setSelectedTrade(response.data || response);
      setShowDetails(true);
    } catch (err) {
      console.error('Error fetching trade details:', err);
      setError('Failed to fetch trade details');
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2em' }}>
        <div className="loading-spinner" />
        <p style={{ color: '#fff', marginTop: '1em' }}>Loading trade history...</p>
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
              {trades.map((trade, index) => (
                <tr 
                  key={trade.id || trade._id || index} 
                  style={{ 
                    borderBottom: '1px solid #e9ecef',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    ':hover': { background: '#f8f9fa' }
                  }}
                  onClick={() => handleTradeClick(trade.id || trade._id)}
                >
                  <td style={{ padding: '1em', color: '#333' }}>
                    {trade.id || trade._id || '-'}
                  </td>
                  <td style={{ padding: '1em', color: '#333' }}>
                    {trade.userName || trade.user?.name || '-'}
                  </td>
                  <td style={{ padding: '1em', color: '#333' }}>
                    {trade.symbol || trade.underlying || '-'}
                  </td>
                  <td style={{ padding: '1em', color: '#333' }}>
                    {trade.type || '-'}
                  </td>
                  <td style={{ padding: '1em', textAlign: 'right', color: '#333' }}>
                    {trade.quantity || trade.qty || '-'}
                  </td>
                  <td style={{ padding: '1em', textAlign: 'right', color: '#333' }}>
                    {formatAmount(trade.price || trade.executionPrice)}
                  </td>
                  <td style={{ padding: '1em', textAlign: 'right', color: '#333' }}>
                    {formatAmount(trade.amount || trade.totalAmount)}
                  </td>
                  <td style={{ padding: '1em', textAlign: 'center' }}>
                    <span style={{
                      padding: '0.25em 0.75em',
                      borderRadius: '1em',
                      fontSize: '0.85em',
                      backgroundColor: trade.status === 'COMPLETED' ? '#d4edda' : 
                                     trade.status === 'PENDING' ? '#fff3cd' : '#f8d7da',
                      color: trade.status === 'COMPLETED' ? '#155724' : 
                             trade.status === 'PENDING' ? '#856404' : '#721c24'
                    }}>
                      {trade.status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td style={{ padding: '1em', textAlign: 'center', color: '#6c757d', fontSize: '0.9em' }}>
                    {formatDate(trade.createdAt || trade.timestamp)}
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
      </div>

      {/* Trade Details Modal */}
      {showDetails && selectedTrade && (
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
            borderRadius: '12px', 
            padding: '2em', 
            maxWidth: '600px', 
            width: '90%', 
            maxHeight: '80vh', 
            overflow: 'auto' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5em' }}>
              <h2 style={{ color: '#333', margin: 0, fontWeight: '600' }}>Trade Details</h2>
              <button 
                onClick={() => setShowDetails(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '1.5em', 
                  cursor: 'pointer', 
                  color: '#6c757d' 
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ lineHeight: '1.8', color: '#333' }}>
              <div style={{ marginBottom: '1.5em' }}>
                <div><strong>Trade ID:</strong> {selectedTrade.id || selectedTrade._id || '-'}</div>
                <div><strong>User:</strong> {selectedTrade.userName || selectedTrade.user?.name || '-'}</div>
                <div><strong>Symbol:</strong> {selectedTrade.symbol || selectedTrade.underlying || '-'}</div>
                <div><strong>Type:</strong> {selectedTrade.type || '-'}</div>
                <div><strong>Quantity:</strong> {selectedTrade.quantity || selectedTrade.qty || '-'}</div>
                <div><strong>Price:</strong> {formatAmount(selectedTrade.price || selectedTrade.executionPrice)}</div>
                <div><strong>Amount:</strong> {formatAmount(selectedTrade.amount || selectedTrade.totalAmount)}</div>
                <div><strong>Status:</strong> {selectedTrade.status || '-'}</div>
                <div><strong>Created:</strong> {formatDate(selectedTrade.createdAt || selectedTrade.timestamp)}</div>
                <div><strong>Updated:</strong> {formatDate(selectedTrade.updatedAt || selectedTrade.modifiedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeHistory; 