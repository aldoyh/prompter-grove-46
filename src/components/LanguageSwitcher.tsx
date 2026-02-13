'use client';

import { Language, translations } from '@/lib/translations';

interface LanguageSwitcherProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function LanguageSwitcher({ language, onLanguageChange }: LanguageSwitcherProps) {
  return (
    <div className="flex items-center gap-1 bg-gradient-to-r from-indigo-50/50 to-pink-50/50 dark:from-indigo-950/30 dark:to-pink-950/30 rounded-lg p-1 border border-indigo-200/30 dark:border-indigo-800/30">
      {(['en', 'ar'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => onLanguageChange(lang)}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
            language === lang
              ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          {lang === 'en' ? translations.en.langEnglish : translations.ar.langArabic}
        </button>
      ))}
    </div>
  );
}
