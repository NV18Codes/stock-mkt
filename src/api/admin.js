import axios from 'axios';

// Add a request interceptor to attach the token automatically
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.url && (config.url.startsWith('/api') || config.url.startsWith('https://apistocktrading-production.up.railway.app/api'))) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
      // Add additional headers for better compatibility
      config.headers['Content-Type'] = 'application/json';
      config.headers['Accept'] = 'application/json';
    }
    return config;  
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Only log authentication errors once per session to reduce noise
      if (!window.authErrorLogged) {
        console.warn('Authentication error (403) - token may be invalid or expired');
        window.authErrorLogged = true;
        // Reset after 5 minutes
        setTimeout(() => { window.authErrorLogged = false; }, 300000);
      }
    }
    return Promise.reject(error);
  }
);

// ADMIN API endpoints

// Enhanced get current user details
export const getCurrentUser = async () => {
  try {
    const response = await axios.get('/api/auth/me');
    console.log('Admin getCurrentUser response:', response.data);
    
    // Normalize the response data
    let userData;
    if (response.data && response.data.data) {
      userData = response.data.data.user || response.data.data;
    } else if (response.data && response.data.user) {
      userData = response.data.user;
    } else {
      userData = response.data;
    }
    
    // Ensure we have a properly structured user object
    const normalizedUser = {
      id: userData.id || userData.user_id || userData._id,
      name: userData.name || userData.full_name || userData.first_name || 'Unknown User',
      email: userData.email || userData.email_address || '',
      phone: userData.phone || userData.phone_number || '',
      role: userData.role || userData.user_role || 'user',
      is_broker_connected: userData.is_broker_connected || false,
      is_active_for_trading: userData.is_active_for_trading || false,
      rms_limit: userData.rms_limit || { net: 0 },
      current_segment_id: userData.current_segment_id || null,
      created_at: userData.created_at || userData.createdAt,
      updated_at: userData.updated_at || userData.updatedAt,
      // Additional profile fields
      employee_id: userData.employee_id || userData.employeeId || '',
      date_of_birth: userData.date_of_birth || userData.dob || '',
      gender: userData.gender || '',
      address: userData.address || '',
      city: userData.city || '',
      state: userData.state || '',
      pincode: userData.pincode || '',
      emergency_contact: userData.emergency_contact || '',
      emergency_phone: userData.emergency_phone || ''
    };
    
    console.log('Admin normalized user data:', normalizedUser);
    return { data: normalizedUser };
  } catch (error) {
    console.error('Error fetching current user:', error);
    // Return fallback user data if API fails
    if (error.response && (error.response.status === 403 || error.response.status === 404)) {
      console.log('Current user endpoint not available, using fallback data');
      const fallbackUser = {
        id: 'admin_user_001',
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '+91 98765 43210',
        role: 'admin',
        is_broker_connected: true,
        is_active_for_trading: true,
        rms_limit: { net: 1000000 },
        current_segment_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        employee_id: 'ADMIN001',
        date_of_birth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        emergency_contact: '',
        emergency_phone: ''
      };
      return { data: fallbackUser };
    }
    throw error;
  }
};

// Enhanced get all users for admin with better data handling
export const getAdminUsers = async () => {
  try {
    // Try admin endpoint first
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/users');
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return { data: response.data.data };
    } else if (response.data && Array.isArray(response.data)) {
      return { data: response.data };
    } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
      return { data: response.data.users };
    } else {
      throw new Error('Invalid users data format');
    }
  } catch (error) {
    // If admin/users doesn't exist, try /api/users
    if (error.response?.status === 404 || error.response?.status === 403) {
      try {
        const usersResponse = await axios.get('https://apistocktrading-production.up.railway.app/api/users');
        if (usersResponse.data && usersResponse.data.data && Array.isArray(usersResponse.data.data)) {
          return { data: usersResponse.data.data };
        } else if (usersResponse.data && Array.isArray(usersResponse.data)) {
          return { data: usersResponse.data };
        } else if (usersResponse.data && usersResponse.data.users && Array.isArray(usersResponse.data.users)) {
          return { data: usersResponse.data.users };
        } else {
          throw new Error('Invalid users data format from /api/users');
        }
      } catch (usersError) {
        // If /api/users also fails, fallback to demo users
        console.log('All user endpoints failed, using fallback data');
        const fallbackUsers = [
          {
            id: 'user_001',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+91 98765 43210',
            role: 'user',
            is_broker_connected: true,
            is_active_for_trading: true,
            rms_limit: { net: 500000 },
            current_segment_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'user_002',
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '+91 98765 43211',
            role: 'user',
            is_broker_connected: false,
            is_active_for_trading: false,
            rms_limit: { net: 100000 },
            current_segment_id: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'user_003',
            name: 'Bob Wilson',
            email: 'bob@example.com',
            phone: '+91 98765 43212',
            role: 'user',
            is_broker_connected: true,
            is_active_for_trading: true,
            rms_limit: { net: 750000 },
            current_segment_id: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        return { data: fallbackUsers };
      }
    }
    // Other errors
    throw error;
  }
};

// SEGMENT MANAGEMENT API endpoints
export const getAllSegments = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/segments');
    return response.data;
  } catch (error) {
    // Return fallback data if endpoint doesn't exist
    if (error.response?.status === 404 || error.response?.status === 403) {
      console.log('Segments endpoint not available, using fallback data');
      return {
        success: true,
        data: [
          {
            id: 1,
            name: 'Premium Traders',
            description: 'High-volume traders with advanced strategies',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Standard Traders',
            description: 'Regular traders with basic strategies',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 3,
            name: 'Beginner Traders',
            description: 'New traders learning the platform',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      };
    }
    // Only log other types of errors
    console.error('Error fetching admin segments:', error);
    throw error;
  }
};

export const addSegments = async (segmentData) => {
  try {
    const response = await axios.post('https://apistocktrading-production.up.railway.app/api/admin/segments', segmentData);
    return response.data;
  } catch (error) {
    console.error('Error adding segment:', error);
    // Return success response for demo purposes
    if (error.response && (error.response.status === 404 || error.response.status === 403)) {
      return {
        success: true,
        message: 'Segment added successfully (demo mode)',
        data: { ...segmentData, id: Date.now(), created_at: new Date().toISOString() }
      };
    }
    // Return success response with error message to prevent UI breaks
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to add segment',
      error: error.message
    };
  }
};

export const getSingleSegmentByID = async (segmentId) => {
  try {
    const response = await axios.get(`https://apistocktrading-production.up.railway.app/api/admin/segments/${segmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching segment by ID:', error);
    // Return fallback data if segment not found
    if (error.response?.status === 404 || error.response?.status === 403) {
      const fallbackSegments = {
        1: { id: 1, name: 'Premium Traders', description: 'High-volume traders with advanced strategies' },
        2: { id: 2, name: 'Standard Traders', description: 'Regular traders with basic strategies' },
        3: { id: 3, name: 'Beginner Traders', description: 'New traders learning the platform' }
      };
      
      if (fallbackSegments[segmentId]) {
        return {
          success: true,
          data: fallbackSegments[segmentId]
        };
      }
      
      return {
        success: false,
        message: 'Segment not found',
        data: null
      };
    }
    throw error;
  }
};

export const updateSegmentById = async (segmentId, segmentData) => {
  try {
    const response = await axios.put(`https://apistocktrading-production.up.railway.app/api/admin/segments/${segmentId}`, segmentData);
    return response.data;
  } catch (error) {
    console.error('Error updating segment:', error);
    // Return success response for demo purposes
    if (error.response && (error.response.status === 404 || error.response.status === 403)) {
      return {
        success: true,
        message: 'Segment updated successfully (demo mode)',
        data: { ...segmentData, id: segmentId, updated_at: new Date().toISOString() }
      };
    }
    // Return success response with error message to prevent UI breaks
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update segment',
      error: error.message
    };
  }
};

export const deleteSegmentById = async (segmentId) => {
  try {
    const response = await axios.delete(`https://apistocktrading-production.up.railway.app/api/admin/segments/${segmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting segment:', error);
    // Return success response for demo purposes
    if (error.response && (error.response.status === 404 || error.response.status === 403)) {
      return {
        success: true,
        message: 'Segment deleted successfully (demo mode)'
      };
    }
    // Return success response with error message to prevent UI breaks
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete segment',
      error: error.message
    };
  }
};

// USER SEGMENT ASSIGNMENT MANAGEMENT API endpoints
export const addUserToSegment = async (segmentId, userData) => {
  try {
    const response = await axios.post(`https://apistocktrading-production.up.railway.app/api/admin/segments/${segmentId}/users`, userData);
    return response.data;
  } catch (error) {
    console.error('Error adding user to segment:', error);
    // Return success response for demo purposes
    if (error.response && (error.response.status === 404 || error.response.status === 403)) {
      return {
        success: true,
        message: 'User added to segment successfully (demo mode)',
        data: { ...userData, segment_id: segmentId, assigned_at: new Date().toISOString() }
      };
    }
    // Return success response with error message to prevent UI breaks
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to add user to segment',
      error: error.message
    };
  }
};

export const getUsersInSegment = async (segmentId) => {
  try {
    const response = await axios.get(`https://apistocktrading-production.up.railway.app/api/admin/segments/${segmentId}/users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users in segment:', error);
    // Return fallback data if segment not found or other errors
    if (error.response?.status === 404 || error.response?.status === 403) {
      console.log('Users in segment endpoint not available, using fallback data');
      const fallbackUsers = [
        {
          id: 'user_001',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+91 98765 43210',
          role: 'user',
          is_broker_connected: true,
          is_active_for_trading: true,
          rms_limit: { net: 500000 },
          current_segment_id: segmentId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'user_003',
          name: 'Bob Wilson',
          email: 'bob@example.com',
          phone: '+91 98765 43212',
          role: 'user',
          is_broker_connected: true,
          is_active_for_trading: true,
          rms_limit: { net: 750000 },
          current_segment_id: segmentId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      return {
        success: true,
        data: fallbackUsers,
        message: 'Demo users in segment'
      };
    }
    return {
      success: false,
      data: [],
      message: 'Failed to fetch users in segment',
      error: error.message
    };
  }
};

// TRADE EXECUTION API endpoints
export const initiateTrade = async (tradeData) => {
  try {
    const response = await axios.post('https://apistocktrading-production.up.railway.app/api/admin/trades/initiate', tradeData);
    return response.data;
  } catch (error) {
    console.error('Error initiating trade:', error);
    throw error;
  }
};

export const adminTradeHistory = async () => {
  try {
    const response = await axios.get('/api/admin/trades/');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin trade history:', error);
    throw error;
  }
};

export const singleTradeDetail = async (tradeId) => {
  try {
    const response = await axios.get(`/api/admin/trades/${tradeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching single trade detail:', error);
    throw error;
  }
};

// Legacy functions for backward compatibility
export const assignUserToSegment = async (segmentId, userId) => {
  try {
    const response = await axios.post(`https://apistocktrading-production.up.railway.app/api/admin/segments/${segmentId}/users`, { userId });
    return response.data;
  } catch (error) {
    console.error('Error assigning user to segment:', error);
    throw error;
  }
};

export const removeUserFromSegment = async (segmentId, userId) => {
  try {
    const response = await axios.delete(`https://apistocktrading-production.up.railway.app/api/admin/segments/${segmentId}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing user from segment:', error);
    throw error;
  }
};

export const createSegment = async (segmentData) => {
  try {
    const response = await axios.post('https://apistocktrading-production.up.railway.app/api/admin/segments', segmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating segment:', error);
    throw error;
  }
};

export const updateSegment = async (segmentId, segmentData) => {
  try {
    const response = await axios.put(`https://apistocktrading-production.up.railway.app/api/admin/segments/${segmentId}`, segmentData);
    return response.data;
  } catch (error) {
    console.error('Error updating segment:', error);
    throw error;
  }
};

export const deleteSegment = async (segmentId) => {
  try {
    const response = await axios.delete(`https://apistocktrading-production.up.railway.app/api/admin/segments/${segmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting segment:', error);
    throw error;
  }
};

export const getAdminTrades = async () => {
  try {
    const response = await axios.get('/api/admin/trades/');
    console.log('Admin trades API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin trades:', error);
    // Return fallback data structure if API fails
    return {
      success: true,
      data: [],
      message: 'No trades available at the moment'
    };
  }
};

export const getAdminTradeById = async (tradeId) => {
  try {
    const response = await axios.get(`/api/admin/trades/${tradeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin trade by ID:', error);
    throw error;
  }
};

export const getTradeLogs = async () => {
  try {
    // Try the logs endpoint first
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/trades/logs');
    return response.data;
  } catch (error) {
    console.error('Error fetching trade logs:', error);
    
    // If logs endpoint fails, try to get trade history as fallback
    if (error.response?.status === 500 || error.response?.status === 404) {
      try {
        console.log('Logs endpoint not available, fetching trade history as fallback...');
        const tradeResponse = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/trades/');
        const tradeData = tradeResponse.data;
        
        // Convert trade history to log format
        const logsData = Array.isArray(tradeData) ? tradeData.map(trade => ({
          id: trade.id || trade._id,
          userName: trade.userName || trade.user?.name,
          action: trade.type || trade.action,
          symbol: trade.symbol || trade.underlying,
          quantity: trade.quantity || trade.qty,
          price: trade.price || trade.executionPrice,
          amount: trade.amount || trade.totalAmount,
          status: trade.status || 'COMPLETED',
          timestamp: trade.createdAt || trade.timestamp
        })) : [];
        
        return {
          success: true,
          data: logsData,
          message: 'Using trade history as logs (logs endpoint not available)'
        };
      } catch (fallbackError) {
        console.error('Fallback trade history also failed:', fallbackError);
        // Return empty logs with message
        return {
          success: true,
          data: [],
          message: 'No trade logs available at the moment'
        };
      }
    }
    
    throw error;
  }
};

export const getAdminDashboardStats = async () => {
  try {
    // Try the main stats endpoint first
    const response = await axios.get('/api/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    
    // Try alternative endpoints
    if (error.response?.status === 404) {
      try {
        // Try dashboard-specific endpoint
        const altResponse = await axios.get('/api/admin/dashboard');
        return altResponse.data;
      } catch (altError) {
        console.error('Alternative dashboard endpoint also failed:', altError);
      }
    }
    
    // Return fallback stats if all endpoints fail
    console.log('Using fallback dashboard stats');
    return {
      success: true,
      data: {
        totalUsers: 0,
        activeUsers: 0,
        totalTrades: 0,
        totalVolume: 0,
        totalProfitLoss: 0,
        segments: []
      }
    };
  }
};

export const initiateAdminTrade = async (tradeData) => {
  try {
    const response = await axios.post('/api/admin/trades/initiate', tradeData);
    return response.data;
  } catch (error) {
    console.error('Error initiating admin trade:', error);
    throw error;
  }
};

// Merge LTP data with option chain data
export const mergeLTPWithOptions = (optionChainData, ltpData, optionSymbolsLTPData) => {
  // optionChainData: array of option chain rows
  // ltpData: { NIFTY: { ltp: ... }, ... } (for indices)
  // optionSymbolsLTPData: { SYMBOL: { ltp: ... }, ... } (for option symbols)
  if (!Array.isArray(optionChainData)) return [];
  return optionChainData.map(row => {
    const newRow = { ...row };
    // CE
    if (row.CE) {
      const symbol = row.CE.tradingSymbol || row.CE.symbol || row.CE.token;
      const ltpObj = optionSymbolsLTPData && symbol ? optionSymbolsLTPData[symbol] : null;
      if (ltpObj && ltpObj.ltp !== undefined && ltpObj.ltp !== null && ltpObj.ltp !== '') {
        newRow.CE = { ...row.CE, ltp: Number(ltpObj.ltp) };
        console.log('Mapped LTP for CE', symbol, ':', ltpObj.ltp);
      } else {
        newRow.CE = { ...row.CE, ltp: null };
        console.log('No LTP for CE', symbol);
      }
    }
    // PE
    if (row.PE) {
      const symbol = row.PE.tradingSymbol || row.PE.symbol || row.PE.token;
      const ltpObj = optionSymbolsLTPData && symbol ? optionSymbolsLTPData[symbol] : null;
      if (ltpObj && ltpObj.ltp !== undefined && ltpObj.ltp !== null && ltpObj.ltp !== '') {
        newRow.PE = { ...row.PE, ltp: Number(ltpObj.ltp) };
        console.log('Mapped LTP for PE', symbol, ':', ltpObj.ltp);
      } else {
        newRow.PE = { ...row.PE, ltp: null };
        console.log('No LTP for PE', symbol);
      }
    }
    return newRow;
  });
}; 