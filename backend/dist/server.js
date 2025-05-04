"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/iwanyu';
mongoose_1.default.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));
// Define User Schema
const userSchema = new mongoose_1.default.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'vendor', 'admin'], default: 'customer' },
}, {
    timestamps: true
});
// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    const salt = await bcrypt_1.default.genSalt(10);
    this.password = await bcrypt_1.default.hash(this.password, salt);
    next();
});
// Create User model
const User = mongoose_1.default.model('User', userSchema);
// Create auth router
const authRouter = express_1.default.Router();
// Register route
authRouter.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        console.log('Registration attempt:', { username, email, role });
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Registration failed: Email already exists');
            return res.status(400).json({ message: 'User already exists' });
        }
        // Create new user
        const user = new User({
            username,
            email,
            password, // Will be hashed by pre-save hook
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
// Login route
authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email });
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Login failed: User not found');
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Check password
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            console.log('Login failed: Invalid password');
            return res.status(401).json({ message: 'Invalid email or password' });
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
// Auth info route
authRouter.get('/', (req, res) => {
    res.json({ message: 'Auth endpoint' });
});
// Mount auth router
app.use('/api/auth', authRouter);
// Create products router
const productsRouter = express_1.default.Router();
// Products info route
productsRouter.get('/', (req, res) => {
    res.json({ message: 'Products endpoint' });
});
// Mount products router
app.use('/api/products', productsRouter);
// Create users router
const usersRouter = express_1.default.Router();
// Users info route
usersRouter.get('/', (req, res) => {
    res.json({ message: 'Users endpoint' });
});
// Mount users router
app.use('/api/users', usersRouter);
// Health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        port: process.env.PORT || 3001,
        environment: process.env.NODE_ENV || 'development'
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});
// Start server with proper port handling
const PORT = process.env.PORT || 3001;
const portNumber = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
const server = app.listen(portNumber, () => {
    console.log(`Server running on port ${portNumber}`);
    console.log(`API available at http://localhost:${portNumber}/api`);
    console.log(`Health check at http://localhost:${portNumber}/api/health`);
});
// Handle server shutdown gracefully
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose_1.default.connection.close().then(() => {
            console.log('MongoDB connection closed');
            process.exit(0);
        }).catch(err => {
            console.error('Error closing MongoDB connection:', err);
            process.exit(1);
        });
    });
});
exports.default = app;
