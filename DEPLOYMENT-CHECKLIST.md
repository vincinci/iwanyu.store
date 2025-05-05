# Iwanyu E-commerce Platform Deployment Checklist

Use this checklist to ensure you've completed all necessary steps for deploying the Iwanyu E-commerce platform.

## Backend (Render) Checklist

- [ ] Code pushed to GitHub repository
- [ ] Render account created
- [ ] Web Service created on Render
- [ ] Root directory set to `backend`
- [ ] Build command set to `npm install && npm run build`
- [ ] Start command set to `npm start`
- [ ] Environment variables configured:
  - [ ] `NODE_ENV`: `production`
  - [ ] `PORT`: `10000`
  - [ ] `DATABASE_URL`: Neon PostgreSQL connection string
  - [ ] `JWT_SECRET`: Secure random string
  - [ ] `FRONTEND_URL`: Vercel frontend URL
  - [ ] `FLUTTERWAVE_PUBLIC_KEY`: Flutterwave public key
  - [ ] `FLUTTERWAVE_SECRET_KEY`: Flutterwave secret key
  - [ ] `FLUTTERWAVE_ENCRYPTION_KEY`: Flutterwave encryption key
- [ ] Health check path set to `/api/health`
- [ ] Auto-deploy enabled
- [ ] Initial deployment completed
- [ ] Database migrations executed
- [ ] Database seeded with initial data

## Frontend (Vercel) Checklist

- [ ] Code pushed to GitHub repository
- [ ] Vercel account created
- [ ] Project created on Vercel
- [ ] Root directory set to `client`
- [ ] Framework preset set to Next.js
- [ ] Environment variables configured:
  - [ ] `NEXT_PUBLIC_API_URL`: Render backend API URL (e.g., `https://iwanyu-api.onrender.com/api`)
- [ ] Initial deployment completed
- [ ] Frontend application tested

## Frontend Environment Variables

Create a `.env.local` file in the `client` directory with the following variables:

```
NEXT_PUBLIC_API_URL=https://iwanyu-api.onrender.com/api
```

For production, set these environment variables in the Vercel dashboard.

## Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://iwanyu.store_owner:npg_fq9herpA6QNG@ep-damp-frog-a8ee6sx1-pooler.eastus2.azure.neon.tech/iwanyu.store?sslmode=require
JWT_SECRET=your_jwt_secret_key

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3002

# Flutterwave API Keys
FLUTTERWAVE_PUBLIC_KEY=your_flutterwave_public_key
FLUTTERWAVE_SECRET_KEY=your_flutterwave_secret_key
FLUTTERWAVE_ENCRYPTION_KEY=your_flutterwave_encryption_key
```

For production, set these environment variables in the Render dashboard.

## Post-Deployment Testing Checklist

- [ ] User registration works
- [ ] User login works
- [ ] User profile can be viewed
- [ ] Products can be browsed
- [ ] Products can be added to cart
- [ ] Orders can be placed
- [ ] Payments can be processed
- [ ] Vendor application works
- [ ] Vendor dashboard works
- [ ] Admin functions work (if applicable)

## Security Checklist

- [ ] JWT secret is a strong, random string
- [ ] Database credentials are secure
- [ ] API keys are secure
- [ ] CORS is properly configured
- [ ] HTTP security headers are set
- [ ] Rate limiting is implemented
- [ ] Input validation is implemented

## Performance Checklist

- [ ] Frontend assets are optimized
- [ ] API responses are fast
- [ ] Database queries are optimized
- [ ] Caching is implemented where appropriate
- [ ] Images are optimized
- [ ] Lazy loading is implemented where appropriate
