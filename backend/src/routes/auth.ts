import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, query } from '../config/neon';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// JWT Secret Key - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'iwanyu-secret-key';

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
  // Explicitly include these properties from Request to fix TypeScript errors
  headers: Request['headers'];
  body: any;
  params: Request['params'];
}

// Register a new user
router.post('/register', async (req: RegisterRequest, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }

    // Check if email already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUser.length > 0) {
      res.status(400).json({ message: 'Email is already in use' });
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a UUID for the user
    const userId = uuidv4();

    // Create user in the database
    await db.insert(users).values({
      id: userId,
      username,
      email,
      password: hashedPassword,
      role: role || 'customer',
      createdAt: new Date(),
      updatedAt: new Date(),
      vendorInfo: null
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        _id: userId, 
        username, 
        email, 
        role: role || 'customer' 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('User registered successfully:', userId);

    res.status(201).json({
      _id: userId,
      username,
      email,
      role: role || 'customer',
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req: LoginRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    // Find user by email
    const userResults = await db.select().from(users).where(eq(users.email, email));
    
    if (userResults.length === 0) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const user = userResults[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        _id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      _id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user profile
router.get('/profile', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from request header
    const token = req.headers.authorization?.split(' ')[1];
    
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
      
      // Get user data from database
      const userResults = await db.select().from(users).where(eq(users.id, decoded._id));
      
      if (userResults.length === 0) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      const user = userResults[0];
      
      res.status(200).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        vendorInfo: user.vendorInfo || null
      });
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Authentication middleware
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from request header
    const token = req.headers.authorization?.split(' ')[1];
    
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
      
      // Set user in request
      req.user = decoded;
      next();
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default router;
