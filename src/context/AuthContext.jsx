import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUserEnhanced, signin, signout } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      getCurrentUserEnhanced()
        .then(res => {
          const userData = res.data;
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
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await signin({ email, password });
      
      const token = res.data.data?.session?.access_token || res.data.data?.access_token || res.data.access_token;
      localStorage.setItem('token', token);
      
      // Get fresh user data after login
      const userResponse = await getCurrentUserEnhanced();
      const userData = userResponse.data;
      
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
      await signout(); 
    } catch (e) {
      console.error('Signout API error:', e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('smartApiToken'); // Clear broker token if exists
    setUser(null);
    setRole(null);
    window.location.href = '/login'; // Force a full page reload to clear all state
  };

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      const res = await getCurrentUserEnhanced();
      const userData = res.data;
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