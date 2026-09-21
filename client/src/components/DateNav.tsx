import { format, parseISO, isToday } from 'date-fns';
import { useApp } from '../context/AppContext';

export function DateNav() {
  const { selectedDate, shiftDate, goToday } = useApp();
  const date = parseISO(selectedDate);
  const today = isToday(date);

  return (
    <div className="flex items-center gap-2">
      <button
        aria-label="Previous day"
        onClick={() => shiftDate(-1)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]"
      >
        ←
      </button>
      <div className="text-sm font-medium min-w-[9rem] text-center">
        {today ? 'Today' : format(date, 'EEE, MMM d')}
      </div>
      <button
        aria-label="Next day"
        onClick={() => shiftDate(1)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]"
      >
        →
      </button>
      {!today && (
        <button
          onClick={goToday}
          className="ml-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
        >
          Today
        </button>
      )}
    </div>
  );
}
