import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BarChart3, 
  CheckCircle,
  AlertCircle,
  Search,
  User,
  Mail,
  Phone,
  Building
} from 'lucide-react';
import { getAdminDashboardStats, getAdminUsers, exitTrade } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import { getDematLimit, fetchMyBrokerProfile } from '../../api/auth';

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState([]);
  const [tradesLoading, setTradesLoading] = useState(false);

  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminProfile, setAdminProfile] = useState(null);
  const [brokerProfile, setBrokerProfile] = useState(null);
  const [dematLimit, setDematLimit] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTrades: 0,
    totalVolume: 0,
    totalProfitLoss: 0,

  });
  
  // Real-time monitoring state
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const realTimeIntervals = useRef({});

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to refresh broker profile data
  const refreshBrokerProfile = async () => {
    try {
      const brokerData = await fetchMyBrokerProfile();
      console.log('Refreshed broker profile response:', brokerData);
      
      if (brokerData && brokerData.success && brokerData.data) {
        // Check if broker is actually connected by looking for broker credentials
        if (brokerData.data && (
          brokerData.data.broker_name || 
          brokerData.data.brokerName || 
          brokerData.data.broker_client_id || 
          brokerData.data.account_id ||
          brokerData.data.broker
        )) {
          console.log('Setting broker profile as connected:', brokerData.data);
          setBrokerProfile(brokerData.data);
          
          // Fetch RMS limit if broker is connected
          try {
            const dematRes = await getDematLimit();
            console.log('Demat limit response:', dematRes);
            if (dematRes && dematRes.data) {
              setDematLimit(dematRes.data);
            } else if (dematRes && dematRes.rms_limit) {
              setDematLimit(dematRes);
            }
          } catch (dematError) {
            console.error('Error fetching RMS limit:', dematError);
            setDematLimit({ rms_limit: 'N/A' });
          }
        } else {
          console.log('Broker profile not found or invalid response structure');
          setBrokerProfile(null);
          setDematLimit(null);
        }
      } else {
        console.log('Broker profile API returned error or no data');
        setBrokerProfile(null);
        setDematLimit(null);
      }
    } catch (brokerError) {
      console.log('Error refreshing broker profile:', brokerError);
      setBrokerProfile(null);
      setDematLimit(null);
    }
  };

  // Function to fetch trades
  const fetchTrades = async () => {
    try {
      setTradesLoading(true);
      const response = await fetch('https://y9tyscpumt.us-east-1.awsapprunner.com/api/admin/trades', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const tradesData = await response.json();
        console.log('Trades data response:', tradesData);
        
        if (tradesData && Array.isArray(tradesData)) {
          setTrades(tradesData);
        } else if (tradesData && Array.isArray(tradesData.data)) {
          setTrades(tradesData.data);
        } else {
          setTrades([]);
        }
      } else {
        console.log('Failed to fetch trades:', response.status);
        setTrades([]);
      }
    } catch (tradesError) {
      console.error('Error fetching trades:', tradesError);
      setTrades([]);
    } finally {
      setTradesLoading(false);
    }
  };

  // Function to handle exit trade
  const handleExitTrade = async (tradeId) => {
    try {
      console.log(`Initiating exit for trade: ${tradeId}`);
      
      // Show confirmation dialog
      if (!window.confirm('Are you sure you want to exit this trade? This will initiate a market sell order for all participating users.')) {
        return;
      }
      
      const response = await exitTrade(tradeId);
      console.log('Exit trade response:', response);
      
      if (response.success) {
        alert(`Exit process initiated successfully! Job ID: ${response.data?.jobId || 'N/A'}\n\n${response.message}`);
        
        // Immediate refresh of trades for real-time update
        await fetchTrades();
        
        // Set up real-time monitoring for this trade
        startRealTimeMonitoring(tradeId);
        
        // Show success notification
        setNotification({
          type: 'success',
          message: `Exit process initiated successfully! Job ID: ${response.data?.jobId || 'N/A'}`,
          show: true
        });
      } else {
        alert(`Exit failed: ${response.message || 'Unknown error'}`);
        setNotification({
          type: 'error',
          message: `Exit failed: ${response.message || 'Unknown error'}`,
          show: true
        });
      }
    } catch (exitError) {
      console.error('Error exiting trade:', exitError);
      const errorMessage = exitError.response?.data?.message || exitError.message || 'Failed to exit trade';
      alert(`Exit failed: ${errorMessage}`);
      setNotification({
        type: 'error',
        message: `Exit failed: ${errorMessage}`,
        show: true
      });
    }
  };

  // Real-time monitoring for exit trades
  const startRealTimeMonitoring = (tradeId) => {
    // Clear any existing monitoring for this trade
    if (realTimeIntervals.current[tradeId]) {
      clearInterval(realTimeIntervals.current[tradeId]);
    }
    
    // Set up frequent monitoring for the first 5 minutes after exit
    realTimeIntervals.current[tradeId] = setInterval(async () => {
      try {
        console.log(`Real-time monitoring: Checking status for trade ${tradeId}`);
        await fetchTrades(); // Refresh trades to get latest status
        
        // Check if trade status has changed to indicate exit completion
        const currentTrade = trades.find(t => t.id === tradeId);
        if (currentTrade && currentTrade.status === 'EXITED') {
          console.log(`Trade ${tradeId} has been successfully exited`);
          clearInterval(realTimeIntervals.current[tradeId]);
          delete realTimeIntervals.current[tradeId];
          
          // Show completion notification
          setNotification({
            type: 'success',
            message: `Trade ${tradeId} has been successfully exited!`,
            show: true
          });
        }
      } catch (error) {
        console.error(`Error in real-time monitoring for trade ${tradeId}:`, error);
      }
    }, 10000); // Check every 10 seconds for the first 5 minutes
    
    // Clear monitoring after 5 minutes to prevent excessive API calls
    setTimeout(() => {
      if (realTimeIntervals.current[tradeId]) {
        clearInterval(realTimeIntervals.current[tradeId]);
        delete realTimeIntervals.current[tradeId];
        console.log(`Real-time monitoring stopped for trade ${tradeId}`);
      }
    }, 300000); // 5 minutes
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('Fetching dashboard data...');
        
        // Set admin profile from current user
        if (currentUser) {
          setAdminProfile({
            name: currentUser.name || 'Admin User',
            fullName: currentUser.fullName || currentUser.name || 'Admin User',
            email: currentUser.email || 'admin@example.com',
            phone: currentUser.phone || 'N/A'
          });
        }
        
        // Fetch P&L data
        
        try {
          const pnlRes = await fetch('https://y9tyscpumt.us-east-1.awsapprunner.com/api/admin/trades/pnl/all-trades', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (pnlRes.ok) {
            const pnlData = await pnlRes.json();
            console.log('P&L data response:', pnlData);
            
            if (pnlData && Array.isArray(pnlData)) {
              // Calculate total P&L
              const totalPnL = pnlData.reduce((sum, trade) => {
                const profitLoss = parseFloat(trade.profit_loss) || 0;
                return sum + profitLoss;
              }, 0);
              
              // Calculate total volume
              const totalVolume = pnlData.reduce((sum, trade) => {
                const volume = parseFloat(trade.volume) || parseFloat(trade.quantity) || 0;
                return sum + volume;
              }, 0);
              
              // Update stats with P&L data
                                      setStats(prev => ({
                          ...prev,
                          totalTrades: pnlData.length,
                          totalVolume: totalVolume,
                          totalProfitLoss: totalPnL
                        }));
            }
          } else {
            console.log('Failed to fetch P&L data:', pnlRes.status);
          }
        } catch (pnlError) {
          console.error('Error fetching P&L data:', pnlError);
        }
        
        // Fetch broker profile if available
        try {
          // Use the proper API function instead of direct fetch
          const brokerData = await fetchMyBrokerProfile();
          console.log('Broker profile response:', brokerData);
          
          if (brokerData && brokerData.success && brokerData.data) {
            // Check if broker is actually connected by looking for broker credentials
            // Only consider it connected if the data indicates an active connection
            if (brokerData.data && (
              brokerData.data.broker_name || 
              brokerData.data.brokerName || 
              brokerData.data.broker_client_id || 
              brokerData.data.account_id ||
              brokerData.data.broker
            ) && brokerData.data.is_broker_connected !== false) {
              console.log('Setting broker profile as connected:', brokerData.data);
              setBrokerProfile(brokerData.data);
              
              // Fetch RMS limit if broker is connected
              try {
                const dematRes = await getDematLimit();
                console.log('Demat limit response:', dematRes);
                if (dematRes && dematRes.data) {
                  setDematLimit(dematRes.data);
                } else if (dematRes && dematRes.rms_limit) {
                  setDematLimit(dematRes);
                }
              } catch (dematError) {
                console.error('Error fetching RMS limit:', dematError);
                // Set a default RMS limit if API fails
                setDematLimit({ rms_limit: 'N/A' });
              }
            } else {
              console.log('Broker profile not found or invalid response structure');
              setBrokerProfile(null);
            }
          } else {
            console.log('Broker profile API returned error or no data');
            setBrokerProfile(null);
          }
        } catch (brokerError) {
          console.log('No broker profile found for admin:', brokerError);
          setBrokerProfile(null);
        }
        
        // Fallback: Check if currentUser has broker connection info
        // Only consider it connected if is_broker_connected is explicitly true
        if (!brokerProfile && currentUser && currentUser.is_broker_connected === true && (
          currentUser.broker_name || 
          currentUser.broker || 
          currentUser.broker_client_id || 
          currentUser.account_id
        )) {
          console.log('Setting broker profile from currentUser data:', currentUser);
          setBrokerProfile({
            broker_name: currentUser.broker_name || currentUser.broker || 'Angel One',
            broker_client_id: currentUser.broker_client_id || currentUser.account_id || 'N/A',
            is_active_for_trading: currentUser.is_active_for_trading || false
          });
        }
        
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
        
        // Fetch trades
        await fetchTrades();
        
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
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchTrades(); // Also refresh trades separately
    }, 600000);
    
    // More frequent refresh when there are active real-time monitors
    const realTimeInterval = setInterval(() => {
      if (Object.keys(realTimeIntervals.current).length > 0) {
        console.log('Real-time refresh: Active monitors detected, refreshing trades...');
        fetchTrades();
      }
    }, 30000); // Refresh every 30 seconds when monitoring
    
    // Cleanup function for real-time monitoring
    return () => {
      clearInterval(interval);
      clearInterval(realTimeInterval);
      // Clear all real-time monitoring intervals
      Object.values(realTimeIntervals.current).forEach(intervalId => {
        clearInterval(intervalId);
      });
      realTimeIntervals.current = {};
    };
  }, [currentUser]);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ 
          textAlign: 'center', 
          padding: 'clamp(2em, 5vw, 4em)',
           background: 'var(--gradient-primary)',
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ 
        padding: 'clamp(1em, 3vw, 2em)', 
          background: 'var(--bg-primary)', 
        minHeight: '100vh',
          maxWidth: '1200px',
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
          <BarChart3 size={40} style={{ marginRight: '0.5em', verticalAlign: 'middle', color: 'var(--primary-color)' }} />
          {adminProfile?.fullName ? `${adminProfile.fullName}'s Dashboard` : 'Admin Dashboard'}
      </motion.h1>

      {/* Real-time Notification System */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              background: notification.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)',
              color: 'white',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 1000,
              maxWidth: '400px',
              wordWrap: 'break-word'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {notification.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span style={{ fontWeight: 500 }}>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification({ show: false, type: '', message: '' })}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ 
              background: 'var(--danger-color)', 
              color: '#ffffff', 
              padding: '1em', 
              borderRadius: '12px', 
              marginBottom: '2em',
              border: 'none',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              boxShadow: 'var(--shadow-md)',
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

        {/* Admin Profile and Broker Profile Section - Side by Side */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: 'clamp(1.5em, 4vw, 2em)',
          marginBottom: '2em'
        }}
        >
          {/* Admin Profile Section */}
          <div style={{
            background: 'var(--bg-card)',
            padding: 'clamp(1.2em, 3vw, 1.5em)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-primary)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.boxShadow = 'var(--shadow-lg)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'var(--shadow-md)';
          }}
      >
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ 
            color: 'var(--text-primary)', 
            marginBottom: '1.5em', 
                fontSize: 'clamp(1.1em, 3vw, 1.3em)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}
        >
              <User size={20} />
              Admin Profile
        </motion.h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1em, 2.5vw, 1.5em)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8em' }}>
                <Mail size={20} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-muted)', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Email:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                  {adminProfile?.email || 'N/A'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8em' }}>
                <Phone size={20} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-muted)', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Phone:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                  {adminProfile?.phone || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Broker Profile Section */}
        <div style={{ 
            background: 'var(--bg-card)',
            padding: 'clamp(1.2em, 3vw, 1.5em)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-primary)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-4px)';
            e.target.style.boxShadow = 'var(--shadow-lg)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'var(--shadow-md)';
          }}
          >
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{
                color: 'var(--text-primary)',
                marginBottom: '1.5em',
                fontSize: 'clamp(1.1em, 3vw, 1.3em)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5em',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                <Building size={20} />
                Broker Profile
              </div>
              <button
                onClick={refreshBrokerProfile}
                style={{
                  background: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5em 1em',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--primary-dark)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--primary-color)';
                }}
              >
                🔄 Refresh
              </button>
            </motion.h3>
            
            {brokerProfile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1em, 2.5vw, 1.5em)' }}>
                <div style={{
                  background: 'rgba(37, 99, 235, 0.1)',
                  padding: 'clamp(0.8em, 2vw, 1em)',
                  borderRadius: '8px',
                  border: '1px solid rgba(37, 99, 235, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8em' }}>
                    <Building size={20} color="var(--primary-color)" />
                    <span style={{ color: 'var(--text-muted)', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Broker:</span>
                    <div style={{ color: 'var(--primary-color)' }}>{brokerProfile.broker_name || brokerProfile.brokerName || 'N/A'}</div>
                  </div>
                </div>
                <div style={{
                  background: 'rgba(37, 99, 235, 0.1)',
                  padding: 'clamp(0.8em, 2vw, 1em)',
                  borderRadius: '8px',
                  border: '1px solid rgba(37, 99, 235, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8em' }}>
                    <CheckCircle size={20} color="var(--primary-color)" />
                    <span style={{ color: 'var(--text-muted)', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Status:</span>
                    <div style={{ color: 'var(--primary-color)' }}>Connected</div>
                  </div>
                </div>
                
                                 <div style={{
                   background: 'rgba(37, 99, 235, 0.1)',
                   padding: 'clamp(0.8em, 2vw, 1em)',
                   borderRadius: '8px',
                   border: '1px solid rgba(37, 99, 235, 0.2)'
                 }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.8em' }}>
                     <CheckCircle size={20} color={brokerProfile.is_active_for_trading ? "var(--success-color)" : "var(--warning-color)"} />
                     <span style={{ color: 'var(--text-muted)', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Trading:</span>
                     <div style={{ color: brokerProfile.is_active_for_trading ? "var(--success-color)" : "var(--warning-color)" }}>
                       {brokerProfile.is_active_for_trading ? 'Active' : 'Inactive'}
                     </div>
                   </div>
                 </div>
                                 {dematLimit && (
                   <div style={{
                     background: 'rgba(37, 99, 235, 0.1)',
                     padding: 'clamp(0.8em, 2vw, 1em)',
                     borderRadius: '8px',
                     border: '1px solid rgba(37, 99, 235, 0.2)'
                   }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.8em' }}>
                       <BarChart3 size={20} color="var(--primary-color)" />
                       <span style={{ color: 'var(--text-muted)', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>RMS Limit:</span>
                       <div style={{ color: 'var(--primary-color)' }}>₹{dematLimit.rms_limit?.toLocaleString() || 'N/A'}</div>
                     </div>
                   </div>
                 )}
              </div>
            ) : (
                             <div style={{
                 background: 'rgba(107, 114, 128, 0.1)',
                 padding: 'clamp(0.8em, 2vw, 1em)',
                 borderRadius: '8px',
                 border: '1px solid rgba(107, 114, 128, 0.2)',
                 textAlign: 'center'
               }}>
                 <div style={{ color: 'var(--text-muted)', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                   No broker account connected
                 </div>
               </div>
            )}
          </div>
          </motion.div>
          
        {/* Overview Stats */}
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            background: 'var(--bg-card)',
            padding: 'clamp(1.2em, 3vw, 1.5em)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-primary)',
            marginBottom: '2em'
          }}
        >
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              color: 'var(--text-primary)',
              marginBottom: '1.5em',
              fontSize: 'clamp(1.1em, 3vw, 1.3em)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}
          >
            <BarChart3 size={20} />
            Overview Stats
          </motion.h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 'clamp(1em, 2.5vw, 1.5em)',
            '@media (max-width: 768px)': {
              gridTemplateColumns: 'repeat(2, 1fr)'
            },
            '@media (max-width: 480px)': {
              gridTemplateColumns: '1fr'
            }
          }}>
            <div style={{
              background: 'var(--bg-secondary)',
              padding: 'clamp(1em, 2.5vw, 1.2em)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = 'var(--shadow-md)';
              e.target.style.borderColor = 'var(--primary-color)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'var(--border-primary)';
            }}
            >
              <div style={{ fontSize: 'clamp(1.2em, 3vw, 1.5em)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3em' }}>{stats.totalUsers}</div>
              <div style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', color: 'var(--text-muted)' }}>Total Users</div>
            </div>
            <div style={{
              background: 'var(--bg-secondary)',
              padding: 'clamp(1em, 2.5vw, 1.2em)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = 'var(--shadow-md)';
              e.target.style.borderColor = 'var(--primary-color)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'var(--border-primary)';
            }}
            >
              <div style={{ fontSize: 'clamp(1.2em, 3vw, 1.5em)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3em' }}>{stats.activeUsers}</div>
              <div style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', color: 'var(--text-muted)' }}>Active Users</div>
            </div>
            <div style={{
              background: 'var(--bg-secondary)',
              padding: 'clamp(1em, 2.5vw, 1.2em)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = 'var(--shadow-md)';
              e.target.style.borderColor = 'var(--primary-color)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'var(--border-primary)';
            }}
            >
              <div style={{ fontSize: 'clamp(1.2em, 3vw, 1.5em)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3em' }}>{stats.totalTrades}</div>
              <div style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', color: 'var(--text-muted)' }}>Total Trades</div>
            </div>
            <div style={{
              background: 'var(--bg-secondary)',
              padding: 'clamp(1em, 2.5vw, 1.2em)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = 'var(--shadow-md)';
              e.target.style.borderColor = 'var(--primary-color)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'var(--border-primary)';
            }}
            >
              <div style={{ fontSize: 'clamp(1.2em, 3vw, 1.5em)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3em' }}>₹{stats.totalVolume?.toLocaleString() || '0'}</div>
              <div style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', color: 'var(--text-muted)' }}>Total Volume</div>
            </div>
          </div>
          </motion.div>
          
        {/* P&L Overview */}
          <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{
            background: 'var(--bg-card)',
            padding: 'clamp(1.2em, 3vw, 1.5em)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-primary)',
            marginBottom: '2em'
          }}
        >
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            style={{
              color: 'var(--text-primary)',
              marginBottom: '1.5em',
              fontSize: 'clamp(1.1em, 3vw, 1.3em)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}
          >
            <BarChart3 size={20} />
            Profit & Loss Overview
          </motion.h3>
          
          {/* P&L Summary Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 'clamp(1em, 2.5vw, 1.5em)',
            marginBottom: '2em'
          }}>
            <div style={{
              background: 'var(--bg-secondary)',
              padding: 'clamp(1em, 2.5vw, 1.2em)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = 'var(--shadow-md)';
              e.target.style.borderColor = 'var(--primary-color)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'var(--border-primary)';
            }}
            >
              <div style={{ 
                fontSize: 'clamp(1.2em, 3vw, 1.5em)', 
              fontWeight: 600,
                color: stats.totalProfitLoss >= 0 ? 'var(--success-color)' : 'var(--danger-color)', 
                marginBottom: '0.3em' 
              }}>
                ₹{stats.totalProfitLoss?.toLocaleString() || '0'}
              </div>
              <div style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', color: 'var(--text-muted)' }}>Total P&L</div>
            </div>

            <div style={{
              background: 'var(--bg-secondary)',
              padding: 'clamp(1em, 2.5vw, 1.2em)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = 'var(--shadow-md)';
              e.target.style.borderColor = 'var(--primary-color)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.borderColor = 'var(--border-primary)';
            }}
            >
              <div style={{ 
                fontSize: 'clamp(1.2em, 3vw, 1.5em)', 
                fontWeight: 600, 
                color: 'var(--text-primary)', 
                marginBottom: '0.3em' 
              }}>
                ₹{stats.totalVolume?.toLocaleString() || '0'}
              </div>
              <div style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', color: 'var(--text-muted)' }}>Total Volume</div>
            </div>
          </div>

          {/* P&L Table */}
          <div style={{ marginTop: '2em' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1em',
              flexWrap: 'wrap',
              gap: '1em'
            }}>


            </div>

        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={{ 
          background: 'var(--bg-card)', 
          padding: 'clamp(1em, 2.5vw, 1.2em)', 
          borderRadius: 'var(--radius-lg)', 
          boxShadow: 'var(--shadow-md)', 
          border: '1px solid var(--border-primary)',
          marginBottom: '2em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8em',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = 'var(--shadow-lg)';
          e.target.style.borderColor = 'var(--primary-color)';
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = 'var(--shadow-md)';
          e.target.style.borderColor = 'var(--border-primary)';
        }}
      >
        <Search size={20} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search users..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            flex: 1, 
            border: 'none', 
            outline: 'none', 
            fontSize: 'clamp(13px, 2.8vw, 15px)', 
            color: 'var(--text-primary)'
          }}
        />
      </motion.div>

      {/* Recent Users */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        style={{ 
          background: 'var(--bg-card)', 
          padding: 'clamp(1.5em, 4vw, 2em)', 
          borderRadius: 'var(--radius-lg)', 
          boxShadow: 'var(--shadow-md)', 
          border: '1px solid var(--border-primary)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = 'var(--shadow-lg)';
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = 'var(--shadow-md)';
        }}
      >
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
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
        {filteredUsers.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ 
              display: 'none',
              '@media (max-width: 768px)': { display: 'block' },
              padding: '1em',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 'clamp(12px, 2.5vw, 14px)'
            }}>
              💡 Swipe left/right to view full table on mobile
            </div>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              color: 'var(--text-primary)',
              minWidth: '600px' // Ensure table doesn't get too cramped on mobile
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
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
                {filteredUsers.slice(0, 5).map((user, index) => (
                  <motion.tr 
                    key={user.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    style={{ 
                      borderBottom: '1px solid var(--border-primary)',
                      background: index % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                      transition: 'all 0.3s ease'
                    }}
                    whileHover={{
                       background: 'var(--bg-secondary)',
                       scale: 1.005
                    }}
                  >
                    <td style={{ 
                      padding: 'clamp(0.8em, 2vw, 1em)', 
                      color: 'var(--text-primary)',
                      fontWeight: 500
                    }}>
                      {user.name || user.fullname || user.full_name || user.first_name || 'N/A'}
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
                         whileHover={{ scale: 1.02 }}
                        style={{
                           padding: '0.3em 0.6em',
                           borderRadius: '16px',
                           fontSize: 'clamp(10px, 2vw, 11px)',
                           fontWeight: 500,
                          background: user.is_active_for_trading 
                             ? 'var(--success-color)' 
                             : 'var(--danger-color)',
                          color: '#ffffff',
                           boxShadow: 'var(--shadow-sm)',
                          display: 'inline-flex',
                          alignItems: 'center',
                           gap: '0.2em'
                        }}
                      >
                        {user.is_active_for_trading ? (
                          <>
                             <CheckCircle size={10} />
                            Active
                          </>
                        ) : (
                          <>
                             <AlertCircle size={10} />
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
                         whileHover={{ scale: 1.02 }}
                        style={{
                           padding: '0.3em 0.6em',
                           borderRadius: '16px',
                           fontSize: 'clamp(10px, 2vw, 11px)',
                           fontWeight: 500,
                          background: user.is_broker_connected 
                             ? 'var(--primary-color)' 
                             : 'var(--warning-color)',
                          color: '#ffffff',
                           boxShadow: 'var(--shadow-sm)',
                          display: 'inline-flex',
                          alignItems: 'center',
                           gap: '0.2em'
                        }}
                      >
                        {user.is_broker_connected ? (
                          <>
                             <CheckCircle size={10} />
                            Connected
                          </>
                        ) : (
                          <>
                             <AlertCircle size={10} />
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
               background: 'var(--bg-secondary)',
               borderRadius: 'var(--radius-lg)',
               border: '1px solid var(--border-primary)'
            }}
          >
            <Users size={48} color="var(--text-muted)" style={{ marginBottom: '1em' }} />
            <p style={{ 
              color: 'var(--text-primary)', 
              fontSize: 'clamp(14px, 3vw, 16px)',
              fontWeight: 500
            }}>
              {searchTerm ? 'No users found matching your search' : 'No users found'}
            </p>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              marginTop: '0.5em'
            }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Users will appear here once they register'}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Recent Trades with Exit Functionality */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        style={{ 
          background: 'var(--bg-card)', 
          padding: 'clamp(1.5em, 4vw, 2em)', 
          borderRadius: 'var(--radius-lg)', 
          boxShadow: 'var(--shadow-md)', 
          border: '1px solid var(--border-primary)',
          transition: 'all 0.3s ease',
          marginTop: '2em'
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = 'var(--shadow-lg)';
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = 'var(--shadow-md)';
        }}
      >
        <motion.h3 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          style={{ 
            color: 'var(--text-primary)', 
            marginBottom: '1.5em', 
            fontSize: 'clamp(1.3em, 3.5vw, 1.6em)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5em'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
            <BarChart3 size={24} />
            Recent Trades
            {Object.keys(realTimeIntervals.current).length > 0 && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3em',
                  padding: '0.2em 0.6em',
                  background: 'var(--warning-color)',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: 'clamp(10px, 2vw, 11px)',
                  fontWeight: 500
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  style={{
                    width: '12px',
                    height: '12px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%'
                  }}
                />
                Live
              </motion.div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchTrades}
            disabled={tradesLoading}
            style={{
              padding: '0.5em 1em',
              borderRadius: '8px',
              fontSize: 'clamp(11px, 2.2vw, 12px)',
              fontWeight: 500,
              background: 'var(--primary-color)',
              color: '#ffffff',
              border: 'none',
              cursor: tradesLoading ? 'not-allowed' : 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.3s ease',
              opacity: tradesLoading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!tradesLoading) {
                e.target.style.background = 'var(--primary-color-dark)';
                e.target.style.boxShadow = 'var(--shadow-md)';
              }
            }}
            onMouseLeave={(e) => {
              if (!tradesLoading) {
                e.target.style.background = 'var(--primary-color)';
                e.target.style.boxShadow = 'var(--shadow-sm)';
              }
            }}
          >
            {tradesLoading ? 'Refreshing...' : 'Refresh'}
          </motion.button>
        </motion.h3>
        
        {tradesLoading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ 
              textAlign: 'center',
              padding: '2em',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-primary)'
            }}
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              style={{
                width: 40,
                height: 40,
                border: '3px solid var(--border-primary)',
                borderTop: '3px solid var(--primary-color)',
                borderRadius: '50%',
                margin: '0 auto 1em'
              }}
            />
            <p style={{ 
              color: 'var(--text-primary)', 
              fontSize: 'clamp(14px, 3vw, 16px)',
              fontWeight: 500
            }}>
              Loading trades...
            </p>
          </motion.div>
        ) : trades.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ 
              display: 'none',
              '@media (max-width: 768px)': { display: 'block' },
              padding: '1em',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 'clamp(12px, 2.5vw, 14px)'
            }}>
              💡 Swipe left/right to view full table on mobile
            </div>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              color: 'var(--text-primary)',
              minWidth: '800px' // Ensure table doesn't get too cramped on mobile
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                  <th style={{ 
                    padding: 'clamp(0.8em, 2vw, 1em)', 
                    textAlign: 'left', 
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: 'clamp(13px, 2.8vw, 15px)'
                  }}>
                    Symbol
                  </th>
                  <th style={{ 
                    padding: 'clamp(0.8em, 2vw, 1em)', 
                    textAlign: 'center', 
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: 'clamp(13px, 2.8vw, 15px)'
                  }}>
                    Type
                  </th>
                  <th style={{ 
                    padding: 'clamp(0.8em, 2vw, 1em)', 
                    textAlign: 'center', 
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: 'clamp(13px, 2.8vw, 15px)'
                  }}>
                    Quantity
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
                    Date
                  </th>
                  <th style={{ 
                    padding: 'clamp(0.8em, 2vw, 1em)', 
                    textAlign: 'center', 
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: 'clamp(13px, 2.8vw, 15px)'
                  }}>
                    Monitor
                  </th>
                  <th style={{ 
                    padding: 'clamp(0.8em, 2vw, 1em)', 
                    textAlign: 'center', 
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: 'clamp(13px, 2.8vw, 15px)'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {trades.slice(0, 10).map((trade, index) => (
                  <motion.tr 
                    key={trade.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    style={{ 
                      borderBottom: '1px solid var(--border-primary)',
                      background: index % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                      transition: 'all 0.3s ease'
                    }}
                    whileHover={{
                       background: 'var(--bg-secondary)',
                       scale: 1.005
                    }}
                  >
                    <td style={{ 
                      padding: 'clamp(0.8em, 2vw, 1em)', 
                      color: 'var(--text-primary)',
                      fontWeight: 500
                    }}>
                      {trade.trading_symbol || trade.symbol || 'N/A'}
                    </td>
                    <td style={{ 
                      padding: 'clamp(0.8em, 2vw, 1em)', 
                      textAlign: 'center'
                    }}>
                      <motion.span 
                         whileHover={{ scale: 1.02 }}
                        style={{
                           padding: '0.3em 0.6em',
                           borderRadius: '16px',
                           fontSize: 'clamp(10px, 2vw, 11px)',
                           fontWeight: 500,
                          background: trade.transaction_type === 'BUY' 
                             ? 'var(--success-color)' 
                             : 'var(--danger-color)',
                          color: '#ffffff',
                           boxShadow: 'var(--shadow-sm)',
                          display: 'inline-flex',
                          alignItems: 'center',
                           gap: '0.2em'
                        }}
                      >
                        {trade.transaction_type || 'N/A'}
                      </motion.span>
                    </td>
                    <td style={{ 
                      padding: 'clamp(0.8em, 2vw, 1em)', 
                      textAlign: 'center',
                      color: 'var(--text-primary)',
                      fontWeight: 500
                    }}>
                      {trade.quantity || 'N/A'}
                    </td>
                    <td style={{ 
                      padding: 'clamp(0.8em, 2vw, 1em)', 
                      textAlign: 'center'
                    }}>
                      <motion.span 
                         whileHover={{ scale: 1.02 }}
                        style={{
                           padding: '0.3em 0.6em',
                           borderRadius: '16px',
                           fontSize: 'clamp(10px, 2vw, 11px)',
                           fontWeight: 500,
                          background: realTimeIntervals.current[trade.id] 
                            ? 'var(--warning-color)'
                            : trade.status === 'COMPLETED' 
                             ? 'var(--success-color)' 
                             : trade.status === 'PENDING' 
                             ? 'var(--warning-color)'
                             : 'var(--text-muted)',
                          color: '#ffffff',
                           boxShadow: 'var(--shadow-sm)',
                          display: 'inline-flex',
                          alignItems: 'center',
                           gap: '0.2em'
                        }}
                      >
                        {realTimeIntervals.current[trade.id] ? 'EXITING' : trade.status || 'N/A'}
                        {realTimeIntervals.current[trade.id] && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            style={{
                              width: '12px',
                              height: '12px',
                              border: '2px solid rgba(255, 255, 255, 0.8)',
                              borderTop: '2px solid transparent',
                              borderRadius: '50%',
                              marginLeft: '0.3em'
                            }}
                          />
                        )}
                      </motion.span>
                    </td>
                    <td style={{ 
                      padding: 'clamp(0.8em, 2vw, 1em)', 
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                      fontSize: 'clamp(11px, 2.2vw, 12px)'
                    }}>
                      {trade.created_at ? new Date(trade.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ 
                      padding: 'clamp(0.8em, 2vw, 1em)', 
                      textAlign: 'center'
                    }}>
                      {realTimeIntervals.current[trade.id] && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid var(--warning-color)',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            margin: '0 auto'
                          }}
                          title="Real-time monitoring active"
                        />
                      )}
                    </td>
                    <td style={{ 
                      padding: 'clamp(0.8em, 2vw, 1em)', 
                      textAlign: 'center'
                    }}>
                      {trade.transaction_type === 'BUY' && trade.status === 'COMPLETED' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleExitTrade(trade.id)}
                          disabled={realTimeIntervals.current[trade.id]}
                          style={{
                            padding: '0.5em 1em',
                            borderRadius: '8px',
                            fontSize: 'clamp(10px, 2vw, 11px)',
                            fontWeight: 500,
                            background: realTimeIntervals.current[trade.id] ? 'var(--warning-color)' : 'var(--danger-color)',
                            color: '#ffffff',
                            border: 'none',
                            cursor: realTimeIntervals.current[trade.id] ? 'not-allowed' : 'pointer',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'all 0.3s ease',
                            opacity: realTimeIntervals.current[trade.id] ? 0.7 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (!realTimeIntervals.current[trade.id]) {
                              e.target.style.background = 'var(--danger-color-dark)';
                              e.target.style.boxShadow = 'var(--shadow-md)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!realTimeIntervals.current[trade.id]) {
                              e.target.style.background = 'var(--danger-color)';
                              e.target.style.boxShadow = 'var(--shadow-sm)';
                            }
                          }}
                        >
                          {realTimeIntervals.current[trade.id] ? 'Exiting...' : 'Exit Trade'}
                        </motion.button>
                      )}
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
               background: 'var(--bg-secondary)',
               borderRadius: 'var(--radius-lg)',
               border: '1px solid var(--border-primary)'
            }}
          >
            <BarChart3 size={48} color="var(--text-muted)" style={{ marginBottom: '1em' }} />
            <p style={{ 
              color: 'var(--text-primary)', 
              fontSize: 'clamp(14px, 3vw, 16px)',
              fontWeight: 500
            }}>
              No trades found
            </p>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              marginTop: '0.5em'
            }}>
              Trades will appear here once they are initiated
            </p>
          </motion.div>
        )}
      </motion.div>

      

    </motion.div>
  );
};

export default AdminDashboard; 