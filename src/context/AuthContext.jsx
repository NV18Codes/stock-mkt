import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUserEnhanced, signin, signout } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Define the function before using it
    const fetchUserFromAPI = () => {
      getCurrentUserEnhanced()
        .then(res => {
          const userData = res.data;
          setUser(userData);
          setRole(userData.role);
          
          // Store in localStorage for future use
          try {
            localStorage.setItem('currentUser', JSON.stringify(userData));
            if (userData.fullName || userData.name) {
              localStorage.setItem('userFullName', userData.fullName || userData.name);
            }
            if (userData.phone || userData.phone_number) {
              localStorage.setItem('userPhone', userData.phone || userData.phone_number);
            }
          } catch (localStorageError) {
            console.warn('Could not store user data in localStorage:', localStorageError);
          }
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
    };
    
    if (token) {
      // Check localStorage first for cached user data
      const cachedUser = localStorage.getItem('currentUser');
      const cachedName = localStorage.getItem('userFullName');
      const cachedPhone = localStorage.getItem('userPhone');
      
      if (cachedUser && cachedName) {
        try {
          const userData = JSON.parse(cachedUser);
          // Ensure we have the latest name from localStorage
          if (cachedName) {
            userData.fullName = cachedName;
            userData.name = cachedName;
          }
          if (cachedPhone) {
            userData.phone = cachedPhone;
            userData.phone_number = cachedPhone;
          }
          
          setUser(userData);
          setRole(userData.role);
          setLoading(false);
          
          // Refresh in background to get latest data
          getCurrentUserEnhanced()
            .then(res => {
              const freshUserData = res.data;
              setUser(freshUserData);
              setRole(freshUserData.role);
              
              // Update localStorage with fresh data
              try {
                localStorage.setItem('currentUser', JSON.stringify(freshUserData));
                if (freshUserData.fullName || freshUserData.name) {
                  localStorage.setItem('userFullName', freshUserData.fullName || freshUserData.name);
                }
                if (freshUserData.phone || freshUserData.phone_number) {
                  localStorage.setItem('userPhone', freshUserData.phone || freshUserData.phone_number);
                }
              } catch (localStorageError) {
                console.warn('Could not update localStorage:', localStorageError);
              }
            })
            .catch((error) => {
              console.error('Error refreshing user data in background:', error);
              // Keep cached data if refresh fails
            });
        } catch (parseError) {
          console.error('Error parsing cached user data:', parseError);
          // Fall back to API call
          fetchUserFromAPI();
        }
      } else {
        // No cached data, fetch from API
        fetchUserFromAPI();
      }
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
      
      // Update state
      setUser(userData);
      setRole(userData.role);
      
      // Store user data in localStorage for persistence
      try {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        if (userData.fullName || userData.name) {
          localStorage.setItem('userFullName', userData.fullName || userData.name);
        }
        if (userData.phone || userData.phone_number) {
          localStorage.setItem('userPhone', userData.phone || userData.phone_number);
        }
      } catch (localStorageError) {
        console.warn('Could not store user data in localStorage:', localStorageError);
      }
      
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
      
      // Update state
      setUser(userData);
      setRole(userData.role);
      
      // Also update localStorage for persistence
      try {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        if (userData.fullName || userData.name) {
          localStorage.setItem('userFullName', userData.fullName || userData.name);
        }
        if (userData.phone || userData.phone_number) {
          localStorage.setItem('userPhone', userData.phone || userData.phone_number);
        }
      } catch (localStorageError) {
        console.warn('Could not update localStorage:', localStorageError);
      }
      
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