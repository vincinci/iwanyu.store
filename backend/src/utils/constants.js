/**
 * Constants for the Iwanyu e-commerce platform
 */

// Supported currencies
const CURRENCIES = {
  RWF: {
    code: 'RWF',
    symbol: 'FRw',
    name: 'Rwandan Franc',
    decimals: 0,
    rate: 1, // Base currency
    format: (amount) => `${amount.toLocaleString()} FRw`
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimals: 2,
    rate: 0.00085, // Example rate: 1 RWF = 0.00085 USD
    format: (amount) => `$${amount.toFixed(2)}`
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    decimals: 2,
    rate: 0.00078, // Example rate: 1 RWF = 0.00078 EUR
    format: (amount) => `€${amount.toFixed(2)}`
  }
};

// Supported languages
const LANGUAGES = {
  EN: {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    isDefault: true
  },
  FR: {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷'
  },
  KIN: {
    code: 'rw',
    name: 'Kinyarwanda',
    flag: '🇷🇼'
  },
  SWA: {
    code: 'sw',
    name: 'Swahili',
    flag: '🇹🇿'
  }
};

// Currency conversion utility
const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (!CURRENCIES[fromCurrency] || !CURRENCIES[toCurrency]) {
    throw new Error('Invalid currency code');
  }
  
  // Convert to base currency (RWF) first if not already
  const amountInRWF = fromCurrency === 'RWF' 
    ? amount 
    : amount / CURRENCIES[fromCurrency].rate;
  
  // Then convert to target currency
  return toCurrency === 'RWF'
    ? amountInRWF
    : amountInRWF * CURRENCIES[toCurrency].rate;
};

// Format price in specified currency
const formatPrice = (amount, currencyCode = 'RWF') => {
  if (!CURRENCIES[currencyCode]) {
    throw new Error(`Invalid currency code: ${currencyCode}`);
  }
  
  return CURRENCIES[currencyCode].format(amount);
};

module.exports = {
  CURRENCIES,
  LANGUAGES,
  convertCurrency,
  formatPrice
};
