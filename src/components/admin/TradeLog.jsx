import React, { useState, useEffect } from 'react';
import { getTradeLogs } from '../../api/admin';

const TradeLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    fetchTradeLogs();
  }, []);

  const fetchTradeLogs = async () => {
    setLoading(true);
    setError('');
    setInfoMessage('');
    try {
      const response = await getTradeLogs();
      console.log('Trade logs response:', response);
      
      let logsData;
      if (response && response.success && response.data) {
        logsData = response.data;
      } else if (Array.isArray(response)) {
        logsData = response;
      } else if (response && response.logs) {
        logsData = response.logs;
      } else {
        logsData = [];
      }
      
      setLogs(Array.isArray(logsData) ? logsData : []);
      
      // Show info message if using fallback
      if (response && response.message) {
        setInfoMessage(response.message);
      }
    } catch (err) {
      console.error('Error fetching trade logs:', err);
      setError('Failed to fetch trade logs. Please try again later.');
      setLogs([]);
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2em' }}>
        <div className="loading-spinner" />
        <p style={{ color: '#333', marginTop: '1em' }}>Loading trade logs...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2em', background: '#ffffff', minHeight: '100vh' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '1.5em', textAlign: 'center', fontWeight: 600, fontSize: '2.5em' }}>
        Trade Logs
      </h1>

      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '1em', 
          borderRadius: '8px', 
          marginBottom: '1em',
          border: '1px solid #f5c6cb'
        }}>
          {error}
        </div>
      )}

      {infoMessage && (
        <div style={{ 
          background: '#e2f0d9', 
          color: '#155724', 
          padding: '1em', 
          borderRadius: '8px', 
          marginBottom: '1em',
          border: '1px solid #d4edda'
        }}>
          {infoMessage}
        </div>
      )}

      <div style={{ 
        background: '#fff', 
        borderRadius: '12px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
        overflow: 'hidden',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1.5em', 
          borderBottom: '1px solid #e9ecef' 
        }}>
          <h2 style={{ color: '#2c3e50', margin: 0, fontWeight: 600 }}>All Trade Logs</h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Log ID</th>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>User</th>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Action</th>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Symbol</th>
                <th style={{ padding: '1em', textAlign: 'right', color: '#495057', fontWeight: '600' }}>Quantity</th>
                <th style={{ padding: '1em', textAlign: 'right', color: '#495057', fontWeight: '600' }}>Price</th>
                <th style={{ padding: '1em', textAlign: 'right', color: '#495057', fontWeight: '600' }}>Amount</th>
                <th style={{ padding: '1em', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '1em', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '3em', textAlign: 'center', color: '#6c757d' }}>
                    No trade logs found
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={log.id || log._id || index} style={{ 
                    borderBottom: '1px solid #e9ecef',
                    background: index % 2 === 0 ? '#fff' : '#f8f9fa'
                  }}>
                    <td style={{ padding: '1em', color: '#333', fontFamily: 'monospace' }}>
                      {log.id || log._id || log.logId || '-'}
                    </td>
                    <td style={{ padding: '1em', color: '#333' }}>
                      {log.userName || log.user?.name || log.userId || '-'}
                    </td>
                    <td style={{ padding: '1em' }}>
                      <span style={{
                        padding: '0.25em 0.75em',
                        borderRadius: '1em',
                        fontSize: '0.85em',
                        fontWeight: 600,
                        backgroundColor: log.action === 'BUY' ? '#d4edda' : 
                                       log.action === 'SELL' ? '#f8d7da' : '#fff3cd',
                        color: log.action === 'BUY' ? '#155724' : 
                               log.action === 'SELL' ? '#721c24' : '#856404'
                      }}>
                        {log.action || log.type || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '1em', color: '#333', fontWeight: 500 }}>
                      {log.symbol || log.underlying || '-'}
                    </td>
                    <td style={{ padding: '1em', textAlign: 'right', color: '#333' }}>
                      {log.quantity || log.qty || '-'}
                    </td>
                    <td style={{ padding: '1em', textAlign: 'right', color: '#333' }}>
                      {formatAmount(log.price || log.executionPrice)}
                    </td>
                    <td style={{ padding: '1em', textAlign: 'right', color: '#333', fontWeight: 500 }}>
                      {formatAmount(log.amount || log.totalAmount)}
                    </td>
                    <td style={{ padding: '1em', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25em 0.75em',
                        borderRadius: '1em',
                        fontSize: '0.85em',
                        fontWeight: 600,
                        backgroundColor: log.status === 'SUCCESS' ? '#d4edda' : 
                                       log.status === 'FAILED' ? '#f8d7da' : '#fff3cd',
                        color: log.status === 'SUCCESS' ? '#155724' : 
                               log.status === 'FAILED' ? '#721c24' : '#856404'
                      }}>
                        {log.status || 'PENDING'}
                      </span>
                    </td>
                    <td style={{ padding: '1em', textAlign: 'center', color: '#6c757d', fontSize: '0.9em' }}>
                      {formatDate(log.timestamp || log.createdAt || log.date)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ 
        marginTop: '2em', 
        textAlign: 'center',
        padding: '1em',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <p style={{ color: '#6c757d', margin: 0 }}>
          Trade logs provide detailed information about all trading activities and system events.
        </p>
      </div>
    </div>
  );
};

export default TradeLog; 