import React, { useState, useEffect } from 'react';

const colStyle = { padding: '1em 0.8em', textAlign: 'center', fontSize: 14, borderRight: '1px solid #232a3a' };
const colStyleCenter = { ...colStyle, textAlign: 'center', fontWeight: 700, background: '#232a3a', color: '#43e97b', borderRight: '2px solid #43e97b' };

const getColor = (val) => {
  if (val === null || val === undefined || val === '-') return '#fff';
  const numVal = parseFloat(val);
  return numVal > 0 ? '#43e97b' : numVal < 0 ? '#ff4b2b' : '#fff';
};

const OptionTable = ({ optionChain, loading, error, onOptionSelect, onRefresh }) => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !onRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, onRefresh]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2em', color: '#43e97b' }}>
        Loading option chain data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2em', color: '#ff4b2b' }}>
        {error}
      </div>
    );
  }

  if (!optionChain || optionChain.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2em', color: '#fff' }}>
        No option chain data available
      </div>
    );
  }

  // Helper function to get value with fallbacks for different property names
  const getValue = (obj, ...possibleKeys) => {
    if (!obj) return '-';
    
    // Debug: log all properties of the object
    console.log('Object properties:', Object.keys(obj));
    console.log('Object values:', obj);
    
    for (const key of possibleKeys) {
      if (obj[key] !== undefined && obj[key] !== null) {
        console.log(`Found value for key "${key}":`, obj[key]);
        return obj[key];
      }
    }
    console.log('No matching keys found for:', possibleKeys);
    return '-';
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div style={{ margin: '1em 0' }}>
      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1em',
        padding: '0.5em 1em',
        background: 'rgba(24,28,36,0.8)',
        borderRadius: 8,
        border: '1px solid #232a3a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
          <label style={{ color: '#fff', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ marginRight: '0.5em' }}
            />
            Auto Refresh
          </label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            style={{ 
              background: '#181c24', 
              color: '#fff', 
              border: '1px solid #43e97b', 
              borderRadius: 4, 
              padding: '0.3em 0.5em',
              fontSize: 12
            }}
          >
            <option value={3000}>3 seconds</option>
            <option value={5000}>5 seconds</option>
            <option value={10000}>10 seconds</option>
            <option value={30000}>30 seconds</option>
          </select>
        </div>
        <button
          onClick={handleRefresh}
          style={{
            background: '#43e97b',
            color: '#000',
            border: 'none',
            borderRadius: 4,
            padding: '0.5em 1em',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 12
          }}
        >
          Refresh Now
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 10, boxShadow: '0 2px 16px 0 rgba(0,0,0,0.10)' }}>
        <table style={{ width: '100%', color: '#fff', borderCollapse: 'collapse', minWidth: 800, background: 'rgba(24,28,36,0.97)' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
            <tr style={{ borderBottom: '2px solid #43e97b', background: '#181c24' }}>
              <th colSpan={2} style={{ ...colStyle, color: '#43e97b', background: '#181c24', fontWeight: 700, fontSize: 16 }}>CALLS (CE)</th>
              <th rowSpan={1} style={colStyleCenter}>STRIKE PRICE</th>
              <th colSpan={2} style={{ ...colStyle, color: '#ff4b2b', background: '#181c24', fontWeight: 700, fontSize: 16 }}>PUTS (PE)</th>
            </tr>
            <tr style={{ borderBottom: '1.5px solid #232a3a', background: '#232a3a' }}>
              {/* CE */}
              <th style={{ ...colStyle, minWidth: 120 }}>PRICE</th>
              <th style={{ ...colStyle, minWidth: 100 }}>OI</th>
              {/* Strike */}
              <th style={{ ...colStyleCenter, minWidth: 120 }}></th>
              {/* PE */}
              <th style={{ ...colStyle, minWidth: 120 }}>PRICE</th>
              <th style={{ ...colStyle, minWidth: 100 }}>OI</th>
            </tr>
          </thead>
          <tbody>
            {optionChain.map((row, idx) => (
              <tr key={idx} style={{ 
                borderBottom: '1px solid #232a3a', 
                background: idx % 2 === 0 ? '#181c24' : '#232a3a', 
                transition: 'background 0.2s',
                cursor: 'pointer'
              }}
              onClick={() => {
                if (row.CE && onOptionSelect) onOptionSelect(row.CE);
                if (row.PE && onOptionSelect) onOptionSelect(row.PE);
              }}>
                {/* Call Price */}
                <td style={{ 
                  ...colStyle, 
                  color: '#43e97b', 
                  fontWeight: 600,
                  fontSize: 16,
                  background: row.CE ? 'rgba(67, 233, 123, 0.1)' : 'transparent'
                }}>
                  {getValue(row.CE, 'lastPrice', 'ltp', 'last_price', 'price')}
                </td>
                {/* Call OI */}
                <td style={{ 
                  ...colStyle, 
                  color: '#43e97b',
                  fontSize: 14,
                  background: row.CE ? 'rgba(67, 233, 123, 0.05)' : 'transparent'
                }}>
                  {getValue(row.CE, 'openInterest', 'oi', 'open_interest')}
                </td>
                {/* Strike Price */}
                <td style={colStyleCenter}>{row.strikePrice}</td>
                {/* Put Price */}
                <td style={{ 
                  ...colStyle, 
                  color: '#ff4b2b', 
                  fontWeight: 600,
                  fontSize: 16,
                  background: row.PE ? 'rgba(255, 75, 43, 0.1)' : 'transparent'
                }}>
                  {getValue(row.PE, 'lastPrice', 'ltp', 'last_price', 'price')}
                </td>
                {/* Put OI */}
                <td style={{ 
                  ...colStyle, 
                  color: '#ff4b2b',
                  fontSize: 14,
                  background: row.PE ? 'rgba(255, 75, 43, 0.05)' : 'transparent'
                }}>
                  {getValue(row.PE, 'openInterest', 'oi', 'open_interest')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OptionTable; 