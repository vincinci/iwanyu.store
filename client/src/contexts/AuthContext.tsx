'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User as FirebaseUser,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

// User type definition
interface User {
  _id: string;
  username: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  vendorInfo?: any;
}

// Auth context type definition
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (username: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear error function
  const clearError = () => setError(null);

  // Function to fetch user data from Firestore
  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
      // Get user document from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Set user state with data from Firestore
        setUser({
          _id: firebaseUser.uid,
          username: userData.username || firebaseUser.displayName || 'User',
          email: firebaseUser.email || userData.email || '',
          role: userData.role || 'customer',
          vendorInfo: userData.vendorInfo || null
        });
      } else {
        // If user document doesn't exist in Firestore, create it
        const newUser = {
          username: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          role: 'customer',
          createdAt: new Date().toISOString(),
          vendorInfo: null
        };
        
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        
        setUser({
          _id: firebaseUser.uid,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    }
  };

  // Effect to listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        // User is signed in
        try {
          // Get user token and store it in localStorage
          const token = await getIdToken(firebaseUser);
          localStorage.setItem('token', token);
          
          // Fetch user data from Firestore
          await fetchUserData(firebaseUser);
        } catch (error) {
          console.error('Error in auth state change:', error);
          setError('Authentication error');
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
        localStorage.removeItem('token');
      }
      
      setLoading(false);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Register function
  const register = async (username: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create user in Firebase Authentication
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Sign in with the custom token returned from the server
      await signInWithCustomToken(auth, data.token);
      
      // User will be set by the onAuthStateChanged listener
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Option 1: Direct Firebase Authentication (client-side)
      // This doesn't work well with our custom backend that needs to set roles
      // await signInWithEmailAndPassword(auth, email, password);
      
      // Option 2: Use our backend for authentication
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Sign in with the custom token returned from the server
      await signInWithCustomToken(auth, data.token);
      
      // User will be set by the onAuthStateChanged listener
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Login with token function (for custom auth flows)
  const loginWithToken = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Sign in with the custom token
      await signInWithCustomToken(auth, token);
      
      // User will be set by the onAuthStateChanged listener
    } catch (error: any) {
      console.error('Token login error:', error);
      setError(error.message || 'Failed to login with token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      localStorage.removeItem('token');
      setUser(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message || 'Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  // Create context value
  const value = {
    user,
    loading,
    error,
    register,
    login,
    loginWithToken,
    logout,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
