const express = require('express');
const router = express.Router();
const Store = require('../models/store');
const Product = require('../models/product');
const User = require('../models/user');
const { protect } = require('../utils/authMiddleware');

// @route   GET /api/stores
// @desc    Get all stores
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
    const filter = { ...keyword, status: 'active' };
    
    // Featured filter
    if (req.query.featured === 'true') {
      filter.featured = true;
    }
    
    // Verified filter
    if (req.query.verified === 'true') {
      filter.verified = true;
    }
    
    // Category filter
    if (req.query.category) {
      filter.categories = req.query.category;
    }
    
    // Rating filter
    if (req.query.rating) {
      filter['rating.average'] = { $gte: Number(req.query.rating) };
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
    
    const count = await Store.countDocuments(filter);
    
    const stores = await Store.find(filter)
      .populate('owner', 'username')
      .populate('categories', 'name slug')
      .sort(sortBy)
      .limit(pageSize)
      .skip(pageSize * (page - 1));
    
    res.json({
      stores,
      page,
      pages: Math.ceil(count / pageSize),
      count,
      totalPages: Math.ceil(count / pageSize)
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ message: 'Server error while fetching stores' });
  }
});

// @route   GET /api/stores/featured
// @desc    Get featured stores
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    
    const featuredStores = await Store.find({ 
      featured: true,
      status: 'active'
    })
      .populate('owner', 'username')
      .populate('categories', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.json(featuredStores);
  } catch (error) {
    console.error('Error fetching featured stores:', error);
    res.status(500).json({ message: 'Server error while fetching featured stores' });
  }
});

// @route   GET /api/stores/:id
// @desc    Get store by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate('owner', 'username')
      .populate('categories', 'name slug')
      .populate({
        path: 'reviews.user',
        select: 'username profileImage'
      });
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    res.json(store);
  } catch (error) {
    console.error('Error fetching store:', error);
    res.status(500).json({ message: 'Server error while fetching store' });
  }
});

// @route   GET /api/stores/slug/:slug
// @desc    Get store by slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const store = await Store.findOne({ slug: req.params.slug })
      .populate('owner', 'username')
      .populate('categories', 'name slug')
      .populate({
        path: 'reviews.user',
        select: 'username profileImage'
      });
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    res.json(store);
  } catch (error) {
    console.error('Error fetching store by slug:', error);
    res.status(500).json({ message: 'Server error while fetching store' });
  }
});

// @route   GET /api/stores/:id/products
// @desc    Get products by store
// @access  Public
router.get('/:id/products', async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    
    // Get store
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Build filter object
    const filter = {
      vendor: store.owner,
      status: 'published'
    };
    
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
    
    // Rating filter
    if (req.query.rating) {
      filter['rating.average'] = { $gte: Number(req.query.rating) };
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
    console.error('Error fetching products by store:', error);
    res.status(500).json({ message: 'Server error while fetching products by store' });
  }
});

// @route   POST /api/stores
// @desc    Create a new store
// @access  Private/Vendor
router.post('/', protect, async (req, res) => {
  try {
    // Check if user is a vendor
    if (req.user.role !== 'vendor') {
      return res.status(403).json({ message: 'Not authorized, vendor access only' });
    }
    
    // Check if user already has a store
    const existingStore = await Store.findOne({ owner: req.user._id });
    if (existingStore) {
      return res.status(400).json({ message: 'You already have a store' });
    }
    
    const {
      name,
      description,
      logo,
      banner,
      contactEmail,
      contactPhone,
      address,
      socialMedia,
      businessHours,
      categories,
      tags,
      slug
    } = req.body;
    
    // Validate required fields
    if (!name || !description || !contactEmail || !contactPhone || !slug) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if slug is unique
    const slugExists = await Store.findOne({ slug });
    if (slugExists) {
      return res.status(400).json({ message: 'Slug already exists' });
    }
    
    // Create new store
    const store = new Store({
      name,
      owner: req.user._id,
      description,
      logo: logo || {},
      banner: banner || {},
      contactEmail,
      contactPhone,
      address: address || {},
      socialMedia: socialMedia || {},
      businessHours: businessHours || [],
      categories: categories || [],
      tags: tags || [],
      slug
    });
    
    const createdStore = await store.save();
    
    // Update user with store reference
    await User.findByIdAndUpdate(req.user._id, { storeId: createdStore._id });
    
    res.status(201).json(createdStore);
  } catch (error) {
    console.error('Error creating store:', error);
    res.status(500).json({ message: 'Server error while creating store' });
  }
});

// @route   PUT /api/stores/:id
// @desc    Update a store
// @access  Private/Vendor
router.put('/:id', protect, async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Check if user is the store owner or an admin
    if (
      (store.owner.toString() !== req.user._id.toString()) && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to update this store' });
    }
    
    const {
      name,
      description,
      logo,
      banner,
      contactEmail,
      contactPhone,
      address,
      socialMedia,
      businessHours,
      categories,
      tags,
      slug,
      status
    } = req.body;
    
    // Check if slug is unique if changed
    if (slug && slug !== store.slug) {
      const slugExists = await Store.findOne({ slug, _id: { $ne: req.params.id } });
      if (slugExists) {
        return res.status(400).json({ message: 'Slug already exists' });
      }
    }
    
    // Update store fields
    if (name) store.name = name;
    if (description) store.description = description;
    if (logo) store.logo = logo;
    if (banner) store.banner = banner;
    if (contactEmail) store.contactEmail = contactEmail;
    if (contactPhone) store.contactPhone = contactPhone;
    if (address) store.address = address;
    if (socialMedia) store.socialMedia = socialMedia;
    if (businessHours) store.businessHours = businessHours;
    if (categories) store.categories = categories;
    if (tags) store.tags = tags;
    if (slug) store.slug = slug;
    if (status && req.user.role === 'admin') store.status = status;
    
    const updatedStore = await store.save();
    
    res.json(updatedStore);
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({ message: 'Server error while updating store' });
  }
});

// @route   POST /api/stores/:id/reviews
// @desc    Create a store review
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating) {
      return res.status(400).json({ message: 'Please provide a rating' });
    }
    
    const store = await Store.findById(req.params.id);
    
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }
    
    // Check if user is not reviewing their own store
    if (store.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot review your own store' });
    }
    
    // Check if user already reviewed this store
    const alreadyReviewed = store.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );
    
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this store' });
    }
    
    // Create new review
    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment: comment || ''
    };
    
    // Add review to store
    store.reviews.push(review);
    
    // Update store rating
    const totalRatings = store.reviews.reduce((acc, item) => acc + item.rating, 0);
    store.rating.average = totalRatings / store.reviews.length;
    store.rating.count = store.reviews.length;
    
    await store.save();
    
    res.status(201).json({ message: 'Review added' });
  } catch (error) {
    console.error('Error creating store review:', error);
    res.status(500).json({ message: 'Server error while creating store review' });
  }
});

module.exports = router;
