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

// AUTH API endpoints - Updated with exact URLs from the provided APIs
export const signup = (data) => axios.post('https://apistocktrading-production.up.railway.app/api/auth/signup', data);
export const signin = (data) => axios.post('https://apistocktrading-production.up.railway.app/api/auth/signin', data);
export const signout = () => axios.get('https://apistocktrading-production.up.railway.app/api/auth/signout');
export const getCurrentUser = () => axios.get('https://apistocktrading-production.up.railway.app/api/auth/me');
export const forgotPassword = (data) => axios.post('https://apistocktrading-production.up.railway.app/api/auth/forgot-password', data);
export const resetPassword = (data) => axios.post('https://apistocktrading-production.up.railway.app/api/auth/reset-password', {
  password: data.password,
  accessToken: data.accessToken
});

// USER API endpoints - Updated with exact URLs
export const userProfileUpdate = (data) => axios.put('https://apistocktrading-production.up.railway.app/api/users/me/profileUpdate', data);
export const addBrokerAccount = async (data) => {
  try {
    const response = await axios.post('https://apistocktrading-production.up.railway.app/api/users/me/broker/connect', data);
    return response.data;
  } catch (error) {
    console.error('Error adding broker account:', error);
    throw error;
  }
};

export const getDematLimit = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/users/me/broker/rmsLimit');
    return response.data;
  } catch (error) {
    console.error('Error fetching demat limit:', error);
    throw error;
  }
};

export const verifyBrokerConnection = async (data) => {
  try {
    const response = await axios.post('https://apistocktrading-production.up.railway.app/api/users/me/broker/verify', data);
    return response.data;
  } catch (error) {
    console.error('Error verifying broker connection:', error);
    throw error;
  }
};

export const fetchMyBrokerProfile = async (totpData = null) => {
  try {
    // According to Postman, this endpoint requires POST with TOTP data
    // If no TOTP provided, try to get broker info from user data first
    if (!totpData) {
      console.log('No TOTP provided, trying to get broker info from user data...');
      try {
        const userResponse = await axios.get('https://apistocktrading-production.up.railway.app/api/auth/me');
        const userData = userResponse.data.data?.user || userResponse.data.data || userResponse.data;
        
        // Check if user has broker connection status
        if (userData && userData.is_broker_connected) {
          // User has a broker connected, construct profile from user data
          return {
            success: true,
            data: {
              broker_name: userData.broker_name || userData.broker || 'Connected Broker',
              broker_client_id: userData.broker_client_id || userData.account_id || 'N/A',
              is_active_for_trading: userData.is_active_for_trading || false,
              exchanges: userData.exchanges || [],
              products: userData.products || []
            }
          };
        }
      } catch (userError) {
        console.error('Error getting user data for broker info:', userError);
      }
      
      // Return a default "no broker" state if no TOTP and no user broker data
      return {
        success: true,
        data: {
          broker_name: 'No Broker Connected',
          broker_client_id: 'N/A',
          is_active_for_trading: false,
          exchanges: [],
          products: []
        }
      };
    }
    
    // If TOTP is provided, try the broker profile endpoint
    console.log('TOTP provided, trying broker profile endpoint...');
    const response = await axios.post('https://apistocktrading-production.up.railway.app/api/users/me/broker/profile', { totp: totpData });
    return response.data;
  } catch (error) {
    console.error('Error fetching broker profile:', error);
    
    // If the profile endpoint fails, try to get broker info from user data
    try {
      console.log('Broker profile endpoint failed, trying to get broker info from user data...');
      const userResponse = await axios.get('https://apistocktrading-production.up.railway.app/api/auth/me');
      const userData = userResponse.data.data?.user || userResponse.data.data || userResponse.data;
      
      // Check if user has broker connection status
      if (userData && userData.is_broker_connected) {
        // User has a broker connected, construct profile from user data
        return {
          success: true,
          data: {
            broker_name: userData.broker_name || userData.broker || 'Connected Broker',
            broker_client_id: userData.broker_client_id || userData.account_id || 'N/A',
            is_active_for_trading: userData.is_active_for_trading || false,
            exchanges: userData.exchanges || [],
            products: userData.products || []
          }
        };
      }
    } catch (userError) {
      console.error('Error getting user data for broker info:', userError);
    }
    
    // Return a default "no broker" state
    return {
      success: true,
      data: {
        broker_name: 'No Broker Connected',
        broker_client_id: 'N/A',
        is_active_for_trading: false,
        exchanges: [],
        products: []
      }
    };
  }
};

export const fetchBrokerConnectionStatus = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/users/me/broker/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching broker status:', error);
    throw error;
  }
};

export const clearBrokerProfile = async () => {
  try {
    // Use the working clear broker endpoint from Postman
    const response = await axios.post('https://apistocktrading-production.up.railway.app/api/users/me/broker/clear');
    return response.data;
  } catch (error) {
    console.error('Error clearing broker profile:', error);
    
    // If the clear endpoint fails, try to update user profile to remove broker info
    if (error.response?.status === 404) {
      console.log('Clear broker endpoint not found, trying to update user profile...');
      try {
        // Only update the fields that are safe to clear
        const updateResponse = await axios.put('https://apistocktrading-production.up.railway.app/api/users/me/profileUpdate', {
          is_active_for_trading: false
        });
        return {
          success: true,
          message: 'Broker profile cleared via profile update',
          data: updateResponse.data
        };
      } catch (updateError) {
        console.error('Error updating profile to clear broker info:', updateError);
        throw updateError;
      }
    }
    
    throw error;
  }
};

// Enhanced get current user details with better error handling and data normalization
export const getCurrentUserEnhanced = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/auth/me');
    
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
    
    return { data: normalizedUser };
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};

// Enhanced profile update endpoint
export const updateProfile = async (data) => {
  try {
    console.log('Updating profile with data:', data);
    
    // Try the main profile update endpoint first
    const response = await axios.put('https://apistocktrading-production.up.railway.app/api/users/me/profileUpdate', data);
    console.log('Profile update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    
    // If the main endpoint fails, try alternative endpoints
    if (error.response?.status === 400 || error.response?.status === 404 || error.response?.status === 403) {
      try {
        console.log('Trying alternative profile update endpoint...');
        // Try alternative endpoint format
        const altResponse = await axios.put('https://apistocktrading-production.up.railway.app/api/users/profile', data);
        console.log('Alternative profile update response:', altResponse.data);
        return altResponse.data;
      } catch (altError) {
        console.error('Alternative profile update also failed:', altError);
        
        // If both endpoints fail, try a simple user update
        try {
          console.log('Trying simple user update endpoint...');
          const simpleResponse = await axios.put('https://apistocktrading-production.up.railway.app/api/users/me', data);
          console.log('Simple user update response:', simpleResponse.data);
          return simpleResponse.data;
        } catch (simpleError) {
          console.error('All profile update endpoints failed:', simpleError);
          throw error; // Throw the original error instead of returning fallback data
        }
      }
    }
    
    throw error;
  }
};

// Enhanced get user profile data
export const getUserProfile = async () => {
  try {
    // Since the profile endpoint is not available, directly use the working auth endpoint
    const userResponse = await axios.get('https://apistocktrading-production.up.railway.app/api/auth/me');
    const userData = userResponse.data.data?.user || userResponse.data.data || userResponse.data;
    
    // Normalize the user data to match profile format
    const normalizedProfile = {
      id: userData.id || userData.user_id || userData._id,
      name: userData.name || userData.full_name || userData.first_name || '',
      email: userData.email || userData.email_address || '',
      phone: userData.phone || userData.phone_number || '',
      role: userData.role || userData.user_role || 'user',
      department: userData.department || '',
      employee_id: userData.employee_id || userData.employeeId || '',
      date_of_birth: userData.date_of_birth || userData.dob || '',
      gender: userData.gender || '',
      address: userData.address || '',
      city: userData.city || '',
      state: userData.state || '',
      pincode: userData.pincode || '',
      emergency_contact: userData.emergency_contact || '',
      emergency_phone: userData.emergency_phone || '',
      is_broker_connected: userData.is_broker_connected || false,
      is_active_for_trading: userData.is_active_for_trading || false,
      rms_limit: userData.rms_limit || { net: 0 },
      current_segment_id: userData.current_segment_id || null,
      created_at: userData.created_at || userData.createdAt,
      updated_at: userData.updated_at || userData.updatedAt
    };
    
    return { data: normalizedProfile };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Return a default profile structure
    return { 
      data: {
        id: '',
        name: '',
        email: '',
        phone: '',
        role: 'user',
        department: '',
        employee_id: '',
        date_of_birth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        emergency_contact: '',
        emergency_phone: '',
        is_broker_connected: false,
        is_active_for_trading: false,
        rms_limit: { net: 0 },
        current_segment_id: null,
        created_at: '',
        updated_at: ''
      }
    };
  }
}; 