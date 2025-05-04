import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { username, email, password, role = 'customer' } = body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Please provide all required fields' },
        { status: 400 }
      );
    }
    
    try {
      // Create user directly with Firebase client SDK
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username,
        email,
        role: role || 'customer',
        createdAt: new Date().toISOString(),
        vendorInfo: null
      });
      
      // Get ID token for the user
      const token = await user.getIdToken();
      
      // Return the user data and token
      return NextResponse.json({
        _id: user.uid,
        username,
        email,
        role: role || 'customer',
        token
      });
    } catch (firebaseError: any) {
      console.error('Firebase registration error:', firebaseError);
      
      // Handle Firebase specific errors
      if (firebaseError.code === 'auth/email-already-in-use') {
        return NextResponse.json(
          { message: 'Email is already in use' },
          { status: 400 }
        );
      }
      
      if (firebaseError.code === 'auth/invalid-email') {
        return NextResponse.json(
          { message: 'Invalid email format' },
          { status: 400 }
        );
      }
      
      if (firebaseError.code === 'auth/weak-password') {
        return NextResponse.json(
          { message: 'Password is too weak' },
          { status: 400 }
        );
      }
      
      throw firebaseError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { message: 'Server error during registration' },
      { status: 500 }
    );
  }
}
