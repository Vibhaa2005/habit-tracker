import { format, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';
import { DateNav } from '../components/DateNav';
import { ProgressBar } from '../components/ui/ProgressBar';
import { MorningSection } from '../components/sections/MorningSection';
import { MealsSection } from '../components/sections/MealsSection';
import { HydrationSection } from '../components/sections/HydrationSection';
import { MovementSection } from '../components/sections/MovementSection';
import { WeeklyCareSection } from '../components/sections/WeeklyCareSection';
import { NightSection } from '../components/sections/NightSection';
import { SleepSection } from '../components/sections/SleepSection';

export default function Routine() {
  const { selectedDate, dayResponse, loading } = useApp();
  const date = parseISO(selectedDate);

  return (
    <div className="space-y-4">
      <header className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold">Routine</h1>
            <p className="text-sm text-[var(--color-ink-soft)] mt-0.5">{format(date, 'EEEE, MMMM d')}</p>
          </div>
          <DateNav />
        </div>
        {dayResponse && (
          <div className="mt-3">
            <ProgressBar value={dayResponse.completion.overall} height={8} />
          </div>
        )}
      </header>

      {loading || !dayResponse ? (
        <div className="h-40 rounded-2xl bg-[var(--color-surface-muted)] animate-pulse" />
      ) : (
        <>
          <MorningSection />
          <MealsSection />
          <HydrationSection />
          <MovementSection />
          <WeeklyCareSection />
          <NightSection />
          <SleepSection />
        </>
      )}
    </div>
  );
}
