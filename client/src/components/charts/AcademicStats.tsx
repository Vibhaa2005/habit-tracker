import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, parseISO } from 'date-fns';
import { CollapsibleCard } from '../ui/CollapsibleCard';
import type { AcademicCategory, ExatestState, StatsDay } from '../../types';
import { lastNDays } from '../../lib/statsUtils';

export function AcademicStats({
  days,
  exatest,
  categories,
}: {
  days: StatsDay[];
  exatest: ExatestState | null;
  categories: AcademicCategory[];
}) {
  const week = lastNDays(days, 7);
  const enabledCategories = [...categories].filter((c) => c.enabled).sort((a, b) => a.order - b.order);
  const weeklyTotals = enabledCategories.map((cat) => ({
    name: cat.label,
    value: week.reduce((s, d) => s + (d.academics.questionCounts[cat.id] || 0), 0),
  }));

  const revisionDays = days.filter((d) => d.academics.revision).length;
  const revisionPct = days.length > 0 ? Math.round((revisionDays / days.length) * 100) : 0;

  const scoreHistory = (exatest?.history || []).map((h) => ({ date: format(parseISO(h.date), 'MMM d'), score: h.score }));

  return (
    <CollapsibleCard title="Academic statistics" icon="📚">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)] mb-2">
        Questions solved this week
      </p>
      <div className="h-36 mb-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyTotals} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: "#fff", border: "1px solid #ddd" }} labelStyle={{ color: "#111" }} itemStyle={{ color: "#111" }} />
            <Bar dataKey="value" fill="var(--color-green-500)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-xs text-[var(--color-ink-soft)]">Revision completion</p>
          <p className="text-lg font-bold text-[var(--color-green-700)]">
            {revisionPct}% <span className="text-xs font-normal text-[var(--color-ink-soft)]">({revisionDays}/{days.length} days)</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-ink-soft)]">Exatest highest score</p>
          <p className="text-lg font-bold text-[var(--color-green-700)]">{exatest?.highestScore ?? '—'}</p>
        </div>
      </div>

      {scoreHistory.length >= 2 ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)] mb-2">Score progression</p>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10 }} width={28} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: "#fff", border: "1px solid #ddd" }} labelStyle={{ color: "#111" }} itemStyle={{ color: "#111" }} />
                <Line type="monotone" dataKey="score" stroke="var(--color-green-700)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="text-sm text-[var(--color-ink-soft)]">Log a couple of Exatest scores to see your progression.</p>
      )}
    </CollapsibleCard>
  );
}
