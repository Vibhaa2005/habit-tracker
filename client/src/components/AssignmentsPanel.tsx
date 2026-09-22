import { useMemo, useState } from 'react';
import { format, isPast, parseISO } from 'date-fns';
import { useApp } from '../context/AppContext';
import type { Assignment, AssignmentStatus } from '../types';

const STATUSES: AssignmentStatus[] = ['Not started', 'In progress', 'Completed'];

const emptyForm = {
  name: '',
  subject: '',
  description: '',
  deadline: '',
  status: 'Not started' as AssignmentStatus,
  notes: '',
};

export function AssignmentsPanel() {
  const { assignments, createAssignment, updateAssignment, deleteAssignment } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const sorted = useMemo(
    () => [...assignments].sort((a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999')),
    [assignments]
  );

  function openNew() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(a: Assignment) {
    setForm({
      name: a.name,
      subject: a.subject,
      description: a.description,
      deadline: a.deadline || '',
      status: a.status,
      notes: a.notes,
    });
    setEditingId(a.id);
    setShowForm(true);
  }

  async function submit() {
    if (!form.name.trim()) return;
    const payload = { ...form, deadline: form.deadline || null };
    if (editingId) {
      await updateAssignment(editingId, payload);
    } else {
      await createAssignment(payload);
    }
    setShowForm(false);
  }

  async function remove(id: string) {
    if (confirm('Delete this assignment?')) {
      await deleteAssignment(id);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[var(--color-ink-soft)]">{assignments.length} total</p>
        <button
          onClick={openNew}
          className="text-sm font-medium px-3 py-1.5 rounded-full bg-[var(--color-green-500)] text-white hover:bg-[var(--color-green-700)]"
        >
          + Add assignment
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-[var(--color-ink-soft)] py-6 text-center">
          No assignments yet.
          <br />
          Add your first deadline.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((a) => {
            const overdue = a.deadline && isPast(parseISO(a.deadline)) && a.status !== 'Completed';
            return (
              <li
                key={a.id}
                className={`rounded-xl border p-3 ${overdue ? 'border-[var(--color-red-500)] bg-[var(--color-red-50)]' : 'border-[var(--color-border)]'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-[15px] truncate">{a.name}</p>
                    <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">
                      {a.subject || 'General'}
                      {a.deadline && ` · Due ${format(parseISO(a.deadline), 'MMM d')}`}
                      {overdue && ' · Overdue'}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
                      a.status === 'Completed'
                        ? 'bg-[var(--color-green-50)] text-[var(--color-green-900)]'
                        : a.status === 'In progress'
                        ? 'bg-[var(--color-amber-500)]/15 text-[var(--color-amber-500)]'
                        : 'bg-[var(--color-grey-100)] text-[var(--color-ink-soft)]'
                    }`}
                  >
                    {a.status}
                  </span>
                </div>
                {a.description && <p className="text-sm mt-2 text-[var(--color-ink-soft)]">{a.description}</p>}
                <div className="flex items-center gap-3 mt-2">
                  <label className="flex items-center gap-1.5 text-xs text-[var(--color-ink-soft)]">
                    <input
                      type="checkbox"
                      checked={a.status === 'Completed'}
                      onChange={(e) => updateAssignment(a.id, { status: e.target.checked ? 'Completed' : 'In progress' })}
                    />
                    Completed
                  </label>
                  <button onClick={() => openEdit(a)} className="text-xs font-medium text-[var(--color-green-700)] hover:underline">
                    Edit
                  </button>
                  <button onClick={() => remove(a.id)} className="text-xs font-medium text-[var(--color-red-500)] hover:underline">
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => setShowForm(false)}>
          <div
            className="bg-[var(--color-surface)] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-5 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-lg mb-3">{editingId ? 'Edit assignment' : 'New assignment'}</h3>
            <div className="flex flex-col gap-3">
              <Field label="Name">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input w-full" />
              </Field>
              <Field label="Subject">
                <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input w-full" />
              </Field>
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input w-full"
                  rows={2}
                />
              </Field>
              <Field label="Deadline">
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="input w-full"
                />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AssignmentStatus })} className="input w-full">
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Notes">
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input w-full" rows={2} />
              </Field>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl border border-[var(--color-border)]">
                Cancel
              </button>
              <button onClick={submit} className="flex-1 py-2 rounded-xl bg-[var(--color-green-500)] text-white hover:bg-[var(--color-green-700)]">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-[var(--color-ink-soft)]">{label}</span>
      {children}
    </label>
  );
}
