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
    <aside className="sticky top-32 h-fit">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden backdrop-blur-sm bg-white/50 dark:bg-slate-800/50">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 cursor-pointer hover:from-indigo-100/80 hover:to-purple-100/80 dark:hover:from-indigo-950/60 dark:hover:to-purple-950/60 transition-colors border-b border-slate-200 dark:border-slate-700"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🏷️</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">{t(language, 'tags')}</h3>
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full font-medium">
              {sortedTags.length}
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        {/* Tags List */}
        {isExpanded && (
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {selectedTag && (
              <button
                onClick={onClearFilter}
                className="w-full px-3 py-2 text-sm bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-900 dark:hover:to-purple-900 transition-colors font-medium flex items-center justify-between"
              >
                <span>✕ {t(language, 'clearFilter')}</span>
                <span className="text-xs opacity-70">{selectedTag}</span>
              </button>
            )}

            <div className={selectedTag ? 'border-t border-slate-200 dark:border-slate-700 pt-2' : ''}>
              {sortedTags.map(({ tag, count }) => {
                const isSelected = selectedTag === tag;
                const intensity = maxCount > 0 ? (count / maxCount) * 100 : 0;

                return (
                  <button
                    key={tag}
                    onClick={() => onTagClick(isSelected ? '' : tag)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-between group relative ${
                      isSelected
                        ? 'text-white shadow-lg'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {/* Intensity bar background */}
                    <div
                      className={`absolute left-0 top-0 h-full rounded-lg transition-all duration-200 -z-10 ${
                        isSelected
                          ? 'w-full bg-gradient-to-r from-indigo-500 to-purple-500'
                          : 'bg-indigo-100/50 dark:bg-indigo-900/20 group-hover:bg-indigo-200/50 dark:group-hover:bg-indigo-900/40'
                      }`}
                      style={{
                        width: isSelected ? '100%' : `${Math.max(intensity, 10)}%`,
                      }}
                    />

                    {/* Tag name */}
                    <span className="font-medium truncate relative z-10">
                      #{tag}
                    </span>

                    {/* Count badge */}
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ml-2 flex-shrink-0 relative z-10 ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
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
          <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Total tags: <strong>{sortedTags.length}</strong></span>
              <span>Prompts: <strong>{prompts.length}</strong></span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
