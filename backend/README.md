# Iwanyu E-commerce Backend API

This is the backend API for the Iwanyu E-commerce platform.

## Database Migration: Firebase to Neon PostgreSQL

The application has been migrated from Firebase to Neon PostgreSQL for improved performance, scalability, and SQL capabilities.

### Migration Steps

1. **Set up Neon PostgreSQL**
   - Create an account at [Neon](https://neon.tech)
   - Create a new project
   - Get your database connection string from the dashboard

2. **Update Environment Variables**
   - Update your `.env` file with the following variables:
     ```
     DATABASE_URL=postgres://username:password@host:port/database
     JWT_SECRET=your_jwt_secret_key
     ```

3. **Run Database Migrations**
   - Generate migration files: `npx tsx src/db/generate-migration.ts`
   - Apply migrations: `npx tsx src/db/migrate.ts`
   - Seed the database: `npx tsx src/db/seed.ts`

4. **Start the Server**
   - Run: `npm run dev`

## Deployment to Render

### Prerequisites

- A [Render](https://render.com) account
- A Neon PostgreSQL database
- Flutterwave account for payment processing

### Deployment Steps

1. **Push your code to GitHub**

   Make sure your code is in a GitHub repository.

2. **Create a new Web Service on Render**

   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New" and select "Web Service"
   - Connect your GitHub repository
   - Select the repository and branch

3. **Configure the Web Service**

   - **Name**: `iwanyu-api` (or your preferred name)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Select an appropriate plan (Free tier is available for testing)

4. **Set Environment Variables**

   Add the following environment variables:

   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render will automatically set the correct port)
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `JWT_SECRET`: Your JWT secret key
   - `FRONTEND_URL`: URL of your frontend application
   - `FLUTTERWAVE_PUBLIC_KEY`: Your Flutterwave public key
   - `FLUTTERWAVE_SECRET_KEY`: Your Flutterwave secret key
   - `FLUTTERWAVE_ENCRYPTION_KEY`: Your Flutterwave encryption key

5. **Deploy**

   Click "Create Web Service" and wait for the deployment to complete.

6. **Update Frontend Configuration**

   Update your frontend application to use the new API URL:
   
   ```typescript
   // In your frontend API configuration
   const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-render-service-url.onrender.com/api';
   ```

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Run the database migrations: 
   ```
   npx tsx src/db/migrate.ts
   npx tsx src/db/seed.ts
   ```
5. Run the development server: `npm run dev`

## API Endpoints

- **Auth**: `/api/auth`
  - Register: `POST /api/auth/register`
  - Login: `POST /api/auth/login`
  - Profile: `GET /api/auth/profile`

- **Vendor**: `/api/vendor`
  - Subscription Plans: `GET /api/vendor/subscription-plans`
  - Apply: `POST /api/vendor/apply`
  - Process Payment: `POST /api/vendor/process-payment`
  - Dashboard: `GET /api/vendor/dashboard`

- **Orders**: `/api/orders`
  - Create Order: `POST /api/orders`
  - Get Orders: `GET /api/orders`
  - Get Order by ID: `GET /api/orders/:id`
  - Update Order Payment: `PUT /api/orders/:id/pay`

- **Health Check**: `/api/health`

## Database Schema

The application uses Drizzle ORM with the following tables:

- **users**: User accounts and authentication
- **products**: Product catalog
- **orders**: Customer orders
- **order_items**: Individual items within orders
- **subscription_plans**: Vendor subscription plans
