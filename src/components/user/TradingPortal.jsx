import React, { useState, useEffect } from 'react';
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
import ChartArea from './ChartArea';

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2em' }}>
        <div className="loading-spinner" />
        <p style={{ color: '#fff', marginTop: '1em' }}>Loading trading data...</p>
      </div>
    );
  }

  if (!userData?.broker?.status || userData.broker.status !== 'ACTIVE') {
    return (
      <div style={{ textAlign: 'center', padding: '2em' }}>
        <h2 style={{ color: '#fff', marginBottom: '1em' }}>Connect Your Broker</h2>
        <p style={{ color: '#cce3ff', marginBottom: '2em' }}>
          Please connect your broker account to start trading.
        </p>
        <Link to="/broker-settings" className="btn">
          Connect Broker
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '2em' }}>
      {error && (
        <div className="error-message" style={{ marginBottom: '2em' }}>
          {error}
        </div>
      )}

      {/* Broker Info Card */}
      <div className="card" style={{ padding: '1.5em', marginBottom: '2em' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: '#cce3ff', marginBottom: '0.5em' }}>Connected Broker</h3>
            <p style={{ color: '#fff', fontSize: '1.2em', fontWeight: 500 }}>
              {userData.broker.name}
              <span style={{ 
                color: '#43e97b',
                fontSize: '0.8em',
                marginLeft: '1em',
                padding: '0.2em 0.75em',
                background: '#43e97b22',
                borderRadius: '1em'
              }}>
                ACTIVE
              </span>
            </p>
            <p style={{ color: '#cce3ff', fontSize: '0.9em', marginTop: '0.5em' }}>
              Account ID: {userData.broker.accountId}
            </p>
          </div>
          <Link to="/broker-settings" className="btn" style={{ padding: '0.5em 1em' }}>
            Manage
          </Link>
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div style={{ display: 'grid', gap: '2em', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '2em' }}>
        <div className="card" style={{ padding: '1.5em' }}>
          <h3 style={{ color: '#cce3ff', marginBottom: '0.5em' }}>Portfolio Value</h3>
          <p style={{ color: '#fff', fontSize: '1.5em', fontWeight: 600 }}>
            ₹{(userData.portfolio.portfolioValue / 100000).toFixed(2)}L
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1em' }}>
            <div>
              <p style={{ color: '#cce3ff', fontSize: '0.9em' }}>Today's P&L</p>
              <p style={{ 
                color: userData.portfolio.todaysPnL >= 0 ? '#43e97b' : '#ff4444',
                fontWeight: 500 
              }}>
                ₹{(userData.portfolio.todaysPnL / 1000).toFixed(1)}K
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#cce3ff', fontSize: '0.9em' }}>Overall P&L</p>
              <p style={{ 
                color: userData.portfolio.overallPnL >= 0 ? '#43e97b' : '#ff4444',
                fontWeight: 500 
              }}>
                ₹{(userData.portfolio.overallPnL / 1000).toFixed(1)}K
              </p>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5em' }}>
          <h3 style={{ color: '#cce3ff', marginBottom: '0.5em' }}>Account Summary</h3>
          <div style={{ display: 'grid', gap: '1em' }}>
            <div>
              <p style={{ color: '#cce3ff', fontSize: '0.9em' }}>Capital</p>
              <p style={{ color: '#fff', fontWeight: 500 }}>
                ₹{(userData.portfolio.capitalAmount / 100000).toFixed(1)}L
              </p>
            </div>
            <div>
              <p style={{ color: '#cce3ff', fontSize: '0.9em' }}>Invested</p>
              <p style={{ color: '#fff', fontWeight: 500 }}>
                ₹{(userData.portfolio.investedAmount / 100000).toFixed(1)}L
              </p>
            </div>
            <div>
              <p style={{ color: '#cce3ff', fontSize: '0.9em' }}>Available Funds</p>
              <p style={{ color: '#fff', fontWeight: 500 }}>
                ₹{(userData.portfolio.availableFunds / 100000).toFixed(1)}L
              </p>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5em' }}>
          <h3 style={{ color: '#cce3ff', marginBottom: '0.5em' }}>Trading Limits</h3>
          <div style={{ display: 'grid', gap: '1em' }}>
            <div>
              <p style={{ color: '#cce3ff', fontSize: '0.9em' }}>RMS Limit</p>
              <p style={{ color: '#fff', fontWeight: 500 }}>
                ₹{(userData.portfolio.rmsLimit / 100000).toFixed(1)}L
              </p>
            </div>
            <div>
              <p style={{ color: '#cce3ff', fontSize: '0.9em' }}>Last Updated</p>
              <p style={{ color: '#fff', fontWeight: 500 }}>
                {new Date(userData.broker.lastSync).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Performance Chart */}
      <div style={{ marginBottom: '2em' }}>
        <ChartArea data={userData.portfolio.history} />
      </div>

      {/* Segment Selection */}
      <div style={{ marginBottom: '2em' }}>
        <SegmentSelection
          selectedSegment={selectedSegment}
          onSelect={setSelectedSegment}
        />
      </div>

      {/* Holdings Table */}
      <div className="card" style={{ padding: '1.5em', marginBottom: '2em' }}>
        <h3 style={{ color: '#cce3ff', marginBottom: '1em' }}>Holdings</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th style={{ color: '#cce3ff', padding: '0.75em', textAlign: 'left' }}>Symbol</th>
                <th style={{ color: '#cce3ff', padding: '0.75em', textAlign: 'right' }}>Qty</th>
                <th style={{ color: '#cce3ff', padding: '0.75em', textAlign: 'right' }}>Avg Price</th>
                <th style={{ color: '#cce3ff', padding: '0.75em', textAlign: 'right' }}>LTP</th>
                <th style={{ color: '#cce3ff', padding: '0.75em', textAlign: 'right' }}>Current Value</th>
                <th style={{ color: '#cce3ff', padding: '0.75em', textAlign: 'right' }}>P&L</th>
                <th style={{ color: '#cce3ff', padding: '0.75em', textAlign: 'right' }}>Day Change</th>
              </tr>
            </thead>
            <tbody>
              {userData.portfolio.holdings.map((holding, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ color: '#fff', padding: '0.75em' }}>{holding.symbol}</td>
                  <td style={{ color: '#fff', padding: '0.75em', textAlign: 'right' }}>{holding.quantity}</td>
                  <td style={{ color: '#fff', padding: '0.75em', textAlign: 'right' }}>₹{holding.avgPrice.toFixed(2)}</td>
                  <td style={{ color: '#fff', padding: '0.75em', textAlign: 'right' }}>₹{holding.ltp.toFixed(2)}</td>
                  <td style={{ color: '#fff', padding: '0.75em', textAlign: 'right' }}>
                    ₹{(holding.currentValue / 1000).toFixed(1)}K
                  </td>
                  <td style={{ 
                    padding: '0.75em', 
                    textAlign: 'right'
                  }}>
                    <div style={{ color: holding.pnl >= 0 ? '#43e97b' : '#ff4444' }}>
                      ₹{(holding.pnl / 1000).toFixed(1)}K
                    </div>
                    <div style={{ 
                      fontSize: '0.8em',
                      color: holding.pnlPercentage >= 0 ? '#43e97b' : '#ff4444'
                    }}>
                      {holding.pnlPercentage >= 0 ? '+' : ''}{holding.pnlPercentage.toFixed(2)}%
                    </div>
                  </td>
                  <td style={{ 
                    padding: '0.75em', 
                    textAlign: 'right'
                  }}>
                    <div style={{ 
                      color: holding.dayChange >= 0 ? '#43e97b' : '#ff4444'
                    }}>
                      ₹{holding.dayChange.toFixed(2)}
                    </div>
                    <div style={{ 
                      fontSize: '0.8em',
                      color: holding.dayChangePercentage >= 0 ? '#43e97b' : '#ff4444'
                    }}>
                      {holding.dayChangePercentage >= 0 ? '+' : ''}{holding.dayChangePercentage.toFixed(2)}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trading Actions */}
      <div style={{ marginBottom: '2em' }}>
        <BuySellButtons />
      </div>

      {/* Option Chain */}
      <div>
        <OptionTable segment={selectedSegment} />
      </div>
    </div>
  );
};

export default TradingPortal;
