'use client';

import React, { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FaGlobe, FaChevronDown, FaCheck, FaMagic } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLanguageDetection } from '@/hooks/useLanguageDetection';

/**
 * Enhanced language selector with automatic detection and visual feedback
 */
const EnhancedLanguageSelector: React.FC = () => {
  const { currentLanguage, getAllLanguages } = useLanguage();
  const { hasUserSelected, setUserLanguage, resetLanguagePreference } = useLanguageDetection();
  const [isChanging, setIsChanging] = useState(false);
  
  // Get all available languages
  const languages = getAllLanguages();
  
  // Find current language object
  const current = languages.find(lang => lang.code === currentLanguage);
  
  const handleLanguageChange = (code: string) => {
    if (code === currentLanguage) return;
    
    setIsChanging(true);
    setUserLanguage(code);
    
    // Reset changing state after animation completes
    setTimeout(() => {
      setIsChanging(false);
    }, 500);
  };
  
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button 
          className={`inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200 ${
            isChanging ? 'animate-pulse' : ''
          }`}
        >
          <FaGlobe className="mr-2 text-yellow-500" />
          <span className="mr-1 text-lg">{current?.flag}</span>
          <span className="hidden md:inline">{current?.name}</span>
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 dark:divide-gray-700">
          <div className="py-1">
            {languages.map((language) => (
              <Menu.Item key={language.code}>
                {({ active }: { active: boolean }) => (
                  <button
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                    } group flex w-full items-center px-4 py-2 text-sm`}
                    onClick={() => handleLanguageChange(language.code)}
                  >
                    <span className="mr-2 text-lg">{language.flag}</span>
                    <span className="flex-grow">{language.name}</span>
                    {language.code === currentLanguage && (
                      <FaCheck className="ml-2 text-green-500" />
                    )}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
          
          {/* Auto-detect language option */}
          <div className="py-1">
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <button
                  className={`${
                    active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                  } group flex w-full items-center px-4 py-2 text-sm`}
                  onClick={resetLanguagePreference}
                  disabled={!hasUserSelected}
                >
                  <FaMagic className="mr-2 text-yellow-500" />
                  <span className="flex-grow">
                    {currentLanguage === 'en' ? 'Auto-detect language' : 
                     currentLanguage === 'fr' ? 'Détecter automatiquement' : 
                     currentLanguage === 'rw' ? 'Kugaragaza ururimi' : 
                     'Tambua lugha kiotomatiki'}
                  </span>
                  {!hasUserSelected && (
                    <FaCheck className="ml-2 text-green-500" />
                  )}
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default EnhancedLanguageSelector;
