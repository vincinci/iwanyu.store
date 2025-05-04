import express, { Request, Response, NextFunction } from 'express';
import { protect } from '../utils/authMiddleware';
import { AuthRequest } from '../routes/auth';
import { db } from '../config/firebase';
import flutterwaveService from '../services/flutterwaveService';

const router = express.Router();

// Subscription plans
const SUBSCRIPTION_PLANS: Record<string, {
  id: string;
  name: string;
  price: number;
  features: string[];
}> = {
  basic: {
    id: 'basic',
    name: 'Basic Vendor',
    price: 50,
    features: [
      'List up to 10 products',
      'Basic analytics',
      'Standard customer support',
      '5% commission fee'
    ]
  },
  premium: {
    id: 'premium',
    name: 'Premium Vendor',
    price: 100,
    features: [
      'Unlimited products',
      'Advanced analytics',
      'Priority customer support',
      '3% commission fee'
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Vendor',
    price: 200,
    features: [
      'Unlimited products',
      'Premium analytics & insights',
      'Dedicated account manager',
      '2% commission fee'
    ]
  }
};

// @route   GET /api/vendor/subscription-plans
// @desc    Get available subscription plans
// @access  Public
router.get('/subscription-plans', (req: Request, res: Response) => {
  res.json(SUBSCRIPTION_PLANS);
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
    
    // Check if user exists in Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const userData = userDoc.data();
    
    // Check if user is already a vendor
    if (userData?.role === 'vendor') {
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
    
    // Update user document with vendor info
    await db.collection('users').doc(userId).update({
      vendorInfo
    });
    
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
    if (!SUBSCRIPTION_PLANS[subscriptionPlan as keyof typeof SUBSCRIPTION_PLANS]) {
      res.status(400).json({ message: 'Invalid subscription plan' });
      return;
    }
    
    // Get user ID from auth middleware
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    
    const userId = req.user._id;
    
    // Check if user exists in Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const userData = userDoc.data();
    
    // Check if user has vendorInfo
    if (!userData?.vendorInfo) {
      res.status(400).json({ message: 'Vendor application not found' });
      return;
    }
    
    // Get subscription plan details
    const plan = SUBSCRIPTION_PLANS[subscriptionPlan as keyof typeof SUBSCRIPTION_PLANS];
    
    // Generate a unique transaction reference
    const txRef = flutterwaveService.generateTransactionReference();
    
    // Create payment payload for Flutterwave
    const paymentPayload = {
      amount: plan.price,
      currency: 'USD',
      payment_options: 'card',
      customer: {
        email: userData.email,
        name: userData.username,
        phone_number: userData.vendorInfo.phoneNumber || ''
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
      
      // Find the user in Firestore
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      const userData = userDoc.data();
      
      // Check if user has vendorInfo
      if (!userData?.vendorInfo) {
        res.status(400).json({ message: 'Vendor application not found' });
        return;
      }
      
      // Calculate subscription end date (1 month from now)
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
      
      // Update user to vendor role
      await db.collection('users').doc(userId).update({
        role: 'vendor',
        'vendorInfo.status': 'approved',
        'vendorInfo.approvedAt': new Date().toISOString(),
        'vendorInfo.subscriptionPlan': subscriptionPlan,
        'vendorInfo.subscriptionStartDate': new Date().toISOString(),
        'vendorInfo.subscriptionEndDate': subscriptionEndDate.toISOString(),
        'vendorInfo.transactionReference': tx_ref as string,
        'vendorInfo.transactionId': transaction_id as string
      });
      
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
    
    // Check if user exists in Firestore
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    const userData = userDoc.data();
    
    // Check if user is a vendor
    if (userData?.role !== 'vendor') {
      res.status(403).json({ message: 'Access denied. User is not a vendor' });
      return;
    }
    
    // Get product count
    const productsSnapshot = await db.collection('products')
      .where('vendorId', '==', userId)
      .get();
    
    const totalProducts = productsSnapshot.size;
    
    // Get order stats (in a real app, you'd calculate this from orders)
    // For now, we'll just return placeholder values
    
    // Return vendor dashboard data
    res.json({
      vendor: {
        _id: userId,
        username: userData.username,
        email: userData.email,
        storeName: userData.vendorInfo?.storeName,
        description: userData.vendorInfo?.description,
        category: userData.vendorInfo?.category,
        subscriptionPlan: userData.vendorInfo?.subscriptionPlan,
        subscriptionStartDate: userData.vendorInfo?.subscriptionStartDate,
        subscriptionEndDate: userData.vendorInfo?.subscriptionEndDate,
        status: userData.vendorInfo?.status
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
