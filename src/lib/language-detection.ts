/**
 * Automatic Language Detection Utilities
 * Detects Arabic text and applies proper RTL/LTR direction and fonts
 */

// Unicode ranges for Arabic script
const ARABIC_RANGES = [
  [0x0600, 0x06FF],   // Arabic
  [0x0750, 0x077F],   // Arabic Supplement
  [0x08A0, 0x08FF],   // Arabic Extended-A
  [0xFB50, 0xFDFF],   // Arabic Presentation Forms-A
  [0xFE70, 0xFEFF],   // Arabic Presentation Forms-B
  [0x1EE00, 0x1EEFF], // Arabic Mathematical Alphabetic Symbols
];

// Unicode ranges for common RTL scripts
const RTL_SCRIPTS = [
  ...ARABIC_RANGES,
  [0x0590, 0x05FF],   // Hebrew
  [0x07C0, 0x07FA],   // NKo
  [0x0840, 0x085F],   // Mandaic
  [0x10800, 0x1083F], // Cypriot Syllabary
  [0x10A00, 0x10A5F], // Kharoshthi
];

/**
 * Check if a character is Arabic
 */
export function isArabicChar(char: string): boolean {
  const code = char.charCodeAt(0);
  return ARABIC_RANGES.some(([start, end]) => code >= start && code <= end);
}

/**
 * Check if a character belongs to an RTL script
 */
export function isRTLChar(char: string): boolean {
  const code = char.charCodeAt(0);
  return RTL_SCRIPTS.some(([start, end]) => code >= start && code <= end);
}

/**
 * Calculate the ratio of Arabic characters in text
 * Returns a value between 0 and 1
 */
export function getArabicRatio(text: string): number {
  if (!text || text.length === 0) return 0;
  
  const letters = text.replace(/[\s\p{P}\p{N}]/gu, ''); // Remove spaces, punctuation, numbers
  if (letters.length === 0) return 0;
  
  let arabicCount = 0;
  for (const char of letters) {
    if (isArabicChar(char)) {
      arabicCount++;
    }
  }
  
  return arabicCount / letters.length;
}

/**
 * Detect if text is primarily Arabic
 * Uses threshold-based detection for better accuracy
 */
export function isArabicText(text: string, threshold: number = 0.3): boolean {
  if (!text) return false;
  
  const ratio = getArabicRatio(text);
  return ratio >= threshold;
}

/**
 * Detect if text contains any Arabic characters
 */
export function containsArabic(text: string): boolean {
  if (!text) return false;
  
  for (const char of text) {
    if (isArabicChar(char)) return true;
  }
  return false;
}

/**
 * Detect the primary direction of text
 */
export function getTextDirection(text: string): 'rtl' | 'ltr' {
  // Find the first strong directional character
  const strongRTL = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const strongLTR = /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8]/;
  
  if (!text) return 'ltr';
  
  // Find first strong direction character
  for (const char of text) {
    if (strongRTL.test(char)) return 'rtl';
    if (strongLTR.test(char)) return 'ltr';
  }
  
  // Default based on Arabic ratio
  return isArabicText(text, 0.4) ? 'rtl' : 'ltr';
}

/**
 * Get language info for text content
 */
export interface TextLanguageInfo {
  isArabic: boolean;
  containsArabic: boolean;
  direction: 'rtl' | 'ltr';
  arabicRatio: number;
  suggestedClassName: string;
}

export function analyzeText(text: string): TextLanguageInfo {
  const isArabic = isArabicText(text);
  const hasArabic = containsArabic(text);
  const direction = getTextDirection(text);
  const arabicRatio = getArabicRatio(text);
  
  let suggestedClassName = '';
  
  if (isArabic) {
    suggestedClassName = 'text-arabic';
  } else if (hasArabic) {
    suggestedClassName = 'text-mixed';
  } else {
    suggestedClassName = 'text-english';
  }
  
  return {
    isArabic,
    containsArabic: hasArabic,
    direction,
    arabicRatio,
    suggestedClassName,
  };
}

/**
 * Utility to generate proper text attributes
 */
export function getTextAttributes(text: string): {
  dir?: 'rtl' | 'ltr' | 'auto';
  className?: string;
  lang?: string;
} {
  if (!text) return {};
  
  const info = analyzeText(text);
  
  if (info.isArabic) {
    return {
      dir: 'rtl',
      className: 'text-arabic',
      lang: 'ar',
    };
  }
  
  if (info.containsArabic) {
    return {
      dir: 'auto',
      className: 'text-mixed',
    };
  }
  
  return {
    dir: 'ltr',
    className: 'text-english',
  };
}