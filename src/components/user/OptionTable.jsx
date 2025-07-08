import React, { useState, useEffect } from 'react';

const OptionTable = ({ optionChain, loading, error, onOptionSelect, onRefresh, isAdmin = false }) => {
  // Remove all auto-refresh logic and controls for admin
  // Only show the real-time indicator if the parent passes a prop (not used now)
  // Ensure OI (Open Interest) and LTP are always shown from the latest merged optionChain data
  // Remove the real-time indicator for admin if not needed

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 'clamp(1em, 2.5vw, 1.5em)', 
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
        padding: 'clamp(1em, 2.5vw, 1.5em)', 
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
        padding: 'clamp(1em, 2.5vw, 1.5em)', 
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

  const formatINR = (value) => {
    if (value === undefined || value === null || value === '' || isNaN(value) || Number(value) === 0) return 'No Data';
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 2 
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value || isNaN(value)) return '0';
    return new Intl.NumberFormat('en-IN').format(value);
  };

  return (
    <div style={{ margin: 'clamp(0.3em, 1.5vw, 0.5em) 0' }}>
      {/* Scrollable Table Container */}
      <div className="option-table-container" style={{
        maxHeight: 'clamp(400px, 60vh, 500px)',
        overflowY: 'auto',
        overflowX: 'auto',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        background: '#ffffff',
        WebkitOverflowScrolling: 'touch',
        position: 'relative'
      }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          minWidth: 'clamp(600px, 90vw, 1000px)', 
          background: '#ffffff',
          fontSize: 'clamp(10px, 2vw, 13px)'
        }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
            <tr style={{ borderBottom: '2px solid #007bff', background: '#f8f9fa' }}>
              <th colSpan={2} style={{ 
                padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(0.4em, 1vw, 0.6em)', 
                textAlign: 'center', 
                color: '#ffffff', 
                background: '#007bff', 
                fontWeight: 600, 
                fontSize: 'clamp(11px, 2.2vw, 13px)',
                borderRight: '1px solid #e0e0e0'
              }}>
                CALLS (CE)
              </th>
              <th rowSpan={1} style={{ 
                padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(0.4em, 1vw, 0.6em)', 
                textAlign: 'center', 
                fontWeight: 600, 
                background: '#ffffff', 
                color: '#2c3e50', 
                borderRight: '2px solid #007bff',
                borderLeft: '2px solid #007bff',
                fontSize: 'clamp(11px, 2.2vw, 13px)',
                cursor: 'pointer'
              }}
              onClick={() => handleStrikeClick(optionChain[0])}
              >
                STRIKE PRICE
              </th>
              <th colSpan={2} style={{ 
                padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(0.4em, 1vw, 0.6em)', 
                textAlign: 'center', 
                color: '#ffffff', 
                background: '#dc3545', 
                fontWeight: 600, 
                fontSize: 'clamp(11px, 2.2vw, 13px)'
              }}>
                PUTS (PE)
              </th>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0e0e0', background: '#f8f9fa' }}>
              {/* CE */}
              <th style={{ 
                padding: 'clamp(0.4em, 1vw, 0.6em) clamp(0.3em, 0.8vw, 0.4em)', 
                textAlign: 'center', 
                fontSize: 'clamp(10px, 1.8vw, 12px)', 
                borderRight: '1px solid #e0e0e0',
                fontWeight: 600,
                color: '#2c3e50',
                background: '#f8f9fa'
              }}>
                LTP
              </th>
              <th style={{ 
                padding: 'clamp(0.4em, 1vw, 0.6em) clamp(0.3em, 0.8vw, 0.4em)', 
                textAlign: 'center', 
                fontSize: 'clamp(10px, 1.8vw, 12px)', 
                borderRight: '1px solid #e0e0e0',
                fontWeight: 600,
                color: '#2c3e50',
                background: '#f8f9fa'
              }}>
                TOKEN
              </th>
              {/* Strike */}
              <th style={{ 
                padding: 'clamp(0.4em, 1vw, 0.6em) clamp(0.3em, 0.8vw, 0.4em)', 
                textAlign: 'center', 
                fontWeight: 600, 
                background: '#ffffff', 
                color: '#2c3e50', 
                borderRight: '2px solid #007bff',
                fontSize: 'clamp(11px, 2.2vw, 13px)',
                cursor: 'pointer'
              }}>
                STRIKE
              </th>
              {/* PE */}
              <th style={{ 
                padding: 'clamp(0.4em, 1vw, 0.6em) clamp(0.3em, 0.8vw, 0.4em)', 
                textAlign: 'center', 
                fontSize: 'clamp(10px, 1.8vw, 12px)', 
                borderRight: '1px solid #e0e0e0',
                fontWeight: 600,
                color: '#2c3e50',
                background: '#f8f9fa'
              }}>
                LTP
              </th>
              <th style={{ 
                padding: 'clamp(0.4em, 1vw, 0.6em) clamp(0.3em, 0.8vw, 0.4em)', 
                textAlign: 'center', 
                fontSize: 'clamp(10px, 1.8vw, 12px)', 
                fontWeight: 600,
                color: '#2c3e50',
                background: '#f8f9fa'
              }}>
                TOKEN
              </th>
            </tr>
          </thead>
          <tbody>
            {optionChain.map((row, index) => (
              <tr key={index} style={{ 
                borderBottom: '1px solid #f0f0f0',
                transition: 'background-color 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                {/* CE Option */}
                <td style={{ 
                  padding: 'clamp(0.3em, 0.8vw, 0.5em) clamp(0.2em, 0.6vw, 0.3em)', 
                  textAlign: 'center', 
                  borderRight: '1px solid #e0e0e0',
                  fontSize: 'clamp(9px, 1.6vw, 11px)',
                  cursor: 'pointer',
                  color: row.CE ? '#2c3e50' : '#6c757d'
                }}
                onClick={() => row.CE && handleOptionClick(row.CE, 'CE', row.strikePrice)}
                >
                  {row.CE ? formatINR(row.CE.ltp || row.CE.lastPrice) : 'No Data'}
                </td>
                <td style={{ 
                  padding: 'clamp(0.3em, 0.8vw, 0.5em) clamp(0.2em, 0.6vw, 0.3em)', 
                  textAlign: 'center', 
                  borderRight: '1px solid #e0e0e0',
                  fontSize: 'clamp(9px, 1.6vw, 11px)',
                  cursor: 'pointer',
                  color: row.CE ? '#2c3e50' : '#6c757d'
                }}
                onClick={() => row.CE && handleOptionClick(row.CE, 'CE', row.strikePrice)}
                >
                  {row.CE ? (row.CE.token || row.CE.instrumentToken || '-') : '-'}
                </td>
                {/* Strike Price */}
                <td style={{ 
                  padding: 'clamp(0.3em, 0.8vw, 0.5em) clamp(0.2em, 0.6vw, 0.3em)', 
                  textAlign: 'center', 
                  fontWeight: 600, 
                  background: '#ffffff', 
                  color: '#2c3e50', 
                  borderRight: '2px solid #007bff',
                  fontSize: 'clamp(10px, 1.8vw, 12px)',
                  cursor: 'pointer'
                }}
                onClick={() => handleStrikeClick(row)}
                >
                  {row.strikePrice || '-'}
                </td>
                {/* PE Option */}
                <td style={{ 
                  padding: 'clamp(0.3em, 0.8vw, 0.5em) clamp(0.2em, 0.6vw, 0.3em)', 
                  textAlign: 'center', 
                  borderRight: '1px solid #e0e0e0',
                  fontSize: 'clamp(9px, 1.6vw, 11px)',
                  cursor: 'pointer',
                  color: row.PE ? '#2c3e50' : '#6c757d'
                }}
                onClick={() => row.PE && handleOptionClick(row.PE, 'PE', row.strikePrice)}
                >
                  {row.PE ? formatINR(row.PE.ltp || row.PE.lastPrice) : 'No Data'}
                </td>
                <td style={{ 
                  padding: 'clamp(0.3em, 0.8vw, 0.5em) clamp(0.2em, 0.6vw, 0.3em)', 
                  textAlign: 'center', 
                  fontSize: 'clamp(9px, 1.6vw, 11px)',
                  cursor: 'pointer',
                  color: row.PE ? '#2c3e50' : '#6c757d'
                }}
                onClick={() => row.PE && handleOptionClick(row.PE, 'PE', row.strikePrice)}
                >
                  {row.PE ? (row.PE.token || row.PE.instrumentToken || '-') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile-friendly summary */}
      <div style={{ 
        marginTop: 'clamp(0.8em, 2vw, 1em)', 
        padding: 'clamp(0.6em, 1.5vw, 0.8em)', 
        background: '#f8f9fa', 
        borderRadius: '6px', 
        border: '1px solid #e0e0e0',
        fontSize: 'clamp(10px, 2vw, 12px)',
        color: '#6c757d'
      }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 'clamp(0.5em, 1.5vw, 1em)',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            <strong>Total Strikes:</strong> {optionChain.length}
          </span>
          <span>
            <strong>CE Options:</strong> {optionChain.filter(row => row.CE).length}
          </span>
          <span>
            <strong>PE Options:</strong> {optionChain.filter(row => row.PE).length}
          </span>
          <span>
            <strong>Click on any cell to select option</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default OptionTable; 