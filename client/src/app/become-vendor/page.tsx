'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Text from '@/components/Text';
import { 
  FaStore, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaFileAlt, 
  FaSpinner,
  FaCheckCircle,
  FaCheck,
  FaCreditCard
} from 'react-icons/fa';

export default function BecomeVendorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1); // 1: Application, 2: Subscription, 3: Payment, 4: Confirmation
  
  // Form state
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Subscription state
  const [subscriptionPlans, setSubscriptionPlans] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [loadingPlans, setLoadingPlans] = useState(false);
  
  // Payment state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Available categories
  const categories = [
    'Clothing & Apparel',
    'Electronics',
    'Home & Furniture',
    'Beauty & Personal Care',
    'Food & Groceries',
    'Art & Crafts',
    'Books & Stationery',
    'Sports & Outdoors',
    'Health & Wellness',
    'Other'
  ];

  // Progress steps
  const steps = [
    { id: 1, name: <Text id="becomeVendorPage.applicationStep">Application</Text> },
    { id: 2, name: <Text id="becomeVendorPage.subscriptionStep">Subscription</Text> },
    { id: 3, name: <Text id="becomeVendorPage.paymentStep">Payment</Text> },
    { id: 4, name: <Text id="becomeVendorPage.confirmationStep">Confirmation</Text> }
  ];

  const { t } = useLanguage();
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // If user is not logged in and not loading, redirect to login
    if (!loading && !user) {
      router.push('/login?redirect=/become-vendor');
    }
    
    // Pre-fill form with user data if available
    if (user) {
      // If user is already a vendor, redirect to vendor dashboard
      if (user.role === 'vendor') {
        router.push('/vendor/dashboard');
      }
    }
    
    // Fetch subscription plans
    const fetchSubscriptionPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await fetch('/api/vendor/subscription-plans');
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscription plans');
        }
        
        const data = await response.json();
        setSubscriptionPlans(data);
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
      } finally {
        setLoadingPlans(false);
      }
    };
    
    fetchSubscriptionPlans();
  }, [user, loading, router]);

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!storeName.trim()) {
      errors.storeName = 'Store name is required';
    }
    
    if (!description.trim()) {
      errors.description = 'Description is required';
    } else if (description.length < 50) {
      errors.description = 'Description must be at least 50 characters';
    }
    
    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required';
    }
    
    if (!address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!category) {
      errors.category = 'Please select a category';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate payment form
  const validatePaymentForm = () => {
    const errors: Record<string, string> = {};
    
    if (!cardNumber.trim()) {
      errors.cardNumber = 'Card number is required';
    }
    
    if (!cardName.trim()) {
      errors.cardName = 'Card name is required';
    }
    
    if (!expiryDate.trim()) {
      errors.expiryDate = 'Expiry date is required';
    }
    
    if (!cvv.trim()) {
      errors.cvv = 'CVV is required';
    }
    
    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle different steps
    if (currentStep === 1) {
      // Validate application form
      if (!validateForm()) {
        return;
      }
      
      setIsSubmitting(true);
      setSubmitError('');
      
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('You must be logged in to become a vendor');
        }
        
        // Submit vendor application
        const response = await fetch('/api/vendor/apply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            storeName,
            description,
            phoneNumber,
            address,
            category
          })
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to submit vendor application');
        }
        
        // Application submitted successfully
        setSubmitSuccess(true);
        
        // Move to subscription selection step
        setCurrentStep(2);
      } catch (error: any) {
        setSubmitError(error.message);
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 2) {
      // Validate subscription selection
      if (!selectedPlan) {
        setSubmitError('Please select a subscription plan');
        return;
      }
      
      // Move to payment step
      setSubmitError('');
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Validate payment form
      if (!validatePaymentForm()) {
        return;
      }
      
      setProcessingPayment(true);
      setPaymentError('');
      
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('You must be logged in to become a vendor');
        }
        
        // Process payment and update user to vendor
        const response = await fetch('/api/vendor/process-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            subscriptionPlan: selectedPlan,
            paymentMethodId: 'pm_' + Date.now().toString(), // Simulate a payment method ID
          })
        });
        
        if (!response.ok) {
          const data = await response.json();
          
          // If application is required, go back to step 1
          if (data.code === 'APPLICATION_REQUIRED') {
            setCurrentStep(1);
            throw new Error('You must complete your vendor application before processing payment');
          }
          
          throw new Error(data.message || 'Failed to process payment');
        }
        
        // Show success message
        setPaymentSuccess(true);
        setCurrentStep(4);
        
        // Redirect to vendor dashboard after 3 seconds
        setTimeout(() => {
          router.push('/vendor/dashboard');
        }, 3000);
      } catch (error: any) {
        setPaymentError(error.message);
      } finally {
        setProcessingPayment(false);
      }
    }
  };

  // Don't render anything on the server to avoid hydration issues
  if (!isClient) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            <Text id="becomeVendorPage.title">Become a Vendor</Text>
          </h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            <Text id="becomeVendorPage.subtitle">Join our marketplace and start selling your products today</Text>
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-12 max-w-3xl mx-auto">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {steps.map((step, stepIdx) => (
                <li key={step.id} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} ${stepIdx !== 0 ? 'pl-8 sm:pl-20' : ''} flex-1`}>
                  {currentStep > step.id ? (
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-yellow-600"></div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  )}
                  <div
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                      currentStep > step.id
                        ? 'bg-yellow-600'
                        : currentStep === step.id
                        ? 'bg-yellow-600 border-2 border-yellow-400'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <FaCheckCircle className="h-5 w-5 text-white" aria-hidden="true" />
                    ) : (
                      <span
                        className={`text-sm font-medium ${
                          currentStep === step.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {step.id}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{step.name}</span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="mt-10 max-w-3xl mx-auto">
          {/* If user is not logged in, don't render anything (will redirect) */}
          {user ? (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="bg-yellow-500 dark:bg-yellow-600 p-6 text-white">
                <h1 className="text-2xl font-bold">Become a Vendor</h1>
                <p className="text-yellow-100">Start selling your products on Iwanyu marketplace</p>
              </div>
              
              <div className="p-6">
                {submitError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:text-red-200 dark:border-red-800 mb-6" role="alert">
                    <span className="block sm:inline">{submitError}</span>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Application */}
                  {currentStep === 1 && (
                    <div>
                      <div className="mb-8">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          <Text id="becomeVendorPage.storeInformation">Store Information</Text>
                        </h3>
                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <Text id="becomeVendorPage.storeName">Store Name</Text> *
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaStore className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </div>
                              <input
                                type="text"
                                id="storeName"
                                className={`block w-full pl-10 rounded-md ${formErrors.storeName ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500`}
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                              />
                            </div>
                            {formErrors.storeName && (
                              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.storeName}</p>
                            )}
                          </div>
                          
                          <div className="sm:col-span-3">
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <Text id="becomeVendorPage.storeCategory">Store Category</Text> *
                            </label>
                            <div className="mt-1">
                              <select
                                id="category"
                                className={`block w-full rounded-md ${formErrors.category ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500`}
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                              >
                                <option value="">
                                  {t('becomeVendorPage.selectCategory')}
                                </option>
                                {categories.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {formErrors.category && (
                              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.category}</p>
                            )}
                          </div>
                          
                          <div className="sm:col-span-6">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <Text id="becomeVendorPage.storeDescription">Store Description</Text> *
                            </label>
                            <div className="mt-1">
                              <textarea
                                id="description"
                                rows={4}
                                className={`block w-full rounded-md ${formErrors.description ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500`}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                              />
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <Text id="becomeVendorPage.descriptionMinimum" className="text-sm text-gray-500 dark:text-gray-400">
                                {description.length}/50 characters minimum
                              </Text>
                            </p>
                            {formErrors.description && (
                              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-8">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          <Text id="becomeVendorPage.contactInformation">Contact Information</Text>
                        </h3>
                        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-3">
                            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <Text id="becomeVendorPage.contactName">Contact Name</Text>
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaUser className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </div>
                              <input
                                type="text"
                                id="contactName"
                                className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                value={user?.username || ''}
                                disabled
                              />
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <Text id="becomeVendorPage.accountUsername">This is your account username</Text>
                            </p>
                          </div>
                          
                          <div className="sm:col-span-3">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <Text id="becomeVendorPage.emailAddress">Email Address</Text>
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaEnvelope className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </div>
                              <input
                                type="email"
                                id="email"
                                className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                                value={user?.email || ''}
                                disabled
                              />
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <Text id="becomeVendorPage.accountEmail">This is your account email</Text>
                            </p>
                          </div>
                          
                          <div className="sm:col-span-3">
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <Text id="becomeVendorPage.phoneNumber">Phone Number</Text> *
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaPhone className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </div>
                              <input
                                type="tel"
                                id="phoneNumber"
                                className={`block w-full pl-10 rounded-md ${formErrors.phoneNumber ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500`}
                                placeholder="+250 78 123 4567"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                              />
                            </div>
                            {formErrors.phoneNumber && (
                              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.phoneNumber}</p>
                            )}
                          </div>
                          
                          <div className="sm:col-span-3">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              <Text id="becomeVendorPage.businessAddress">Business Address</Text> *
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaMapMarkerAlt className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </div>
                              <input
                                type="text"
                                id="address"
                                className={`block w-full pl-10 rounded-md ${formErrors.address ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500`}
                                placeholder="Kigali, Rwanda"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                              />
                            </div>
                            {formErrors.address && (
                              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.address}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-8">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          <Text id="becomeVendorPage.termsAndConditions">Vendor Terms and Conditions</Text>
                        </h3>
                        <div className="mt-6">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mt-0.5">
                                <FaFileAlt className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  <Text id="becomeVendorPage.termsDescription">
                                    By submitting this application, you agree to our vendor terms and conditions. This includes a commission fee on sales, adherence to our community guidelines, and maintaining quality standards for your products.
                                  </Text>
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 flex items-center">
                              <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-700 rounded"
                                checked={agreeTerms}
                                onChange={() => setAgreeTerms(!agreeTerms)}
                              />
                              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 dark:text-white">
                                <Text id="becomeVendorPage.agreeTerms">I agree to the vendor terms and conditions</Text>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (validateForm() && agreeTerms) {
                              setCurrentStep(2);
                            }
                          }}
                          disabled={!agreeTerms || isSubmitting}
                          className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${
                            !agreeTerms || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isSubmitting ? (
                            <>
                              <FaSpinner className="animate-spin inline mr-2" />
                              <Text id="becomeVendorPage.submittingApplication">Submitting Application...</Text>
                            </>
                          ) : (
                            <Text id="becomeVendorPage.continueToSubscription">Continue to Subscription</Text>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 2: Subscription Plan Selection */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                        Choose a Subscription Plan
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Select a subscription plan that best fits your business needs. You can upgrade or downgrade your plan at any time.
                      </p>
                      
                      {/* Loading state for subscription plans */}
                      {loadingPlans ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-3 gap-6">
                          {/* Basic Plan */}
                          <div 
                            className={`border rounded-lg overflow-hidden ${
                              selectedPlan === 'basic' 
                                ? 'border-yellow-500 ring-2 ring-yellow-500' 
                                : 'border-gray-200 dark:border-gray-700'
                            } transition-all duration-200 hover:shadow-md`}
                            onClick={() => setSelectedPlan('basic')}
                          >
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Basic</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">For small businesses</p>
                            </div>
                            <div className="p-4">
                              <div className="flex items-baseline mb-4">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">$9.99</span>
                                <span className="text-gray-500 dark:text-gray-400 ml-1">/month</span>
                              </div>
                              <ul className="space-y-2 mb-6">
                                <li className="flex items-start">
                                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                  <span className="text-gray-600 dark:text-gray-400">Up to 50 products</span>
                                </li>
                                <li className="flex items-start">
                                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                  <span className="text-gray-600 dark:text-gray-400">Basic analytics</span>
                                </li>
                                <li className="flex items-start">
                                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                  <span className="text-gray-600 dark:text-gray-400">Standard support</span>
                                </li>
                              </ul>
                              <button
                                type="button"
                                className={`w-full py-2 px-4 border rounded-md text-sm font-medium ${
                                  selectedPlan === 'basic'
                                    ? 'bg-yellow-600 text-white border-transparent'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700'
                                }`}
                                onClick={() => setSelectedPlan('basic')}
                              >
                                {selectedPlan === 'basic' ? 'Selected' : 'Select Plan'}
                              </button>
                            </div>
                          </div>
                          
                          {/* Premium Plan */}
                          <div 
                            className={`border rounded-lg overflow-hidden ${
                              selectedPlan === 'premium' 
                                ? 'border-yellow-500 ring-2 ring-yellow-500' 
                                : 'border-gray-200 dark:border-gray-700'
                            } transition-all duration-200 hover:shadow-md`}
                            onClick={() => setSelectedPlan('premium')}
                          >
                            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 border-b border-gray-200 dark:border-gray-700">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Premium</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">For growing businesses</p>
                                </div>
                                <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">Popular</span>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="flex items-baseline mb-4">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">$24.99</span>
                                <span className="text-gray-500 dark:text-gray-400 ml-1">/month</span>
                              </div>
                              <ul className="space-y-2 mb-6">
                                <li className="flex items-start">
                                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                  <span className="text-gray-600 dark:text-gray-400">Up to 200 products</span>
                                </li>
                                <li className="flex items-start">
                                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                  <span className="text-gray-600 dark:text-gray-400">Advanced analytics</span>
                                </li>
                                <li className="flex items-start">
                                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                  <span className="text-gray-600 dark:text-gray-400">Priority support</span>
                                </li>
                                <li className="flex items-start">
                                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                  <span className="text-gray-600 dark:text-gray-400">Featured products</span>
                                </li>
                              </ul>
                              <button
                                type="button"
                                className={`w-full py-2 px-4 border rounded-md text-sm font-medium ${
                                  selectedPlan === 'premium'
                                    ? 'bg-yellow-600 text-white border-transparent'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700'
                                }`}
                                onClick={() => setSelectedPlan('premium')}
                              >
                                {selectedPlan === 'premium' ? 'Selected' : 'Select Plan'}
                              </button>
                            </div>
                          </div>
                          
                          {/* Enterprise Plan */}
                          <div 
                            className={`border rounded-lg overflow-hidden ${
                              selectedPlan === 'enterprise' 
                                ? 'border-yellow-500 ring-2 ring-yellow-500' 
                                : 'border-gray-200 dark:border-gray-700'
                            } transition-all duration-200 hover:shadow-md`}
                            onClick={() => setSelectedPlan('enterprise')}
                          >
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Enterprise</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">For large businesses</p>
                            </div>
                            <div className="p-4">
                              <div className="flex items-baseline mb-4">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">$49.99</span>
                                <span className="text-gray-500 dark:text-gray-400 ml-1">/month</span>
                              </div>
                              <ul className="space-y-2 mb-6">
                                <li className="flex items-start">
                                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                  <span className="text-gray-600 dark:text-gray-400">Unlimited products</span>
                                </li>
                                <li className="flex items-start">
                                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                  <span className="text-gray-600 dark:text-gray-400">Premium analytics</span>
                                </li>
                                <li className="flex items-start">
                                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                  <span className="text-gray-600 dark:text-gray-400">24/7 support</span>
                                </li>
                                <li className="flex items-start">
                                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                  <span className="text-gray-600 dark:text-gray-400">Featured products</span>
                                </li>
                                <li className="flex items-start">
                                  <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                                  <span className="text-gray-600 dark:text-gray-400">Custom branding</span>
                                </li>
                              </ul>
                              <button
                                type="button"
                                className={`w-full py-2 px-4 border rounded-md text-sm font-medium ${
                                  selectedPlan === 'enterprise'
                                    ? 'bg-yellow-600 text-white border-transparent'
                                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700'
                                }`}
                                onClick={() => setSelectedPlan('enterprise')}
                              >
                                {selectedPlan === 'enterprise' ? 'Selected' : 'Select Plan'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-8 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          Continue to Payment
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 3: Payment Information */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
                        Payment Information
                      </h3>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Please provide your payment details to complete your subscription. Your card will be charged immediately.
                      </p>
                      
                      {paymentError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:text-red-200 dark:border-red-800 mb-6" role="alert">
                          <span className="block sm:inline">{paymentError}</span>
                        </div>
                      )}
                      
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-6">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Order Summary</h4>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                          <span className="text-gray-900 dark:text-white font-medium capitalize">{selectedPlan}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Billing:</span>
                          <span className="text-gray-900 dark:text-white font-medium">Monthly</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                          <span className="text-gray-900 dark:text-white font-medium">Total:</span>
                          <span className="text-gray-900 dark:text-white font-bold">
                            {selectedPlan === 'basic' ? '$9.99' : selectedPlan === 'premium' ? '$24.99' : '$49.99'}/month
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Card Number */}
                        <div>
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Card Number *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaCreditCard className="text-gray-400" />
                            </div>
                            <input
                              type="text"
                              id="cardNumber"
                              className={`block w-full pl-10 rounded-md border ${paymentErrors.cardNumber ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500`}
                              placeholder="1234 5678 9012 3456"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                            />
                          </div>
                          {paymentErrors.cardNumber && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{paymentErrors.cardNumber}</p>
                          )}
                        </div>
                        
                        {/* Card Name */}
                        <div>
                          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Cardholder Name *
                          </label>
                          <input
                            type="text"
                            id="cardName"
                            className={`block w-full rounded-md border ${paymentErrors.cardName ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500`}
                            placeholder="John Doe"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                          />
                          {paymentErrors.cardName && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{paymentErrors.cardName}</p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* Expiry Date */}
                          <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Expiry Date *
                            </label>
                            <input
                              type="text"
                              id="expiryDate"
                              className={`block w-full rounded-md border ${paymentErrors.expiryDate ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500`}
                              placeholder="MM/YY"
                              value={expiryDate}
                              onChange={(e) => setExpiryDate(e.target.value)}
                            />
                            {paymentErrors.expiryDate && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{paymentErrors.expiryDate}</p>
                            )}
                          </div>
                          
                          {/* CVV */}
                          <div>
                            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              CVV *
                            </label>
                            <input
                              type="text"
                              id="cvv"
                              className={`block w-full rounded-md border ${paymentErrors.cvv ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500`}
                              placeholder="123"
                              value={cvv}
                              onChange={(e) => setCvv(e.target.value)}
                            />
                            {paymentErrors.cvv && (
                              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{paymentErrors.cvv}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 flex justify-between">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={processingPayment}
                          className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${
                            processingPayment ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          {processingPayment ? (
                            <>
                              <FaSpinner className="animate-spin inline mr-2" />
                              Processing Payment...
                            </>
                          ) : (
                            'Complete Subscription'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 4: Confirmation */}
                  {currentStep === 4 && (
                    <div className="text-center py-8">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                        <FaCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Application Successful!
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Your vendor application has been approved and your subscription is now active.
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        You will be redirected to your vendor dashboard in a few seconds...
                      </p>
                      <div className="animate-pulse">
                        <div className="h-2 w-24 bg-yellow-500 rounded mx-auto"></div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
