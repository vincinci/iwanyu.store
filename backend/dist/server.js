"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
// Import database connection
require("./config/neon");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const vendor_1 = __importDefault(require("./routes/vendor"));
const orders_1 = __importDefault(require("./routes/orders"));
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
// CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://iwanyu.vercel.app'
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Mount routes
app.use('/api/auth', auth_1.default);
app.use('/api/vendor', vendor_1.default);
app.use('/api/orders', orders_1.default);
// Health check endpoint for Render
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Iwanyu API is running' });
});
// Health check route
app.get('/api/healthcheck', function (req, res) {
    res.json({
        status: 'ok',
        message: 'Server is running',
        environment: process.env.NODE_ENV || 'production',
        database: 'neon-postgresql'
    });
});
// Start server with proper port handling
const PORT = process.env.PORT || 3001;
const portNumber = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
const server = app.listen(portNumber, () => {
    console.log(`Server running on port ${portNumber}`);
    console.log(`Health check available at /api/healthcheck`);
});
// Handle server shutdown gracefully
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
exports.default = app;
