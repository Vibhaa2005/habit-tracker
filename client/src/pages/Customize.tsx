import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { SectionCard } from '../components/ui/SectionCard';
import { RoutineListEditor } from '../components/customize/RoutineListEditor';
import { RecurringTasksEditor } from '../components/customize/RecurringTasksEditor';
import { AcademicCategoriesEditor } from '../components/customize/AcademicCategoriesEditor';
import type { Settings } from '../types';

export default function Customize() {
  const { settings, saveSettings, pushToast } = useApp();
  const [draft, setDraft] = useState<Settings | null>(settings);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const draftRef = useRef<Settings | null>(settings);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Adopt settings loaded from the server, but never clobber an edit that's
  // still pending a debounced save.
  useEffect(() => {
    if (settings && !timerRef.current) {
      setDraft(settings);
      draftRef.current = settings;
    }
  }, [settings]);

  if (!draft) return null;

  // Updates the on-screen draft immediately (so typing/toggling always feels
  // instant) and debounces the actual network save — saving on every single
  // keystroke caused rapid edits to race and clobber each other, which made
  // text fields (like a recurring task's name) appear to not keep what you
  // typed.
  function persist(patch: Partial<Settings>, key: string) {
    const base = draftRef.current;
    if (!base) return;
    const next = { ...base, ...patch };
    draftRef.current = next;
    setDraft(next);
    setSavingKey(key);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      timerRef.current = null;
      await saveSettings(next);
      setSavingKey(null);
      pushToast('✓ Settings updated');
    }, 500);
  }

  return (
    <div className="space-y-4">
      <header className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
        <h1 className="text-xl font-semibold">Customize</h1>
        <p className="text-sm text-[var(--color-ink-soft)] mt-0.5">Everything here shapes what shows up on your Dashboard.</p>
      </header>

      <SectionCard title="Wake-up time" icon="⏰">
        <input
          type="time"
          value={draft.wakeUpTime}
          onChange={(e) => persist({ wakeUpTime: e.target.value }, 'wakeUpTime')}
          className="input w-40"
        />
      </SectionCard>

      <SectionCard title="Morning routine" icon="🌅">
        <RoutineListEditor items={draft.morningRoutine} onChange={(items) => persist({ morningRoutine: items }, 'morning')} />
      </SectionCard>

      <SectionCard title="Meals" icon="🍽️">
        <p className="text-xs text-[var(--color-ink-soft)] mb-2">Meal checklist</p>
        <RoutineListEditor items={draft.meals} onChange={(items) => persist({ meals: items }, 'meals')} />

        <p className="text-xs text-[var(--color-ink-soft)] mt-4 mb-2">Daily food targets</p>
        <div className="grid grid-cols-2 gap-3">
          {(['eggs', 'fruits'] as const).map((key) => (
            <label key={key} className="flex flex-col gap-1">
              <span className="text-xs capitalize text-[var(--color-ink-soft)]">{key}</span>
              <input
                type="number"
                min={0}
                value={draft.foodTargets[key]}
                onChange={(e) =>
                  persist({ foodTargets: { ...draft.foodTargets, [key]: Number(e.target.value) || 0 } }, `target_${key}`)
                }
                className="input w-full"
              />
            </label>
          ))}
        </div>
        <p className="text-xs text-[var(--color-ink-soft)] mt-2">Nuts/Seeds is a plain daily checkbox — no target to set.</p>
      </SectionCard>

      <SectionCard title="Hydration" icon="💧">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-ink-soft)]">Daily target (liters)</span>
            <input
              type="number"
              min={0}
              step="0.1"
              value={draft.hydration.targetLiters}
              onChange={(e) => persist({ hydration: { targetLiters: Number(e.target.value) || 0 } }, 'targetLiters')}
              className="input w-full"
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard title="Movement" icon="🚶">
        <RoutineListEditor items={draft.movement} onChange={(items) => persist({ movement: items }, 'movement')} trackDurationOption />
      </SectionCard>

      <SectionCard title="Night routine" icon="🌙">
        <RoutineListEditor items={draft.nightRoutine} onChange={(items) => persist({ nightRoutine: items }, 'night')} />
      </SectionCard>

      <SectionCard title="Sleep targets" icon="😴">
        <div className="grid grid-cols-3 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-ink-soft)]">Bedtime</span>
            <input
              type="time"
              value={draft.sleepTargets.bedtime}
              onChange={(e) => persist({ sleepTargets: { ...draft.sleepTargets, bedtime: e.target.value } }, 'bedtime')}
              className="input w-full"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-ink-soft)]">Wake time</span>
            <input
              type="time"
              value={draft.sleepTargets.wakeTime}
              onChange={(e) => persist({ sleepTargets: { ...draft.sleepTargets, wakeTime: e.target.value } }, 'wakeTime')}
              className="input w-full"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-ink-soft)]">Target hours</span>
            <input
              type="number"
              step="0.5"
              min={0}
              value={draft.sleepTargets.durationHours}
              onChange={(e) =>
                persist({ sleepTargets: { ...draft.sleepTargets, durationHours: Number(e.target.value) || 0 } }, 'durationHours')
              }
              className="input w-full"
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard title="Academic categories" icon="📚">
        <AcademicCategoriesEditor
          items={draft.academicCategories}
          onChange={(items) => persist({ academicCategories: items }, 'academicCategories')}
        />
      </SectionCard>

      <SectionCard title="Recurring tasks" icon="🧺">
        <RecurringTasksEditor tasks={draft.recurringTasks} onChange={(tasks) => persist({ recurringTasks: tasks }, 'recurring')} />
      </SectionCard>

      {savingKey && <p className="text-xs text-center text-[var(--color-ink-soft)]">Saving…</p>}
    </div>
  );
}
