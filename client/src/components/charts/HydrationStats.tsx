import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, parseISO } from 'date-fns';
import { CollapsibleCard } from '../ui/CollapsibleCard';
import type { StatsDay } from '../../types';
import { average } from '../../lib/statsUtils';

// Every calendar date (1st through the last day) of the month containing `end`.
function datesInMonthOf(end: string) {
  const [y, m] = end.split('-').map(Number);
  const count = new Date(y, m, 0).getDate();
  return Array.from({ length: count }, (_, i) => `${y}-${String(m).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`);
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

  // Averages use rolling windows (last 30 / last 7 days) so they stay based
  // on a full, consistent sample size regardless of where "today" falls in
  // the calendar — no dip in the number right after a week/month resets.
  const monthlyAvgPerDay = average(days.slice(-30).map((d) => d.hydration.litersConsumed));
  const weeklyAvg = days.slice(-7).reduce((s, d) => s + d.hydration.litersConsumed, 0);

  // The chart itself stays calendar-based: every day of the current month.
  const litersByDate = new Map(days.map((d) => [d.date, d.hydration.litersConsumed]));
  const chartData = datesInMonthOf(today).map((date) => ({
    date: format(parseISO(date), 'MMM d'),
    liters: Math.round((litersByDate.get(date) || 0) * 100) / 100,
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
