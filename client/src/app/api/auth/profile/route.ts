import { NextRequest, NextResponse } from 'next/server';

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
    
    // Forward the request to the backend server
    const response = await fetch('http://localhost:3001/api/auth/profile', {
      headers: {
        'Authorization': authHeader,
      },
    });
    
    // Get the response data
    const data = await response.json();
    
    // If the response is not ok, return the error
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch profile' },
        { status: response.status }
      );
    }
    
    // Return the profile data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { message: 'Server error while getting profile' },
      { status: 500 }
    );
  }
}
