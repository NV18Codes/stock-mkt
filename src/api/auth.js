import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'https://apistocktrading-production.up.railway.app/api';

// Add a request interceptor to attach the token automatically
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.url && config.url.startsWith(API)) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;  
  },
  (error) => Promise.reject(error)
);

export const signup = (data) => axios.post(`${API}/auth/signup`, data);
export const signin = (data) => axios.post(`${API}/auth/signin`, data);
export const signout = () => axios.get(`${API}/auth/signout`);
export const getCurrentUser = () => axios.get(`${API}/auth/me`);
export const forgotPassword = (data) => axios.post(`${API}/auth/forgot-password`, data);
export const resetPassword = (data) => axios.post(`${API}/auth/reset-password`, data); 