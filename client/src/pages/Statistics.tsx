import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import type { ExatestState, StatsResponse } from '../types';
import { SectionCard } from '../components/ui/SectionCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ContributionGrid } from '../components/ContributionGrid';
import { SummaryCard } from '../components/SummaryCard';
import { SleepStats } from '../components/charts/SleepStats';
import { HydrationStats } from '../components/charts/HydrationStats';
import { AcademicStats } from '../components/charts/AcademicStats';
import { RoutineStats } from '../components/charts/RoutineStats';
import { average, formatMinutes, longestStreakAbove, lastNDays } from '../lib/statsUtils';

const RANGES: { key: string; label: string }[] = [
  { key: '1m', label: '1 Month' },
  { key: '3m', label: '3 Months' },
  { key: '6m', label: '6 Months' },
  { key: '1y', label: '1 Year' },
];

export default function Statistics() {
  const [range, setRange] = useState('3m');
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [exatest, setExatest] = useState<ExatestState | null>(null);

  useEffect(() => {
    api.getStats(range).then(setStats);
  }, [range]);

  useEffect(() => {
    api.getExatest().then(setExatest);
  }, []);

  const days = stats?.days ?? [];
  const week = lastNDays(days, 7);
  const month = lastNDays(days, 30);

  const overallAvg = useMemo(() => {
    const sectionKeys = ['morning', 'meals', 'hydration', 'academics', 'night'] as const;
    const out: Record<string, number> = { overall: Math.round(average(days.map((d) => d.overall))) };
    for (const key of sectionKeys) {
      const vals = days.map((d) => d.sections[key]).filter((v): v is number => v != null);
      out[key] = vals.length ? Math.round(average(vals)) : 0;
    }
    return out;
  }, [days]);

  if (!stats) {
    return (
      <div className="space-y-4">
        <div className="h-24 rounded-2xl bg-[var(--color-surface-muted)] animate-pulse" />
        <div className="h-52 rounded-2xl bg-[var(--color-surface-muted)] animate-pulse" />
      </div>
    );
  }

  const fullyDoneCount = (key: 'morning' | 'night') => week.filter((d) => (d.sections[key] ?? 0) >= 100).length;
  const revisionDaysWeek = week.filter((d) => d.academics.revision).length;
  const totalQuestionsMonth = month.reduce(
    (s, d) => s + d.academics.probabilityQuestions + d.academics.leetcodeQuestions + d.academics.codeforcesQuestions,
    0
  );
  const revisionDaysMonth = month.filter((d) => d.academics.revision).length;
  const hydrationValsMonth = month.map((d) => d.sections.hydration).filter((v): v is number => v != null);
  const routineValsMonth = month
    .flatMap((d) => [d.sections.morning, d.sections.night, d.sections.meals, d.sections.movement])
    .filter((v): v is number => v != null);
  const totalTasksMonth = month.reduce((s, d) => s + d.completedItems, 0);
  const bestStreakMonth = longestStreakAbove(month, 70);

  return (
    <div className="space-y-4">
      <header className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
        <h1 className="text-xl font-semibold mb-3">Statistics</h1>
        <div className="flex gap-1.5 flex-wrap">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                range === r.key
                  ? 'bg-[var(--color-green-900)] text-white'
                  : 'bg-[var(--color-surface-muted)] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      <SectionCard title="Consistency" icon="📅">
        <ContributionGrid days={days} />
      </SectionCard>

      <SectionCard title="Overall completion" icon="✅">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-sm text-[var(--color-ink-soft)]">Overall</span>
          <span className="text-2xl font-bold text-[var(--color-green-700)]">{overallAvg.overall}%</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {(['morning', 'meals', 'hydration', 'academics', 'night'] as const).map((key) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1 capitalize">
                <span>{key}</span>
                <span className="font-medium">{overallAvg[key]}%</span>
              </div>
              <ProgressBar value={overallAvg[key]} height={7} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SleepStats days={days} />
      <HydrationStats days={days} />
      <AcademicStats days={days} exatest={exatest} />
      <RoutineStats days={days} />

      <SummaryCard
        title="This week"
        icon="🗓️"
        rows={[
          { label: 'Average completion', value: `${Math.round(average(week.map((d) => d.overall)))}%` },
          { label: 'Morning routine', value: `${fullyDoneCount('morning')} / ${week.length} days` },
          { label: 'Night routine', value: `${fullyDoneCount('night')} / ${week.length} days` },
          { label: 'Revision', value: `${revisionDaysWeek} / ${week.length} days` },
          { label: 'Average sleep', value: formatMinutes(average(week.map((d) => d.sleep.durationMinutes || 0))) },
          { label: 'Probability', value: `${week.reduce((s, d) => s + d.academics.probabilityQuestions, 0)} questions` },
          { label: 'LeetCode', value: `${week.reduce((s, d) => s + d.academics.leetcodeQuestions, 0)} questions` },
          { label: 'Codeforces', value: `${week.reduce((s, d) => s + d.academics.codeforcesQuestions, 0)} questions` },
          { label: 'Water', value: `${average(week.map((d) => d.hydration.litersConsumed)).toFixed(2)} L/day` },
        ]}
      />

      <SummaryCard
        title="This month"
        icon="📆"
        rows={[
          { label: 'Average completion', value: `${Math.round(average(month.map((d) => d.overall)))}%` },
          { label: 'Best consistency streak', value: `${bestStreakMonth} days` },
          { label: 'Average sleep', value: formatMinutes(average(month.map((d) => d.sleep.durationMinutes || 0))) },
          { label: 'Total academic questions', value: `${totalQuestionsMonth}` },
          { label: 'Revision days', value: `${revisionDaysMonth} / ${month.length}` },
          {
            label: 'Hydration consistency',
            value: hydrationValsMonth.length ? `${Math.round(average(hydrationValsMonth))}%` : '—',
          },
          {
            label: 'Routine completion',
            value: routineValsMonth.length ? `${Math.round(average(routineValsMonth))}%` : '—',
          },
          { label: 'Total tasks completed', value: `${totalTasksMonth}` },
        ]}
      />
    </div>
  );
}
