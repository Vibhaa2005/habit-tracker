import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Toasts } from '../Toasts';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <main className="md:pl-60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-10">{children}</div>
      </main>
      <BottomNav />
      <Toasts />
    </div>
  );
}
