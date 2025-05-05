import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/neon';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// JWT Secret Key - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'iwanyu-secret-key';

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
      res.status(401).json({ message: 'Not authorized, no token' });
      return;
    }

    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as {
        _id: string;
        username: string;
        email: string;
        role: 'customer' | 'vendor' | 'admin';
      };
      
      // Store the token for potential use in other middleware
      req.token = token;
      
      // Get user data from database
      const userResults = await db.select().from(users).where(eq(users.id, decoded._id));
      
      if (userResults.length === 0) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      const user = userResults[0];
      
      // Set the user property on the request object
      req.user = {
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role as 'customer' | 'vendor' | 'admin'
      };
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({ message: 'Not authorized, invalid token' });
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
