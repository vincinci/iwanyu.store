"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../utils/authMiddleware");
const neon_1 = require("../config/neon");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
const router = express_1.default.Router();
// @route   GET /api/products
// @desc    Get all products with pagination and filters
// @access  Public
router.get('/', async (req, res, next) => {
    try {
        const pageSize = Number(req.query.pageSize) || 10;
        const page = Number(req.query.page) || 1;
        const offset = pageSize * (page - 1);
        // Build query conditions
        const conditions = [];
        // Add keyword search if provided
        if (req.query.keyword) {
            conditions.push((0, drizzle_orm_1.like)(schema_1.products.name, `%${req.query.keyword}%`));
        }
        // Add category filter if provided
        if (req.query.category) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.products.category, req.query.category));
        }
        // Add vendor filter if provided
        if (req.query.vendor) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.products.vendorId, req.query.vendor));
        }
        // Get total count
        const countResult = await neon_1.db
            .select({ value: (0, drizzle_orm_1.count)() })
            .from(schema_1.products)
            .where(conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined);
        const count = countResult[0]?.value || 0;
        // Get products
        const productsList = await neon_1.db
            .select()
            .from(schema_1.products)
            .where(conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined)
            .limit(pageSize)
            .offset(offset)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.products.createdAt));
        res.json({
            products: productsList,
            page,
            pages: Math.ceil(count / pageSize),
            total: count,
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res, next) => {
    try {
        const productId = req.params.id;
        const productResults = await neon_1.db
            .select()
            .from(schema_1.products)
            .where((0, drizzle_orm_1.eq)(schema_1.products.id, productId));
        if (productResults.length === 0) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.json(productResults[0]);
    }
    catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// @route   POST /api/products
// @desc    Create a product
// @access  Private/Vendor
router.post('/', authMiddleware_1.protect, authMiddleware_1.vendorOnly, async (req, res, next) => {
    try {
        const { name, description, price, images, category, stock } = req.body;
        if (!req.user) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }
        const productId = (0, uuid_1.v4)();
        // Insert product
        await neon_1.db.insert(schema_1.products).values({
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
        const createdProductResults = await neon_1.db
            .select()
            .from(schema_1.products)
            .where((0, drizzle_orm_1.eq)(schema_1.products.id, productId));
        if (createdProductResults.length === 0) {
            res.status(500).json({ message: 'Error creating product' });
            return;
        }
        res.status(201).json(createdProductResults[0]);
    }
    catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Vendor
router.put('/:id', authMiddleware_1.protect, authMiddleware_1.vendorOnly, async (req, res, next) => {
    try {
        const { name, description, price, images, category, stock } = req.body;
        const productId = req.params.id;
        // Get the product
        const productResults = await neon_1.db
            .select()
            .from(schema_1.products)
            .where((0, drizzle_orm_1.eq)(schema_1.products.id, productId));
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
        await neon_1.db.update(schema_1.products)
            .set({
            name: name || product.name,
            description: description || product.description,
            price: price !== undefined ? price : product.price,
            images: images ? JSON.stringify(images) : product.images,
            category: category || product.category,
            stock: stock !== undefined ? stock : product.stock,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.products.id, productId));
        // Get updated product
        const updatedProductResults = await neon_1.db
            .select()
            .from(schema_1.products)
            .where((0, drizzle_orm_1.eq)(schema_1.products.id, productId));
        res.json(updatedProductResults[0]);
    }
    catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Vendor or Admin
router.delete('/:id', authMiddleware_1.protect, async (req, res, next) => {
    try {
        const productId = req.params.id;
        // Get the product
        const productResults = await neon_1.db
            .select()
            .from(schema_1.products)
            .where((0, drizzle_orm_1.eq)(schema_1.products.id, productId));
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
        await neon_1.db.delete(schema_1.products).where((0, drizzle_orm_1.eq)(schema_1.products.id, productId));
        res.json({ message: 'Product removed' });
    }
    catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
