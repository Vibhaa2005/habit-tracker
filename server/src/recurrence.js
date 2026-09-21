// Recurrence engine: decides whether a recurring task is "due" on a given date.
// Supported frequencyType values: 'daily' | 'weekly' | 'biweekly' | 'everyNDays'

function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function daysBetween(aStr, bStr) {
  const a = parseDate(aStr);
  const b = parseDate(bStr);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function weekdayOf(dateStr) {
  return parseDate(dateStr).getUTCDay(); // 0=Sun..6=Sat
}

function isDue(task, dateStr) {
  if (!task.enabled) return false;

  switch (task.frequencyType) {
    case 'daily':
      return true;

    case 'weekly':
      return (task.weekdays || []).includes(weekdayOf(dateStr));

    case 'biweekly': {
      if (!(task.weekdays || []).includes(weekdayOf(dateStr))) return false;
      if (!task.anchorDate) return true;
      const diff = daysBetween(task.anchorDate, dateStr);
      const weeks = Math.floor(diff / 7);
      return diff >= 0 ? weeks % 2 === 0 : Math.abs(weeks) % 2 === 0;
    }

    case 'everyNDays': {
      if (!task.anchorDate || !task.intervalDays) return false;
      const diff = daysBetween(task.anchorDate, dateStr);
      if (diff < 0) return false;
      return diff % task.intervalDays === 0;
    }

    default:
      return false;
  }
}

function tasksDueOn(recurringTasks, dateStr) {
  return recurringTasks.filter((t) => isDue(t, dateStr));
}

module.exports = { isDue, tasksDueOn, daysBetween, weekdayOf };
