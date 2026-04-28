'use client';

import { useState, useEffect } from 'react';
import { PromptCard } from '@/components/PromptCard';
import { PromptEditor } from '@/components/PromptEditor';
import { SearchBar } from '@/components/SearchBar';
import { TagsViewer } from '@/components/TagsViewer';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { translations, Language, t } from '@/lib/translations';
import { usePrompts } from '@/hooks/usePrompts';
import { useAuth } from '@/hooks/useAuth';
import { Prompt } from '@/domain/models/Prompt';

export default function Home() {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const { prompts, loading, error, create, update, remove, refetch } = usePrompts({
    search: '',
    tags: [],
    limit: 20,
    enableRealtime: true,
  });

  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  // Handle authentication UI
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      refetch();
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Filter prompts based on search and tags
  useEffect(() => {
    let filtered = prompts;

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(p => p.tags.includes(selectedTag));
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPrompts(filtered);
  }, [prompts, searchTerm, selectedTag]);

  // Handle create/update/delete operations
  const handleAddPrompt = async (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPrompt = await create(promptData);
      console.log('Prompt created:', newPrompt);
    } catch (err: any) {
      console.error('Failed to create prompt:', err);
    }
  };

  const handleUpdatePrompt = async (id: string, updates: Partial<Prompt>) => {
    try {
      await update(id, updates);
      setEditingId(null);
    } catch (err: any) {
      console.error('Failed to update prompt:', err);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    try {
      await remove(id);
    } catch (err: any) {
      console.error('Failed to delete prompt:', err);
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
    setSearchTerm('');
  };

  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
  };

  // Initialize mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="animated-header sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="header-logo w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
              ✨
            </div>
            <div>
              <h1 className="header-title text-xl font-bold">
                {t(currentLanguage, 'appTitle')}
              </h1>
              <p className="header-subtitle text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t(currentLanguage, 'appDesc')}
              </p>
            </div>
          </div>
          <LanguageSwitcher language={currentLanguage} onLanguageChange={handleLanguageChange} />
          {user ? (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              {t(currentLanguage, 'logout')}
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              {t(currentLanguage, 'login')}
            </button>
          )}
        </div>
      </header>

      {/* Search Bar */}
      <SearchBar value={searchTerm} onChange={setSearchTerm} language={currentLanguage} />

      {/* Main Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Tags Viewer */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            {!authLoading && (
              <TagsViewer
                prompts={prompts}
                selectedTag={selectedTag}
                onTagClick={handleTagClick}
                onClearFilter={() => setSelectedTag(null)}
                language={currentLanguage}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* Create New Prompt */}
            <div className="mb-8">
              <PromptEditor
                onSave={handleAddPrompt}
                onClose={() => {}}
                isCreate={true}
                language={currentLanguage}
              />
            </div>

            {/* Prompts Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400"></div>
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {prompts.length === 0
                    ? t(currentLanguage, 'noPrompts')
                    : selectedTag
                    ? `${t(currentLanguage, 'noPromptsTag')} #${selectedTag}`
                    : t(currentLanguage, 'noMatches')}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {prompts.length === 0
                    ? t(currentLanguage, 'noPromptsDesc')
                    : selectedTag
                    ? t(currentLanguage, 'noPromptsTagDesc')
                    : t(currentLanguage, 'noMatchesDesc')}
                </p>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-95"
                  >
                    {t(currentLanguage, 'clearFilter')}
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
                    language={currentLanguage}
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