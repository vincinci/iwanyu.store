"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.vendorOnly = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Middleware to protect routes
const protect = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({ message: 'Not authorized, no token' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'iwanyu_secret_jwt_token_2025');
        // Since we're not actually connecting to the database in this simplified version,
        // we'll create a mock user for demonstration purposes
        const mockUser = {
            _id: decoded.id,
            username: 'testuser',
            email: 'test@example.com',
            role: 'customer'
        };
        // Set the user property on the request object
        req.user = {
            _id: mockUser._id,
            username: mockUser.username,
            email: mockUser.email,
            role: mockUser.role
        };
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
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
