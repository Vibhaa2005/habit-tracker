import { useApp } from '../context/AppContext';

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center w-full px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className={`animate-toast pointer-events-auto max-w-sm text-center px-4 py-2.5 rounded-full shadow-lg text-sm font-medium cursor-pointer ${
            t.kind === 'achievement'
              ? 'bg-[var(--color-green-900)] text-white'
              : 'bg-[var(--color-ink)] text-[var(--color-green-100)]'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
