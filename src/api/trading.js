import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'https://apistocktrading-production.up.railway.app/api';

// Fetch option expiries for a given underlying
export const fetchOptionExpiries = async (underlying) => {
    try {
        const response = await axios.get(`${API}/market-data/option-expiries/${underlying}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching option expiries:', error);
        throw error;
    }
};

// Fetch option chain data
export const fetchOptionChain = async (params) => {
    try {
        console.log('Fetching option chain with params:', params);
        const url = `${API}/market-data/option-chain`;
        console.log('Option chain URL:', url);
        console.log('Query params:', params);
        
        const response = await axios.get(url, { params });
        console.log('Option chain response:', response);
        return response.data;
    } catch (error) {
        console.error('Error fetching option chain:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            params: error.config?.params
        });
        throw error;
    }
};

// Fetch available underlyings
export const fetchUnderlyings = async () => {
    try {
        const response = await axios.get(`${API}/market-data/option-underlyings`);
        return response.data;
    } catch (error) {
        console.error('Error fetching underlyings:', error);
        throw error;
    }
};

// Place a trade order
export const placeTradeOrder = async (order) => {
    try {
        const response = await axios.post(`${API}/trade`, order);
        return response.data;
    } catch (error) {
        console.error('Error placing trade order:', error);
        throw error;
    }
};

// Get positions
export const getPositions = async () => {
    try {
        const response = await axios.get(`${API}/positions`);
        return response.data;
    } catch (error) {
        console.error('Error fetching positions:', error);
        throw error;
    }
};

// Get order history
export const getOrderHistory = async () => {
    try {
        const response = await axios.get(`${API}/orders`);
        return response.data;
    } catch (error) {
        console.error('Error fetching order history:', error);
        throw error;
    }
};

// Get LTP data
export const getLTPData = async (symbol) => {
    try {
        const response = await axios.get(`${API}/market-data/ltp/${symbol}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching LTP data:', error);
        throw error;
    }
};
