'use client';

import React from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface PriceProps {
  amount: number;
  baseCurrency?: string;
  showCurrencyCode?: boolean;
  className?: string;
}

/**
 * Price component that displays prices in the user's preferred currency
 * 
 * @example
 * // Display 5000 RWF in user's preferred currency
 * <Price amount={5000} />
 * 
 * // Display 50 USD converted to user's preferred currency
 * <Price amount={50} baseCurrency="USD" />
 * 
 * // With custom className
 * <Price amount={75} className="text-red-500 font-bold" />
 */
const Price: React.FC<PriceProps> = ({
  amount,
  baseCurrency = 'RWF',
  showCurrencyCode = false,
  className = ''
}) => {
  const { format, currentCurrency } = useCurrency();
  
  // Format the price using the currency context
  const formattedPrice = format(amount, baseCurrency);
  
  return (
    <span className={`price ${className}`}>
      {formattedPrice}
      {showCurrencyCode && ` ${currentCurrency}`}
    </span>
  );
};

export default Price;
