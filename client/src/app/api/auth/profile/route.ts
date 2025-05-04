import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/config/firebase';
import { getAuth, getIdToken } from 'firebase/auth';

// Client-side only implementation - NO Firebase Admin
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
    
    // For client-side API routes, we can't verify tokens directly
    // Instead, we'll return the current user info if available
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return NextResponse.json(
        { message: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    // Return basic user information
    return NextResponse.json({
      _id: currentUser.uid,
      username: currentUser.displayName || 'User',
      email: currentUser.email,
      role: 'customer', // Default role
      photoURL: currentUser.photoURL
    });
    
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { message: 'Server error while getting profile' },
      { status: 500 }
    );
  }
}
