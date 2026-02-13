'use client';

import { useState, useEffect } from 'react';
import { CARD_COLORS } from './ColorPicker';

interface Prompt {
  id: string;
  title: string;
  text: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  color?: string;
}

interface PromptEditorProps {
  prompt?: Prompt;
  onSave: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  isCreate?: boolean;
}

export function PromptEditor({ prompt, onSave, onClose, isCreate = false }: PromptEditorProps) {
  const [title, setTitle] = useState(prompt?.title || '');
  const [text, setText] = useState(prompt?.text || '');
  const [tags, setTags] = useState(prompt?.tags.join(', ') || '');
  const [color, setColor] = useState(prompt?.color || 'white');
  const [isExpanded, setIsExpanded] = useState(!isCreate);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      alert('Prompt content is required');
      return;
    }

    setSaving(true);
    try {
      const tagArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t);

      onSave({
        title: title.trim(),
        text: text.trim(),
        tags: tagArray,
        color: color !== 'white' ? color : undefined,
      });

      // Reset form if creating
      if (isCreate) {
        setTitle('');
        setText('');
        setTags('');
        setColor('white');
        setIsExpanded(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isCreate) {
      setTitle('');
      setText('');
      setTags('');
      setColor('white');
      setIsExpanded(false);
    } else {
      onClose();
    }
  };

  if (isCreate) {
    const colorConfig = CARD_COLORS.find((c) => c.name === color) || CARD_COLORS[0];
    const bgClass = colorConfig.bg;
    const borderClass = colorConfig.border;

    return (
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className={`${bgClass} ${borderClass} rounded-lg shadow-md border overflow-hidden transition-all`}>
          <div className="p-4">
            {isExpanded && (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Prompt title (optional)"
                className="w-full mb-3 text-lg font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
              />
            )}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="Type a new prompt..."
              rows={isExpanded ? 5 : 1}
              className="w-full bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white placeholder-gray-400 leading-relaxed"
            />

            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-300 border-opacity-40 dark:border-gray-600 space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., ai, prompting, writing"
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Card Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {CARD_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setColor(c.name)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          color === c.name
                            ? 'border-gray-900 dark:border-white scale-110 ring-2 ring-blue-400'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        } ${c.bg}`}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !text.trim()}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? '⏳' : '✨'} Save Prompt
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    );
  }

  // Edit mode
  const colorConfig = CARD_COLORS.find((c) => c.name === color) || CARD_COLORS[0];
  const bgClass = colorConfig.bg;
  const borderClass = colorConfig.border;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className={`${bgClass} ${borderClass} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border`}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Prompt</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Prompt title"
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Prompt content..."
                rows={8}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., ai, prompting, writing"
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {CARD_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.name)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      color === c.name
                        ? 'border-gray-900 dark:border-white scale-110 ring-2 ring-blue-400'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    } ${c.bg}`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-6 pt-6 border-t border-gray-300 border-opacity-40 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !text.trim()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? '⏳' : '💾'} Update Prompt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
