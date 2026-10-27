import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('retech_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('retech_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync / verify token on mount
  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.data?.data?.user) {
            setUser(res.data.data.user);
            localStorage.setItem('retech_user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          console.error("Session verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: jwtToken, user: userData } = res.data.data;
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('retech_token', jwtToken);
    localStorage.setItem('retech_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    const { token: jwtToken, user: userData } = res.data.data;
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('retech_token', jwtToken);
    localStorage.setItem('retech_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('retech_token');
    localStorage.removeItem('retech_user');
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      if (res.data?.data?.user) {
        setUser(res.data.data.user);
        localStorage.setItem('retech_user', JSON.stringify(res.data.data.user));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const isAgent = user?.role === 'AGENT';
  const isCustomer = user?.role === 'CUSTOMER';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin,
        isAgent,
        isCustomer,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
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
