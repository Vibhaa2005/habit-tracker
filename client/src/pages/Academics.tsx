import { useEffect, useState } from 'react';
import { SectionCard } from '../components/ui/SectionCard';
import { CheckRow } from '../components/ui/CheckRow';
import { DailyCounter } from '../components/ui/DailyCounter';
import { AssignmentsPanel } from '../components/AssignmentsPanel';
import { DateNav } from '../components/DateNav';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import type { ExatestState } from '../types';

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
          label="Revision completed"
          checked={!!dayResponse.day.academics.revision}
          onToggle={(next) => patchDay({ academics: { revision: next } }, next ? '✓ Completed' : undefined)}
        />
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
          <DailyCounter
            emoji="🎲"
            label="Probability"
            value={dayResponse.day.academics.probabilityQuestions}
            target={settings.academicTargets.probability || undefined}
            onChange={(v) => patchDay({ academics: { probabilityQuestions: v } }, v > 0 ? undefined : undefined)}
          />
          <DailyCounter
            emoji="💻"
            label="LeetCode"
            value={dayResponse.day.academics.leetcodeQuestions}
            target={settings.academicTargets.leetcode || undefined}
            onChange={(v) => patchDay({ academics: { leetcodeQuestions: v } })}
          />
          <DailyCounter
            emoji="⚔️"
            label="Codeforces"
            value={dayResponse.day.academics.codeforcesQuestions}
            target={settings.academicTargets.codeforces || undefined}
            onChange={(v) => patchDay({ academics: { codeforcesQuestions: v } })}
          />
        </div>
      </SectionCard>

      <SectionCard title="Assignments" icon="📝">
        <AssignmentsPanel />
      </SectionCard>
    </div>
  );
}
