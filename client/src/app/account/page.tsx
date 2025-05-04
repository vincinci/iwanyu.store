'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FaUser, FaEnvelope, FaIdCard, FaSpinner } from 'react-icons/fa';

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // If user is not logged in and not loading, redirect to login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Don't render anything on the server to avoid hydration issues
  if (!isClient) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-4xl text-yellow-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, don't render anything (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="bg-yellow-500 dark:bg-yellow-600 p-6 text-white">
            <h1 className="text-2xl font-bold">My Account</h1>
            <p className="text-yellow-100">View and manage your account details</p>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full h-32 w-32 flex items-center justify-center mx-auto">
                  <FaUser className="text-5xl text-yellow-600 dark:text-yellow-400" />
                </div>
                
                <div className="mt-4 text-center">
                  <h2 className="text-xl font-bold">{user.username}</h2>
                  <p className="text-gray-600 dark:text-gray-400 capitalize">{user.role}</p>
                </div>
              </div>
              
              <div className="md:w-2/3">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                  Account Information
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-md mr-4">
                      <FaIdCard className="text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                      <p className="font-medium">{user.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-md mr-4">
                      <FaEnvelope className="text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-md mr-4">
                      <FaIdCard className="text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Account Type</p>
                      <p className="font-medium capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
