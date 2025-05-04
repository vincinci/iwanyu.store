import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FaMoneyBillWave, FaChevronDown } from 'react-icons/fa';
import { useCurrency } from '@/contexts/CurrencyContext';

/**
 * Currency selector dropdown component
 */
const CurrencySelector: React.FC = () => {
  const { currentCurrency, setCurrency, getAllCurrencies, getCurrencyByCode } = useCurrency();
  
  const handleCurrencyChange = (code: string) => {
    setCurrency(code);
  };
  
  // Get all available currencies
  const currencies = getAllCurrencies();
  
  // Find current currency object
  const current = getCurrencyByCode(currentCurrency);
  
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex items-center justify-center w-full px-2 py-1 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
          <FaMoneyBillWave className="mr-1" />
          <span className="mr-1">{current?.symbol}</span>
          <span className="hidden md:inline">{current?.code}</span>
          <FaChevronDown className="w-3 h-3 ml-1" />
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {currencies.map((currency) => (
              <Menu.Item key={currency.code}>
                {({ active }: { active: boolean }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                    } ${
                      currency.code === currentCurrency ? 'font-bold' : ''
                    } group flex w-full items-center px-4 py-2 text-sm`}
                    onClick={() => handleCurrencyChange(currency.code)}
                  >
                    <span className="mr-2">{currency.symbol}</span>
                    {currency.code} - {currency.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default CurrencySelector;
