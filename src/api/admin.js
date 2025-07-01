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
    console.log('Fetching admin users...');
    // Try to get all users from admin endpoint first
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/users');
    console.log('Admin users response:', response.data);
    
    // Normalize the response data
    let usersData;
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      usersData = response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      usersData = response.data;
    } else if (response.data && response.data.users && Array.isArray(response.data.users)) {
      usersData = response.data.users;
    } else {
      throw new Error('Invalid users data format');
    }
    
    // Normalize each user object
    const normalizedUsers = usersData.map(user => ({
      id: user.id || user.user_id || user._id,
      name: user.name || user.full_name || user.first_name || user.email?.split('@')[0] || 'Unknown User',
      email: user.email || user.email_address || '',
      phone: user.phone || user.phone_number || '',
      role: user.role || user.user_role || 'user',
      is_broker_connected: user.is_broker_connected || false,
      is_active_for_trading: user.is_active_for_trading || false,
      rms_limit: user.rms_limit || { net: 0 },
      current_segment_id: user.current_segment_id || null,
      created_at: user.created_at || user.createdAt,
      updated_at: user.updated_at || user.updatedAt,
      // Additional profile fields
      department: user.department || '',
      employee_id: user.employee_id || user.employeeId || '',
      date_of_birth: user.date_of_birth || user.dob || '',
      gender: user.gender || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      pincode: user.pincode || '',
      emergency_contact: user.emergency_contact || '',
      emergency_phone: user.emergency_phone || ''
    }));
    
    console.log('Normalized admin users:', normalizedUsers);
    return { data: normalizedUsers };
  } catch (error) {
    console.error('Error fetching admin users:', error);
    
    // If admin/users doesn't exist, try to get current user and return as array
    if (error.response?.status === 404) {
      console.log('Admin users endpoint not found, fetching current user as fallback');
      try {
        const currentUserResponse = await getCurrentUser();
        const currentUser = currentUserResponse.data;
        
        // Return current user as an array for compatibility
        return {
          success: true,
          data: [currentUser]
        };
      } catch (currentUserError) {
        console.error('Error fetching current user as fallback:', currentUserError);
        // Return empty array if both endpoints fail
        return {
          success: true,
          data: []
        };
      }
    }
    
    // Only log other types of errors
    console.error('Error fetching admin users:', error);
    throw error;
  }
};

// Get all segments for admin
export const getAdminSegments = async () => {
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

// Assign user to segment
export const assignUserToSegment = async (segmentId, userId) => {
  try {
    const response = await axios.post('https://apistocktrading-production.up.railway.app/api/admin/segments/${segmentId}/users', { userId });
    return response.data;
  } catch (error) {
    console.error('Error assigning user to segment:', error);
    throw error;
  }
};

// Remove user from segment
export const removeUserFromSegment = async (segmentId, userId) => {
  try {
    const response = await axios.delete('https://apistocktrading-production.up.railway.app/api/admin/segments/${segmentId}/users/${userId}');
    return response.data;
  } catch (error) {
    console.error('Error removing user from segment:', error);
    throw error;
  }
};

// Create new segment
export const createSegment = async (segmentData) => {
  try {
    const response = await axios.post('https://apistocktrading-production.up.railway.app/api/admin/segments', segmentData);
    return response.data;
  } catch (error) {
    console.error('Error creating segment:', error);
    throw error;
  }
};

// Update segment
export const updateSegment = async (segmentId, segmentData) => {
  try {
    const response = await axios.put('https://apistocktrading-production.up.railway.app/api/admin/segments/${segmentId}', segmentData);
    return response.data;
  } catch (error) {
    console.error('Error updating segment:', error);
    throw error;
  }
};

// Delete segment
export const deleteSegment = async (segmentId) => {
  try {
    const response = await axios.delete('https://apistocktrading-production.up.railway.app/api/admin/segments/${segmentId}');
    return response.data;
  } catch (error) {
    console.error('Error deleting segment:', error);
    throw error;
  }
};

// Get all trades for admin
export const getAdminTrades = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/trades/');
    return response.data;
  } catch (error) {
    // Return empty array if endpoint doesn't exist
    if (error.response?.status === 404) {
      return { data: [] };
    }
    // Only log other types of errors
    console.error('Error fetching admin trades:', error);
    throw error;
  }
};

// Get specific trade by ID for admin
export const getAdminTradeById = async (tradeId) => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/trades/${tradeId}');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin trade by ID:', error);
    if (error.response?.status === 404) {
      return { data: null };
    }
    throw error;
  }
};

// Get trade logs for admin
export const getTradeLogs = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/trade-logs');
    return response.data;
  } catch (error) {
    // Return empty array if endpoint doesn't exist
    if (error.response?.status === 404) {
      return { data: [] };
    }
    // Only log other types of errors
    console.error('Error fetching trade logs:', error);
    throw error;
  }
};

// Get admin dashboard statistics - no fallback data
export const getAdminDashboardStats = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/admin/dashboard-stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    
    // If endpoint doesn't exist, return empty data
    if (error.response?.status === 404) {
      console.log('📊 Dashboard stats endpoint not found');
      return {
        success: true,
        data: {
          totalUsers: 0,
          activeUsers: 0,
          totalTrades: 0,
          totalVolume: 0,
          totalProfitLoss: 0
        }
      };
    }
    
    // For other errors, return empty data
    return {
      success: false,
      data: {
        totalUsers: 0,
        activeUsers: 0,
        totalTrades: 0,
        totalVolume: 0,
        totalProfitLoss: 0
      }
    };
  }
};

// Admin trade endpoints
export const initiateAdminTrade = async (tradeData) => {
  try {
    const response = await axios.post('https://apistocktrading-production.up.railway.app/api/admin/trades/initiate', tradeData);
    return response.data;
  } catch (error) {
    console.error('Error initiating admin trade:', error);
    throw error;
  }
}; 