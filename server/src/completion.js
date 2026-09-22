const { tasksDueOn } = require('./recurrence');

function emptyDay() {
  return {
    morning: {},
    meals: {},
    foodTargets: { eggs: 0, fruits: 0, nuts: false },
    hydration: { litersConsumed: 0 },
    movement: {},
    movementDurations: {},
    night: {},
    sleep: { bedtime: null, wakeTime: null, durationMinutes: null },
    academics: {
      revision: false,
      questionCounts: {},
    },
    recurringTasks: {},
  };
}

function getDay(dailyData, dateStr) {
  const stored = dailyData[dateStr];
  const base = emptyDay();
  if (!stored) return base;
  return {
    ...base,
    ...stored,
    foodTargets: { ...base.foodTargets, ...(stored.foodTargets || {}) },
    hydration: { ...base.hydration, ...(stored.hydration || {}) },
    sleep: { ...base.sleep, ...(stored.sleep || {}) },
    academics: { ...base.academics, ...(stored.academics || {}) },
    morning: { ...(stored.morning || {}) },
    meals: { ...(stored.meals || {}) },
    movement: { ...(stored.movement || {}) },
    movementDurations: { ...(stored.movementDurations || {}) },
    night: { ...(stored.night || {}) },
    recurringTasks: { ...(stored.recurringTasks || {}) },
  };
}

// Builds the list of { key, section, completed } active checklist items for a
// day, given the current settings. Only active (enabled, and — for recurring
// tasks — actually due) items count toward completion.
function activeItems(settings, day, dateStr) {
  const items = [];

  for (const item of settings.morningRoutine.filter((i) => i.enabled)) {
    items.push({ section: 'morning', id: item.id, label: item.label, completed: !!day.morning[item.id] });
  }

  for (const meal of settings.meals.filter((i) => i.enabled)) {
    items.push({ section: 'meals', id: meal.id, label: meal.label, completed: !!day.meals[meal.id] });
  }
  for (const key of ['eggs', 'fruits']) {
    const target = settings.foodTargets[key] || 0;
    if (target > 0) {
      items.push({
        section: 'meals',
        id: `target_${key}`,
        label: `${key} target`,
        completed: (day.foodTargets[key] || 0) >= target,
      });
    }
  }
  items.push({ section: 'meals', id: 'nuts_seeds', label: 'Nuts/Seeds', completed: !!day.foodTargets.nuts });

  if ((settings.hydration.targetLiters || 0) > 0) {
    items.push({
      section: 'hydration',
      id: 'hydration',
      label: 'Hydration target',
      completed: (day.hydration.litersConsumed || 0) >= settings.hydration.targetLiters,
    });
  }

  for (const item of settings.movement.filter((i) => i.enabled)) {
    items.push({ section: 'movement', id: item.id, label: item.label, completed: !!day.movement[item.id] });
  }

  for (const item of settings.nightRoutine.filter((i) => i.enabled)) {
    items.push({ section: 'night', id: item.id, label: item.label, completed: !!day.night[item.id] });
  }

  // Academics: revision is always tracked; question categories are a fully
  // user-editable list (add/remove/rename/retarget from Customize) and only
  // count toward completion once a target > 0 is set.
  items.push({ section: 'academics', id: 'revision', label: 'Revision', completed: !!day.academics.revision });
  for (const cat of settings.academicCategories.filter((c) => c.enabled)) {
    if ((cat.target || 0) > 0) {
      items.push({
        section: 'academics',
        id: cat.id,
        label: cat.label,
        completed: (day.academics.questionCounts[cat.id] || 0) >= cat.target,
      });
    }
  }

  for (const task of tasksDueOn(settings.recurringTasks, dateStr)) {
    items.push({
      section: 'recurring',
      id: task.id,
      label: task.label,
      completed: !!day.recurringTasks[task.id],
    });
  }

  return items;
}

function computeCompletion(settings, dailyData, dateStr) {
  const day = getDay(dailyData, dateStr);
  const items = activeItems(settings, day, dateStr);

  const bySection = {};
  for (const item of items) {
    if (!bySection[item.section]) bySection[item.section] = { total: 0, completed: 0 };
    bySection[item.section].total += 1;
    if (item.completed) bySection[item.section].completed += 1;
  }

  const pct = (s) => (bySection[s] && bySection[s].total > 0 ? Math.round((bySection[s].completed / bySection[s].total) * 100) : null);

  const totalItems = items.length;
  const completedItems = items.filter((i) => i.completed).length;
  const overall = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return {
    date: dateStr,
    overall,
    totalItems,
    completedItems,
    sections: {
      morning: pct('morning'),
      meals: pct('meals'),
      hydration: pct('hydration'),
      movement: pct('movement'),
      night: pct('night'),
      academics: pct('academics'),
      recurring: pct('recurring'),
    },
    items,
  };
}

module.exports = { emptyDay, getDay, activeItems, computeCompletion };
