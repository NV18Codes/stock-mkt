import React, { useState, useEffect } from 'react';
import { getAdminUsers, getAllSegments, initiateTrade } from '../../api/admin';
import AdminOrderForm from './AdminOrderForm';

const formatINR = (value) => {
  const num = typeof value === 'object' && value !== null ? value.net : value;
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
};



const AdminTradingPortal = () => {
  const [users, setUsers] = useState([]);
  const [segments, setSegments] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [loading, setLoading] = useState({
    users: true,
    segments: true
  });
  const [error, setError] = useState({
    users: '',
    segments: ''
  });
  const [orderStatus, setOrderStatus] = useState('');

  // Load users and segments on component mount with better error handling
  useEffect(() => {
    const fetchData = async () => {
      // Fetch users
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

      // Fetch segments
      setLoading(prev => ({ ...prev, segments: true }));
      setError(prev => ({ ...prev, segments: '' }));
      try {
        console.log('Fetching segments for admin...');
        const segmentsResponse = await getAllSegments();
        console.log('Segments response:', segmentsResponse);
        
        let segmentsData = [];
        if (segmentsResponse && segmentsResponse.data && Array.isArray(segmentsResponse.data)) {
          segmentsData = segmentsResponse.data;
        } else if (segmentsResponse && Array.isArray(segmentsResponse)) {
          segmentsData = segmentsResponse;
        } else if (segmentsResponse && segmentsResponse.success && segmentsResponse.data) {
          segmentsData = segmentsResponse.data;
        }
        
        console.log('Setting segments data:', segmentsData);
        setSegments(segmentsData);
      } catch (err) {
        console.error('Error fetching segments:', err);
        setError(prev => ({ ...prev, segments: 'Failed to load segments' }));
        setSegments([]);
      } finally {
        setLoading(prev => ({ ...prev, segments: false }));
      }
    };

    fetchData();
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
      
      // Call the actual trading API
      const response = await initiateTrade(orderData);
      console.log('Trade initiation response:', response);
      
      if (response && response.success) {
        setOrderStatus('Order placed successfully!');
        // Refresh users data to show updated status
        // You might want to add a callback to refresh the users list
      } else {
        setOrderStatus('Order placement failed. Please check the details.');
      }
      
      // Clear status after 5 seconds
      setTimeout(() => setOrderStatus(''), 5000);
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderStatus(`Failed to place order: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      setTimeout(() => setOrderStatus(''), 5000);
    }
  };

  // Filter out admin users and apply segment filtering
  const filteredUsers = users.filter(user => {
    // Exclude admin users
    if ((user.role || user.user_role || 'user') === 'admin') return false;
    
    // Apply segment filtering
    if (selectedSegment !== 'all') {
      if (user.segment_id !== selectedSegment) return false;
    }
    
    // Apply search filtering
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      if (!user.name?.toLowerCase().includes(searchLower) && 
          !user.email?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });

  if (loading.users || loading.segments) {
    return (
      <div style={{ textAlign: 'center', padding: '2em' }}>
        <div className="loading-spinner" />
        <p style={{ color: '#333', marginTop: '1em', fontSize: 14 }}>
          {loading.users ? 'Loading users...' : 'Loading segments...'}
        </p>
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'clamp(1em, 2.5vw, 1.5em)',
        alignItems: 'end'
      }}>
        <div>
          <label style={{ fontWeight: 500, fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Filter by Segment:</label>
          <select 
            value={selectedSegment} 
            onChange={(e) => setSelectedSegment(e.target.value)} 
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
            {segments.map(segment => (
              <option key={segment.id} value={segment.id}>{segment.name}</option>
            ))}
          </select>
          {error.segments && (
            <p style={{ 
              color: '#dc3545', 
              fontSize: 'clamp(10px, 2vw, 12px)', 
              marginTop: '0.3em',
              marginBottom: 0
            }}>
              {error.segments}
            </p>
          )}
        </div>
        
        <div>
          <label style={{ fontWeight: 500, fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Search Users:</label>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%',
              padding: 'clamp(0.3em, 1.5vw, 0.5em) clamp(0.5em, 2vw, 1em)', 
              borderRadius: 4, 
              border: '1px solid #007bff', 
              fontWeight: 500,
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              marginTop: '0.3em'
            }}
          />
        </div>
        
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            padding: 'clamp(0.5em, 1.5vw, 0.8em) clamp(1em, 2.5vw, 1.5em)', 
            borderRadius: 6, 
            border: '1px solid #28a745', 
            background: '#28a745', 
            color: '#fff', 
            fontWeight: 600, 
            cursor: 'pointer',
            fontSize: 'clamp(12px, 2.5vw, 14px)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}
        >
          🔄 Refresh Users
        </button>
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
        
        {/* Note about trade placement */}
        <div style={{
          background: '#e3f2fd',
          color: '#1976d2',
          padding: '0.8em',
          borderRadius: '6px',
          border: '1px solid #bbdefb',
          marginBottom: '1em',
          fontSize: 'clamp(12px, 2.5vw, 14px)',
          fontWeight: 500
        }}>
          ℹ️ <strong>Note:</strong> Trade is placed only for all active users automatically. Inactive users will not receive the trade order.
        </div>
        
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
                minWidth: '600px'
              }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.5em', textAlign: 'left' }}></th>
                    <th style={{ padding: '0.5em', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '0.5em', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '0.5em', textAlign: 'left' }}>RMS Limit</th>
                    <th style={{ padding: '0.5em', textAlign: 'left' }}>Broker Connection Status</th>
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
                          {user.is_broker_connected ? 'Connected' : 'Disconnected'}
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

      {/* Admin Order Form */}
      <AdminOrderForm onOrderSubmit={handleOrderSubmit} selectedUserIds={selectedUserIds} />
    </div>
  );
};

export default AdminTradingPortal;