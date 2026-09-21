import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { format } from 'date-fns';
import { api } from '../api';
import type { Assignment, Achievement, DayResponse, Settings } from '../types';

export function todayStr() {
  return format(new Date(), 'yyyy-MM-dd');
}

interface Toast {
  id: number;
  message: string;
  kind: 'info' | 'achievement';
}

interface AppContextValue {
  loading: boolean;
  settings: Settings | null;
  refreshSettings: () => Promise<void>;
  saveSettings: (s: Settings) => Promise<void>;

  selectedDate: string;
  setSelectedDate: (d: string) => void;
  goToday: () => void;
  shiftDate: (deltaDays: number) => void;

  dayResponse: DayResponse | null;
  refreshDay: () => Promise<void>;
  patchDay: (patch: Record<string, unknown>, toastMessage?: string) => Promise<void>;

  assignments: Assignment[];
  refreshAssignments: () => Promise<void>;
  createAssignment: (a: Partial<Assignment>) => Promise<void>;
  updateAssignment: (id: string, a: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;

  achievements: Achievement[];
  refreshAchievements: () => Promise<void>;

  toasts: Toast[];
  pushToast: (message: string, kind?: Toast['kind']) => void;
  dismissToast: (id: number) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function addDaysToDateStr(dateStr: string, delta: number) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  return format(d, 'yyyy-MM-dd');
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [dayResponse, setDayResponse] = useState<DayResponse | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const seenAchievements = useRef<Set<string>>(new Set());
  const achievementsInitialized = useRef(false);

  const pushToast = useCallback((message: string, kind: Toast['kind'] = 'info') => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { id, message, kind }]);
    const life = kind === 'achievement' ? 4500 : 2200;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, life);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshSettings = useCallback(async () => {
    const s = await api.getSettings();
    setSettings(s);
  }, []);

  const saveSettings = useCallback(async (s: Settings) => {
    const saved = await api.saveSettings(s);
    setSettings(saved);
  }, []);

  const refreshDay = useCallback(async () => {
    const d = await api.getDay(selectedDate);
    setDayResponse(d);
  }, [selectedDate]);

  const refreshAssignments = useCallback(async () => {
    const list = await api.getAssignments();
    setAssignments(list);
  }, []);

  const refreshAchievements = useCallback(async () => {
    const res = await api.getAchievements();
    if (achievementsInitialized.current) {
      for (const a of res.list) {
        if (a.unlocked && !seenAchievements.current.has(a.id)) {
          pushToast(`${a.emoji} New milestone unlocked! ${a.title}`, 'achievement');
        }
      }
    }
    seenAchievements.current = new Set(res.list.filter((a) => a.unlocked).map((a) => a.id));
    achievementsInitialized.current = true;
    setAchievements(res.list);
  }, [pushToast]);

  const patchDay = useCallback(
    async (patch: Record<string, unknown>, toastMessage?: string) => {
      const res = await api.patchDay(selectedDate, patch);
      setDayResponse((prev) => (prev ? { ...prev, day: res.day, completion: res.completion } : prev));
      if (toastMessage) pushToast(toastMessage);
      refreshAchievements();
    },
    [selectedDate, pushToast, refreshAchievements]
  );

  const createAssignment = useCallback(
    async (a: Partial<Assignment>) => {
      await api.createAssignment(a);
      await refreshAssignments();
      pushToast('✓ Assignment added');
    },
    [refreshAssignments, pushToast]
  );

  const updateAssignment = useCallback(
    async (id: string, a: Partial<Assignment>) => {
      await api.updateAssignment(id, a);
      await refreshAssignments();
    },
    [refreshAssignments]
  );

  const deleteAssignment = useCallback(
    async (id: string) => {
      await api.deleteAssignment(id);
      await refreshAssignments();
      pushToast('Assignment removed');
    },
    [refreshAssignments, pushToast]
  );

  const goToday = useCallback(() => setSelectedDate(todayStr()), []);
  const shiftDate = useCallback((delta: number) => {
    setSelectedDate((prev) => addDaysToDateStr(prev, delta));
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([refreshSettings(), refreshAssignments(), refreshAchievements()]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshDay();
  }, [refreshDay]);

  const value = useMemo<AppContextValue>(
    () => ({
      loading,
      settings,
      refreshSettings,
      saveSettings,
      selectedDate,
      setSelectedDate,
      goToday,
      shiftDate,
      dayResponse,
      refreshDay,
      patchDay,
      assignments,
      refreshAssignments,
      createAssignment,
      updateAssignment,
      deleteAssignment,
      achievements,
      refreshAchievements,
      toasts,
      pushToast,
      dismissToast,
    }),
    [
      loading,
      settings,
      refreshSettings,
      saveSettings,
      selectedDate,
      goToday,
      shiftDate,
      dayResponse,
      refreshDay,
      patchDay,
      assignments,
      refreshAssignments,
      createAssignment,
      updateAssignment,
      deleteAssignment,
      achievements,
      refreshAchievements,
      toasts,
      pushToast,
      dismissToast,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
