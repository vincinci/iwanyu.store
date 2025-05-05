import express, { Request, Response, NextFunction } from 'express';
import { protect } from '../utils/authMiddleware';
import { AuthRequest } from '../routes/auth';
import { db } from '../config/neon';
import { v4 as uuidv4 } from 'uuid';
import flutterwaveService from '../services/flutterwaveService';
import { orders, orderItems, products, users } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';

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
    
    // Fetch products from database
    const productIds = items.map((item: any) => item.productId);
    
    // Get all products in a single query
    const productsData = await db.select().from(products).where(
      inArray(products.id, productIds)
    );
    
    // Map products to order items with calculated prices
    const orderItemsData = items.map((item: any) => {
      const product = productsData.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      
      return {
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.images && Array.isArray(product.images) && product.images.length > 0 
          ? product.images[0] 
          : '',
      };
    });
    
    // Calculate totals
    const itemsPrice = orderItemsData.reduce((total, item) => total + item.price * item.quantity, 0);
    const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping for orders over $100
    const taxPrice = itemsPrice * 0.15; // 15% tax
    const totalPrice = itemsPrice + shippingPrice + taxPrice;
    
    // Create order in database
    const orderId = uuidv4();
    
    await db.insert(orders).values({
      id: orderId,
      userId,
      shippingAddress: JSON.stringify(shippingAddress),
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: false,
      paidAt: null,
      isDelivered: false,
      deliveredAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Insert order items
    for (const item of orderItemsData) {
      await db.insert(orderItems).values({
        id: uuidv4(),
        orderId,
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // If payment method is Flutterwave, generate payment link
    if (paymentMethod === 'flutterwave') {
      // Get user data from database
      const userData = await db.select().from(users).where(eq(users.id, userId));
      
      if (userData.length === 0) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      const user = userData[0];
      
      // Generate a unique transaction reference
      const txRef = flutterwaveService.generateTransactionReference();
      
      // Create payment payload for Flutterwave
      const paymentPayload = {
        amount: totalPrice,
        currency: 'USD',
        payment_options: 'card',
        customer: {
          email: user.email || '',
          name: user.username || '',
          phone_number: user.phoneNumber || ''
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
      await db.update(orders)
        .set({ transactionReference: txRef })
        .where(eq(orders.id, orderId));
      
      // Return the payment link to redirect the user
      res.status(201).json({
        success: true,
        message: 'Order created and payment link generated',
        data: {
          order: {
            id: orderId,
            userId,
            orderItems: orderItemsData,
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
            createdAt: new Date(),
            transactionReference: txRef
          },
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
      data: { 
        order: {
          id: orderId,
          userId,
          orderItems: orderItemsData,
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
          createdAt: new Date()
        } 
      }
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
      
      // Update order to paid
      await db.update(orders)
        .set({
          isPaid: true,
          paidAt: new Date(),
          paymentResult: JSON.stringify({
            id: transaction_id as string,
            status: 'completed',
            update_time: new Date().toISOString(),
            email_address: verificationResponse.data.customer.email
          })
        })
        .where(eq(orders.id, orderId));
      
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
    
    // Get order from database
    const orderData = await db.select().from(orders).where(eq(orders.id, orderId));
    
    if (orderData.length === 0) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    
    const order = orderData[0];
    
    // Get order items
    const orderItemsData = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    
    // Check if the order belongs to the user or if the user is an admin
    if (order.userId !== req.user?._id && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to view this order' });
      return;
    }
    
    // Parse shipping address from JSON string
    const shippingAddress = order.shippingAddress ? JSON.parse(order.shippingAddress as string) : null;
    
    // Combine order with its items
    const fullOrder = {
      ...order,
      shippingAddress,
      orderItems: orderItemsData
    };
    
    res.json({ success: true, data: { order: fullOrder } });
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
    
    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    
    // Get orders from database
    const ordersData = await db.select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(orders.createdAt);
    
    // Get all order items for these orders
    const orderIds = ordersData.map(order => order.id);
    
    let orderItemsData: any[] = [];
    if (orderIds.length > 0) {
      orderItemsData = await db.select()
        .from(orderItems)
        .where(inArray(orderItems.orderId, orderIds));
    }
    
    // Combine orders with their items
    const fullOrders = ordersData.map(order => {
      const items = orderItemsData.filter(item => item.orderId === order.id);
      const shippingAddress = order.shippingAddress ? JSON.parse(order.shippingAddress as string) : null;
      
      return {
        ...order,
        shippingAddress,
        orderItems: items
      };
    });
    
    res.json({ success: true, data: { orders: fullOrders } });
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
    
    // Get order from database
    const orderData = await db.select().from(orders).where(eq(orders.id, orderId));
    
    if (orderData.length === 0) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    
    const order = orderData[0];
    
    // Check if the order belongs to the user
    if (order.userId !== req.user?._id) {
      res.status(403).json({ message: 'Not authorized to update this order' });
      return;
    }
    
    // Update order to paid
    await db.update(orders)
      .set({
        isPaid: true,
        paidAt: new Date(),
        paymentResult: JSON.stringify(paymentResult),
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId));
    
    // Get updated order
    const updatedOrderData = await db.select().from(orders).where(eq(orders.id, orderId));
    const updatedOrder = updatedOrderData[0];
    
    // Get order items
    const orderItemsData = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    
    // Parse shipping address from JSON string
    const shippingAddress = updatedOrder.shippingAddress ? JSON.parse(updatedOrder.shippingAddress as string) : null;
    
    // Combine order with its items
    const fullOrder = {
      ...updatedOrder,
      shippingAddress,
      orderItems: orderItemsData
    };
    
    res.json({ success: true, data: { order: fullOrder } });
  } catch (error) {
    console.error('Update order payment error:', error);
    res.status(500).json({ message: 'Server error while updating order payment' });
  }
});

export default router;
