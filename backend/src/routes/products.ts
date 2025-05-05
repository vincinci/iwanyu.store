import express, { Request, Response, NextFunction } from 'express';
import { protect, vendorOnly, adminOnly } from '../utils/authMiddleware';
import { db } from '../config/neon';
import { products } from '../db/schema';
import { eq, like, desc, and, count as countRows, SQL } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from './auth';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with pagination and filters
// @access  Public
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;
    const offset = pageSize * (page - 1);
    
    // Build query conditions
    const conditions: SQL<unknown>[] = [];
    
    // Add keyword search if provided
    if (req.query.keyword) {
      conditions.push(like(products.name, `%${req.query.keyword as string}%`));
    }
    
    // Add category filter if provided
    if (req.query.category) {
      conditions.push(eq(products.category, req.query.category as string));
    }
    
    // Add vendor filter if provided
    if (req.query.vendor) {
      conditions.push(eq(products.vendorId, req.query.vendor as string));
    }
    
    // Get total count
    const countResult = await db
      .select({ value: countRows() })
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    
    const count = countResult[0]?.value || 0;
    
    // Get products
    const productsList = await db
      .select()
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(pageSize)
      .offset(offset)
      .orderBy(desc(products.createdAt));
    
    res.json({
      products: productsList,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;
    
    const productResults = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));
    
    if (productResults.length === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    
    res.json(productResults[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private/Vendor
router.post('/', protect, vendorOnly, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, images, category, stock } = req.body;
    
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    const productId = uuidv4();
    
    // Insert product
    await db.insert(products).values({
      id: productId,
      name,
      description,
      price,
      images: Array.isArray(images) ? JSON.stringify(images) : JSON.stringify([]),
      category,
      stock: stock || 0,
      vendorId: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Get the created product
    const createdProductResults = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));
    
    if (createdProductResults.length === 0) {
      res.status(500).json({ message: 'Error creating product' });
      return;
    }
    
    res.status(201).json(createdProductResults[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Vendor
router.put('/:id', protect, vendorOnly, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, description, price, images, category, stock } = req.body;
    const productId = req.params.id;
    
    // Get the product
    const productResults = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));
    
    if (productResults.length === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    
    const product = productResults[0];
    
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    // Check if the user is the vendor who created the product
    if (product.vendorId !== req.user._id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to update this product' });
      return;
    }
    
    // Update product
    await db.update(products)
      .set({
        name: name || product.name,
        description: description || product.description,
        price: price !== undefined ? price : product.price,
        images: images ? JSON.stringify(images) : product.images,
        category: category || product.category,
        stock: stock !== undefined ? stock : product.stock,
        updatedAt: new Date()
      })
      .where(eq(products.id, productId));
    
    // Get updated product
    const updatedProductResults = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));
    
    res.json(updatedProductResults[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Vendor or Admin
router.delete('/:id', protect, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id;
    
    // Get the product
    const productResults = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));
    
    if (productResults.length === 0) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    
    const product = productResults[0];
    
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    // Check if the user is the vendor who created the product or an admin
    if (product.vendorId !== req.user._id && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to delete this product' });
      return;
    }
    
    // Delete product
    await db.delete(products).where(eq(products.id, productId));
    
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
