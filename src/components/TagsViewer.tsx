'use client';

import { useState } from 'react';
import { Language, t } from '@/lib/translations';

interface TagsViewerProps {
  prompts: Array<{ id: string; tags: string[] }>;
  selectedTag: string | null;
  onTagClick: (tag: string) => void;
  onClearFilter: () => void;
  language: Language;
}

export function TagsViewer({
  prompts,
  selectedTag,
  onTagClick,
  onClearFilter,
  language,
}: TagsViewerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate tag frequencies
  const tagCounts = prompts.reduce(
    (acc, prompt) => {
      prompt.tags.forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>
  );

  const sortedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([tag, count]) => ({ tag, count }));

  const maxCount = sortedTags.length > 0 ? sortedTags[0].count : 0;

  if (sortedTags.length === 0) {
    return null;
  }

  return (
    <aside className="sticky top-20 h-fit">
      <div className="rounded-lg border overflow-hidden" style={{ 
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 cursor-pointer transition-colors"
          style={{
            borderBottom: '1px solid var(--border-color)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(236, 72, 153, 0.05))'
          }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🏷️</span>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {t(language, 'tags')}
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
              backgroundColor: 'var(--primary)',
              color: 'white'
            }}>
              {sortedTags.length}
            </span>
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            style={{ color: 'var(--text-secondary)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        {/* Tags List */}
        {isExpanded && (
          <div className="p-3 space-y-1.5 max-h-96 overflow-y-auto">
            {selectedTag && (
              <button
                onClick={onClearFilter}
                className="w-full px-3 py-2 text-sm rounded-lg transition-all flex items-center justify-between font-medium text-white"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <span>✕ {t(language, 'clearFilter')}</span>
                <span className="text-xs opacity-80">{selectedTag}</span>
              </button>
            )}

            <div className={selectedTag ? 'border-t pt-1.5' : ''} style={{ borderColor: 'var(--border-color)' }}>
              {sortedTags.map(({ tag, count }) => {
                const isSelected = selectedTag === tag;
                const intensity = maxCount > 0 ? (count / maxCount) * 100 : 0;

                return (
                  <button
                    key={tag}
                    onClick={() => onTagClick(isSelected ? '' : tag)}
                    className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-between group relative"
                    style={{
                      color: isSelected ? 'white' : 'var(--text-primary)',
                      background: isSelected ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'transparent',
                      boxShadow: isSelected ? 'var(--shadow-md)' : 'none'
                    }}
                  >
                    {/* Intensity bar background */}
                    {!isSelected && (
                      <div
                        className="absolute left-0 top-0 h-full rounded-lg transition-all duration-200 -z-10"
                        style={{
                          width: `${Math.max(intensity, 10)}%`,
                          backgroundColor: 'var(--primary)',
                          opacity: 0.1
                        }}
                      />
                    )}

                    {/* Tag name */}
                    <span className="font-medium text-sm truncate relative z-10">
                      #{tag}
                    </span>

                    {/* Count badge */}
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full ml-2 flex-shrink-0 relative z-10"
                      style={{
                        backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : 'var(--bg-secondary)',
                        color: isSelected ? 'white' : 'var(--text-secondary)'
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer summary */}
        {isExpanded && (
          <div className="px-3 py-2.5 text-xs" style={{
            backgroundColor: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border-color)',
            color: 'var(--text-secondary)'
          }}>
            <div className="flex justify-between">
              <span>{t(language, 'totalTags')}: <strong>{sortedTags.length}</strong></span>
              <span>{t(language, 'prompts')}: <strong>{prompts.length}</strong></span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
