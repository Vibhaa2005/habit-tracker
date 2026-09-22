import { SectionCard } from '../ui/SectionCard';
import { ProgressBar } from '../ui/ProgressBar';
import { useApp } from '../../context/AppContext';

const STEP = 0.25; // one click ≈ one glass/cup (250ml)

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function HydrationSection() {
  const { settings, dayResponse, patchDay } = useApp();
  if (!settings || !dayResponse) return null;

  const target = settings.hydration.targetLiters;
  const consumed = dayResponse.day.hydration.litersConsumed || 0;
  const pct = target > 0 ? (consumed / target) * 100 : 0;

  function setConsumed(next: number, toastMessage?: string) {
    patchDay({ hydration: { litersConsumed: round2(Math.max(0, next)) } }, toastMessage);
  }

  return (
    <SectionCard title="Hydration" icon="💧">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl font-semibold">
          {consumed.toFixed(2)} <span className="text-[var(--color-ink-soft)] text-base font-normal">/ {target} L</span>
        </span>
      </div>
      <ProgressBar value={pct} height={8} className="mb-4" color="blue" />
      <div className="flex gap-2">
        <button
          onClick={() => setConsumed(consumed - STEP)}
          disabled={consumed <= 0}
          className="px-3 py-1.5 rounded-full text-sm border border-[var(--color-blue-500)] text-[var(--color-blue-700)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40"
        >
          − 250ml
        </button>
        <button
          onClick={() =>
            setConsumed(consumed + STEP, consumed + STEP >= target ? '💧 Hydration goal reached!' : '✓ Water logged')
          }
          className="px-3 py-1.5 rounded-full text-sm bg-[var(--color-blue-500)] text-white hover:bg-[var(--color-blue-700)]"
        >
          + 250ml
        </button>
      </div>
    </SectionCard>
  );
}
