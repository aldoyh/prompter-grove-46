'use client';

import { useState } from 'react';

interface TagsViewerProps {
  prompts: Array<{ id: string; tags: string[] }>;
  selectedTag: string | null;
  onTagClick: (tag: string) => void;
  onClearFilter: () => void;
}

export function TagsViewer({
  prompts,
  selectedTag,
  onTagClick,
  onClearFilter,
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 cursor-pointer hover:from-blue-100 hover:to-purple-100 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🏷️</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">Tags</h3>
            <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full">
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
                className="w-full px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors font-medium flex items-center justify-between"
              >
                <span>✕ Clear Filter</span>
                <span className="text-xs opacity-70">{selectedTag}</span>
              </button>
            )}

            <div className={selectedTag ? 'border-t border-gray-200 dark:border-gray-700 pt-2' : ''}>
              {sortedTags.map(({ tag, count }) => {
                const isSelected = selectedTag === tag;
                const intensity = maxCount > 0 ? (count / maxCount) * 100 : 0;

                return (
                  <button
                    key={tag}
                    onClick={() => onTagClick(isSelected ? '' : tag)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                      isSelected
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {/* Intensity bar background */}
                      <div
                        className={`absolute left-0 top-0 h-full rounded-lg transition-all duration-200 -z-10 ${
                          isSelected
                            ? 'w-full bg-blue-600'
                            : 'bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50'
                        }`}
                        style={{
                          width: isSelected ? '100%' : `${Math.max(intensity, 10)}%`,
                        }}
                      />

                      {/* Tag name */}
                      <span className="font-medium truncate relative z-10">
                        #{tag}
                      </span>
                    </div>

                    {/* Count badge */}
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ml-2 flex-shrink-0 relative z-10 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
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
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
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
