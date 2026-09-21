import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './nav';

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-6">
      <div className="px-2 mb-8">
        <span className="text-lg font-bold tracking-tight">🌱 LifeOS</span>
        <p className="text-xs text-[var(--color-ink-soft)] mt-0.5">your daily operating system</p>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-green-900)] text-white'
                  : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]'
              }`
            }
          >
            <span>{item.emoji}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
