import { NavLink } from 'react-router-dom';

export function SettingsButton() {
  return (
    <NavLink
      to="/customize"
      aria-label="Customize"
      className={({ isActive }) =>
        `fixed top-3 right-3 sm:top-4 sm:right-4 z-40 w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md transition-colors ${
          isActive
            ? 'bg-[var(--color-green-900)] text-white'
            : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]'
        }`
      }
    >
      ⚙️
    </NavLink>
  );
}
