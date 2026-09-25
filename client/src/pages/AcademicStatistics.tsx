import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SectionCard } from '../components/ui/SectionCard';
import { useApp, todayStr } from '../context/AppContext';
import { api } from '../api';
import type { ExatestState, StatsResponse } from '../types';
import { average } from '../lib/statsUtils';

const CATEGORY_EMOJI: Record<string, string> = {
  probability: '🎲',
  leetcode: '💻',
  codeforces: '⚔️',
};

const LINE_COLORS = [
  'var(--color-green-500)',
  'var(--color-blue-500)',
  'var(--color-amber-500)',
  'var(--color-red-500)',
  'var(--color-green-700)',
];

const RANGES: { key: string; label: string }[] = [
  { key: '1m', label: '1 Month' },
  { key: '3m', label: '3 Months' },
  { key: '6m', label: '6 Months' },
  { key: '1y', label: '1 Year' },
];

const tooltipStyle = {
  contentStyle: { fontSize: 12, borderRadius: 8, background: '#fff', border: '1px solid #ddd' },
  labelStyle: { color: '#111' },
  itemStyle: { color: '#111' },
};

export default function AcademicStatistics() {
  const { settings } = useApp();
  const [range, setRange] = useState('3m');
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [exatest, setExatest] = useState<ExatestState | null>(null);

  useEffect(() => {
    api.getStats(range, todayStr()).then(setStats);
  }, [range]);

  useEffect(() => {
    api.getExatest().then(setExatest);
  }, []);

  if (!settings) return null;

  const days = stats?.days ?? [];
  const categories = [...settings.academicCategories].filter((c) => c.enabled).sort((a, b) => a.order - b.order);

  const revisionDays = days.filter((d) => d.academics.revision).length;
  const revisionPct = days.length > 0 ? Math.round((revisionDays / days.length) * 100) : 0;

  const scoreHistory = (exatest?.history || []).map((h) => ({ date: format(parseISO(h.date), 'MMM d'), score: h.score }));

  return (
    <div className="space-y-4">
      <header className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
        <Link to="/academics" className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
          ← Back to Academics
        </Link>
        <h1 className="text-xl font-semibold mt-2">Academic statistics</h1>
        <div className="flex gap-1.5 flex-wrap mt-3">
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

      {!stats ? (
        <div className="h-40 rounded-2xl bg-[var(--color-surface-muted)] animate-pulse" />
      ) : (
        <>
          <SectionCard title="Revision" icon="📖">
            <p className="text-xs text-[var(--color-ink-soft)]">Completion</p>
            <p className="text-2xl font-bold text-[var(--color-green-700)]">
              {revisionPct}% <span className="text-sm font-normal text-[var(--color-ink-soft)]">({revisionDays}/{days.length} days)</span>
            </p>
          </SectionCard>

          <SectionCard title="Exatest" icon="🎯">
            <p className="text-xs text-[var(--color-ink-soft)] mb-2">Highest score</p>
            <p className="text-2xl font-bold text-[var(--color-green-700)] mb-4">{exatest?.highestScore ?? '—'}</p>
            {scoreHistory.length >= 2 ? (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} width={28} />
                    <Tooltip {...tooltipStyle} />
                    <Line type="monotone" dataKey="score" stroke="var(--color-green-700)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-[var(--color-ink-soft)]">Log a couple of Exatest scores to see your progression.</p>
            )}
          </SectionCard>

          {categories.map((cat, i) => {
            const chartData = days.map((d) => ({
              date: format(parseISO(d.date), 'MMM d'),
              count: d.academics.questionCounts[cat.id] || 0,
            }));
            const total = chartData.reduce((s, d) => s + d.count, 0);
            const dailyAvg = average(chartData.map((d) => d.count));

            return (
              <SectionCard key={cat.id} title={cat.label} icon={CATEGORY_EMOJI[cat.id] || '📝'}>
                {total === 0 ? (
                  <p className="text-sm text-[var(--color-ink-soft)] py-4 text-center">
                    No {cat.label} questions logged in this range yet.
                  </p>
                ) : (
                  <>
                    <div className="flex items-baseline justify-between mb-3">
                      <span className="text-xs text-[var(--color-ink-soft)]">Daily average</span>
                      <span className="text-xl font-bold text-[var(--color-green-700)]">{dailyAvg.toFixed(2)} / day</span>
                    </div>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                          <YAxis tick={{ fontSize: 10 }} width={28} allowDecimals={false} />
                          <Tooltip {...tooltipStyle} />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke={LINE_COLORS[i % LINE_COLORS.length]}
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </SectionCard>
            );
          })}
        </>
      )}
    </div>
  );
}
