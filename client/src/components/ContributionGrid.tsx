import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import type { StatsDay } from '../types';

const WEEKDAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function levelFor(pct: number) {
  if (pct <= 0) return 0;
  if (pct <= 25) return 1;
  if (pct <= 50) return 2;
  if (pct <= 75) return 3;
  if (pct < 100) return 4;
  return 5;
}

const LEVEL_COLORS = [
  'var(--color-grey-100)',
  'var(--color-green-100)',
  'var(--color-green-300)',
  'var(--color-green-500)',
  'var(--color-green-700)',
  'var(--color-green-900)',
];

export function ContributionGrid({ days, onSelectDate }: { days: StatsDay[]; onSelectDate?: (date: string) => void }) {
  const [selected, setSelected] = useState<StatsDay | null>(null);
  if (days.length === 0) return <p className="text-sm text-[var(--color-ink-soft)]">No data yet.</p>;

  const firstWeekday = parseISO(days[0].date).getDay(); // 0=Sun
  const padded: (StatsDay | null)[] = [...Array(firstWeekday).fill(null), ...days];

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2">
          <div
            className="grid gap-[3px] flex-shrink-0 pt-[3px]"
            style={{ gridTemplateRows: 'repeat(7, 12px)', gridAutoFlow: 'row' }}
          >
            {WEEKDAY_LABELS.map((l, i) => (
              <span key={i} className="text-[10px] leading-3 text-[var(--color-ink-soft)] h-3">
                {l}
              </span>
            ))}
          </div>
          <div
            className="grid gap-[3px]"
            style={{ gridTemplateRows: 'repeat(7, 12px)', gridAutoFlow: 'column', gridAutoColumns: '12px' }}
          >
            {padded.map((cell, i) =>
              cell ? (
                <button
                  key={cell.date}
                  title={`${format(parseISO(cell.date), 'MMM d')} · ${cell.overall}%`}
                  onClick={() => {
                    setSelected(cell);
                    onSelectDate?.(cell.date);
                  }}
                  className="w-3 h-3 rounded-[3px] hover:ring-2 hover:ring-[var(--color-green-500)] transition-shadow"
                  style={{ backgroundColor: LEVEL_COLORS[levelFor(cell.overall)] }}
                />
              ) : (
                <span key={`pad-${i}`} className="w-3 h-3" />
              )
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-[10px] text-[var(--color-ink-soft)]">Less</span>
        {LEVEL_COLORS.map((c, i) => (
          <span key={i} className="w-3 h-3 rounded-[3px]" style={{ backgroundColor: c }} />
        ))}
        <span className="text-[10px] text-[var(--color-ink-soft)]">More</span>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-[var(--color-surface)] rounded-2xl w-full max-w-xs p-5 animate-pop" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg mb-1">{format(parseISO(selected.date), 'MMMM d')}</h3>
            <p className="text-3xl font-bold text-[var(--color-green-700)] mb-3">{selected.overall}%</p>
            <dl className="text-sm space-y-1.5 text-[var(--color-ink-soft)]">
              <div className="flex justify-between">
                <dt>Completed</dt>
                <dd className="text-[var(--color-ink)] font-medium">
                  {selected.completedItems} / {selected.totalItems} tasks
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Sleep</dt>
                <dd className="text-[var(--color-ink)] font-medium">
                  {selected.sleep.durationMinutes != null
                    ? `${Math.floor(selected.sleep.durationMinutes / 60)}h ${selected.sleep.durationMinutes % 60}m`
                    : '—'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Water</dt>
                <dd className="text-[var(--color-ink)] font-medium">{(selected.hydration.waterMl / 1000).toFixed(2)} L</dd>
              </div>
              <div className="flex justify-between">
                <dt>Academic</dt>
                <dd className="text-[var(--color-ink)] font-medium">
                  {selected.academics.probabilityQuestions + selected.academics.leetcodeQuestions + selected.academics.codeforcesQuestions} activities
                </dd>
              </div>
            </dl>
            <button
              onClick={() => setSelected(null)}
              className="mt-4 w-full py-2 rounded-xl border border-[var(--color-border)] text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
