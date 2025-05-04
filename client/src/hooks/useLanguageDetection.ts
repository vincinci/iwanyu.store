'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGES } from '@/services/languageService';

/**
 * Custom hook for language detection and automatic language switching
 * based on user preferences and browser settings
 */
export function useLanguageDetection() {
  const { currentLanguage, setLanguage } = useLanguage();
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [hasUserSelected, setHasUserSelected] = useState(false);

  useEffect(() => {
    // Check if user has explicitly selected a language
    const hasExplicitSelection = localStorage.getItem('userSelectedLanguage') === 'true';
    setHasUserSelected(hasExplicitSelection);

    // If user hasn't explicitly selected a language, try to detect it
    if (!hasExplicitSelection) {
      detectBrowserLanguage();
    }
  }, []);

  /**
   * Detect browser language and set it if supported
   */
  const detectBrowserLanguage = () => {
    if (typeof navigator === 'undefined') return;

    // Get browser languages
    const browserLanguages = navigator.languages || [navigator.language];
    
    // Try to find a match with our supported languages
    for (const browserLang of browserLanguages) {
      const langCode = browserLang.split('-')[0].toLowerCase();
      
      // Check if we support this language
      const supportedLanguage = Object.values(LANGUAGES).find(
        lang => lang.code.toLowerCase() === langCode
      );
      
      if (supportedLanguage) {
        setDetectedLanguage(supportedLanguage.code);
        
        // Only auto-switch if user hasn't explicitly chosen a language
        if (!hasUserSelected && currentLanguage !== supportedLanguage.code) {
          setLanguage(supportedLanguage.code);
        }
        
        break;
      }
    }
  };

  /**
   * Set language with user preference tracking
   */
  const setUserLanguage = (code: string) => {
    setLanguage(code);
    localStorage.setItem('userSelectedLanguage', 'true');
    setHasUserSelected(true);
  };

  /**
   * Reset language preference to automatic detection
   */
  const resetLanguagePreference = () => {
    localStorage.removeItem('userSelectedLanguage');
    setHasUserSelected(false);
    
    if (detectedLanguage) {
      setLanguage(detectedLanguage);
    } else {
      detectBrowserLanguage();
    }
  };

  return {
    detectedLanguage,
    hasUserSelected,
    setUserLanguage,
    resetLanguagePreference
  };
}

export default useLanguageDetection;
