import axios from 'axios';

// Add a request interceptor to attach the token automatically
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.url && config.url.startsWith('https://apistocktrading-production.up.railway.app/api')) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;  
  },
  (error) => Promise.reject(error)
);

// ADMIN API endpoints

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
      department: userData.department || '',
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
    if (error.response?.status === 404) {
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
        // If /api/users also fails, fallback to current user
        try {
          const currentUserResponse = await getCurrentUser();
          const currentUser = currentUserResponse.data;
          return { data: [currentUser] };
        } catch (currentUserError) {
          return { data: [] };
        }
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
    if (error.response?.status === 404) {
      return {
        success: true,
        data: [
          {
            id: 1,
            name: 'Premium Traders',
            description: 'High-volume traders with advanced strategies'
          },
          {
            id: 2,
            name: 'Standard Traders',
            description: 'Regular traders with basic strategies'
          },
          {
            id: 3,
            name: 'Beginner Traders',
            description: 'New traders learning the platform'
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
    throw error;
  }
};

export const getSingleSegmentByID = async (segmentId) => {
  try {
    const response = await axios.get(`https://apistocktrading-production.up.railway.app/api/admin/segments/${segmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching segment by ID:', error);
    throw error;
  }
};

export const updateSegmentById = async (segmentId, segmentData) => {
  try {
    const response = await axios.put(`https://apistocktrading-production.up.railway.app/api/admin/segments/${segmentId}`, segmentData);
    return response.data;
  } catch (error) {
    console.error('Error updating segment:', error);
    throw error;
  }
};

export const deleteSegmentById = async (segmentId) => {
  try {
    const response = await axios.delete(`https://apistocktrading-production.up.railway.app/api/admin/segments/${segmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting segment:', error);
    throw error;
  }
};

// USER SEGMENT ASSIGNMENT MANAGEMENT API endpoints
export const addUserToSegment = async (segmentId, userData) => {
  try {
    const response = await axios.post(`https://apistocktrading-production.up.railway.app/api/admin/segments/${segmentId}/users`, userData);
    return response.data;
  } catch (error) {
    console.error('Error adding user to segment:', error);
    throw error;
  }
};

export const getUsersInSegment = async (segmentId) => {
  try {
    const response = await axios.get(`https://apistocktrading-production.up.railway.app/api/admin/segments/${segmentId}/users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users in segment:', error);
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

export const adminTradeHistory = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/trades/');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin trade history:', error);
    throw error;
  }
};

export const singleTradeDetail = async (tradeId) => {
  try {
    const response = await axios.get(`https://apistocktrading-production.up.railway.app/api/admin/trades/${tradeId}`);
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
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/trades/');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin trades:', error);
    throw error;
  }
};

export const getAdminTradeById = async (tradeId) => {
  try {
    const response = await axios.get(`https://apistocktrading-production.up.railway.app/api/admin/trades/${tradeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin trade by ID:', error);
    throw error;
  }
};

export const getTradeLogs = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/trades/logs');
    return response.data;
  } catch (error) {
    console.error('Error fetching trade logs:', error);
    throw error;
  }
};

export const getAdminDashboardStats = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    // Return fallback stats if endpoint doesn't exist
    if (error.response?.status === 404) {
      return {
        success: true,
        data: {
          totalUsers: 0,
          activeUsers: 0,
          totalTrades: 0,
          totalVolume: 0,
          segments: []
        }
      };
    }
    throw error;
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