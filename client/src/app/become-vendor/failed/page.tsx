'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Text from '@/components/Text';
import { FaTimesCircle } from 'react-icons/fa';

export default function PaymentFailedPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    // If user is not logged in and not loading, redirect to login
    if (!loading && !user) {
      router.push('/login?redirect=/become-vendor');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 dark:bg-red-900 mb-6">
            <FaTimesCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Payment Failed
          </h1>
          
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            We couldn't process your payment. Please try again or contact support if the problem persists.
          </p>
          
          <div className="mt-8 flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => router.push('/become-vendor')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Try Again
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/contact')}
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
