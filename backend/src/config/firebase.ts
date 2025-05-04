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
    const localFilePath = path.join(process.cwd(), 'firebase-service-account.json');
    
    // Check if service account file exists in Render secrets
    if (fs.existsSync(secretFilePath)) {
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
    // Check if service account file exists locally (for development)
    else if (fs.existsSync(localFilePath)) {
      // Read and parse the local service account file
      const serviceAccountJson = fs.readFileSync(localFilePath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountJson);
      
      // Initialize Firebase Admin with service account
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || "https://iwanyu-default-rtdb.firebaseio.com",
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "iwanyu.appspot.com"
      });
      
      console.log('Initialized Firebase with service account from local file');
    }
    // Fall back to environment variable if available
    else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        // Try to parse the service account JSON from environment variable
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.FIREBASE_DATABASE_URL || "https://iwanyu-default-rtdb.firebaseio.com",
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "iwanyu.appspot.com"
        });
        
        console.log('Initialized Firebase with service account from environment variable');
      } catch (parseError) {
        console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', parseError);
        throw new Error('Failed to parse service account JSON from environment variable');
      }
    } 
    // Fall back to application default credentials
    else {
      // For local development or if using application default credentials
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "iwanyu",
        databaseURL: process.env.FIREBASE_DATABASE_URL || "https://iwanyu-default-rtdb.firebaseio.com",
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "iwanyu.appspot.com"
      });
      
      console.log('Initialized Firebase with application default credentials');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    
    // Last resort fallback - try to initialize with minimal config
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "iwanyu"
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
