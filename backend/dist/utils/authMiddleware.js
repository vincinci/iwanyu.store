"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.vendorOnly = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const neon_1 = require("../config/neon");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
// JWT Secret Key - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'iwanyu-secret-key';
// Middleware to protect routes
const protect = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({ message: 'Not authorized, no token' });
            return;
        }
        try {
            // Verify the JWT token
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // Store the token for potential use in other middleware
            req.token = token;
            // Get user data from database
            const userResults = await neon_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, decoded._id));
            if (userResults.length === 0) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            const user = userResults[0];
            // Set the user property on the request object
            req.user = {
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            };
            next();
        }
        catch (error) {
            console.error('Token verification error:', error);
            res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.protect = protect;
// Middleware to check vendor role
const vendorOnly = (req, res, next) => {
    if (req.user && req.user.role === 'vendor') {
        next();
    }
    else {
        res.status(403).json({ message: 'Access denied, vendor only' });
    }
};
exports.vendorOnly = vendorOnly;
// Middleware to check admin role
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(403).json({ message: 'Access denied, admin only' });
    }
};
exports.adminOnly = adminOnly;
