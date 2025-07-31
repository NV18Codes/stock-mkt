import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Settings,
  Info,
  Trash2,
  Copy,
  ExternalLink
} from 'lucide-react';

const APIStatusDebugger = () => {
  const [apiStatus, setApiStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const endpoints = [
    { name: 'Authentication', url: 'https://apistocktrading-production.up.railway.app/api/auth/me', key: 'auth' },
    { name: 'User Profile', url: 'https://apistocktrading-production.up.railway.app/api/users/me/profile', key: 'profile' },
    { name: 'Admin Users', url: 'https://apistocktrading-production.up.railway.app/api/admin/users', key: 'adminUsers' },
    { name: 'Segments', url: 'https://apistocktrading-production.up.railway.app/api/admin/segments', key: 'segments' },
    { name: 'Broker Connection', url: 'https://apistocktrading-production.up.railway.app/api/users/me/broker/status', key: 'broker' },
    { name: 'Broker Trades', url: 'https://apistocktrading-production.up.railway.app/api/users/me/broker/trades', key: 'brokerTrades' },
    { name: 'Broker Order Book', url: 'https://apistocktrading-production.up.railway.app/api/users/me/broker/order-book', key: 'brokerOrderBook' },
    { name: 'Order Details', url: 'https://apistocktrading-production.up.railway.app/api/users/me/broker/orders/2257be49-d209-45e5-ae39-3f455d42996b', key: 'orderDetails' },
    { name: 'Market Data', url: 'https://apistocktrading-production.up.railway.app/api/trading/market-data', key: 'marketData' }
  ];

  const checkAPIStatus = async () => {
    setLoading(true);
    const newStatus = {};

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        newStatus[endpoint.key] = {
          status: response.status,
          available: response.ok,
          responseTime,
          timestamp: new Date().toISOString(),
          error: null
        };
      } catch (error) {
        newStatus[endpoint.key] = {
          status: 'NETWORK_ERROR',
          available: false,
          responseTime: null,
          timestamp: new Date().toISOString(),
          error: error.message
        };
      }
    }

    setApiStatus(newStatus);
    setLoading(false);
  };

  useEffect(() => {
    checkAPIStatus();
  }, []);

  const getStatusIcon = (status) => {
    if (status.available) {
      return <CheckCircle size={16} color="#00b894" />;
    } else if (status.status === 403) {
      return <AlertTriangle size={16} color="#fdcb6e" />;
    } else if (status.status === 404) {
      return <XCircle size={16} color="#ff6b6b" />;
    } else {
      return <WifiOff size={16} color="#ff6b6b" />;
    }
  };

  const getStatusColor = (status) => {
    if (status.available) {
      return 'linear-gradient(135deg, #00b894, #00a085)';
    } else if (status.status === 403) {
      return 'linear-gradient(135deg, #fdcb6e, #e17055)';
    } else if (status.status === 404) {
      return 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
    } else {
      return 'linear-gradient(135deg, #6c757d, #495057)';
    }
  };

  const getStatusText = (status) => {
    if (status.available) {
      return 'Available';
    } else if (status.status === 403) {
      return 'Unauthorized';
    } else if (status.status === 404) {
      return 'Not Found';
    } else {
      return 'Network Error';
    }
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const copyStatus = () => {
    const statusText = JSON.stringify(apiStatus, null, 2);
    navigator.clipboard.writeText(statusText);
  };

  const availableCount = Object.values(apiStatus).filter(status => status.available).length;
  const totalCount = endpoints.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: 'clamp(1.5em, 4vw, 2em)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}
    >
      <motion.div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5em',
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
          <Settings size={24} color="#ffffff" />
          <h3 style={{
            color: '#ffffff',
            margin: 0,
            fontWeight: 600,
            fontSize: 'clamp(1.2em, 3vw, 1.4em)'
          }}>
            API Status Debugger
          </h3>
        </div>
        
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <RefreshCw size={20} color="#ffffff" />
        </motion.div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1em',
          marginBottom: '1.5em'
        }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '1em',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div style={{ color: '#ffffff', fontSize: 'clamp(1.5em, 4vw, 2em)', fontWeight: 700 }}>
            {availableCount}/{totalCount}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
            Endpoints Available
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '1em',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div style={{ color: '#ffffff', fontSize: 'clamp(1.5em, 4vw, 2em)', fontWeight: 700 }}>
            {Math.round((availableCount / totalCount) * 100)}%
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
            Success Rate
          </div>
        </motion.div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        style={{
          display: 'flex',
          gap: '0.8em',
          marginBottom: '1.5em',
          flexWrap: 'wrap'
        }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={checkAPIStatus}
          disabled={loading}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '0.6em 1em',
            borderRadius: '8px',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw size={16} />
              </motion.div>
              Checking...
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              Refresh Status
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={clearToken}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '0.6em 1em',
            borderRadius: '8px',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}
        >
          <Trash2 size={16} />
          Clear Token
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={copyStatus}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '0.6em 1em',
            borderRadius: '8px',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}
        >
          <Copy size={16} />
          Copy Status
        </motion.button>
      </motion.div>

      {/* Detailed Status */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              display: 'grid',
              gap: '0.8em'
            }}>
              {endpoints.map((endpoint, index) => {
                const status = apiStatus[endpoint.key];
                return (
                  <motion.div
                    key={endpoint.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '1em',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: 'clamp(13px, 2.8vw, 15px)',
                        marginBottom: '0.3em'
                      }}>
                        {endpoint.name}
                      </div>
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: 'clamp(11px, 2.2vw, 12px)',
                        fontFamily: 'monospace'
                      }}>
                        {endpoint.url}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1em' }}>
                      {status && (
                        <>
                          <div style={{
                            background: getStatusColor(status),
                            padding: '0.4em 0.8em',
                            borderRadius: '20px',
                            fontSize: 'clamp(11px, 2.2vw, 12px)',
                            fontWeight: 600,
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3em'
                          }}>
                            {getStatusIcon(status)}
                            {getStatusText(status)}
                          </div>
                          
                          {status.responseTime && (
                            <div style={{
                              color: 'rgba(255, 255, 255, 0.8)',
                              fontSize: 'clamp(11px, 2.2vw, 12px)',
                              fontFamily: 'monospace'
                            }}>
                              {status.responseTime}ms
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        style={{
          marginTop: '1.5em',
          padding: '1em',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.8em' }}>
          <Info size={16} color="rgba(255, 255, 255, 0.8)" />
          <span style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: 600,
            fontSize: 'clamp(13px, 2.8vw, 15px)'
          }}>
            Recommendations
          </span>
        </div>
        
        <div style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          lineHeight: 1.5
        }}>
          {availableCount === 0 && (
            <p>• Check if the backend server is running</p>
          )}
          {Object.values(apiStatus).some(s => s.status === 403) && (
            <p>• Clear authentication token and try again</p>
          )}
          {Object.values(apiStatus).some(s => s.status === 404) && (
            <p>• Some endpoints may not be implemented yet (using fallback data)</p>
          )}
          {availableCount > 0 && availableCount < totalCount && (
            <p>• Some endpoints are working, others may need backend implementation</p>
          )}
          {availableCount === totalCount && (
            <p>• All endpoints are working correctly! 🎉</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default APIStatusDebugger; 