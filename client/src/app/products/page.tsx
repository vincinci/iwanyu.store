'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaFilter, FaSearch, FaSpinner } from 'react-icons/fa';
import Text from '@/components/Text';
import ProductCard from '@/components/ProductCard';

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

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Get search and category from URL params
  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || '';
    const categoryFromUrl = searchParams.get('category') || '';
    const pageFromUrl = searchParams.get('page') || '1';
    
    setSearchTerm(searchFromUrl);
    setCategory(categoryFromUrl);
    setPage(parseInt(pageFromUrl, 10) || 1);
  }, [searchParams]);
  
  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await fetch(
          `/api/products?search=${searchTerm}&category=${category}&page=${page}&limit=8`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      } catch (error: any) {
        setError(error.message || 'An error occurred');
        // If no products are available, use mock data for demo purposes
        setProducts([
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
          },
          {
            _id: '5',
            name: 'Kitenge Fabric Tote Bag',
            price: 24.99,
            images: ['/placeholder.png'],
            rating: 4.2,
            numReviews: 10,
            vendor: {
              _id: '105',
              storeName: 'Kigali Fashion'
            }
          },
          {
            _id: '6',
            name: 'Handcrafted Wooden Serving Spoons',
            price: 15.99,
            images: ['/placeholder.png'],
            rating: 4.3,
            numReviews: 7,
            vendor: {
              _id: '106',
              storeName: 'Muhanga Woodworks'
            }
          },
          {
            _id: '7',
            name: 'Rwandan Honey (500ml)',
            price: 9.99,
            images: ['/placeholder.png'],
            rating: 4.6,
            numReviews: 19,
            vendor: {
              _id: '107',
              storeName: 'Natural Rwanda'
            }
          },
          {
            _id: '8',
            name: 'Handmade Ceramic Mug',
            price: 14.99,
            images: ['/placeholder.png'],
            rating: 4.4,
            numReviews: 11,
            vendor: {
              _id: '108',
              storeName: 'Kigali Pottery'
            }
          }
        ]);
        setTotalPages(3);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [searchTerm, category, page]);
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams(searchTerm, category, 1);
  };
  
  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setCategory(newCategory);
    updateUrlParams(searchTerm, newCategory, 1);
  };
  
  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      updateUrlParams(searchTerm, category, newPage);
    }
  };
  
  // Update URL params
  const updateUrlParams = (search: string, cat: string, pg: number) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (cat) params.set('category', cat);
    params.set('page', pg.toString());
    
    router.push(`/products?${params.toString()}`);
  };
  
  // Handle add to cart
  const handleAddToCart = (productId: string) => {
    const product = products.find(p => p._id === productId);
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
    <div className="bg-white dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-yellow-600 dark:text-yellow-400">
          <Text id="productsPage.productListings">Product Listings</Text>
        </h1>
        
        {/* Search and Filter Section */}
        <form onSubmit={handleSearch} className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:border-gray-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:border-gray-700"
              value={category}
              onChange={handleCategoryChange}
            >
              <option value=""><Text id="productsPage.allCategories">All Categories</Text></option>
              <option value="clothing"><Text id="productsPage.clothing">Clothing</Text></option>
              <option value="electronics"><Text id="productsPage.electronics">Electronics</Text></option>
              <option value="home"><Text id="productsPage.homeAndGarden">Home & Garden</Text></option>
              <option value="food"><Text id="productsPage.foodAndBeverages">Food & Beverages</Text></option>
              <option value="crafts"><Text id="productsPage.crafts">Crafts & Art</Text></option>
            </select>
            <button 
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              <FaFilter /> <Text id="productsPage.filter">Filter</Text>
            </button>
          </div>
        </form>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin h-8 w-8 text-yellow-600" />
          </div>
        )}
        
        {/* Error Message */}
        {error && !loading && products.length === 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
        
        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
        
        {/* No Products Found */}
        {!loading && products.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              <Text id="productsPage.noProductsFound">No products found. Try a different search or category.</Text>
            </p>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && products.length > 0 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center gap-1">
              <button 
                className={`px-3 py-1 border rounded-md ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} dark:border-gray-700`}
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
              >
                <Text id="productsPage.previous">Previous</Text>
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i + 1}
                  className={`px-3 py-1 border rounded-md ${page === i + 1 ? 'bg-yellow-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} dark:border-gray-700`}
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              
              <button 
                className={`px-3 py-1 border rounded-md ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} dark:border-gray-700`}
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
              >
                <Text id="productsPage.next">Next</Text>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
