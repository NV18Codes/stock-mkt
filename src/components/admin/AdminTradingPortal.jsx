import React, { useState, useEffect } from 'react';
import { fetchOptionExpiries, fetchOptionChain, fetchUnderlyings, placeTradeOrder } from '../../api/trading';
import { getAdminUsers } from '../../api/admin';
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
    options: true
  });
  const [error, setError] = useState({
    underlyings: '',
    expiries: '',
    options: ''
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [capitalFilter, setCapitalFilter] = useState('all');

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAdminUsers();
        setUsers(response.data || []);
      } catch (err) {
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

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

  const refreshOptionChain = async () => {
    setLoading(prev => ({ ...prev, options: true }));
    setError(prev => ({ ...prev, options: '' }));
    try {
      const response = await fetchOptionChain(underlying, expiry);
      if (response && response.success && response.data) {
        setOptions(response.data);
      } else {
        throw new Error('Failed to fetch option chain');
      }
    } catch (error) {
      console.error('Error refreshing option chain:', error);
      setError(prev => ({ ...prev, options: 'Failed to refresh option chain' }));
    } finally {
      setLoading(prev => ({ ...prev, options: false }));
    }
  };

  // Filter out admin users for trading
  const filteredUsers = users.filter(user => (user.role || user.user_role || 'user') !== 'admin').filter(user => {
    const rms = user.rms_limit?.net || user.rms_limit || 0;
    if (capitalFilter === 'all') return true;
    if (capitalFilter === 'lt1') return rms < 100000;
    if (capitalFilter === '1to5') return rms >= 100000 && rms <= 500000;
    if (capitalFilter === 'gt5') return rms > 500000;
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
    <div style={{ padding: '1.5em', background: '#ffffff', minHeight: '100vh' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '1.5em', textAlign: 'center', fontWeight: 600, fontSize: '2em' }}>
        Admin Trading Portal
      </h1>

      {/* User Filtering Controls */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 500, marginRight: 8 }}>Filter by Capital (RMS):</label>
        <select value={capitalFilter} onChange={e => setCapitalFilter(e.target.value)} style={{ padding: '0.3em 1em', borderRadius: 4, border: '1px solid #007bff', fontWeight: 500 }}>
          <option value="all">All</option>
          <option value="lt1">Less than ₹1L</option>
          <option value="1to5">₹1L - ₹5L</option>
          <option value="gt5">More than ₹5L</option>
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
                padding: '0.8em', 
                borderRadius: '6px', 
                marginBottom: '0.5em', 
                border: '1px solid #f5c6cb', 
                fontSize: 14 
              }}>
                {errorMsg}
            </div>
            )
          )}
            </div>
          )}

      {/* User Selection Table */}
      <div style={{ marginBottom: '2em', background: '#f8f9fa', borderRadius: 8, padding: '1em', border: '1px solid #e0e0e0' }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '1em', fontSize: '1.1em' }}>Select Users for Group Trade</h3>
        <button onClick={selectAllUsers} style={{ marginRight: 8, padding: '0.3em 1em', borderRadius: 4, border: '1px solid #007bff', background: '#007bff', color: '#fff', fontWeight: 500, cursor: 'pointer' }}>Select All</button>
        <button onClick={deselectAllUsers} style={{ marginRight: 16, padding: '0.3em 1em', borderRadius: 4, border: '1px solid #dc3545', background: '#dc3545', color: '#fff', fontWeight: 500, cursor: 'pointer' }}>Deselect All</button>
        <div style={{ overflowX: 'auto', marginTop: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Email</th>
                <th>RMS Limit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td><input type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={() => toggleUserSelection(user.id)} /></td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{formatINR(user.rms_limit)}</td>
                  <td>{user.is_active_for_trading || user.isActive ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Selected Users Summary */}
        <div style={{ marginTop: 16, background: '#e3f2fd', borderRadius: 6, padding: '0.8em', border: '1px solid #bbdefb', color: '#1976d2', fontSize: 14 }}>
          <strong>Trading on behalf of:</strong>
          {selectedUserIds.length === 0 ? (
            <span style={{ marginLeft: 8, color: '#dc3545' }}>No users selected</span>
          ) : (
            <ul style={{ margin: '0.5em 0 0 1.5em', padding: 0 }}>
              {filteredUsers.filter(u => selectedUserIds.includes(u.id)).map(u => (
                <li key={u.id}>{u.name} <span style={{ color: '#6c757d', fontSize: 13 }}>({u.email})</span></li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ 
        padding: '1.5em', 
        background: '#fff', 
        borderRadius: '8px', 
        boxShadow: '0 1px 6px rgba(0,0,0,0.1)', 
        border: '1px solid #e0e0e0', 
        marginBottom: '1.5em' 
      }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '1em', fontSize: '1.2em' }}>Trading Controls</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1em', marginBottom: '1em' }}>
            <div>
            <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>
              Underlying
            </label>
              <select
                value={underlying}
              onChange={(e) => setUnderlying(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6em',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                fontSize: 14,
                background: '#fff'
              }}
            >
              {underlyings.map(und => (
                  <option key={und} value={und}>{und}</option>
                ))}
              </select>
            </div>
          
            <div>
            <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>
              Expiry
            </label>
              <select
                value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6em',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                fontSize: 14,
                background: '#fff'
              }}
            >
              {expiries.map(exp => (
                  <option key={exp} value={exp}>{exp}</option>
                ))}
              </select>
          </div>
        </div>

            <div style={{ 
          padding: '0.8em', 
          background: '#e3f2fd', 
          borderRadius: '4px', 
          border: '1px solid #bbdefb',
          fontSize: 12,
          color: '#1976d2'
        }}>
          <strong>Current Selection:</strong> {underlying} - {expiry} | 
          Total Options: {options.length} | 
          Status: {loading.options ? 'Loading...' : 'Ready'}
        </div>
      </div>

      {/* Option Chain Section */}
        <div style={{ 
        padding: '1.5em', 
        background: '#fff', 
        borderRadius: '8px', 
        boxShadow: '0 1px 6px rgba(0,0,0,0.1)', 
        border: '1px solid #e0e0e0' 
      }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '1em', fontSize: '1.2em' }}>
          Option Chain - {underlying} ({expiry})
        </h3>
        
        {/* Selected Option Info */}
        {selectedOption && (
          <div style={{ 
            background: '#e3f2fd', 
            padding: '0.8em', 
            borderRadius: '4px', 
            marginBottom: '1em',
            border: '1px solid #bbdefb'
          }}>
            <div style={{ fontSize: 13, color: '#1976d2', marginBottom: '0.3em' }}>
              Selected Option: {selectedOption.tradingSymbol || selectedOption.symbol || 'N/A'}
            </div>
            <div style={{ fontSize: 12, color: '#1976d2' }}>
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
          onRefresh={refreshOptionChain}
          isAdmin={true}
        />
        </div>
    </div>
  );
};

export default AdminTradingPortal; 