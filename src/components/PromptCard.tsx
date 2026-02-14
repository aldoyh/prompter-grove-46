'use client';

import { useState } from 'react';
import { PromptEditor } from './PromptEditor';
import { CARD_COLORS } from './ColorPicker';
import { Language, t } from '@/lib/translations';

interface Prompt {
  id: string;
  title: string;
  text: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  color?: string;
}

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  onSaveEdit: (id: string, updates: Partial<Prompt>) => void;
  onTagClick?: (tag: string) => void;
  language?: Language;
}

export function PromptCard({
  prompt,
  onEdit,
  onDelete,
  isEditing,
  onSaveEdit,
  onTagClick,
  language = 'en',
}: PromptCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (confirm(t(language, 'deleteConfirm'))) {
      onDelete(prompt.id);
    }
  };

  const handleColorChange = (color: string) => {
    onSaveEdit(prompt.id, { color });
    setShowColorPicker(false);
  };

  if (isEditing) {
    return (
      <PromptEditor
        prompt={prompt}
        onSave={(updates) => onSaveEdit(prompt.id, updates)}
        onClose={() => onEdit('')}
        language={language}
      />
    );
  }

  const date = new Date(prompt.updatedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
  });

  const colorConfig = prompt.color
    ? CARD_COLORS.find((c) => c.name === prompt.color)
    : CARD_COLORS[0];

  const bgClass = colorConfig?.bg || CARD_COLORS[0].bg;
  const borderClass = colorConfig?.border || CARD_COLORS[0].border;
  const accentClass = colorConfig?.accent || '';

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowColorPicker(false);
      }}
      className={`group relative rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-5 border overflow-hidden ${bgClass} ${borderClass}`}
    >
      {/* Accent bar */}
      {prompt.color && prompt.color !== 'slate' && (
        <div className={`absolute top-0 left-0 right-0 h-1 ${accentClass}`} />
      )}

      {/* Title */}
      {prompt.title && (
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2 text-sm">
          {prompt.title}
        </h3>
      )}

      {/* Text */}
      <p className="text-slate-700 dark:text-slate-300 text-sm line-clamp-6 whitespace-pre-wrap mb-3 leading-relaxed">
        {prompt.text}
      </p>

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {prompt.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick?.(tag)}
              className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer"
              title={`Click to filter by #${tag}`}
            >
              <span>#</span>
              <span>{tag}</span>
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
        <span>{date}</span>

        {/* Actions */}
        <div className={`flex gap-1.5 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleCopy}
            title={t(language, 'copy')}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
          >
            {copied ? '✓' : '📋'}
          </button>

          {/* Color Picker */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              title={t(language, 'cardColor')}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
            >
              🎨
            </button>

            {showColorPicker && (
              <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3 z-50">
                <div className="flex gap-2 flex-wrap w-40 justify-center">
                  {CARD_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleColorChange(color.name)}
                      className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                        prompt.color === color.name
                          ? 'border-slate-900 dark:border-white scale-110 ring-2 ring-indigo-400'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      } ${color.bg}`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onEdit(prompt.id)}
            title={t(language, 'edit')}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            title={t(language, 'delete')}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
