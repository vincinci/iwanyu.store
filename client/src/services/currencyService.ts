/**
 * Currency Service for Iwanyu E-commerce Platform
 * Handles currency selection, conversion, and formatting
 */

export type Currency = {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number; // Rate relative to RWF
  isDefault?: boolean;
};

// Supported currencies
export const CURRENCIES: Record<string, Currency> = {
  RWF: {
    code: 'RWF',
    symbol: 'RWF',
    name: 'Rwandan Franc',
    exchangeRate: 1,
    isDefault: true
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    exchangeRate: 0.00086 // 1 RWF = 0.00086 USD
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    exchangeRate: 0.00079 // 1 RWF = 0.00079 EUR
  }
};

// Get user's preferred currency from localStorage or default to RWF
export const getPreferredCurrency = (): string => {
  if (typeof window === 'undefined') return 'RWF'; // Default for SSR
  
  const stored = localStorage.getItem('preferredCurrency');
  if (stored && CURRENCIES[stored]) {
    return stored;
  }
  
  return 'RWF'; // Default to RWF
};

// Set user's preferred currency in localStorage
export const setPreferredCurrency = (currencyCode: string): void => {
  if (!CURRENCIES[currencyCode]) {
    throw new Error(`Invalid currency code: ${currencyCode}`);
  }
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferredCurrency', currencyCode);
    
    // Dispatch a storage event for cross-tab synchronization
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'preferredCurrency',
        newValue: currencyCode,
        storageArea: localStorage
      })
    );
  }
};

// Convert amount from one currency to another
export const convertCurrency = (
  amount: number, 
  fromCurrency: string, 
  toCurrency: string
): number => {
  if (!CURRENCIES[fromCurrency] || !CURRENCIES[toCurrency]) {
    console.error(`Invalid currency code: ${fromCurrency} or ${toCurrency}`);
    return amount;
  }
  
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Convert to RWF first (base currency)
  const amountInRWF = amount / CURRENCIES[fromCurrency].exchangeRate;
  
  // Then convert from RWF to target currency
  return amountInRWF * CURRENCIES[toCurrency].exchangeRate;
};

// Format price according to currency
export const formatPrice = (amount: number, currencyCode: string): string => {
  if (!CURRENCIES[currencyCode]) {
    console.error(`Invalid currency code: ${currencyCode}`);
    return `${amount}`;
  }
  
  const currency = CURRENCIES[currencyCode];
  
  try {
    // Use Intl.NumberFormat for proper currency formatting
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    // For currencies that Intl might not support well, use manual formatting
    if (currencyCode === 'RWF') {
      return `${currency.symbol} ${amount.toFixed(2)}`;
    }
    
    return formatter.format(amount);
  } catch (error) {
    // Fallback to simple formatting
    return `${currency.symbol} ${amount.toFixed(2)}`;
  }
};

export default {
  CURRENCIES,
  getPreferredCurrency,
  setPreferredCurrency,
  convertCurrency,
  formatPrice
};
