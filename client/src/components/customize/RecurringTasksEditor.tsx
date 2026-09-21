import { useState } from 'react';
import type { FrequencyType, RecurringTask } from '../../types';

function uid() {
  return `rec_${Math.random().toString(36).slice(2, 9)}`;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const FREQUENCIES: { value: FrequencyType; label: string }[] = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Specific weekdays' },
  { value: 'biweekly', label: 'Every 2 weeks (on weekday)' },
  { value: 'everyNDays', label: 'Every N days' },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const blank = (): RecurringTask => ({
  id: uid(),
  label: '',
  category: 'Weekly care',
  frequencyType: 'weekly',
  weekdays: [0],
  intervalDays: null,
  anchorDate: todayStr(),
  enabled: true,
});

export function RecurringTasksEditor({ tasks, onChange }: { tasks: RecurringTask[]; onChange: (tasks: RecurringTask[]) => void }) {
  const [draft, setDraft] = useState<RecurringTask | null>(null);

  function update(id: string, patch: Partial<RecurringTask>) {
    onChange(tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function remove(id: string) {
    onChange(tasks.filter((t) => t.id !== id));
  }

  function toggleWeekday(task: RecurringTask, day: number) {
    const current = task.weekdays || [];
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day].sort();
    update(task.id, { weekdays: next });
  }

  function startAdd() {
    setDraft(blank());
  }

  function saveDraft() {
    if (!draft || !draft.label.trim()) return;
    onChange([...tasks, draft]);
    setDraft(null);
  }

  function renderFrequencyControls(task: RecurringTask, onUpdate: (patch: Partial<RecurringTask>) => void) {
    return (
      <>
        <select
          value={task.frequencyType}
          onChange={(e) => onUpdate({ frequencyType: e.target.value as FrequencyType })}
          className="input py-1"
        >
          {FREQUENCIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        {(task.frequencyType === 'weekly' || task.frequencyType === 'biweekly') && (
          <div className="flex gap-1 flex-wrap">
            {WEEKDAYS.map((w, i) => (
              <button
                key={w}
                onClick={() => toggleWeekday(task, i)}
                className={`w-8 h-8 rounded-full text-xs font-medium ${
                  (task.weekdays || []).includes(i)
                    ? 'bg-[var(--color-green-500)] text-white'
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-ink-soft)]'
                }`}
              >
                {w[0]}
              </button>
            ))}
          </div>
        )}
        {task.frequencyType === 'everyNDays' && (
          <label className="flex items-center gap-2 text-sm">
            Every
            <input
              type="number"
              min={1}
              value={task.intervalDays ?? ''}
              onChange={(e) => onUpdate({ intervalDays: Number(e.target.value) || null })}
              className="input w-16 py-1"
            />
            days, starting
            <input
              type="date"
              value={task.anchorDate ?? ''}
              onChange={(e) => onUpdate({ anchorDate: e.target.value })}
              className="input w-auto py-1"
            />
          </label>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <div key={task.id} className={`rounded-xl border border-[var(--color-border)] p-3 ${!task.enabled ? 'opacity-50' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <input type="checkbox" checked={task.enabled} onChange={() => update(task.id, { enabled: !task.enabled })} />
            <input value={task.label} onChange={(e) => update(task.id, { label: e.target.value })} className="input flex-1 py-1" />
            <input
              value={task.category}
              onChange={(e) => update(task.id, { category: e.target.value })}
              placeholder="Category"
              className="input w-32 py-1"
            />
            <button onClick={() => remove(task.id)} className="w-6 h-6 text-xs text-[var(--color-red-500)] flex-shrink-0">
              ✕
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap pl-6">{renderFrequencyControls(task, (patch) => update(task.id, patch))}</div>
        </div>
      ))}

      {draft ? (
        <div className="rounded-xl border-2 border-dashed border-[var(--color-green-300)] p-3">
          <div className="flex items-center gap-2 mb-2">
            <input
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              placeholder="Task name"
              className="input flex-1 py-1"
              autoFocus
            />
            <input
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              placeholder="Category"
              className="input w-32 py-1"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap pl-1 mb-3">{renderFrequencyControls(draft, (patch) => setDraft({ ...draft, ...patch }))}</div>
          <div className="flex gap-2">
            <button onClick={() => setDraft(null)} className="text-sm px-3 py-1.5 rounded-full border border-[var(--color-border)]">
              Cancel
            </button>
            <button onClick={saveDraft} className="text-sm px-3 py-1.5 rounded-full bg-[var(--color-green-500)] text-white">
              Save task
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={startAdd}
          className="text-sm font-medium px-3 py-1.5 rounded-full bg-[var(--color-green-500)] text-white hover:bg-[var(--color-green-700)] self-start"
        >
          + Add recurring task
        </button>
      )}
    </div>
  );
}
