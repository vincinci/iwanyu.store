// This is a stub file to maintain compatibility with existing imports
// The application has been migrated from Firebase to Neon PostgreSQL

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create stub objects for compatibility
const admin = {
  apps: [{}], // Pretend we're initialized
  firestore: () => ({ collection: () => ({}) }),
  auth: () => ({}),
  storage: () => ({}),
  database: () => ({})
};

const db = {};
const auth = {};
const storage = {};
const rtdb = {};

console.log('Firebase stub loaded - application now uses Neon PostgreSQL');

export { admin, db, auth, storage, rtdb };
