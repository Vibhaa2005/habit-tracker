export interface RoutineItem {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
  trackDuration?: boolean;
}

export type FrequencyType = 'daily' | 'weekly' | 'biweekly' | 'everyNDays';

export interface RecurringTask {
  id: string;
  label: string;
  category: string;
  frequencyType: FrequencyType;
  weekdays: number[] | null;
  intervalDays: number | null;
  anchorDate: string | null;
  enabled: boolean;
}

export interface AcademicCategory {
  id: string;
  label: string;
  target: number;
  enabled: boolean;
  order: number;
}

export interface Settings {
  wakeUpTime: string;
  morningRoutine: RoutineItem[];
  nightRoutine: RoutineItem[];
  meals: RoutineItem[];
  movement: RoutineItem[];
  foodTargets: { eggs: number; fruits: number };
  hydration: { targetLiters: number };
  sleepTargets: { bedtime: string; wakeTime: string; durationHours: number };
  academicCategories: AcademicCategory[];
  recurringTasks: RecurringTask[];
  expenseReasons: RoutineItem[];
}

export interface DayAcademics {
  revision: boolean;
  questionCounts: Record<string, number>;
  exatestScore?: number | null;
}

export interface DaySleep {
  bedtime: string | null;
  wakeTime: string | null;
  durationMinutes: number | null;
}

export interface DayData {
  morning: Record<string, boolean>;
  meals: Record<string, boolean>;
  foodTargets: { eggs: number; fruits: number; nuts: boolean };
  hydration: { litersConsumed: number };
  movement: Record<string, boolean>;
  movementDurations: Record<string, number>;
  night: Record<string, boolean>;
  sleep: DaySleep;
  academics: DayAcademics;
  recurringTasks: Record<string, boolean>;
}

export interface CompletionSections {
  morning: number | null;
  meals: number | null;
  hydration: number | null;
  movement: number | null;
  night: number | null;
  academics: number | null;
  recurring: number | null;
}

export interface CompletionItem {
  section: string;
  id: string;
  label: string;
  completed: boolean;
}

export interface Completion {
  date: string;
  overall: number;
  totalItems: number;
  completedItems: number;
  sections: CompletionSections;
  items?: CompletionItem[];
}

export interface DayResponse {
  date: string;
  day: DayData;
  completion: Completion;
  dueRecurring: RecurringTask[];
}

export type AssignmentStatus = 'Not started' | 'In progress' | 'Completed';

export interface Assignment {
  id: string;
  name: string;
  subject: string;
  description: string;
  deadline: string | null;
  status: AssignmentStatus;
  notes: string;
  createdAt: string;
}

export interface ExatestState {
  highestScore: number;
  history: { date: string; score: number }[];
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  reasonId: string | null;
  date: string;
  createdAt: string;
}

export interface StatsDay {
  date: string;
  overall: number;
  totalItems: number;
  completedItems: number;
  sections: CompletionSections;
  sleep: DaySleep;
  hydration: { litersConsumed: number; targetLiters: number };
  academics: DayAcademics;
  expensesTotal: number;
}

export interface StatsResponse {
  range: string;
  start: string;
  end: string;
  days: StatsDay[];
}

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface AchievementStats {
  totalCompletedTasks: number;
  totalQuestions: number;
  consistentStreak: number;
  hydratedStreak: number;
  sleepDays: number;
}

export interface AchievementsResponse {
  list: Achievement[];
  stats: AchievementStats;
}
