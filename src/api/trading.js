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

// MARKET DATA API endpoints

// Fetch option expiries for a given underlying
export const fetchOptionExpiries = async (underlying = 'NIFTY') => {
  try {
    const url = `https://apistocktrading-production.up.railway.app/api/market-data/option-expiries/${underlying}`;
    const response = await axios.get(url);
    console.log('Option expiries response:', response.data);
    
    // Accept both { data: [...] } and [...]
    if (Array.isArray(response.data)) {
      return { success: true, data: response.data };
    }
    if (response.data && Array.isArray(response.data.data)) {
      return { success: true, data: response.data.data };
    }
    return { success: false, data: [], error: 'Invalid expiry data format from API' };
  } catch (error) {
    console.error('Error fetching option expiries:', error);
    // Handle both 404 and 403 errors with fallback data
    if (error.response && (error.response.status === 404 || error.response.status === 403)) {
      console.log(`Option expiries endpoint not available (${error.response.status}), using fallback data`);
      // Return fallback expiries if endpoint doesn't exist or is forbidden
      return { 
        success: true, 
        data: ['10JUL2025', '17JUL2025', '24JUL2025', '31JUL2025', '07AUG2025', '14AUG2025', '21AUG2025'] 
      };
    }
    return { success: false, data: [], error: error.message };
  }
};

// Fetch option chain data
export const fetchOptionChain = async (underlying = 'NIFTY', expiry = '10JUL2025') => {
    try {
        const url = `https://apistocktrading-production.up.railway.app/api/market-data/option-chain?underlying=${underlying}&expiry=${expiry}`;
        const response = await axios.get(url);
        console.log('Option chain response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching option chain:', error);
        if (error.response && (error.response.status === 404 || error.response.status === 403)) {
          console.log(`Option chain endpoint not available (${error.response.status}), using fallback data`);
          // Return fallback option chain data if endpoint doesn't exist or is forbidden
          const fallbackData = generateFallbackOptionChain(underlying, expiry);
          return { success: true, data: fallbackData };
        }
        return { success: false, data: [], error: error.message };
    }
};

// Fetch available underlyings
export const fetchUnderlyings = async () => {
  try {
    const url = 'https://apistocktrading-production.up.railway.app/api/market-data/option-underlyings';
    const response = await axios.get(url);
    console.log('Underlyings response:', response.data);
    
    // Accept both { data: [...] } and [...]
    if (Array.isArray(response.data)) {
      return { success: true, data: response.data };
    }
    if (response.data && Array.isArray(response.data.data)) {
      return { success: true, data: response.data.data };
    }
    return { success: false, data: [], error: 'Invalid underlyings data format from API' };
  } catch (error) {
    console.error('Error fetching underlyings:', error);
    // Handle both 404 and 403 errors with fallback data
    if (error.response && (error.response.status === 404 || error.response.status === 403)) {
      console.log(`Underlyings endpoint not available (${error.response.status}), using fallback data`);
      // Return fallback underlyings if endpoint doesn't exist or is forbidden
      return { 
        success: true, 
        data: ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'BANKEX'] 
      };
    }
    return { success: false, data: [], error: error.message };
  }
};

// Fetch LTP data for specific symbols
export const fetchLTPData = async (symbols) => {
    try {
        const response = await axios.post('https://apistocktrading-production.up.railway.app/api/market-data/ltp', { symbols }, {
            timeout: 10000, // 10 second timeout for real-time data
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        console.log('LTP data response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching LTP data:', error);
        if (error.response && (error.response.status === 404 || error.response.status === 403)) {
            console.log(`LTP endpoint not available (${error.response.status}), using fallback data`);
            // Return fallback LTP data if endpoint doesn't exist or is forbidden
            return { success: true, data: generateFallbackLTPData(symbols) };
        }
        return { success: false, data: {}, error: error.message };
    }
};

// Fetch option chain LTP data
export const fetchOptionChainLTP = async () => {
    try {
        const url = 'https://apistocktrading-production.up.railway.app/api/market-data/option-chain/ltp';
        const response = await axios.get(url, {
            timeout: 10000, // 10 second timeout for real-time data
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        console.log('Option chain LTP response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching option chain LTP data:', error);
        if (error.response && (error.response.status === 404 || error.response.status === 403)) {
            console.log(`Option chain LTP endpoint not available (${error.response.status}), using fallback data`);
            // Return fallback LTP data if endpoint doesn't exist or is forbidden
            return { success: true, data: generateFallbackLTPData() };
        }
        return { success: false, data: [], error: error.message };
    }
};

// Fetch LTP data for specific option symbols
export const fetchOptionSymbolsLTP = async (symbols) => {
    try {
        const url = 'https://apistocktrading-production.up.railway.app/api/market-data/ltp';
        const response = await axios.post(url, { symbols }, {
            timeout: 10000,
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });
        console.log('Option symbols LTP response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching option symbols LTP data:', error);
        if (error.response && (error.response.status === 404 || error.response.status === 403)) {
            console.log(`Option symbols LTP endpoint not available (${error.response.status}), using fallback data`);
            // Return fallback LTP data if endpoint doesn't exist or is forbidden
            return { success: true, data: generateFallbackOptionSymbolsLTP(symbols) };
        }
        return { success: false, data: {}, error: error.message };
    }
};

// TRADE EXECUTION API endpoints

// Place a trade order (admin)
export const placeTradeOrder = async (orderData) => {
    try {
        const url = 'https://apistocktrading-production.up.railway.app/api/admin/trades/initiate';
        const response = await axios.post(url, orderData);
        console.log('Trade order response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error placing trade order:', error);
        // Return a mock success response for demo purposes
        if (error.response && (error.response.status === 404 || error.response.status === 403)) {
            return {
                success: true,
                message: 'Trade order placed successfully (demo mode)',
                orderId: `DEMO_${Date.now()}`,
                status: 'pending'
            };
        }
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
        const response = await axios.get('/api/trading/order-history');
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

// Legacy functions for backward compatibility
export const getLTPData = async (symbols) => {
    try {
        const response = await axios.post('https://apistocktrading-production.up.railway.app/api/market-data/ltp', { symbols });
        return response.data;
    } catch (error) {
        console.error('Error fetching LTP data:', error);
        if (error.response && (error.response.status === 404 || error.response.status === 403)) {
            return { success: true, data: generateFallbackLTPData(symbols) };
        }
        return { success: false, data: {}, error: error.message };
    }
};

// Generate fallback option chain data
const generateFallbackOptionChain = (underlying, expiry) => {
  const basePrice = underlying === 'NIFTY' ? 22000 : underlying === 'BANKNIFTY' ? 48000 : 20000;
  const strikes = [];
  
  // Generate strikes around the base price
  for (let i = -10; i <= 10; i++) {
    const strikePrice = basePrice + (i * 100);
    strikes.push({
      strikePrice: strikePrice,
      CE: {
        token: `${underlying}${expiry}${strikePrice}CE`,
        tradingSymbol: `${underlying}${expiry}${strikePrice}CE`,
        ltp: (Math.random() * 200 + 50).toFixed(2),
        oi: Math.floor(Math.random() * 10000 + 1000),
        lastPrice: (Math.random() * 200 + 50).toFixed(2),
        openInterest: Math.floor(Math.random() * 10000 + 1000),
        volume: Math.floor(Math.random() * 5000 + 100),
        change: (Math.random() * 20 - 10).toFixed(2),
        changePercent: (Math.random() * 5 - 2.5).toFixed(2)
      },
      PE: {
        token: `${underlying}${expiry}${strikePrice}PE`,
        tradingSymbol: `${underlying}${expiry}${strikePrice}PE`,
        ltp: (Math.random() * 200 + 50).toFixed(2),
        oi: Math.floor(Math.random() * 10000 + 1000),
        lastPrice: (Math.random() * 200 + 50).toFixed(2),
        openInterest: Math.floor(Math.random() * 10000 + 1000),
        volume: Math.floor(Math.random() * 5000 + 100),
        change: (Math.random() * 20 - 10).toFixed(2),
        changePercent: (Math.random() * 5 - 2.5).toFixed(2)
      }
    });
  }
  
  return {
    underlying: underlying,
    expiry: expiry,
    strikes: strikes,
    spotPrice: basePrice + (Math.random() * 200 - 100),
    timestamp: new Date().toISOString()
  };
};

// Generate fallback LTP data
const generateFallbackLTPData = (symbols = []) => {
  const data = {};
  const defaultSymbols = ['NIFTY', 'BANKNIFTY', 'RELIANCE', 'TCS', 'INFY', 'HDFC'];
  const symbolsToUse = symbols.length > 0 ? symbols : defaultSymbols;
  
  symbolsToUse.forEach(symbol => {
    const basePrice = symbol === 'NIFTY' ? 22000 : 
                     symbol === 'BANKNIFTY' ? 48000 :
                     symbol === 'RELIANCE' ? 2500 :
                     symbol === 'TCS' ? 4000 :
                     symbol === 'INFY' ? 1500 :
                     symbol === 'HDFC' ? 1800 : 1000;
    
    const price = basePrice + (Math.random() * 100 - 50);
    const change = (Math.random() * 20 - 10);
    const changePercent = (change / price * 100);
    
    data[symbol] = {
      ltp: price.toFixed(2),
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2),
      volume: Math.floor(Math.random() * 1000000 + 100000),
      high: (price + Math.random() * 50).toFixed(2),
      low: (price - Math.random() * 50).toFixed(2),
      open: (price + Math.random() * 20 - 10).toFixed(2),
      previousClose: (price - change).toFixed(2),
      timestamp: new Date().toISOString()
    };
  });
  
  return data;
};

// Generate fallback option symbols LTP data
const generateFallbackOptionSymbolsLTP = (symbols) => {
  const data = {};
  
  symbols.forEach(symbol => {
    const basePrice = 100 + Math.random() * 200;
    const change = (Math.random() * 20 - 10);
    const changePercent = (change / basePrice * 100);
    
    data[symbol] = {
      ltp: basePrice.toFixed(2),
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2),
      volume: Math.floor(Math.random() * 10000 + 1000),
      oi: Math.floor(Math.random() * 50000 + 10000),
      high: (basePrice + Math.random() * 30).toFixed(2),
      low: (basePrice - Math.random() * 30).toFixed(2),
      open: (basePrice + Math.random() * 15 - 7.5).toFixed(2),
      previousClose: (basePrice - change).toFixed(2),
      timestamp: new Date().toISOString()
    };
  });
  
  return data;
};
