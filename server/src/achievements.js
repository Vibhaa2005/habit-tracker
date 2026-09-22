const { computeCompletion } = require('./completion');

const CATALOG = [
  { id: 'first_day', emoji: '🌱', title: 'First Day', description: 'You tracked your very first day.' },
  { id: 'streak_7', emoji: '🔥', title: '7 Day Consistency', description: '7 days in a row at 50%+ completion.' },
  { id: 'streak_14', emoji: '🌿', title: '14 Day Consistency', description: '14 days in a row at 50%+ completion.' },
  { id: 'streak_30', emoji: '🌳', title: '30 Day Consistency', description: '30 days in a row at 50%+ completion.' },
  { id: 'tasks_100', emoji: '⭐', title: '100 Tasks Completed', description: '100 checklist items completed in total.' },
  { id: 'questions_100', emoji: '📚', title: '100 Questions Solved', description: '100 practice questions across Probability, LeetCode & Codeforces.' },
  { id: 'hydrated_7', emoji: '💧', title: '7 Days Hydrated', description: '7 days in a row hitting your hydration target.' },
  { id: 'sleep_7', emoji: '😴', title: '7 Days of Sleep Tracking', description: '7 days with sleep logged.' },
];

function allDatesSorted(dailyData) {
  return Object.keys(dailyData).sort();
}

function longestStreak(dates, predicate) {
  let longest = 0;
  let current = 0;
  let prev = null;
  for (const d of dates) {
    if (!predicate(d)) {
      current = 0;
      prev = null;
      continue;
    }
    if (prev) {
      const diffDays = (new Date(d) - new Date(prev)) / 86400000;
      current = diffDays === 1 ? current + 1 : 1;
    } else {
      current = 1;
    }
    longest = Math.max(longest, current);
    prev = d;
  }
  return longest;
}

function computeAchievementProgress(db) {
  const { settings, dailyData } = db;
  const dates = allDatesSorted(dailyData);

  let totalCompletedTasks = 0;
  let totalQuestions = 0;
  const hydratedDates = [];
  const sleepDates = [];
  const completionByDate = {};

  for (const d of dates) {
    const c = computeCompletion(settings, dailyData, d);
    completionByDate[d] = c.overall;
    totalCompletedTasks += c.completedItems;

    const day = dailyData[d] || {};
    const academics = day.academics || {};
    totalQuestions +=
      (academics.probabilityQuestions || 0) + (academics.leetcodeQuestions || 0) + (academics.codeforcesQuestions || 0);

    const hydration = day.hydration || {};
    if ((hydration.litersConsumed || 0) >= (settings.hydration.targetLiters || 0) && settings.hydration.targetLiters > 0) {
      hydratedDates.push(d);
    }

    const sleep = day.sleep || {};
    if (sleep.bedtime && sleep.wakeTime) {
      sleepDates.push(d);
    }
  }

  const consistentStreak = longestStreak(dates, (d) => (completionByDate[d] || 0) >= 50);
  const hydratedStreak = longestStreak(hydratedDates, () => true);

  const progress = {
    first_day: dates.length >= 1,
    streak_7: consistentStreak >= 7,
    streak_14: consistentStreak >= 14,
    streak_30: consistentStreak >= 30,
    tasks_100: totalCompletedTasks >= 100,
    questions_100: totalQuestions >= 100,
    hydrated_7: hydratedStreak >= 7,
    sleep_7: sleepDates.length >= 7,
  };

  return { progress, stats: { totalCompletedTasks, totalQuestions, consistentStreak, hydratedStreak, sleepDays: sleepDates.length } };
}

function getAchievements(db) {
  const { progress, stats } = computeAchievementProgress(db);
  const unlocked = db.achievements || {};

  let changed = false;
  for (const item of CATALOG) {
    if (progress[item.id] && !unlocked[item.id]) {
      unlocked[item.id] = { unlockedAt: new Date().toISOString() };
      changed = true;
    }
  }
  db.achievements = unlocked;

  const list = CATALOG.map((item) => ({
    ...item,
    unlocked: !!unlocked[item.id],
    unlockedAt: unlocked[item.id] ? unlocked[item.id].unlockedAt : null,
  }));

  return { list, stats, changed };
}

module.exports = { getAchievements, CATALOG };
