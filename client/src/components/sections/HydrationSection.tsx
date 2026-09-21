import { SectionCard } from '../ui/SectionCard';
import { useApp } from '../../context/AppContext';

export function HydrationSection() {
  const { settings, dayResponse, patchDay } = useApp();
  if (!settings || !dayResponse) return null;

  const target = settings.hydration.bottlesPerDay;
  const consumed = dayResponse.day.hydration.bottlesConsumed || 0;
  const liters = ((consumed * settings.hydration.bottleSizeMl) / 1000).toFixed(2);
  const dotCount = Math.max(target, consumed);

  return (
    <SectionCard title="Hydration" icon="💧">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl font-semibold">
          {consumed} <span className="text-[var(--color-ink-soft)] text-base font-normal">/ {target} bottles</span>
        </span>
        <span className="text-sm text-[var(--color-ink-soft)]">{liters} L</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {Array.from({ length: dotCount }).map((_, i) => (
          <span
            key={i}
            className={`w-4 h-4 rounded-full ${i < consumed ? 'bg-[var(--color-green-500)]' : 'bg-[var(--color-grey-100)] border border-[var(--color-grey-300)]'}`}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => patchDay({ hydration: { bottlesConsumed: Math.max(0, consumed - 1) } })}
          disabled={consumed === 0}
          className="px-3 py-1.5 rounded-full text-sm border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40"
        >
          − Bottle
        </button>
        <button
          onClick={() =>
            patchDay(
              { hydration: { bottlesConsumed: consumed + 1 } },
              consumed + 1 >= target ? '💧 Hydration goal reached!' : '✓ Bottle logged'
            )
          }
          className="px-3 py-1.5 rounded-full text-sm bg-[var(--color-green-500)] text-white hover:bg-[var(--color-green-700)]"
        >
          + Bottle
        </button>
      </div>
    </SectionCard>
  );
}
