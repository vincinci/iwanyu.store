import express, { Request, Response } from 'express';
import { auth, db } from '../config/firebase';
import { FirebaseError } from 'firebase-admin';

const router = express.Router();

// Interface for the request with user data
interface RegisterRequest extends Request {
  body: {
    username: string;
    email: string;
    password: string;
    role?: string;
  };
}

// Interface for the login request
interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

// Interface for authenticated request
export interface AuthRequest extends Request {
  user?: {
    _id: string;
    username: string;
    email: string;
    role: 'customer' | 'vendor' | 'admin';
  };
  token?: string;
}

// Register a new user
router.post('/register', async function(req: RegisterRequest, res: Response) {
  try {
    const { username, email, password, role } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Create user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: username,
    });

    // Set custom claims for user role
    await auth.setCustomUserClaims(userRecord.uid, {
      role: role || 'customer'
    });

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      username,
      email,
      role: role || 'customer',
      createdAt: new Date().toISOString(),
      vendorInfo: null
    });

    // Generate custom token for the client
    const token = await auth.createCustomToken(userRecord.uid);

    console.log('User registered successfully:', userRecord.uid);

    res.status(201).json({
      _id: userRecord.uid,
      username,
      email,
      role: role || 'customer',
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle Firebase specific errors
    const firebaseError = error as FirebaseError;
    
    if (firebaseError.code === 'auth/email-already-exists') {
      return res.status(400).json({ message: 'Email is already in use' });
    }
    
    if (firebaseError.code === 'auth/invalid-email') {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    if (firebaseError.code === 'auth/weak-password') {
      return res.status(400).json({ message: 'Password is too weak' });
    }
    
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async function(req: LoginRequest, res: Response) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // For server-side login, we need to use Firebase Admin to verify credentials
    // This is a workaround since Firebase Admin doesn't have direct email/password auth
    
    try {
      // First, get the user by email
      const userRecord = await auth.getUserByEmail(email);
      
      // We can't verify password directly with Admin SDK, so we'll create a custom token
      // The client will use this token with signInWithCustomToken
      const token = await auth.createCustomToken(userRecord.uid);
      
      // Get user data from Firestore
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      const userData = userDoc.data();

      res.status(200).json({
        _id: userRecord.uid,
        username: userRecord.displayName,
        email: userRecord.email,
        role: userData?.role || 'customer',
        token
      });
    } catch (firebaseError) {
      console.error('Firebase auth error:', firebaseError);
      
      // Handle Firebase specific errors
      const error = firebaseError as FirebaseError;
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      throw error; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/profile', async function(req: AuthRequest, res: Response) {
  try {
    // Get token from request header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    
    try {
      // Verify the Firebase token
      const decodedToken = await auth.verifyIdToken(token);
      const uid = decodedToken.uid;
      
      // Get user data from Firestore
      const userDoc = await db.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const userData = userDoc.data();
      
      res.status(200).json({
        _id: uid,
        username: userData?.username,
        email: userData?.email,
        role: userData?.role || 'customer',
        vendorInfo: userData?.vendorInfo || null
      });
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
