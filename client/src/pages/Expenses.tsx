import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { SectionCard } from '../components/ui/SectionCard';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import type { Expense } from '../types';

function todayStr() {
  return format(new Date(), 'yyyy-MM-dd');
}

const emptyForm = { name: '', amount: '', reasonId: '', date: todayStr() };

export default function Expenses() {
  const { settings, pushToast } = useApp();
  const [expenses, setExpenses] = useState<Expense[] | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    api.getExpenses().then(setExpenses);
  }, []);

  const reasons = useMemo(
    () => [...(settings?.expenseReasons ?? [])].filter((r) => r.enabled).sort((a, b) => a.order - b.order),
    [settings]
  );

  const reasonLabel = (id: string | null) => {
    if (!id) return 'Uncategorized';
    return settings?.expenseReasons.find((r) => r.id === id)?.label ?? 'Uncategorized';
  };

  const groups = useMemo(() => {
    if (!expenses) return [];
    const byDate = new Map<string, Expense[]>();
    for (const e of expenses) {
      if (!byDate.has(e.date)) byDate.set(e.date, []);
      byDate.get(e.date)!.push(e);
    }
    return [...byDate.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, items]) => ({
        date,
        items: items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
        total: items.reduce((s, e) => s + e.amount, 0),
      }));
  }, [expenses]);

  const allTimeTotal = useMemo(() => (expenses ?? []).reduce((s, e) => s + e.amount, 0), [expenses]);

  function startEdit(e: Expense) {
    setEditingId(e.id);
    setForm({ name: e.name, amount: String(e.amount), reasonId: e.reasonId ?? '', date: e.date });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function submit() {
    const amount = Number(form.amount);
    if (!form.name.trim() || Number.isNaN(amount) || amount <= 0) return;
    const payload = { name: form.name.trim(), amount, reasonId: form.reasonId || null, date: form.date };

    if (editingId) {
      const updated = await api.updateExpense(editingId, payload);
      setExpenses((prev) => (prev ? prev.map((e) => (e.id === editingId ? updated : e)) : prev));
      pushToast('✓ Expense updated');
      setEditingId(null);
    } else {
      const created = await api.createExpense(payload);
      setExpenses((prev) => (prev ? [...prev, created] : [created]));
      pushToast('✓ Expense added');
    }
    setForm({ ...emptyForm, date: form.date });
  }

  async function remove(id: string) {
    if (!confirm('Delete this expense?')) return;
    await api.deleteExpense(id);
    setExpenses((prev) => (prev ? prev.filter((e) => e.id !== id) : prev));
    if (editingId === id) cancelEdit();
    pushToast('Expense removed');
  }

  if (!settings || !expenses) return null;

  return (
    <div className="space-y-4">
      <header className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Expenses</h1>
          <p className="text-sm text-[var(--color-ink-soft)] mt-0.5">{expenses.length} logged</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[var(--color-ink-soft)]">All-time total</p>
          <p className="text-2xl font-bold text-[var(--color-green-700)]">{allTimeTotal.toFixed(2)}</p>
        </div>
      </header>

      <SectionCard title={editingId ? 'Edit expense' : 'Add expense'} icon="➕">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Expense name"
            className="input w-full sm:col-span-2"
          />
          <input
            type="number"
            min={0}
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="Amount"
            className="input w-full"
          />
          <select value={form.reasonId} onChange={(e) => setForm({ ...form, reasonId: e.target.value })} className="input w-full">
            <option value="">Reason...</option>
            {reasons.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="input w-full"
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={submit}
            className="px-4 py-2 rounded-xl bg-[var(--color-green-500)] text-white text-sm font-medium hover:bg-[var(--color-green-700)]"
          >
            {editingId ? 'Save changes' : '+ Add expense'}
          </button>
          {editingId && (
            <button onClick={cancelEdit} className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm">
              Cancel
            </button>
          )}
        </div>
      </SectionCard>

      {groups.length === 0 ? (
        <SectionCard title="History" icon="🧾">
          <p className="text-sm text-[var(--color-ink-soft)] py-6 text-center">
            No expenses yet.
            <br />
            Add your first one above.
          </p>
        </SectionCard>
      ) : (
        groups.map((group) => (
          <SectionCard
            key={group.date}
            title={format(parseISO(group.date), 'EEEE, MMM d')}
            icon="🧾"
            right={<span className="text-sm font-semibold text-[var(--color-green-700)]">{group.total.toFixed(2)}</span>}
          >
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[var(--color-ink-soft)] uppercase tracking-wide">
                    <th className="px-1 py-1.5 font-medium">Name</th>
                    <th className="px-1 py-1.5 font-medium">Reason</th>
                    <th className="px-1 py-1.5 font-medium text-right">Amount</th>
                    <th className="px-1 py-1.5 font-medium w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((e) => (
                    <tr key={e.id} className="border-t border-[var(--color-border)]">
                      <td className="px-1 py-2">{e.name}</td>
                      <td className="px-1 py-2 text-[var(--color-ink-soft)]">{reasonLabel(e.reasonId)}</td>
                      <td className="px-1 py-2 text-right font-medium">{e.amount.toFixed(2)}</td>
                      <td className="px-1 py-2 text-right whitespace-nowrap">
                        <button onClick={() => startEdit(e)} className="text-xs text-[var(--color-green-700)] hover:underline mr-2">
                          Edit
                        </button>
                        <button onClick={() => remove(e.id)} className="text-xs text-[var(--color-red-500)] hover:underline">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        ))
      )}
    </div>
  );
}
