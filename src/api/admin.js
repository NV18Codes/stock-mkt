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

// ADMIN API endpoints - Updated with exact URLs from the provided APIs

// MARKET DATA API endpoints
export const getOptionExpiries = async (underlying) => {
  try {
    const response = await axios.get(`https://apistocktrading-production.up.railway.app/api/admin/market-data/option-expiries/${underlying}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching option expiries:', error);
    throw error;
  }
};

export const getOptionChainStructure = async (underlying, expiry) => {
  try {
    const response = await axios.get(`https://apistocktrading-production.up.railway.app/api/admin/market-data/option-chain-structure/${underlying}/${expiry}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching option chain structure:', error);
    throw error;
  }
};

export const getOptionsUnderlying = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/market-data/options_underlying');
    return response.data;
  } catch (error) {
    console.error('Error fetching options underlying:', error);
    throw error;
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

export const adminTradeHistory = async (params = {}) => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/trades/history', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching admin trade history:', error);
    
    // If the main endpoint fails, try alternative endpoints
    if (error.response?.status === 500 || error.response?.status === 404) {
      console.log('Admin trade history endpoint failed, trying alternative endpoints...');
      
      try {
        // Try to get trades from the general trades endpoint
        const alternativeResponse = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/trades', { params });
        return {
          ...alternativeResponse.data,
          isFallback: true,
          message: 'Using alternative trades endpoint as fallback'
        };
      } catch (alternativeError) {
        console.error('Alternative trades endpoint also failed:', alternativeError);
        
        // If all endpoints fail, return empty data with fallback flag
        return {
          success: true,
          data: [],
          isFallback: true,
          message: 'All trade endpoints failed, returning empty data'
        };
      }
    }
    
    throw error;
  }
};

export const singleTradeDetail = async (tradeId) => {
  try {
    const response = await axios.get(`https://apistocktrading-production.up.railway.app/api/admin/trades/detail/${tradeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching single trade detail:', error);
    throw error;
  }
};

// SEGMENT MANAGEMENT API endpoints
export const getAllSegments = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/segments/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all segments from primary endpoint:', error);
    
    // Try alternative endpoints if the primary one fails
    try {
      // Try the segments endpoint without /all
      const altResponse = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/segments');
      if (altResponse.data && altResponse.data.data) {
        return altResponse.data;
      } else if (altResponse.data && Array.isArray(altResponse.data)) {
        return { data: altResponse.data };
      }
    } catch (altError) {
      console.error('Alternative segments endpoint also failed:', altError);
    }
    
    // If all endpoints fail, return empty segments array
    console.warn('All segment endpoints failed, returning empty array');
    return { data: [] };
  }
};

export const addSegments = async (segmentData) => {
  try {
    const response = await axios.post('https://apistocktrading-production.up.railway.app/api/admin/segments/add', segmentData);
    return response.data;
  } catch (error) {
    console.error('Error adding segment:', error);
    throw error;
  }
};

export const getSingleSegmentByID = async (segmentId) => {
  try {
    const response = await axios.get(`https://apistocktrading-production.up.railway.app/api/admin/segments/single/${segmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching single segment:', error);
    throw error;
  }
};

export const updateSegmentById = async (segmentId, segmentData) => {
  try {
    const response = await axios.put(`https://apistocktrading-production.up.railway.app/api/admin/segments/update/${segmentId}`, segmentData);
    return response.data;
  } catch (error) {
    console.error('Error updating segment:', error);
    throw error;
  }
};

export const deleteSegmentById = async (segmentId) => {
  try {
    const response = await axios.delete(`https://apistocktrading-production.up.railway.app/api/admin/segments/delete/${segmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting segment:', error);
    throw error;
  }
};

// USER SEGMENT ASSIGNMENT MANAGEMENT API endpoints
export const addUserToSegment = async (segmentId, userData) => {
  try {
    const response = await axios.post(`https://apistocktrading-production.up.railway.app/api/admin/segments/users/add/${segmentId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error adding user to segment:', error);
    throw error;
  }
};

export const getUsersInSegment = async (segmentId) => {
  try {
    const response = await axios.get(`https://apistocktrading-production.up.railway.app/api/admin/segments/users/list/${segmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users in segment:', error);
    throw error;
  }
};

// USER MANAGEMENT API endpoints
export const getSingleUser = async (userId) => {
  try {
    const response = await axios.get(`https://apistocktrading-production.up.railway.app/api/users/single/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching single user:', error);
    throw error;
  }
};

export const getListUsers = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/users/list');
    return response.data;
  } catch (error) {
    console.error('Error fetching users list:', error);
    throw error;
  }
};

// Enhanced get current user details
export const getCurrentUser = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/auth/me');
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
    throw error;
  }
};

// Enhanced get all users for admin with better data handling
export const getAdminUsers = async () => {
  try {
    // Try the new users list endpoint
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/users/list');
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
    console.error('Error fetching users from new endpoint:', error);
    
    // If the new endpoint fails, try the old one as fallback
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
      console.error('All user endpoints failed:', usersError);
      
      // If all endpoints fail, try to get at least the current user
      try {
        const currentUserResponse = await axios.get('https://apistocktrading-production.up.railway.app/api/auth/me');
        if (currentUserResponse.data && currentUserResponse.data.data) {
          const userData = currentUserResponse.data.data.user || currentUserResponse.data.data;
          // Return a single user array for now
          return { data: [userData] };
        }
      } catch (currentUserError) {
        console.error('Even current user endpoint failed:', currentUserError);
      }
      
      // Return empty array if all endpoints fail
      return { data: [] };
    }
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

// Get admin trades with proper error handling and fallback
export const getAdminTrades = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/trades/history');
    console.log('Admin trades API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin trades:', error);
    
    // If the main endpoint fails, try alternative endpoints
    if (error.response?.status === 500 || error.response?.status === 404) {
      console.log('Admin trades history endpoint failed, trying alternative endpoints...');
      
      try {
        // Try to get trades from the general trades endpoint
        const alternativeResponse = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/trades');
        console.log('Alternative trades endpoint response:', alternativeResponse.data);
        return {
          ...alternativeResponse.data,
          isFallback: true,
          message: 'Using alternative trades endpoint as fallback'
        };
      } catch (alternativeError) {
        console.error('Alternative trades endpoint also failed:', alternativeError);
        
        // If all endpoints fail, return empty data with fallback flag
        return {
          success: true,
          data: [],
          isFallback: true,
          message: 'All trade endpoints failed, returning empty data'
        };
      }
    }
    
    throw error;
  }
};

// Get trade logs with fallback to trade history
export const getTradeLogs = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/trades/logs');
    return response.data;
  } catch (error) {
    console.error('Error fetching trade logs:', error);
    
    // If logs endpoint fails, try to get trade history as fallback
    if (error.response?.status === 500 || error.response?.status === 404) {
      console.log('Logs endpoint not available, fetching trade history as fallback...');
      try {
        const historyResponse = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/trades/history');
        return {
          ...historyResponse.data,
          isFallback: true,
          message: 'Using trade history as fallback for logs'
        };
      } catch (historyError) {
        console.error('Fallback trade history also failed:', historyError);
        throw historyError;
      }
    }
    
    throw error;
  }
};

// Get admin dashboard stats - simplified to use available endpoints
export const getAdminDashboardStats = async () => {
  try {
    // Since the stats endpoint doesn't exist, we'll construct stats from available data
    const [usersResponse, tradesResponse] = await Promise.all([
      axios.get('https://apistocktrading-production.up.railway.app/api/users/list'),
      getAdminTrades() // Use the function with fallback logic instead of direct endpoint call
    ]);
    
    const users = usersResponse.data?.data || [];
    const trades = tradesResponse.data || [];
    
    // Calculate stats from available data
    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(user => user.is_active_for_trading).length,
      totalTrades: trades.length,
      totalVolume: trades.reduce((sum, trade) => sum + (trade.volume || 0), 0),
      totalProfitLoss: trades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0),
      segments: []
    };
    
    return {
      success: true,
      data: stats
    };
  } catch (error) {
    console.error('Error constructing admin dashboard stats:', error);
    
    // Return minimal stats if data fetching fails
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
    const response = await axios.post('https://apistocktrading-production.up.railway.app/api/admin/trades/initiate', tradeData);
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