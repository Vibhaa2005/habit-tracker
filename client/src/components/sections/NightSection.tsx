import { SectionCard } from '../ui/SectionCard';
import { CheckRow } from '../ui/CheckRow';
import { useApp } from '../../context/AppContext';

export function NightSection() {
  const { settings, dayResponse, patchDay } = useApp();
  if (!settings || !dayResponse) return null;

  const items = [...settings.nightRoutine].filter((i) => i.enabled).sort((a, b) => a.order - b.order);
  if (items.length === 0) return null;

  return (
    <SectionCard title="Night" icon="🌙">
      <div className="flex flex-col">
        {items.map((item) => (
          <CheckRow
            key={item.id}
            label={item.label}
            checked={!!dayResponse.day.night[item.id]}
            onToggle={(next) => patchDay({ night: { [item.id]: next } }, next ? '✓ Completed' : undefined)}
          />
        ))}
      </div>
    </SectionCard>
  );
}
