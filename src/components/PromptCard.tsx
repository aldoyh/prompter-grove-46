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
  language: Language;
}

export function PromptCard({
  prompt,
  onEdit,
  onDelete,
  isEditing,
  onSaveEdit,
  onTagClick,
  language,
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

  // Color gradient mapping for accent top border
  const colorGradients: Record<string, string> = {
    slate: 'bg-slate-400',
    rose: 'bg-rose-400',
    amber: 'bg-amber-400',
    emerald: 'bg-emerald-400',
    cyan: 'bg-cyan-400',
    indigo: 'bg-indigo-400',
    violet: 'bg-violet-400',
    fuchsia: 'bg-fuchsia-400',
  };

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowColorPicker(false);
      }}
      className={`group ${bgClass} ${borderClass} rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 border relative overflow-hidden`}
    >
      {/* Subtle accent top border */}
      {prompt.color && prompt.color !== 'slate' && (
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${colorGradients[prompt.color] || 'bg-indigo-400'}`} />
      )}

      {/* Title */}
      {prompt.title && (
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {prompt.title}
        </h3>
      )}

      {/* Text */}
      <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-6 whitespace-pre-wrap mb-3 leading-relaxed">
        {prompt.text}
      </p>

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {prompt.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick?.(tag)}
              className="inline-flex items-center gap-1 bg-gray-200/70 dark:bg-slate-700/70 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 text-xs px-2.5 py-1 rounded-full transition-all duration-200 cursor-pointer group/tag"
              title={`Click to filter by #${tag}`}
            >
              <span>#</span>
              <span>{tag}</span>
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-300/40 dark:border-slate-600/40 text-xs text-gray-600 dark:text-gray-400">
        <span className="truncate">{date}</span>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 relative">
          <button
            onClick={handleCopy}
            title={t(language, 'copy')}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors"
          >
            {copied ? '✓' : '📋'}
          </button>

          {/* Color Picker */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              title={t(language, 'cardColor')}
              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors"
            >
              🎨
            </button>

            {showColorPicker && (
              <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50 backdrop-blur-sm">
                <div className="flex gap-2 flex-wrap w-40 justify-center">
                  {CARD_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleColorChange(color.name)}
                      className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${
                        prompt.color === color.name
                          ? 'border-gray-900 dark:border-white scale-110 ring-2 ring-indigo-400'
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
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            title={t(language, 'delete')}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
