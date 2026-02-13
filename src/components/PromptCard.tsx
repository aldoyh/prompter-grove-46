'use client';

import { useState } from 'react';
import { PromptEditor } from './PromptEditor';

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
}

export function PromptCard({
  prompt,
  onEdit,
  onDelete,
  isEditing,
  onSaveEdit,
}: PromptCardProps) {
  const [showActions, setShowActions] = useState(false);
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

  if (isEditing) {
    return (
      <PromptEditor
        prompt={prompt}
        onSave={(updates) => onSaveEdit(prompt.id, updates)}
        onClose={() => onEdit('')}
      />
    );
  }

  const date = new Date(prompt.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-200 dark:border-gray-700 relative"
    >
      {/* Title */}
      {prompt.title && (
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {prompt.title}
        </h3>
      )}

      {/* Text */}
      <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-6 whitespace-pre-wrap mb-3">
        {prompt.text}
      </p>

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {prompt.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <span>{date}</span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            title="Copy"
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {copied ? '✓' : '📋'}
          </button>
          <button
            onClick={() => onEdit(prompt.id)}
            title="Edit"
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            title="Delete"
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
