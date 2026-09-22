import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, parseISO } from 'date-fns';
import { CollapsibleCard } from '../ui/CollapsibleCard';
import type { StatsDay } from '../../types';
import { average } from '../../lib/statsUtils';

export function HydrationStats({ days }: { days: StatsDay[] }) {
  const withData = days.filter((d) => d.hydration.litersConsumed > 0);
  if (withData.length === 0) {
    return (
      <CollapsibleCard title="Hydration statistics" icon="💧">
        <p className="text-sm text-[var(--color-ink-soft)] py-4 text-center">
          No hydration data yet. Log some water to see your trends.
        </p>
      </CollapsibleCard>
    );
  }

  const avgWater = average(days.map((d) => d.hydration.litersConsumed));
  const hydrationCompletionDays = days.filter((d) => d.sections.hydration != null);
  const hydrationCompletion = average(hydrationCompletionDays.map((d) => d.sections.hydration || 0));

  const chartData = days.slice(-30).map((d) => ({
    date: format(parseISO(d.date), 'MMM d'),
    liters: Math.round(d.hydration.litersConsumed * 100) / 100,
  }));

  return (
    <CollapsibleCard
      title="Hydration statistics"
      icon="💧"
      summary={<span className="text-xs text-[var(--color-ink-soft)]">avg {avgWater.toFixed(2)} L</span>}
    >
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <p className="text-xs text-[var(--color-ink-soft)]">Avg water/day</p>
          <p className="text-lg font-bold text-[var(--color-green-700)]">{avgWater.toFixed(2)} L</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-ink-soft)]">Completion</p>
          <p className="text-lg font-bold">{Math.round(hydrationCompletion)}%</p>
        </div>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} width={30} unit="L" />
            <Tooltip formatter={(v: any) => [`${v} L`, 'Water']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="liters" fill="var(--color-green-500)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CollapsibleCard>
  );
}
