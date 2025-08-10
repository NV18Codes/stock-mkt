import axios from 'axios';

// API Status Checker Utility - Updated for new API structure
export class APIStatusChecker {
  constructor() {
    this.baseURL = 'https://apistocktrading-production.up.railway.app/api';
    this.status = {
      auth: {},
      market: {},
      trading: {},
      admin: {},
      user: {},
      broker: {}
    };
  }

  // Check authentication endpoints
  async checkAuthEndpoints() {
    const endpoints = [
      '/auth/signin',
      '/auth/signup',
      '/auth/me',
      '/auth/signout',
      '/auth/forgot-password',
      '/auth/reset-password'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${this.baseURL}${endpoint}`, {
          timeout: 5000,
          validateStatus: () => true // Don't throw on any status code
        });
        this.status.auth[endpoint] = {
          status: response.status,
          available: response.status !== 404,
          message: this.getStatusMessage(response.status),
          requiresAuth: response.status === 401
        };
      } catch (error) {
        this.status.auth[endpoint] = {
          status: 'ERROR',
          available: false,
          message: error.message,
          requiresAuth: false
        };
      }
    }
  }

  // Check market data endpoints (Admin)
  async checkMarketEndpoints() {
    const endpoints = [
      '/admin/market-data/option-expiries/NIFTY',
      '/admin/market-data/option-chain-structure/NIFTY/10JUL2025',
      '/admin/market-data/options_underlying'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${this.baseURL}${endpoint}`, {
          timeout: 5000,
          validateStatus: () => true
        });
        this.status.market[endpoint] = {
          status: response.status,
          available: response.status !== 404,
          message: this.getStatusMessage(response.status),
          requiresAuth: response.status === 401
        };
      } catch (error) {
        this.status.market[endpoint] = {
          status: 'ERROR',
          available: false,
          message: error.message,
          requiresAuth: false
        };
      }
    }
  }

  // Check trading endpoints
  async checkTradingEndpoints() {
    const endpoints = [
      '/trading/positions',
      '/trading/order-history',
      '/admin/trades/initiate',
      '/users/me/broker/trades',
      '/users/me/broker/orderbook',
      '/users/me/broker/orders'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${this.baseURL}${endpoint}`, {
          timeout: 5000,
          validateStatus: () => true
        });
        this.status.trading[endpoint] = {
          status: response.status,
          available: response.status !== 404,
          message: this.getStatusMessage(response.status),
          requiresAuth: response.status === 401
        };
      } catch (error) {
        this.status.trading[endpoint] = {
          status: 'ERROR',
          available: false,
          message: error.message,
          requiresAuth: false
        };
      }
    }
  }

  // Check admin endpoints
  async checkAdminEndpoints() {
    const endpoints = [
      '/admin/users',
      '/admin/segments',
      '/admin/trades',
      '/admin/stats',
      '/admin/market-data/option-expiries/NIFTY',
      '/admin/market-data/option-chain-structure/NIFTY/10JUL2025',
      '/admin/market-data/options_underlying',
      '/admin/trades/initiate',
      '/admin/trades/history',
      '/admin/trades/detail',
      '/admin/segments/all',
      '/admin/segments/add',
      '/admin/segments/single',
      '/admin/segments/update',
      '/admin/segments/delete',
      '/admin/segments/users/add',
      '/admin/segments/users/list'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${this.baseURL}${endpoint}`, {
          timeout: 5000,
          validateStatus: () => true
        });
        this.status.admin[endpoint] = {
          status: response.status,
          available: response.status !== 404,
          message: this.getStatusMessage(response.status),
          requiresAuth: response.status === 401
        };
      } catch (error) {
        this.status.admin[endpoint] = {
          status: 'ERROR',
          available: false,
          message: error.message,
          requiresAuth: false
        };
      }
    }
  }

  // Check user endpoints
  async checkUserEndpoints() {
    const endpoints = [
      '/users/me/broker/connect',
      '/users/me/broker/status',
      '/users/me/broker/verify',
      '/users/me/broker/rmsLimit',
      '/users/me/broker/clear',
      '/users/me/profileUpdate',
      '/users/me',
      '/users/single',
      '/users/list'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${this.baseURL}${endpoint}`, {
          timeout: 5000,
          validateStatus: () => true
        });
        this.status.user[endpoint] = {
          status: response.status,
          available: response.status !== 404,
          message: this.getStatusMessage(response.status),
          requiresAuth: response.status === 401
        };
      } catch (error) {
        this.status.user[endpoint] = {
          status: 'ERROR',
          available: false,
          message: error.message,
          requiresAuth: false
        };
      }
    }
  }

  // Check broker endpoints
  async checkBrokerEndpoints() {
    const endpoints = [
      '/users/me/broker/connect',
      '/users/me/broker/status',
      '/users/me/broker/verify',
      '/users/me/broker/rmsLimit',
      '/users/me/broker/clear',
      '/users/me/broker/trades',
      '/users/me/broker/orderbook',
      '/users/me/broker/orders'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${this.baseURL}${endpoint}`, {
          timeout: 5000,
          validateStatus: () => true
        });
        this.status.broker[endpoint] = {
          status: response.status,
          available: response.status !== 404,
          message: this.getStatusMessage(response.status),
          requiresAuth: response.status === 401
        };
      } catch (error) {
        this.status.broker[endpoint] = {
          status: 'ERROR',
          available: false,
          message: error.message,
          requiresAuth: false
        };
      }
    }
  }

  // Get status message
  getStatusMessage(status) {
    switch (status) {
      case 200:
        return 'OK - Endpoint working';
      case 401:
        return 'Unauthorized - Authentication required (expected when not logged in)';
      case 403:
        return 'Forbidden - Access denied';
      case 404:
        return 'Not Found - Endpoint does not exist on backend';
      case 500:
        return 'Internal Server Error - Server issue';
      case 'ERROR':
        return 'Network Error - Connection failed';
      default:
        return `Status ${status} - Unknown response`;
    }
  }

  // Run all checks
  async runAllChecks() {
    console.log('🔍 Starting API Status Check...');
    
    await Promise.all([
      this.checkAuthEndpoints(),
      this.checkMarketEndpoints(),
      this.checkTradingEndpoints(),
      this.checkAdminEndpoints(),
      this.checkUserEndpoints(),
      this.checkBrokerEndpoints()
    ]);

    console.log('✅ API Status Check Complete');
    this.printSummary();
    
    return this.status;
  }

  // Print summary
  printSummary() {
    console.log('\n📊 API Status Summary:');
    console.log('========================');
    
    const categories = ['auth', 'market', 'trading', 'admin', 'user', 'broker'];
    
    categories.forEach(category => {
      const endpoints = Object.keys(this.status[category]);
      const available = endpoints.filter(ep => this.status[category][ep].available).length;
      const total = endpoints.length;
      const requiresAuth = endpoints.filter(ep => this.status[category][ep].requiresAuth).length;
      
      console.log(`${category.toUpperCase()}: ${available}/${total} endpoints available (${requiresAuth} require auth)`);
      
      endpoints.forEach(endpoint => {
        const status = this.status[category][endpoint];
        const icon = status.available ? '✅' : '❌';
        const authIcon = status.requiresAuth ? '🔒' : '';
        console.log(`  ${icon} ${endpoint}: ${status.message} ${authIcon}`);
      });
      console.log('');
    });
  }

  // Get recommendations
  getRecommendations() {
    const recommendations = [];
    
    // Check for common issues
    const allEndpoints = [
      ...Object.keys(this.status.auth),
      ...Object.keys(this.status.market),
      ...Object.keys(this.status.trading),
      ...Object.keys(this.status.admin),
      ...Object.keys(this.status.user),
      ...Object.keys(this.status.broker)
    ];

    const unavailableEndpoints = allEndpoints.filter(ep => {
      const category = this.getCategoryForEndpoint(ep);
      return !this.status[category][ep]?.available;
    });

    if (unavailableEndpoints.length > 0) {
      recommendations.push({
        type: 'warning',
        message: `${unavailableEndpoints.length} endpoints are unavailable`,
        details: unavailableEndpoints
      });
    }

    const forbiddenEndpoints = allEndpoints.filter(ep => {
      const category = this.getCategoryForEndpoint(ep);
      return this.status[category][ep]?.status === 403;
    });

    if (forbiddenEndpoints.length > 0) {
      recommendations.push({
        type: 'error',
        message: `${forbiddenEndpoints.length} endpoints are forbidden (403)`,
        details: forbiddenEndpoints,
        suggestion: 'Check authentication token and permissions'
      });
    }

    const notFoundEndpoints = allEndpoints.filter(ep => {
      const category = this.getCategoryForEndpoint(ep);
      return this.status[category][ep]?.status === 404;
    });

    if (notFoundEndpoints.length > 0) {
      recommendations.push({
        type: 'info',
        message: `${notFoundEndpoints.length} endpoints not found (404)`,
        details: notFoundEndpoints,
        suggestion: 'These endpoints may not be implemented on the backend'
      });
    }

    const authRequiredEndpoints = allEndpoints.filter(ep => {
      const category = this.getCategoryForEndpoint(ep);
      return this.status[category][ep]?.requiresAuth;
    });

    if (authRequiredEndpoints.length > 0) {
      recommendations.push({
        type: 'info',
        message: `${authRequiredEndpoints.length} endpoints require authentication (401)`,
        details: authRequiredEndpoints,
        suggestion: 'This is normal when not logged in. Login to access these endpoints.'
      });
    }

    return recommendations;
  }

  // Helper to get category for endpoint
  getCategoryForEndpoint(endpoint) {
    if (endpoint.startsWith('/auth')) return 'auth';
    if (endpoint.startsWith('/admin/market-data')) return 'market';
    if (endpoint.startsWith('/trading') || endpoint.startsWith('/admin/trades') || endpoint.startsWith('/users/me/broker/trades') || endpoint.startsWith('/users/me/broker/orderbook') || endpoint.startsWith('/users/me/broker/orders')) return 'trading';
    if (endpoint.startsWith('/admin')) return 'admin';
    if (endpoint.startsWith('/users')) return 'user';
    if (endpoint.startsWith('/users/me/broker')) return 'broker';
    return 'unknown';
  }
}

// Export singleton instance
export const apiStatusChecker = new APIStatusChecker();

// Export convenience function
export const checkAPIStatus = async () => {
  return await apiStatusChecker.runAllChecks();
};

// Export recommendations function
export const getAPIRecommendations = async () => {
  await apiStatusChecker.runAllChecks();
  return apiStatusChecker.getRecommendations();
}; 