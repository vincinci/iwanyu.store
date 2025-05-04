import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/product';
import { protect, vendorOnly, adminOnly } from '../utils/authMiddleware';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with pagination and filters
// @access  Public
router.get('/', async (req: Request, res: Response) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};
    const category = req.query.category ? { category: req.query.category } : {};
    const vendor = req.query.vendor ? { vendor: req.query.vendor } : {};

    const count = await Product.countDocuments({ ...keyword, ...category, ...vendor });
    const products = await Product.find({ ...keyword, ...category, ...vendor })
      .populate('vendor', 'username')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor', 'username');

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private/Vendor
router.post('/', protect, vendorOnly, async (req: Request, res: Response) => {
  try {
    const { name, description, price, images, category, stock } = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const product = new Product({
      name,
      description,
      price,
      images,
      category,
      stock,
      vendor: new mongoose.Types.ObjectId(req.user._id),
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Vendor
router.put('/:id', protect, vendorOnly, async (req: Request, res: Response) => {
  try {
    const { name, description, price, images, category, stock } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Check if the user is the vendor who created the product
    if (product.vendor.toString() !== req.user._id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to update this product' });
      return;
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.images = images || product.images;
    product.category = category || product.category;
    product.stock = stock !== undefined ? stock : product.stock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Vendor or Admin
router.delete('/:id', protect, async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // Check if the user is the vendor who created the product or an admin
    if (product.vendor.toString() !== req.user._id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to delete this product' });
      return;
    }

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
