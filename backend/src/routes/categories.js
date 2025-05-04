const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const Product = require('../models/product');
const { protect } = require('../utils/authMiddleware');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Get only root categories (no parent)
    const rootOnly = req.query.root === 'true';
    const featured = req.query.featured === 'true';
    
    let filter = { status: 'active' };
    if (rootOnly) {
      filter.parent = null;
    }
    if (featured) {
      filter.featured = true;
    }
    
    const categories = await Category.find(filter)
      .sort({ order: 1, name: 1 })
      .populate({
        path: 'subcategories',
        match: { status: 'active' },
        options: { sort: { order: 1, name: 1 } }
      });
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
});

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate({
        path: 'subcategories',
        match: { status: 'active' },
        options: { sort: { order: 1, name: 1 } }
      });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Server error while fetching category' });
  }
});

// @route   GET /api/categories/slug/:slug
// @desc    Get category by slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug })
      .populate({
        path: 'subcategories',
        match: { status: 'active' },
        options: { sort: { order: 1, name: 1 } }
      });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error fetching category by slug:', error);
    res.status(500).json({ message: 'Server error while fetching category' });
  }
});

// @route   GET /api/categories/:id/products
// @desc    Get products by category
// @access  Public
router.get('/:id/products', async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    
    // Get all subcategory IDs
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Get subcategories recursively
    const getSubcategoryIds = async (categoryId) => {
      const subcategories = await Category.find({ parent: categoryId });
      let ids = [categoryId];
      
      for (const subcategory of subcategories) {
        const subIds = await getSubcategoryIds(subcategory._id);
        ids = [...ids, ...subIds];
      }
      
      return ids;
    };
    
    const categoryIds = await getSubcategoryIds(req.params.id);
    
    // Build filter object
    const filter = {
      category: { $in: categoryIds },
      status: 'published'
    };
    
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
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Server error while fetching products by category' });
  }
});

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private/Admin
router.post('/', protect, async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized, admin access only' });
    }
    
    const {
      name,
      description,
      slug,
      parent,
      image,
      featured,
      order
    } = req.body;
    
    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({ message: 'Please provide name and slug' });
    }
    
    // Check if slug is unique
    const slugExists = await Category.findOne({ slug });
    if (slugExists) {
      return res.status(400).json({ message: 'Slug already exists' });
    }
    
    // Check if parent category exists
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }
    
    // Create new category
    const category = new Category({
      name,
      description,
      slug,
      parent: parent || null,
      image: image || {},
      featured: featured || false,
      order: order || 0
    });
    
    const createdCategory = await category.save();
    
    res.status(201).json(createdCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server error while creating category' });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
// @access  Private/Admin
router.put('/:id', protect, async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized, admin access only' });
    }
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const {
      name,
      description,
      slug,
      parent,
      image,
      featured,
      order,
      status
    } = req.body;
    
    // Check if slug is unique if changed
    if (slug && slug !== category.slug) {
      const slugExists = await Category.findOne({ slug, _id: { $ne: req.params.id } });
      if (slugExists) {
        return res.status(400).json({ message: 'Slug already exists' });
      }
    }
    
    // Check if parent category exists
    if (parent) {
      // Prevent circular reference
      if (parent.toString() === req.params.id) {
        return res.status(400).json({ message: 'Category cannot be its own parent' });
      }
      
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }
    
    // Update category fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (slug) category.slug = slug;
    if (parent !== undefined) category.parent = parent || null;
    if (image) category.image = image;
    if (featured !== undefined) category.featured = featured;
    if (order !== undefined) category.order = order;
    if (status) category.status = status;
    
    const updatedCategory = await category.save();
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error while updating category' });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    // Check if user is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized, admin access only' });
    }
    
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category has subcategories
    const subcategories = await Category.find({ parent: req.params.id });
    if (subcategories.length > 0) {
      return res.status(400).json({ message: 'Cannot delete category with subcategories' });
    }
    
    // Check if category has products
    const products = await Product.find({ category: req.params.id });
    if (products.length > 0) {
      return res.status(400).json({ message: 'Cannot delete category with products' });
    }
    
    await category.deleteOne();
    
    res.json({ message: 'Category removed' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error while deleting category' });
  }
});

module.exports = router;
