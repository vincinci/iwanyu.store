import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Profile API route - using client Firebase SDK only (no Firebase Admin)
// Force new deployment
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
      // Get the current user from the token
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        return NextResponse.json(
          { message: 'User not authenticated' },
          { status: 401 }
        );
      }
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      if (!userDoc.exists()) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }
      
      const userData = userDoc.data();
      
      // Return the user data
      return NextResponse.json({
        _id: currentUser.uid,
        username: userData.username || currentUser.displayName || 'User',
        email: currentUser.email,
        role: userData.role || 'customer',
        vendorInfo: userData.vendorInfo || null
      });
    } catch (verifyError) {
      console.error('Authentication error:', verifyError);
      return NextResponse.json(
        { message: 'Authentication failed' },
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
