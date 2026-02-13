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
    if (confirm('Delete this prompt?')) {
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

  const date = new Date(prompt.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const colorConfig = prompt.color
    ? CARD_COLORS.find((c) => c.name === prompt.color)
    : CARD_COLORS[0];

  const bgClass = colorConfig?.bg || CARD_COLORS[0].bg;
  const borderClass = colorConfig?.border || CARD_COLORS[0].border;
  const accentColor = colorConfig?.accent || 'transparent';

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowColorPicker(false);
      }}
      className="group relative rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg"
      style={{ 
        background: bgClass,
        border: `1px solid ${borderClass}`
      }}
    >
      {/* Top accent bar */}
      {prompt.color && prompt.color !== 'white' && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: accentColor }}
        />
      )}

      <div className="p-4">
        {/* Title */}
        {prompt.title && (
          <h3 className="font-semibold text-sm mb-2 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
            {prompt.title}
          </h3>
        )}

        {/* Text */}
        <p className="text-sm line-clamp-6 whitespace-pre-wrap mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {prompt.text}
        </p>

        {/* Tags */}
        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {prompt.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick?.(tag)}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-all cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                }}
                title={`Click to filter by #${tag}`}
              >
                <span>#</span>
                <span>{tag}</span>
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{date}</span>

          {/* Actions */}
          <div className={`flex gap-1 transition-opacity duration-200 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={handleCopy}
              title="Copy"
              className="p-1.5 rounded transition-colors text-sm"
              style={{
                color: 'var(--text-secondary)',
              }}
            >
              {copied ? '✓' : '📋'}
            </button>

            {/* Color Picker */}
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Change color"
                className="p-1.5 rounded transition-colors text-sm"
                style={{
                  color: 'var(--text-secondary)',
                }}
              >
                🎨
              </button>

              {showColorPicker && (
                <div 
                  className="absolute bottom-full right-0 mb-2 rounded-lg p-3 z-50 border"
                  style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border-color)',
                    boxShadow: 'var(--shadow-lg)'
                  }}
                >
                  <div className="flex gap-2 flex-wrap w-40 justify-center">
                    {CARD_COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => handleColorChange(color.name)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                          prompt.color === color.name
                            ? 'border-gray-900 dark:border-white scale-110'
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
              title="Edit"
              className="p-1.5 rounded transition-colors text-sm"
              style={{
                color: 'var(--text-secondary)',
              }}
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              title="Delete"
              className="p-1.5 rounded transition-colors text-sm"
              style={{
                color: '#ef4444',
              }}
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
