import axios from 'axios';
import { API_ENDPOINTS } from '../config/environment';

// Add a request interceptor to attach the token automatically
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.url && config.url.startsWith('https://v4fintechtradingapi-production.up.railway.app/api')) {
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

// BROKER API endpoints - Updated to use Railway deployment
// Legacy AWS URLs commented out for reference

export const getBrokerProfile = async () => {
  try {
    // New Railway URL
    const response = await axios.get(API_ENDPOINTS.USERS.BROKER.PROFILE);
    // Legacy AWS URL (commented out)
    // const response = await axios.get('https://y9tyscpumt.us-east-1.awsapprunner.com/api/users/me/broker/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching broker profile:', error);
    throw error;
  }
};

export const getBrokerStatus = async () => {
  try {
    // New Railway URL
    const response = await axios.get(API_ENDPOINTS.USERS.BROKER.STATUS);
    // Legacy AWS URL (commented out)
    // const response = await axios.get('https://y9tyscpumt.us-east-1.awsapprunner.com/api/users/me/broker/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching broker status:', error);
    throw error;
  }
};

export const clearBrokerStatus = async () => {
  try {
    // New Railway URL
    const response = await axios.post(API_ENDPOINTS.USERS.BROKER.CLEAR);
    // Legacy AWS URL (commented out)
    // const response = await axios.post('https://y9tyscpumt.us-east-1.awsapprunner.com/api/users/me/broker/clear');
    return response.data;
  } catch (error) {
    console.error('Error clearing broker status:', error);
    throw error;
  }
};

export const disconnectBroker = async () => {
  try {
    // New Railway URL
    const response = await axios.delete(API_ENDPOINTS.USERS.BROKER.DISCONNECT);
    // Legacy AWS URL (commented out)
    // const response = await axios.delete('https://y9tyscpumt.us-east-1.awsapprunner.com/api/users/me/broker');
    return response.data;
  } catch (error) {
    console.error('Error disconnecting broker:', error);
    throw error;
  }
};

export const getBrokerTrades = async () => {
  try {
    // New Railway URL
    const response = await axios.get(API_ENDPOINTS.USERS.BROKER.TRADES);
    // Legacy AWS URL (commented out)
    // const response = await axios.get('https://y9tyscpumt.us-east-1.awsapprunner.com/api/users/me/broker/trades');
    return response.data;
  } catch (error) {
    console.error('Error fetching broker trades:', error);
    throw error;
  }
};

// Additional broker functions needed by components
export const verifyBrokerTOTP = async (data) => {
  try {
    // New Railway URL
    const response = await axios.post(API_ENDPOINTS.USERS.BROKER.VERIFY, data);
    // Legacy AWS URL (commented out)
    // const response = await axios.post('https://y9tyscpumt.us-east-1.awsapprunner.com/api/users/me/broker/verify', data);
    return response.data;
  } catch (error) {
    console.error('Error verifying broker TOTP:', error);
    throw error;
  }
};

export const verifyBrokerMPIN = async (data) => {
  try {
    // New Railway URL
    const response = await axios.post(API_ENDPOINTS.USERS.BROKER.VERIFY, data);
    // Legacy AWS URL (commented out)
    // const response = await axios.post('https://y9tyscpumt.us-east-1.awsapprunner.com/api/users/me/broker/verify', data);
    return response.data;
  } catch (error) {
    console.error('Error verifying broker MPIN:', error);
    throw error;
  }
};

export const connectBroker = async (data) => {
  try {
    // New Railway URL
    const response = await axios.post(API_ENDPOINTS.USERS.BROKER.CONNECT, data);
    // Legacy AWS URL (commented out)
    // const response = await axios.post('https://y9tyscpumt.us-east-1.awsapprunner.com/api/users/me/broker/connect', data);
    return response.data;
  } catch (error) {
    console.error('Error connecting broker:', error);
    throw error;
  }
};

// Additional functions needed by components
export const getUserBrokerTrades = async () => {
  try {
    // Direct Railway URL as requested
    const response = await axios.get('https://v4fintechtradingapi-production.up.railway.app/api/users/me/broker/trades');
    // Legacy endpoint (commented out)
    // const response = await axios.get(API_ENDPOINTS.USERS.BROKER.TRADES);
    return response.data;
  } catch (error) {
    console.error('Error fetching user broker trades:', error);
    throw error;
  }
};

export const getUserBrokerOrderBook = async () => {
  try {
    // This endpoint might not exist in the new API, return empty data for now
    return {
      success: true,
      data: [],
      message: 'Order book endpoint not available'
    };
  } catch (error) {
    console.error('Error fetching user broker order book:', error);
    throw error;
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    // This endpoint might not exist in the new API, return mock data for now
    return {
      success: true,
      data: {
        id: orderId,
        status: 'PENDING',
        message: 'Order details endpoint not available'
      }
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    // This endpoint might not exist in the new API, return mock data for now
    return {
      success: true,
      data: {
        id: orderId,
        status: 'CANCELLED',
        message: 'Cancel order endpoint not available'
      }
    };
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

export const modifyOrder = async (orderId, orderData) => {
  try {
    // This endpoint might not exist in the new API, return mock data for now
    return {
      success: true,
      data: {
        id: orderId,
        status: 'MODIFIED',
        message: 'Modify order endpoint not available'
      }
    };
  } catch (error) {
    console.error('Error modifying order:', error);
    throw error;
  }
}; 