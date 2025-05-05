import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get database URL from environment variables
const DATABASE_URL = process.env.DATABASE_URL || '';

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Main migration function
async function main() {
  console.log('Starting database migration...');
  
  try {
    // Create Neon SQL client
    const sql = neon(DATABASE_URL);
    
    // Create Drizzle instance
    const db = drizzle(sql);
    
    // Run migrations
    await migrate(db, { migrationsFolder: 'drizzle' });
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
main();
