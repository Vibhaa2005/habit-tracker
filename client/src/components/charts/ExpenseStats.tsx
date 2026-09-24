import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, parseISO, startOfWeek } from 'date-fns';
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

function monthKey(dateStr: string) {
  return dateStr.slice(0, 7); // YYYY-MM
}

// Monday-anchored calendar week, keyed by that Monday's date.
function weekKey(dateStr: string) {
  return format(startOfWeek(parseISO(dateStr), { weekStartsOn: 1 }), 'yyyy-MM-dd');
}

// Every calendar date (1st through the last day) of the month containing `end`.
function datesInMonthOf(end: string) {
  const [y, m] = end.split('-').map(Number);
  const count = new Date(y, m, 0).getDate();
  return Array.from({ length: count }, (_, i) => `${y}-${String(m).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`);
}

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

  const monthTotals = new Map<string, number>();
  for (const d of days) {
    const key = monthKey(d.date);
    monthTotals.set(key, (monthTotals.get(key) || 0) + d.expensesTotal);
  }
  const currentMonthTotal = monthTotals.get(monthKey(end)) || 0;

  const expensesByDate = new Map(days.map((d) => [d.date, d.expensesTotal]));
  const dailyChartData = datesInMonthOf(end).map((date) => ({
    day: format(parseISO(date), 'd'),
    amount: Math.round((expensesByDate.get(date) || 0) * 100) / 100,
  }));

  const weekTotals = new Map<string, number>();
  for (const d of days) {
    const key = weekKey(d.date);
    weekTotals.set(key, (weekTotals.get(key) || 0) + d.expensesTotal);
  }
  const avgWeekly = average([...weekTotals.values()]);

  const reasonLabel = (id: string | null) => (id ? reasons.find((r) => r.id === id)?.label ?? 'Uncategorized' : 'Uncategorized');

  const byReason = new Map<string, number>();
  for (const e of inRange) {
    const label = reasonLabel(e.reasonId);
    byReason.set(label, (byReason.get(label) || 0) + e.amount);
  }
  const pieData = [...byReason.entries()].map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));

  return (
    <CollapsibleCard
      title="Expense statistics"
      icon="💰"
      summary={<span className="text-xs text-[var(--color-ink-soft)]">{currentMonthTotal.toFixed(2)} this month</span>}
    >
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-xs text-[var(--color-ink-soft)]">Monthly total</p>
          <p className="text-lg font-bold text-[var(--color-green-700)]">{currentMonthTotal.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-ink-soft)]">Avg weekly spending</p>
          <p className="text-lg font-bold text-[var(--color-green-700)]">{avgWeekly.toFixed(2)}</p>
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)] mb-2">Daily spending this month</p>
      <div className="h-40 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} width={30} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: "#fff", border: "1px solid #ddd" }} labelStyle={{ color: "#111" }} itemStyle={{ color: "#111" }} />
            <Line type="monotone" dataKey="amount" stroke="var(--color-green-500)" strokeWidth={2} dot={false} />
          </LineChart>
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
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: "#fff", border: "1px solid #ddd" }} labelStyle={{ color: "#111" }} itemStyle={{ color: "#111" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </CollapsibleCard>
  );
}
