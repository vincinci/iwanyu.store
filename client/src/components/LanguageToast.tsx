'use client';

import React, { useEffect, useState } from 'react';
import { FaGlobe, FaCheck, FaTimes } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageToastProps {
  duration?: number;
}

/**
 * Toast notification that appears when language is changed
 */
const LanguageToast: React.FC<LanguageToastProps> = ({ duration = 3000 }) => {
  const { currentLanguage, getLanguageByCode } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [previousLanguage, setPreviousLanguage] = useState<string | null>(null);
  
  useEffect(() => {
    // Store initial language on mount
    if (!previousLanguage) {
      setPreviousLanguage(currentLanguage);
      return;
    }
    
    // If language changed, show toast
    if (previousLanguage !== currentLanguage) {
      setVisible(true);
      
      // Hide toast after duration
      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);
      
      // Update previous language
      setPreviousLanguage(currentLanguage);
      
      return () => clearTimeout(timer);
    }
  }, [currentLanguage, previousLanguage, duration]);
  
  // Get current language details
  const language = getLanguageByCode(currentLanguage);
  
  if (!visible || !language) return null;
  
  // Get toast message based on current language
  const getToastMessage = () => {
    switch (currentLanguage) {
      case 'en':
        return 'Language changed to English';
      case 'fr':
        return 'Langue changée en Français';
      case 'rw':
        return 'Ururimi rwahinduwe mu Kinyarwanda';
      case 'sw':
        return 'Lugha imebadilishwa kuwa Kiswahili';
      default:
        return `Language changed to ${language.name}`;
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slideInRight">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
          <FaGlobe className="text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {language.flag} {language.name}
            </h3>
            <button 
              onClick={() => setVisible(false)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <FaTimes />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {getToastMessage()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageToast;
