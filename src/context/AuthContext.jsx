import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUserEnhanced, signin, signout } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log('AuthProvider rendering with state:', { user, role, loading });

  useEffect(() => {
    console.log('AuthProvider useEffect running');
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token ? 'exists' : 'not found');
    
    if (token) {
      console.log('Attempting to get current user with token');
      getCurrentUserEnhanced()
        .then(res => {
          console.log('AuthContext getCurrentUser response:', res);
          const userData = res.data;
          console.log('Setting user data in context:', userData);
          setUser(userData);
          setRole(userData.role);
        })
        .catch((error) => {
          console.error('Error in AuthContext getCurrentUser:', error);
          setUser(null);
          setRole(null);
          localStorage.removeItem('token');
        })
        .finally(() => {
          console.log('Setting loading to false');
          setLoading(false);
        });
    } else {
      console.log('No token found, setting loading to false');
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Login attempt for:', email);
      const res = await signin({ email, password });
      console.log('Login response:', res.data);
      
      const token = res.data.data?.session?.access_token || res.data.data?.access_token || res.data.access_token;
      console.log('Extracted token:', token ? 'exists' : 'not found');
      localStorage.setItem('token', token);
      
      // Get fresh user data after login
      const userResponse = await getCurrentUserEnhanced();
      const userData = userResponse.data;
      
      console.log('Setting user data after login:', userData);
      setUser(userData);
      setRole(userData.role);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try { 
      console.log('Logout attempt');
      await signout(); 
    } catch (e) {
      console.error('Signout API error:', e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('smartApiToken'); // Clear broker token if exists
    setUser(null);
    setRole(null);
    console.log('Logout completed, redirecting to login');
    window.location.href = '/login'; // Force a full page reload to clear all state
  };

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      console.log('Refreshing user data');
      const res = await getCurrentUserEnhanced();
      const userData = res.data;
      console.log('Refreshed user data:', userData);
      setUser(userData);
      setRole(userData.role);
      return userData;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  };

  const contextValue = {
    user, 
    role, 
    loading, 
    login, 
    logout, 
    refreshUser,
    isAuthenticated: !!user 
  };

  console.log('AuthContext value:', contextValue);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 