import { SectionCard } from '../ui/SectionCard';
import { CheckRow } from '../ui/CheckRow';
import { useApp } from '../../context/AppContext';

export function WeeklyCareSection() {
  const { dayResponse, patchDay } = useApp();
  if (!dayResponse || dayResponse.dueRecurring.length === 0) return null;

  return (
    <SectionCard title="Weekly care" icon="🧺">
      <div className="flex flex-col">
        {dayResponse.dueRecurring.map((task) => (
          <CheckRow
            key={task.id}
            label={task.label}
            checked={!!dayResponse.day.recurringTasks[task.id]}
            onToggle={(next) =>
              patchDay({ recurringTasks: { [task.id]: next } }, next ? '✓ Completed' : undefined)
            }
          />
        ))}
      </div>
    </SectionCard>
  );
}
