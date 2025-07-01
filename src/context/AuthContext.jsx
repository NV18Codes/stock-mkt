import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, signin, signout } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getCurrentUser()
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
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await signin({ email, password });
      console.log('Login response:', res.data);
      
      const token = res.data.data?.session?.access_token || res.data.data?.access_token || res.data.access_token;
      localStorage.setItem('token', token);
      
      // Get fresh user data after login
      const userResponse = await getCurrentUser();
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
      const res = await getCurrentUser();
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

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      loading, 
      login, 
      logout, 
      refreshUser,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 