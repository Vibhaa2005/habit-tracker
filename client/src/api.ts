import type {
  Settings,
  DayResponse,
  Assignment,
  ExatestState,
  StatsResponse,
  AchievementsResponse,
  Expense,
} from './types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getSettings: () => request<Settings>('/settings'),
  saveSettings: (settings: Settings) =>
    request<Settings>('/settings', { method: 'PUT', body: JSON.stringify(settings) }),

  getDay: (date: string) => request<DayResponse>(`/day/${date}`),
  patchDay: (date: string, patch: Partial<Record<string, unknown>>) =>
    request<{ date: string; day: DayResponse['day']; completion: DayResponse['completion'] }>(`/day/${date}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),

  getAssignments: () => request<Assignment[]>('/assignments'),
  createAssignment: (a: Partial<Assignment>) =>
    request<Assignment>('/assignments', { method: 'POST', body: JSON.stringify(a) }),
  updateAssignment: (id: string, a: Partial<Assignment>) =>
    request<Assignment>(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(a) }),
  deleteAssignment: (id: string) => request<void>(`/assignments/${id}`, { method: 'DELETE' }),

  getExatest: () => request<ExatestState>('/exatest'),
  submitExatest: (score: number, date?: string) =>
    request<ExatestState>('/exatest', { method: 'POST', body: JSON.stringify({ score, date }) }),

  getStats: (range: string, end?: string) =>
    request<StatsResponse>(`/stats?range=${range}${end ? `&end=${end}` : ''}`),
  getDayDetail: (date: string) => request<{ date: string; day: DayResponse['day']; completion: DayResponse['completion'] }>(`/day/${date}/detail`),

  getAchievements: () => request<AchievementsResponse>('/achievements'),

  getExpenses: () => request<Expense[]>('/expenses'),
  createExpense: (e: Partial<Expense>) => request<Expense>('/expenses', { method: 'POST', body: JSON.stringify(e) }),
  updateExpense: (id: string, e: Partial<Expense>) =>
    request<Expense>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(e) }),
  deleteExpense: (id: string) => request<void>(`/expenses/${id}`, { method: 'DELETE' }),
};
