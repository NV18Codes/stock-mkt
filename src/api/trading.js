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

// TRADING API endpoints - Updated with exact URLs from the provided APIs

// TRADE EXECUTION API endpoints
export const placeTradeOrder = async (orderData) => {
    try {
        const response = await axios.post('https://apistocktrading-production.up.railway.app/api/admin/trades/initiate', orderData);
        console.log('Trade order response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error placing trade order:', error);
        throw error;
    }
};

// Get positions
export const getPositions = async () => {
    try {
        const response = await axios.get('https://apistocktrading-production.up.railway.app/api/trading/positions');
        return response.data;
    } catch (error) {
        console.error('Error fetching positions:', error);
        // Return empty positions with success flag to prevent UI breaks
        return { 
            success: true, 
            data: [], 
            message: 'No positions available at the moment' 
        };
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

// NEW TRADING ENDPOINTS

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
        throw error;
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


