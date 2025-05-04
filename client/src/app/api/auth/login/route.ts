import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { email, password } = body;
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Please provide email and password' },
        { status: 400 }
      );
    }
    
    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let userData = null;
      
      if (userDoc.exists()) {
        userData = userDoc.data();
      } else {
        // If user document doesn't exist in Firestore, create basic user data
        userData = {
          username: user.displayName || email.split('@')[0],
          email: user.email,
          role: 'customer',
          createdAt: new Date().toISOString()
        };
      }
      
      // Get ID token for the user
      const token = await user.getIdToken();
      
      // Return the user data and token
      return NextResponse.json({
        _id: user.uid,
        username: userData.username || user.displayName || 'User',
        email: user.email,
        role: userData.role || 'customer',
        vendorInfo: userData.vendorInfo || null,
        token
      });
    } catch (firebaseError: any) {
      console.error('Firebase login error:', firebaseError);
      
      // Handle Firebase specific errors
      if (firebaseError.code === 'auth/user-not-found' || 
          firebaseError.code === 'auth/wrong-password' ||
          firebaseError.code === 'auth/invalid-credential') {
        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        );
      }
      
      if (firebaseError.code === 'auth/too-many-requests') {
        return NextResponse.json(
          { message: 'Too many failed login attempts. Please try again later.' },
          { status: 429 }
        );
      }
      
      throw firebaseError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { message: 'Server error during login' },
      { status: 500 }
    );
  }
}
