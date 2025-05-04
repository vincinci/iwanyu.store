/**
 * Language Service for Iwanyu E-commerce Platform
 * Handles language selection, detection, and text localization
 */

export type Language = {
  code: string;
  name: string;
  flag: string;
  isDefault?: boolean;
  rtl?: boolean;  // Right-to-left language
  dateFormat?: string; // Date format for this language
  numberFormat?: string; // Number format for this language
};

// Supported languages
export const LANGUAGES: Record<string, Language> = {
  EN: {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    isDefault: true,
    dateFormat: 'MM/DD/YYYY',
    numberFormat: 'en-US'
  },
  FR: {
    code: 'fr',
    name: 'Français',
    flag: '🇫🇷',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'fr-FR'
  },
  KIN: {
    code: 'rw',
    name: 'Kinyarwanda',
    flag: '🇷🇼',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'rw-RW'
  },
  SWA: {
    code: 'sw',
    name: 'Swahili',
    flag: '🇹🇿',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'sw-TZ'
  }
};

// Language preference keys
const LANGUAGE_STORAGE_KEY = 'preferredLanguage';
const USER_SELECTED_KEY = 'userSelectedLanguage';

/**
 * Get user's preferred language from localStorage or detect from browser
 * @returns Language code
 */
export const getPreferredLanguage = (): string => {
  if (typeof window === 'undefined') return 'en'; // Default for SSR
  
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored && Object.values(LANGUAGES).some(lang => lang.code === stored)) {
    return stored;
  }
  
  // Try to match browser language
  if (typeof navigator !== 'undefined') {
    // Get all browser languages in order of preference
    const browserLanguages = navigator.languages || [navigator.language];
    
    // Try to find a match with our supported languages
    for (const browserLang of browserLanguages) {
      const langCode = browserLang.split('-')[0].toLowerCase();
      const match = Object.values(LANGUAGES).find(
        lang => lang.code.toLowerCase() === langCode
      );
      
      if (match) {
        // Store this as the preferred language but don't mark as explicitly selected
        localStorage.setItem(LANGUAGE_STORAGE_KEY, match.code);
        return match.code;
      }
    }
  }
  
  // Default to English if no match found
  return 'en';
};

/**
 * Set user's preferred language in localStorage
 * @param languageCode Language code to set as preferred
 * @param isUserSelected Whether this was explicitly selected by user
 */
export const setPreferredLanguage = (
  languageCode: string, 
  isUserSelected: boolean = true
): void => {
  if (!Object.values(LANGUAGES).some(lang => lang.code === languageCode)) {
    throw new Error(`Invalid language code: ${languageCode}`);
  }
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
    
    // Mark as user-selected if applicable
    if (isUserSelected) {
      localStorage.setItem(USER_SELECTED_KEY, 'true');
    }
    
    // Dispatch a storage event for cross-tab synchronization
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: LANGUAGE_STORAGE_KEY,
        newValue: languageCode,
        storageArea: localStorage
      })
    );
  }
};

/**
 * Check if user has explicitly selected a language
 * @returns True if user has selected a language, false if auto-detected
 */
export const isUserSelectedLanguage = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(USER_SELECTED_KEY) === 'true';
};

/**
 * Reset language preference to auto-detect
 */
export const resetLanguagePreference = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(USER_SELECTED_KEY);
  
  // Re-detect language
  const detectedLanguage = detectBrowserLanguage();
  setPreferredLanguage(detectedLanguage, false);
};

/**
 * Detect browser language
 * @returns Detected language code or 'en' if not detected
 */
export const detectBrowserLanguage = (): string => {
  if (typeof navigator === 'undefined') return 'en';
  
  const browserLanguages = navigator.languages || [navigator.language];
  
  for (const browserLang of browserLanguages) {
    const langCode = browserLang.split('-')[0].toLowerCase();
    const match = Object.values(LANGUAGES).find(
      lang => lang.code.toLowerCase() === langCode
    );
    
    if (match) {
      return match.code;
    }
  }
  
  return 'en';
};

/**
 * Get language object by code
 * @param code Language code
 * @returns Language object or undefined if not found
 */
export const getLanguageByCode = (code: string): Language | undefined => {
  return Object.values(LANGUAGES).find(lang => lang.code === code);
};

/**
 * Get all available languages
 * @returns Array of language objects
 */
export const getAllLanguages = (): Language[] => {
  return Object.values(LANGUAGES);
};

/**
 * Format a date according to the current language
 * @param date Date to format
 * @param languageCode Language code
 * @returns Formatted date string
 */
export const formatDate = (date: Date, languageCode: string = 'en'): string => {
  const language = getLanguageByCode(languageCode);
  const format = language?.dateFormat || 'MM/DD/YYYY';
  
  try {
    return new Intl.DateTimeFormat(language?.numberFormat || 'en-US').format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return date.toLocaleDateString();
  }
};

/**
 * Format a number according to the current language
 * @param number Number to format
 * @param languageCode Language code
 * @returns Formatted number string
 */
export const formatNumber = (number: number, languageCode: string = 'en'): string => {
  const language = getLanguageByCode(languageCode);
  
  try {
    return new Intl.NumberFormat(language?.numberFormat || 'en-US').format(number);
  } catch (error) {
    console.error('Error formatting number:', error);
    return number.toString();
  }
};

export default {
  LANGUAGES,
  getPreferredLanguage,
  setPreferredLanguage,
  getLanguageByCode,
  getAllLanguages,
  isUserSelectedLanguage,
  resetLanguagePreference,
  detectBrowserLanguage,
  formatDate,
  formatNumber
};
