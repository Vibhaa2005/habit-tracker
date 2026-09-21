import { useMemo } from 'react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DateNav } from '../components/DateNav';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SectionCard } from '../components/ui/SectionCard';
import { MorningSection } from '../components/sections/MorningSection';
import { MealsSection } from '../components/sections/MealsSection';
import { HydrationSection } from '../components/sections/HydrationSection';
import { MovementSection } from '../components/sections/MovementSection';
import { WeeklyCareSection } from '../components/sections/WeeklyCareSection';
import { NightSection } from '../components/sections/NightSection';
import { SleepSection } from '../components/sections/SleepSection';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning 🌱';
  if (h < 17) return 'Good afternoon ☀️';
  return 'Good evening 🌙';
}

export default function Dashboard() {
  const { selectedDate, dayResponse, assignments, achievements, loading } = useApp();
  const date = parseISO(selectedDate);
  const today = isToday(date);

  const upcoming = useMemo(
    () =>
      assignments
        .filter((a) => a.status !== 'Completed')
        .sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''))
        .slice(0, 3),
    [assignments]
  );

  const unlockedRecent = achievements.filter((a) => a.unlocked).slice(-4);

  if (loading || !dayResponse) {
    return (
      <div className="space-y-4">
        <div className="h-24 rounded-2xl bg-[var(--color-surface-muted)] animate-pulse" />
        <div className="h-40 rounded-2xl bg-[var(--color-surface-muted)] animate-pulse" />
        <div className="h-40 rounded-2xl bg-[var(--color-surface-muted)] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold">{today ? greeting() : 'Reviewing a day'}</h1>
            <p className="text-sm text-[var(--color-ink-soft)] mt-0.5">{format(date, 'EEEE, MMMM d')}</p>
          </div>
          <DateNav />
        </div>
        <div className="mt-4">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-xs font-semibold tracking-wide uppercase text-[var(--color-ink-soft)]">
              {today ? 'Today' : format(date, 'MMM d')}
            </span>
            <span className="text-2xl font-bold text-[var(--color-green-700)]">{dayResponse.completion.overall}%</span>
          </div>
          <ProgressBar value={dayResponse.completion.overall} height={10} />
          <p className="text-xs text-[var(--color-ink-soft)] mt-1.5">
            {dayResponse.completion.completedItems} / {dayResponse.completion.totalItems} tasks complete
          </p>
        </div>
      </header>

      {unlockedRecent.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {unlockedRecent.map((a) => (
            <div
              key={a.id}
              title={a.description}
              className="flex-shrink-0 flex items-center gap-1.5 bg-[var(--color-green-50)] text-[var(--color-green-900)] text-xs font-medium px-3 py-1.5 rounded-full"
            >
              <span>{a.emoji}</span>
              {a.title}
            </div>
          ))}
        </div>
      )}

      <MorningSection />
      <MealsSection />
      <HydrationSection />
      <MovementSection />
      <WeeklyCareSection />

      <SectionCard
        title="Academics"
        icon="📚"
        right={
          <Link to="/academics" className="text-xs font-medium text-[var(--color-green-700)] hover:underline">
            View all →
          </Link>
        }
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm">Revision completed</span>
          <span className={`text-sm font-medium ${dayResponse.day.academics.revision ? 'text-[var(--color-green-700)]' : 'text-[var(--color-ink-soft)]'}`}>
            {dayResponse.day.academics.revision ? '✓ Done' : 'Not yet'}
          </span>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-soft)]">No upcoming assignments. You're all caught up.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {upcoming.map((a) => {
              const overdue = a.deadline && isPast(parseISO(a.deadline)) && a.status !== 'Completed';
              return (
                <li key={a.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{a.name}</span>
                  <span className={overdue ? 'text-[var(--color-red-500)] font-medium' : 'text-[var(--color-ink-soft)]'}>
                    {a.deadline ? format(parseISO(a.deadline), 'MMM d') : 'No date'}
                    {overdue ? ' · overdue' : ''}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      <NightSection />
      <SleepSection />
    </div>
  );
}
