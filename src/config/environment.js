// Environment Configuration for Backend URLs
// This file centralizes all backend API endpoints for easy management

// Production Backend URL (Railway)
export const BACKEND_URL = 'https://v4fintechtradingapi-production.up.railway.app';

// Legacy Backend URL (AWS App Runner) - Commented out but kept for reference
// export const LEGACY_BACKEND_URL = 'https://y9tyscpumt.us-east-1.awsapprunner.com';

// API Base Path
export const API_BASE_PATH = '/api';

// Full API URL
export const API_BASE_URL = `${BACKEND_URL}${API_BASE_PATH}`;

// Individual API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    SIGNIN: `${API_BASE_URL}/auth/signin`,
    SIGNOUT: `${API_BASE_URL}/auth/signout`,
    ME: `${API_BASE_URL}/auth/me`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  },
  
  // User endpoints
  USERS: {
    ME: `${API_BASE_URL}/users/me`,
    PROFILE: `${API_BASE_URL}/users/profile`,
    PROFILE_UPDATE: `${API_BASE_URL}/users/me/profileUpdate`,
    CHANGE_EMAIL: `${API_BASE_URL}/users/change-email`,
    BROKER: {
      CONNECT: `${API_BASE_URL}/users/me/broker/connect`,
      VERIFY: `${API_BASE_URL}/users/me/broker/verify`,
      PROFILE: `${API_BASE_URL}/users/me/broker/profile`,
      RMS_LIMIT: `${API_BASE_URL}/users/me/broker/rmsLimit`,
      STATUS: `${API_BASE_URL}/users/me/broker/status`,
      CLEAR: `${API_BASE_URL}/users/me/broker/clear`,
      DISCONNECT: `${API_BASE_URL}/users/me/broker`,
      TRADES: `${API_BASE_URL}/users/me/broker/trades`,
    }
  },
  
  // Admin endpoints
  ADMIN: {
    TRADES: {
      LIST: `${API_BASE_URL}/admin/trades`,
      INITIATE: `${API_BASE_URL}/admin/trades/initiate`,
      DETAIL: (id) => `${API_BASE_URL}/admin/trades/${id}`,
      EXIT: (id) => `${API_BASE_URL}/admin/trades/${id}/exit`,
      PNL: `${API_BASE_URL}/admin/trades/pnl/all-trades`,
    },
    SEGMENTS: {
      LIST: `${API_BASE_URL}/admin/segments`,
      CREATE: `${API_BASE_URL}/admin/segments`,
      DETAIL: (id) => `${API_BASE_URL}/admin/segments/${id}`,
      UPDATE: (id) => `${API_BASE_URL}/admin/segments/${id}`,
      DELETE: (id) => `${API_BASE_URL}/admin/segments/${id}`,
      USERS: {
        LIST: (id) => `${API_BASE_URL}/admin/segments/${id}/users`,
        ADD: (id) => `${API_BASE_URL}/admin/segments/${id}/users`,
        REMOVE: (id, userId) => `${API_BASE_URL}/admin/segments/${id}/users/${userId}`,
      }
    },
    USERS: {
      LIST: `${API_BASE_URL}/users`,
      DETAIL: (id) => `${API_BASE_URL}/users/${id}`,
    }
  },
  
  // Market data endpoints
  MARKET_DATA: {
    OPTION_EXPIRIES: (underlying) => `${API_BASE_URL}/market-data/option-expiries/${underlying}`,
    OPTION_CHAIN: `${API_BASE_URL}/market-data/option-chain`,
    OPTION_UNDERLYINGS: `${API_BASE_URL}/market-data/option-underlyings`,
  },
  
  // Trading endpoints
  TRADING: {
    POSITIONS: `${API_BASE_URL}/trading/positions`,
  }
};

// Legacy endpoints (commented out for reference)
export const LEGACY_API_ENDPOINTS = {
  // AWS App Runner endpoints - kept for reference but not used
  // BASE_URL: 'https://y9tyscpumt.us-east-1.awsapprunner.com/api',
  // AUTH: {
  //   SIGNUP: 'https://y9tyscpumt.us-east-1.awsapprunner.com/api/auth/signup',
  //   SIGNIN: 'https://y9tyscpumt.us-east-1.awsapprunner.com/api/auth/signin',
  //   // ... other endpoints
  // }
};

// Environment detection
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';

// Log current configuration
console.log('🔧 Environment Configuration Loaded:');
console.log(`   Backend URL: ${BACKEND_URL}`);
console.log(`   API Base URL: ${API_BASE_URL}`);
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);

export default {
  BACKEND_URL,
  API_BASE_URL,
  API_ENDPOINTS,
  isProduction,
  isDevelopment
};
