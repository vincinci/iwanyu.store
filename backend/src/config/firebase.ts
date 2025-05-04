import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if Firebase Admin has already been initialized
if (!admin.apps.length) {
  // Initialize Firebase Admin with environment variables or service account
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // If service account is provided as an environment variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || "https://iwanyu-default-rtdb.firebaseio.com"
    });
  } else {
    // For local development or if using application default credentials
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "iwanyu",
      databaseURL: process.env.FIREBASE_DATABASE_URL || "https://iwanyu-default-rtdb.firebaseio.com"
    });
  }
}

// Export Firebase Admin services
const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();
const rtdb = admin.database();

export { admin, db, auth, storage, rtdb };
