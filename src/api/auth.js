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

// AUTH API endpoints
export const signup = (data) => axios.post('https://apistocktrading-production.up.railway.app/api/auth/signup', data);
export const signin = (data) => axios.post('https://apistocktrading-production.up.railway.app/api/auth/signin', data);
export const signout = () => axios.get('https://apistocktrading-production.up.railway.app/api/auth/signout');
export const getCurrentUser = () => axios.get('https://apistocktrading-production.up.railway.app/api/auth/me');
export const forgotPassword = (data) => axios.post('https://apistocktrading-production.up.railway.app/api/auth/forgot-password', data);
export const resetPassword = (data) => axios.post('https://apistocktrading-production.up.railway.app/api/auth/reset-password', data);

// USER API endpoints
export const userProfileUpdate = (data) => axios.put('https://apistocktrading-production.up.railway.app/api/users/me/profileUpdate', data);
export const addBrokerAccount = (data) => axios.post('https://apistocktrading-production.up.railway.app/api/users/me/broker/connect', data);
export const getDematLimit = () => axios.get('https://apistocktrading-production.up.railway.app/api/users/me/broker/rmsLimit');
export const verifyBrokerConnection = () => axios.get('https://apistocktrading-production.up.railway.app/api/users/me/broker/verify');
export const fetchMyBrokerProfile = () => axios.get('https://apistocktrading-production.up.railway.app/api/users/me/broker/profile');
export const fetchBrokerConnectionStatus = () => axios.get('https://apistocktrading-production.up.railway.app/api/users/me/broker/status');

// Enhanced get current user details with better error handling and data normalization
export const getCurrentUserEnhanced = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/auth/me');
    console.log('Raw current user response:', response.data);
    
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
    
    console.log('Normalized user data:', normalizedUser);
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
    if (error.response?.status === 400 || error.response?.status === 404) {
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
          throw error; // Throw the original error
        }
      }
    }
    
    throw error;
  }
};

// Enhanced get user profile data
export const getUserProfile = async () => {
  try {
    console.log('Fetching user profile...');
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/users/me/profile');
    console.log('Raw profile response:', response.data);
    
    // Normalize profile data
    let profileData;
    if (response.data && response.data.data) {
      profileData = response.data.data;
    } else if (response.data && response.data.user) {
      profileData = response.data.user;
    } else {
      profileData = response.data;
    }
    
    const normalizedProfile = {
      id: profileData.id || profileData.user_id || profileData._id,
      name: profileData.name || profileData.full_name || profileData.first_name || '',
      email: profileData.email || profileData.email_address || '',
      phone: profileData.phone || profileData.phone_number || '',
      role: profileData.role || profileData.user_role || 'user',
      department: profileData.department || '',
      employee_id: profileData.employee_id || profileData.employeeId || '',
      date_of_birth: profileData.date_of_birth || profileData.dob || '',
      gender: profileData.gender || '',
      address: profileData.address || '',
      city: profileData.city || '',
      state: profileData.state || '',
      pincode: profileData.pincode || '',
      emergency_contact: profileData.emergency_contact || '',
      emergency_phone: profileData.emergency_phone || '',
      is_broker_connected: profileData.is_broker_connected || false,
      is_active_for_trading: profileData.is_active_for_trading || false,
      rms_limit: profileData.rms_limit || { net: 0 },
      current_segment_id: profileData.current_segment_id || null,
      created_at: profileData.created_at || profileData.createdAt,
      updated_at: profileData.updated_at || profileData.updatedAt
    };
    
    console.log('Normalized profile data:', normalizedProfile);
    return { data: normalizedProfile };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    
    // If profile endpoint fails, try alternative endpoints
    if (error.response?.status === 404) {
      try {
        console.log('Profile endpoint not found, trying alternative endpoint...');
        const altResponse = await axios.get('https://apistocktrading-production.up.railway.app/api/users/profile');
        console.log('Alternative profile response:', altResponse.data);
        
        let profileData;
        if (altResponse.data && altResponse.data.data) {
          profileData = altResponse.data.data;
        } else if (altResponse.data && altResponse.data.user) {
          profileData = altResponse.data.user;
        } else {
          profileData = altResponse.data;
        }
        
        const normalizedProfile = {
          id: profileData.id || profileData.user_id || profileData._id,
          name: profileData.name || profileData.full_name || profileData.first_name || '',
          email: profileData.email || profileData.email_address || '',
          phone: profileData.phone || profileData.phone_number || '',
          role: profileData.role || profileData.user_role || 'user',
          department: profileData.department || '',
          employee_id: profileData.employee_id || profileData.employeeId || '',
          date_of_birth: profileData.date_of_birth || profileData.dob || '',
          gender: profileData.gender || '',
          address: profileData.address || '',
          city: profileData.city || '',
          state: profileData.state || '',
          pincode: profileData.pincode || '',
          emergency_contact: profileData.emergency_contact || '',
          emergency_phone: profileData.emergency_phone || '',
          is_broker_connected: profileData.is_broker_connected || false,
          is_active_for_trading: profileData.is_active_for_trading || false,
          rms_limit: profileData.rms_limit || { net: 0 },
          current_segment_id: profileData.current_segment_id || null,
          created_at: profileData.created_at || profileData.createdAt,
          updated_at: profileData.updated_at || profileData.updatedAt
        };
        
        return { data: normalizedProfile };
      } catch (altError) {
        console.error('Alternative profile endpoint also failed:', altError);
        throw error; // Throw the original error
      }
    }
    
    throw error;
  }
}; 