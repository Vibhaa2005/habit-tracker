import { useState } from 'react';
import type { ReactNode } from 'react';

interface CollapsibleCardProps {
  title: string;
  icon?: ReactNode;
  summary?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

// Same visual shell as SectionCard, but content only mounts once the card is
// opened — used on the Statistics page so it reads as a set of cards to pick
// from rather than one long scroll of every chart at once.
export function CollapsibleCard({ title, icon, summary, defaultOpen = false, children, className = '' }: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left hover:bg-[var(--color-surface-muted)] transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-[var(--color-ink-soft)]">
          {icon}
          {title}
        </span>
        <span className="flex items-center gap-3 flex-shrink-0">
          {summary}
          <svg
            viewBox="0 0 16 16"
            width="14"
            height="14"
            fill="none"
            className={`text-[var(--color-ink-soft)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M3.5 6L8 10.5L12.5 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>
      {open && <div className="px-4 sm:px-5 pb-4 sm:pb-5">{children}</div>}
    </section>
  );
}
