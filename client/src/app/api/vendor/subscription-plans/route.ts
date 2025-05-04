import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Forward the request to the backend server
    const response = await fetch('http://localhost:3001/api/vendor/subscription-plans', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Try to parse the response as JSON
    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error('Error parsing subscription plans response:', error);
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
        { message: data.message || 'Failed to fetch subscription plans' },
        { status: response.status }
      );
    }
    
    // Return the subscription plans
    return NextResponse.json(data);
  } catch (error) {
    console.error('Subscription plans API error:', error);
    return NextResponse.json(
      { message: 'Server error while fetching subscription plans' },
      { status: 500 }
    );
  }
}
