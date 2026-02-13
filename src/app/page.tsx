'use client';

import { useState, useEffect } from 'react';
import { PromptCard } from '@/components/PromptCard';
import { PromptEditor } from '@/components/PromptEditor';
import { SearchBar } from '@/components/SearchBar';
import { TagsViewer } from '@/components/TagsViewer';

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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              ✨
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prompts</h1>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <SearchBar value={searchTerm} onChange={setSearchTerm} />

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
              />
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* Create New Prompt */}
            <div className="mb-12">
              <PromptEditor onSave={handleAddPrompt} onClose={() => {}} isCreate={true} />
            </div>

            {/* Prompts Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {prompts.length === 0
                    ? 'No prompts yet'
                    : selectedTag
                    ? `No prompts with #${selectedTag}`
                    : 'No matches found'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {prompts.length === 0
                    ? 'Create your first prompt to get started'
                    : selectedTag
                    ? 'Try adjusting your filter'
                    : 'Try adjusting your search terms'}
                </p>
                {selectedTag && (
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Clear Filter
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
