import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Import database connection
import './config/neon';

// Import routes
import authRoutes from './routes/auth';
import vendorRoutes from './routes/vendor';
import orderRoutes from './routes/orders';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://iwanyu.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Iwanyu API is running' });
});

// Health check route
app.get('/api/healthcheck', function(req: Request, res: Response) {
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

export default app;
