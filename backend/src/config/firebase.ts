import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Check if Firebase Admin has already been initialized
if (!admin.apps.length) {
  try {
    // Define possible paths for the service account file
    const secretFilePath = '/etc/secrets/firebase-service-account.json';
    
    // Check if service account file exists in Render secrets
    if (fs.existsSync(secretFilePath)) {
      console.log('Found Firebase service account in secret file');
      
      // Read and parse the service account file
      const serviceAccountJson = fs.readFileSync(secretFilePath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountJson);
      
      // Initialize Firebase Admin with service account
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || "https://iwanyu-default-rtdb.firebaseio.com",
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "iwanyu.appspot.com"
      });
      
      console.log('Initialized Firebase with service account from secret file');
    } 
    // Fall back to environment variables
    else if (process.env.FIREBASE_PROJECT_ID) {
      console.log('Using Firebase project ID from environment variables');
      
      // Initialize with project ID from environment variables
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        databaseURL: process.env.FIREBASE_DATABASE_URL || "https://iwanyu-default-rtdb.firebaseio.com",
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "iwanyu.appspot.com"
      });
      
      console.log('Initialized Firebase with application default credentials');
    } 
    // Last resort - use hardcoded values
    else {
      console.log('No Firebase configuration found, using default values');
      
      admin.initializeApp({
        projectId: "iwanyu",
        databaseURL: "https://iwanyu-default-rtdb.firebaseio.com",
        storageBucket: "iwanyu.appspot.com"
      });
      
      console.log('Initialized Firebase with hardcoded default values');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    
    // Last resort fallback - try to initialize with minimal config
    if (!admin.apps.length) {
      console.warn('Attempting minimal fallback initialization');
      
      admin.initializeApp({
        projectId: "iwanyu",
        databaseURL: "https://iwanyu-default-rtdb.firebaseio.com",
        storageBucket: "iwanyu.appspot.com"
      });
      
      console.warn('Initialized Firebase with minimal fallback configuration');
    }
  }
}

// Export Firebase Admin services
const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();
const rtdb = admin.database();

export { admin, db, auth, storage, rtdb };
