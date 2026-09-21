import { SectionCard } from './ui/SectionCard';

export interface SummaryRow {
  label: string;
  value: string;
}

export function SummaryCard({ title, icon, rows }: { title: string; icon: string; rows: SummaryRow[] }) {
  return (
    <SectionCard title={title} icon={icon}>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="text-xs text-[var(--color-ink-soft)]">{r.label}</dt>
            <dd className="text-base font-semibold mt-0.5">{r.value}</dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  );
}
