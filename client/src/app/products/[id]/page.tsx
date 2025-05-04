'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FaStar, FaShoppingCart, FaHeart, FaShare, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useCart } from '@/contexts/CartContext';
import Text from '@/components/Text';
import Price from '@/components/Price';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductDetailProps {
  params: {
    id: string;
  };
}

interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  vendor: {
    id: string;
    name: string;
  };
  stock: number;
  ratings: {
    rating: number;
    review?: string;
  }[];
  averageRating: number;
}

export default function ProductDetail({ params }: ProductDetailProps) {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const router = useRouter();
  const { addItem } = useCart();
  const { t } = useLanguage();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // In a real implementation, this would fetch from the API
        // For now, we'll use mock data
        const mockProduct: ProductData = {
          id: params.id,
          name: 'Handcrafted Rwandan Coffee Beans',
          description: 'Premium coffee beans sourced from the highlands of Rwanda. These beans are carefully selected and roasted to perfection to deliver a rich, aromatic experience with notes of chocolate and citrus. Each bag contains 250g of whole beans that can be ground according to your preference.',
          price: 15.99,
          images: ['/coffee1.jpg', '/coffee2.jpg', '/coffee3.jpg'],
          category: 'Food & Beverages',
          vendor: {
            id: '123',
            name: 'Rwanda Coffee Co-op'
          },
          stock: 25,
          ratings: [
            { rating: 5, review: 'Excellent coffee, very aromatic!' },
            { rating: 4, review: 'Great taste, fast delivery.' },
            { rating: 5, review: 'Best coffee I\'ve had in a while.' },
            { rating: 4 },
            { rating: 5 }
          ],
          averageRating: 4.6
        };
        
        setProduct(mockProduct);
      } catch (err: any) {
        setError(t('productDetailPage.failedToLoad') + ': ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, t]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && product && value <= product.stock) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const addToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      // Add the item to the cart using our context
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.images[0],
        vendor: product.vendor.name
      });
      
      // Show success message
      setTimeout(() => {
        setAddedToCart(true);
        setTimeout(() => {
          setAddedToCart(false);
        }, 3000);
      }, 300);
    } catch (err) {
      alert(t('productDetailPage.failedToAddToCart'));
    } finally {
      setAddingToCart(false);
    }
  };

  const nextImage = () => {
    if (product) {
      setActiveImage((activeImage + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product) {
      setActiveImage((activeImage - 1 + product.images.length) % product.images.length);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2">
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-6 w-3/4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
              <div className="flex gap-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-md">
          <h2 className="text-xl font-bold mb-2"><Text id="productDetailPage.error">Error</Text></h2>
          <p>{error}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            <Text id="productDetailPage.goBack">Go Back</Text>
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 p-4 rounded-md">
          <h2 className="text-xl font-bold mb-2"><Text id="productDetailPage.notFound">Product Not Found</Text></h2>
          <p><Text id="productDetailPage.couldNotFind">Could not find the requested product.</Text></p>
          <button 
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            <Text id="productDetailPage.goBack">Go Back</Text>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400">
                <Text id="home">Home</Text>
              </Link>
            </li>
            <li className="text-gray-500 dark:text-gray-400">/</li>
            <li>
              <Link href="/products" className="text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400">
                <Text id="products">Products</Text>
              </Link>
            </li>
            <li className="text-gray-500 dark:text-gray-400">/</li>
            <li className="text-yellow-600 dark:text-yellow-400">{product.name}</li>
          </ol>
        </nav>

        {/* Product Details */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Images */}
          <div className="w-full md:w-1/2">
            <div className="relative h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              {product.images.length > 0 ? (
                <>
                  <Image 
                    src={product.images[activeImage]} 
                    alt={product.name}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="p-4"
                  />
                  {product.images.length > 1 && (
                    <>
                      <button 
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <FaChevronLeft className="text-gray-800 dark:text-gray-200" />
                      </button>
                      <button 
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <FaChevronRight className="text-gray-800 dark:text-gray-200" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-500 dark:text-gray-400">
                    <Text id="productDetailPage.noImage">No image available</Text>
                  </span>
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex mt-4 space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 ${
                      activeImage === index 
                        ? 'border-yellow-500' 
                        : 'border-transparent'
                    }`}
                  >
                    <Image 
                      src={image} 
                      alt={`${product.name} thumbnail ${index + 1}`}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              <Text id="productDetailPage.name">{product.name}</Text>
            </h1>
            
            <div className="flex items-center mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar 
                    key={star}
                    className={`${
                      star <= Math.round(product.averageRating) 
                        ? 'text-yellow-500' 
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                ({product.averageRating.toFixed(1)}) · {product.ratings.length} <Text id="productDetailPage.reviews">reviews</Text>
              </span>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                <Text id="productDetailPage.price">Price</Text>
              </h2>
              <Price 
                amount={product.price} 
                className="text-2xl font-bold text-yellow-600 dark:text-yellow-400"
              />
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                <Text id="productDetailPage.description">Description</Text>
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                <Text id="productDetailPage.descriptionText">{product.description}</Text>
              </p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                <Text id="productDetailPage.vendor">Vendor</Text>
              </h2>
              <Link href={`/vendors/${product.vendor.id}`} className="text-yellow-600 dark:text-yellow-400 hover:underline">
                <Text id="productDetailPage.vendorName">{product.vendor.name}</Text>
              </Link>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <Text id="productDetailPage.availability">Availability</Text>:
                <span className={`ml-2 ${product.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {product.stock > 0 ? (
                    <>{product.stock} <Text id="productDetailPage.available" /></>
                  ) : (
                    <Text id="productDetailPage.outOfStock" />
                  )}
                </span>
              </div>
            </div>
            
            {product.stock > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  <Text id="quantity">Quantity</Text>
                </h2>
                <div className="flex items-center">
                  <button 
                    onClick={decrementQuantity}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-l-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 px-3 py-2 border-t border-b border-gray-300 dark:border-gray-700 text-center focus:outline-none dark:bg-gray-800"
                  />
                  <button 
                    onClick={incrementQuantity}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-r-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={addToCart}
                disabled={addingToCart || product.stock < 1}
                className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-lg ${
                  product.stock > 0
                    ? 'bg-yellow-600 dark:bg-yellow-700 text-white hover:bg-yellow-700 dark:hover:bg-yellow-600'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                } transition-colors`}
              >
                {addingToCart ? (
                  <Text id="productDetailPage.addingToCart" />
                ) : addedToCart ? (
                  <>
                    <Text id="productDetailPage.added" /> <Text id="productDetailPage.toCart" />
                  </>
                ) : (
                  <>
                    <Text id="productDetailPage.addToCart" />
                    <FaShoppingCart className="ml-2" />
                  </>
                )}
              </button>
              
              <button 
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                <FaHeart className="text-red-500" />
                <Text id="productDetailPage.wishlist">Wishlist</Text>
              </button>
              
              <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <FaShare className="text-blue-500" />
                <Text id="productDetailPage.share">Share</Text>
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            <Text id="productDetailPage.customerReviews">Customer Reviews</Text>
          </h2>
          
          {product.ratings.length > 0 ? (
            <div className="space-y-6">
              {product.ratings.map((rating, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar 
                          key={star}
                          className={`${
                            star <= rating.rating 
                              ? 'text-yellow-500' 
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      <Text id="productDetailPage.verifiedPurchase">Verified Purchase</Text>
                    </span>
                  </div>
                  
                  {rating.review && (
                    <p className="text-gray-700 dark:text-gray-300">
                      <Text id="productDetailPage.reviewText">{rating.review}</Text>
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              <Text id="productDetailPage.noReviews">No reviews yet. Be the first to review this product!</Text>
            </p>
          )}
          
          <div className="mt-6">
            <button className="px-6 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors">
              <Text id="productDetailPage.writeReview">Write a Review</Text>
            </button>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            <Text id="productDetailPage.youMayAlsoLike">You May Also Like</Text>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <FaStar className="text-yellow-500" />
                    <FaStar className="text-yellow-500" />
                    <FaStar className="text-yellow-500" />
                    <FaStar className="text-yellow-500" />
                    <FaStar className="text-gray-300 dark:text-gray-600" />
                    <p className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                      4.0 ({item} <Text id="productDetailPage.reviews" />)
                    </p>
                  </div>
                  <h3 className="font-medium mb-1">
                    <Text id="productDetailPage.relatedProduct">Related Product</Text> {item}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    <Text id="vendorName">Vendor Name</Text>
                  </p>
                  <div className="flex justify-between items-center">
                    <Price amount={19.99} className="font-bold text-yellow-600 dark:text-yellow-400" />
                    <button className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-full text-yellow-600 dark:text-yellow-400">
                      <FaShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
