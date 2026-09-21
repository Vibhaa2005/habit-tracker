import { useState } from 'react';

interface CheckRowProps {
  label: string;
  checked: boolean;
  onToggle: (next: boolean) => void;
  meta?: string; // e.g. "6:00 AM"
  disabled?: boolean;
}

export function CheckRow({ label, checked, onToggle, meta, disabled }: CheckRowProps) {
  const [justChecked, setJustChecked] = useState(false);

  function handleClick() {
    if (disabled) return;
    if (!checked) {
      setJustChecked(true);
      setTimeout(() => setJustChecked(false), 250);
    }
    onToggle(!checked);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={checked}
      className={`w-full flex items-center gap-3 py-2 px-1.5 rounded-lg text-left transition-colors hover:bg-[var(--color-surface-muted)] disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? 'opacity-60' : ''
      }`}
    >
      <span
        className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
          checked
            ? 'bg-[var(--color-green-500)] border-[var(--color-green-500)]'
            : 'border-[var(--color-grey-300)] bg-transparent'
        } ${justChecked ? 'animate-check' : ''}`}
      >
        {checked && (
          <svg viewBox="0 0 16 16" width="11" height="11" fill="none">
            <path d="M3 8.5L6.2 11.5L13 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={`flex-1 text-[15px] ${checked ? 'line-through decoration-[var(--color-grey-300)]' : 'text-[var(--color-ink)]'}`}>
        {label}
      </span>
      {meta && <span className="text-sm text-[var(--color-ink-soft)] flex-shrink-0">{meta}</span>}
    </button>
  );
}
