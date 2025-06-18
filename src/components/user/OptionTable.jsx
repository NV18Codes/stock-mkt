import React from 'react';

const OptionTable = ({ optionChain, loading, error, onOptionSelect }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2em', color: '#007bff' }}>
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

  const handleOptionClick = (option) => {
    if (option && onOptionSelect) {
      onOptionSelect(option);
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', color: '#fff', borderCollapse: 'collapse', minWidth: 800 }}>
        <thead>
          <tr style={{ borderBottom: '1.5px solid #007bff', background: '#181c24' }}>
            <th style={{ padding: '0.5em' }}>Strike</th>
            <th style={{ padding: '0.5em' }}>CE LTP</th>
            <th style={{ padding: '0.5em' }}>CE Chg%</th>
            <th style={{ padding: '0.5em' }}>CE Vol</th>
            <th style={{ padding: '0.5em' }}>CE OI</th>
            <th style={{ padding: '0.5em' }}>PE LTP</th>
            <th style={{ padding: '0.5em' }}>PE Chg%</th>
            <th style={{ padding: '0.5em' }}>PE Vol</th>
            <th style={{ padding: '0.5em' }}>PE OI</th>
          </tr>
        </thead>
        <tbody>
          {optionChain.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #222', background: idx % 2 === 0 ? '#111a2f' : '#181c24' }}>
              <td style={{ padding: '0.5em', textAlign: 'center', fontWeight: 'bold' }}>{row.strikePrice}</td>
              
              {/* CE (Call) Options */}
              <td 
                style={{ 
                  padding: '0.5em', 
                  color: '#43e97b', 
                  cursor: row.CE ? 'pointer' : 'default',
                  background: row.CE ? 'rgba(67, 233, 123, 0.1)' : 'transparent'
                }}
                onClick={() => handleOptionClick(row.CE)}
              >
                {row.CE?.lastPrice || '-'}
              </td>
              <td style={{ 
                padding: '0.5em',
                color: row.CE?.change >= 0 ? '#43e97b' : '#ff4b2b'
              }}>
                {row.CE?.change ? `${row.CE.change.toFixed(2)}%` : '-'}
              </td>
              <td style={{ padding: '0.5em' }}>{row.CE?.volume || '-'}</td>
              <td style={{ padding: '0.5em' }}>{row.CE?.openInterest || '-'}</td>
              
              {/* PE (Put) Options */}
              <td 
                style={{ 
                  padding: '0.5em', 
                  color: '#ff4b2b',
                  cursor: row.PE ? 'pointer' : 'default',
                  background: row.PE ? 'rgba(255, 75, 43, 0.1)' : 'transparent'
                }}
                onClick={() => handleOptionClick(row.PE)}
              >
                {row.PE?.lastPrice || '-'}
              </td>
              <td style={{ 
                padding: '0.5em',
                color: row.PE?.change >= 0 ? '#43e97b' : '#ff4b2b'
              }}>
                {row.PE?.change ? `${row.PE.change.toFixed(2)}%` : '-'}
              </td>
              <td style={{ padding: '0.5em' }}>{row.PE?.volume || '-'}</td>
              <td style={{ padding: '0.5em' }}>{row.PE?.openInterest || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OptionTable; 