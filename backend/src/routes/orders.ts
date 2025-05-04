import express, { Request, Response, NextFunction } from 'express';
import { protect } from '../utils/authMiddleware';
import { AuthRequest } from '../routes/auth';
import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import flutterwaveService from '../services/flutterwaveService';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    
    // Validate required fields
    if (!items || !items.length || !shippingAddress || !paymentMethod) {
      res.status(400).json({ message: 'Items, shipping address, and payment method are required' });
      return;
    }
    
    // Get user ID from auth middleware
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    
    const userId = req.user._id;
    
    // Fetch products from Firestore
    const productIds = items.map((item: any) => item.productId);
    const productsSnapshot = await Promise.all(
      productIds.map(id => db.collection('products').doc(id).get())
    );
    
    const products = productsSnapshot
      .filter(doc => doc.exists)
      .map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Map products to order items with calculated prices
    const orderItems = items.map((item: any) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      
      return {
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
      };
    });
    
    // Calculate totals
    const itemsPrice = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping for orders over $100
    const taxPrice = itemsPrice * 0.15; // 15% tax
    const totalPrice = itemsPrice + shippingPrice + taxPrice;
    
    // Create order in Firestore
    const orderId = uuidv4();
    const orderData = {
      id: orderId,
      userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: false,
      paidAt: null,
      isDelivered: false,
      deliveredAt: null,
      createdAt: new Date().toISOString(),
    };
    
    await db.collection('orders').doc(orderId).set(orderData);
    
    // If payment method is Flutterwave, generate payment link
    if (paymentMethod === 'flutterwave') {
      // Get user data from Firestore
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      const userData = userDoc.data();
      
      // Generate a unique transaction reference
      const txRef = flutterwaveService.generateTransactionReference();
      
      // Create payment payload for Flutterwave
      const paymentPayload = {
        amount: totalPrice,
        currency: 'USD',
        payment_options: 'card',
        customer: {
          email: userData?.email || '',
          name: userData?.username || '',
          phone_number: userData?.phoneNumber || ''
        },
        customizations: {
          title: 'Iwanyu Order Payment',
          description: `Payment for Order #${orderId}`,
          logo: 'https://iwanyu.com/logo.png' // Replace with your actual logo URL
        },
        tx_ref: txRef,
        redirect_url: `${process.env.FRONTEND_URL}/api/orders/payment-callback`,
        meta: {
          orderId: orderId,
          userId: userId
        }
      };
      
      // Generate payment link with Flutterwave
      const paymentResponse = await flutterwaveService.generatePaymentLink(paymentPayload);
      
      // Update order with transaction reference
      await db.collection('orders').doc(orderId).update({
        transactionReference: txRef
      });
      
      // Return the payment link to redirect the user
      res.status(201).json({
        success: true,
        message: 'Order created and payment link generated',
        data: {
          order: orderData,
          paymentLink: paymentResponse.data.link,
          txRef
        }
      });
      return;
    }
    
    // For other payment methods, just return the order
    res.status(201).json({
      success: true,
      message: 'Order created',
      data: { order: orderData }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Server error during order creation' });
  }
});

// @route   GET /api/orders/payment-callback
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
      const { orderId } = verificationResponse.data.meta;
      
      // Find the order in Firestore
      const orderDoc = await db.collection('orders').doc(orderId).get();
      if (!orderDoc.exists) {
        res.status(404).json({ message: 'Order not found' });
        return;
      }
      
      // Update order to paid
      await db.collection('orders').doc(orderId).update({
        isPaid: true,
        paidAt: new Date().toISOString(),
        paymentResult: {
          id: transaction_id as string,
          status: 'completed',
          update_time: new Date().toISOString(),
          email_address: verificationResponse.data.customer.email
        }
      });
      
      // Redirect to success page
      res.redirect(`${process.env.FRONTEND_URL}/orders/${orderId}/success`);
    } else {
      // Payment failed
      res.redirect(`${process.env.FRONTEND_URL}/orders/payment-failed`);
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ message: 'Server error during payment callback processing' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const orderDoc = await db.collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    
    const orderData = orderDoc.data();
    
    // Check if the order belongs to the user or if the user is an admin
    if (orderData?.userId !== req.user?._id && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to view this order' });
      return;
    }
    
    res.json({ success: true, data: { order: orderData } });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
});

// @route   GET /api/orders
// @desc    Get all orders for a user
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;
    const ordersSnapshot = await db.collection('orders')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const orders = ordersSnapshot.docs.map(doc => doc.data());
    
    res.json({ success: true, data: { orders } });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// @route   PUT /api/orders/:id/pay
// @desc    Update order to paid
// @access  Private
router.put('/:id/pay', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { paymentResult } = req.body;
    const orderId = req.params.id;
    
    const orderDoc = await db.collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    
    const orderData = orderDoc.data();
    
    // Check if the order belongs to the user
    if (orderData?.userId !== req.user?._id) {
      res.status(403).json({ message: 'Not authorized to update this order' });
      return;
    }
    
    // Update order to paid
    const updatedOrder = {
      ...orderData,
      isPaid: true,
      paidAt: new Date().toISOString(),
      paymentResult
    };
    
    await db.collection('orders').doc(orderId).update(updatedOrder);
    
    res.json({ success: true, data: { order: updatedOrder } });
  } catch (error) {
    console.error('Update order payment error:', error);
    res.status(500).json({ message: 'Server error while updating order payment' });
  }
});

export default router;
