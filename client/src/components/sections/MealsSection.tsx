import { SectionCard } from '../ui/SectionCard';
import { CheckRow } from '../ui/CheckRow';
import { useApp } from '../../context/AppContext';

const TARGET_LABELS: Record<'eggs' | 'fruits', string> = {
  eggs: 'Eggs',
  fruits: 'Fruits',
};

export function MealsSection() {
  const { settings, dayResponse, patchDay } = useApp();
  if (!settings || !dayResponse) return null;

  const meals = [...settings.meals].filter((i) => i.enabled).sort((a, b) => a.order - b.order);
  const targets = (['eggs', 'fruits'] as const).filter((k) => settings.foodTargets[k] > 0);

  return (
    <SectionCard title="Meals" icon="🍽️">
      <div className="flex flex-col">
        {meals.map((meal) => (
          <CheckRow
            key={meal.id}
            label={meal.label}
            checked={!!dayResponse.day.meals[meal.id]}
            onToggle={(next) => patchDay({ meals: { [meal.id]: next } }, next ? '✓ Completed' : undefined)}
          />
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
        <p className="text-xs font-semibold tracking-wide uppercase text-[var(--color-ink-soft)] mb-2">
          Daily food targets
        </p>
        <div className="flex flex-col gap-2">
          {targets.map((key) => {
            const target = settings.foodTargets[key];
            const value = dayResponse.day.foodTargets[key] || 0;
            const done = value >= target;
            return (
              <div key={key} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                      done ? 'bg-[var(--color-green-500)] border-[var(--color-green-500)]' : 'border-[var(--color-grey-300)]'
                    }`}
                  >
                    {done && (
                      <svg viewBox="0 0 16 16" width="11" height="11" fill="none">
                        <path d="M3 8.5L6.2 11.5L13 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className={`text-[15px] ${done ? 'opacity-60 line-through decoration-[var(--color-grey-300)]' : ''}`}>
                    {target} {TARGET_LABELS[key]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    aria-label={`Decrease ${TARGET_LABELS[key]}`}
                    onClick={() => patchDay({ foodTargets: { [key]: Math.max(0, value - 1) } })}
                    className="w-7 h-7 rounded-full border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{value}</span>
                  <button
                    aria-label={`Increase ${TARGET_LABELS[key]}`}
                    onClick={() => patchDay({ foodTargets: { [key]: value + 1 } }, !done && value + 1 >= target ? '✓ Completed' : undefined)}
                    className="w-7 h-7 rounded-full border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
          <CheckRow
            label="Nuts/Seeds"
            checked={!!dayResponse.day.foodTargets.nuts}
            onToggle={(next) => patchDay({ foodTargets: { nuts: next } }, next ? '✓ Completed' : undefined)}
          />
        </div>
      </div>
    </SectionCard>
  );
}
