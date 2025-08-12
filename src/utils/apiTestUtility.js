import axios from 'axios';

// API Test Utility - Tests all endpoints mentioned in requirements
class APITestUtility {
  constructor() {
    this.baseURL = 'https://apistocktrading-production.up.railway.app/api';
    this.results = {};
    this.token = localStorage.getItem('token');
  }

  // Set auth token
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Get auth headers
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Test AUTH endpoints
  async testAuthEndpoints() {
    console.log('🧪 Testing AUTH endpoints...');
    
    try {
      // Test signup
      const signupResponse = await axios.post(`${this.baseURL}/auth/signup`, {
        email: 'test@example.com',
        password: 'test123'
      });
      this.results.signup = { success: true, status: signupResponse.status, data: signupResponse.data };
      console.log('✅ Signup endpoint working');
    } catch (error) {
      this.results.signup = { success: false, status: error.response?.status, error: error.message };
      console.log('❌ Signup endpoint failed:', error.response?.status);
    }

    try {
      // Test signin
      const signinResponse = await axios.post(`${this.baseURL}/auth/signin`, {
        email: 'admin1@gmail.com',
        password: 'admin123'
      });
      this.results.signin = { success: true, status: signinResponse.status, data: signinResponse.data };
      console.log('✅ Signin endpoint working');
      
      // Update token if signin successful
      if (signinResponse.data?.data?.token) {
        this.setToken(signinResponse.data.data.token);
      }
    } catch (error) {
      this.results.signin = { success: false, status: error.response?.status, error: error.message };
      console.log('❌ Signin endpoint failed:', error.response?.status);
    }

    try {
      // Test getCurrentUser (requires auth)
      if (this.token) {
        const meResponse = await axios.get(`${this.baseURL}/auth/me`, { headers: this.getHeaders() });
        this.results.getCurrentUser = { success: true, status: meResponse.status, data: meResponse.data };
        console.log('✅ GetCurrentUser endpoint working');
      } else {
        this.results.getCurrentUser = { success: false, error: 'No token available' };
        console.log('❌ GetCurrentUser endpoint failed: No token');
      }
    } catch (error) {
      this.results.getCurrentUser = { success: false, status: error.response?.status, error: error.message };
      console.log('❌ GetCurrentUser endpoint failed:', error.response?.status);
    }

    try {
      // Test forgotPassword
      const forgotResponse = await axios.post(`${this.baseURL}/auth/forgot-password`, {
        email: 'test@example.com'
      });
      this.results.forgotPassword = { success: true, status: forgotResponse.status, data: forgotResponse.data };
      console.log('✅ ForgotPassword endpoint working');
    } catch (error) {
      this.results.forgotPassword = { success: false, status: error.response?.status, error: error.message };
      console.log('❌ ForgotPassword endpoint failed:', error.response?.status);
    }

    return this.results;
  }

  // Test USER endpoints
  async testUserEndpoints() {
    console.log('🧪 Testing USER endpoints...');
    
    if (!this.token) {
      console.log('❌ Cannot test USER endpoints: No token available');
      return { error: 'No token available' };
    }

    try {
      // Test userProfileUpdate
      const profileUpdateResponse = await axios.put(`${this.baseURL}/users/me/profileUpdate`, {
        is_active_for_trading: true
      }, { headers: this.getHeaders() });
      this.results.userProfileUpdate = { success: true, status: profileUpdateResponse.status, data: profileUpdateResponse.data };
      console.log('✅ UserProfileUpdate endpoint working');
    } catch (error) {
      this.results.userProfileUpdate = { success: false, status: error.response?.status, error: error.message };
      console.log('❌ UserProfileUpdate endpoint failed:', error.response?.status);
    }

    try {
      // Test getDematLimit
      const dematResponse = await axios.get(`${this.baseURL}/users/me/broker/rmsLimit`, { headers: this.getHeaders() });
      this.results.getDematLimit = { success: true, status: dematResponse.status, data: dematResponse.data };
      console.log('✅ GetDematLimit endpoint working');
    } catch (error) {
      // 401 usually means user needs to be connected to a broker first
      if (error.response?.status === 401) {
        this.results.getDematLimit = { 
          success: false, 
          status: error.response?.status, 
          error: 'User not connected to broker or broker session expired' 
        };
        console.log('❌ GetDematLimit endpoint failed: User not connected to broker (401)');
      } else {
        this.results.getDematLimit = { success: false, status: error.response?.status, error: error.message };
        console.log('❌ GetDematLimit endpoint failed:', error.response?.status);
      }
    }

    try {
      // Test fetchBrokerConnectionStatus
      const statusResponse = await axios.get(`${this.baseURL}/users/me/broker/status`, { headers: this.getHeaders() });
      this.results.fetchBrokerConnectionStatus = { success: true, status: statusResponse.status, data: statusResponse.data };
      console.log('✅ FetchBrokerConnectionStatus endpoint working');
    } catch (error) {
      this.results.fetchBrokerConnectionStatus = { success: false, status: error.response?.status, error: error.message };
      console.log('❌ FetchBrokerConnectionStatus endpoint failed:', error.response?.status);
    }

    try {
      // Test getUserBrokerTrades
      const tradesResponse = await axios.get(`${this.baseURL}/users/me/broker/trades`, { headers: this.getHeaders() });
      this.results.getUserBrokerTrades = { success: true, status: tradesResponse.status, data: tradesResponse.data };
      console.log('✅ GetUserBrokerTrades endpoint working');
    } catch (error) {
      this.results.getUserBrokerTrades = { success: false, status: error.response?.status, error: error.message };
      console.log('❌ GetUserBrokerTrades endpoint failed:', error.response?.status);
    }

    try {
      // Test getUserBrokerOrderBook
      const orderBookResponse = await axios.get(`${this.baseURL}/users/me/broker/order-book`, { headers: this.getHeaders() });
      this.results.getUserBrokerOrderBook = { success: true, status: orderBookResponse.status, data: orderBookResponse.data };
      console.log('✅ GetUserBrokerOrderBook endpoint working');
    } catch (error) {
      // 400 usually means user needs to be connected to a broker first or has no orders
      if (error.response?.status === 400) {
        this.results.getUserBrokerOrderBook = { 
          success: false, 
          status: error.response?.status, 
          error: 'User not connected to broker or no orders available' 
        };
        console.log('❌ GetUserBrokerOrderBook endpoint failed: User not connected to broker or no orders (400)');
      } else {
        this.results.getUserBrokerOrderBook = { success: false, status: error.response?.status, error: error.message };
        console.log('❌ GetUserBrokerOrderBook endpoint failed:', error.response?.status);
      }
    }

    return this.results;
  }

  // Test ADMIN endpoints
  async testAdminEndpoints() {
    console.log('🧪 Testing ADMIN endpoints...');
    
    if (!this.token) {
      console.log('❌ Cannot test ADMIN endpoints: No token available');
      return { error: 'No token available' };
    }

    try {
      // Test getAllSegments
      const segmentsResponse = await axios.get(`${this.baseURL}/admin/segments`, { headers: this.getHeaders() });
      this.results.getAllSegments = { success: true, status: segmentsResponse.status, data: segmentsResponse.data };
      console.log('✅ GetAllSegments endpoint working');
    } catch (error) {
      this.results.getAllSegments = { success: false, status: error.response?.status, error: error.message };
      console.log('❌ GetAllSegments endpoint failed:', error.response?.status);
    }

    try {
      // Test getListUsers
      const usersResponse = await axios.get(`${this.baseURL}/users`, { headers: this.getHeaders() });
      this.results.getListUsers = { success: true, status: usersResponse.status, data: usersResponse.data };
      console.log('✅ GetListUsers endpoint working');
    } catch (error) {
      this.results.getListUsers = { success: false, status: error.response?.status, error: error.message };
      console.log('❌ GetListUsers endpoint failed:', error.response?.status);
    }

    try {
      // Test getAdminTrades
      const adminTradesResponse = await axios.get(`${this.baseURL}/admin/trades`, { headers: this.getHeaders() });
      this.results.getAdminTrades = { success: true, status: adminTradesResponse.status, data: adminTradesResponse.data };
      console.log('✅ GetAdminTrades endpoint working');
    } catch (error) {
      this.results.getAdminTrades = { success: false, status: error.response?.status, error: error.message };
      console.log('❌ GetAdminTrades endpoint failed:', error.response?.status);
    }

    try {
      // Test getOptionsUnderlying
      const underlyingResponse = await axios.get(`${this.baseURL}/market-data/option-underlyings`, { headers: this.getHeaders() });
      this.results.getOptionsUnderlying = { success: true, status: underlyingResponse.status, data: underlyingResponse.data };
      console.log('✅ GetOptionsUnderlying endpoint working');
    } catch (error) {
      this.results.getOptionsUnderlying = { success: false, status: error.response?.status, error: error.message };
      console.log('❌ GetOptionsUnderlying endpoint failed:', error.response?.status);
    }

    try {
      // Test getOptionExpiries
      const expiriesResponse = await axios.get(`${this.baseURL}/market-data/option-expiries/NIFTY`, { headers: this.getHeaders() });
      this.results.getOptionExpiries = { success: true, status: expiriesResponse.status, data: expiriesResponse.data };
      console.log('✅ GetOptionExpiries endpoint working');
    } catch (error) {
      this.results.getOptionExpiries = { success: false, status: error.response?.status, error: error.message };
      console.log('❌ GetOptionExpiries endpoint failed:', error.response?.status);
    }

    return this.results;
  }

  // Test BROKER endpoints
  async testBrokerEndpoints() {
    console.log('🧪 Testing BROKER endpoints...');
    console.log('⚠️  Note: Some broker endpoints require an active broker connection');
    
    if (!this.token) {
      console.log('❌ Cannot test BROKER endpoints: No token available');
      return { error: 'No token available' };
    }

    try {
      // Test fetchMyBrokerProfile (with TOTP)
      const profileResponse = await axios.post(`${this.baseURL}/users/me/broker/profile`, {
        totp: "123456"
      }, { headers: this.getHeaders() });
      this.results.fetchMyBrokerProfile = { success: true, status: profileResponse.status, data: profileResponse.data };
      console.log('✅ FetchMyBrokerProfile endpoint working');
    } catch (error) {
      // 404 means endpoint doesn't exist, which is expected for some broker setups
      if (error.response?.status === 404) {
        this.results.fetchMyBrokerProfile = { 
          success: false, 
          status: error.response?.status, 
          error: 'Endpoint not found - broker profile endpoint may not be implemented' 
        };
        console.log('❌ FetchMyBrokerProfile endpoint failed: Endpoint not found (404)');
      } else {
        this.results.fetchMyBrokerProfile = { success: false, status: error.response?.status, error: error.message };
        console.log('❌ FetchMyBrokerProfile endpoint failed:', error.response?.status);
      }
    }

    try {
      // Test clearBrokerProfile
      const clearResponse = await axios.post(`${this.baseURL}/users/me/broker/clear`, {}, { headers: this.getHeaders() });
      this.results.clearBrokerProfile = { success: true, status: clearResponse.status, data: clearResponse.data };
      console.log('✅ ClearBrokerProfile endpoint working');
    } catch (error) {
      // 404 means endpoint doesn't exist, which is expected for some broker setups
      if (error.response?.status === 404) {
        this.results.clearBrokerProfile = { 
          success: false, 
          status: error.response?.status, 
          error: 'Endpoint not found - clear broker endpoint may not be implemented' 
        };
        console.log('❌ ClearBrokerProfile endpoint failed: Endpoint not found (404)');
      } else {
        this.results.clearBrokerProfile = { success: false, status: error.response?.status, error: error.message };
        console.log('❌ ClearBrokerProfile endpoint failed:', error.response?.status);
      }
    }

    return this.results;
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting comprehensive API tests...');
    console.log('=====================================');
    
    await this.testAuthEndpoints();
    await this.testUserEndpoints();
    await this.testAdminEndpoints();
    await this.testBrokerEndpoints();
    
    console.log('=====================================');
    console.log('📊 Test Results Summary:');
    console.log('=====================================');
    
    Object.keys(this.results).forEach(endpoint => {
      const result = this.results[endpoint];
      if (result.success) {
        console.log(`✅ ${endpoint}: ${result.status} OK`);
      } else {
        console.log(`❌ ${endpoint}: ${result.status || 'FAILED'} - ${result.error}`);
      }
    });
    
    console.log('=====================================');
    console.log('🔍 Error Code Meanings:');
    console.log('=====================================');
    console.log('✅ 200-299: Success');
    console.log('❌ 400: Bad Request (usually missing parameters or invalid data)');
    console.log('❌ 401: Unauthorized (user not authenticated or broker not connected)');
    console.log('❌ 403: Forbidden (user lacks permission)');
    console.log('❌ 404: Not Found (endpoint doesn\'t exist)');
    console.log('❌ 500+: Server Error');
    console.log('=====================================');
    
    return this.results;
  }

  // Get test results
  getResults() {
    return this.results;
  }

  // Export results to console
  exportResults() {
    console.table(this.results);
    return this.results;
  }
}

export default APITestUtility;
