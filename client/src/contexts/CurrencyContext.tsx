'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  CURRENCIES, 
  getPreferredCurrency, 
  setPreferredCurrency as setStoredCurrency,
  convertCurrency,
  formatPrice,
  Currency
} from '@/services/currencyService';

// Currency context type
interface CurrencyContextType {
  currentCurrency: string;
  setCurrency: (code: string) => void;
  convert: (amount: number, fromCurrency?: string) => number;
  format: (amount: number, fromCurrency?: string) => string;
  getCurrencyByCode: (code: string) => Currency | undefined;
  getAllCurrencies: () => Currency[];
}

// Create the context
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Provider props
interface CurrencyProviderProps {
  children: ReactNode;
}

// Currency provider component
export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState<string>('RWF');
  
  useEffect(() => {
    // Get preferred currency on mount
    const preferred = getPreferredCurrency();
    setCurrentCurrency(preferred);
    
    // Listen for storage changes (for cross-tab synchronization)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'preferredCurrency' && event.newValue && event.newValue !== currentCurrency) {
        setCurrentCurrency(event.newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Set currency function
  const setCurrency = (code: string) => {
    if (!CURRENCIES[code]) {
      console.error(`Currency ${code} is not supported`);
      return;
    }
    
    setCurrentCurrency(code);
    setStoredCurrency(code);
    
    // Dispatch a custom event for currency change
    if (typeof document !== 'undefined') {
      const event = new CustomEvent('currencyChanged', { 
        detail: { 
          currency: code, 
          previousCurrency: currentCurrency 
        } 
      });
      document.dispatchEvent(event);
    }
  };
  
  // Convert amount from a currency to the current currency
  const convert = (amount: number, fromCurrency: string = 'RWF'): number => {
    try {
      // If the amount is 0, just return 0 regardless of currency
      if (amount === 0) return 0;
      
      return convertCurrency(amount, fromCurrency, currentCurrency);
    } catch (error) {
      console.error('Currency conversion error:', error);
      return amount; // Fallback to original amount
    }
  };
  
  // Format amount in the current currency
  const format = (amount: number, fromCurrency: string = 'RWF'): string => {
    try {
      // If the amount is 0, format it directly in current currency
      if (amount === 0) {
        return formatPrice(0, currentCurrency);
      }
      
      // Convert the amount to the current currency
      const convertedAmount = convert(amount, fromCurrency);
      
      // Format the converted amount
      return formatPrice(convertedAmount, currentCurrency);
    } catch (error) {
      console.error('Currency formatting error:', error);
      return `${amount}`; // Fallback to simple string
    }
  };
  
  // Get currency by code
  const getCurrencyByCode = (code: string): Currency | undefined => {
    return CURRENCIES[code];
  };
  
  // Get all currencies
  const getAllCurrencies = (): Currency[] => {
    return Object.values(CURRENCIES);
  };
  
  const value = {
    currentCurrency,
    setCurrency,
    convert,
    format,
    getCurrencyByCode,
    getAllCurrencies
  };
  
  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook to use the currency context
export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  
  return context;
};

export default CurrencyContext;
