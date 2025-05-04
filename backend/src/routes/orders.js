const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const { protect } = require('../utils/authMiddleware');

// @route   GET /api/orders
// @desc    Get all orders for the logged-in user or all orders for admin
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    
    let filter = {};
    
    // If not admin, only show user's orders
    if (req.user.role !== 'admin') {
      filter.user = req.user._id;
    }
    
    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }
    
    // Build sort object
    let sortBy = {};
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sortBy[field.substring(1)] = -1;
        } else {
          sortBy[field] = 1;
        }
      });
    } else {
      sortBy = { createdAt: -1 }; // Default sort by newest
    }
    
    const count = await Order.countDocuments(filter);
    
    const orders = await Order.find(filter)
      .populate('user', 'username email')
      .sort(sortBy)
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      count,
      totalPages: Math.ceil(count / pageSize)
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// @route   GET /api/orders/vendor
// @desc    Get all orders for the vendor's products
// @access  Private/Vendor
router.get('/vendor', protect, async (req, res) => {
  try {
    // Check if user is a vendor
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Not authorized, vendor access only' });
    }
    
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    
    // Find orders containing products from this vendor
    const filter = {
      'items.vendor': req.user._id
    };
    
    // Status filter
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }
    
    // Build sort object
    let sortBy = {};
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sortBy[field.substring(1)] = -1;
        } else {
          sortBy[field] = 1;
        }
      });
    } else {
      sortBy = { createdAt: -1 }; // Default sort by newest
    }
    
    const count = await Order.countDocuments(filter);
    
    const orders = await Order.find(filter)
      .populate('user', 'username email')
      .sort(sortBy)
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    // Filter out items that don't belong to this vendor
    const vendorOrders = orders.map(order => {
      const vendorItems = order.items.filter(
        item => item.vendor && item.vendor.toString() === req.user._id.toString()
      );
      
      // Calculate vendor's portion of the order
      const itemsPrice = vendorItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      
      return {
        _id: order._id,
        user: order.user,
        items: vendorItems,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        itemsPrice,
        status: order.status,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
        isDelivered: order.isDelivered,
        deliveredAt: order.deliveredAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    });
    
    res.json({
      orders: vendorOrders,
      page,
      pages: Math.ceil(count / pageSize),
      count,
      totalPages: Math.ceil(count / pageSize)
    });
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({ message: 'Server error while fetching vendor orders' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'username email')
      .populate('items.product', 'name images')
      .populate('items.vendor', 'username');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to view this order
    if (
      order.user._id.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin' &&
      !order.items.some(item => 
        item.vendor && item.vendor._id.toString() === req.user._id.toString()
      )
    ) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    // If vendor, only show their items
    if (req.user.role === 'vendor') {
      order.items = order.items.filter(
        item => item.vendor && item.vendor._id.toString() === req.user._id.toString()
      );
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
});

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod
    } = req.body;
    
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }
    
    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Please provide shipping address and payment method' });
    }
    
    // Get full product details and calculate prices
    const itemsWithDetails = [];
    let itemsPrice = 0;
    
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }
      
      // Check if enough stock
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Not enough stock for ${product.name}. Available: ${product.stock}` 
        });
      }
      
      // Calculate price
      const price = product.discountPrice || product.price;
      itemsPrice += price * item.quantity;
      
      // Add to items array
      itemsWithDetails.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price,
        image: product.images.length > 0 ? product.images[0].url : '',
        vendor: product.vendor
      });
      
      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    // Calculate prices
    const shippingPrice = itemsPrice > 10000 ? 0 : 1000; // Free shipping over 10,000 RWF
    const taxPrice = Math.round(itemsPrice * 0.18); // 18% VAT
    const totalPrice = itemsPrice + shippingPrice + taxPrice;
    
    // Create order
    const order = new Order({
      user: req.user._id,
      items: itemsWithDetails,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    });
    
    const createdOrder = await order.save();
    
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
});

// @route   PUT /api/orders/:id/pay
// @desc    Update order to paid
// @access  Private
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Only the user who created the order or admin can mark it as paid
    if (
      order.user.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
    
    const { paymentResult } = req.body;
    
    if (!paymentResult) {
      return res.status(400).json({ message: 'Please provide payment result' });
    }
    
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = paymentResult;
    order.status = 'processing';
    
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order to paid:', error);
    res.status(500).json({ message: 'Server error while updating order to paid' });
  }
});

// @route   PUT /api/orders/:id/deliver
// @desc    Update order to delivered
// @access  Private/Vendor/Admin
router.put('/:id/deliver', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user is authorized to update this order
    if (
      req.user.role !== 'admin' &&
      !order.items.some(item => 
        item.vendor && item.vendor.toString() === req.user._id.toString()
      )
    ) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
    
    // If not paid, cannot mark as delivered
    if (!order.isPaid) {
      return res.status(400).json({ message: 'Order not paid yet' });
    }
    
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';
    
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order to delivered:', error);
    res.status(500).json({ message: 'Server error while updating order to delivered' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', protect, async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized, admin access only' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Please provide status' });
    }
    
    // Validate status
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    order.status = status;
    
    // Update related fields based on status
    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
    
    if (status === 'cancelled') {
      // Return items to stock
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }
    
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error while updating order status' });
  }
});

module.exports = router;
