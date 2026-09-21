import { ProgressBar } from './ProgressBar';

interface DailyCounterProps {
  emoji: string;
  label: string;
  value: number;
  target?: number;
  unit?: string;
  onChange: (next: number) => void;
}

export function DailyCounter({ emoji, label, value, target, unit = 'questions', onChange }: DailyCounterProps) {
  const done = target ? value >= target : false;
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span>{emoji}</span>
          <span className="font-medium text-[15px]">{label}</span>
          {done && <span className="text-xs text-[var(--color-green-700)]">✓ target hit</span>}
        </div>
        <p className="text-sm text-[var(--color-ink-soft)] mt-0.5">
          {value} {unit} today{target ? ` · target ${target}` : ''}
        </p>
        {target ? <ProgressBar value={(value / target) * 100} className="mt-1.5" height={6} /> : null}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-7 h-7 rounded-full border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-medium">{value}</span>
        <button
          aria-label={`Increase ${label}`}
          onClick={() => onChange(value + 1)}
          className="w-7 h-7 rounded-full border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]"
        >
          +
        </button>
      </div>
    </div>
  );
}
