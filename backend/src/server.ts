import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Import routes
import authRoutes from './routes/auth';
import vendorRoutes from './routes/vendor';
import orderRoutes from './routes/orders';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
if (serviceAccount) {
  initializeApp({
    credential: cert(JSON.parse(serviceAccount))
  });
} else {
  // For local development without service account JSON
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'iwanyu'
  });
}

// Create Express app
const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:3002',
  'https://iwanyu.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
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
    port: process.env.PORT || 3001,
    environment: process.env.NODE_ENV || 'development',
    firebase: process.env.FIREBASE_PROJECT_ID || 'not configured'
  });
});

// Start server with proper port handling
const PORT = process.env.PORT || 3001;
const portNumber = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;

const server = app.listen(portNumber, () => {
  console.log(`Server running on port ${portNumber}`);
  console.log(`API available at http://localhost:${portNumber}/api`);
  console.log(`Health check at http://localhost:${portNumber}/api/healthcheck`);
  console.log(`Registration endpoint: http://localhost:${portNumber}/api/auth/register`);
  console.log(`Login endpoint: http://localhost:${portNumber}/api/auth/login`);
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
