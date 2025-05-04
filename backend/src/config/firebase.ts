import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if Firebase Admin has already been initialized
if (!admin.apps.length) {
  try {
    // Initialize Firebase Admin with environment variables or service account
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // If service account is provided as an environment variable
      let serviceAccount;
      
      try {
        // Try to parse the service account JSON
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      } catch (parseError) {
        console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', parseError);
        console.error('Make sure the service account JSON is properly formatted and escaped');
        
        // Fallback to application default credentials
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || "iwanyu",
          databaseURL: process.env.FIREBASE_DATABASE_URL || "https://iwanyu-default-rtdb.firebaseio.com"
        });
        
        console.log('Initialized Firebase with application default credentials');
        throw new Error('Failed to parse service account JSON. Using default credentials instead.');
      }
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || "https://iwanyu-default-rtdb.firebaseio.com"
      });
      
      console.log('Initialized Firebase with service account credentials');
    } else {
      // For local development or if using application default credentials
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "iwanyu",
        databaseURL: process.env.FIREBASE_DATABASE_URL || "https://iwanyu-default-rtdb.firebaseio.com"
      });
      
      console.log('Initialized Firebase with application default credentials');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

// Export Firebase Admin services
const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();
const rtdb = admin.database();

export { admin, db, auth, storage, rtdb };
