import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './nav';

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--color-surface)] border-t border-[var(--color-border)] flex justify-around py-1.5 pb-[env(safe-area-inset-bottom)]">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
              isActive ? 'text-[var(--color-green-700)]' : 'text-[var(--color-ink-soft)]'
            }`
          }
        >
          <span className="text-lg leading-none">{item.emoji}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
