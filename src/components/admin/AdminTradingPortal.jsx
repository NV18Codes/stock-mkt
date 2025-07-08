import React, { useState, useEffect, useCallback } from 'react';
import { fetchOptionExpiries, fetchOptionChain, fetchUnderlyings, placeTradeOrder, fetchOptionChainLTP, fetchLTPData } from '../../api/trading';
import { getAdminUsers, mergeLTPWithOptions } from '../../api/admin';
import OptionTable from '../user/OptionTable';
import BuySellButtons from '../user/BuySellButtons';

const formatINR = (value) => {
  const num = typeof value === 'object' && value !== null ? value.net : value;
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

const AdminTradingPortal = () => {
  const [underlying, setUnderlying] = useState('NIFTY');
  const [expiry, setExpiry] = useState('10JUL2025');
  const [underlyings, setUnderlyings] = useState(['NIFTY']);
  const [expiries, setExpiries] = useState(['10JUL2025']);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState({
    underlyings: true,
    expiries: true,
    options: true,
    ltp: false,
    users: true
  });
  const [error, setError] = useState({
    underlyings: '',
    expiries: '',
    options: '',
    ltp: '',
    users: ''
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [capitalFilter, setCapitalFilter] = useState('all');
  const [ltpData, setLtpData] = useState({});
  const [lastLTPUpdate, setLastLTPUpdate] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
  const [optionSymbolsLTP, setOptionSymbolsLTP] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [debugLTPResponse, setDebugLTPResponse] = useState(null);
  const [debugOptionSymbols, setDebugOptionSymbols] = useState([]);

  // Load underlyings on component mount
  useEffect(() => {
    const loadUnderlyings = async () => {
      setLoading(prev => ({ ...prev, underlyings: true }));
      setError(prev => ({ ...prev, underlyings: '' }));
      try {
        const response = await fetchUnderlyings();
        console.log('Underlyings data:', response);
        let data;
        if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
          data = response.data;
        } else {
          throw new Error(response.error || 'No underlyings available');
        }
        setUnderlyings(data);
        setUnderlying(data[0]);
      } catch (err) {
        console.error('Error loading underlyings:', err);
        setError(prev => ({ ...prev, underlyings: err.message || 'Failed to load underlyings' }));
        setUnderlyings([]);
        setUnderlying('');
      } finally {
        setLoading(prev => ({ ...prev, underlyings: false }));
      }
    };
    loadUnderlyings();
  }, []);

  // Load expiries when underlying changes
  useEffect(() => {
    const loadExpiries = async () => {
      if (!underlying) return;
      setLoading(prev => ({ ...prev, expiries: true }));
      setError(prev => ({ ...prev, expiries: '' }));
      try {
        const response = await fetchOptionExpiries(underlying);
        console.log('Expiries data:', response);
        let data;
        if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
          data = response.data;
        } else {
          throw new Error(response.error || 'No expiries available');
        }
        setExpiries(data);
        setExpiry(data[0]);
      } catch (err) {
        console.error('Error loading expiries:', err);
        setError(prev => ({ ...prev, expiries: err.message || 'Failed to load expiries' }));
        setExpiries([]);
        setExpiry('');
      } finally {
        setLoading(prev => ({ ...prev, expiries: false }));
      }
    };
    loadExpiries();
  }, [underlying]);

  // Load options when underlying or expiry changes
  useEffect(() => {
    const loadOptions = async () => {
      if (!underlying || !expiry) return;
      setLoading(prev => ({ ...prev, options: true }));
      setError(prev => ({ ...prev, options: '' }));
      try {
        console.log('Loading options for:', { underlying, expiry });
        const response = await fetchOptionChain(underlying, expiry);
        console.log('Option chain data:', response);
        
        let data;
        if (response && response.success && response.data) {
          data = response.data;
        } else if (Array.isArray(response)) {
          data = response;
        } else {
          throw new Error('Invalid option chain data format');
        }
        
        if (Array.isArray(data)) {
          console.log('Setting options data:', data);
          setOptions(data);
        } else {
          throw new Error('Invalid option chain data format');
        }
      } catch (err) {
        console.error('Error loading option chain:', err);
        setError(prev => ({ ...prev, options: 'Failed to load option chain' }));
        setOptions([]);
      } finally {
        setLoading(prev => ({ ...prev, options: false }));
      }
    };
    loadOptions();
  }, [underlying, expiry]);

  // Load users on component mount with better error handling
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(prev => ({ ...prev, users: true }));
      setError(prev => ({ ...prev, users: '' }));
      try {
        console.log('Fetching users for admin...');
        const response = await getAdminUsers();
        console.log('Users response:', response);
        
        let usersData = [];
        if (response && response.data && Array.isArray(response.data)) {
          usersData = response.data;
        } else if (response && Array.isArray(response)) {
          usersData = response;
        } else if (response && response.success && response.data) {
          usersData = response.data;
        }
        
        console.log('Setting users data:', usersData);
        setUsers(usersData);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(prev => ({ ...prev, users: 'Failed to load users' }));
        setUsers([]);
      } finally {
        setLoading(prev => ({ ...prev, users: false }));
      }
    };
    fetchUsers();
  }, []);

  // Enhanced LTP data fetching with real-time updates
  const fetchLTPDataForOptions = useCallback(async () => {
    if (!options || options.length === 0) return;
    try {
      // Gather all option symbols for debug
      const optionSymbols = [];
      options.forEach(row => {
        if (row.CE && row.CE.tradingSymbol) optionSymbols.push(row.CE.tradingSymbol);
        if (row.PE && row.PE.tradingSymbol) optionSymbols.push(row.PE.tradingSymbol);
      });
      setDebugOptionSymbols(optionSymbols);
      // Use GET /option-chain/ltp for LTP data
      const ltpResponse = await fetchOptionChainLTP();
      setDebugLTPResponse(ltpResponse);
      console.log('LTP API response (option-chain/ltp):', ltpResponse);
      if (ltpResponse && ltpResponse.success && ltpResponse.data && Object.keys(ltpResponse.data).length > 0) {
        setOptionSymbolsLTP(ltpResponse.data);
        setError(prev => ({ ...prev, ltp: '' }));
        console.log('LTP data set for options:', Object.keys(ltpResponse.data).length, 'symbols');
      } else {
        setError(prev => ({ ...prev, ltp: 'No LTP data received from /option-chain/ltp API. Please check backend or try again.' }));
        setOptionSymbolsLTP({});
      }
      // Also fetch general LTP data for major indices
      try {
        const generalLTPResponse = await fetchLTPData(['NIFTY', 'BANKNIFTY', 'FINNIFTY']);
        if (generalLTPResponse && generalLTPResponse.success && generalLTPResponse.data) {
          setLtpData(generalLTPResponse.data);
          console.log('General LTP data updated');
        }
      } catch (generalLTPError) {
        console.log('General LTP fetch failed, continuing with option data only');
      }
      setLastLTPUpdate(new Date());
      setUpdateCount(prev => prev + 1);
    } catch (error) {
      console.error('Error fetching LTP data:', error);
      setError(prev => ({ ...prev, ltp: 'Failed to fetch LTP data from /option-chain/ltp: ' + (error.message || error) }));
    }
  }, [options]);

  // Update options when LTP data changes
  useEffect(() => {
    if (options.length > 0 && Object.keys(optionSymbolsLTP).length > 0) {
      const updatedOptions = mergeLTPWithOptions(options, ltpData, optionSymbolsLTP);
      setOptions(updatedOptions);
      console.log('Options updated with LTP data');
    }
  }, [optionSymbolsLTP, ltpData, options]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchLTPDataForOptions();
      }, 5000); // Refresh every 5 seconds
      setRefreshInterval(interval);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [autoRefresh, fetchLTPDataForOptions]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    console.log('Selected option:', option);
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };
  
  const selectAllUsers = () => setSelectedUserIds(users.map(u => u.id));
  const deselectAllUsers = () => setSelectedUserIds([]);

  const handleTrade = async (tradeInfo) => {
    if (selectedUserIds.length === 0) {
      alert('Please select at least one user to trade for.');
      return;
    }
    let failedUsers = [];
    for (const userId of selectedUserIds) {
      const user = users.find(u => u.id === userId);
      if (!user) continue;
      const rms = user.rms_limit?.net || user.rms_limit || 0;
      if (rms < (tradeInfo.price * tradeInfo.quantity)) {
        failedUsers.push(user.email);
        continue;
      }
      try {
        await placeTradeOrder({ ...tradeInfo, userId });
      } catch (e) {
        failedUsers.push(user.email);
      }
    }
    if (failedUsers.length > 0) {
      alert('Trade could not be placed for: ' + failedUsers.join(', '));
    } else {
      alert(`${tradeInfo.action} order placed successfully for all selected users!`);
    }
  };

  // Enhanced refresh function with better error handling
  const handleFullRefresh = async () => {
    setLoading(prev => ({ ...prev, options: true, ltp: true }));
    setError(prev => ({ ...prev, options: '', ltp: '' }));
    
    try {
      // 1. Fetch latest option chain
      console.log('Fetching option chain for:', { underlying, expiry });
      const optionChainResponse = await fetchOptionChain(underlying, expiry);
      let optionChainData = [];
      
      if (optionChainResponse && optionChainResponse.success && optionChainResponse.data) {
        optionChainData = [...optionChainResponse.data];
      } else if (Array.isArray(optionChainResponse)) {
        optionChainData = [...optionChainResponse];
      } else {
        throw new Error('Failed to fetch option chain');
      }

      console.log('Option chain data fetched:', optionChainData.length, 'strikes');
      setOptions(optionChainData);

      // 2. Fetch LTP data
      await fetchLTPDataForOptions();
      
    } catch (error) {
      console.error('Refresh error:', error);
      setError(prev => ({
        ...prev,
        options: 'Failed to refresh option chain',
        ltp: 'Failed to refresh LTP data'
      }));
    } finally {
      setLoading(prev => ({ ...prev, options: false, ltp: false }));
    }
  };

  // Filter out admin users for trading, but show all (active/inactive) and add status filter
  const filteredUsers = users
    .filter(user => (user.role || user.user_role || 'user') !== 'admin')
    .filter(user => {
      // Capital filter
      const rms = user.rms_limit?.net || user.rms_limit || 0;
      if (capitalFilter === 'all') return true;
      if (capitalFilter === 'lt1') return rms < 100000;
      if (capitalFilter === '1to5') return rms >= 100000 && rms <= 500000;
      if (capitalFilter === 'gt5') return rms > 500000;
      return true;
    })
    .filter(user => {
      // Status filter
      if (userStatusFilter === 'all') return true;
      if (userStatusFilter === 'active') return user.is_active_for_trading || user.isActive;
      if (userStatusFilter === 'inactive') return !(user.is_active_for_trading || user.isActive);
      return true;
    });

  if (loading.underlyings || loading.expiries) {
    return (
      <div style={{ textAlign: 'center', padding: '2em' }}>
        <div className="loading-spinner" />
        <p style={{ color: '#333', marginTop: '1em', fontSize: 14 }}>Loading trading data...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: 'clamp(0.5em, 2vw, 1.5em)', 
      background: '#ffffff', 
      minHeight: '100vh',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      <h1 style={{ 
        color: '#2c3e50', 
        marginBottom: 'clamp(1em, 3vw, 1.5em)', 
        textAlign: 'center', 
        fontWeight: 600, 
        fontSize: 'clamp(1.5em, 4vw, 2em)'
      }}>
        Admin Trading Portal
      </h1>

      {/* Underlying and Expiry Selection Controls */}
      <div style={{ 
        marginBottom: 'clamp(1.5em, 4vw, 2em)', 
        background: '#f8f9fa', 
        borderRadius: 8, 
        padding: 'clamp(1em, 2.5vw, 1.5em)', 
        border: '1px solid #e0e0e0' 
      }}>
        <h3 style={{ 
          color: '#2c3e50', 
          marginBottom: 'clamp(0.8em, 2vw, 1em)', 
          fontSize: 'clamp(1em, 2.5vw, 1.1em)' 
        }}>
          Market Data Selection
        </h3>
        
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 'clamp(1em, 2.5vw, 1.5em)',
          alignItems: 'flex-end'
        }}>
          {/* Underlying Selection */}
          <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5em', 
              fontWeight: 500, 
              color: '#2c3e50',
              fontSize: 'clamp(12px, 2.5vw, 14px)'
            }}>
              Select Underlying:
            </label>
            <select 
              value={underlying} 
              onChange={(e) => setUnderlying(e.target.value)}
              disabled={loading.underlyings}
              style={{ 
                width: '100%',
                padding: 'clamp(0.5em, 1.5vw, 0.7em)', 
                borderRadius: 4, 
                border: '1px solid #007bff', 
                fontWeight: 500,
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                minHeight: 'clamp(36px, 8vw, 44px)',
                background: '#ffffff',
                cursor: loading.underlyings ? 'not-allowed' : 'pointer',
                opacity: loading.underlyings ? 0.6 : 1
              }}
            >
              {loading.underlyings ? (
                <option>Loading underlyings...</option>
              ) : (
                underlyings.map(underlyingOption => (
                  <option key={underlyingOption} value={underlyingOption}>
                    {underlyingOption}
                  </option>
                ))
              )}
            </select>
            {error.underlyings && (
              <div style={{ 
                color: '#dc3545', 
                fontSize: 'clamp(10px, 2vw, 12px)', 
                marginTop: '0.3em' 
              }}>
                {error.underlyings}
              </div>
            )}
          </div>

          {/* Expiry Selection */}
          <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5em', 
              fontWeight: 500, 
              color: '#2c3e50',
              fontSize: 'clamp(12px, 2.5vw, 14px)'
            }}>
              Select Expiry:
            </label>
            <select 
              value={expiry} 
              onChange={(e) => setExpiry(e.target.value)}
              disabled={loading.expiries || !underlying}
              style={{ 
                width: '100%',
                padding: 'clamp(0.5em, 1.5vw, 0.7em)', 
                borderRadius: 4, 
                border: '1px solid #007bff', 
                fontWeight: 500,
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                minHeight: 'clamp(36px, 8vw, 44px)',
                background: '#ffffff',
                cursor: (loading.expiries || !underlying) ? 'not-allowed' : 'pointer',
                opacity: (loading.expiries || !underlying) ? 0.6 : 1
              }}
            >
              {loading.expiries ? (
                <option>Loading expiries...</option>
              ) : !underlying ? (
                <option>Select underlying first</option>
              ) : (
                expiries.map(expiryOption => (
                  <option key={expiryOption} value={expiryOption}>
                    {expiryOption}
                  </option>
                ))
              )}
            </select>
            {error.expiries && (
              <div style={{ 
                color: '#dc3545', 
                fontSize: 'clamp(10px, 2vw, 12px)', 
                marginTop: '0.3em' 
              }}>
                {error.expiries}
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <div style={{ flex: '0 0 auto' }}>
            <button 
              onClick={handleFullRefresh}
              disabled={loading.options || loading.ltp || !underlying || !expiry}
              style={{ 
                padding: 'clamp(0.5em, 1.5vw, 0.7em) clamp(1em, 2.5vw, 1.5em)', 
                borderRadius: 4, 
                border: '1px solid #007bff', 
                background: '#007bff', 
                color: '#fff', 
                fontWeight: 500, 
                cursor: (loading.options || loading.ltp || !underlying || !expiry) ? 'not-allowed' : 'pointer',
                opacity: (loading.options || loading.ltp || !underlying || !expiry) ? 0.6 : 1,
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                minHeight: 'clamp(36px, 8vw, 44px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                whiteSpace: 'nowrap'
              }}
            >
              {(loading.options || loading.ltp) ? 'Loading...' : 'Load Options'}
            </button>
          </div>
        </div>

        {/* Current Selection Display */}
        {underlying && expiry && (
          <div style={{ 
            marginTop: 'clamp(0.8em, 2vw, 1em)', 
            padding: 'clamp(0.6em, 1.5vw, 0.8em)', 
            background: '#e3f2fd', 
            borderRadius: 6, 
            border: '1px solid #bbdefb',
            fontSize: 'clamp(11px, 2.2vw, 13px)',
            color: '#1976d2'
          }}>
            <strong>Current Selection:</strong> {underlying} - {expiry}
          </div>
        )}
      </div>

      {/* User Filtering Controls */}
      <div style={{ 
        marginBottom: 'clamp(0.8em, 2vw, 1.2em)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5em'
      }}>
        <label style={{ fontWeight: 500, fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Filter by Capital (RMS):</label>
        <select 
          value={capitalFilter} 
          onChange={e => setCapitalFilter(e.target.value)} 
          style={{ 
            padding: 'clamp(0.3em, 1.5vw, 0.5em) clamp(0.5em, 2vw, 1em)', 
            borderRadius: 4, 
            border: '1px solid #007bff', 
            fontWeight: 500,
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            maxWidth: '200px'
          }}
        >
          <option value="all">All</option>
          <option value="lt1">Less than ₹1L</option>
          <option value="1to5">₹1L - ₹5L</option>
          <option value="gt5">More than ₹5L</option>
        </select>
        <label style={{ fontWeight: 500, fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Filter by Status:</label>
        <select
          value={userStatusFilter}
          onChange={e => setUserStatusFilter(e.target.value)}
          style={{
            padding: 'clamp(0.3em, 1.5vw, 0.5em) clamp(0.5em, 2vw, 1em)',
            borderRadius: 4,
            border: '1px solid #007bff',
            fontWeight: 500,
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            maxWidth: '200px'
          }}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Error Messages */}
      {Object.values(error).some(err => err) && (
        <div style={{ marginBottom: '1em' }}>
          {Object.entries(error).map(([key, errorMsg]) => 
            errorMsg && (
              <div key={key} style={{ 
                background: '#f8d7da', 
                color: '#721c24', 
                padding: 'clamp(0.6em, 2vw, 0.8em)', 
                borderRadius: '6px', 
                marginBottom: '0.5em', 
                border: '1px solid #f5c6cb', 
                fontSize: 'clamp(12px, 2.5vw, 14px)' 
              }}>
                {errorMsg}
              </div>
            )
          )}
        </div>
      )}

      {/* User Selection Table */}
      <div style={{ 
        marginBottom: 'clamp(1.5em, 4vw, 2em)', 
        background: '#f8f9fa', 
        borderRadius: 8, 
        padding: 'clamp(0.8em, 2vw, 1em)', 
        border: '1px solid #e0e0e0' 
      }}>
        <h3 style={{ 
          color: '#2c3e50', 
          marginBottom: 'clamp(0.8em, 2vw, 1em)', 
          fontSize: 'clamp(1em, 2.5vw, 1.1em)' 
        }}>
          Select Users for Group Trade
        </h3>
        
        {loading.users ? (
          <div style={{ textAlign: 'center', padding: '1em' }}>
            <div className="loading-spinner" />
            <p style={{ color: '#333', marginTop: '0.5em', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
              Loading users...
            </p>
          </div>
        ) : error.users ? (
          <div style={{ 
            background: '#f8d7da', 
            color: '#721c24', 
            padding: '0.8em', 
            borderRadius: '6px', 
            border: '1px solid #f5c6cb', 
            fontSize: 'clamp(12px, 2.5vw, 14px)' 
          }}>
            {error.users}
          </div>
        ) : (
          <>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.5em', 
              marginBottom: 'clamp(0.8em, 2vw, 1.2em)' 
            }}>
              <button 
                onClick={selectAllUsers} 
                style={{ 
                  padding: 'clamp(0.3em, 1.5vw, 0.5em) clamp(0.5em, 2vw, 1em)', 
                  borderRadius: 4, 
                  border: '1px solid #007bff', 
                  background: '#007bff', 
                  color: '#fff', 
                  fontWeight: 500, 
                  cursor: 'pointer',
                  fontSize: 'clamp(11px, 2.2vw, 13px)'
                }}
              >
                Select All
              </button>
              <button 
                onClick={deselectAllUsers} 
                style={{ 
                  padding: 'clamp(0.3em, 1.5vw, 0.5em) clamp(0.5em, 2vw, 1em)', 
                  borderRadius: 4, 
                  border: '1px solid #dc3545', 
                  background: '#dc3545', 
                  color: '#fff', 
                  fontWeight: 500, 
                  cursor: 'pointer',
                  fontSize: 'clamp(11px, 2.2vw, 13px)'
                }}
              >
                Deselect All
              </button>
            </div>
            
            <div style={{ overflowX: 'auto', marginTop: '0.8em' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: 'clamp(11px, 2.2vw, 13px)',
                minWidth: '600px'
              }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.5em', textAlign: 'left' }}></th>
                    <th style={{ padding: '0.5em', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '0.5em', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '0.5em', textAlign: 'left' }}>RMS Limit</th>
                    <th style={{ padding: '0.5em', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ 
                        textAlign: 'center', 
                        padding: '1em', 
                        color: '#6c757d',
                        fontSize: 'clamp(12px, 2.5vw, 14px)'
                      }}>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td style={{ padding: '0.5em' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedUserIds.includes(user.id)} 
                            onChange={() => toggleUserSelection(user.id)} 
                          />
                        </td>
                        <td style={{ padding: '0.5em' }}>{user.name}</td>
                        <td style={{ padding: '0.5em' }}>{user.email}</td>
                        <td style={{ padding: '0.5em' }}>{formatINR(user.rms_limit)}</td>
                        <td style={{ padding: '0.5em' }}>
                          {user.is_active_for_trading || user.isActive ? 'Active' : 'Inactive'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Selected Users Summary */}
            <div style={{ 
              marginTop: 'clamp(1em, 2.5vw, 1.6em)', 
              background: '#e3f2fd', 
              borderRadius: 6, 
              padding: 'clamp(0.6em, 1.5vw, 0.8em)', 
              border: '1px solid #bbdefb', 
              color: '#1976d2', 
              fontSize: 'clamp(12px, 2.5vw, 14px)' 
            }}>
              <strong>Trading on behalf of:</strong>
              {selectedUserIds.length === 0 ? (
                <span style={{ marginLeft: 8, color: '#dc3545' }}>No users selected</span>
              ) : (
                <ul style={{ margin: '0.5em 0 0 1.5em', padding: 0 }}>
                  {filteredUsers.filter(u => selectedUserIds.includes(u.id)).map(u => (
                    <li key={u.id}>
                      {u.name} <span style={{ color: '#6c757d', fontSize: 'clamp(11px, 2.2vw, 13px)' }}>({u.email})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      {/* LTP Data Section */}
      <div style={{ 
        marginBottom: 'clamp(1.5em, 4vw, 2em)', 
        background: '#fff', 
        borderRadius: 8, 
        padding: 'clamp(1em, 2.5vw, 1.5em)', 
        boxShadow: '0 1px 6px rgba(0,0,0,0.1)', 
        border: '1px solid #e0e0e0' 
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '1em',
          marginBottom: '1em' 
        }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            justifyContent: 'space-between', 
            alignItems: 'center', 
            gap: '1em'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1em', flexWrap: 'wrap' }}>
              <h3 style={{ 
                color: '#2c3e50', 
                fontSize: 'clamp(1.1em, 2.8vw, 1.2em)', 
                margin: 0 
              }}>
                Live Market Data (LTP)
              </h3>
              {updateCount > 0 && (
                <span style={{ 
                  background: '#28a745', 
                  color: '#fff', 
                  padding: 'clamp(0.2em, 1vw, 0.4em) clamp(0.4em, 1.5vw, 0.8em)', 
                  borderRadius: '12px', 
                  fontSize: 'clamp(10px, 2vw, 12px)',
                  fontWeight: 500
                }}>
                  Updates: {updateCount}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5em', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setAutoRefresh(!autoRefresh)}
                style={{ 
                  padding: 'clamp(0.4em, 1.5vw, 0.6em) clamp(0.6em, 2vw, 1em)', 
                  borderRadius: 4, 
                  border: '1px solid #28a745', 
                  background: autoRefresh ? '#28a745' : '#fff', 
                  color: autoRefresh ? '#fff' : '#28a745', 
                  fontWeight: 500, 
                  cursor: 'pointer',
                  fontSize: 'clamp(11px, 2.2vw, 13px)'
                }}
              >
                {autoRefresh ? 'Auto ON' : 'Auto OFF'}
              </button>
              <button 
                onClick={handleFullRefresh}
                disabled={loading.options || loading.ltp}
                style={{ 
                  padding: 'clamp(0.4em, 1.5vw, 0.6em) clamp(0.6em, 2vw, 1em)', 
                  borderRadius: 4, 
                  border: '1px solid #007bff', 
                  background: '#007bff', 
                  color: '#fff', 
                  fontWeight: 500, 
                  cursor: (loading.options || loading.ltp) ? 'not-allowed' : 'pointer',
                  opacity: (loading.options || loading.ltp) ? 0.6 : 1,
                  fontSize: 'clamp(11px, 2.2vw, 13px)'
                }}
              >
                {(loading.options || loading.ltp) ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Last Update Time */}
        {lastLTPUpdate && (
          <div style={{ 
            fontSize: 'clamp(10px, 2vw, 12px)', 
            color: '#6c757d', 
            marginBottom: '1em',
            fontStyle: 'italic'
          }}>
            Last updated: {lastLTPUpdate.toLocaleTimeString()}
          </div>
        )}

        {error.ltp && (
          <div style={{ 
            background: '#f8d7da', 
            color: '#721c24', 
            padding: 'clamp(0.6em, 2vw, 0.8em)', 
            borderRadius: '6px', 
            marginBottom: '1em', 
            border: '1px solid #f5c6cb', 
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            textAlign: 'center',
            fontWeight: 500
          }}>
            {error.ltp}
          </div>
        )}

        {loading.ltp ? (
          <div style={{ textAlign: 'center', padding: '2em' }}>
            <div className="loading-spinner" />
            <p style={{ color: '#333', marginTop: '1em', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
              Loading market data...
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: 'clamp(0.8em, 2vw, 1em)' 
          }}>
            {Object.entries(ltpData).map(([symbol, data]) => (
              <div key={symbol} style={{ 
                background: '#f8f9fa', 
                borderRadius: 6, 
                padding: 'clamp(0.8em, 2vw, 1em)', 
                border: '1px solid #e0e0e0',
                borderLeft: '4px solid #e0e0e0',
              }}>
                <h4 style={{ 
                  color: '#2c3e50', 
                  marginBottom: '0.5em', 
                  fontSize: 'clamp(1em, 2.5vw, 1.1em)' 
                }}>
                  {symbol}
                </h4>
                <p style={{ margin: '0.5em 0', fontSize: 'clamp(11px, 2.2vw, 13px)' }}>
                  LTP: {formatINR(data.ltp)}
                </p>
                <p style={{ margin: '0.5em 0', fontSize: 'clamp(11px, 2.2vw, 13px)' }}>
                  Last Price: {formatINR(data.lastPrice)}
                </p>
                <p style={{ margin: '0.5em 0', fontSize: 'clamp(11px, 2.2vw, 13px)' }}>
                  Change: {formatINR(data.change)}
                </p>
                <p style={{ margin: '0.5em 0', fontSize: 'clamp(11px, 2.2vw, 13px)' }}>
                  Change Percent: {data.changePercent}%
                </p>
                <p style={{ margin: '0.5em 0', fontSize: 'clamp(11px, 2.2vw, 13px)' }}>
                  Volume: {data.volume}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Option Chain Section */}
      <div style={{ 
        padding: 'clamp(1em, 2.5vw, 1.5em)', 
        background: '#fff', 
        borderRadius: '8px', 
        boxShadow: '0 1px 6px rgba(0,0,0,0.1)', 
        border: '1px solid #e0e0e0',
        marginTop: 'clamp(1.5em, 4vw, 2em)'
      }}>
        <h3 style={{ 
          color: '#2c3e50', 
          marginBottom: 'clamp(0.8em, 2vw, 1em)', 
          fontSize: 'clamp(1.1em, 2.8vw, 1.2em)' 
        }}>
          Option Chain - {underlying} ({expiry})
        </h3>
        
        {/* Debug: Show LTP API response and option symbols */}
        <div style={{ background: '#fffbe6', color: '#856404', border: '1px solid #ffe58f', borderRadius: 6, padding: '0.8em', marginBottom: '1em', fontSize: 'clamp(11px, 2vw, 13px)' }}>
          <div><strong>Debug: Option Symbols Used:</strong> <span style={{ wordBreak: 'break-all' }}>{debugOptionSymbols.join(', ')}</span></div>
          <div style={{ marginTop: 8 }}><strong>Debug: Raw LTP API Response:</strong>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#fffde7', padding: 8, borderRadius: 4, maxHeight: 200, overflow: 'auto' }}>{JSON.stringify(debugLTPResponse, null, 2)}</pre>
          </div>
        </div>
        
        {/* Selected Option Info */}
        {selectedOption && (
          <div style={{ 
            background: '#e3f2fd', 
            padding: 'clamp(0.6em, 1.5vw, 0.8em)', 
            borderRadius: '4px', 
            marginBottom: '1em',
            border: '1px solid #bbdefb'
          }}>
            <div style={{ 
              fontSize: 'clamp(11px, 2.2vw, 13px)', 
              color: '#1976d2', 
              marginBottom: '0.3em' 
            }}>
              Selected Option: {selectedOption.tradingSymbol || selectedOption.symbol || 'N/A'}
            </div>
            <div style={{ 
              fontSize: 'clamp(10px, 2vw, 12px)', 
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
          isAdmin={true}
        />
        
        {/* Option Table */}
        <OptionTable 
          optionChain={options}
          loading={loading.options}
          error={error.options}
          onOptionSelect={handleOptionSelect}
          onRefresh={handleFullRefresh}
          isAdmin={true}
        />
      </div>
    </div>
  );
};

export default AdminTradingPortal;