import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboardStats, getAdminUsers } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTrades: 0,
    totalVolume: 0,
    totalProfitLoss: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('Fetching dashboard data...');
        
        // Fetch dashboard statistics
        const statsResponse = await getAdminDashboardStats();
        console.log('Dashboard stats response:', statsResponse);
        
        let statsData;
        if (statsResponse && statsResponse.success && statsResponse.data) {
          statsData = statsResponse.data;
        } else if (statsResponse && statsResponse.stats) {
          statsData = statsResponse.stats;
        } else {
          statsData = statsResponse;
        }
        
        console.log('Processed stats data:', statsData);
        
        if (statsData) {
          setStats({
            totalUsers: statsData.totalUsers || 0,
            activeUsers: statsData.activeUsers || 0,
            totalTrades: statsData.totalTrades || 0,
            totalVolume: statsData.totalVolume || 0,
            totalProfitLoss: statsData.totalProfitLoss || 0
          });
        }

        // Fetch real user data from API
        try {
          const usersResponse = await getAdminUsers();
          console.log('Users response:', usersResponse);
          
          if (usersResponse && usersResponse.data) {
            setUsers(usersResponse.data);
          } else {
            setUsers([]);
          }
        } catch (userError) {
          console.error('Error fetching users:', userError);
          setUsers([]);
        }
        
        console.log('Dashboard data loaded successfully');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Refresh data every 10 minutes
    const interval = setInterval(fetchDashboardData, 600000);
    return () => clearInterval(interval);
  }, [currentUser]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2em' }}>
        <div className="loading-spinner" />
        <p style={{ color: '#2c3e50', marginTop: '1em', fontSize: 'clamp(14px, 2.5vw, 16px)' }}>
          Loading dashboard data...
        </p>
      </div>
    );
  }

  // Calculate derived statistics
  // const activeUsers = users.filter(user => user.is_active_for_trading).length;
  // const connectedUsers = users.filter(user => user.is_broker_connected).length;
  const totalUsers = users.length;

  return (
    <div style={{ 
      padding: 'clamp(1em, 3vw, 2em)', 
      background: '#ffffff', 
      minHeight: '100vh',
      maxWidth: 1200,
      margin: '0 auto'
    }}>
      <h1 style={{ 
        color: '#2c3e50', 
        marginBottom: '1.5em', 
        fontWeight: 600, 
        fontSize: 'clamp(1.8em, 4vw, 2.5em)' 
      }}>
        Admin Dashboard
      </h1>

      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '1em', 
          borderRadius: '8px', 
          marginBottom: '2em',
          border: '1px solid #f5c6cb',
          fontSize: 'clamp(12px, 2.5vw, 14px)'
        }}>
          {error}
        </div>
      )}

      {/* Quick Actions */}
      <div style={{ 
        background: '#ffffff', 
        padding: 'clamp(1em, 3vw, 1.5em)', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
        border: '1px solid #e0e0e0',
        marginBottom: '2em'
      }}>
        <h3 style={{ 
          color: '#2c3e50', 
          marginBottom: '1em', 
          fontSize: 'clamp(1.2em, 3vw, 1.4em)',
          fontWeight: 600
        }}>
          Quick Actions
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1em' 
        }}>
          <Link to="/admin/users" style={{
            background: '#007bff',
            color: '#ffffff',
            padding: '0.8em 1.2em',
            borderRadius: '6px',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            transition: 'background-color 0.2s'
          }}>
            Manage Users
          </Link>
          <Link to="/admin/trades" style={{
            background: '#28a745',
            color: '#ffffff',
            padding: '0.8em 1.2em',
            borderRadius: '6px',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            transition: 'background-color 0.2s'
          }}>
            View Trades
          </Link>
          <Link to="/admin/logs" style={{
            background: '#6c757d',
            color: '#ffffff',
            padding: '0.8em 1.2em',
            borderRadius: '6px',
            textDecoration: 'none',
            textAlign: 'center',
            fontWeight: 600,
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            transition: 'background-color 0.2s'
          }}>
            System Logs
          </Link>
        </div>
      </div>

      {/* Recent Users */}
      <div style={{ 
        background: '#ffffff', 
        padding: 'clamp(1em, 3vw, 1.5em)', 
        borderRadius: '8px', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
        border: '1px solid #e0e0e0' 
      }}>
        <h3 style={{ 
          color: '#2c3e50', 
          marginBottom: '1em', 
          fontSize: 'clamp(1.2em, 3vw, 1.4em)',
          fontWeight: 600
        }}>
          Recent Users
        </h3>
        {users.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: 'clamp(11px, 2.2vw, 13px)'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ 
                    padding: '0.8em', 
                    textAlign: 'left', 
                    color: '#2c3e50',
                    fontWeight: 600
                  }}>
                    Name
                  </th>
                  <th style={{ 
                    padding: '0.8em', 
                    textAlign: 'left', 
                    color: '#2c3e50',
                    fontWeight: 600
                  }}>
                    Email
                  </th>
                  <th style={{ 
                    padding: '0.8em', 
                    textAlign: 'center', 
                    color: '#2c3e50',
                    fontWeight: 600
                  }}>
                    Status
                  </th>
                  <th style={{ 
                    padding: '0.8em', 
                    textAlign: 'center', 
                    color: '#2c3e50',
                    fontWeight: 600
                  }}>
                    Broker
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map((user, index) => (
                  <tr key={user.id} style={{ 
                    borderBottom: '1px solid #e0e0e0',
                    background: index % 2 === 0 ? '#ffffff' : '#f8f9fa'
                  }}>
                    <td style={{ 
                      padding: '0.8em', 
                      color: '#2c3e50',
                      fontWeight: 500
                    }}>
                      {user.name}
                    </td>
                    <td style={{ 
                      padding: '0.8em', 
                      color: '#2c3e50'
                    }}>
                      {user.email}
                    </td>
                    <td style={{ 
                      padding: '0.8em', 
                      textAlign: 'center'
                    }}>
                      <span style={{
                        padding: '0.3em 0.6em',
                        borderRadius: '4px',
                        fontSize: 'clamp(10px, 2vw, 11px)',
                        fontWeight: 500,
                        background: user.is_active_for_trading ? '#d4edda' : '#f8d7da',
                        color: user.is_active_for_trading ? '#155724' : '#721c24'
                      }}>
                        {user.is_active_for_trading ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '0.8em', 
                      textAlign: 'center'
                    }}>
                      <span style={{
                        padding: '0.3em 0.6em',
                        borderRadius: '4px',
                        fontSize: 'clamp(10px, 2vw, 11px)',
                        fontWeight: 500,
                        background: user.is_broker_connected ? '#d4edda' : '#f8d7da',
                        color: user.is_broker_connected ? '#155724' : '#721c24'
                      }}>
                        {user.is_broker_connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ 
            color: '#6c757d', 
            textAlign: 'center',
            fontSize: 'clamp(12px, 2.5vw, 14px)'
          }}>
            No users found
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 