'use client';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export const CARD_COLORS = [
  { name: 'slate', bg: 'bg-slate-50 dark:bg-slate-900/50', border: 'border-slate-200 dark:border-slate-800', accent: 'bg-slate-400' },
  { name: 'rose', bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800', accent: 'bg-rose-400' },
  { name: 'amber', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', accent: 'bg-amber-400' },
  { name: 'emerald', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', accent: 'bg-emerald-400' },
  { name: 'cyan', bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-cyan-200 dark:border-cyan-800', accent: 'bg-cyan-400' },
  { name: 'indigo', bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800', accent: 'bg-indigo-400' },
  { name: 'violet', bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-800', accent: 'bg-violet-400' },
  { name: 'fuchsia', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/30', border: 'border-fuchsia-200 dark:border-fuchsia-800', accent: 'bg-fuchsia-400' },
];

export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <div className="flex gap-2 items-center flex-wrap">
      {CARD_COLORS.map((color) => (
        <button
          key={color.name}
          onClick={() => onColorChange(color.name)}
          className={`w-6 h-6 rounded-full border-2 transition-all ${
            selectedColor === color.name
              ? 'border-slate-900 dark:border-white scale-110 ring-2 ring-indigo-400'
              : 'border-transparent opacity-70 hover:opacity-100'
          } ${color.bg}`}
          title={color.name}
        />
      ))}
    </div>
  );
}
