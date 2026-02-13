'use client';

import { useState, useEffect } from 'react';
import { PromptCard } from '@/components/PromptCard';
import { PromptEditor } from '@/components/PromptEditor';
import { SearchBar } from '@/components/SearchBar';
import { TagsViewer } from '@/components/TagsViewer';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { translations, Language, t } from '@/lib/translations';

interface Prompt {
  id: string;
  title: string;
  text: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  color?: string;
}

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLanguage = localStorage.getItem('language') as Language | null;
    const lang = savedLanguage || 'en';
    setLanguage(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    fetchPrompts();
  }, []);

  useEffect(() => {
    filterPrompts(searchTerm, selectedTag);
  }, [prompts, searchTerm, selectedTag]);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const data = JSON.parse(localStorage.getItem('prompts') || '[]');
      setPrompts(data);
    } catch (error) {
      console.error('Failed to fetch prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPrompts = (term: string, tag: string | null) => {
    let filtered = prompts;

    // Filter by tag if selected
    if (tag) {
      filtered = filtered.filter(p => p.tags.includes(tag));
    }

    // Filter by search term
    if (term) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(term.toLowerCase()) ||
        p.text.toLowerCase().includes(term.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(term.toLowerCase()))
      );
    }

    setFilteredPrompts(filtered);
  };

  const handleAddPrompt = (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPrompt: Prompt = {
      ...prompt,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newPrompt, ...prompts];
    setPrompts(updated);
    localStorage.setItem('prompts', JSON.stringify(updated));
  };

  const handleUpdatePrompt = (id: string, updates: Partial<Prompt>) => {
    const updated = prompts.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    setPrompts(updated);
    localStorage.setItem('prompts', JSON.stringify(updated));
    setEditingId(null);
  };

  const handleDeletePrompt = (id: string) => {
    const updated = prompts.filter(p => p.id !== id);
    setPrompts(updated);
    localStorage.setItem('prompts', JSON.stringify(updated));
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
    setSearchTerm('');
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/50 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              ✨
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400 bg-clip-text text-transparent">
                {t(language, 'appTitle')}
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-light">
                {t(language, 'appDesc')}
              </p>
            </div>
          </div>
          <LanguageSwitcher language={language} onLanguageChange={handleLanguageChange} />
        </div>
      </header>

      {/* Search Bar */}
      <SearchBar value={searchTerm} onChange={setSearchTerm} language={language} />

      {/* Main Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Tags Viewer */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            {!loading && (
              <TagsViewer
                prompts={prompts}
                selectedTag={selectedTag}
                onTagClick={handleTagClick}
                onClearFilter={() => setSelectedTag(null)}
                language={language}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* Create New Prompt */}
            <div className="mb-12">
              <PromptEditor onSave={handleAddPrompt} onClose={() => {}} isCreate={true} language={language} />
            </div>

            {/* Prompts Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400"></div>
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {prompts.length === 0
                    ? t(language, 'noPrompts')
                    : selectedTag
                    ? `${t(language, 'noPromptsTag')} #${selectedTag}`
                    : t(language, 'noMatches')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {prompts.length === 0
                    ? t(language, 'noPromptsDesc')
                    : selectedTag
                    ? t(language, 'noPromptsTagDesc')
                    : t(language, 'noMatchesDesc')}
                </p>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {t(language, 'clearFilter')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                {filteredPrompts.map(prompt => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onEdit={setEditingId}
                    onDelete={handleDeletePrompt}
                    isEditing={editingId === prompt.id}
                    onSaveEdit={handleUpdatePrompt}
                    onTagClick={handleTagClick}
                    language={language}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
