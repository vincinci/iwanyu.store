const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category');
const { protect } = require('../utils/authMiddleware');

// @route   GET /api/products
// @desc    Get all products with pagination, filtering, and sorting
// @access  Public
router.get('/', async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.keyword ? {
      $or: [
        { name: { $regex: req.query.keyword, $options: 'i' } },
        { description: { $regex: req.query.keyword, $options: 'i' } }
      ]
    } : {};
    
    // Build filter object
    const filter = { ...keyword, status: 'published' };
    
    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }
    
    // Vendor filter
    if (req.query.vendor) {
      filter.vendor = req.query.vendor;
    }
    
    // Rating filter
    if (req.query.rating) {
      filter['rating.average'] = { $gte: Number(req.query.rating) };
    }
    
    // Featured filter
    if (req.query.featured === 'true') {
      filter.featured = true;
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
    
    const count = await Product.countDocuments(filter);
    
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .populate('vendor', 'username')
      .sort(sortBy)
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      count,
      totalPages: Math.ceil(count / pageSize)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    
    const featuredProducts = await Product.find({ 
      featured: true,
      status: 'published'
    })
      .populate('category', 'name slug')
      .populate('vendor', 'username')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.json(featuredProducts);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Server error while fetching featured products' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('vendor', 'username')
      .populate({
        path: 'reviews.user',
        select: 'username profileImage'
      });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Vendor
router.post('/', protect, async (req, res) => {
  try {
    // Check if user is a vendor
    if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized, vendor or admin access only' });
    }
    
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      stock,
      images,
      attributes,
      tags,
      featured
    } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    
    // Create new product
    const product = new Product({
      name,
      description,
      price,
      discountPrice: discountPrice || price,
      category,
      vendor: req.user._id,
      stock: stock || 0,
      images: images || [],
      attributes: attributes || {},
      tags: tags || [],
      featured: featured || false
    });
    
    const createdProduct = await product.save();
    
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error while creating product' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Vendor
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user is the vendor who created the product or an admin
    if (
      (product.vendor.toString() !== req.user._id.toString()) && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }
    
    const {
      name,
      description,
      price,
      discountPrice,
      category,
      stock,
      images,
      attributes,
      tags,
      featured,
      status
    } = req.body;
    
    // Update product fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (discountPrice) product.discountPrice = discountPrice;
    if (category) {
      // Check if category exists
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category' });
      }
      product.category = category;
    }
    if (stock !== undefined) product.stock = stock;
    if (images) product.images = images;
    if (attributes) product.attributes = attributes;
    if (tags) product.tags = tags;
    if (featured !== undefined) product.featured = featured;
    if (status) product.status = status;
    
    const updatedProduct = await product.save();
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Vendor
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user is the vendor who created the product or an admin
    if (
      (product.vendor.toString() !== req.user._id.toString()) && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }
    
    await product.deleteOne();
    
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Create a product review
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating) {
      return res.status(400).json({ message: 'Please provide a rating' });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );
    
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    
    // Create new review
    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment: comment || ''
    };
    
    // Add review to product
    product.reviews.push(review);
    
    // Update product rating
    const totalRatings = product.reviews.reduce((acc, item) => acc + item.rating, 0);
    product.rating.average = totalRatings / product.reviews.length;
    product.rating.count = product.reviews.length;
    
    await product.save();
    
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error while creating review' });
  }
});

module.exports = router;
