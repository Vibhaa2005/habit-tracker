import { SectionCard } from '../ui/SectionCard';
import { CheckRow } from '../ui/CheckRow';
import { useApp } from '../../context/AppContext';

// Academics-category recurring tasks (e.g. "Weekly revision") are shown in
// the Academics page's Revision card instead of this general household card.
export function WeeklyCareSection() {
  const { dayResponse, patchDay } = useApp();
  if (!dayResponse) return null;

  const tasks = dayResponse.dueRecurring.filter((t) => t.category !== 'Academics');
  if (tasks.length === 0) return null;

  return (
    <SectionCard title="Weekly care" icon="🧺">
      <div className="flex flex-col">
        {tasks.map((task) => (
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
