'use client';

import { useState, useMemo } from 'react';
import { Language, t } from '@/lib/translations';
import { analyzeText } from '@/lib/language-detection';

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
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 cursor-pointer hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-950/60 dark:hover:to-blue-950/60 transition-all duration-300 border-b border-slate-200 dark:border-slate-800"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🏷️</span>
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{t(language, 'tags')}</h3>
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
              {sortedTags.length}
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform duration-300 ${
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
          <div className="p-3 space-y-1.5 max-h-96 overflow-y-auto">
            {selectedTag && (
              <button
                onClick={onClearFilter}
                className="w-full px-3 py-2 text-sm bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-all duration-200 font-medium flex items-center justify-between"
              >
                <span>✕ {t(language, 'clearFilter')}</span>
                <span className="text-xs opacity-70">#{selectedTag}</span>
              </button>
            )}

            <div className={selectedTag ? 'border-t border-slate-200 dark:border-slate-800 pt-1.5' : ''}>
              {sortedTags.map(({ tag, count }) => {
                const isSelected = selectedTag === tag;
                const intensity = maxCount > 0 ? (count / maxCount) * 100 : 0;
                const tagAnalysis = analyzeText(tag);
                const isArabicTag = tagAnalysis.isArabic || tagAnalysis.containsArabic;

                return (
                  <button
                    key={tag}
                    onClick={() => onTagClick(isSelected ? '' : tag)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-between group relative ${
                      isSelected
                        ? 'text-white bg-indigo-600 shadow-md hover:shadow-lg hover:bg-indigo-700'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {/* Intensity bar background */}
                    {!isSelected && (
                      <div
                        className="absolute left-0 top-0 h-full rounded-lg bg-indigo-100 dark:bg-indigo-900/20 transition-all duration-200 -z-10"
                        style={{
                          width: `${Math.max(intensity, 10)}%`,
                        }}
                      />
                    )}

                    {/* Tag name */}
                    <span 
                      className={`font-medium text-sm truncate relative z-10 ${isArabicTag ? 'font-arabic dir-rtl' : ''}`}
                      dir={isArabicTag ? 'rtl' : 'ltr'}
                    >
                      #{tag}
                    </span>

                    {/* Count badge */}
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-2 flex-shrink-0 relative z-10 transition-all duration-200 ${
                        isSelected
                          ? 'bg-indigo-700 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
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
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 transition-all duration-300">
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
