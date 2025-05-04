"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const router = express_1.default.Router();
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        console.log('Registration attempt:', { username, email, role });
        // Check if user already exists
        const existingUser = await user_1.default.findOne({ email });
        if (existingUser) {
            console.log('Registration failed: Email already exists');
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        // Create new user
        const user = new user_1.default({
            username,
            email,
            password, // Will be hashed by pre-save hook in the model
            role: role || 'customer'
        });
        const savedUser = await user.save();
        console.log('User registered successfully:', savedUser._id);
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: savedUser._id }, process.env.JWT_SECRET || 'iwanyu_secret_jwt_token_2025', { expiresIn: '30d' });
        res.status(201).json({
            _id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email,
            role: savedUser.role,
            token
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});
// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email });
        // Find user by email
        const user = await user_1.default.findOne({ email });
        if (!user) {
            console.log('Login failed: User not found');
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Login failed: Invalid password');
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        console.log('User logged in successfully:', user._id);
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET || 'iwanyu_secret_jwt_token_2025', { expiresIn: '30d' });
        res.json({
            _id: user._id,
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
exports.default = router;
