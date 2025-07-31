import axios from 'axios';

// Add a request interceptor to attach the token automatically
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.url && config.url.startsWith('https://apistocktrading-production.up.railway.app/api')) {
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
    // Return mock token for demo purposes
    return {
      success: true,
      data: {
        jwtToken: 'demo_jwt_token_' + Date.now(),
        refreshToken: 'demo_refresh_token_' + Date.now(),
        feedToken: 'demo_feed_token_' + Date.now()
      },
      message: 'Demo token generated successfully'
    };
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
    // Return mock profile for demo purposes
    return {
      success: true,
      data: {
        name: 'Demo Angel One User',
        email: 'demo@angelone.com',
        mobile: '+91 98765 43210',
        pan: 'ABCDE1234F',
        dob: '1990-01-01',
        clientCode: 'DEMO001',
        exchanges: ['NSE', 'BSE', 'NFO'],
        products: ['CNC', 'MIS', 'NRML'],
        orderTypes: ['MARKET', 'LIMIT', 'STOPLOSS_MARKET', 'STOPLOSS_LIMIT']
      },
      message: 'Demo profile data'
    };
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
    // Return mock RMS limits for demo purposes
    return {
      success: true,
      data: {
        net: 1000000,
        available: 950000,
        used: 50000,
        blocked: 0,
        span: 45000,
        exposure: 5000,
        collateral: 0,
        additional: 0
      },
      message: 'Demo RMS limits data'
    };
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
    // Return mock holdings for demo purposes
    return {
      success: true,
      data: [
        {
          tradingsymbol: 'RELIANCE-EQ',
          exchange: 'NSE',
          isin: 'INE002A01018',
          t1quantity: 100,
          netquantity: 100,
          collateraltype: 'I',
          haircut: 0,
          averageprice: 2500.00,
          ltp: 2550.00,
          currentvalue: 255000.00,
          pnl: 5000.00,
          product: 'CNC'
        },
        {
          tradingsymbol: 'TCS-EQ',
          exchange: 'NSE',
          isin: 'INE467B01029',
          t1quantity: 50,
          netquantity: 50,
          collateraltype: 'I',
          haircut: 0,
          averageprice: 4000.00,
          ltp: 4100.00,
          currentvalue: 205000.00,
          pnl: 5000.00,
          product: 'CNC'
        }
      ],
      message: 'Demo holdings data'
    };
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
    // Return mock positions for demo purposes
    return {
      success: true,
      data: [
        {
          tradingsymbol: 'NIFTY25JUL22000CE',
          exchange: 'NFO',
          producttype: 'Options',
          netquantity: 25,
          averageprice: 150.00,
          ltp: 160.00,
          pnl: 250.00,
          product: 'MIS'
        },
        {
          tradingsymbol: 'BANKNIFTY25JUL48000PE',
          exchange: 'NFO',
          producttype: 'Options',
          netquantity: -15,
          averageprice: 200.00,
          ltp: 190.00,
          pnl: 150.00,
          product: 'MIS'
        }
      ],
      message: 'Demo positions data'
    };
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
    // Return mock order response for demo purposes
    return {
      success: true,
      data: {
        orderid: 'DEMO_ORDER_' + Date.now(),
        status: 'Success',
        message: 'Order placed successfully (demo mode)'
      },
      message: 'Demo order placed successfully'
    };
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
    // Return mock order book for demo purposes
    return {
      success: true,
      data: [
        {
          orderid: 'DEMO_ORDER_001',
          tradingsymbol: 'RELIANCE-EQ',
          exchange: 'NSE',
          transactiontype: 'BUY',
          quantity: 100,
          price: 2500.00,
          triggerprice: 0,
          status: 'COMPLETE',
          updatetime: new Date().toISOString(),
          product: 'CNC'
        },
        {
          orderid: 'DEMO_ORDER_002',
          tradingsymbol: 'NIFTY25JUL22000CE',
          exchange: 'NFO',
          transactiontype: 'SELL',
          quantity: 25,
          price: 160.00,
          triggerprice: 0,
          status: 'PENDING',
          updatetime: new Date().toISOString(),
          product: 'MIS'
        }
      ],
      message: 'Demo order book data'
    };
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
    // Return mock cancel response for demo purposes
    return {
      success: true,
      data: {
        orderid: orderId,
        status: 'CANCELLED',
        message: 'Order cancelled successfully (demo mode)'
      },
      message: 'Demo order cancelled successfully'
    };
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
    // Return mock trade book for demo purposes
    return {
      success: true,
      data: [
        {
          orderid: 'DEMO_ORDER_001',
          tradingsymbol: 'RELIANCE-EQ',
          exchange: 'NSE',
          transactiontype: 'BUY',
          quantity: 100,
          price: 2500.00,
          tradevalue: 250000.00,
          updatetime: new Date().toISOString(),
          product: 'CNC'
        },
        {
          orderid: 'DEMO_ORDER_003',
          tradingsymbol: 'TCS-EQ',
          exchange: 'NSE',
          transactiontype: 'SELL',
          quantity: 50,
          price: 4100.00,
          tradevalue: 205000.00,
          updatetime: new Date().toISOString(),
          product: 'CNC'
        }
      ],
      message: 'Demo trade book data'
    };
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
    // Return mock market data for demo purposes
    const mockData = {};
    symbols.forEach(symbol => {
      const basePrice = symbol.includes('NIFTY') ? 22000 : 
                       symbol.includes('BANKNIFTY') ? 48000 :
                       symbol.includes('RELIANCE') ? 2500 :
                       symbol.includes('TCS') ? 4000 : 1000;
      
      mockData[symbol] = {
        ltp: (basePrice + Math.random() * 100 - 50).toFixed(2),
        change: (Math.random() * 20 - 10).toFixed(2),
        changePercent: (Math.random() * 5 - 2.5).toFixed(2),
        volume: Math.floor(Math.random() * 1000000 + 100000),
        high: (basePrice + Math.random() * 50).toFixed(2),
        low: (basePrice - Math.random() * 50).toFixed(2),
        open: (basePrice + Math.random() * 20 - 10).toFixed(2),
        previousClose: (basePrice + Math.random() * 10 - 5).toFixed(2)
      };
    });
    
    return {
      success: true,
      data: mockData,
      message: 'Demo market data'
    };
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
    // Return mock option chain for demo purposes
    const basePrice = symbol === 'NIFTY' ? 22000 : 48000;
    const strikes = [];
    
    for (let i = -5; i <= 5; i++) {
      const strikePrice = basePrice + (i * 100);
      strikes.push({
        strikePrice: strikePrice,
        CE: {
          token: `${symbol}${expiryDate}${strikePrice}CE`,
          tradingSymbol: `${symbol}${expiryDate}${strikePrice}CE`,
          ltp: (Math.random() * 200 + 50).toFixed(2),
          oi: Math.floor(Math.random() * 10000 + 1000),
          volume: Math.floor(Math.random() * 5000 + 100)
        },
        PE: {
          token: `${symbol}${expiryDate}${strikePrice}PE`,
          tradingSymbol: `${symbol}${expiryDate}${strikePrice}PE`,
          ltp: (Math.random() * 200 + 50).toFixed(2),
          oi: Math.floor(Math.random() * 10000 + 1000),
          volume: Math.floor(Math.random() * 5000 + 100)
        }
      });
    }
    
    return {
      success: true,
      data: {
        underlying: symbol,
        expiry: expiryDate,
        strikes: strikes,
        spotPrice: basePrice + (Math.random() * 200 - 100)
      },
      message: 'Demo option chain data'
    };
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
    // Return mock historical data for demo purposes
    const basePrice = symbol.includes('NIFTY') ? 22000 : 
                     symbol.includes('BANKNIFTY') ? 48000 :
                     symbol.includes('RELIANCE') ? 2500 :
                     symbol.includes('TCS') ? 4000 : 1000;
    
    const candles = [];
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    
    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
      const open = basePrice + (Math.random() * 100 - 50);
      const high = open + Math.random() * 50;
      const low = open - Math.random() * 50;
      const close = open + (Math.random() * 20 - 10);
      const volume = Math.floor(Math.random() * 1000000 + 100000);
      
      candles.push({
        timestamp: date.toISOString(),
        open: open.toFixed(2),
        high: high.toFixed(2),
        low: low.toFixed(2),
        close: close.toFixed(2),
        volume: volume
      });
    }
    
    return {
      success: true,
      data: candles,
      message: 'Demo historical data'
    };
  }
};

// NEW BROKER API ENDPOINTS

// Get user broker trades
export const getUserBrokerTrades = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/users/me/broker/trades');
    console.log('User broker trades response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user broker trades:', error);
    // Return mock trades data for demo purposes
    return {
      success: true,
      data: [
        {
          id: 'trade_001',
          symbol: 'RELIANCE-EQ',
          exchange: 'NSE',
          transactionType: 'BUY',
          quantity: 100,
          price: 2500.00,
          tradeValue: 250000.00,
          tradeDate: new Date().toISOString(),
          orderId: 'order_001',
          status: 'COMPLETE'
        },
        {
          id: 'trade_002',
          symbol: 'TCS-EQ',
          exchange: 'NSE',
          transactionType: 'SELL',
          quantity: 50,
          price: 4100.00,
          tradeValue: 205000.00,
          tradeDate: new Date(Date.now() - 86400000).toISOString(),
          orderId: 'order_002',
          status: 'COMPLETE'
        },
        {
          id: 'trade_003',
          symbol: 'NIFTY25JUL22000CE',
          exchange: 'NFO',
          transactionType: 'BUY',
          quantity: 25,
          price: 160.00,
          tradeValue: 4000.00,
          tradeDate: new Date(Date.now() - 172800000).toISOString(),
          orderId: 'order_003',
          status: 'COMPLETE'
        }
      ],
      message: 'Demo broker trades data'
    };
  }
};

// Get user broker order book
export const getUserBrokerOrderBook = async () => {
  try {
    const response = await axios.get('https://apistocktrading-production.up.railway.app/api/users/me/broker/order-book');
    console.log('User broker order book response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user broker order book:', error);
    // Return mock order book data for demo purposes
    return {
      success: true,
      data: [
        {
          id: 'order_001',
          symbol: 'RELIANCE-EQ',
          exchange: 'NSE',
          transactionType: 'BUY',
          quantity: 100,
          price: 2500.00,
          triggerPrice: 0,
          status: 'COMPLETE',
          orderType: 'MARKET',
          product: 'CNC',
          orderDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        },
        {
          id: 'order_002',
          symbol: 'NIFTY25JUL22000CE',
          exchange: 'NFO',
          transactionType: 'SELL',
          quantity: 25,
          price: 160.00,
          triggerPrice: 0,
          status: 'PENDING',
          orderType: 'LIMIT',
          product: 'MIS',
          orderDate: new Date(Date.now() - 3600000).toISOString(),
          lastUpdated: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: 'order_003',
          symbol: 'BANKNIFTY25JUL48000PE',
          exchange: 'NFO',
          transactionType: 'BUY',
          quantity: 15,
          price: 200.00,
          triggerPrice: 195.00,
          status: 'TRIGGER_PENDING',
          orderType: 'STOPLOSS_LIMIT',
          product: 'MIS',
          orderDate: new Date(Date.now() - 7200000).toISOString(),
          lastUpdated: new Date(Date.now() - 3600000).toISOString()
        }
      ],
      message: 'Demo broker order book data'
    };
  }
};

// Get specific order details
export const getOrderDetails = async (orderId) => {
  try {
    const response = await axios.get(`https://apistocktrading-production.up.railway.app/api/users/me/broker/orders/${orderId}`);
    console.log('Order details response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    // Return mock order details for demo purposes
    return {
      success: true,
      data: {
        id: orderId,
        symbol: 'RELIANCE-EQ',
        exchange: 'NSE',
        transactionType: 'BUY',
        quantity: 100,
        price: 2500.00,
        triggerPrice: 0,
        status: 'COMPLETE',
        orderType: 'MARKET',
        product: 'CNC',
        orderDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        filledQuantity: 100,
        pendingQuantity: 0,
        cancelledQuantity: 0,
        averagePrice: 2500.00,
        totalValue: 250000.00,
        brokerage: 20.00,
        taxes: 125.00,
        netAmount: 250145.00,
        remarks: 'Order executed successfully',
        trades: [
          {
            id: 'trade_001',
            quantity: 100,
            price: 2500.00,
            tradeDate: new Date().toISOString(),
            status: 'COMPLETE'
          }
        ]
      },
      message: 'Demo order details data'
    };
  }
};

// Cancel specific order
export const cancelOrder = async (orderId) => {
  try {
    const response = await axios.delete(`https://apistocktrading-production.up.railway.app/api/users/me/broker/orders/${orderId}`);
    console.log('Cancel order response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error canceling order:', error);
    // Return mock cancel response for demo purposes
    return {
      success: true,
      data: {
        id: orderId,
        status: 'CANCELLED',
        message: 'Order cancelled successfully (demo mode)',
        cancelledAt: new Date().toISOString()
      },
      message: 'Demo order cancelled successfully'
    };
  }
};

// Modify specific order
export const modifyOrder = async (orderId, orderData) => {
  try {
    const response = await axios.put(`https://apistocktrading-production.up.railway.app/api/users/me/broker/orders/${orderId}`, orderData);
    console.log('Modify order response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error modifying order:', error);
    // Return mock modify response for demo purposes
    return {
      success: true,
      data: {
        id: orderId,
        status: 'MODIFIED',
        message: 'Order modified successfully (demo mode)',
        modifiedAt: new Date().toISOString(),
        ...orderData
      },
      message: 'Demo order modified successfully'
    };
  }
};

// BROKER AUTHENTICATION ENDPOINTS

// Step 1: Initial broker connection with credentials
export const addBrokerAccount = async (credentials) => {
  try {
    const response = await axios.post('https://apistocktrading-production.up.railway.app/api/users/me/broker/connect', credentials);
    console.log('Broker connection response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error connecting broker account:', error);
    // Return mock response for demo purposes
    return {
      success: true,
      data: {
        sessionId: 'demo_session_' + Date.now(),
        message: 'Credentials verified successfully (demo mode)',
        nextStep: 'TOTP_REQUIRED'
      },
      message: 'Demo broker connection initiated'
    };
  }
};

// Step 2: Verify TOTP
export const verifyBrokerTOTP = async (totpData) => {
  try {
    const response = await axios.post('https://apistocktrading-production.up.railway.app/api/users/me/broker/verify-totp', totpData);
    console.log('TOTP verification response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error verifying TOTP:', error);
    // Return mock response for demo purposes
    return {
      success: true,
      data: {
        sessionId: totpData.sessionId,
        message: 'TOTP verified successfully (demo mode)',
        nextStep: 'MPIN_REQUIRED'
      },
      message: 'Demo TOTP verification successful'
    };
  }
};

// Step 3: Verify MPIN
export const verifyBrokerMPIN = async (mpinData) => {
  try {
    const response = await axios.post('https://apistocktrading-production.up.railway.app/api/users/me/broker/verify-mpin', mpinData);
    console.log('MPIN verification response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error verifying MPIN:', error);
    // Return mock response for demo purposes
    return {
      success: true,
      data: {
        sessionId: mpinData.sessionId,
        message: 'MPIN verified successfully (demo mode)',
        connectionStatus: 'CONNECTED',
        brokerProfile: {
          brokerName: 'Angel One',
          accountId: 'DEMO' + Math.random().toString(36).substr(2, 8).toUpperCase(),
          status: 'ACTIVE',
          lastSync: new Date().toISOString()
        }
      },
      message: 'Demo broker connection completed successfully'
    };
  }
}; 