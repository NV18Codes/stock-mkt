import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import {
  clearBrokerConnection
} from '../../api/auth';
import {
  fetchMyBrokerProfile,
  fetchBrokerConnectionStatus,
  getDematLimit
} from '../../api/auth';



const TradingPortal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [brokerProfile, setBrokerProfile] = useState(null);
  const [brokerConnection, setBrokerConnection] = useState({ is_connected: false, message: '' });
  const [rmsLimit, setRmsLimit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clearBrokerStatus, setClearBrokerStatus] = useState('');
  const [clearBrokerLoading, setClearBrokerLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [userTrades, setUserTrades] = useState([]);
  const [tradesLoading, setTradesLoading] = useState(false);

  useEffect(() => {
		const fetchAll = async () => {
			setLoading(true);
			setError('');
			try {
				// Broker profile
				const profile = await fetchMyBrokerProfile();
				const profileData = profile?.data || profile;
				setBrokerProfile(profileData || null);

				// Connection status
				const statusRes = await fetchBrokerConnectionStatus();
				const statusData = statusRes?.data || statusRes;
				setBrokerConnection({
					is_connected: !!(statusData?.is_connected || profileData?.is_active_for_trading),
					message: statusData?.message || ''
				});

				// RMS limit (may fallback gracefully if not connected)
				const rmsRes = await getDematLimit();
				setRmsLimit(rmsRes?.data || rmsRes);

				// Update last update time
				setLastUpdateTime(new Date());

				// Fetch user trades
				await fetchUserTrades();
				
			} catch (err) {
				console.error('Error loading dashboard data:', err);
				setError('Failed to load dashboard data. Please try again later.');
			} finally {
				setLoading(false);
			}
		};

		fetchAll();

		// Set up real-time refresh interval
		const intervalId = setInterval(async () => {
			try {
				console.log('🔄 Auto-refreshing user dashboard data...');
				
				// Refresh broker profile
				const profile = await fetchMyBrokerProfile();
				const profileData = profile?.data || profile;
				setBrokerProfile(profileData || null);

				// Refresh connection status
				const statusRes = await fetchBrokerConnectionStatus();
				const statusData = statusRes?.data || statusRes;
				setBrokerConnection({
					is_connected: !!(statusData?.is_connected || profileData?.is_active_for_trading),
					message: statusData?.message || ''
				});

				// Refresh RMS limit
				const rmsRes = await getDematLimit();
				setRmsLimit(rmsRes?.data || rmsRes);

				// Update last update time
				setLastUpdateTime(new Date());

				// Fetch user trades
				await fetchUserTrades();

				console.log('✅ Auto-refresh completed successfully');
			} catch (error) {
				console.log('⚠️ Auto-refresh failed, will retry on next interval:', error.message);
				// Don't show error in UI, just log to console
			}
		}, 30000); // 30 seconds

		// Cleanup interval on component unmount
		return () => clearInterval(intervalId);
  }, []);

  // Fetch user trades when component mounts
  useEffect(() => {
    fetchUserTrades();
  }, []);

  const handleClearBroker = async () => {
    setClearBrokerLoading(true);
    setClearBrokerStatus('');
    try {
      const result = await clearBrokerConnection();
      console.log('Clear broker result:', result);
      
      if (result && result.success) {
        setClearBrokerStatus('Broker connection cleared successfully');
        // Force a complete reset of all broker-related data
        setBrokerProfile(null);
        setBrokerConnection({ is_connected: false, message: '' });
        setRmsLimit(null);
        
        // Force a refresh of the component to show "Broker Not Connected" state
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setClearBrokerStatus('Failed to clear broker connection');
      }
    } catch (err) {
      console.error('Error clearing broker:', err);
      setClearBrokerStatus('Failed to clear broker connection');
    } finally {
      setClearBrokerLoading(false);
    }
  };



     // Fetch user trades from the correct API endpoint
   const fetchUserTrades = async () => {
     setTradesLoading(true);
     try {
       console.log('🔄 Fetching user trades from API...');
       
       // Get the auth token from localStorage
       const token = localStorage.getItem('token') || sessionStorage.getItem('token');
       if (!token) {
         console.warn('⚠️ No authentication token found, skipping user trades fetch');
         setUserTrades([]);
         return;
       }
       
       console.log('🔑 Using token:', token.substring(0, 20) + '...');
       
       const response = await fetch('https://v4fintechtradingapi-production.up.railway.app/api/users/me/broker/trades', {
         method: 'GET',
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json',
         },
       });
       
       console.log('📡 Response status:', response.status);
       console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
       
       if (!response.ok) {
         if (response.status === 401) {
           console.warn('⚠️ User not authenticated (401), clearing trades data');
           setUserTrades([]);
           return;
         }
         const errorText = await response.text();
         console.error('❌ HTTP error response:', errorText);
         throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
       }
       
       const data = await response.json();
       console.log('✅ User trades API response:', data);
       
       let tradesData = [];
       if (data && data.success && data.data && data.data.trades) {
         tradesData = data.data.trades;
       } else if (data && data.success && data.trades) {
         tradesData = data.trades;
       } else if (data && Array.isArray(data)) {
         tradesData = data;
       } else if (data && data.data && Array.isArray(data.data)) {
         tradesData = data.data;
       }
       
       console.log('📊 Setting user trades data:', tradesData);
       setUserTrades(tradesData || []);
     } catch (error) {
       console.error('❌ Error fetching user trades:', error);
       setUserTrades([]);
     } finally {
       setTradesLoading(false);
     }
   };

  // Manual refresh function
  const handleManualRefresh = async () => {
    try {
      console.log('🔄 Manual refresh initiated...');
      setLoading(true);
      
      // Refresh broker profile
      const profile = await fetchMyBrokerProfile();
      const profileData = profile?.data || profile;
      setBrokerProfile(profileData || null);

      // Refresh connection status
      const statusRes = await fetchBrokerConnectionStatus();
      const statusData = statusRes?.data || statusRes;
      setBrokerConnection({
        is_connected: !!(statusData?.is_connected || profileData?.is_active_for_trading),
        message: statusData?.message || ''
      });

      			// Refresh RMS limit
			const rmsRes = await getDematLimit();
			setRmsLimit(rmsRes?.data || rmsRes);

			// Update last update time
			setLastUpdateTime(new Date());

			// Fetch user trades
			await fetchUserTrades();

			console.log('✅ Manual refresh completed successfully');
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setLoading(false);
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

  // Always render dashboard; show sections conditionally based on connection

  return (
    <div style={{ 
      padding: 'clamp(1em, 3vw, 1.5em)', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
      minHeight: '100vh', 
      maxWidth: 1400, 
      margin: '0 auto'
    }}>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
      {error && (
        <div style={{ 
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)', 
          color: '#ffffff', 
          padding: 'clamp(0.8em, 2vw, 1em)', 
          borderRadius: '12px', 
          marginBottom: '1.5em', 
          border: '1px solid rgba(255,255,255,0.2)', 
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5em',
          boxShadow: '0 4px 15px rgba(255,107,107,0.3)'
        }}>
          <span>⚠️</span>
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}

      {clearBrokerStatus && (
        <div style={{ 
          background: clearBrokerStatus.includes('successfully') ? 'var(--gradient-primary)' : 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
          color: '#ffffff', 
          padding: 'clamp(0.8em, 2vw, 1em)', 
          borderRadius: '12px', 
          marginBottom: '1.5em', 
          border: '1px solid rgba(255,255,255,0.2)', 
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          fontWeight: 500,
                      boxShadow: clearBrokerStatus.includes('successfully') ? '0 4px 15px rgba(211, 80, 63, 0.3)' : '0 4px 15px rgba(255,107,107,0.3)'
        }}>
          {clearBrokerStatus}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
         justifyContent: 'space-between',
         alignItems: 'center',
        marginBottom: '2em',
        flexWrap: 'wrap',
        background: 'rgba(255,255,255,0.8)',
        padding: '1em',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.3)'
      }}>
         <div style={{ display: 'flex', gap: '0.5em', flexWrap: 'wrap' }}>
        {['overview', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(1em, 2vw, 1.2em)',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'transparent',
              color: activeTab === tab ? '#ffffff' : '#2c3e50',
              fontWeight: activeTab === tab ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              textTransform: 'capitalize'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab) {
                e.target.style.background = 'rgba(102,126,234,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab) {
                e.target.style.background = 'transparent';
              }
            }}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'history' && '📋 History'}
          </button>
        ))}
         </div>
         
         {/* Refresh Button */}
         <button
           onClick={handleManualRefresh}
           disabled={loading}
           style={{
             padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(1em, 2vw, 1.2em)',
             borderRadius: '8px',
             border: '1px solid #667eea',
             background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
             color: '#ffffff',
             fontWeight: 500,
             cursor: loading ? 'not-allowed' : 'pointer',
             transition: 'all 0.3s ease',
             fontSize: 'clamp(12px, 2.5vw, 14px)',
             display: 'flex',
             alignItems: 'center',
             gap: '0.5em'
           }}
           onMouseEnter={(e) => {
             if (!loading) {
               e.target.style.transform = 'translateY(-1px)';
               e.target.style.boxShadow = '0 4px 15px rgba(102,126,234,0.3)';
             }
           }}
           onMouseLeave={(e) => {
             if (!loading) {
               e.target.style.transform = 'translateY(0)';
               e.target.style.boxShadow = 'none';
             }
           }}
         >
           {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
         </button>
       </div>

       {/* Real-time Status Indicator */}
       <div style={{
         background: 'rgba(255,255,255,0.6)',
         padding: '0.5em 1em',
         borderRadius: '8px',
         marginBottom: '1em',
         fontSize: '12px',
         color: '#64748b',
         display: 'flex',
         alignItems: 'center',
         gap: '0.5em',
         justifyContent: 'center'
       }}>
         <span style={{ 
           width: '8px', 
           height: '8px', 
           borderRadius: '50%', 
           background: '#10b981',
           animation: 'pulse 2s infinite'
         }} />
         <span>🔄 Auto-refresh every 30s • Last update: {lastUpdateTime.toLocaleTimeString()}</span>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Broker Profile & Connection Status */}
          <div style={{ 
            background: 'rgba(255,255,255,0.9)', 
            borderRadius: '16px', 
            padding: 'clamp(1.5em, 3vw, 2em)', 
            marginBottom: '2em',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1em', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, color: '#2c3e50', fontSize: 'clamp(1.2em, 3vw, 1.5em)' }}>Broker Profile & Connection</h3>
              <div style={{ fontSize: '13px', fontWeight: 600, color: brokerConnection.is_connected ? '#2e7d32' : '#c62828' }}>
                {brokerConnection.is_connected ? '🟢 Connected' : '🔴 Not Connected'}
              </div>
            </div>
                         <div style={{ marginTop: '1em', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5em' }}>
               <div style={{ minWidth: 0 }}>
                 <div style={{ color: '#64748b', fontSize: 12, marginBottom: '0.5em' }}>Broker</div>
                 <div style={{ 
                   color: '#1f2937', 
                   fontWeight: 600, 
                   wordBreak: 'break-word',
                   overflowWrap: 'break-word'
                 }}>
                   {brokerProfile?.broker_name || '—'}
                 </div>
               </div>
               <div style={{ minWidth: 0 }}>
                 <div style={{ color: '#64748b', fontSize: 12, marginBottom: '0.5em' }}>Client ID</div>
                 <div style={{ 
                   color: '#1f2937', 
                   fontWeight: 600, 
                   fontSize: '13px',
                   wordBreak: 'break-all',
                   overflowWrap: 'break-word',
                   maxWidth: '100%'
                 }}>
                   {brokerProfile?.broker_client_id || '—'}
                 </div>
               </div>
               <div style={{ minWidth: 0 }}>
                 <div style={{ color: '#64748b', fontSize: 12, marginBottom: '0.5em' }}>Active For Trading</div>
                 <div style={{ 
                   color: '#1f2937', 
                   fontWeight: 600,
                   display: 'flex',
                   alignItems: 'center',
                   gap: '0.5em'
                 }}>
                   <span style={{
                     width: '8px',
                     height: '8px',
                     borderRadius: '50%',
                     background: brokerProfile?.is_active_for_trading ? '#10b981' : '#ef4444'
                   }} />
                   {brokerProfile?.is_active_for_trading ? 'Yes' : 'No'}
                 </div>
               </div>
               <div style={{ minWidth: 0 }}>
                 <div style={{ color: '#64748b', fontSize: 12, marginBottom: '0.5em' }}>Message</div>
                 <div style={{ 
                   color: '#1f2937', 
                   fontWeight: 600,
                   wordBreak: 'break-word',
                   overflowWrap: 'break-word'
                 }}>
                   {brokerConnection?.message || '—'}
                 </div>
               </div>
             </div>
          </div>



          



          {/* Broker Details (RMS & Profile) - only if connected */}
          <div style={{ 
            background: 'rgba(255,255,255,0.9)', 
            borderRadius: '16px', 
            padding: 'clamp(1.5em, 3vw, 2em)', 
            marginBottom: '2em',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <h3 style={{ margin: '0 0 1em 0', color: '#2c3e50', fontSize: 'clamp(1.2em, 3vw, 1.5em)' }}>Broker Details</h3>
                         {brokerConnection.is_connected ? (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5em' }}>
                 <div style={{ 
                   background: '#f8fafc', 
                   border: '1px solid #e2e8f0', 
                   borderRadius: 8, 
                   padding: '1em',
                   minWidth: 0
                 }}>
                   <div style={{ color: '#64748b', fontSize: 12, marginBottom: '0.5em' }}>RMS Net</div>
                   <div style={{ 
                     color: '#1f2937', 
                     fontWeight: 700,
                     wordBreak: 'break-word',
                     overflowWrap: 'break-word'
                   }}>
                     {rmsLimit?.net ?? rmsLimit?.available ?? '—'}
                   </div>
                 </div>
                 <div style={{ 
                   background: '#f8fafc', 
                   border: '1px solid #e2e8f0', 
                   borderRadius: 8, 
                   padding: '1em',
                   minWidth: 0
                 }}>
                   <div style={{ color: '#64748b', fontSize: 12, marginBottom: '0.5em' }}>RMS Available</div>
                   <div style={{ 
                     color: '#1f2937', 
                     fontWeight: 700,
                     wordBreak: 'break-word',
                     overflowWrap: 'break-word'
                   }}>
                     {rmsLimit?.available ?? '—'}
                   </div>
                 </div>
                 <div style={{ 
                   background: '#f8fafc', 
                   border: '1px solid #e2e8f0', 
                   borderRadius: 8, 
                   padding: '1em',
                   minWidth: 0
                 }}>
                   <div style={{ color: '#64748b', fontSize: 12, marginBottom: '0.5em' }}>RMS Used</div>
                   <div style={{ 
                     color: '#1f2937', 
                     fontWeight: 700,
                     wordBreak: 'break-word',
                     overflowWrap: 'break-word'
                   }}>
                     {rmsLimit?.used ?? '—'}
                   </div>
                 </div>
                 <div style={{ 
                   background: '#f8fafc', 
                   border: '1px solid #e2e8f0', 
                   borderRadius: 8, 
                   padding: '1em',
                   minWidth: 0
                 }}>
                   <div style={{ color: '#64748b', fontSize: 12, marginBottom: '0.5em' }}>Products</div>
                   <div style={{ 
                     color: '#1f2937', 
                     fontWeight: 700,
                     wordBreak: 'break-word',
                     overflowWrap: 'break-word'
                   }}>
                     {Array.isArray(brokerProfile?.products) ? brokerProfile.products.join(', ') || '—' : '—'}
                   </div>
                 </div>
               </div>
            ) : (
              <div style={{ color: '#c62828', fontWeight: 600 }}>Not connected — connect your broker to view RMS and broker details.</div>
            )}
          </div>
        </>
      )}

      {activeTab === 'history' && (
           <>
             {/* Debug Info - Remove this after fixing */}
             <div style={{ 
               background: 'rgba(255, 193, 7, 0.1)', 
               borderRadius: '8px', 
               padding: '1em', 
               marginBottom: '1em',
               border: '1px solid rgba(255, 193, 7, 0.3)',
               fontSize: '12px'
             }}>
               <strong>🔍 Debug Info:</strong> Token: {localStorage.getItem('token') ? '✅ Present' : '❌ Missing'} | 
               User: {user ? '✅ Loaded' : '❌ Not loaded'} | 
               Trades Count: {userTrades.length}
             </div>
             
             {/* User Trade History */}
            <div style={{ 
          background: 'rgba(255,255,255,0.9)', 
          borderRadius: '16px', 
          padding: 'clamp(1.5em, 3vw, 2em)', 
          marginBottom: '2em',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1em', flexWrap: 'wrap', gap: '1em' }}>
                 <h3 style={{ margin: 0, color: '#2c3e50', fontSize: 'clamp(1.2em, 3vw, 1.5em)' }}>Your Trade History</h3>
                 <div style={{ display: 'flex', gap: '0.5em' }}>
                   <button
                     onClick={fetchUserTrades}
                     disabled={tradesLoading}
                     style={{
                       padding: '0.5em 1em',
                       borderRadius: '6px',
                       border: '1px solid #667eea',
                       background: tradesLoading ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
                       color: '#ffffff',
                       fontWeight: 500,
                       cursor: tradesLoading ? 'not-allowed' : 'pointer',
                       transition: 'all 0.3s ease',
                       fontSize: '12px'
                     }}
                   >
                     {tradesLoading ? '🔄 Loading...' : '🔄 Refresh'}
                   </button>
                   <button
                     onClick={() => {
                       const token = localStorage.getItem('token');
                       console.log('🔍 Current token:', token);
                       console.log('🔍 Token length:', token?.length);
                       console.log('🔍 User object:', user);
                       console.log('🔍 User trades state:', userTrades);
                     }}
                     style={{
                       padding: '0.5em 1em',
                       borderRadius: '6px',
                       border: '1px solid #ff6b6b',
                       background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                       color: '#ffffff',
                       fontWeight: 500,
                       cursor: 'pointer',
                       transition: 'all 0.3s ease',
                       fontSize: '12px'
                     }}
                   >
                     🐛 Debug
                   </button>
                 </div>
               </div>
               
               {tradesLoading ? (
                 <div style={{ textAlign: 'center', padding: '2em', color: '#64748b' }}>
                   <div className="loading-spinner" style={{
                     width: '30px',
                     height: '30px',
                     border: '3px solid #e3e3e3',
                     borderTop: '3px solid #667eea',
                     borderRadius: '50%',
                     animation: 'spin 1s linear infinite',
                     margin: '0 auto 1em auto'
                   }} />
                   <p>Loading your trade history...</p>
                 </div>
               ) : userTrades.length > 0 ? (
                 <div style={{ overflowX: 'auto' }}>
                   <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                     <thead>
                       <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                         <th style={{ padding: '0.8em', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>Symbol</th>
                         <th style={{ padding: '0.8em', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>Type</th>
                         <th style={{ padding: '0.8em', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>Quantity</th>
                         <th style={{ padding: '0.8em', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>Price</th>
                         <th style={{ padding: '0.8em', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>Status</th>
                         <th style={{ padding: '0.8em', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>Date</th>
                       </tr>
                     </thead>
                     <tbody>
                       {userTrades.map((trade, index) => (
                         <tr key={trade.id || trade._id || index} style={{ 
                           borderBottom: '1px solid #f1f5f9',
                           background: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                         }}>
                           <td style={{ padding: '0.8em', color: '#1f2937', fontWeight: 600 }}>
                             {trade.symbol || trade.underlying_symbol || '—'}
                           </td>
                           <td style={{ padding: '0.8em', color: '#1f2937' }}>
                             <span style={{
                               padding: '0.2em 0.6em',
                               borderRadius: '4px',
                               fontSize: '11px',
                               fontWeight: 600,
                               background: trade.trade_type === 'BUY' ? '#dcfce7' : '#fef2f2',
                               color: trade.trade_type === 'BUY' ? '#166534' : '#dc2626'
                             }}>
                               {trade.trade_type || trade.type || '—'}
                             </span>
                           </td>
                           <td style={{ padding: '0.8em', color: '#1f2937' }}>
                             {trade.quantity || trade.qty || '—'}
                           </td>
                           <td style={{ padding: '0.8em', color: '#1f2937' }}>
                             ₹{trade.price || trade.execution_price || '—'}
                           </td>
                           <td style={{ padding: '0.8em', color: '#1f2937' }}>
                             <span style={{
                               padding: '0.2em 0.6em',
                               borderRadius: '4px',
                               fontSize: '11px',
                               fontWeight: 600,
                               background: trade.status === 'COMPLETED' ? '#dcfce7' : 
                                         trade.status === 'PENDING' ? '#fef3c7' : 
                                         trade.status === 'CANCELLED' ? '#fee2e2' : '#f3f4f6',
                               color: trade.status === 'COMPLETED' ? '#166534' : 
                                      trade.status === 'PENDING' ? '#92400e' : 
                                      trade.status === 'CANCELLED' ? '#dc2626' : '#6b7280'
                             }}>
                               {trade.status || '—'}
                             </span>
                           </td>
                           <td style={{ padding: '0.8em', color: '#64748b', fontSize: '12px' }}>
                             {trade.created_at || trade.timestamp ? 
                               new Date(trade.created_at || trade.timestamp).toLocaleDateString() : '—'
                             }
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               ) : (
                 <div style={{ textAlign: 'center', padding: '3em', color: '#64748b' }}>
                   <p style={{ fontSize: '16px', marginBottom: '0.5em' }}>📊 No trades found</p>
                   <p style={{ fontSize: '14px', opacity: 0.7 }}>You haven't made any trades yet.</p>
            </div>
               )}
             </div>
           </>
      )}

      

      {/* Broker Management Section */}
        <div style={{ 
        background: 'rgba(255,255,255,0.9)', 
        borderRadius: '16px', 
        padding: 'clamp(1.5em, 3vw, 2em)', 
        marginBottom: '2em',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1em', flexWrap: 'wrap', gap: '1em' }}>
          <h3 style={{ margin: 0, color: '#2c3e50', fontSize: 'clamp(1.2em, 3vw, 1.5em)' }}>Broker Management</h3>
          <div style={{ display: 'flex', gap: '0.5em', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/dashboard/profile-settings')}
              style={{
                padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(1em, 2vw, 1.2em)',
                borderRadius: '8px',
                border: '1px solid #667eea',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: '#ffffff',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: 'clamp(12px, 2.5vw, 14px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 15px rgba(102,126,234,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              ⚙️ Profile Settings
            </button>
            <button
              onClick={handleClearBroker}
              disabled={clearBrokerLoading}
              style={{
                padding: 'clamp(0.6em, 1.5vw, 0.8em) clamp(1em, 2vw, 1.2em)',
                borderRadius: '8px',
                border: '1px solid #ff6b6b',
                background: clearBrokerLoading ? '#ccc' : 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                color: '#ffffff',
                fontWeight: 500,
                cursor: clearBrokerLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                fontSize: 'clamp(12px, 2.5vw, 14px)'
              }}
              onMouseEnter={(e) => {
                if (!clearBrokerLoading) {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 15px rgba(255,107,107,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!clearBrokerLoading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {clearBrokerLoading ? '🔄 Processing...' : '❌ Disconnect Broker'}
            </button>
        </div>
      </div>


        </div>

        
    </div>
  );
};

export default TradingPortal;
