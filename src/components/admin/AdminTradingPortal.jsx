import React, { useState, useEffect, useMemo } from 'react';
import { placeTradeOrder } from '../../api/trading';
import { getAdminUsers, getAllSegments } from '../../api/admin';
import AdminOrderForm from './AdminOrderForm';
import axios from 'axios';

const formatINR = (value) => {
  const num = typeof value === 'object' && value !== null ? value.net : value;
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};

const AdminTradingPortal = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [capitalFilter, setCapitalFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState({
    users: true
  });
  const [error, setError] = useState({
    users: ''
  });
  const [orderStatus, setOrderStatus] = useState('');



  // Load users and segments on component mount with better error handling
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

    const fetchSegments = async () => {
      try {
        const response = await getAllSegments();
        if (response.data && Array.isArray(response.data)) {
          setSegments(response.data);
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setSegments(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching segments:', err);
        // Set empty segments array if fetch fails
        setSegments([]);
      }
    };

    fetchUsers();
    fetchSegments();
  }, []);



  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };
  
  const selectAllUsers = () => setSelectedUserIds(filteredUsers.map(u => u.id));
  const deselectAllUsers = () => setSelectedUserIds([]);
  
  const selectActiveUsers = () => {
    const activeUsers = filteredUsers.filter(user => user.is_active_for_trading || user.isActive);
    setSelectedUserIds(activeUsers.map(u => u.id));
  };
  
  const selectInactiveUsers = () => {
    const inactiveUsers = filteredUsers.filter(user => !(user.is_active_for_trading || user.isActive));
    setSelectedUserIds(inactiveUsers.map(u => u.id));
  };

  const handleOrderSubmit = async (orderData) => {
    try {
      setOrderStatus('Placing order...');
      console.log('Placing order:', orderData);
      
      // Here you would call your trading API
      // await placeTradeOrder(orderData);
      
      // For now, just log the order
      console.log('Order placed successfully:', orderData);
      setOrderStatus('Order placed successfully!');
      
      // Clear status after 3 seconds
      setTimeout(() => setOrderStatus(''), 3000);
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderStatus('Failed to place order. Please try again.');
      setTimeout(() => setOrderStatus(''), 5000);
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
    })
    .filter(user => {
      // Segment filter
      if (segmentFilter === 'all') return true;
      if (segmentFilter === 'unassigned') return !user.current_segment_id;
      return user.current_segment_id === segmentFilter;
    });

  if (loading.users) {
    return (
      <div style={{ textAlign: 'center', padding: '2em' }}>
        <div className="loading-spinner" />
        <p style={{ color: '#333', marginTop: '1em', fontSize: 14 }}>Loading users...</p>
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

      {/* Order Status */}
      {orderStatus && (
        <div style={{ 
          background: orderStatus.includes('successfully') ? '#d4edda' : orderStatus.includes('Failed') ? '#f8d7da' : '#e3f2fd',
          color: orderStatus.includes('successfully') ? '#155724' : orderStatus.includes('Failed') ? '#721c24' : '#1976d2',
          padding: 'clamp(0.8em, 2vw, 1em)', 
          borderRadius: '8px', 
          marginBottom: '1.5em', 
          border: orderStatus.includes('successfully') ? '1px solid #c3e6cb' : orderStatus.includes('Failed') ? '1px solid #f5c6cb' : '1px solid #bbdefb', 
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          fontWeight: 500,
          textAlign: 'center'
        }}>
          {orderStatus}
        </div>
      )}

      {/* User Filtering Controls */}
      <div style={{ 
        marginBottom: 'clamp(0.8em, 2vw, 1.2em)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1em'
      }}>
        <div>
          <label style={{ fontWeight: 500, fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Filter by Capital (RMS):</label>
          <select 
            value={capitalFilter} 
            onChange={e => setCapitalFilter(e.target.value)} 
            style={{ 
              width: '100%',
              padding: 'clamp(0.3em, 1.5vw, 0.5em) clamp(0.5em, 2vw, 1em)', 
              borderRadius: 4, 
              border: '1px solid #007bff', 
              fontWeight: 500,
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              marginTop: '0.3em'
            }}
          >
            <option value="all">All</option>
            <option value="lt1">Less than ₹1L</option>
            <option value="1to5">₹1L - ₹5L</option>
            <option value="gt5">More than ₹5L</option>
          </select>
        </div>
        
        <div>
          <label style={{ fontWeight: 500, fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Filter by Status:</label>
          <select
            value={userStatusFilter}
            onChange={e => setUserStatusFilter(e.target.value)}
            style={{
              width: '100%',
              padding: 'clamp(0.3em, 1.5vw, 0.5em) clamp(0.5em, 2vw, 1em)',
              borderRadius: 4,
              border: '1px solid #007bff',
              fontWeight: 500,
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              marginTop: '0.3em'
            }}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div>
          <label style={{ fontWeight: 500, fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Filter by Segment:</label>
          <select
            value={segmentFilter}
            onChange={e => setSegmentFilter(e.target.value)}
            style={{
              width: '100%',
              padding: 'clamp(0.3em, 1.5vw, 0.5em) clamp(0.5em, 2vw, 1em)',
              borderRadius: 4,
              border: '1px solid #007bff',
              fontWeight: 500,
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              marginTop: '0.3em'
            }}
          >
            <option value="all">All Segments</option>
            <option value="unassigned">Unassigned</option>
            {segments.map(segment => (
              <option key={segment.id} value={segment.id}>{segment.name}</option>
            ))}
          </select>
        </div>
      </div>



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
              <button 
                onClick={selectActiveUsers} 
                style={{ 
                  padding: 'clamp(0.3em, 1.5vw, 0.5em) clamp(0.5em, 2vw, 1em)', 
                  borderRadius: 4, 
                  border: '1px solid #28a745', 
                  background: '#28a745', 
                  color: '#fff', 
                  fontWeight: 500, 
                  cursor: 'pointer',
                  fontSize: 'clamp(11px, 2.2vw, 13px)'
                }}
              >
                Select Active
              </button>
              <button 
                onClick={selectInactiveUsers} 
                style={{ 
                  padding: 'clamp(0.3em, 1.5vw, 0.5em) clamp(0.5em, 2vw, 1em)', 
                  borderRadius: 4, 
                  border: '1px solid #ffc107', 
                  background: '#ffc107', 
                  color: '#000', 
                  fontWeight: 500, 
                  cursor: 'pointer',
                  fontSize: 'clamp(11px, 2.2vw, 13px)'
                }}
              >
                Select Inactive
              </button>
            </div>
            
            <div style={{ overflowX: 'auto', marginTop: '0.8em' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: 'clamp(11px, 2.2vw, 13px)',
                minWidth: '700px'
              }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.5em', textAlign: 'left' }}></th>
                    <th style={{ padding: '0.5em', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '0.5em', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '0.5em', textAlign: 'left' }}>RMS Limit</th>
                    <th style={{ padding: '0.5em', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '0.5em', textAlign: 'left' }}>Segment</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ 
                        textAlign: 'center', 
                        padding: '1em', 
                        color: '#6c757d',
                        fontSize: 'clamp(12px, 2.5vw, 14px)'
                      }}>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      const userSegment = segments.find(seg => seg.id === user.current_segment_id);
                      return (
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
                          <td style={{ padding: '0.5em' }}>
                            {userSegment ? userSegment.name : 'Unassigned'}
                          </td>
                        </tr>
                      );
                    })
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

      {/* Admin Order Form */}
      <AdminOrderForm onOrderSubmit={handleOrderSubmit} selectedUserIds={selectedUserIds} />
    </div>
  );
};

export default AdminTradingPortal;