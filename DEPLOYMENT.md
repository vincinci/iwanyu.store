# Iwanyu E-commerce Platform Deployment Guide

This guide provides instructions for deploying the Iwanyu E-commerce platform to Vercel (frontend) and Render (backend).

## Prerequisites

- A [Vercel](https://vercel.com) account for frontend deployment
- A [Render](https://render.com) account for backend deployment
- A [Neon PostgreSQL](https://neon.tech) database
- A [Flutterwave](https://flutterwave.com) account for payment processing

## Backend Deployment (Render)

1. **Push your code to GitHub**

   Make sure your code is in a GitHub repository.

2. **Prepare for Deployment**

   Before deploying, ensure that all MongoDB and Firebase stubs are in place:
   
   ```bash
   # Run the prepare-deploy.sh script to set up stubs
   chmod +x backend/prepare-deploy.sh
   ./backend/prepare-deploy.sh
   ```

3. **Create a new Web Service on Render**

   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" and select "Web Service"
   - Connect your GitHub repository
   - Select the repository and branch

4. **Configure the Web Service**

   - **Name**: `iwanyu-api` (or your preferred name)
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Select an appropriate plan (Free tier is available for testing)

5. **Set Environment Variables**

   Add the following environment variables in the Render dashboard:

   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render will automatically set the correct port)
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `JWT_SECRET`: Your JWT secret key
   - `FRONTEND_URL`: URL of your frontend application (Vercel URL)
   - `FLUTTERWAVE_PUBLIC_KEY`: Your Flutterwave public key
   - `FLUTTERWAVE_SECRET_KEY`: Your Flutterwave secret key
   - `FLUTTERWAVE_ENCRYPTION_KEY`: Your Flutterwave encryption key

6. **Deploy**

   Click "Create Web Service" and wait for the deployment to complete.

## Frontend Deployment (Vercel)

1. **Push your code to GitHub**

   Make sure your code is in a GitHub repository.

2. **Create a new Project on Vercel**

   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" and select "Project"
   - Connect your GitHub repository
   - Select the repository and branch

3. **Configure the Project**

   - **Framework Preset**: Next.js
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. **Set Environment Variables**

   Add the following environment variables in the Vercel dashboard:

   - `NEXT_PUBLIC_API_URL`: The URL of your Render backend API (e.g., `https://iwanyu-api.onrender.com/api`)

5. **Deploy**

   Click "Deploy" and wait for the deployment to complete.

## Troubleshooting Common Deployment Issues

### Backend Issues

1. **Build Errors with MongoDB/Firebase Dependencies**

   If you encounter build errors related to MongoDB or Firebase dependencies:
   
   - Make sure the stub files are in place in the `src/models` and `src/config` directories
   - Ensure `firebase-admin` and `mongoose` are added as dev dependencies in package.json
   - Check that all references to MongoDB models are properly stubbed

2. **Database Connection Issues**

   - Verify your Neon PostgreSQL connection string is correct
   - Check that the database user has the proper permissions
   - Ensure the database schema has been properly migrated

3. **Environment Variables**

   - Double-check all required environment variables are set in the Render dashboard
   - Make sure there are no typos in the environment variable names

### Frontend Issues

1. **API Connection**

   - Ensure the `NEXT_PUBLIC_API_URL` is set correctly and includes the `/api` path
   - Check that CORS is properly configured on the backend to allow requests from the frontend

2. **Build Errors**

   - Check the Vercel build logs for any compilation issues
   - Make sure all dependencies are properly installed

## Post-Deployment Steps

1. **Update CORS Configuration**

   Make sure the backend CORS configuration allows requests from your Vercel frontend domain.

2. **Test the Application**

   - Test user registration and login
   - Test product browsing and ordering
   - Test vendor application and dashboard
   - Test payment processing

3. **Set Up Custom Domain (Optional)**

   - Configure custom domains for both your Vercel frontend and Render backend
   - Update environment variables to use the custom domains

## Maintenance

- **Database Backups**: Set up regular backups of your Neon PostgreSQL database
- **Monitoring**: Use Render and Vercel dashboards to monitor application performance
- **Updates**: Regularly update dependencies to maintain security and performance
