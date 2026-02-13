export const translations = {
  en: {
    // Header
    appTitle: 'Prompts',
    appDesc: 'A beautiful prompt manager for saving and organizing your ideas',
    
    // Search
    searchPlaceholder: 'Search by title, content or #tags...',
    
    // Tags
    tags: 'Tags',
    clearFilter: 'Clear Filter',
    
    // Create/Edit
    createPrompt: 'Create New Prompt',
    promptTitle: 'Prompt title (optional)',
    promptPlaceholder: 'Type a new prompt...',
    tagsLabel: 'Tags (comma separated)',
    tagsPlaceholder: 'e.g., ai, prompting, writing',
    cardColor: 'Card Color',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    copy: 'Copy',
    copied: 'Copied!',
    
    // Empty states
    noPrompts: 'No prompts yet',
    noPromptsDesc: 'Create your first prompt to get started',
    noMatches: 'No matches found',
    noMatchesDesc: 'Try adjusting your search terms',
    noPromptsTag: 'No prompts with',
    noPromptsTagDesc: 'Try adjusting your filter',
    
    // Confirmations
    deleteConfirm: 'Delete this prompt?',
    promptRequired: 'Prompt content is required',
    
    // Misc
    langEnglish: 'English',
    langArabic: 'العربية',
  },
  ar: {
    // Header
    appTitle: 'المحفوظات',
    appDesc: 'مدير محفوظات جميل لحفظ وتنظيم أفكارك',
    
    // Search
    searchPlaceholder: 'البحث حسب العنوان أو المحتوى أو #الوسوم...',
    
    // Tags
    tags: 'الوسوم',
    clearFilter: 'مسح المرشح',
    
    // Create/Edit
    createPrompt: 'إنشاء محفوظة جديدة',
    promptTitle: 'عنوان المحفوظة (اختياري)',
    promptPlaceholder: 'اكتب محفوظة جديدة...',
    tagsLabel: 'الوسوم (مفصولة بفاصلة)',
    tagsPlaceholder: 'مثال: ذكاء اصطناعي، كتابة، إبداع',
    cardColor: 'لون البطاقة',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تحرير',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    
    // Empty states
    noPrompts: 'لا توجد محفوظات حتى الآن',
    noPromptsDesc: 'أنشئ محفوظتك الأولى للبدء',
    noMatches: 'لم يتم العثور على تطابقات',
    noMatchesDesc: 'حاول تعديل شروط البحث الخاصة بك',
    noPromptsTag: 'لا توجد محفوظات مع',
    noPromptsTagDesc: 'حاول تعديل المرشح الخاص بك',
    
    // Confirmations
    deleteConfirm: 'حذف هذه المحفوظة؟',
    promptRequired: 'محتوى المحفوظة مطلوب',
    
    // Misc
    langEnglish: 'English',
    langArabic: 'العربية',
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export function t(lang: Language, key: TranslationKey): string {
  return translations[lang][key];
}
