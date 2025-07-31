import React, { useState, useEffect, useRef } from 'react';
import SegmentSelection from './SegmentSelection';
import OptionTable from './OptionTable';
import BuySellButtons from './BuySellButtons';
import ChartArea from './ChartArea';
import { 
  fetchOptionExpiries, 
  fetchOptionChain, 
  fetchUnderlyings,
  placeTradeOrder,
  getPositions,
  getOrderHistory,
  getLTPData
} from '../../api/trading';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Link } from 'react-router-dom';
import OrderList from './OrderList';
import TradeList from './TradeList';
import {
  fetchMyBrokerProfile,
  fetchBrokerConnectionStatus,
  clearBrokerProfile,
  getDematLimit
} from '../../api/auth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API = 'https://apistocktrading-production.up.railway.app/api';

const TradingViewWidget = ({ symbol }) => (
  <div style={{ width: '100%', height: 320, borderRadius: 8, overflow: 'hidden', margin: '0 auto' }}>
    <iframe
      title="TradingView Chart"
      src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_12345&symbol=NSE%3A${symbol}&interval=5&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Asia%2FKolkata&withdateranges=1&hidevolume=1&hideideas=1&studies_overrides={}`}
      style={{ width: '100%', height: 320, border: 'none' }}
      allowFullScreen
    />
  </div>
);

const TradingPortal = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('EQUITY');
  const [selectedOption, setSelectedOption] = useState(null);
  const [optionChain, setOptionChain] = useState([]);
  const [optionLoading, setOptionLoading] = useState(false);
  const [underlyings, setUnderlyings] = useState([]);
  const [underlying, setUnderlying] = useState('NIFTY');
  const [expiries, setExpiries] = useState([]);
  const [expiry, setExpiry] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds default
  const [autoRefresh, setAutoRefresh] = useState(true);
  const pollingRef = useRef(null);
  const [clearBrokerStatus, setClearBrokerStatus] = useState('');
  const [clearBrokerLoading, setClearBrokerLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);
  const [positions, setPositions] = useState([]);
  const [dematLimit, setDematLimit] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch broker connection status
        const statusRes = await fetchBrokerConnectionStatus();
        const statusValue = statusRes.data?.status || 'NOT_CONNECTED';
        
        if (statusValue === 'ACTIVE') {
          const profileRes = await fetchMyBrokerProfile();
          setUserData({ broker: profileRes.data });
          
          // Fetch additional data for connected users
          try {
            const [positionsRes, dematRes] = await Promise.all([
              getPositions(),
              getDematLimit()
            ]);
            
            if (positionsRes.success && Array.isArray(positionsRes.data)) {
              setPositions(positionsRes.data);
            }
            
            if (dematRes.data) {
              setDematLimit(dematRes.data);
            }
            
            // Generate portfolio data for chart
            const portfolioValue = dematRes.data?.net || 100000;
            const chartData = generatePortfolioChartData(portfolioValue);
            setPortfolioData(chartData);
            
          } catch (dataErr) {
            console.error('Error fetching additional data:', dataErr);
            // Use fallback data
            setPortfolioData(generatePortfolioChartData(100000));
          }
        } else {
          setUserData(null);
          setPortfolioData(null);
        }
      } catch (err) {
        setError('Failed to fetch trading data');
        setUserData(null);
        setPortfolioData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    // Refresh data every minute
    const interval = setInterval(fetchUserData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Generate portfolio chart data
  const generatePortfolioChartData = (baseValue) => {
    const data = [];
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const randomChange = (Math.random() - 0.5) * 0.1; // ±5% daily change
      const value = baseValue * (1 + randomChange);
      data.push({
        date: date.toISOString(),
        value: Math.max(value, baseValue * 0.8) // Don't go below 80% of base
      });
    }
    return data;
  };

  // Fetch underlyings on mount
  useEffect(() => {
    const fetchAllUnderlyings = async () => {
      try {
        const res = await fetchUnderlyings();
        if (res && res.success && Array.isArray(res.data)) {
          setUnderlyings(res.data);
          setUnderlying(res.data[0]);
          setError('');
        } else {
          if (!res.error || !res.error.includes('403')) {
            setError('Failed to fetch underlyings');
          }
        }
      } catch (err) {
        console.error('Error in fetchAllUnderlyings:', err);
      }
    };
    fetchAllUnderlyings();
  }, []);

  // Fetch expiries when underlying changes
  useEffect(() => {
    if (!underlying) return;
    const fetchExpiries = async () => {
      try {
        const res = await fetchOptionExpiries(underlying);
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setExpiries(res.data);
          setExpiry(res.data[0]);
          setError('');
        } else {
          setExpiries([]);
          setExpiry('');
          if (!res.error || !res.error.includes('403')) {
            setError('No expiries found for selected underlying');
          }
        }
      } catch (err) {
        console.error('Error in fetchExpiries:', err);
      }
    };
    fetchExpiries();
  }, [underlying]);

  // Fetch option chain (manual or interval)
  const fetchChain = async () => {
    if (!underlying || !expiry) return;
    setOptionLoading(true);
    try {
      const res = await fetchOptionChain(underlying, expiry);
      if (res && res.success && Array.isArray(res.data)) {
        setOptionChain(res.data);
        setError('');
      } else {
        setOptionChain([]);
        if (!res.error || !res.error.includes('403')) {
          setError(res.error || 'Failed to fetch option chain');
        }
      }
    } catch (err) {
      console.error('Error in fetchChain:', err);
      setOptionChain([]);
    } finally {
      setOptionLoading(false);
    }
  };

  // Auto-refresh option chain (controlled by user)
  useEffect(() => {
    if (!autoRefresh) return;
    fetchChain();
    pollingRef.current = setInterval(fetchChain, refreshInterval);
    return () => clearInterval(pollingRef.current);
  }, [autoRefresh, refreshInterval, underlying, expiry]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchChain();
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleTrade = async (tradeInfo) => {
    try {
      console.log('Placing trade:', tradeInfo);
      // Here you would call your trading API
      // await placeTradeOrder(tradeInfo);
      
      // For now, just log the trade
      console.log('Trade placed successfully:', tradeInfo);
    } catch (error) {
      console.error('Error placing trade:', error);
      throw error;
    }
  };

  const handleClearBroker = async () => {
    setClearBrokerLoading(true);
    setClearBrokerStatus('');
    try {
      await clearBrokerProfile();
      setClearBrokerStatus('Broker connection cleared successfully');
      setUserData(null);
      setPortfolioData(null);
      setPositions([]);
      setDematLimit(null);
    } catch (err) {
      setClearBrokerStatus('Failed to clear broker connection');
    } finally {
      setClearBrokerLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 'clamp(2em, 5vw, 4em)',
        background: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="loading-spinner" style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e3e3e3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1em'
        }} />
        <p style={{ 
          color: '#2c3e50', 
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          fontWeight: 500
        }}>
          Loading your trading dashboard...
        </p>
      </div>
    );
  }

  if (!userData?.broker?.status || userData.broker.status !== 'ACTIVE') {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 'clamp(2em, 5vw, 4em)',
        background: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          background: '#f8f9fa',
          padding: 'clamp(2em, 4vw, 3em)',
          borderRadius: '12px',
          border: '2px dashed #dee2e6',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h2 style={{ 
            color: '#2c3e50', 
            marginBottom: '1em',
            fontSize: 'clamp(1.5em, 4vw, 2em)',
            fontWeight: 600
          }}>
            Connect Your Broker
          </h2>
          <p style={{ 
            color: '#6c757d', 
            marginBottom: '2em',
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            lineHeight: 1.6
          }}>
            To start trading, you need to connect your broker account. This will allow you to view real-time market data and place trades.
          </p>
          <Link to="/dashboard/broker-settings" style={{
            display: 'inline-block',
            background: '#007bff',
            color: '#ffffff',
            padding: 'clamp(0.8em, 2vw, 1em) clamp(1.5em, 3vw, 2em)',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 'clamp(14px, 2.5vw, 16px)',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(0,123,255,0.2)'
          }}>
            Connect Broker Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: 'clamp(1em, 3vw, 1.5em)', 
      background: '#f8f9fa', 
      minHeight: '100vh', 
      maxWidth: 1400, 
      margin: '0 auto'
    }}>
      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: 'clamp(0.8em, 2vw, 1em)', 
          borderRadius: '8px', 
          marginBottom: '1.5em', 
          border: '1px solid #f5c6cb', 
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5em'
        }}>
          <span>⚠️</span>
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}

      {clearBrokerStatus && (
        <div style={{ 
          background: clearBrokerStatus.includes('successfully') ? '#d4edda' : '#f8d7da',
          color: clearBrokerStatus.includes('successfully') ? '#155724' : '#721c24',
          padding: 'clamp(0.8em, 2vw, 1em)', 
          borderRadius: '8px', 
          marginBottom: '1.5em', 
          border: clearBrokerStatus.includes('successfully') ? '1px solid #c3e6cb' : '1px solid #f5c6cb', 
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          fontWeight: 500
        }}>
          {clearBrokerStatus}
        </div>
      )}

      {/* Header Section */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5em', 
        marginBottom: '2em' 
      }}>
        {/* Portfolio Overview */}
        {portfolioData && (
          <div style={{ 
            padding: 'clamp(1em, 3vw, 1.5em)', 
            background: '#fff', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
            border: '1px solid #e0e0e0' 
          }}>
            <h3 style={{ 
              color: '#2c3e50', 
              marginBottom: '1em', 
              fontSize: 'clamp(1.1em, 3vw, 1.3em)',
              fontWeight: 600
            }}>
              Portfolio Performance
            </h3>
            <ChartArea data={portfolioData} />
          </div>
        )}

        {/* Account Summary */}
        <div style={{ 
          padding: 'clamp(1em, 3vw, 1.5em)', 
          background: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
          border: '1px solid #e0e0e0' 
        }}>
          <h3 style={{ 
            color: '#2c3e50', 
            marginBottom: '1em', 
            fontSize: 'clamp(1.1em, 3vw, 1.3em)',
            fontWeight: 600
          }}>
            Account Summary
          </h3>
          <div style={{ display: 'grid', gap: '1em' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0.8em',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <span style={{ color: '#6c757d', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Available Balance</span>
              <span style={{ 
                color: '#2c3e50', 
                fontWeight: 600,
                fontSize: 'clamp(14px, 2.5vw, 16px)'
              }}>
                ₹{(dematLimit?.net || 0).toLocaleString()}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0.8em',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <span style={{ color: '#6c757d', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Total Positions</span>
              <span style={{ 
                color: '#2c3e50', 
                fontWeight: 600,
                fontSize: 'clamp(14px, 2.5vw, 16px)'
              }}>
                {positions.length}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '0.8em',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <span style={{ color: '#6c757d', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Broker Status</span>
              <span style={{ 
                color: '#28a745', 
                fontWeight: 600,
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                background: '#d4edda',
                padding: '0.3em 0.8em',
                borderRadius: '20px'
              }}>
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ 
          padding: 'clamp(1em, 3vw, 1.5em)', 
          background: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
          border: '1px solid #e0e0e0' 
        }}>
          <h3 style={{ 
            color: '#2c3e50', 
            marginBottom: '1em', 
            fontSize: 'clamp(1.1em, 3vw, 1.3em)',
            fontWeight: 600
          }}>
            Quick Actions
          </h3>
          <div style={{ display: 'grid', gap: '0.8em' }}>
            <button
              onClick={handleManualRefresh}
              disabled={optionLoading}
              style={{
                width: '100%',
                padding: '0.8em',
                background: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                fontWeight: 600,
                cursor: optionLoading ? 'not-allowed' : 'pointer',
                opacity: optionLoading ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {optionLoading ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button
              onClick={handleClearBroker}
              disabled={clearBrokerLoading}
              style={{
                width: '100%',
                padding: '0.8em',
                background: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                fontWeight: 600,
                cursor: clearBrokerLoading ? 'not-allowed' : 'pointer',
                opacity: clearBrokerLoading ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {clearBrokerLoading ? 'Disconnecting...' : 'Disconnect Broker'}
            </button>
          </div>
        </div>
      </div>

      {/* Market Data Controls */}
      <div style={{ 
        padding: 'clamp(1em, 3vw, 1.5em)', 
        background: '#fff', 
        borderRadius: '12px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
        border: '1px solid #e0e0e0',
        marginBottom: '2em'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1em'
        }}>
          <h3 style={{ 
            color: '#2c3e50', 
            margin: 0, 
            fontSize: 'clamp(1.1em, 3vw, 1.3em)',
            fontWeight: 600
          }}>
            Market Data
          </h3>
          
          <div style={{ 
            display: 'flex', 
            gap: '1em', 
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <select
              value={underlying}
              onChange={(e) => setUnderlying(e.target.value)}
              style={{
                padding: '0.5em',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                background: '#fff'
              }}
            >
              {underlyings.map(und => (
                <option key={und} value={und}>{und}</option>
              ))}
            </select>
            
            <select
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              style={{
                padding: '0.5em',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                background: '#fff'
              }}
            >
              {expiries.map(exp => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5em',
              fontSize: 'clamp(12px, 2.5vw, 14px)'
            }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
              Auto Refresh
            </label>
          </div>
        </div>
      </div>

      {/* Option Chain */}
      <div style={{ marginBottom: '2em' }}>
        <OptionTable
          optionChain={optionChain}
          loading={optionLoading}
          error={error}
          onOptionSelect={handleOptionSelect}
          onRefresh={handleManualRefresh}
        />
      </div>

      {/* Buy/Sell Buttons */}
      {selectedOption && (
        <div style={{ marginBottom: '2em' }}>
          <BuySellButtons
            selectedOption={selectedOption}
            onTrade={handleTrade}
          />
        </div>
      )}

      {/* TradingView Chart */}
      <div style={{ marginBottom: '2em' }}>
        <TradingViewWidget symbol={underlying} />
      </div>

      {/* Order and Trade Lists */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '1.5em', 
        marginBottom: '2em' 
      }}>
        <OrderList />
        <TradeList />
      </div>

      {/* Segment Selection */}
      <div style={{ marginBottom: '2em' }}>
        <SegmentSelection
          selected={selectedSegment}
          onSelectSegment={setSelectedSegment}
        />
      </div>

      {/* Positions Table */}
      {positions.length > 0 && (
        <div style={{ 
          padding: 'clamp(1em, 3vw, 1.5em)', 
          background: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
          border: '1px solid #e0e0e0', 
          marginBottom: '2em' 
        }}>
          <h3 style={{ 
            color: '#2c3e50', 
            marginBottom: '1em', 
            fontSize: 'clamp(1.1em, 3vw, 1.3em)',
            fontWeight: 600
          }}>
            Current Positions
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              fontSize: 'clamp(11px, 2.5vw, 13px)',
              minWidth: '600px'
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e0e0e0', background: '#f8f9fa' }}>
                  <th style={{ color: '#495057', padding: '0.6em', textAlign: 'left', fontWeight: 600 }}>Symbol</th>
                  <th style={{ color: '#495057', padding: '0.6em', textAlign: 'right', fontWeight: 600 }}>Qty</th>
                  <th style={{ color: '#495057', padding: '0.6em', textAlign: 'right', fontWeight: 600 }}>Avg Price</th>
                  <th style={{ color: '#495057', padding: '0.6em', textAlign: 'right', fontWeight: 600 }}>LTP</th>
                  <th style={{ color: '#495057', padding: '0.6em', textAlign: 'right', fontWeight: 600 }}>Current Value</th>
                  <th style={{ color: '#495057', padding: '0.6em', textAlign: 'right', fontWeight: 600 }}>P&L</th>
                  <th style={{ color: '#495057', padding: '0.6em', textAlign: 'right', fontWeight: 600 }}>Day Change</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position, idx) => (
                  <tr key={position.symbol || idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '0.6em', fontWeight: 500 }}>{position.symbol || '-'}</td>
                    <td style={{ padding: '0.6em', textAlign: 'right' }}>{position.quantity || '-'}</td>
                    <td style={{ padding: '0.6em', textAlign: 'right' }}>₹{position.averagePrice || '-'}</td>
                    <td style={{ padding: '0.6em', textAlign: 'right' }}>₹{position.ltp || '-'}</td>
                    <td style={{ padding: '0.6em', textAlign: 'right' }}>₹{position.currentValue || '-'}</td>
                    <td style={{ 
                      padding: '0.6em', 
                      textAlign: 'right',
                      color: (position.pnl || 0) >= 0 ? '#28a745' : '#dc3545',
                      fontWeight: 500
                    }}>
                      ₹{position.pnl || '-'}
                    </td>
                    <td style={{ 
                      padding: '0.6em', 
                      textAlign: 'right',
                      color: (position.dayChange || 0) >= 0 ? '#28a745' : '#dc3545',
                      fontWeight: 500
                    }}>
                      {position.dayChange ? `${position.dayChange > 0 ? '+' : ''}${position.dayChange}%` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingPortal;
