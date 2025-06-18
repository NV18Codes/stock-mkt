import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Test data for development
const TEST_USERS = [
  {
    id: 1,
    name: 'User One',
    email: 'user1@gmail.com',
    phone: '+91 98765 43210',
    brokerStatus: 'ACTIVE',
    broker: 'Angel One',
    capitalAmount: 1000000,
    investedAmount: 750000,
    totalTrades: 125,
    profitLoss: 75000,
    holdings: [
      {
        symbol: 'RELIANCE',
        quantity: 100,
        avgPrice: 2450.75,
        ltp: 2575.50,
        pnl: 12475
      },
      {
        symbol: 'TCS',
        quantity: 50,
        avgPrice: 3200.00,
        ltp: 3350.25,
        pnl: 7512.50
      },
      {
        symbol: 'INFY',
        quantity: 150,
        avgPrice: 1475.50,
        ltp: 1525.75,
        pnl: 7537.50
      }
    ]
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+91 98765 43211',
    brokerStatus: 'ACTIVE',
    broker: 'Zerodha',
    capitalAmount: 2000000,
    investedAmount: 1500000,
    totalTrades: 250,
    profitLoss: 150000
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+91 98765 43212',
    brokerStatus: 'INACTIVE',
    broker: 'Groww',
    capitalAmount: 500000,
    investedAmount: 0,
    totalTrades: 50,
    profitLoss: -25000
  },
  {
    id: 4,
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    phone: '+91 98765 43213',
    brokerStatus: 'PENDING_VERIFICATION',
    broker: 'Upstox',
    capitalAmount: 1500000,
    investedAmount: 1200000,
    totalTrades: 175,
    profitLoss: 125000
  }
];

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = () => {
      setLoading(true);
      setError('');
      try {
        // For testing, we'll use the test data
        setUsers(TEST_USERS);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    // Refresh data every minute
    const interval = setInterval(fetchUsers, 60000);
    return () => clearInterval(interval);
  }, []);

  const calculateStatistics = () => {
    const activeUsers = users.filter(user => user.brokerStatus === 'ACTIVE').length;
    const totalTrades = users.reduce((sum, user) => sum + user.totalTrades, 0);
    const totalVolume = users.reduce((sum, user) => sum + user.investedAmount, 0);
    const totalProfitLoss = users.reduce((sum, user) => sum + user.profitLoss, 0);

    return {
      totalUsers: users.length,
      activeUsers,
      totalTrades,
      totalVolume,
      totalProfitLoss
    };
  };

  const stats = calculateStatistics();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2em' }}>
        <div className="loading-spinner" />
        <p style={{ color: '#fff', marginTop: '1em' }}>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2em' }}>
      <h1 style={{ color: '#007bff', marginBottom: '1.5em' }}>Admin Dashboard</h1>

      {error && (
        <div className="error-message" style={{ marginBottom: '2em' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '2em', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '2em' }}>
        <div className="card" style={{ padding: '1.5em' }}>
          <h3 style={{ color: '#cce3ff' }}>Total Users</h3>
          <p style={{ color: '#fff', fontSize: '2em', fontWeight: 600, marginTop: '0.5em' }}>
            {stats.totalUsers}
          </p>
          <p style={{ color: '#43e97b', marginTop: '0.5em' }}>
            {stats.activeUsers} Active
          </p>
        </div>

        <div className="card" style={{ padding: '1.5em' }}>
          <h3 style={{ color: '#cce3ff' }}>Total Trades</h3>
          <p style={{ color: '#fff', fontSize: '2em', fontWeight: 600, marginTop: '0.5em' }}>
            {stats.totalTrades}
          </p>
          <p style={{ color: '#cce3ff', marginTop: '0.5em' }}>
            Across all users
          </p>
        </div>

        <div className="card" style={{ padding: '1.5em' }}>
          <h3 style={{ color: '#cce3ff' }}>Trading Volume</h3>
          <p style={{ color: '#fff', fontSize: '2em', fontWeight: 600, marginTop: '0.5em' }}>
            ₹{(stats.totalVolume / 10000000).toFixed(2)}Cr
          </p>
          <p style={{ 
            color: stats.totalProfitLoss >= 0 ? '#43e97b' : '#ff4444', 
            marginTop: '0.5em' 
          }}>
            {stats.totalProfitLoss >= 0 ? '+' : ''}₹{(stats.totalProfitLoss / 100000).toFixed(2)}L P&L
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5em' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5em' }}>
          <h2 style={{ color: '#fff' }}>User Management</h2>
          <Link to="/admin/users" className="btn" style={{ padding: '0.5em 1em' }}>
            View All Users
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th style={{ color: '#cce3ff', padding: '0.75em', textAlign: 'left' }}>Name</th>
                <th style={{ color: '#cce3ff', padding: '0.75em', textAlign: 'left' }}>Email</th>
                <th style={{ color: '#cce3ff', padding: '0.75em', textAlign: 'left' }}>Phone</th>
                <th style={{ color: '#cce3ff', padding: '0.75em', textAlign: 'left' }}>Broker</th>
                <th style={{ color: '#cce3ff', padding: '0.75em', textAlign: 'right' }}>Capital</th>
                <th style={{ color: '#cce3ff', padding: '0.75em', textAlign: 'right' }}>Invested</th>
                <th style={{ color: '#cce3ff', padding: '0.75em', textAlign: 'right' }}>P&L</th>
                <th style={{ color: '#cce3ff', padding: '0.75em', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ color: '#fff', padding: '0.75em' }}>{user.name}</td>
                  <td style={{ color: '#fff', padding: '0.75em' }}>{user.email}</td>
                  <td style={{ color: '#fff', padding: '0.75em' }}>{user.phone}</td>
                  <td style={{ color: '#fff', padding: '0.75em' }}>{user.broker}</td>
                  <td style={{ color: '#fff', padding: '0.75em', textAlign: 'right' }}>
                    ₹{(user.capitalAmount / 100000).toFixed(1)}L
                  </td>
                  <td style={{ color: '#fff', padding: '0.75em', textAlign: 'right' }}>
                    ₹{(user.investedAmount / 100000).toFixed(1)}L
                  </td>
                  <td style={{ 
                    padding: '0.75em', 
                    textAlign: 'right',
                    color: user.profitLoss >= 0 ? '#43e97b' : '#ff4444'
                  }}>
                    {user.profitLoss >= 0 ? '+' : ''}₹{(user.profitLoss / 1000).toFixed(1)}K
                  </td>
                  <td style={{ padding: '0.75em', textAlign: 'center' }}>
                    <span style={{
                      padding: '0.25em 0.75em',
                      borderRadius: '1em',
                      fontSize: '0.85em',
                      backgroundColor: user.brokerStatus === 'ACTIVE' ? '#43e97b33' :
                                     user.brokerStatus === 'INACTIVE' ? '#ff444433' : '#ffa50033',
                      color: user.brokerStatus === 'ACTIVE' ? '#43e97b' :
                             user.brokerStatus === 'INACTIVE' ? '#ff4444' : '#ffa500'
                    }}>
                      {user.brokerStatus.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 