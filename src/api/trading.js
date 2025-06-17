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
        const response = await axios.get(`${API}/market-data/option-chain`, { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching option chain:', error);
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
