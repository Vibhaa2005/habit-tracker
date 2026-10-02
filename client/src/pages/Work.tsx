import { useEffect, useState } from 'react';
import { CollapsibleCard } from '../components/ui/CollapsibleCard';
import { WorkTopicCard } from '../components/work/WorkTopicCard';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import type { WorkTopic } from '../types';

export default function Work() {
  const { pushToast } = useApp();
  const [topics, setTopics] = useState<WorkTopic[] | null>(null);
  const [newTopicLabel, setNewTopicLabel] = useState('');

  useEffect(() => {
    api.getWorkTopics().then(setTopics);
  }, []);

  async function updateTopic(id: string, patch: Partial<WorkTopic>) {
    const updated = await api.updateWorkTopic(id, patch);
    setTopics((prev) => (prev ? prev.map((t) => (t.id === id ? updated : t)) : prev));
  }

  async function deleteTopic(id: string) {
    if (!confirm('Delete this topic and everything in it?')) return;
    await api.deleteWorkTopic(id);
    setTopics((prev) => (prev ? prev.filter((t) => t.id !== id) : prev));
    pushToast('Topic removed');
  }

  async function addTopic() {
    if (!newTopicLabel.trim()) return;
    const created = await api.createWorkTopic(newTopicLabel.trim());
    setTopics((prev) => (prev ? [...prev, created] : [created]));
    setNewTopicLabel('');
    pushToast('✓ Topic added');
  }

  if (!topics) return null;

  const sorted = [...topics].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <header className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
        <h1 className="text-xl font-semibold">Work</h1>
      </header>

      {sorted.map((topic) => {
        const total = topic.checklist.length;
        const done = topic.checklist.filter((i) => i.done).length;
        return (
          <CollapsibleCard
            key={topic.id}
            title={topic.label}
            icon="💼"
            summary={total > 0 ? <span className="text-xs text-[var(--color-ink-soft)]">{done}/{total}</span> : undefined}
          >
            <WorkTopicCard topic={topic} onUpdate={(patch) => updateTopic(topic.id, patch)} onDelete={() => deleteTopic(topic.id)} />
          </CollapsibleCard>
        );
      })}

      <div className="flex gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5">
        <input
          value={newTopicLabel}
          onChange={(e) => setNewTopicLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTopic()}
          placeholder="Add new topic..."
          className="input flex-1"
        />
        <button onClick={addTopic} className="text-sm font-medium px-4 py-2 rounded-full bg-[var(--color-green-500)] text-white hover:bg-[var(--color-green-700)] flex-shrink-0">
          + Add topic
        </button>
      </div>
    </div>
  );
}
