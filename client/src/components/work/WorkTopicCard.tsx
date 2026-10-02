import { useState } from 'react';
import type { WorkTopic } from '../../types';

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function WorkTopicCard({
  topic,
  onUpdate,
  onDelete,
}: {
  topic: WorkTopic;
  onUpdate: (patch: Partial<WorkTopic>) => void;
  onDelete: () => void;
}) {
  const [newItem, setNewItem] = useState('');
  const [newResourceLabel, setNewResourceLabel] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');

  function toggleItem(id: string) {
    onUpdate({ checklist: topic.checklist.map((i) => (i.id === id ? { ...i, done: !i.done } : i)) });
  }

  function removeItem(id: string) {
    onUpdate({ checklist: topic.checklist.filter((i) => i.id !== id) });
  }

  function addItem() {
    if (!newItem.trim()) return;
    onUpdate({ checklist: [...topic.checklist, { id: uid('item'), label: newItem.trim(), done: false }] });
    setNewItem('');
  }

  function removeResource(id: string) {
    onUpdate({ resources: topic.resources.filter((r) => r.id !== id) });
  }

  function updateResourceNotes(id: string, notes: string) {
    onUpdate({ resources: topic.resources.map((r) => (r.id === id ? { ...r, notes } : r)) });
  }

  function addResource() {
    if (!newResourceLabel.trim() || !newResourceUrl.trim()) return;
    const url = /^https?:\/\//.test(newResourceUrl.trim()) ? newResourceUrl.trim() : `https://${newResourceUrl.trim()}`;
    onUpdate({ resources: [...topic.resources, { id: uid('res'), label: newResourceLabel.trim(), url }] });
    setNewResourceLabel('');
    setNewResourceUrl('');
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)] mb-2">Checklist</p>
        <div className="flex flex-col">
          {topic.checklist.map((item) => (
            <div key={item.id} className="flex items-center gap-2 py-1">
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                aria-pressed={item.done}
                className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  item.done ? 'bg-[var(--color-green-500)] border-[var(--color-green-500)]' : 'border-[var(--color-grey-300)]'
                }`}
              >
                {item.done && (
                  <svg viewBox="0 0 16 16" width="11" height="11" fill="none">
                    <path d="M3 8.5L6.2 11.5L13 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <span className={`flex-1 text-sm ${item.done ? 'line-through opacity-60 text-[var(--color-ink-soft)]' : ''}`}>
                {item.label}
              </span>
              <button onClick={() => removeItem(item.id)} className="text-xs text-[var(--color-red-500)] px-1">
                ✕
              </button>
            </div>
          ))}
          {topic.checklist.length === 0 && <p className="text-sm text-[var(--color-ink-soft)] py-1">No sub-items yet.</p>}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add sub-item..."
            className="input flex-1 py-1.5"
          />
          <button onClick={addItem} className="text-sm font-medium px-3 py-1.5 rounded-full bg-[var(--color-green-500)] text-white hover:bg-[var(--color-green-700)]">
            Add
          </button>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)] mb-2">Resources</p>
        <div className="flex flex-col gap-1">
          {topic.resources.map((r) => (
            <div key={r.id} className="flex items-center gap-2 py-1">
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="flex-shrink-0 max-w-[40%] text-sm text-[var(--color-blue-700)] hover:underline truncate"
              >
                🔗 {r.label}
              </a>
              <input
                key={r.id + ':' + (r.notes ?? '')}
                defaultValue={r.notes ?? ''}
                onBlur={(e) => {
                  if (e.target.value !== (r.notes ?? '')) updateResourceNotes(r.id, e.target.value);
                }}
                placeholder="Add a short note..."
                className="input flex-1 py-1 text-xs"
              />
              <button onClick={() => removeResource(r.id)} className="text-xs text-[var(--color-red-500)] px-1 flex-shrink-0">
                ✕
              </button>
            </div>
          ))}
          {topic.resources.length === 0 && <p className="text-sm text-[var(--color-ink-soft)] py-1">No resources yet.</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mt-2">
          <input
            value={newResourceLabel}
            onChange={(e) => setNewResourceLabel(e.target.value)}
            placeholder="Resource name"
            className="input sm:col-span-2 py-1.5"
          />
          <input
            value={newResourceUrl}
            onChange={(e) => setNewResourceUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addResource()}
            placeholder="URL"
            className="input sm:col-span-2 py-1.5"
          />
          <button onClick={addResource} className="text-sm font-medium px-3 py-1.5 rounded-full bg-[var(--color-green-500)] text-white hover:bg-[var(--color-green-700)]">
            Add
          </button>
        </div>
      </div>

      <button onClick={onDelete} className="text-xs text-[var(--color-red-500)] hover:underline self-start">
        Delete topic
      </button>
    </div>
  );
}
