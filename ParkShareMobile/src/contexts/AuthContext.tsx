import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface User {
  uid: string;
  email: string;
  username: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Backend API base URL
  const API_BASE_URL = 'http://localhost:3001';

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUserToStorage = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  };

  const removeUserFromStorage = async () => {
    try {
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error removing user from storage:', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // For demo purposes, we'll simulate authentication
      // In a real app, you'd integrate with Firebase or your auth service
      const mockUser: User = {
        uid: `user_${Date.now()}`,
        email,
        username: email.split('@')[0],
      };

      // Try to login to backend
      try {
        const response = await axios.post(`${API_BASE_URL}/api/login`, {
          uid: mockUser.uid,
        });

        if (response.data.ok) {
          setUser(mockUser);
          await saveUserToStorage(mockUser);
        } else {
          // If user doesn't exist in backend, register them
          await register(mockUser.username, email, password);
        }
      } catch (error) {
        console.error('Backend login failed, registering user...');
        await register(mockUser.username, email, password);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      
      const mockUser: User = {
        uid: `user_${Date.now()}`,
        email,
        username,
      };

      // Register in backend
      try {
        const response = await axios.post(`${API_BASE_URL}/api/register`, {
          username,
          email,
          password,
          uid: mockUser.uid,
        });

        if (response.data.ok) {
          setUser(mockUser);
          await saveUserToStorage(mockUser);
        } else {
          throw new Error('Registration failed');
        }
      } catch (error) {
        console.error('Backend registration error:', error);
        // For demo, still set user locally
        setUser(mockUser);
        await saveUserToStorage(mockUser);
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setUser(null);
      await removeUserFromStorage();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const googleSignIn = async () => {
    try {
      setLoading(true);
      // In a real app, you'd integrate with Google Sign-In
      // For demo purposes, we'll create a mock user
      const mockUser: User = {
        uid: `google_user_${Date.now()}`,
        email: 'demo@gmail.com',
        username: 'Demo User',
      };

      setUser(mockUser);
      await saveUserToStorage(mockUser);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw new Error('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    googleSignIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 