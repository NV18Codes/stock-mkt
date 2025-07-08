import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TradeList = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrades = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://apistocktrading-production.up.railway.app/api/users/me/broker/trades');
        if (response.data && response.data.success) {
          setTrades(response.data.trades || []);
        } else {
          setTrades([]);
        }
      } catch (error) {
        console.error('Error fetching trades:', error);
        setTrades([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrades();
  }, []);

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0', padding: 'clamp(1em, 3vw, 1.5em)' }}>
      <h3 style={{ color: '#2c3e50', marginBottom: '1em', fontSize: 'clamp(1em, 3vw, 1.2em)' }}>Trade List</h3>
      {loading ? (
        <div>Loading trades...</div>
      ) : error ? (
        <div style={{ color: '#dc3545' }}>{error}</div>
      ) : trades.length === 0 ? (
        <div>No trades found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(11px, 2.5vw, 13px)', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e0e0', background: '#f8f9fa' }}>
                <th>Trade ID</th>
                <th>Symbol</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade, idx) => (
                <tr key={trade.id || idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td>{trade.id || trade.tradeId || '-'}</td>
                  <td>{trade.symbol || trade.tradingSymbol || '-'}</td>
                  <td>{trade.type || trade.orderType || '-'}</td>
                  <td>{trade.quantity || '-'}</td>
                  <td>{trade.price || '-'}</td>
                  <td>{trade.status || '-'}</td>
                  <td>{trade.time || trade.timestamp ? new Date(trade.time || trade.timestamp).toLocaleString() : '-'}</td>
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