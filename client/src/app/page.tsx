'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import Link from "next/link";
import { FaShoppingCart, FaUsers, FaLock, FaStar, FaSpinner } from 'react-icons/fa';
import Text from "@/components/Text";
import Price from "@/components/Price";
import ProductCard from "@/components/ProductCard";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  rating?: number;
  numReviews?: number;
  vendor?: {
    _id: string;
    storeName: string;
  };
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch('/api/products?limit=4');
        
        if (!response.ok) {
          throw new Error('Failed to fetch featured products');
        }
        
        const data = await response.json();
        setFeaturedProducts(data.products || []);
      } catch (error: any) {
        setError(error.message || 'An error occurred');
        // If no products are available, use mock data for demo purposes
        setFeaturedProducts([
          {
            _id: '1',
            name: 'Traditional Rwandan Basket',
            price: 29.99,
            images: ['/placeholder.png'],
            rating: 4.5,
            numReviews: 12,
            vendor: {
              _id: '101',
              storeName: 'Kigali Crafts'
            }
          },
          {
            _id: '2',
            name: 'Handwoven Sisal Bowl',
            price: 19.99,
            images: ['/placeholder.png'],
            rating: 4.0,
            numReviews: 8,
            vendor: {
              _id: '102',
              storeName: 'Rwanda Artisans'
            }
          },
          {
            _id: '3',
            name: 'Rwandan Coffee Beans (250g)',
            price: 12.99,
            images: ['/placeholder.png'],
            rating: 4.8,
            numReviews: 24,
            vendor: {
              _id: '103',
              storeName: 'Kigali Coffee Roasters'
            }
          },
          {
            _id: '4',
            name: 'Imigongo Art Wall Hanging',
            price: 49.99,
            images: ['/placeholder.png'],
            rating: 4.7,
            numReviews: 15,
            vendor: {
              _id: '104',
              storeName: 'Eastern Province Artisans'
            }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedProducts();
  }, []);

  // Handle add to cart
  const handleAddToCart = (productId: string) => {
    const product = featuredProducts.find(p => p._id === productId);
    if (!product) return;
    
    // Get existing cart items from localStorage
    const existingCartItems = localStorage.getItem('cartItems') 
      ? JSON.parse(localStorage.getItem('cartItems') || '[]') 
      : [];
    
    // Check if product is already in cart
    const existingItem = existingCartItems.find((item: any) => item.productId === productId);
    
    if (existingItem) {
      // Increment quantity if already in cart
      const updatedItems = existingCartItems.map((item: any) => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
      localStorage.setItem('cartItems', JSON.stringify(updatedItems));
    } else {
      // Add new item to cart
      const newItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images[0] || '/placeholder.png'
      };
      localStorage.setItem('cartItems', JSON.stringify([...existingCartItems, newItem]));
    }
    
    // Show a toast or notification (you can implement this)
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-yellow-400 to-yellow-300 dark:from-yellow-600 dark:to-yellow-500 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-md">
            <Text id="heroTitle">Shop Local, Support Rwandan Vendors</Text>
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/90">
            <Text id="heroSubtitle">Browse a wide range of products and experience seamless shopping with our vendor marketplace.</Text>
          </p>
          <Link href="/products" className="px-6 py-3 bg-white text-yellow-600 rounded-full hover:bg-yellow-50 transition-all duration-300 shadow-md flex items-center gap-2 mx-auto font-medium w-fit">
            <FaShoppingCart /> <Text id="startShopping">Start Shopping</Text>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl md:text-3xl font-bold mb-10 text-center text-yellow-600 dark:text-yellow-400">
            <Text id="whyChooseUs">Why Choose Iwanyu?</Text>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center mb-4">
                <FaShoppingCart className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h4 className="text-xl font-semibold mb-2">
                <Text id="curatedProducts">Curated Products</Text>
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                <Text id="curatedProductsDesc">Discover top items from local vendors with stunning visuals and detailed descriptions.</Text>
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center mb-4">
                <FaUsers className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h4 className="text-xl font-semibold mb-2">
                <Text id="vendorCommunity">Vendor Community</Text>
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                <Text id="vendorCommunityDesc">Meet our featured sellers and their inspiring stories from across Rwanda.</Text>
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center mb-4">
                <FaLock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h4 className="text-xl font-semibold mb-2">
                <Text id="secureCheckout">Secure Checkout</Text>
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                <Text id="secureCheckoutDesc">Enjoy safe and secure payments with Flutterwave integration for a smooth experience.</Text>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              <Text id="featuredProducts">Featured Products</Text>
            </h3>
            <Link href="/products" className="text-yellow-600 dark:text-yellow-400 hover:underline flex items-center gap-1">
              <Text id="viewAll">View all</Text> <span>→</span>
            </Link>
          </div>
          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="animate-spin h-8 w-8 text-yellow-600" />
            </div>
          )}
          
          {/* Error Message */}
          {error && !loading && featuredProducts.length === 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-6">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
          
          {/* Products Grid */}
          {!loading && featuredProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
