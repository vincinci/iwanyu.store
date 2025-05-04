import { FaSearch, FaStar, FaStore, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';

export default function VendorsPage() {
  return (
    <div className="bg-white dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-yellow-600 dark:text-yellow-400">Vendor Profiles</h1>
        
        {/* Search Section */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search vendors..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-800 dark:border-gray-700">
              <option value="">All Categories</option>
              <option value="clothing">Clothing</option>
              <option value="electronics">Electronics</option>
              <option value="home">Home & Garden</option>
              <option value="food">Food & Beverages</option>
            </select>
            <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
              Search
            </button>
          </div>
        </div>
        
        {/* Featured Vendors */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-yellow-600 dark:text-yellow-400">Featured Vendors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="h-40 bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center">
                  <FaStore className="text-white text-5xl" />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold">Premium Vendor {item}</h3>
                    <div className="flex items-center">
                      <FaStar className="text-yellow-500" />
                      <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">4.8</span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Specializing in high-quality products with fast delivery and excellent customer service.
                  </p>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>Kigali, Rwanda</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <FaPhone className="mr-2" />
                    <span>+250 78 123 4567</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <FaEnvelope className="mr-2" />
                    <span>vendor{item}@example.com</span>
                  </div>
                  <Link 
                    href={`/vendors/${item}`} 
                    className="block w-full text-center py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* All Vendors */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-yellow-600 dark:text-yellow-400">All Vendors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[4, 5, 6, 7, 8, 9].map((item) => (
              <div key={item} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex">
                <div className="w-1/3 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <FaStore className="text-gray-400 dark:text-gray-500 text-3xl" />
                </div>
                <div className="w-2/3 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Vendor {item}</h3>
                    <div className="flex items-center">
                      <FaStar className="text-yellow-500" />
                      <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">4.2</span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 line-clamp-2">
                    Quality products for everyday use. Competitive prices and reliable service.
                  </p>
                  <Link 
                    href={`/vendors/${item}`} 
                    className="text-sm text-yellow-600 dark:text-yellow-400 hover:underline"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Pagination */}
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center gap-1">
            <button className="px-3 py-1 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-700">
              Previous
            </button>
            <button className="px-3 py-1 border rounded-md bg-yellow-500 text-white dark:border-gray-700">
              1
            </button>
            <button className="px-3 py-1 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-700">
              2
            </button>
            <button className="px-3 py-1 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-700">
              3
            </button>
            <button className="px-3 py-1 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-700">
              Next
            </button>
          </nav>
        </div>
        
        {/* Become a Vendor CTA */}
        <div className="mt-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Become a Vendor on Iwanyu</h2>
          <p className="mb-4">Join our marketplace and reach thousands of customers across Rwanda. Start selling your products today!</p>
          <Link 
            href="/become-vendor" 
            className="inline-block px-6 py-2 bg-white text-yellow-600 rounded-md hover:bg-gray-100 transition-colors font-medium"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
}
