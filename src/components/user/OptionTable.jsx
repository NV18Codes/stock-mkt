import React, { useState, useEffect } from 'react';

const OptionTable = ({ optionChain, loading, error, onOptionSelect, onRefresh, isAdmin = false }) => {
  const [autoRefresh, setAutoRefresh] = useState(!isAdmin); // Disable auto-refresh for admin
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds

  // Auto-refresh functionality - only for non-admin users
  useEffect(() => {
    if (isAdmin || !autoRefresh || !onRefresh) return;

    const interval = setInterval(() => {
      onRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, onRefresh, isAdmin]);

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '1.5em', 
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <div className="loading-spinner" />
        <p style={{ 
          marginTop: '0.5em', 
          color: '#2c3e50', 
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          fontWeight: 500
        }}>
          Loading option chain data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '1.5em', 
        background: '#f8d7da',
        color: '#721c24',
        borderRadius: '8px',
        border: '1px solid #f5c6cb',
        fontSize: 'clamp(12px, 2.5vw, 14px)'
      }}>
        {error}
      </div>
    );
  }

  if (!optionChain || optionChain.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '1.5em', 
        background: '#ffffff',
        color: '#6c757d',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        fontSize: 'clamp(12px, 2.5vw, 14px)'
      }}>
        No option chain data available
      </div>
    );
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleOptionClick = (option, type, strikePrice) => {
    if (onOptionSelect) {
      onOptionSelect({ 
        ...option, 
        optionType: type,
        symbol: option.tradingSymbol,
        strikePrice: strikePrice
      });
    }
  };

  const handleStrikeClick = (row) => {
    // When strike price is clicked, select the CE option by default
    if (row.CE) {
      handleOptionClick(row.CE, 'CE', row.strikePrice);
    } else if (row.PE) {
      handleOptionClick(row.PE, 'PE', row.strikePrice);
    }
  };

  return (
    <div style={{ margin: '0.5em 0' }}>
      {/* Controls - Only show for non-admin users */}
      {!isAdmin && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '0.8em',
          marginBottom: '0.8em',
          padding: '0.8em',
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '0.5em'
          }}>
            <label style={{ 
              color: '#2c3e50', 
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                style={{ 
                  margin: 0,
                  width: '16px',
                  height: '16px'
                }}
              />
              Auto Refresh
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              style={{ 
                background: '#ffffff', 
                color: '#2c3e50', 
                border: '1px solid #007bff', 
                borderRadius: '4px', 
                padding: '0.5em',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                maxWidth: '150px',
                fontWeight: 500
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
              background: '#007bff',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              padding: '0.5em 1em',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              alignSelf: 'flex-start',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#0056b3'}
            onMouseOut={(e) => e.target.style.background = '#007bff'}
          >
            Refresh Now
          </button>
        </div>
      )}

      {/* Scrollable Table Container */}
      <div className="option-table-container" style={{
        maxHeight: '500px',
        overflowY: 'auto',
        overflowX: 'auto',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        background: '#ffffff',
        WebkitOverflowScrolling: 'touch'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          minWidth: '800px', 
          background: '#ffffff',
          fontSize: 'clamp(11px, 2.2vw, 13px)'
        }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
            <tr style={{ borderBottom: '2px solid #007bff', background: '#f8f9fa' }}>
              <th colSpan={3} style={{ 
                padding: 'clamp(0.8em, 2vw, 1em) clamp(0.6em, 1.5vw, 0.8em)', 
                textAlign: 'center', 
                color: '#ffffff', 
                background: '#007bff', 
                fontWeight: 600, 
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                borderRight: '1px solid #e0e0e0'
              }}>
                CALLS (CE)
              </th>
              <th rowSpan={1} style={{ 
                padding: 'clamp(0.8em, 2vw, 1em) clamp(0.6em, 1.5vw, 0.8em)', 
                textAlign: 'center', 
                fontWeight: 600, 
                background: '#ffffff', 
                color: '#2c3e50', 
                borderRight: '2px solid #007bff',
                borderLeft: '2px solid #007bff',
                fontSize: 'clamp(12px, 2.5vw, 14px)'
              }}>
                STRIKE PRICE
              </th>
              <th colSpan={3} style={{ 
                padding: 'clamp(0.8em, 2vw, 1em) clamp(0.6em, 1.5vw, 0.8em)', 
                textAlign: 'center', 
                color: '#ffffff', 
                background: '#dc3545', 
                fontWeight: 600, 
                fontSize: 'clamp(12px, 2.5vw, 14px)'
              }}>
                PUTS (PE)
              </th>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0e0e0', background: '#f8f9fa' }}>
              {/* CE */}
              <th style={{ 
                padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(0.4em, 1.2vw, 0.6em)', 
                textAlign: 'center', 
                fontSize: 'clamp(11px, 2.2vw, 13px)', 
                borderRight: '1px solid #e0e0e0',
                fontWeight: 600,
                color: '#2c3e50',
                background: '#f8f9fa'
              }}>
                LTP
              </th>
              <th style={{ 
                padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(0.4em, 1.2vw, 0.6em)', 
                textAlign: 'center', 
                fontSize: 'clamp(11px, 2.2vw, 13px)', 
                borderRight: '1px solid #e0e0e0',
                fontWeight: 600,
                color: '#2c3e50',
                background: '#f8f9fa'
              }}>
                OI
              </th>
              <th style={{ 
                padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(0.4em, 1.2vw, 0.6em)', 
                textAlign: 'center', 
                fontSize: 'clamp(11px, 2.2vw, 13px)', 
                borderRight: '1px solid #e0e0e0',
                fontWeight: 600,
                color: '#2c3e50',
                background: '#f8f9fa'
              }}>
                TOKEN
              </th>
              {/* Strike */}
              <th style={{ 
                padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(0.4em, 1.2vw, 0.6em)', 
                textAlign: 'center', 
                fontWeight: 600, 
                background: '#ffffff', 
                color: '#2c3e50', 
                borderRight: '2px solid #007bff',
                fontSize: 'clamp(12px, 2.5vw, 14px)'
              }}>
              </th>
              {/* PE */}
              <th style={{ 
                padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(0.4em, 1.2vw, 0.6em)', 
                textAlign: 'center', 
                fontSize: 'clamp(11px, 2.2vw, 13px)', 
                borderRight: '1px solid #e0e0e0',
                fontWeight: 600,
                color: '#2c3e50',
                background: '#f8f9fa'
              }}>
                LTP
              </th>
              <th style={{ 
                padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(0.4em, 1.2vw, 0.6em)', 
                textAlign: 'center', 
                fontSize: 'clamp(11px, 2.2vw, 13px)', 
                borderRight: '1px solid #e0e0e0',
                fontWeight: 600,
                color: '#2c3e50',
                background: '#f8f9fa'
              }}>
                OI
              </th>
              <th style={{ 
                padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(0.4em, 1.2vw, 0.6em)', 
                textAlign: 'center', 
                fontSize: 'clamp(11px, 2.2vw, 13px)', 
                fontWeight: 600,
                color: '#2c3e50',
                background: '#f8f9fa'
              }}>
                TOKEN
              </th>
            </tr>
          </thead>
          <tbody>
            {optionChain.map((row, idx) => (
              <tr key={idx} style={{ 
                borderBottom: '1px solid #e0e0e0', 
                background: idx % 2 === 0 ? '#ffffff' : '#f8f9fa', 
                transition: 'background 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.parentElement.style.background = '#e3f2fd'}
              onMouseLeave={(e) => e.target.parentElement.style.background = idx % 2 === 0 ? '#ffffff' : '#f8f9fa'}>
                {/* Call LTP */}
                <td 
                  style={{ 
                    padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(0.4em, 1.2vw, 0.6em)', 
                    textAlign: 'center', 
                    color: '#007bff', 
                    fontWeight: 500,
                    fontSize: 'clamp(11px, 2.2vw, 13px)',
                    borderRight: '1px solid #e0e0e0',
                    background: row.CE ? 'rgba(0, 123, 255, 0.05)' : 'transparent'
                  }}
                  onClick={() => row.CE && handleOptionClick(row.CE, 'CE', row.strikePrice)}
                >
                  {row.CE ? (row.CE.ltp || row.CE.lastPrice || '0.00') : '-'}
                </td>
                {/* Call OI */}
                <td 
                  style={{ 
                    padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(0.4em, 1.2vw, 0.6em)', 
                    textAlign: 'center', 
                    color: '#007bff',
                    fontSize: 'clamp(11px, 2.2vw, 13px)',
                    borderRight: '1px solid #e0e0e0',
                    background: row.CE ? 'rgba(0, 123, 255, 0.05)' : 'transparent'
                  }}
                  onClick={() => row.CE && handleOptionClick(row.CE, 'CE', row.strikePrice)}
                >
                  {row.CE ? (row.CE.oi || row.CE.openInterest || '0') : '-'}
                </td>
                {/* Call Token */}
                <td 
                  style={{ 
                    padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(0.4em, 1.2vw, 0.6em)', 
                    textAlign: 'center', 
                    color: '#007bff',
                    fontSize: 'clamp(11px, 2.2vw, 13px)',
                    borderRight: '1px solid #e0e0e0',
                    background: row.CE ? 'rgba(0, 123, 255, 0.05)' : 'transparent'
                  }}
                  onClick={() => row.CE && handleOptionClick(row.CE, 'CE', row.strikePrice)}
                >
                  {row.CE ? row.CE.token : '-'}
                </td>
                {/* Strike Price - Clickable */}
                <td 
                  style={{ 
                    padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(0.4em, 1.2vw, 0.6em)', 
                    textAlign: 'center', 
                    fontWeight: 600, 
                    background: '#ffffff', 
                    color: '#2c3e50', 
                    borderRight: '2px solid #007bff',
                    borderLeft: '2px solid #007bff',
                    fontSize: 'clamp(12px, 2.5vw, 14px)',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => handleStrikeClick(row)}
                  onMouseEnter={(e) => e.target.style.background = '#e3f2fd'}
                  onMouseLeave={(e) => e.target.style.background = '#ffffff'}
                >
                  {row.strikePrice || '-'}
                </td>
                {/* Put LTP */}
                <td 
                  style={{ 
                    padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(0.4em, 1.2vw, 0.6em)', 
                    textAlign: 'center', 
                    color: '#dc3545', 
                    fontWeight: 500,
                    fontSize: 'clamp(11px, 2.2vw, 13px)',
                    borderRight: '1px solid #e0e0e0',
                    background: row.PE ? 'rgba(220, 53, 69, 0.05)' : 'transparent'
                  }}
                  onClick={() => row.PE && handleOptionClick(row.PE, 'PE', row.strikePrice)}
                >
                  {row.PE ? (row.PE.ltp || row.PE.lastPrice || '0.00') : '-'}
                </td>
                {/* Put OI */}
                <td 
                  style={{ 
                    padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(0.4em, 1.2vw, 0.6em)', 
                    textAlign: 'center', 
                    color: '#dc3545',
                    fontSize: 'clamp(11px, 2.2vw, 13px)',
                    borderRight: '1px solid #e0e0e0',
                    background: row.PE ? 'rgba(220, 53, 69, 0.05)' : 'transparent'
                  }}
                  onClick={() => row.PE && handleOptionClick(row.PE, 'PE', row.strikePrice)}
                >
                  {row.PE ? (row.PE.oi || row.PE.openInterest || '0') : '-'}
                </td>
                {/* Put Token */}
                <td 
                  style={{ 
                    padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(0.4em, 1.2vw, 0.6em)', 
                    textAlign: 'center', 
                    color: '#dc3545',
                    fontSize: 'clamp(11px, 2.2vw, 13px)',
                    background: row.PE ? 'rgba(220, 53, 69, 0.05)' : 'transparent'
                  }}
                  onClick={() => row.PE && handleOptionClick(row.PE, 'PE', row.strikePrice)}
                >
                  {row.PE ? row.PE.token : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Info */}
      <div style={{ 
        marginTop: '0.8em', 
        padding: '0.6em', 
        background: '#f8f9fa', 
        borderRadius: 6, 
        border: '1px solid #e9ecef',
        fontSize: 'clamp(10px, 2.2vw, 12px)',
        color: '#6c757d'
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '0.5em'
        }}>
          <span>Total Strikes: {optionChain.length}</span>
          <span>Click on any option or strike price to select for trading</span>
          <span>CE: Call Options | PE: Put Options | LTP: Last Traded Price | OI: Open Interest</span>
        </div>
      </div>
    </div>
  );
};

export default OptionTable; 