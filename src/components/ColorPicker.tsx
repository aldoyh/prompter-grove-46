'use client';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

/* Modern, refined color palette with better harmony */
export const CARD_COLORS = [
  { name: 'slate', bg: 'bg-slate-50 dark:bg-slate-900/40', border: 'border-slate-200 dark:border-slate-700' },
  { name: 'rose', bg: 'bg-rose-50 dark:bg-rose-950/40', border: 'border-rose-200 dark:border-rose-800' },
  { name: 'amber', bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-amber-200 dark:border-amber-800' },
  { name: 'emerald', bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-200 dark:border-emerald-800' },
  { name: 'cyan', bg: 'bg-cyan-50 dark:bg-cyan-950/40', border: 'border-cyan-200 dark:border-cyan-800' },
  { name: 'indigo', bg: 'bg-indigo-50 dark:bg-indigo-950/40', border: 'border-indigo-200 dark:border-indigo-800' },
  { name: 'violet', bg: 'bg-violet-50 dark:bg-violet-950/40', border: 'border-violet-200 dark:border-violet-800' },
  { name: 'fuchsia', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/40', border: 'border-fuchsia-200 dark:border-fuchsia-800' },
];

export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <div className="flex gap-2 items-center flex-wrap">
      {CARD_COLORS.map((color) => (
        <button
          key={color.name}
          onClick={() => onColorChange(color.name)}
          className={`w-7 h-7 rounded-lg border-2 transition-all ${
            selectedColor === color.name
              ? 'border-gray-900 dark:border-white scale-110 shadow-lg ring-2 ring-offset-2 ring-indigo-400 dark:ring-offset-gray-900'
              : 'border-transparent opacity-70 hover:opacity-100'
          } ${color.bg}`}
          title={color.name}
        />
      ))}
    </div>
  );
}

