'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FaShoppingCart, FaUser, FaMoon, FaSun, FaBars, FaTimes, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import EnhancedLanguageSelector from './EnhancedLanguageSelector';
import CurrencySelector from './CurrencySelector';
import Text from './Text';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  // Check for dark mode preference on component mount
  useEffect(() => {
    // Check if user prefers dark mode
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') === 'true' || 
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Toggle dark mode class on document
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl md:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            Iwanyu
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="font-medium hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
              <Text id="home">Home</Text>
            </Link>
            <Link href="/products" className="font-medium hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
              <Text id="products">Products</Text>
            </Link>
            <Link href="/vendors" className="font-medium hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
              <Text id="vendors">Vendors</Text>
            </Link>
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Language and Currency Selectors - Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <EnhancedLanguageSelector />
              <CurrencySelector />
            </div>
            
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <FaSun className="text-yellow-400" />
              ) : (
                <FaMoon className="text-gray-600" />
              )}
            </button>
            
            {/* Cart Link */}
            <Link 
              href="/cart" 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
              aria-label="Shopping cart"
            >
              <FaShoppingCart className="text-gray-600 dark:text-gray-300" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
            
            {/* User Menu - Desktop */}
            <div className="hidden md:block relative" ref={profileMenuRef}>
              {user ? (
                <>
                  <button 
                    onClick={toggleProfileMenu}
                    className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="User menu"
                  >
                    <FaUserCircle className="text-gray-600 dark:text-gray-300 text-xl" />
                  </button>
                  
                  {/* Profile Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                      </div>
                      
                      {user.role === 'admin' && (
                        <Link 
                          href="/admin" 
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Text id="adminDashboard">Admin Dashboard</Text>
                        </Link>
                      )}
                      
                      {user.role === 'vendor' && (
                        <Link 
                          href="/vendor/dashboard" 
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Text id="vendorDashboard">Vendor Dashboard</Text>
                        </Link>
                      )}
                      
                      <Link 
                        href="/account" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Text id="account">My Account</Text>
                      </Link>
                      
                      <Link 
                        href="/orders" 
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Text id="orders">My Orders</Text>
                      </Link>
                      
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Text id="logout">Logout</Text>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Login"
                >
                  <FaUser className="text-gray-600 dark:text-gray-300" />
                </Link>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <FaTimes className="text-gray-600 dark:text-gray-300" />
              ) : (
                <FaBars className="text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-4 mt-4">
              <Link 
                href="/" 
                className="font-medium hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Text id="home">Home</Text>
              </Link>
              <Link 
                href="/products" 
                className="font-medium hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Text id="products">Products</Text>
              </Link>
              <Link 
                href="/vendors" 
                className="font-medium hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Text id="vendors">Vendors</Text>
              </Link>
              
              <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
                <EnhancedLanguageSelector />
                <CurrencySelector />
              </div>
              
              {user ? (
                <>
                  <div className="py-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link 
                      href="/admin" 
                      className="font-medium hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Text id="adminDashboard">Admin Dashboard</Text>
                    </Link>
                  )}
                  {user.role === 'vendor' && (
                    <Link 
                      href="/vendor/dashboard" 
                      className="font-medium hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Text id="vendorDashboard">Vendor Dashboard</Text>
                    </Link>
                  )}
                  <Link 
                    href="/account" 
                    className="font-medium hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Text id="account">My Account</Text>
                  </Link>
                  <Link 
                    href="/orders" 
                    className="font-medium hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Text id="orders">My Orders</Text>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors w-full justify-center"
                  >
                    <FaSignOutAlt /> <Text id="logout">Logout</Text>
                  </button>
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors w-full justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUser /> <Text id="login">Login</Text>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
