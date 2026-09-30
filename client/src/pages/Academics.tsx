import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionCard } from '../components/ui/SectionCard';
import { CheckRow } from '../components/ui/CheckRow';
import { DailyCounter } from '../components/ui/DailyCounter';
import { AssignmentsPanel } from '../components/AssignmentsPanel';
import { DateNav } from '../components/DateNav';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import type { ExatestState } from '../types';

const CATEGORY_EMOJI: Record<string, string> = {
  probability: '🎲',
  leetcode: '💻',
  codeforces: '⚔️',
};

export default function Academics() {
  const { settings, dayResponse, patchDay, selectedDate, pushToast } = useApp();
  const [exatest, setExatest] = useState<ExatestState | null>(null);
  const [scoreInput, setScoreInput] = useState('');

  useEffect(() => {
    api.getExatest().then(setExatest);
  }, []);

  async function submitScore() {
    const score = Number(scoreInput);
    if (Number.isNaN(score)) return;
    const updated = await api.submitExatest(score, selectedDate);
    setExatest(updated);
    setScoreInput('');
    pushToast(score > (exatest?.highestScore || 0) ? '🏆 New high score!' : '✓ Score recorded');
  }

  if (!settings || !dayResponse) return null;

  const totalStudyMinutes = dayResponse.day.academics.studyMinutes || 0;
  const studyHours = Math.floor(totalStudyMinutes / 60);
  const studyMins = totalStudyMinutes % 60;

  function updateStudyTime(hours: number, minutes: number) {
    const clampedMinutes = Math.min(Math.max(minutes, 0), 59);
    const clampedHours = Math.max(hours, 0);
    patchDay({ academics: { studyMinutes: clampedHours * 60 + clampedMinutes } });
  }

  return (
    <div className="space-y-4">
      <header className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Academics</h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-0.5">Assignments, revision & daily practice</p>
        </div>
        <DateNav />
      </header>

      <SectionCard title="Revision" icon="📖">
        <CheckRow
          label="Daily revision"
          checked={!!dayResponse.day.academics.revision}
          onToggle={(next) => patchDay({ academics: { revision: next } }, next ? '✓ Completed' : undefined)}
        />
        {dayResponse.dueRecurring
          .filter((task) => task.category === 'Academics')
          .map((task) => (
            <CheckRow
              key={task.id}
              label={task.label}
              checked={!!dayResponse.day.recurringTasks[task.id]}
              onToggle={(next) =>
                patchDay({ recurringTasks: { [task.id]: next } }, next ? '✓ Completed' : undefined)
              }
            />
          ))}
      </SectionCard>

      <SectionCard title="Exatest" icon="🎯">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[var(--color-ink-soft)]">Highest score</span>
          <span className="text-3xl font-bold text-[var(--color-green-700)]">{exatest?.highestScore ?? '—'}</span>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={scoreInput}
            onChange={(e) => setScoreInput(e.target.value)}
            placeholder="Enter today's score"
            className="input flex-1"
          />
          <button onClick={submitScore} className="px-4 py-2 rounded-xl bg-[var(--color-green-500)] text-white text-sm font-medium hover:bg-[var(--color-green-700)]">
            Submit
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Daily practice" icon="🧠">
        <div className="divide-y divide-[var(--color-border)]">
          {[...settings.academicCategories]
            .filter((c) => c.enabled)
            .sort((a, b) => a.order - b.order)
            .map((cat) => (
              <DailyCounter
                key={cat.id}
                emoji={CATEGORY_EMOJI[cat.id] || '📝'}
                label={cat.label}
                value={dayResponse.day.academics.questionCounts[cat.id] || 0}
                target={cat.target || undefined}
                onChange={(v) =>
                  patchDay({
                    academics: { questionCounts: { ...dayResponse.day.academics.questionCounts, [cat.id]: v } },
                  })
                }
              />
            ))}
        </div>
      </SectionCard>

      <SectionCard title="Study time" icon="⏱️">
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={studyHours}
              onChange={(e) => updateStudyTime(Number(e.target.value) || 0, studyMins)}
              className="input w-16"
            />
            <span className="text-sm text-[var(--color-ink-soft)]">hrs</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={59}
              value={studyMins}
              onChange={(e) => updateStudyTime(studyHours, Number(e.target.value) || 0)}
              className="input w-16"
            />
            <span className="text-sm text-[var(--color-ink-soft)]">min</span>
          </label>
          <span className="text-sm text-[var(--color-ink-soft)] sm:ml-auto">
            {totalStudyMinutes > 0 ? `${studyHours}h ${studyMins}m today` : 'Nothing logged yet'}
          </span>
        </div>
      </SectionCard>

      <Link
        to="/academics/statistics"
        className="flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 hover:bg-[var(--color-surface-muted)] transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-[var(--color-ink-soft)]">
          📊 Academic statistics
        </span>
        <span className="text-sm text-[var(--color-green-700)] font-medium">View trends →</span>
      </Link>

      <SectionCard title="Assignments" icon="📝">
        <AssignmentsPanel />
      </SectionCard>
    </div>
  );
}
