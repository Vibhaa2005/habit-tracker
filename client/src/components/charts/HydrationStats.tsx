import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, parseISO, startOfWeek } from 'date-fns';
import { CollapsibleCard } from '../ui/CollapsibleCard';
import type { StatsDay } from '../../types';
import { average } from '../../lib/statsUtils';

function monthKey(dateStr: string) {
  return dateStr.slice(0, 7); // YYYY-MM
}

// Monday-anchored calendar week, keyed by that Monday's date.
function weekKey(dateStr: string) {
  return format(startOfWeek(parseISO(dateStr), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

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

  const today = days[days.length - 1].date;
  const currentMonthDays = days.filter((d) => monthKey(d.date) === monthKey(today));
  const monthlyAvgPerDay = average(currentMonthDays.map((d) => d.hydration.litersConsumed));

  const weekTotals = new Map<string, number>();
  for (const d of days) {
    const key = weekKey(d.date);
    weekTotals.set(key, (weekTotals.get(key) || 0) + d.hydration.litersConsumed);
  }
  const weeklyAvg = average([...weekTotals.values()]);

  const chartData = days.slice(-30).map((d) => ({
    date: format(parseISO(d.date), 'MMM d'),
    liters: Math.round(d.hydration.litersConsumed * 100) / 100,
  }));

  return (
    <CollapsibleCard
      title="Hydration statistics"
      icon="💧"
      summary={<span className="text-xs text-[var(--color-ink-soft)]">avg {monthlyAvgPerDay.toFixed(2)} L/day</span>}
    >
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <p className="text-xs text-[var(--color-ink-soft)]">Avg water/day (this month)</p>
          <p className="text-lg font-bold text-[var(--color-green-700)]">{monthlyAvgPerDay.toFixed(2)} L</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-ink-soft)]">Weekly avg</p>
          <p className="text-lg font-bold text-[var(--color-green-700)]">{weeklyAvg.toFixed(2)} L</p>
        </div>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} width={30} unit="L" />
            <Tooltip formatter={(v: any) => [`${v} L`, 'Water']} contentStyle={{ fontSize: 12, borderRadius: 8, background: "#fff", border: "1px solid #ddd" }} labelStyle={{ color: "#111" }} itemStyle={{ color: "#111" }} />
            <Bar dataKey="liters" fill="var(--color-green-500)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CollapsibleCard>
  );
}
