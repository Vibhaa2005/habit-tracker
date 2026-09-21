import { SectionCard } from '../ui/SectionCard';
import { ProgressBar } from '../ui/ProgressBar';
import type { StatsDay } from '../../types';
import { average } from '../../lib/statsUtils';

const LABELS: Record<keyof StatsDay['sections'], string> = {
  morning: 'Morning routine',
  night: 'Night routine',
  meals: 'Meals',
  hydration: 'Hydration',
  movement: 'Movement',
  academics: 'Academics',
  recurring: 'Personal-care tasks',
};

export function RoutineStats({ days }: { days: StatsDay[] }) {
  const keys = Object.keys(LABELS) as (keyof StatsDay['sections'])[];
  const rows: { key: string; label: string; pct: number }[] = [];
  for (const key of keys) {
    const values = days.map((d) => d.sections[key]).filter((v): v is number => v != null);
    if (values.length === 0) continue;
    rows.push({ key, label: LABELS[key], pct: Math.round(average(values)) });
  }

  if (rows.length === 0) {
    return (
      <SectionCard title="Routine statistics" icon="🗂️">
        <p className="text-sm text-[var(--color-ink-soft)] py-4 text-center">Keep tracking for a few days to unlock your trends.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Routine statistics" icon="🗂️">
      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <div key={r.key}>
            <div className="flex justify-between text-sm mb-1">
              <span>{r.label}</span>
              <span className="font-medium">{r.pct}%</span>
            </div>
            <ProgressBar value={r.pct} height={7} />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
