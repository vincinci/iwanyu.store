'use client';

import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TextProps {
  id: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Text component that displays translated text based on the current language
 * 
 * @example
 * // Display translated 'welcome' text
 * <Text id="welcome" />
 * 
 * // Display translated text with fallback
 * <Text id="someKey">Fallback text if key not found</Text>
 * 
 * // With additional styling
 * <Text id="products" className="font-bold" />
 */
const Text: React.FC<TextProps> = ({ id, children, className = '' }) => {
  const { t, currentLanguage } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);
  const prevLanguageRef = useRef(currentLanguage);
  
  // Get translated text or use children as fallback
  const translatedText = t(id);
  const displayText = translatedText === id && children ? children : translatedText;
  
  // Add animation when language changes
  useEffect(() => {
    if (prevLanguageRef.current !== currentLanguage) {
      setIsChanging(true);
      
      const timer = setTimeout(() => {
        setIsChanging(false);
      }, 500);
      
      prevLanguageRef.current = currentLanguage;
      
      return () => clearTimeout(timer);
    }
  }, [currentLanguage]);
  
  return (
    <span 
      className={`${className} ${isChanging ? 'animate-fadeIn' : ''}`}
      style={isChanging ? { 
        animation: 'fadeInText 0.5s ease-in-out',
        display: 'inline-block'
      } : undefined}
    >
      {displayText}
    </span>
  );
};

export default Text;
