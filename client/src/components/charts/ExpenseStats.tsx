import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, parseISO } from 'date-fns';
import { CollapsibleCard } from '../ui/CollapsibleCard';
import type { Expense, RoutineItem, StatsDay } from '../../types';
import { average } from '../../lib/statsUtils';

const PIE_COLORS = [
  'var(--color-green-500)',
  'var(--color-blue-500)',
  'var(--color-amber-500)',
  'var(--color-red-500)',
  'var(--color-green-300)',
  'var(--color-heat-4)',
  'var(--color-heat-2)',
];

export function ExpenseStats({
  days,
  expenses,
  reasons,
  start,
  end,
}: {
  days: StatsDay[];
  expenses: Expense[];
  reasons: RoutineItem[];
  start: string;
  end: string;
}) {
  const inRange = expenses.filter((e) => e.date >= start && e.date <= end);

  if (inRange.length === 0) {
    return (
      <CollapsibleCard title="Expense statistics" icon="💰">
        <p className="text-sm text-[var(--color-ink-soft)] py-4 text-center">
          No expenses logged in this range yet. Add some on the Expenses page to see your trends.
        </p>
      </CollapsibleCard>
    );
  }

  const total = inRange.reduce((s, e) => s + e.amount, 0);
  const avgPerDay = average(days.map((d) => d.expensesTotal));

  const chartData = days.slice(-30).map((d) => ({
    date: format(parseISO(d.date), 'MMM d'),
    amount: Math.round(d.expensesTotal * 100) / 100,
  }));

  const reasonLabel = (id: string | null) => (id ? reasons.find((r) => r.id === id)?.label ?? 'Uncategorized' : 'Uncategorized');

  const byReason = new Map<string, number>();
  for (const e of inRange) {
    const label = reasonLabel(e.reasonId);
    byReason.set(label, (byReason.get(label) || 0) + e.amount);
  }
  const pieData = [...byReason.entries()].map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));

  return (
    <CollapsibleCard title="Expense statistics" icon="💰" summary={<span className="text-xs text-[var(--color-ink-soft)]">{total.toFixed(2)} in range</span>}>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-xs text-[var(--color-ink-soft)]">Total in range</p>
          <p className="text-lg font-bold text-[var(--color-green-700)]">{total.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-ink-soft)]">Avg per day</p>
          <p className="text-lg font-bold text-[var(--color-green-700)]">{avgPerDay.toFixed(2)}</p>
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)] mb-2">Spending over time</p>
      <div className="h-40 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} width={30} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Bar dataKey="amount" fill="var(--color-green-500)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)] mb-2">By category</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={(d) => d.name}>
              {pieData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </CollapsibleCard>
  );
}
