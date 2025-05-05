import express, { Request, Response, NextFunction } from 'express';
import { protect } from '../utils/authMiddleware';
import { AuthRequest } from '../routes/auth';
import { db } from '../config/neon';
import flutterwaveService from '../services/flutterwaveService';
import { users, products, subscriptionPlans } from '../db/schema';
import { eq, and, desc, count } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// @route   GET /api/vendor/subscription-plans
// @desc    Get available subscription plans
// @access  Public
router.get('/subscription-plans', async (req: Request, res: Response) => {
  try {
    // Get subscription plans from database
    const plans = await db.select().from(subscriptionPlans);
    
    // Format plans for response
    const formattedPlans = plans.reduce((acc, plan) => {
      acc[plan.id] = {
        id: plan.id,
        name: plan.name,
        price: plan.price / 100, // Convert from cents to dollars for display
        features: plan.features as string[]
      };
      return acc;
    }, {} as Record<string, { id: string; name: string; price: number; features: string[] }>);
    
    res.json(formattedPlans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ message: 'Server error while fetching subscription plans' });
  }
});

// @route   POST /api/vendor/apply
// @desc    Submit vendor application
// @access  Private
router.post('/apply', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { storeName, description, phoneNumber, address, category } = req.body;
    
    // Validate required fields
    if (!storeName || !description || !phoneNumber || !address || !category) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }
    
    // Get user ID from auth middleware
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    
    const userId = req.user._id;
    
    // Check if user exists in database
    const userResults = await db.select().from(users).where(eq(users.id, userId));
    
    if (userResults.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const userData = userResults[0];
    
    // Check if user is already a vendor
    if (userData.role === 'vendor') {
      res.status(400).json({ message: 'User is already a vendor' });
      return;
    }
    
    // Create vendor application
    const vendorInfo = {
      storeName,
      description,
      phoneNumber,
      address,
      category,
      status: 'pending', // pending, approved, rejected
      appliedAt: new Date().toISOString()
    };
    
    // Update user with vendor info
    await db.update(users)
      .set({
        vendorInfo: JSON.stringify(vendorInfo),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    res.status(201).json({ 
      message: 'Vendor application submitted successfully',
      status: 'pending',
      vendorInfo
    });
  } catch (error) {
    console.error('Vendor application error:', error);
    res.status(500).json({ message: 'Server error during vendor application' });
  }
});

// @route   POST /api/vendor/process-payment
// @desc    Process subscription payment and update user to vendor
// @access  Private
router.post('/process-payment', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subscriptionPlan, paymentMethodId, cardDetails } = req.body;
    
    // Validate required fields
    if (!subscriptionPlan) {
      res.status(400).json({ message: 'Subscription plan is required' });
      return;
    }
    
    // Validate subscription plan
    const planResults = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, subscriptionPlan));
    
    if (planResults.length === 0) {
      res.status(400).json({ message: 'Invalid subscription plan' });
      return;
    }
    
    const plan = planResults[0];
    
    // Get user ID from auth middleware
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    
    const userId = req.user._id;
    
    // Check if user exists in database
    const userResults = await db.select().from(users).where(eq(users.id, userId));
    
    if (userResults.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const userData = userResults[0];
    
    // Check if user has vendorInfo
    if (!userData.vendorInfo) {
      res.status(400).json({ message: 'Vendor application not found' });
      return;
    }
    
    const vendorInfo = typeof userData.vendorInfo === 'string' 
      ? JSON.parse(userData.vendorInfo) 
      : userData.vendorInfo;
    
    // Generate a unique transaction reference
    const txRef = flutterwaveService.generateTransactionReference();
    
    // Create payment payload for Flutterwave
    const paymentPayload = {
      amount: plan.price / 100, // Convert from cents to dollars for payment
      currency: 'USD',
      payment_options: 'card',
      customer: {
        email: userData.email,
        name: userData.username,
        phone_number: vendorInfo.phoneNumber || ''
      },
      customizations: {
        title: 'Iwanyu Vendor Subscription',
        description: `Payment for ${plan.name} Subscription`,
        logo: 'https://iwanyu.com/logo.png' // Replace with your actual logo URL
      },
      tx_ref: txRef,
      redirect_url: `${process.env.FRONTEND_URL}/api/vendor/payment-callback`,
      meta: {
        userId: userId,
        subscriptionPlan: subscriptionPlan
      }
    };
    
    // Generate payment link with Flutterwave
    const paymentResponse = await flutterwaveService.generatePaymentLink(paymentPayload);
    
    // Update user with transaction reference
    vendorInfo.transactionReference = txRef;
    
    await db.update(users)
      .set({
        vendorInfo: JSON.stringify(vendorInfo),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    // Return the payment link to redirect the user
    res.json({
      success: true,
      message: 'Payment link generated',
      data: {
        paymentLink: paymentResponse.data.link,
        txRef
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ message: 'Server error during payment processing' });
  }
});

// @route   GET /api/vendor/payment-callback
// @desc    Handle payment callback from Flutterwave
// @access  Public
router.get('/payment-callback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transaction_id, tx_ref, status } = req.query;
    
    if (!transaction_id || !tx_ref) {
      res.status(400).json({ message: 'Invalid payment callback' });
      return;
    }
    
    // Verify the transaction with Flutterwave
    const verificationResponse = await flutterwaveService.verifyTransaction(transaction_id as string);
    
    if (verificationResponse.data.status === 'successful') {
      // Extract metadata from the transaction
      const { userId, subscriptionPlan } = verificationResponse.data.meta;
      
      // Find the user in database
      const userResults = await db.select().from(users).where(eq(users.id, userId));
      
      if (userResults.length === 0) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      const userData = userResults[0];
      
      // Check if user has vendorInfo
      if (!userData.vendorInfo) {
        res.status(400).json({ message: 'Vendor application not found' });
        return;
      }
      
      const vendorInfo = typeof userData.vendorInfo === 'string' 
        ? JSON.parse(userData.vendorInfo) 
        : userData.vendorInfo;
      
      // Calculate subscription end date (1 month from now)
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
      
      // Update vendor info
      vendorInfo.status = 'approved';
      vendorInfo.approvedAt = new Date().toISOString();
      vendorInfo.subscriptionPlan = subscriptionPlan;
      vendorInfo.subscriptionStartDate = new Date().toISOString();
      vendorInfo.subscriptionEndDate = subscriptionEndDate.toISOString();
      vendorInfo.transactionReference = tx_ref as string;
      vendorInfo.transactionId = transaction_id as string;
      
      // Update user to vendor role
      await db.update(users)
        .set({
          role: 'vendor',
          vendorInfo: JSON.stringify(vendorInfo),
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
      
      // Redirect to success page
      res.redirect(`${process.env.FRONTEND_URL}/become-vendor/success`);
    } else {
      // Payment failed
      res.redirect(`${process.env.FRONTEND_URL}/become-vendor/failed`);
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ message: 'Server error during payment callback processing' });
  }
});

// @route   GET /api/vendor/dashboard
// @desc    Get vendor dashboard data
// @access  Private (vendors only)
router.get('/dashboard', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get user ID from auth middleware
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    
    const userId = req.user._id;
    
    // Check if user exists in database
    const userResults = await db.select().from(users).where(eq(users.id, userId));
    
    if (userResults.length === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const userData = userResults[0];
    
    // Check if user is a vendor
    if (userData.role !== 'vendor') {
      res.status(403).json({ message: 'Access denied. User is not a vendor' });
      return;
    }
    
    const vendorInfo = typeof userData.vendorInfo === 'string' 
      ? JSON.parse(userData.vendorInfo) 
      : userData.vendorInfo;
    
    // Get product count
    const productsCount = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.vendorId, userId));
    
    const totalProducts = productsCount[0]?.count || 0;
    
    // Get order stats (in a real app, you'd calculate this from orders)
    // For now, we'll just return placeholder values
    
    // Return vendor dashboard data
    res.json({
      vendor: {
        _id: userId,
        username: userData.username,
        email: userData.email,
        storeName: vendorInfo?.storeName,
        description: vendorInfo?.description,
        category: vendorInfo?.category,
        subscriptionPlan: vendorInfo?.subscriptionPlan,
        subscriptionStartDate: vendorInfo?.subscriptionStartDate,
        subscriptionEndDate: vendorInfo?.subscriptionEndDate,
        status: vendorInfo?.status
      },
      stats: {
        totalProducts,
        totalSales: 0, // This would be fetched from orders in a real app
        totalRevenue: 0 // This would be calculated from orders in a real app
      }
    });
  } catch (error) {
    console.error('Vendor dashboard error:', error);
    res.status(500).json({ message: 'Server error while fetching vendor dashboard data' });
  }
});

export default router;
