'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaShoppingCart, FaTrash, FaArrowLeft, FaCreditCard, FaLock } from 'react-icons/fa';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import Text from '@/components/Text';
import CartLanguageCurrencyControls from '@/components/CartLanguageCurrencyControls';

export default function CartPage() {
  const { items: cartItems, updateQuantity, removeItem, clearCart, subtotal } = useCart();
  const { t } = useLanguage();
  const { format, convert, currentCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const router = useRouter();

  // Set loading to false once the cart context is loaded
  useEffect(() => {
    setLoading(false);
  }, []);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  const applyPromoCode = () => {
    // In a real implementation, this would validate the promo code with the API
    if (promoCode.toUpperCase() === 'IWANYU20') {
      setPromoApplied(true);
      setDiscount(0.2); // 20% discount
    } else {
      alert('Invalid promo code');
    }
  };

  const clearPromoCode = () => {
    setPromoApplied(false);
    setDiscount(0);
    setPromoCode('');
  };

  const proceedToCheckout = () => {
    // In a real implementation, this would save the cart state and redirect to checkout
    router.push('/checkout');
  };

  // Calculate totals
  const discountAmount = promoApplied ? subtotal * discount : 0;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal - discountAmount + shipping;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:text-red-200 dark:border-red-800">
          <span className="block sm:inline">{error}</span>
        </div>
        <div className="mt-4">
          <Link href="/products" className="text-yellow-600 dark:text-yellow-400 hover:underline">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <FaShoppingCart className="text-6xl text-gray-300 dark:text-gray-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Looks like you haven't added any products to your cart yet.</p>
          <Link 
            href="/products" 
            className="inline-flex items-center px-6 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
          <FaShoppingCart className="mr-2" /> <Text id="cart">Shopping Cart</Text>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-2 text-gray-600 dark:text-gray-400 font-medium">Product</th>
                    <th className="text-center py-4 px-2 text-gray-600 dark:text-gray-400 font-medium">Quantity</th>
                    <th className="text-right py-4 px-2 text-gray-600 dark:text-gray-400 font-medium">Price</th>
                    <th className="text-right py-4 px-2 text-gray-600 dark:text-gray-400 font-medium">Total</th>
                    <th className="text-right py-4 px-2 text-gray-600 dark:text-gray-400 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-4 px-2">
                        <div className="flex items-center">
                          <div className="w-16 h-16 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden mr-4">
                            {/* Placeholder for image */}
                            <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                              <span>IMG</span>
                            </div>
                          </div>
                          <div>
                            <Link 
                              href={`/products/${item.id}`}
                              className="text-gray-800 dark:text-white hover:text-yellow-600 dark:hover:text-yellow-400"
                            >
                              {item.name}
                            </Link>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Sold by: {item.vendor || 'Unknown Vendor'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center justify-center">
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-l-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                            min="1"
                            className="w-12 px-2 py-1 border-y border-gray-300 dark:border-gray-700 text-center text-gray-900 dark:text-white dark:bg-gray-800"
                          />
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-2 py-1 border border-gray-300 dark:border-gray-700 rounded-r-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-right text-gray-800 dark:text-white">
                        {format(convert(item.price, 'RWF'))}
                      </td>
                      <td className="py-4 px-2 text-right font-medium text-gray-800 dark:text-white">
                        {format(convert(item.price * item.quantity, 'RWF'))}
                      </td>
                      <td className="py-4 px-2 text-right">
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mb-8">
              <Link 
                href="/products" 
                className="inline-flex items-center text-yellow-600 dark:text-yellow-400 hover:underline"
              >
                <FaArrowLeft className="mr-2" /> Continue Shopping
              </Link>
              <button 
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                <Text id="orderSummary">Order Summary</Text>
              </h2>
              
              <div className="mb-4">
                <CartLanguageCurrencyControls variant="horizontal" size="sm" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span><Text id="subtotal">Subtotal</Text></span>
                  <span>{format(convert(subtotal, 'RWF'))}</span>
                </div>
                
                {promoApplied && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span className="flex items-center">
                      <Text id="discount">Discount</Text> (20%)
                      <button 
                        onClick={clearPromoCode}
                        className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 text-xs"
                      >
                        <Text id="remove">Remove</Text>
                      </button>
                    </span>
                    <span>-{format(convert(discountAmount, 'RWF'))}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span><Text id="shipping">Shipping</Text></span>
                  <span>{shipping === 0 ? <Text id="free">Free</Text> : format(convert(shipping, 'RWF'))}</span>
                </div>
                
                {shipping > 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <Text id="freeShippingOver">Free shipping on orders over {format(convert(50, 'RWF'))}</Text>
                  </div>
                )}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between font-bold text-gray-900 dark:text-white">
                  <span><Text id="total">Total</Text></span>
                  <span>{format(convert(total, 'RWF'))}</span>
                </div>
              </div>
              
              {!promoApplied && (
                <div className="mb-6">
                  <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Text id="promoCode">Promo Code</Text>
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      id="promo-code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-l-md text-gray-900 dark:text-white dark:bg-gray-800 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    <button
                      onClick={applyPromoCode}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      <Text id="apply">Apply</Text>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Try "IWANYU20" for 20% off
                  </p>
                </div>
              )}
              
              <button
                onClick={proceedToCheckout}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
              >
                <FaCreditCard /> <Text id="proceedToCheckout">Proceed to Checkout</Text>
              </button>
              
              <div className="mt-4 flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                <FaLock className="mr-2" /> <Text id="secureCheckout">Secure Checkout</Text>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Text id="weAccept">We Accept</Text>
                </h3>
                <div className="flex space-x-2">
                  <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-10 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
