'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import Text from '@/components/Text';
import { FaTimesCircle, FaShoppingCart, FaHeadset } from 'react-icons/fa';

export default function PaymentFailedPage() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 dark:bg-red-900 mb-6">
            <FaTimesCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            <Text id="paymentFailed.title">Payment Failed</Text>
          </h1>
          
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            <Text id="paymentFailed.subtitle">
              We couldn't process your payment. Please try again or contact our support team if the problem persists.
            </Text>
          </p>
          
          <div className="mt-8 flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => router.push('/checkout')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <FaShoppingCart className="mr-2 h-5 w-5" />
              <Text id="paymentFailed.tryAgain">Try Again</Text>
            </button>
            
            <button
              type="button"
              onClick={() => router.push('/contact')}
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <FaHeadset className="mr-2 h-5 w-5" />
              <Text id="paymentFailed.contactSupport">Contact Support</Text>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
