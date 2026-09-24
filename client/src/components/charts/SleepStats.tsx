import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, parseISO } from 'date-fns';
import { CollapsibleCard } from '../ui/CollapsibleCard';
import type { StatsDay } from '../../types';
import { average, formatMinutes, timeConsistency, daysWithSleep } from '../../lib/statsUtils';

function toMinutesOfDay(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m;
  return total < 12 * 60 ? total + 24 * 60 : total; // normalize so late-night times sort sensibly
}

function minutesToClock(mins: number) {
  const norm = ((mins % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(norm / 60);
  const m = Math.round(norm % 60);
  const period = h % 24 >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function SleepStats({ days }: { days: StatsDay[] }) {
  const tracked = daysWithSleep(days);

  if (tracked.length < 2) {
    return (
      <CollapsibleCard title="Sleep statistics" icon="😴">
        <p className="text-sm text-[var(--color-ink-soft)] py-4 text-center">
          Track your sleep for a few more days to see your trends.
        </p>
      </CollapsibleCard>
    );
  }

  const recent = tracked.slice(-30);
  const durationData = recent.map((d) => ({
    date: format(parseISO(d.date), 'MMM d'),
    hours: Math.round(((d.sleep.durationMinutes || 0) / 60) * 10) / 10,
  }));

  const bedtimeData = recent.filter((d) => d.sleep.bedtime).map((d) => ({
    date: format(parseISO(d.date), 'MMM d'),
    minutes: toMinutesOfDay(d.sleep.bedtime as string),
  }));
  const wakeData = recent.filter((d) => d.sleep.wakeTime).map((d) => ({
    date: format(parseISO(d.date), 'MMM d'),
    minutes: toMinutesOfDay(d.sleep.wakeTime as string),
  }));

  const avgDuration = average(tracked.map((d) => d.sleep.durationMinutes || 0));
  const bedtimeConsistency = timeConsistency(tracked.filter((d) => d.sleep.bedtime).map((d) => d.sleep.bedtime as string));

  return (
    <CollapsibleCard title="Sleep statistics" icon="😴" summary={<span className="text-xs text-[var(--color-ink-soft)]">avg {formatMinutes(avgDuration)}</span>}>
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-xs text-[var(--color-ink-soft)]">Average sleep</p>
          <p className="text-xl font-bold text-[var(--color-green-700)]">{formatMinutes(avgDuration)}</p>
        </div>
        <div>
          <p className="text-xs text-[var(--color-ink-soft)]">Bedtime consistency</p>
          <p className="text-xl font-bold">{bedtimeConsistency != null ? `± ${Math.round(bedtimeConsistency)} min` : '—'}</p>
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)] mb-2">Sleep duration</p>
      <div className="h-40 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={durationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} width={28} unit="h" />
            <Tooltip formatter={(v: any) => [`${v}h`, 'Sleep']} contentStyle={{ fontSize: 12, borderRadius: 8, background: "#fff", border: "1px solid #ddd" }} labelStyle={{ color: "#111" }} itemStyle={{ color: "#111" }} />
            <Bar dataKey="hours" fill="var(--color-green-500)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)] mb-2">Bedtime trend</p>
      <div className="h-32 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={bedtimeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} width={40} tickFormatter={minutesToClock} domain={['dataMin - 30', 'dataMax + 30']} />
            <Tooltip formatter={(v: any) => [minutesToClock(v), 'Bedtime']} contentStyle={{ fontSize: 12, borderRadius: 8, background: "#fff", border: "1px solid #ddd" }} labelStyle={{ color: "#111" }} itemStyle={{ color: "#111" }} />
            <Line type="monotone" dataKey="minutes" stroke="var(--color-green-700)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)] mb-2">Wake-time trend</p>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={wakeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} width={40} tickFormatter={minutesToClock} domain={['dataMin - 30', 'dataMax + 30']} />
            <Tooltip formatter={(v: any) => [minutesToClock(v), 'Wake time']} contentStyle={{ fontSize: 12, borderRadius: 8, background: "#fff", border: "1px solid #ddd" }} labelStyle={{ color: "#111" }} itemStyle={{ color: "#111" }} />
            <Line type="monotone" dataKey="minutes" stroke="var(--color-amber-500)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CollapsibleCard>
  );
}
