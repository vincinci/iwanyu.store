import { NextRequest, NextResponse } from 'next/server';

/**
 * Handle payment callback from Flutterwave
 * This route will receive the callback from Flutterwave and redirect to the appropriate page
 */
export async function GET(request: NextRequest) {
  try {
    // Get the query parameters from the URL
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const tx_ref = searchParams.get('tx_ref');
    const transaction_id = searchParams.get('transaction_id');
    
    // Forward the callback to the backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(
      `${backendUrl}/api/vendor/payment-callback?status=${status}&tx_ref=${tx_ref}&transaction_id=${transaction_id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (response.ok) {
      // Redirect to success page
      return NextResponse.redirect(new URL('/become-vendor/success', request.url));
    } else {
      // Redirect to failure page
      return NextResponse.redirect(new URL('/become-vendor/failed', request.url));
    }
  } catch (error) {
    console.error('Error processing payment callback:', error);
    return NextResponse.redirect(new URL('/become-vendor/failed', request.url));
  }
}
