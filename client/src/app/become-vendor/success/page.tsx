'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Text from '@/components/Text';
import { FaCheckCircle } from 'react-icons/fa';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [countdown, setCountdown] = useState(5);
  const { t } = useLanguage();

  useEffect(() => {
    // If user is not logged in and not loading, redirect to login
    if (!loading && !user) {
      router.push('/login?redirect=/become-vendor');
      return;
    }

    // If user is not a vendor, redirect to become-vendor page
    if (!loading && user && user.role !== 'vendor') {
      router.push('/become-vendor');
      return;
    }

    // Countdown to redirect to vendor dashboard
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/vendor/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 dark:bg-green-900 mb-6">
            <FaCheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            <Text id="becomeVendorPage.applicationSuccessful">Application Successful!</Text>
          </h1>
          
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            <Text id="becomeVendorPage.applicationSuccessMessage">
              Your vendor application has been approved and your subscription is now active.
            </Text>
          </p>
          
          <p className="mt-6 text-md text-gray-500 dark:text-gray-400">
            <Text id="becomeVendorPage.redirectMessage">
              You will be redirected to your vendor dashboard in a few seconds...
            </Text> ({countdown})
          </p>
          
          <div className="mt-8">
            <button
              type="button"
              onClick={() => router.push('/vendor/dashboard')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              {t('vendorDashboard.title')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
