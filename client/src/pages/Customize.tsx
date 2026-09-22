import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SectionCard } from '../components/ui/SectionCard';
import { RoutineListEditor } from '../components/customize/RoutineListEditor';
import { RecurringTasksEditor } from '../components/customize/RecurringTasksEditor';
import type { Settings } from '../types';

export default function Customize() {
  const { settings, saveSettings, pushToast } = useApp();
  const [savingKey, setSavingKey] = useState<string | null>(null);

  if (!settings) return null;

  async function persist(patch: Partial<Settings>, key: string) {
    setSavingKey(key);
    await saveSettings({ ...settings!, ...patch });
    setSavingKey(null);
    pushToast('✓ Settings updated');
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
          value={settings.wakeUpTime}
          onChange={(e) => persist({ wakeUpTime: e.target.value }, 'wakeUpTime')}
          className="input w-40"
        />
      </SectionCard>

      <SectionCard title="Morning routine" icon="🌅">
        <RoutineListEditor items={settings.morningRoutine} onChange={(items) => persist({ morningRoutine: items }, 'morning')} />
      </SectionCard>

      <SectionCard title="Meals" icon="🍽️">
        <p className="text-xs text-[var(--color-ink-soft)] mb-2">Meal checklist</p>
        <RoutineListEditor items={settings.meals} onChange={(items) => persist({ meals: items }, 'meals')} />

        <p className="text-xs text-[var(--color-ink-soft)] mt-4 mb-2">Daily food targets</p>
        <div className="grid grid-cols-3 gap-3">
          {(['eggs', 'fruits', 'nuts'] as const).map((key) => (
            <label key={key} className="flex flex-col gap-1">
              <span className="text-xs capitalize text-[var(--color-ink-soft)]">{key === 'nuts' ? 'Nuts/Seeds' : key}</span>
              <input
                type="number"
                min={0}
                value={settings.foodTargets[key]}
                onChange={(e) =>
                  persist({ foodTargets: { ...settings.foodTargets, [key]: Number(e.target.value) || 0 } }, `target_${key}`)
                }
                className="input"
              />
            </label>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Hydration" icon="💧">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-ink-soft)]">Daily target (liters)</span>
            <input
              type="number"
              min={0}
              step="0.1"
              value={settings.hydration.targetLiters}
              onChange={(e) => persist({ hydration: { targetLiters: Number(e.target.value) || 0 } }, 'targetLiters')}
              className="input"
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard title="Movement" icon="🚶">
        <RoutineListEditor items={settings.movement} onChange={(items) => persist({ movement: items }, 'movement')} trackDurationOption />
      </SectionCard>

      <SectionCard title="Night routine" icon="🌙">
        <RoutineListEditor items={settings.nightRoutine} onChange={(items) => persist({ nightRoutine: items }, 'night')} />
      </SectionCard>

      <SectionCard title="Sleep targets" icon="😴">
        <div className="grid grid-cols-3 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-ink-soft)]">Bedtime</span>
            <input
              type="time"
              value={settings.sleepTargets.bedtime}
              onChange={(e) => persist({ sleepTargets: { ...settings.sleepTargets, bedtime: e.target.value } }, 'bedtime')}
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-ink-soft)]">Wake time</span>
            <input
              type="time"
              value={settings.sleepTargets.wakeTime}
              onChange={(e) => persist({ sleepTargets: { ...settings.sleepTargets, wakeTime: e.target.value } }, 'wakeTime')}
              className="input"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[var(--color-ink-soft)]">Target hours</span>
            <input
              type="number"
              step="0.5"
              min={0}
              value={settings.sleepTargets.durationHours}
              onChange={(e) =>
                persist({ sleepTargets: { ...settings.sleepTargets, durationHours: Number(e.target.value) || 0 } }, 'durationHours')
              }
              className="input"
            />
          </label>
        </div>
      </SectionCard>

      <SectionCard title="Academic targets" icon="📚">
        <div className="grid grid-cols-3 gap-3">
          {(['probability', 'leetcode', 'codeforces'] as const).map((key) => (
            <label key={key} className="flex flex-col gap-1">
              <span className="text-xs capitalize text-[var(--color-ink-soft)]">{key}</span>
              <input
                type="number"
                min={0}
                value={settings.academicTargets[key]}
                onChange={(e) =>
                  persist({ academicTargets: { ...settings.academicTargets, [key]: Number(e.target.value) || 0 } }, `academic_${key}`)
                }
                className="input"
              />
            </label>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Recurring tasks" icon="🧺">
        <RecurringTasksEditor tasks={settings.recurringTasks} onChange={(tasks) => persist({ recurringTasks: tasks }, 'recurring')} />
      </SectionCard>

      {savingKey && <p className="text-xs text-center text-[var(--color-ink-soft)]">Saving…</p>}
    </div>
  );
}
