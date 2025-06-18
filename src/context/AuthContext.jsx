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
          const userData = res.data.data?.user || res.data.data || res.data.user || res.data;
          setUser(userData);
          setRole(userData.role);
        })
        .catch(() => {
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
    const res = await signin({ email, password });
    const token = res.data.data?.session?.access_token || res.data.data?.access_token;
    localStorage.setItem('token', token);
    const userData = res.data.data?.user || res.data.data || res.data.user || res.data;
    setUser(userData);
    setRole(userData.role);
    return userData;
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

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 