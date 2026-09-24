import { SectionCard } from '../ui/SectionCard';
import { useApp } from '../../context/AppContext';

function formatMinutes(mins: number | null) {
  if (mins == null) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export function SleepSection() {
  const { dayResponse, patchDay } = useApp();
  if (!dayResponse) return null;
  const { sleep } = dayResponse.day;

  return (
    <SectionCard title="Sleep" icon="😴">
      <div className="grid grid-cols-3 gap-3 items-end">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-ink-soft)]">Yesterday's bedtime</span>
          <input
            type="time"
            value={sleep.bedtime ?? ''}
            onChange={(e) => patchDay({ sleep: { bedtime: e.target.value || null } })}
            className="border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-sm bg-[var(--color-surface)]"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-ink-soft)]">Today's wake time</span>
          <input
            type="time"
            value={sleep.wakeTime ?? ''}
            onChange={(e) => patchDay({ sleep: { wakeTime: e.target.value || null } })}
            className="border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-sm bg-[var(--color-surface)]"
          />
        </label>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--color-ink-soft)]">Duration</span>
          <span className="font-semibold text-[15px]">{formatMinutes(sleep.durationMinutes)}</span>
        </div>
      </div>
    </SectionCard>
  );
}
