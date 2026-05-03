import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  analyzeText, 
  getTextDirection,
  type TextLanguageInfo 
} from '@/lib/language-detection';

/**
 * Hook to automatically detect and manage text direction
 */
export function useAutoDirection(text: string): {
  direction: 'rtl' | 'ltr' | 'auto';
  isArabic: boolean;
  containsArabic: boolean;
  info: TextLanguageInfo;
  className: string;
} {
  const info = useMemo(() => analyzeText(text), [text]);
  
  const direction = useMemo(() => {
    if (!text) return 'ltr';
    return getTextDirection(text);
  }, [text]);
  
  const className = useMemo(() => {
    const classes: string[] = [];
    
    if (info.isArabic) {
      classes.push('text-arabic');
    } else if (info.containsArabic) {
      classes.push('text-mixed');
    }
    
    if (direction === 'rtl') {
      classes.push('dir-rtl');
    }
    
    return classes.join(' ');
  }, [info, direction]);
  
  return {
    direction,
    isArabic: info.isArabic,
    containsArabic: info.containsArabic,
    info,
    className,
  };
}

/**
 * Hook to manage page-level language and direction
 */
export function useLanguageDirection(initialLang: 'en' | 'ar' = 'en') {
  const [language, setLanguage] = useState<'en' | 'ar'>(initialLang);
  const [isClient, setIsClient] = useState(false);
  
  const updateDocumentDirection = useCallback((lang: 'en' | 'ar') => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);
  
  useEffect(() => {
    // Use setTimeout to defer state updates and avoid setState in effect
    const timer = setTimeout(() => {
      setIsClient(true);
      const savedLang = localStorage.getItem('language') as 'en' | 'ar' | null;
      if (savedLang) {
        setLanguage(savedLang);
        updateDocumentDirection(savedLang);
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [updateDocumentDirection]);
  
  const changeLanguage = useCallback((newLang: 'en' | 'ar') => {
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    updateDocumentDirection(newLang);
  }, [updateDocumentDirection]);
  
  const toggleLanguage = useCallback(() => {
    const newLang = language === 'en' ? 'ar' : 'en';
    changeLanguage(newLang);
  }, [language, changeLanguage]);
  
  return {
    language,
    setLanguage: changeLanguage,
    toggleLanguage,
    direction: language === 'ar' ? 'rtl' : 'ltr',
    isRTL: language === 'ar',
    isClient,
  };
}

/**
 * Hook to detect if content should display in RTL
 * Combines page language with content analysis
 */
export function useContentDirection(content: string): {
  dir: 'rtl' | 'ltr' | 'auto';
  className: string;
  lang?: string;
} {
  const contentInfo = useMemo(() => {
    if (!content) return null;
    return analyzeText(content);
  }, [content]);
  
  const result = useMemo(() => {
    if (!content || !contentInfo) {
      return {
        dir: 'ltr' as const,
        className: '',
      };
    }
    
    // If content is predominantly Arabic
    if (contentInfo.isArabic) {
      return {
        dir: 'rtl' as const,
        className: 'text-arabic font-arabic',
        lang: 'ar',
      };
    }
    
    // If content contains some Arabic but is mixed
    if (contentInfo.containsArabic) {
      return {
        dir: 'auto' as const,
        className: 'text-mixed',
      };
    }
    
    // Default: English/LTR
    return {
      dir: 'ltr' as const,
      className: 'text-english',
    };
  }, [content, contentInfo]);
  
  return result;
}