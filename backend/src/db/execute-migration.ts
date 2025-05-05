import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get database URL from environment variables
const DATABASE_URL = process.env.DATABASE_URL || '';

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Main function to execute migration SQL
async function executeMigration() {
  console.log('Executing migration SQL...');
  
  try {
    // Create Neon SQL client
    const sql = neon(DATABASE_URL);
    
    // Read migration SQL file
    const migrationPath = join(__dirname, '../../drizzle/1746404109120_initial_migration.sql');
    const migrationSql = readFileSync(migrationPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = migrationSql.split(';');
    
    // Execute each statement separately
    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        console.log(`Executing: ${trimmedStatement.substring(0, 60)}...`);
        await sql(trimmedStatement + ';');
      }
    }
    
    console.log('Migration executed successfully');
  } catch (error) {
    console.error('Migration execution failed:', error);
    process.exit(1);
  }
}

// Run the migration
executeMigration();
