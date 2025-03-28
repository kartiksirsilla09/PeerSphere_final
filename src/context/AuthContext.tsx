import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';

interface User {
  _id: string;
  username: string;
  email: string;
  points: number;
  questionsAsked: string[];
  answersGiven: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<{ message: string; emailPreview?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        
        await fetchUserProfile();
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getProfile();
          setUser(response.data);
    } catch (error: any) {
          console.error('Error fetching user profile:', error);
      // If token is invalid or expired, remove it
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setUser(null);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const login = async (emailOrUsername: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.login({ emailOrUsername, password });
      
      localStorage.setItem('token', response.data.token);
      setUser(response.data);
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to login. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.register({ username, email, password });
      
      localStorage.setItem('token', response.data.token);
      setUser(response.data);
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to register. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.forgotPassword({ email });
      return response.data;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.verifyOTP({ email, otp });
      
      localStorage.setItem('token', response.data.token);
      setUser(response.data);
    } catch (error: any) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to verify OTP. Please try again.';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
    user,
    loading,
        error,
        login,
        register,
        logout,
        clearError,
        forgotPassword,
        verifyOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};