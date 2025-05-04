'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Text from '@/components/Text';
import { FaCheckCircle, FaSpinner, FaShoppingBag, FaHome } from 'react-icons/fa';

interface OrderSuccessPageProps {
  params: {
    id: string;
  };
}

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { id } = params;
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // If user is not logged in and not loading, redirect to login
    if (!loading && !user) {
      router.push(`/login?redirect=/orders/${id}/success`);
      return;
    }
    
    // Fetch order details
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const response = await fetch(`/api/orders/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch order');
        }
        
        setOrder(data.data.order);
      } catch (error: any) {
        setError(error.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchOrder();
    }
  }, [id, user, loading, router]);
  
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <FaSpinner className="animate-spin h-10 w-10 text-yellow-600" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 dark:bg-green-900 mb-6">
            <FaCheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            <Text id="orderSuccess.title">Order Successful!</Text>
          </h1>
          
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            <Text id="orderSuccess.subtitle">Your order has been placed successfully.</Text>
          </p>
          
          {order && (
            <div className="mt-6 text-md text-gray-700 dark:text-gray-300">
              <p>
                <Text id="orderSuccess.orderNumber">Order Number</Text>: {order._id}
              </p>
              <p className="mt-2">
                <Text id="orderSuccess.totalAmount">Total Amount</Text>: ${order.totalPrice.toFixed(2)}
              </p>
            </div>
          )}
          
          <div className="mt-8 flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => router.push(`/orders/${id}`)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <FaShoppingBag className="mr-2 h-5 w-5" />
              <Text id="orderSuccess.viewOrder">View Order</Text>
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <FaHome className="mr-2 h-5 w-5" />
              <Text id="orderSuccess.continueShopping">Continue Shopping</Text>
            </button>
          </div>
          
          {error && (
            <div className="mt-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4 max-w-md mx-auto">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    <Text id="orderSuccess.error">Error</Text>
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
