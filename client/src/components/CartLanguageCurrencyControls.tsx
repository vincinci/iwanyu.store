'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { FaGlobe, FaMoneyBillWave, FaChevronDown, FaCheck } from 'react-icons/fa';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Currency } from '@/services/currencyService';

interface CartLanguageCurrencyControlsProps {
  variant?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  onLanguageChange?: (code: string) => void;
  onCurrencyChange?: (code: string) => void;
}

/**
 * Compact language and currency controls for cart and checkout pages
 */
const CartLanguageCurrencyControls: React.FC<CartLanguageCurrencyControlsProps> = ({
  variant = 'horizontal',
  size = 'md',
  showLabels = false,
  onLanguageChange,
  onCurrencyChange
}) => {
  const { currentLanguage, setLanguage, getAllLanguages, t } = useLanguage();
  const { currentCurrency, setCurrency, getAllCurrencies } = useCurrency();
  const [isChanging, setIsChanging] = useState(false);
  
  // Get all available languages
  const languages = getAllLanguages();
  
  // Find current language object
  const currentLang = languages.find(lang => lang.code === currentLanguage);
  
  // Get all available currencies
  const availableCurrencies = getAllCurrencies().map(curr => curr.code);
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };
  
  // Handle language change with animation and callback
  const handleLanguageChange = (code: string) => {
    if (code === currentLanguage) return;
    
    setIsChanging(true);
    setLanguage(code);
    
    if (onLanguageChange) {
      onLanguageChange(code);
    }
    
    // Reset changing state after animation completes
    setTimeout(() => {
      setIsChanging(false);
    }, 500);
  };
  
  // Handle currency change with callback
  const handleCurrencyChange = (code: string) => {
    if (code === currentCurrency) return;
    
    setCurrency(code);
    
    if (onCurrencyChange) {
      onCurrencyChange(code);
    }
  };
  
  // Listen for language changes from other components
  useEffect(() => {
    const handleLanguageEvent = () => {
      setIsChanging(true);
      setTimeout(() => {
        setIsChanging(false);
      }, 500);
    };
    
    if (typeof document !== 'undefined') {
      document.addEventListener('languageChanged', handleLanguageEvent);
      return () => {
        document.removeEventListener('languageChanged', handleLanguageEvent);
      };
    }
  }, []);
  
  return (
    <div className={`flex ${variant === 'vertical' ? 'flex-col space-y-2' : 'space-x-3 items-center'}`}>
      {/* Language Selector */}
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button 
            className={`inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 ${sizeClasses[size]} ${isChanging ? 'animate-pulse' : ''}`}
          >
            <FaGlobe className="mr-1 text-yellow-500" />
            <span className="mr-1">{currentLang?.flag}</span>
            {showLabels && (
              <span className="mr-1">{currentLang?.name}</span>
            )}
            <FaChevronDown className="w-3 h-3" />
          </Menu.Button>
        </div>
        
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute z-10 mt-1 w-40 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {languages.map((language) => (
                <Menu.Item key={language.code}>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } ${
                        language.code === currentLanguage ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' : 'text-gray-700 dark:text-gray-300'
                      } group flex w-full items-center px-4 py-2 text-sm`}
                      onClick={() => handleLanguageChange(language.code)}
                    >
                      <span className="mr-2">{language.flag}</span>
                      <span className="flex-grow">{language.name}</span>
                      {language.code === currentLanguage && (
                        <FaCheck className="text-yellow-500 ml-2" />
                      )}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      
      {/* Currency Selector */}
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button 
            className={`inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 ${sizeClasses[size]}`}
          >
            <FaMoneyBillWave className="mr-1 text-green-500" />
            <span className="mr-1">{currentCurrency}</span>
            <FaChevronDown className="w-3 h-3" />
          </Menu.Button>
        </div>
        
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute z-10 mt-1 w-40 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {availableCurrencies.map((curr: string) => (
                <Menu.Item key={curr}>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } ${
                        curr === currentCurrency ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
                      } group flex w-full items-center px-4 py-2 text-sm`}
                      onClick={() => handleCurrencyChange(curr)}
                    >
                      <span className="flex-grow">
                        {curr === 'USD' && '$ USD'}
                        {curr === 'EUR' && '€ EUR'}
                        {curr === 'RWF' && 'RWF'}
                      </span>
                      {curr === currentCurrency && (
                        <FaCheck className="text-green-500 ml-2" />
                      )}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default CartLanguageCurrencyControls;
