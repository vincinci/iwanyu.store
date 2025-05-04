import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'iwanyu_secret_jwt_token_2025') as { id: string };
    
    // Since we're not actually connecting to the database in this simplified version,
    // we'll create a mock user for demonstration purposes
    const mockUser = {
      _id: decoded.id,
      username: 'testuser',
      email: 'test@example.com',
      role: 'customer' as 'customer' | 'vendor' | 'admin'
    };
    
    // Set the user property on the request object
    req.user = {
      _id: mockUser._id,
      username: mockUser.username,
      email: mockUser.email,
      role: mockUser.role
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
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
