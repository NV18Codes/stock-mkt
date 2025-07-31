import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign, 
  BarChart3, 
  Settings,
  Eye,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { getAdminDashboardStats, getAdminUsers } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import APIStatusDebugger from '../common/APIStatusDebugger';

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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ 
          textAlign: 'center', 
          padding: 'clamp(2em, 5vw, 4em)',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: 60,
            height: 60,
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid #ffffff',
            borderRadius: '50%',
            marginBottom: '2em'
          }}
        />
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ 
            color: '#ffffff', 
            marginTop: '1em', 
            fontSize: 'clamp(16px, 3vw, 18px)',
            fontWeight: 500
          }}
        >
          Loading dashboard data...
        </motion.p>
      </motion.div>
    );
  }

  // Calculate derived statistics
  // const activeUsers = users.filter(user => user.is_active_for_trading).length;
  // const connectedUsers = users.filter(user => user.is_broker_connected).length;
  const totalUsers = users.length;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ 
        padding: 'clamp(1em, 3vw, 2em)', 
        background: 'var(--background-color)', 
        minHeight: '100vh',
        maxWidth: 1200,
        margin: '0 auto'
      }}
    >
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{ 
          color: 'var(--text-primary)', 
          marginBottom: '2em', 
          fontWeight: 700, 
          fontSize: 'clamp(1.8em, 4vw, 2.5em)',
          textAlign: 'center',
          letterSpacing: '-0.025em'
        }}
      >
        <BarChart3 size={40} style={{ marginRight: '0.5em', verticalAlign: 'middle' }} />
        Admin Dashboard
      </motion.h1>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ 
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)', 
              color: '#ffffff', 
              padding: '1em', 
              borderRadius: '12px', 
              marginBottom: '2em',
              border: 'none',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ 
          background: 'white', 
          padding: 'clamp(1.5em, 4vw, 2em)', 
          borderRadius: '12px', 
          boxShadow: 'var(--shadow-md)', 
          border: '1px solid var(--border-color)',
          marginBottom: '2em'
        }}
      >
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ 
            color: 'var(--text-primary)', 
            marginBottom: '1.5em', 
            fontSize: 'clamp(1.3em, 3.5vw, 1.6em)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}
        >
          <Settings size={24} />
          Quick Actions
        </motion.h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: 'clamp(1em, 2.5vw, 1.5em)' 
        }}>
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Link to="/admin-panel/user-management" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#ffffff',
              padding: 'clamp(1em, 2.5vw, 1.2em)',
              borderRadius: '12px',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: 'clamp(13px, 2.8vw, 15px)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5em',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}>
              <Users size={20} />
              Manage Users
              <ArrowRight size={16} />
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Link to="/admin-panel/trades" style={{
              background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
              color: '#ffffff',
              padding: 'clamp(1em, 2.5vw, 1.2em)',
              borderRadius: '12px',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: 'clamp(13px, 2.8vw, 15px)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5em',
              boxShadow: '0 4px 15px rgba(0, 184, 148, 0.3)'
            }}>
              <TrendingUp size={20} />
              View Trades
              <ArrowRight size={16} />
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Link to="/admin-panel/logs" style={{
              background: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
              color: '#ffffff',
              padding: 'clamp(1em, 2.5vw, 1.2em)',
              borderRadius: '12px',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: 'clamp(13px, 2.8vw, 15px)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5em',
              boxShadow: '0 4px 15px rgba(253, 203, 110, 0.3)'
            }}>
              <Activity size={20} />
              System Logs
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Recent Users */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{ 
          background: 'white', 
          padding: 'clamp(1.5em, 4vw, 2em)', 
          borderRadius: '12px', 
          boxShadow: 'var(--shadow-md)', 
          border: '1px solid var(--border-color)'
        }}
      >
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ 
            color: 'var(--text-primary)', 
            marginBottom: '1.5em', 
            fontSize: 'clamp(1.3em, 3.5vw, 1.6em)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}
        >
          <Users size={24} />
          Recent Users
        </motion.h3>
        {users.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              color: 'var(--text-primary)'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ 
                    padding: 'clamp(0.8em, 2vw, 1em)', 
                    textAlign: 'left', 
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: 'clamp(13px, 2.8vw, 15px)'
                  }}>
                    Name
                  </th>
                  <th style={{ 
                    padding: 'clamp(0.8em, 2vw, 1em)', 
                    textAlign: 'left', 
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: 'clamp(13px, 2.8vw, 15px)'
                  }}>
                    Email
                  </th>
                  <th style={{ 
                    padding: 'clamp(0.8em, 2vw, 1em)', 
                    textAlign: 'center', 
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: 'clamp(13px, 2.8vw, 15px)'
                  }}>
                    Status
                  </th>
                  <th style={{ 
                    padding: 'clamp(0.8em, 2vw, 1em)', 
                    textAlign: 'center', 
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: 'clamp(13px, 2.8vw, 15px)'
                  }}>
                    Broker
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map((user, index) => (
                  <motion.tr 
                    key={user.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    style={{ 
                      borderBottom: '1px solid var(--border-color)',
                      background: index % 2 === 0 ? 'white' : 'var(--background-color)',
                      transition: 'all 0.3s ease'
                    }}
                    whileHover={{
                      background: 'var(--background-color)',
                      scale: 1.01
                    }}
                  >
                    <td style={{ 
                      padding: 'clamp(0.8em, 2vw, 1em)', 
                      color: 'var(--text-primary)',
                      fontWeight: 500
                    }}>
                      {user.name}
                    </td>
                    <td style={{ 
                      padding: 'clamp(0.8em, 2vw, 1em)', 
                      color: 'var(--text-secondary)'
                    }}>
                      {user.email}
                    </td>
                    <td style={{ 
                      padding: 'clamp(0.8em, 2vw, 1em)', 
                      textAlign: 'center'
                    }}>
                      <motion.span 
                        whileHover={{ scale: 1.05 }}
                        style={{
                          padding: '0.4em 0.8em',
                          borderRadius: '20px',
                          fontSize: 'clamp(11px, 2.2vw, 12px)',
                          fontWeight: 600,
                          background: user.is_active_for_trading 
                            ? 'linear-gradient(135deg, #00b894, #00a085)' 
                            : 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                          color: '#ffffff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3em'
                        }}
                      >
                        {user.is_active_for_trading ? (
                          <>
                            <CheckCircle size={12} />
                            Active
                          </>
                        ) : (
                          <>
                            <AlertCircle size={12} />
                            Inactive
                          </>
                        )}
                      </motion.span>
                    </td>
                    <td style={{ 
                      padding: 'clamp(0.8em, 2vw, 1em)', 
                      textAlign: 'center'
                    }}>
                      <motion.span 
                        whileHover={{ scale: 1.05 }}
                        style={{
                          padding: '0.4em 0.8em',
                          borderRadius: '20px',
                          fontSize: 'clamp(11px, 2.2vw, 12px)',
                          fontWeight: 600,
                          background: user.is_broker_connected 
                            ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                            : 'linear-gradient(135deg, #fdcb6e, #e17055)',
                          color: '#ffffff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3em'
                        }}
                      >
                        {user.is_broker_connected ? (
                          <>
                            <CheckCircle size={12} />
                            Connected
                          </>
                        ) : (
                          <>
                            <AlertCircle size={12} />
                            Disconnected
                          </>
                        )}
                      </motion.span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ 
              textAlign: 'center',
              padding: '2em',
              background: 'var(--background-color)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}
          >
            <Users size={48} color="var(--text-muted)" style={{ marginBottom: '1em' }} />
            <p style={{ 
              color: 'var(--text-primary)', 
              fontSize: 'clamp(14px, 3vw, 16px)',
              fontWeight: 500
            }}>
              No users found
            </p>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              marginTop: '0.5em'
            }}>
              Users will appear here once they register
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* API Status Debugger */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        style={{ marginTop: '2em' }}
      >
        <APIStatusDebugger />
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard; 