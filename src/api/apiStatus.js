import axios from 'axios';

// API Status Checker Utility
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
      '/auth/signout'
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
          message: this.getStatusMessage(response.status)
        };
      } catch (error) {
        this.status.auth[endpoint] = {
          status: 'ERROR',
          available: false,
          message: error.message
        };
      }
    }
  }

  // Check market data endpoints
  async checkMarketEndpoints() {
    const endpoints = [
      '/market-data/option-underlyings',
      '/market-data/option-expiries/NIFTY',
      '/market-data/option-chain?underlying=NIFTY&expiry=10JUL2025',
      '/market-data/ltp'
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
          message: this.getStatusMessage(response.status)
        };
      } catch (error) {
        this.status.market[endpoint] = {
          status: 'ERROR',
          available: false,
          message: error.message
        };
      }
    }
  }

  // Check trading endpoints
  async checkTradingEndpoints() {
    const endpoints = [
      '/trading/positions',
      '/trading/order-history',
      '/admin/trades/initiate'
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
          message: this.getStatusMessage(response.status)
        };
      } catch (error) {
        this.status.trading[endpoint] = {
          status: 'ERROR',
          available: false,
          message: error.message
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
      '/admin/stats'
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
          message: this.getStatusMessage(response.status)
        };
      } catch (error) {
        this.status.admin[endpoint] = {
          status: 'ERROR',
          available: false,
          message: error.message
        };
      }
    }
  }

  // Check user endpoints
  async checkUserEndpoints() {
    const endpoints = [
      '/users/me/profile',
      '/users/profile',
      '/users/me/broker/connect',
      '/users/me/broker/status'
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
          message: this.getStatusMessage(response.status)
        };
      } catch (error) {
        this.status.user[endpoint] = {
          status: 'ERROR',
          available: false,
          message: error.message
        };
      }
    }
  }

  // Check broker endpoints
  async checkBrokerEndpoints() {
    const endpoints = [
      '/broker/connect',
      '/broker/status',
      '/broker/profile'
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
          message: this.getStatusMessage(response.status)
        };
      } catch (error) {
        this.status.broker[endpoint] = {
          status: 'ERROR',
          available: false,
          message: error.message
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
        return 'Unauthorized - Authentication required';
      case 403:
        return 'Forbidden - Access denied';
      case 404:
        return 'Not Found - Endpoint does not exist';
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
      
      console.log(`${category.toUpperCase()}: ${available}/${total} endpoints available`);
      
      endpoints.forEach(endpoint => {
        const status = this.status[category][endpoint];
        const icon = status.available ? '✅' : '❌';
        console.log(`  ${icon} ${endpoint}: ${status.message}`);
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

    return recommendations;
  }

  // Helper to get category for endpoint
  getCategoryForEndpoint(endpoint) {
    if (endpoint.startsWith('/auth')) return 'auth';
    if (endpoint.startsWith('/market-data')) return 'market';
    if (endpoint.startsWith('/trading') || endpoint.startsWith('/admin/trades')) return 'trading';
    if (endpoint.startsWith('/admin')) return 'admin';
    if (endpoint.startsWith('/users')) return 'user';
    if (endpoint.startsWith('/broker')) return 'broker';
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