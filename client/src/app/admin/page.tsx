import { 
  FaUsers, FaStore, FaShoppingBag, FaMoneyBillWave, 
  FaChartLine, FaSearch, FaEdit, FaTrash, FaCheck, FaTimes 
} from 'react-icons/fa';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="bg-gray-100 dark:bg-gray-900">
      {/* Admin Dashboard Layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 min-h-screen sticky top-0 shadow-md">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-yellow-600 dark:text-yellow-400">Iwanyu Admin</h1>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/admin" className="flex items-center gap-2 p-2 rounded-md bg-yellow-100 dark:bg-yellow-800 text-yellow-600 dark:text-yellow-400">
                  <FaChartLine /> Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin/users" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FaUsers /> Users
                </Link>
              </li>
              <li>
                <Link href="/admin/vendors" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FaStore /> Vendors
                </Link>
              </li>
              <li>
                <Link href="/admin/products" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FaShoppingBag /> Products
                </Link>
              </li>
              <li>
                <Link href="/admin/payouts" className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FaMoneyBillWave /> Payouts
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Dashboard Overview</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome to the Iwanyu admin panel. Here's an overview of your marketplace.</p>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Users</h2>
                <FaUsers className="text-yellow-500 text-xl" />
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">1,234</p>
              <p className="text-sm text-green-500 mt-2">+12% from last month</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Active Vendors</h2>
                <FaStore className="text-yellow-500 text-xl" />
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">56</p>
              <p className="text-sm text-green-500 mt-2">+8% from last month</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Products</h2>
                <FaShoppingBag className="text-yellow-500 text-xl" />
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">3,789</p>
              <p className="text-sm text-green-500 mt-2">+15% from last month</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Revenue</h2>
                <FaMoneyBillWave className="text-yellow-500 text-xl" />
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">$12,456</p>
              <p className="text-sm text-green-500 mt-2">+20% from last month</p>
            </div>
          </div>
          
          {/* Recent Vendors */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Vendor Applications</h2>
              <Link href="/admin/vendors" className="text-yellow-600 dark:text-yellow-400 hover:underline">View All</Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <tr key={item} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <FaStore className="text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Vendor Name {item}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">vendor{item}@example.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200">
                          {item % 3 === 0 ? 'Annual' : item % 2 === 0 ? 'Pro' : 'Starter'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item % 3 === 0 
                            ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' 
                            : 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                        }`}>
                          {item % 3 === 0 ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        2025-05-{item < 10 ? '0' + item : item}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300">
                            <FaEdit />
                          </button>
                          {item % 3 !== 0 && (
                            <>
                              <button className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">
                                <FaCheck />
                              </button>
                              <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                                <FaTimes />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Recent Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Products</h2>
              <Link href="/admin/products" className="text-yellow-600 dark:text-yellow-400 hover:underline">View All</Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <tr key={item} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                            <FaShoppingBag className="text-gray-500 dark:text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">Product Name {item}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">SKU: PRD-{1000 + item}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        Vendor {item % 3 + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        ${(19.99 * (item % 3 + 1)).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item % 4 === 0 
                            ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                            : 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                        }`}>
                          {item % 4 === 0 ? 'Out of Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300">
                            <FaEdit />
                          </button>
                          <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
