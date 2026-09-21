import { SectionCard } from '../ui/SectionCard';
import { CheckRow } from '../ui/CheckRow';
import { useApp } from '../../context/AppContext';

export function MovementSection() {
  const { settings, dayResponse, patchDay } = useApp();
  if (!settings || !dayResponse) return null;

  const items = [...settings.movement].filter((i) => i.enabled).sort((a, b) => a.order - b.order);
  if (items.length === 0) return null;

  return (
    <SectionCard title="Movement" icon="🚶">
      <div className="flex flex-col">
        {items.map((item) => {
          const checked = !!dayResponse.day.movement[item.id];
          const duration = dayResponse.day.movementDurations[item.id];
          return (
            <div key={item.id} className="flex items-center gap-2">
              <div className="flex-1">
                <CheckRow
                  label={item.label}
                  checked={checked}
                  onToggle={(next) => patchDay({ movement: { [item.id]: next } }, next ? '✓ Completed' : undefined)}
                />
              </div>
              {item.trackDuration && checked && (
                <input
                  type="number"
                  min={0}
                  placeholder="min"
                  aria-label={`${item.label} duration in minutes`}
                  defaultValue={duration ?? ''}
                  onBlur={(e) => {
                    const val = e.target.value === '' ? undefined : Number(e.target.value);
                    patchDay({ movementDurations: { [item.id]: val } });
                  }}
                  className="w-16 text-sm text-center border border-[var(--color-border)] rounded-lg py-1 bg-[var(--color-surface)]"
                />
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
