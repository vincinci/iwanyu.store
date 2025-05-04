import { NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth } from 'firebase-admin';
import { db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  
  if (serviceAccount) {
    initializeApp({
      credential: cert(JSON.parse(serviceAccount))
    });
  } else {
    // For local development
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'iwanyu'
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Not authorized, no token' },
        { status: 401 }
      );
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    try {
      // Verify the token with Firebase Admin
      const decodedToken = await adminAuth().verifyIdToken(token);
      const uid = decodedToken.uid;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (!userDoc.exists()) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }
      
      const userData = userDoc.data();
      
      // Return the user data
      return NextResponse.json({
        _id: uid,
        username: userData.username || 'User',
        email: userData.email,
        role: userData.role || 'customer',
        vendorInfo: userData.vendorInfo || null
      });
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { message: 'Server error while getting profile' },
      { status: 500 }
    );
  }
}
