import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  icon?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, icon, right, children, className = '' }: SectionCardProps) {
  return (
    <section
      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-[var(--color-ink-soft)]">
          {icon}
          {title}
        </h2>
        {right}
      </div>
      {children}
    </section>
  );
}
