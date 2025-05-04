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
    const response = await fetch('http://localhost:3001/api/vendor/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
    });
    
    // Try to parse the response as JSON
    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error('Error parsing vendor dashboard response:', error);
      // If we can't parse the response as JSON, get the raw response
      const text = await response.text();
      console.error('Raw response:', text);
      return NextResponse.json(
        { message: 'Invalid response format from server' },
        { status: 500 }
      );
    }
    
    // If the response is not ok, return the error
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch vendor dashboard data' },
        { status: response.status }
      );
    }
    
    // Return the vendor dashboard data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Vendor dashboard API error:', error);
    return NextResponse.json(
      { message: 'Server error while fetching vendor dashboard data' },
      { status: 500 }
    );
  }
}
