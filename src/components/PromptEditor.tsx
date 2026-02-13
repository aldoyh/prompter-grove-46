'use client';

import { useState, useEffect } from 'react';
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

interface PromptEditorProps {
  prompt?: Prompt;
  onSave: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  isCreate?: boolean;
  language?: Language;
}

export function PromptEditor({ prompt, onSave, onClose, isCreate = false, language = 'en' }: PromptEditorProps) {
  const [title, setTitle] = useState(prompt?.title || '');
  const [text, setText] = useState(prompt?.text || '');
  const [tags, setTags] = useState(prompt?.tags.join(', ') || '');
  const [color, setColor] = useState(prompt?.color || 'slate');
  const [isExpanded, setIsExpanded] = useState(!isCreate);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      alert(t(language, 'promptRequired'));
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
        color: color !== 'slate' ? color : undefined,
      });

      // Reset form if creating
      if (isCreate) {
        setTitle('');
        setText('');
        setTags('');
        setColor('slate');
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
      setColor('slate');
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
        <form onSubmit={handleSubmit} className={`${bgClass} ${borderClass} rounded-xl shadow-lg border overflow-hidden transition-all backdrop-blur-sm bg-white/50 dark:bg-slate-800/50`}>
          <div className="p-5">
            {isExpanded && (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t(language, 'promptTitle')}
                className="w-full mb-3 text-lg font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            )}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder={t(language, 'promptPlaceholder')}
              rows={isExpanded ? 5 : 1}
              className="w-full bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 leading-relaxed"
            />

            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-gray-300/40 dark:border-slate-600/40 space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">
                    {t(language, 'tagsLabel')}
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder={t(language, 'tagsPlaceholder')}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">
                    {t(language, 'cardColor')}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {CARD_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setColor(c.name)}
                        className={`w-8 h-8 rounded-lg border-2 transition-all ${
                          color === c.name
                            ? 'border-gray-900 dark:border-white scale-110 ring-2 ring-indigo-400'
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
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
                  >
                    {t(language, 'cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !text.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
                  >
                    {saving ? '⏳' : '✨'} {t(language, 'save')}
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
      <div className={`${bgClass} ${borderClass} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border backdrop-blur-sm`}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              {t(language, 'edit')}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t(language, 'promptTitle')}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t(language, 'promptTitle')}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t(language, 'promptPlaceholder')}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t(language, 'promptPlaceholder')}
                rows={8}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 resize-vertical"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t(language, 'tagsLabel')}
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={t(language, 'tagsPlaceholder')}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t(language, 'cardColor')}
              </label>
              <div className="flex gap-2 flex-wrap">
                {CARD_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColor(c.name)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      color === c.name
                        ? 'border-gray-900 dark:border-white scale-110 ring-2 ring-indigo-400'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    } ${c.bg}`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-6 pt-6 border-t border-gray-300/40 dark:border-slate-600/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
            >
              {t(language, 'cancel')}
            </button>
            <button
              type="submit"
              disabled={saving || !text.trim()}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
            >
              {saving ? '⏳' : '💾'} {t(language, 'save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
