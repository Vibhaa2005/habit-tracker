// Default settings & seed data for a fresh LifeOS database.
// Everything here is editable later via the Customize page / settings API —
// these are just sensible starting values, never hard-coded assumptions at runtime.

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

const MORNING_ROUTINE = [
  { id: 'wakeUp', label: 'Wake up', enabled: true, order: 0 },
  { id: 'getOutOfBed', label: 'Get out of bed', enabled: true, order: 1 },
  { id: 'makeBed', label: 'Make bed', enabled: true, order: 2 },
  { id: 'hydration', label: 'Hydration', enabled: true, order: 3 },
  { id: 'meditation', label: 'Breathing / Meditation', enabled: true, order: 4 },
  { id: 'phoneCharging', label: 'Phone charging', enabled: true, order: 5 },
  { id: 'bathroom', label: 'Bathroom routine', enabled: true, order: 6 },
  { id: 'faceWash', label: 'Face wash', enabled: true, order: 7 },
  { id: 'moisturise', label: 'Moisturise', enabled: true, order: 8 },
  { id: 'hairCare', label: 'Hair care', enabled: true, order: 9 },
];

const NIGHT_ROUTINE = [
  { id: 'brushTeeth', label: 'Brush teeth', enabled: true, order: 0 },
  { id: 'tongueCleaning', label: 'Tongue cleaning', enabled: true, order: 1 },
  { id: 'bathing', label: 'Bathing', enabled: true, order: 2 },
  { id: 'moisturise', label: 'Moisturising', enabled: true, order: 3 },
  { id: 'hairCare', label: 'Hair care', enabled: true, order: 4 },
  { id: 'soakNuts', label: 'Soak nuts', enabled: true, order: 5 },
  { id: 'meditation', label: 'Meditation / Breathing', enabled: true, order: 6 },
  { id: 'sleep', label: 'Sleep', enabled: true, order: 7 },
];

const MEALS = [
  { id: 'breakfast', label: 'Breakfast', enabled: true, order: 0 },
  { id: 'midMorningSnack', label: 'Mid-morning snack', enabled: true, order: 1 },
  { id: 'lunch', label: 'Lunch', enabled: true, order: 2 },
  { id: 'eveningSnack', label: 'Evening snack', enabled: true, order: 3 },
  { id: 'dinner', label: 'Dinner', enabled: true, order: 4 },
];

const MOVEMENT = [
  { id: 'postLunchWalk', label: 'Post-lunch walk', enabled: true, order: 0, trackDuration: true },
  { id: 'postDinnerWalk', label: 'Post-dinner walk', enabled: true, order: 1, trackDuration: true },
];

const EXPENSE_REASONS = [
  { id: 'food', label: 'Food', enabled: true, order: 0 },
  { id: 'transport', label: 'Transport', enabled: true, order: 1 },
  { id: 'shopping', label: 'Shopping', enabled: true, order: 2 },
  { id: 'bills', label: 'Bills', enabled: true, order: 3 },
  { id: 'entertainment', label: 'Entertainment', enabled: true, order: 4 },
  { id: 'other', label: 'Other', enabled: true, order: 5 },
];

// Fixed reference Sundays/Fridays used purely as phase anchors for
// alternate-week recurrence math (does not need to be user-visible).
const ANCHOR_SUNDAY = '2024-01-07';
const ANCHOR_FRIDAY = '2024-01-05';

const RECURRING_TASKS = [
  {
    id: uid('rec'),
    label: 'Hair washing',
    category: 'Weekly care',
    frequencyType: 'weekly',
    weekdays: [3, 0], // Wed, Sun
    intervalDays: null,
    anchorDate: null,
    enabled: true,
  },
  {
    id: uid('rec'),
    label: 'Nail trimming',
    category: 'Weekly care',
    frequencyType: 'biweekly',
    weekdays: [0], // Sunday
    intervalDays: null,
    anchorDate: ANCHOR_SUNDAY,
    enabled: true,
  },
  {
    id: uid('rec'),
    label: 'Laundry',
    category: 'Weekly care',
    frequencyType: 'weekly',
    weekdays: [5], // Friday
    intervalDays: null,
    anchorDate: null,
    enabled: true,
  },
  {
    id: uid('rec'),
    label: 'Change bedsheets',
    category: 'Weekly care',
    frequencyType: 'biweekly',
    weekdays: [5],
    intervalDays: null,
    anchorDate: ANCHOR_FRIDAY,
    enabled: true,
  },
  {
    id: uid('rec'),
    label: 'Change towels',
    category: 'Weekly care',
    frequencyType: 'biweekly',
    weekdays: [5],
    intervalDays: null,
    anchorDate: ANCHOR_FRIDAY,
    enabled: true,
  },
  {
    id: uid('rec'),
    label: 'Weekly revision',
    category: 'Academics',
    frequencyType: 'weekly',
    weekdays: [6], // Saturday
    intervalDays: null,
    anchorDate: null,
    enabled: true,
  },
];

const ACADEMIC_CATEGORIES = [
  { id: 'probability', label: 'Probability', target: 10, enabled: true, order: 0 },
  { id: 'leetcode', label: 'LeetCode', target: 3, enabled: true, order: 1 },
  { id: 'codeforces', label: 'Codeforces', target: 2, enabled: true, order: 2 },
];

function defaultSettings() {
  return {
    wakeUpTime: '06:00',
    morningRoutine: MORNING_ROUTINE,
    nightRoutine: NIGHT_ROUTINE,
    meals: MEALS,
    movement: MOVEMENT,
    foodTargets: { eggs: 2, fruits: 2 },
    hydration: { targetLiters: 2.5 },
    sleepTargets: { bedtime: '22:30', wakeTime: '06:00', durationHours: 7.5 },
    academicCategories: ACADEMIC_CATEGORIES,
    recurringTasks: RECURRING_TASKS,
    expenseReasons: EXPENSE_REASONS,
  };
}

function defaultDb() {
  return {
    settings: defaultSettings(),
    dailyData: {},
    assignments: [],
    expenses: [],
    exatest: { highestScore: 0, history: [] },
    achievements: {}, // id -> { unlockedAt }
  };
}

module.exports = { defaultDb, defaultSettings, uid };
