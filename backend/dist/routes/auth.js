"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const neon_1 = require("../config/neon");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const uuid_1 = require("uuid");
const router = express_1.default.Router();
// JWT Secret Key - should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'iwanyu-secret-key';
// Register a new user
router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;
        // Validate required fields
        if (!username || !email || !password) {
            res.status(400).json({ message: 'Please provide all required fields' });
            return;
        }
        // Check if email already exists
        const existingUser = await neon_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
        if (existingUser.length > 0) {
            res.status(400).json({ message: 'Email is already in use' });
            return;
        }
        // Hash the password
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        // Generate a UUID for the user
        const userId = (0, uuid_1.v4)();
        // Create user in the database
        await neon_1.db.insert(schema_1.users).values({
            id: userId,
            username,
            email,
            password: hashedPassword,
            role: role || 'customer',
            createdAt: new Date(),
            updatedAt: new Date(),
            vendorInfo: null
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            _id: userId,
            username,
            email,
            role: role || 'customer'
        }, JWT_SECRET, { expiresIn: '7d' });
        console.log('User registered successfully:', userId);
        res.status(201).json({
            _id: userId,
            username,
            email,
            role: role || 'customer',
            token
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});
// Login user
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Validate required fields
        if (!email || !password) {
            res.status(400).json({ message: 'Please provide email and password' });
            return;
        }
        // Find user by email
        const userResults = await neon_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
        if (userResults.length === 0) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        const user = userResults[0];
        // Verify password
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }, JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});
// Get current user profile
router.get('/profile', async (req, res, next) => {
    try {
        // Get token from request header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Not authorized, no token' });
            return;
        }
        try {
            // Verify the JWT token
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // Get user data from database
            const userResults = await neon_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, decoded._id));
            if (userResults.length === 0) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            const user = userResults[0];
            res.status(200).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                vendorInfo: user.vendorInfo || null
            });
        }
        catch (verifyError) {
            console.error('Token verification error:', verifyError);
            res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    }
    catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Authentication middleware
const protect = async (req, res, next) => {
    try {
        // Get token from request header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Not authorized, no token' });
            return;
        }
        try {
            // Verify the JWT token
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // Set user in request
            req.user = decoded;
            next();
        }
        catch (verifyError) {
            console.error('Token verification error:', verifyError);
            res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.protect = protect;
exports.default = router;
