import { SectionCard } from '../ui/SectionCard';
import { CheckRow } from '../ui/CheckRow';
import { useApp } from '../../context/AppContext';

export function MorningSection() {
  const { settings, dayResponse, patchDay } = useApp();
  if (!settings || !dayResponse) return null;

  const items = [...settings.morningRoutine].filter((i) => i.enabled).sort((a, b) => a.order - b.order);
  if (items.length === 0) return null;

  return (
    <SectionCard title="Morning" icon="🌅">
      <div className="flex flex-col">
        {items.map((item) => (
          <CheckRow
            key={item.id}
            label={item.label}
            checked={!!dayResponse.day.morning[item.id]}
            meta={item.id === 'wakeUp' ? formatTime(settings.wakeUpTime) : undefined}
            onToggle={(next) =>
              patchDay({ morning: { [item.id]: next } }, next ? '✓ Completed' : undefined)
            }
          />
        ))}
      </div>
    </SectionCard>
  );
}

function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}
