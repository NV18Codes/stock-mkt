import React from 'react';

const OptionTable = ({ optionChain, loading, error }) => {
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

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', color: '#fff', borderCollapse: 'collapse', minWidth: 800 }}>
        <thead>
          <tr style={{ borderBottom: '1.5px solid #007bff', background: '#181c24' }}>
            <th style={{ padding: '0.5em' }}>Strike</th>
            <th style={{ padding: '0.5em' }}>CE Symbol</th>
            <th style={{ padding: '0.5em' }}>CE Token</th>
            <th style={{ padding: '0.5em' }}>PE Symbol</th>
            <th style={{ padding: '0.5em' }}>PE Token</th>
          </tr>
        </thead>
        <tbody>
          {optionChain.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #222', background: idx % 2 === 0 ? '#111a2f' : '#181c24' }}>
              <td style={{ padding: '0.5em' }}>{row.strikePrice}</td>
              <td style={{ padding: '0.5em', color: '#43e97b', fontWeight: 600 }}>{row.CE?.tradingSymbol || '-'}</td>
              <td style={{ padding: '0.5em' }}>{row.CE?.token || '-'}</td>
              <td style={{ padding: '0.5em', color: '#ff4b2b', fontWeight: 600 }}>{row.PE?.tradingSymbol || '-'}</td>
              <td style={{ padding: '0.5em' }}>{row.PE?.token || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OptionTable; 