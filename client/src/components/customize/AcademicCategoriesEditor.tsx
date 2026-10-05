import { useState } from 'react';
import type { AcademicCategory } from '../../types';

function uid() {
  return `cat_${Math.random().toString(36).slice(2, 9)}`;
}

export function AcademicCategoriesEditor({
  items,
  onChange,
}: {
  items: AcademicCategory[];
  onChange: (items: AcademicCategory[]) => void;
}) {
  const [newLabel, setNewLabel] = useState('');
  const [newTarget, setNewTarget] = useState('5');
  const sorted = [...items].sort((a, b) => a.order - b.order);

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= sorted.length) return;
    const copy = [...sorted];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy.map((item, i) => ({ ...item, order: i })));
  }

  function toggleEnabled(id: string) {
    onChange(items.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i)));
  }

  function rename(id: string, label: string) {
    onChange(items.map((i) => (i.id === id ? { ...i, label } : i)));
  }

  function retarget(id: string, target: number) {
    onChange(items.map((i) => (i.id === id ? { ...i, target } : i)));
  }

  function remove(id: string) {
    onChange(items.filter((i) => i.id !== id));
  }

  function add() {
    if (!newLabel.trim()) return;
    onChange([
      ...items,
      { id: uid(), label: newLabel.trim(), target: Number(newTarget) || 0, enabled: true, order: items.length },
    ]);
    setNewLabel('');
    setNewTarget('5');
  }

  return (
    <div className="flex flex-col gap-1">
      {sorted.map((item, i) => (
        <div key={item.id} className="flex items-center gap-2 py-1.5">
          <input type="checkbox" checked={item.enabled} onChange={() => toggleEnabled(item.id)} title="Enabled" />
          <input
            value={item.label}
            onChange={(e) => rename(item.id, e.target.value)}
            className={`input flex-1 py-1 ${!item.enabled ? 'opacity-50' : ''}`}
          />
          <label className="flex items-center gap-1 text-xs text-[var(--color-ink-soft)] flex-shrink-0">
            target
            <input
              type="number"
              min={0}
              value={item.target}
              onChange={(e) => retarget(item.id, Number(e.target.value) || 0)}
              className="input w-16 py-1"
            />
          </label>
          <button onClick={() => move(i, -1)} disabled={i === 0} className="w-6 h-6 text-xs text-[var(--color-ink-soft)] disabled:opacity-30">
            ↑
          </button>
          <button
            onClick={() => move(i, 1)}
            disabled={i === sorted.length - 1}
            className="w-6 h-6 text-xs text-[var(--color-ink-soft)] disabled:opacity-30"
          >
            ↓
          </button>
          <button onClick={() => remove(item.id)} className="w-6 h-6 text-xs text-[var(--color-red-500)]">
            ✕
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-2 mt-1 border-t border-[var(--color-border)]">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Add new category..."
          className="input flex-1 py-1.5"
        />
        <label className="flex items-center gap-1 text-xs text-[var(--color-ink-soft)] flex-shrink-0">
          target
          <input
            type="number"
            min={0}
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            className="input w-16 py-1.5"
          />
        </label>
        <button onClick={add} className="text-sm font-medium px-3 py-1.5 rounded-full bg-[var(--color-green-500)] text-white hover:bg-[var(--color-green-700)]">
          Add
        </button>
      </div>
    </div>
  );
}
