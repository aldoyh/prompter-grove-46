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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-light)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <header className="sticky top-0 z-40" style={{ 
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg" style={{ boxShadow: 'var(--shadow-md)' }}>
              ✨
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400 bg-clip-text text-transparent">
                {t(language, 'appTitle')}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
            <div className="mb-8">
              <PromptEditor onSave={handleAddPrompt} onClose={() => {}} isCreate={true} language={language} />
            </div>

            {/* Prompts Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-10 w-10 border-3" style={{ 
                  borderColor: 'var(--border-color)',
                  borderTopColor: 'var(--primary)'
                }}></div>
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">📝</div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {prompts.length === 0
                    ? t(language, 'noPrompts')
                    : selectedTag
                    ? `${t(language, 'noPromptsTag')} #${selectedTag}`
                    : t(language, 'noMatches')}
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {prompts.length === 0
                    ? t(language, 'noPromptsDesc')
                    : selectedTag
                    ? t(language, 'noPromptsTagDesc')
                    : t(language, 'noMatchesDesc')}
                </p>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all"
                    style={{ 
                      background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    {t(language, 'clearFilter')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-20">
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
