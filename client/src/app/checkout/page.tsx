'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCart, CartItem as CartItemType } from '@/contexts/CartContext';
import Text from '@/components/Text';
import { FaShoppingCart, FaMoneyBillWave, FaSpinner, FaCreditCard } from 'react-icons/fa';
import CartLanguageCurrencyControls from '@/components/CartLanguageCurrencyControls';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const { format, convert, currentCurrency } = useCurrency();
  const { items: cartItems, subtotal, clearCart } = useCart();
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address: '',
    city: '',
    postalCode: '',
    country: 'Rwanda'
  });
  const [paymentMethod, setPaymentMethod] = useState('flutterwave');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Calculate order summary
  const itemsPrice = subtotal;
  const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping for orders over $100
  const taxPrice = itemsPrice * 0.15; // 15% tax
  const totalPrice = itemsPrice + shippingPrice + taxPrice;
  
  useEffect(() => {
    // If user is not logged in and not loading, redirect to login
    if (!loading && !user) {
      router.push('/login?redirect=/checkout');
      return;
    }
    
    // Get shipping address from localStorage
    const getShippingAddress = () => {
      if (typeof window !== 'undefined') {
        const shippingAddressFromStorage = localStorage.getItem('shippingAddress');
        if (shippingAddressFromStorage) {
          return JSON.parse(shippingAddressFromStorage);
        }
      }
      return {
        address: '',
        city: '',
        postalCode: '',
        country: 'Rwanda'
      };
    };
    
    setShippingAddress(getShippingAddress());
  }, [user, loading, router]);
  
  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!shippingAddress.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!shippingAddress.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!shippingAddress.postalCode.trim()) {
      errors.postalCode = 'Postal code is required';
    }
    
    if (!shippingAddress.country.trim()) {
      errors.country = 'Country is required';
    }
    
    if (!paymentMethod) {
      errors.paymentMethod = 'Payment method is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle shipping address change
  const handleShippingAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Save shipping address to localStorage
      localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
      
      // Create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderItems: cartItems.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          shippingAddress,
          paymentMethod,
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create order');
      }
      
      const data = await response.json();
      
      // Clear cart after successful order
      clearCart();
      
      // Redirect to order confirmation page
      router.push(`/order/${data.order._id}`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <FaSpinner className="animate-spin h-10 w-10 text-yellow-600" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            <Text id="checkout.title">Checkout</Text>
          </h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
            <Text id="checkout.subtitle">Complete your order</Text>
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              <Text id="orderSummary">Order Summary</Text>
            </h2>
            
            <div className="mb-4">
              <CartLanguageCurrencyControls variant="horizontal" size="sm" />
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span><Text id="subtotal">Subtotal</Text></span>
                <span>{format(convert(itemsPrice, 'RWF'))}</span>
              </div>
              
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span><Text id="shipping">Shipping</Text></span>
                <span>{format(convert(shippingPrice, 'RWF'))}</span>
              </div>
              
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span><Text id="tax">Tax</Text></span>
                <span>{format(convert(taxPrice, 'RWF'))}</span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold text-gray-900 dark:text-white">
                <span><Text id="total">Total</Text></span>
                <span>{format(convert(totalPrice, 'RWF'))}</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Text id="checkout.taxNote">Prices include 15% VAT. Free shipping on orders over {format(convert(100, 'RWF'))}.</Text>
            </div>
          </div>
          
          {/* Checkout Form */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  <Text id="checkout.shippingAndPayment">Shipping & Payment</Text>
                </h2>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700">
                <div className="px-4 py-5 sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Shipping Address */}
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                        <Text id="checkout.shippingAddress">Shipping Address</Text>
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Text id="checkout.address">Address</Text> *
                          </label>
                          <input
                            type="text"
                            id="address"
                            name="address"
                            className={`mt-1 block w-full rounded-md ${formErrors.address ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500`}
                            value={shippingAddress.address}
                            onChange={handleShippingAddressChange}
                          />
                          {formErrors.address && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.address}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Text id="checkout.city">City</Text> *
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            className={`mt-1 block w-full rounded-md ${formErrors.city ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500`}
                            value={shippingAddress.city}
                            onChange={handleShippingAddressChange}
                          />
                          {formErrors.city && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.city}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Text id="checkout.postalCode">Postal Code</Text> *
                          </label>
                          <input
                            type="text"
                            id="postalCode"
                            name="postalCode"
                            className={`mt-1 block w-full rounded-md ${formErrors.postalCode ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500`}
                            value={shippingAddress.postalCode}
                            onChange={handleShippingAddressChange}
                          />
                          {formErrors.postalCode && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.postalCode}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            <Text id="checkout.country">Country</Text> *
                          </label>
                          <input
                            type="text"
                            id="country"
                            name="country"
                            className={`mt-1 block w-full rounded-md ${formErrors.country ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-700'} bg-white dark:bg-gray-800 py-2 px-3 text-gray-900 dark:text-white focus:outline-none focus:ring-yellow-500 focus:border-yellow-500`}
                            value={shippingAddress.country}
                            onChange={handleShippingAddressChange}
                          />
                          {formErrors.country && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.country}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Payment Method */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        <Text id="paymentMethod">Payment Method</Text>
                      </label>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            id="flutterwave"
                            name="paymentMethod"
                            type="radio"
                            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-700"
                            value="flutterwave"
                            checked={paymentMethod === 'flutterwave'}
                            onChange={() => setPaymentMethod('flutterwave')}
                          />
                          <label htmlFor="flutterwave" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            <div className="flex items-center">
                              <FaCreditCard className="h-5 w-5 text-yellow-600 mr-2" />
                              <Text id="checkout.creditCard">Flutterwave (Credit/Debit Card)</Text>
                            </div>
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            id="cash"
                            name="paymentMethod"
                            type="radio"
                            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-700"
                            value="cash"
                            checked={paymentMethod === 'cash'}
                            onChange={() => setPaymentMethod('cash')}
                          />
                          <label htmlFor="cash" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            <div className="flex items-center">
                              <FaMoneyBillWave className="h-5 w-5 text-green-600 mr-2" />
                              <Text id="checkout.cashOnDelivery">Cash on Delivery</Text>
                            </div>
                          </label>
                        </div>
                      </div>
                      
                      {formErrors.paymentMethod && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formErrors.paymentMethod}</p>
                      )}
                    </div>
                    
                    {/* Error Message */}
                    {error && (
                      <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
                        <div className="flex">
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                              <Text id="checkout.error">Error</Text>
                            </h3>
                            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                              <p>{error}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Submit Button */}
                    <div>
                      <button
                        type="submit"
                        disabled={isSubmitting || cartItems.length === 0}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 ${
                          isSubmitting || cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                            <Text id="checkout.processing">Processing...</Text>
                          </>
                        ) : (
                          <>
                            <FaShoppingCart className="mr-2 h-4 w-4" />
                            <Text id="checkout.placeOrder">Place Order</Text>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
