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

// ANGEL ONE API endpoints

// Generate token for Angel One
export const generateToken = async (credentials) => {
  try {
    const response = await axios.post('https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByPassword', credentials, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB',
        'X-ClientLocalIP': 'CLIENT_LOCAL_IP',
        'X-ClientPublicIP': 'CLIENT_PUBLIC_IP',
        'X-MACAddress': 'MAC_ADDRESS',
        'X-PrivateKey': 'YOUR_PRIVATE_KEY'
      }
    });
    console.log('Angel One token response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error generating Angel One token:', error);
    throw error;
  }
};

// Get Angel One user profile
export const getAngelOneProfile = async (token) => {
  try {
    const response = await axios.get('https://apiconnect.angelone.in/rest/secure/angelbroking/user/v1/getProfile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB'
      }
    });
    console.log('Angel One profile response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching Angel One profile:', error);
    throw error;
  }
};

// Get Angel One RMS limits
export const getAngelOneRMSLimits = async (token) => {
  try {
    const response = await axios.get('https://apiconnect.angelone.in/rest/secure/angelbroking/user/v1/getRMS', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB'
      }
    });
    console.log('Angel One RMS limits response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching Angel One RMS limits:', error);
    throw error;
  }
};

// Get Angel One holdings
export const getAngelOneHoldings = async (token) => {
  try {
    const response = await axios.get('https://apiconnect.angelone.in/rest/secure/angelbroking/portfolio/v1/getHolding', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB'
      }
    });
    console.log('Angel One holdings response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching Angel One holdings:', error);
    throw error;
  }
};

// Get Angel One positions
export const getAngelOnePositions = async (token) => {
  try {
    const response = await axios.get('https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/getPosition', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB'
      }
    });
    console.log('Angel One positions response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching Angel One positions:', error);
    throw error;
  }
};

// Place order through Angel One
export const placeAngelOneOrder = async (token, orderData) => {
  try {
    const response = await axios.post('https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/placeOrder', orderData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB'
      }
    });
    console.log('Angel One order response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error placing Angel One order:', error);
    throw error;
  }
};

// Get Angel One order book
export const getAngelOneOrderBook = async (token) => {
  try {
    const response = await axios.get('https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/getOrderBook', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB'
      }
    });
    console.log('Angel One order book response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching Angel One order book:', error);
    throw error;
  }
};

// Cancel Angel One order
export const cancelAngelOneOrder = async (token, orderId) => {
  try {
    const response = await axios.delete(`https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/cancelOrder`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB'
      },
      data: { orderid: orderId }
    });
    console.log('Angel One cancel order response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error canceling Angel One order:', error);
    throw error;
  }
};

// Get Angel One trade book
export const getAngelOneTradeBook = async (token) => {
  try {
    const response = await axios.get('https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/getTradeBook', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB'
      }
    });
    console.log('Angel One trade book response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching Angel One trade book:', error);
    throw error;
  }
};

// Get Angel One market data
export const getAngelOneMarketData = async (token, symbols) => {
  try {
    const response = await axios.post('https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/getLTPData', { symbols }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB'
      }
    });
    console.log('Angel One market data response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching Angel One market data:', error);
    throw error;
  }
};

// Get Angel One option chain
export const getAngelOneOptionChain = async (token, symbol, expiryDate) => {
  try {
    const response = await axios.get(`https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/getOptionChain`, {
      params: { symbol, expiryDate },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB'
      }
    });
    console.log('Angel One option chain response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching Angel One option chain:', error);
    throw error;
  }
};

// Get Angel One historical data
export const getAngelOneHistoricalData = async (token, symbol, interval, fromDate, toDate) => {
  try {
    const response = await axios.get(`https://apiconnect.angelone.in/rest/secure/angelbroking/order/v1/getCandleData`, {
      params: { symbol, interval, fromDate, toDate },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-UserType': 'USER',
        'X-SourceID': 'WEB'
      }
    });
    console.log('Angel One historical data response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching Angel One historical data:', error);
    throw error;
  }
}; 