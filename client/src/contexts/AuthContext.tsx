'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Define user type
interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  vendorInfo?: {
    storeName: string;
    description: string;
    phoneNumber: string;
    address: string;
    category: string;
    status: string;
    appliedAt: string;
    approvedAt?: string;
    subscriptionPlan?: string;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
  };
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
  fetchProfile: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        // If token is invalid, clear it and set user to null
        if (response.status === 401) {
          console.log('Token invalid or expired, logging out');
          localStorage.removeItem('token');
          setUser(null);
          return;
        }
        throw new Error('Failed to fetch profile');
      }
      
      // Try to parse the response as JSON
      try {
        const userData = await response.json();
        setUser(userData);
        console.log('Profile fetched successfully:', userData);
      } catch (parseError) {
        console.error('Error parsing profile response:', parseError);
        // If we can't parse the response as JSON, log the raw response
        const text = await response.text();
        console.error('Raw response:', text);
        throw new Error('Invalid profile response format');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check for token and fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      // Try to parse the response as JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing login response:', parseError);
        // If we can't parse the response as JSON, log the raw response
        const text = await response.text();
        console.error('Raw response:', text);
        throw new Error('Invalid login response format');
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Set user data
      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        role: data.role,
        vendorInfo: data.vendorInfo,
      });
      
      // Redirect based on user role
      if (data.role === 'admin') {
        router.push('/admin');
      } else if (data.role === 'vendor') {
        router.push('/vendor/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  // Register function
  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      // Try to parse the response as JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing register response:', parseError);
        // If we can't parse the response as JSON, log the raw response
        const text = await response.text();
        console.error('Raw response:', text);
        throw new Error('Invalid register response format');
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Set user data
      setUser({
        _id: data._id,
        username: data.username,
        email: data.email,
        role: data.role,
        vendorInfo: data.vendorInfo,
      });
      
      // Redirect to home page
      router.push('/');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, register, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
