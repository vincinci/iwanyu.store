import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../config/firebase';

// Extend the Express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        username: string;
        email: string;
        role: 'customer' | 'vendor' | 'admin';
      };
      token?: string;
    }
  }
}

// Middleware to protect routes
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      // Verify the Firebase token
      const decodedToken = await auth.verifyIdToken(token);
      const uid = decodedToken.uid;
      
      // Store the token for potential use in other middleware
      req.token = token;
      
      // Get user data from Firestore
      const userDoc = await db.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const userData = userDoc.data();
      
      // Set the user property on the request object
      req.user = {
        _id: uid,
        username: userData?.username || 'Unknown',
        email: userData?.email || 'unknown@example.com',
        role: (userData?.role as 'customer' | 'vendor' | 'admin') || 'customer'
      };
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check vendor role
export const vendorOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'vendor') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, vendor only' });
  }
};

// Middleware to check admin role
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, admin only' });
  }
};
