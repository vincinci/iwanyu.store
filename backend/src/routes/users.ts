import express, { Request, Response } from 'express';
import User from '../models/user';
import { protect, adminOnly } from '../utils/authMiddleware';
import { AuthRequest } from './auth';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const userResult = await User.findById(req.user._id).select('-password');
    
    if (!userResult) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json(userResult);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const userResult = await User.findById(req.user._id).exec();
    
    if (!userResult) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    // Create an updated user object
    const updatedData = {
      username: req.body.username || userResult.username,
      email: req.body.email || userResult.email,
      password: req.body.password ? req.body.password : userResult.password
    };
    
    // Update the user in the database
    await User.updateOne({ _id: req.user._id }, updatedData);
    
    // Get the updated user
    const updatedUser = await User.findById(req.user._id).exec();
    
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
