import axios from 'axios';
import { API_ENDPOINTS } from '../config/environment';

// Add a request interceptor to attach the token automatically
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.url && (config.url.startsWith('/api') || config.url.startsWith('https://v4fintechtradingapi-production.up.railway.app/api'))) {
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

// TRADING API endpoints - Updated to use Railway deployment
// Legacy AWS URLs commented out for reference

// Place order through admin trading system
export const placeOrder = async (orderData) => {
  try {
    console.log('Placing order with data:', orderData);
    // New Railway URL
    const response = await axios.post(API_ENDPOINTS.ADMIN.TRADES.INITIATE, orderData);
    // Legacy AWS URL (commented out)
    // const response = await axios.post('https://y9tyscpumt.us-east-1.awsapprunner.com/api/admin/trades/initiate', orderData);
    console.log('Order placement response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

// Get trading positions
export const getPositions = async () => {
  try {
    // New Railway URL
    const response = await axios.get(API_ENDPOINTS.TRADING.POSITIONS);
    // Legacy AWS URL (commented out)
    // const response = await axios.get('https://y9tyscpumt.us-east-1.awsapprunner.com/api/trading/positions');
    return response.data;
  } catch (error) {
    console.error('Error fetching positions:', error);
    throw error;
  }
};

// Get order history
export const getOrderHistory = async () => {
    try {
        const response = await axios.get('https://apistocktrading-production.up.railway.app/api/trading/order-history');
        return response.data;
    } catch (error) {
        console.error('Error fetching order history:', error);
        // Return empty orders with success flag to prevent UI breaks
        return { 
            success: true, 
            data: [], 
            message: 'No orders available at the moment' 
        };
    }
};

// NEW TRADING ENDPOINTS - Updated with working URLs

// Get user broker trades
export const getUserBrokerTrades = async () => {
    try {
        const response = await axios.get('https://apistocktrading-production.up.railway.app/api/users/me/broker/trades');
        return response.data;
    } catch (error) {
        console.error('Error fetching user broker trades:', error);
        throw error;
    }
};

// Get user broker order book
export const getUserBrokerOrderBook = async () => {
    try {
        const response = await axios.get('https://apistocktrading-production.up.railway.app/api/users/me/broker/order-book');
        return response.data;
    } catch (error) {
        console.error('Error fetching user broker order book:', error);
        
        // If it's a 400 error, user might not be connected to broker or have no orders
        if (error.response?.status === 400) {
            console.log('User not connected to broker or no orders available, returning empty order book');
            return {
                success: true,
                data: [],
                message: 'No orders available - user may not be connected to broker'
            };
        }
        
        // For other errors, return empty order book
        return {
            success: true,
            data: [],
            message: 'Unable to fetch order book - using fallback data'
        };
    }
};

// Get specific order details
export const getOrderDetails = async (orderId) => {
    try {
        const response = await axios.get(`https://apistocktrading-production.up.railway.app/api/users/me/broker/orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching order details:', error);
        throw error;
    }
};

// Cancel specific order
export const cancelOrder = async (orderId) => {
    try {
        const response = await axios.delete(`https://apistocktrading-production.up.railway.app/api/users/me/broker/orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error canceling order:', error);
        throw error;
    }
};

// Modify specific order
export const modifyOrder = async (orderId, orderData) => {
    try {
        const response = await axios.put(`https://apistocktrading-production.up.railway.app/api/users/me/broker/orders/${orderId}`, orderData);
        return response.data;
    } catch (error) {
        console.error('Error modifying order:', error);
        throw error;
    }
};

// Legacy functions for backward compatibility
export const getTradingPositions = async () => {
    try {
        const response = await axios.get('https://apistocktrading-production.up.railway.app/api/trading/positions');
        return response.data;
    } catch (error) {
        console.error('Error fetching trading positions:', error);
        return { 
            success: true, 
            data: [], 
            message: 'No trading positions available at the moment' 
        };
    }
};

export const getTradingOrderHistory = async () => {
    try {
        const response = await axios.get('https://apistocktrading-production.up.railway.app/api/trading/order-history');
        return response.data;
    } catch (error) {
        console.error('Error fetching trading order history:', error);
        return { 
            success: true, 
            data: [], 
            message: 'No trading orders available at the moment' 
        };
    }
};

// Trading-specific utility functions
export const calculateOrderValue = (quantity, price) => {
    return quantity * price;
};

export const calculateBrokerage = (orderValue) => {
    // Simple brokerage calculation (can be customized based on broker)
    return Math.min(20, orderValue * 0.0005); // Max 20 or 0.05%
};

export const calculateTaxes = (orderValue) => {
    // Simple tax calculation (can be customized based on exchange)
    return orderValue * 0.0005; // 0.05% for STT
};

export const calculateNetAmount = (orderValue, brokerage, taxes) => {
    return orderValue + brokerage + taxes;
};


