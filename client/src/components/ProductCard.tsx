'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaShoppingCart } from 'react-icons/fa';
import Text from '@/components/Text';
import Price from '@/components/Price';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: {
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
  };
  onAddToCart?: (productId: string) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add to cart using CartContext
    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images && product.images.length > 0 ? product.images[0] : '/placeholder.png',
      vendor: product.vendor?.storeName
    });
    
    // Also call the parent's onAddToCart if provided
    if (onAddToCart) {
      onAddToCart(product._id);
    }
  };
  
  // Default image if no images are provided
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder.png';
  
  // Default rating if not provided
  const rating = product.rating || 0;
  const numReviews = product.numReviews || 0;
  
  return (
    <Link href={`/products/${product._id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
        <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className={`object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <FaStar 
                key={i} 
                className={i < Math.floor(rating) ? "text-yellow-500" : "text-gray-300 dark:text-gray-600"} 
              />
            ))}
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              ({rating.toFixed(1)})
            </span>
          </div>
          <h2 className="font-medium mb-1 line-clamp-2 text-gray-900 dark:text-white">
            {product.name}
          </h2>
          {product.vendor && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
              {product.vendor.storeName}
            </p>
          )}
          <div className="flex justify-between items-center mt-auto">
            <Price 
              amount={product.price} 
              className="font-bold text-yellow-600 dark:text-yellow-400" 
            />
            <button 
              className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-full text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
              title={`Add ${product.name} to cart`}
              onClick={handleAddToCart}
            >
              <FaShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
