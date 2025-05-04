import express, { Request, Response, RequestHandler } from 'express';
import { protect } from '../utils/authMiddleware';
import Order from '../models/order';
import Product from '../models/product';
import User from '../models/user';
import flutterwaveService from '../services/flutterwaveService';

const router = express.Router();

// Define custom interface for request with user
interface AuthRequest extends Request {
  user?: any;
}

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', protect, (async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    
    // Validate required fields
    if (!items || !items.length || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Items, shipping address, and payment method are required' });
    }
    
    // Get user ID from auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const userId = req.user._id;
    
    // Fetch products to calculate total price
    const productIds = items.map((item: any) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    
    // Map products to order items with calculated prices
    const orderItems = items.map((item: any) => {
      const product = products.find(p => p._id.toString() === item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      
      return {
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.images[0] || '',
      };
    });
    
    // Calculate totals
    const itemsPrice = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping for orders over $100
    const taxPrice = itemsPrice * 0.15; // 15% tax
    const totalPrice = itemsPrice + shippingPrice + taxPrice;
    
    // Create order in database
    const order = new Order({
      user: userId,
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
    });
    
    await order.save();
    
    // If payment method is Flutterwave, generate payment link
    if (paymentMethod === 'flutterwave') {
      // Get user details for payment
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Generate a unique transaction reference
      const txRef = flutterwaveService.generateTransactionReference();
      
      // Create payment payload for Flutterwave
      const paymentPayload = {
        amount: totalPrice,
        currency: 'USD',
        payment_options: 'card',
        customer: {
          email: user.email,
          name: user.username,
          phone_number: user.phoneNumber || ''
        },
        customizations: {
          title: 'Iwanyu Order Payment',
          description: `Payment for Order #${order._id}`,
          logo: 'https://iwanyu.com/logo.png' // Replace with your actual logo URL
        },
        tx_ref: txRef,
        redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3002'}/api/orders/payment-callback`,
        meta: {
          orderId: order._id.toString(),
          userId: userId.toString()
        }
      };
      
      // Generate payment link with Flutterwave
      const paymentResponse = await flutterwaveService.generatePaymentLink(paymentPayload);
      
      // Update order with transaction reference
      order.transactionReference = txRef;
      await order.save();
      
      if (process.env.NODE_ENV === 'production') {
        // Return the payment link to redirect the user
        return res.status(201).json({
          success: true,
          message: 'Order created and payment link generated',
          data: {
            order,
            paymentLink: paymentResponse.data.link,
            txRef
          }
        });
      } else {
        // For testing, return the order with a simulated payment link
        return res.status(201).json({
          success: true,
          message: 'Order created (test mode)',
          data: {
            order,
            paymentLink: `${process.env.FRONTEND_URL || 'http://localhost:3002'}/checkout/payment?order=${order._id}&test=true`,
            txRef,
            testMode: true
          }
        });
      }
    }
    
    // For other payment methods, just return the order
    res.status(201).json({
      success: true,
      message: 'Order created',
      data: { order }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Server error during order creation' });
  }
}) as RequestHandler);

// @route   GET /api/orders/payment-callback
// @desc    Handle payment callback from Flutterwave
// @access  Public
router.get('/payment-callback', (async (req: Request, res: Response) => {
  try {
    const { transaction_id, tx_ref, status } = req.query;
    
    if (!transaction_id || !tx_ref) {
      return res.status(400).json({ message: 'Invalid payment callback' });
    }
    
    // Verify the transaction with Flutterwave
    const verificationResponse = await flutterwaveService.verifyTransaction(transaction_id as string);
    
    if (verificationResponse.data.status === 'successful') {
      // Extract metadata from the transaction
      const { orderId } = verificationResponse.data.meta;
      
      // Find the order
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Update order to paid
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentResult = {
        id: transaction_id as string,
        status: 'completed',
        update_time: new Date().toISOString(),
        email_address: verificationResponse.data.customer.email
      };
      
      await order.save();
      
      // Redirect to success page
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}/orders/${order._id}/success`);
    } else {
      // Payment failed
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3002'}/orders/payment-failed`);
    }
  } catch (error) {
    console.error('Payment callback error:', error);
    res.status(500).json({ message: 'Server error during payment callback processing' });
  }
}) as RequestHandler);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, (async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the order belongs to the user or if the user is an admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json({ success: true, data: { order } });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
}) as RequestHandler);

// @route   GET /api/orders
// @desc    Get all orders for a user
// @access  Private
router.get('/', protect, (async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    res.json({ success: true, data: { orders } });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
}) as RequestHandler);

// @route   PUT /api/orders/:id/pay
// @desc    Update order to paid
// @access  Private
router.put('/:id/pay', protect, (async (req: AuthRequest, res: Response) => {
  try {
    const { paymentResult } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if the order belongs to the user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
    
    // Update order to paid
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = paymentResult;
    
    const updatedOrder = await order.save();
    
    res.json({ success: true, data: { order: updatedOrder } });
  } catch (error) {
    console.error('Update order payment error:', error);
    res.status(500).json({ message: 'Server error while updating order payment' });
  }
}) as RequestHandler);

export default router;
