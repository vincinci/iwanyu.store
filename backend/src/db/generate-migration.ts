import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { sql } from 'drizzle-orm';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get database URL from environment variables
const DATABASE_URL = process.env.DATABASE_URL || '';

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  console.log('Please set up your .env file with the DATABASE_URL variable.');
  console.log('See setup-env-instructions.md for more details.');
  process.exit(1);
}

// Create migrations directory if it doesn't exist
const migrationsDir = join(__dirname, '../../drizzle');
if (!existsSync(migrationsDir)) {
  mkdirSync(migrationsDir, { recursive: true });
}

// Main function to generate migration SQL
async function generateMigration() {
  console.log('Generating migration SQL...');
  
  try {
    // Create Neon SQL client
    const sql = neon(DATABASE_URL);
    
    // Create Drizzle instance
    const db = drizzle(sql);
    
    // Generate migration SQL
    const migrationSql = `
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  phone_number TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  vendor_info JSONB
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  images JSONB,
  category TEXT NOT NULL,
  vendor_id UUID REFERENCES users(id),
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  shipping_address JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  items_price INTEGER NOT NULL,
  shipping_price INTEGER NOT NULL,
  tax_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMP,
  is_delivered BOOLEAN NOT NULL DEFAULT false,
  delivered_at TIMESTAMP,
  transaction_reference TEXT,
  payment_result JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  product_id UUID NOT NULL REFERENCES products(id),
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  image TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  features JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

    // Write migration SQL to file
    const timestamp = new Date().getTime();
    const migrationFile = join(migrationsDir, `${timestamp}_initial_migration.sql`);
    writeFileSync(migrationFile, migrationSql);
    
    console.log(`Migration SQL generated successfully: ${migrationFile}`);
  } catch (error) {
    console.error('Migration generation failed:', error);
    process.exit(1);
  }
}

// Run the migration generation
generateMigration();
