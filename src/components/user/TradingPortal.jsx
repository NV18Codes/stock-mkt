import React, { useState, useEffect, useRef } from 'react';
import SegmentSelection from './SegmentSelection';
import OptionTable from './OptionTable';
import BuySellButtons from './BuySellButtons';
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

// Test data for development - this would normally come from your backend
const TEST_USER_DATA = {
  name: 'User One',
  email: 'user1@gmail.com',
  phone: '+91 98765 43210',
  broker: {
    name: 'Angel One',
    status: 'ACTIVE',
    accountId: 'A123456',
    lastSync: new Date().toISOString()
  },
  portfolio: {
    capitalAmount: 1000000, // 10 Lakhs
    investedAmount: 750000, // 7.5 Lakhs
    availableFunds: 250000, // 2.5 Lakhs
    rmsLimit: 2000000, // 20 Lakhs
    portfolioValue: 825000, // 8.25 Lakhs
    todaysPnL: 15000,
    overallPnL: 75000,
    holdings: [
      {
        symbol: 'RELIANCE',
        quantity: 100,
        avgPrice: 2450.75,
        ltp: 2575.50,
        currentValue: 257550,
        pnl: 12475,
        pnlPercentage: 5.09,
        dayChange: 25.75,
        dayChangePercentage: 1.01
      },
      {
        symbol: 'TCS',
        quantity: 50,
        avgPrice: 3200.00,
        ltp: 3350.25,
        currentValue: 167512.50,
        pnl: 7512.50,
        pnlPercentage: 4.69,
        dayChange: 45.25,
        dayChangePercentage: 1.37
      },
      {
        symbol: 'INFY',
        quantity: 150,
        avgPrice: 1475.50,
        ltp: 1525.75,
        currentValue: 228862.50,
        pnl: 7537.50,
        pnlPercentage: 3.41,
        dayChange: 15.75,
        dayChangePercentage: 1.04
      }
    ],
    history: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      value: 750000 + Math.random() * 100000
    }))
  }
};

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

  useEffect(() => {
    const fetchUserData = () => {
      setLoading(true);
      setError('');
      try {
        // For testing, we'll use the test data
        setUserData(TEST_USER_DATA);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch trading data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    // Refresh data every minute
    const interval = setInterval(fetchUserData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch underlyings on mount
  useEffect(() => {
    const fetchAllUnderlyings = async () => {
      try {
        const res = await fetchUnderlyings();
        if (res && res.success && Array.isArray(res.data)) {
          setUnderlyings(res.data);
          setUnderlying(res.data[0]);
          // Clear any previous errors if successful
          setError('');
        } else {
          // Only set error if it's not a fallback case
          if (!res.error || !res.error.includes('403')) {
            setError('Failed to fetch underlyings');
          }
        }
      } catch (err) {
        console.error('Error in fetchAllUnderlyings:', err);
        // Don't set error for 403 cases as fallback data is used
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
          // Clear any previous errors if successful
          setError('');
        } else {
          setExpiries([]);
          setExpiry('');
          // Only set error if it's not a fallback case
          if (!res.error || !res.error.includes('403')) {
            setError('No expiries found for selected underlying');
          }
        }
      } catch (err) {
        console.error('Error in fetchExpiries:', err);
        // Don't set error for 403 cases as fallback data is used
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
        // Clear any previous errors if successful
        setError('');
      } else {
        setOptionChain([]);
        // Only set error if it's not a fallback case
        if (!res.error || !res.error.includes('403')) {
          setError(res.error || 'Failed to fetch option chain');
        }
      }
    } catch (err) {
      console.error('Error in fetchChain:', err);
      setOptionChain([]);
      // Don't set error for 403 cases as fallback data is used
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

  // Add clear broker profile handler
  const handleClearBrokerProfile = async () => {
    setClearBrokerLoading(true);
    setClearBrokerStatus('');
    try {
      const res = await axios.post('https://apistocktrading-production.up.railway.app/api/users/me/broker/clear');
      if (res && res.data && res.data.success) {
        setClearBrokerStatus('Broker profile cleared successfully.');
        // Optionally refresh user data
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setClearBrokerStatus('Failed to clear broker profile.');
      }
    } catch (err) {
      setClearBrokerStatus('Failed to clear broker profile.');
    } finally {
      setClearBrokerLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 'clamp(1em, 3vw, 2em)',
        background: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="loading-spinner" />
        <p style={{ 
          color: '#2c3e50', 
          marginTop: '1em', 
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          fontWeight: 500
        }}>
          Loading trading data...
        </p>
      </div>
    );
  }

  if (!userData?.broker?.status || userData.broker.status !== 'ACTIVE') {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 'clamp(1em, 3vw, 2em)',
        background: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
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
          maxWidth: '500px'
        }}>
          Please connect your broker account to start trading.
        </p>
        <Link to="/broker-settings" className="btn btn-primary" style={{
          padding: 'clamp(0.8em, 2vw, 1em) clamp(1.5em, 3vw, 2em)',
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          fontWeight: 600
        }}>
          Connect Broker
        </Link>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '1em', 
      background: '#ffffff', 
      minHeight: '100vh', 
      maxWidth: 1200, 
      margin: '0 auto',
      overflowX: 'hidden'
    }}>
      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: 'clamp(0.8em, 2vw, 1em)', 
          borderRadius: '8px', 
          marginBottom: '1em', 
          border: '1px solid #f5c6cb', 
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          fontWeight: 500
        }}>
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {/* Broker Info Card */}
      <div style={{ 
        padding: 'clamp(1em, 3vw, 1.5em)', 
        background: '#fff', 
        borderRadius: '8px', 
        boxShadow: '0 1px 6px rgba(0,0,0,0.1)', 
        border: '1px solid #e0e0e0', 
        marginBottom: '1.5em' 
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '1em'
        }}>
          <div>
            <h3 style={{ 
              color: '#2c3e50', 
              marginBottom: '0.5em', 
              fontSize: 'clamp(1em, 3vw, 1.2em)' 
            }}>Connected Broker</h3>
            <p style={{ 
              color: '#333', 
              fontSize: 'clamp(0.9em, 2.5vw, 1.1em)', 
              fontWeight: 500 
            }}>
              {userData.broker.name}
              <span style={{ 
                color: '#28a745',
                fontSize: 'clamp(0.7em, 2vw, 0.8em)',
                marginLeft: '0.5em',
                padding: '0.2em 0.75em',
                background: '#d4edda',
                borderRadius: '1em',
                border: '1px solid #c3e6cb'
              }}>
                ACTIVE
              </span>
            </p>
            <p style={{ 
              color: '#666', 
              fontSize: 'clamp(0.8em, 2.2vw, 0.9em)', 
              marginTop: '0.5em' 
            }}>
              Account ID: {userData.broker.accountId}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1em', flexWrap: 'wrap' }}>
            <Link to="/broker-settings" className="btn btn-primary" style={{ 
              padding: '0.5em 1em',
              alignSelf: 'flex-start'
            }}>
              Manage
            </Link>
            <button
              onClick={handleClearBrokerProfile}
              disabled={clearBrokerLoading}
              style={{
                padding: '0.5em 1em',
                background: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                fontWeight: 500,
                cursor: clearBrokerLoading ? 'not-allowed' : 'pointer',
                opacity: clearBrokerLoading ? 0.6 : 1
              }}
            >
              {clearBrokerLoading ? 'Clearing...' : 'Clear Broker Profile'}
            </button>
          </div>
          {clearBrokerStatus && (
            <div style={{ color: clearBrokerStatus.includes('success') ? '#28a745' : '#dc3545', fontWeight: 500, marginTop: 8 }}>
              {clearBrokerStatus}
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div style={{ 
        display: 'grid', 
        gap: '1em', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        marginBottom: '1.5em' 
      }}>
        <div style={{ 
          padding: 'clamp(1em, 3vw, 1.5em)', 
          background: '#fff', 
          borderRadius: '8px', 
          boxShadow: '0 1px 6px rgba(0,0,0,0.1)', 
          border: '1px solid #e0e0e0' 
        }}>
          <h3 style={{ 
            color: '#2c3e50', 
            marginBottom: '0.5em', 
            fontSize: 'clamp(0.9em, 2.5vw, 1.1em)' 
          }}>Portfolio Value</h3>
          <p style={{ 
            color: '#333', 
            fontSize: 'clamp(1.2em, 4vw, 1.4em)', 
            fontWeight: 600 
          }}>
            ₹{(userData.portfolio.portfolioValue / 100000).toFixed(2)}L
          </p>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '0.5em',
            marginTop: '1em' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ color: '#666', fontSize: 'clamp(0.8em, 2.2vw, 0.9em)' }}>Today's P&L</p>
                <p style={{ 
                  color: userData.portfolio.todaysPnL >= 0 ? '#28a745' : '#dc3545',
                  fontWeight: 500,
                  fontSize: 'clamp(0.9em, 2.5vw, 1em)'
                }}>
                  ₹{(userData.portfolio.todaysPnL / 1000).toFixed(1)}K
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ color: '#666', fontSize: 'clamp(0.8em, 2.2vw, 0.9em)' }}>Overall P&L</p>
                <p style={{ 
                  color: userData.portfolio.overallPnL >= 0 ? '#28a745' : '#dc3545',
                  fontWeight: 500,
                  fontSize: 'clamp(0.9em, 2.5vw, 1em)'
                }}>
                  ₹{(userData.portfolio.overallPnL / 1000).toFixed(1)}K
                </p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ 
          padding: 'clamp(1em, 3vw, 1.5em)', 
          background: '#fff', 
          borderRadius: '8px', 
          boxShadow: '0 1px 6px rgba(0,0,0,0.1)', 
          border: '1px solid #e0e0e0' 
        }}>
          <h3 style={{ 
            color: '#2c3e50', 
            marginBottom: '0.5em', 
            fontSize: 'clamp(0.9em, 2.5vw, 1.1em)' 
          }}>Account Summary</h3>
          <div style={{ display: 'grid', gap: '0.8em' }}>
            <div>
              <p style={{ color: '#666', fontSize: 'clamp(0.8em, 2.2vw, 0.9em)' }}>Capital</p>
              <p style={{ 
                color: '#333', 
                fontWeight: 500,
                fontSize: 'clamp(0.9em, 2.5vw, 1em)'
              }}>
                ₹{(userData.portfolio.capitalAmount / 100000).toFixed(1)}L
              </p>
            </div>
            <div>
              <p style={{ color: '#666', fontSize: 'clamp(0.8em, 2.2vw, 0.9em)' }}>Invested</p>
              <p style={{ 
                color: '#333', 
                fontWeight: 500,
                fontSize: 'clamp(0.9em, 2.5vw, 1em)'
              }}>
                ₹{(userData.portfolio.investedAmount / 100000).toFixed(1)}L
              </p>
            </div>
            <div>
              <p style={{ color: '#666', fontSize: 'clamp(0.8em, 2.2vw, 0.9em)' }}>Available Funds</p>
              <p style={{ 
                color: '#333', 
                fontWeight: 500,
                fontSize: 'clamp(0.9em, 2.5vw, 1em)'
              }}>
                ₹{(userData.portfolio.availableFunds / 100000).toFixed(1)}L
              </p>
            </div>
          </div>
        </div>

        <div style={{ 
          padding: 'clamp(1em, 3vw, 1.5em)', 
          background: '#fff', 
          borderRadius: '8px', 
          boxShadow: '0 1px 6px rgba(0,0,0,0.1)', 
          border: '1px solid #e0e0e0' 
        }}>
          <h3 style={{ 
            color: '#2c3e50', 
            marginBottom: '0.5em', 
            fontSize: 'clamp(0.9em, 2.5vw, 1.1em)' 
          }}>Trading Limits</h3>
          <div style={{ display: 'grid', gap: '0.8em' }}>
            <div>
              <p style={{ color: '#666', fontSize: 'clamp(0.8em, 2.2vw, 0.9em)' }}>RMS Limit</p>
              <p style={{ 
                color: '#333', 
                fontWeight: 500,
                fontSize: 'clamp(0.9em, 2.5vw, 1em)'
              }}>
                ₹{(userData.portfolio.rmsLimit / 100000).toFixed(1)}L
              </p>
            </div>
            <div>
              <p style={{ color: '#666', fontSize: 'clamp(0.8em, 2.2vw, 0.9em)' }}>Last Updated</p>
              <p style={{ 
                color: '#333', 
                fontWeight: 500,
                fontSize: 'clamp(0.8em, 2.2vw, 0.9em)'
              }}>
                {new Date(userData.broker.lastSync).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order List Section */}
      <div style={{ marginBottom: '1.5em' }}>
        <OrderList />
      </div>
      {/* Trade List Section */}
      <div style={{ marginBottom: '1.5em' }}>
        <TradeList />
      </div>

      {/* Segment Selection */}
      <div style={{ marginBottom: '1.5em' }}>
        <SegmentSelection
          selected={selectedSegment}
          onSelectSegment={setSelectedSegment}
        />
      </div>

      {/* Holdings Table */}
      <div style={{ 
        padding: 'clamp(1em, 3vw, 1.5em)', 
        background: '#fff', 
        borderRadius: '8px', 
        boxShadow: '0 1px 6px rgba(0,0,0,0.1)', 
        border: '1px solid #e0e0e0', 
        marginBottom: '1.5em' 
      }}>
        <h3 style={{ 
          color: '#2c3e50', 
          marginBottom: '1em', 
          fontSize: 'clamp(1em, 3vw, 1.2em)' 
        }}>Holdings</h3>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
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
                <th style={{ color: '#495057', padding: '0.6em', textAlign: 'right', fontWeight: 600 }}>Range</th>
                <th style={{ color: '#495057', padding: '0.6em', textAlign: 'right', fontWeight: 600 }}>Circuit Status</th>
              </tr>
            </thead>
            <tbody>
              {userData.portfolio.holdings.map((holding, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ color: '#333', padding: '0.6em' }}>{holding.symbol}</td>
                  <td style={{ color: '#333', padding: '0.6em', textAlign: 'right' }}>{holding.quantity}</td>
                  <td style={{ color: '#333', padding: '0.6em', textAlign: 'right' }}>₹{holding.avgPrice.toFixed(2)}</td>
                  <td style={{ color: '#333', padding: '0.6em', textAlign: 'right' }}>₹{holding.ltp.toFixed(2)}</td>
                  <td style={{ color: '#333', padding: '0.6em', textAlign: 'right' }}>
                    ₹{(holding.currentValue / 1000).toFixed(1)}K
                  </td>
                  <td style={{ padding: '0.6em', textAlign: 'right' }}>
                    <div style={{ color: holding.pnl >= 0 ? '#28a745' : '#dc3545' }}>
                      ₹{(holding.pnl / 1000).toFixed(1)}K
                    </div>
                    <div style={{ fontSize: 'clamp(0.7em, 2vw, 0.8em)', color: holding.pnlPercentage >= 0 ? '#28a745' : '#dc3545' }}>
                      {holding.pnlPercentage >= 0 ? '+' : ''}{holding.pnlPercentage.toFixed(2)}%
                    </div>
                  </td>
                  <td style={{ padding: '0.6em', textAlign: 'right' }}>
                    <div style={{ color: holding.dayChange >= 0 ? '#28a745' : '#dc3545' }}>
                      ₹{holding.dayChange.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 'clamp(0.7em, 2vw, 0.8em)', color: holding.dayChangePercentage >= 0 ? '#28a745' : '#dc3545' }}>
                      {holding.dayChangePercentage >= 0 ? '+' : ''}{holding.dayChangePercentage.toFixed(2)}%
                    </div>
                  </td>
                  <td style={{ color: '#333', padding: '0.6em', textAlign: 'right' }}>
                    {holding.rangeLow && holding.rangeHigh ? `₹${holding.rangeLow} - ₹${holding.rangeHigh}` : 'N/A'}
                  </td>
                  <td style={{ color: '#333', padding: '0.6em', textAlign: 'right' }}>
                    {holding.ltp === holding.lowerCircuit ? 'Lower Circuit' : holding.ltp === holding.upperCircuit ? 'Upper Circuit' : 'Normal'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Option Chain Section */}
      <div style={{ marginBottom: '1.5em' }}>
        <div style={{ 
          padding: 'clamp(1em, 3vw, 1.5em)', 
          background: '#fff', 
          borderRadius: '8px', 
          boxShadow: '0 1px 6px rgba(0,0,0,0.1)', 
          border: '1px solid #e0e0e0' 
        }}>
          <h3 style={{ 
            color: '#2c3e50', 
            marginBottom: '1em', 
            fontSize: 'clamp(1em, 3vw, 1.2em)' 
          }}>Option Chain - {underlying} ({expiry})</h3>
          
          {/* Selected Option Info */}
          {selectedOption && (
            <div style={{ 
              background: '#e3f2fd', 
              padding: '0.8em', 
              borderRadius: '4px', 
              marginBottom: '1em',
              border: '1px solid #bbdefb'
            }}>
              <div style={{ 
                fontSize: 'clamp(11px, 2.5vw, 13px)', 
                color: '#1976d2', 
                marginBottom: '0.3em' 
              }}>
                Selected Option: {selectedOption.tradingSymbol || selectedOption.symbol || 'N/A'}
              </div>
              <div style={{ 
                fontSize: 'clamp(10px, 2.2vw, 12px)', 
                color: '#1976d2' 
              }}>
                Strike: {selectedOption.strikePrice || 'N/A'} | 
                Type: {selectedOption.optionType || 'N/A'} | 
                Token: {selectedOption.token || 'N/A'}
              </div>
            </div>
          )}

          {/* Buy/Sell Buttons */}
          <BuySellButtons
            selectedOption={selectedOption}
            onTrade={handleTrade}
            isAdmin={false}
          />

          {/* Option Table */}
          <OptionTable 
            optionChain={optionChain}
            loading={optionLoading}
            error={error}
            onOptionSelect={handleOptionSelect}
            onRefresh={handleManualRefresh}
            isAdmin={false}
          />
        </div>
      </div>
    </div>
  );
};

export default TradingPortal;
