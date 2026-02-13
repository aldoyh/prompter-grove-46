'use client';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
}

export function SearchBar({ value, onChange, language = 'en' }: SearchBarProps) {
  const placeholder = language === 'ar' 
    ? 'ابحث عن طريق العنوان أو المحتوى أو #علامات...'
    : 'Search by title, content or #tags...';

  return (
    <div className="sticky top-16 z-30" style={{ 
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-9 py-2 border rounded-lg text-sm outline-none transition-all"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          />
          {value && (
            <button
              onClick={() => onChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
