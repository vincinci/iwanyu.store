'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FaStore, 
  FaUser, 
  FaBox, 
  FaChartLine, 
  FaDollarSign, 
  FaCalendarAlt, 
  FaSpinner
} from 'react-icons/fa';

interface VendorDashboardData {
  vendor: {
    _id: string;
    username: string;
    email: string;
    storeName: string;
    description: string;
    category: string;
    subscriptionPlan: string;
    subscriptionStartDate: string;
    subscriptionEndDate: string;
    status: string;
  };
  stats: {
    totalProducts: number;
    totalSales: number;
    totalRevenue: number;
  };
}

export default function VendorDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<VendorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Check if user is logged in and is a vendor
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/vendor/dashboard');
    } else if (!authLoading && user && user.role !== 'vendor') {
      router.push('/become-vendor');
    }
  }, [user, authLoading, router]);
  
  // Fetch vendor dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await fetch('/api/vendor/dashboard', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (user && user.role === 'vendor') {
      fetchDashboardData();
    }
  }, [user]);
  
  // Don't render anything on the server to avoid hydration issues
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return null;
  }
  
  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-red-100 dark:bg-red-900 p-6 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-xl font-bold text-red-800 dark:text-red-300 mb-4">Error Loading Dashboard</h1>
          <p className="text-red-700 dark:text-red-200">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  // If user is not a vendor, don't render anything (will redirect)
  if (!user || user.role !== 'vendor' || !dashboardData) {
    return null;
  }
  
  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Calculate days remaining in subscription
  const calculateDaysRemaining = () => {
    if (!dashboardData?.vendor.subscriptionEndDate) return 0;
    
    const endDate = new Date(dashboardData.vendor.subscriptionEndDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Vendor Dashboard
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Welcome back, {dashboardData.vendor.username}!
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {dashboardData.vendor.status === 'approved' ? 'Active Vendor' : dashboardData.vendor.status}
            </span>
          </div>
        </div>
        
        {/* Store Information */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-8">
          <div className="bg-yellow-500 dark:bg-yellow-600 p-6 text-white">
            <h2 className="text-xl font-bold flex items-center">
              <FaStore className="mr-2" /> Store Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {dashboardData.vendor.storeName}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {dashboardData.vendor.description}
                </p>
                <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-medium mr-2">Category:</span>
                  <span>{dashboardData.vendor.category}</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="font-medium mr-2">Owner:</span>
                  <span>{dashboardData.vendor.email}</span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">Subscription Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                    <span className="text-gray-900 dark:text-white font-medium capitalize">
                      {dashboardData.vendor.subscriptionPlan}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Started:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(dashboardData.vendor.subscriptionStartDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(dashboardData.vendor.subscriptionEndDate)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600 mt-2">
                    <span className="text-gray-900 dark:text-white font-medium">Days Remaining:</span>
                    <span className="text-yellow-600 dark:text-yellow-400 font-bold">
                      {calculateDaysRemaining()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
                <FaBox className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Products</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.stats.totalProducts}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
                <FaChartLine className="text-green-600 dark:text-green-400 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Sales</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.stats.totalSales}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 mr-4">
                <FaDollarSign className="text-yellow-600 dark:text-yellow-400 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${dashboardData.stats.totalRevenue.toFixed(2)}
                </h3>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="bg-yellow-500 dark:bg-yellow-600 p-6 text-white">
            <h2 className="text-xl font-bold">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => router.push('/vendor/products/add')}
              >
                <FaBox className="mr-2" />
                <span>Add New Product</span>
              </button>
              <button
                className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => router.push('/vendor/products')}
              >
                <FaStore className="mr-2" />
                <span>Manage Products</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
