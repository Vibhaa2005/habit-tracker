const express = require('express');
const cors = require('cors');
const { loadDb, saveDb } = require('./store');
const { uid } = require('./defaults');
const { computeCompletion, getDay } = require('./completion');
const { tasksDueOn } = require('./recurrence');
const { computeSleepDuration } = require('./sleep');
const { getAchievements } = require('./achievements');

const app = express();
app.use(cors());
app.use(express.json());

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const todayStr = () => new Date().toISOString().slice(0, 10);

function asyncRoute(handler) {
  return (req, res, next) => handler(req, res).catch(next);
}

// ---------- Settings ----------

app.get(
  '/api/settings',
  asyncRoute(async (req, res) => {
    const db = await loadDb();
    res.json(db.settings);
  })
);

app.put(
  '/api/settings',
  asyncRoute(async (req, res) => {
    const db = await loadDb();
    db.settings = req.body;
    await saveDb(db);
    res.json(db.settings);
  })
);

// ---------- Daily data ----------

function mergeDayPatch(existing, patch) {
  const next = { ...existing };
  for (const [key, value] of Object.entries(patch)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      next[key] = { ...(existing[key] || {}), ...value };
    } else {
      next[key] = value;
    }
  }
  return next;
}

app.get(
  '/api/day/:date',
  asyncRoute(async (req, res) => {
    const { date } = req.params;
    if (!DATE_RE.test(date)) return res.status(400).json({ error: 'Invalid date' });
    const db = await loadDb();
    const day = getDay(db.dailyData, date);
    const completion = computeCompletion(db.settings, db.dailyData, date);
    const dueRecurring = tasksDueOn(db.settings.recurringTasks, date);
    res.json({ date, day, completion, dueRecurring });
  })
);

app.patch(
  '/api/day/:date',
  asyncRoute(async (req, res) => {
    const { date } = req.params;
    if (!DATE_RE.test(date)) return res.status(400).json({ error: 'Invalid date' });
    const db = await loadDb();
    const existing = getDay(db.dailyData, date);
    const merged = mergeDayPatch(existing, req.body || {});

    if (merged.sleep && (req.body.sleep?.bedtime !== undefined || req.body.sleep?.wakeTime !== undefined)) {
      merged.sleep.durationMinutes = computeSleepDuration(merged.sleep.bedtime, merged.sleep.wakeTime);
    }

    db.dailyData[date] = merged;

    if (req.body.academics && typeof req.body.academics.exatestScore === 'number') {
      const score = req.body.academics.exatestScore;
      if (score > (db.exatest.highestScore || 0)) db.exatest.highestScore = score;
      db.exatest.history = db.exatest.history.filter((h) => h.date !== date);
      db.exatest.history.push({ date, score });
      db.exatest.history.sort((a, b) => (a.date < b.date ? -1 : 1));
    }

    await saveDb(db);

    const completion = computeCompletion(db.settings, db.dailyData, date);
    res.json({ date, day: merged, completion });
  })
);

// ---------- Assignments ----------

app.get(
  '/api/assignments',
  asyncRoute(async (req, res) => {
    const db = await loadDb();
    res.json(db.assignments);
  })
);

app.post(
  '/api/assignments',
  asyncRoute(async (req, res) => {
    const db = await loadDb();
    const assignment = {
      id: uid('asg'),
      name: req.body.name || 'Untitled assignment',
      subject: req.body.subject || '',
      description: req.body.description || '',
      deadline: req.body.deadline || null,
      status: req.body.status || 'Not started',
      notes: req.body.notes || '',
      createdAt: new Date().toISOString(),
    };
    db.assignments.push(assignment);
    await saveDb(db);
    res.status(201).json(assignment);
  })
);

app.put(
  '/api/assignments/:id',
  asyncRoute(async (req, res) => {
    const db = await loadDb();
    const idx = db.assignments.findIndex((a) => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    db.assignments[idx] = { ...db.assignments[idx], ...req.body, id: db.assignments[idx].id };
    await saveDb(db);
    res.json(db.assignments[idx]);
  })
);

app.delete(
  '/api/assignments/:id',
  asyncRoute(async (req, res) => {
    const db = await loadDb();
    db.assignments = db.assignments.filter((a) => a.id !== req.params.id);
    await saveDb(db);
    res.status(204).end();
  })
);

// ---------- Expenses ----------

app.get(
  '/api/expenses',
  asyncRoute(async (req, res) => {
    const db = await loadDb();
    res.json(db.expenses);
  })
);

app.post(
  '/api/expenses',
  asyncRoute(async (req, res) => {
    const db = await loadDb();
    const amount = Number(req.body.amount);
    if (!req.body.date || !DATE_RE.test(req.body.date)) return res.status(400).json({ error: 'Invalid date' });
    if (Number.isNaN(amount)) return res.status(400).json({ error: 'Invalid amount' });
    const expense = {
      id: uid('exp'),
      name: req.body.name || 'Untitled expense',
      amount,
      reasonId: req.body.reasonId || null,
      date: req.body.date,
      createdAt: new Date().toISOString(),
    };
    db.expenses.push(expense);
    await saveDb(db);
    res.status(201).json(expense);
  })
);

app.put(
  '/api/expenses/:id',
  asyncRoute(async (req, res) => {
    const db = await loadDb();
    const idx = db.expenses.findIndex((e) => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const patch = { ...req.body };
    if (patch.amount !== undefined) patch.amount = Number(patch.amount);
    db.expenses[idx] = { ...db.expenses[idx], ...patch, id: db.expenses[idx].id };
    await saveDb(db);
    res.json(db.expenses[idx]);
  })
);

app.delete(
  '/api/expenses/:id',
  asyncRoute(async (req, res) => {
    const db = await loadDb();
    db.expenses = db.expenses.filter((e) => e.id !== req.params.id);
    await saveDb(db);
    res.status(204).end();
  })
);

// ---------- Exatest ----------

app.get(
  '/api/exatest',
  asyncRoute(async (req, res) => {
    const db = await loadDb();
    res.json(db.exatest);
  })
);

app.post(
  '/api/exatest',
  asyncRoute(async (req, res) => {
    const db = await loadDb();
    const date = req.body.date || todayStr();
    const score = Number(req.body.score);
    if (Number.isNaN(score)) return res.status(400).json({ error: 'Invalid score' });

    if (score > (db.exatest.highestScore || 0)) db.exatest.highestScore = score;
    db.exatest.history = db.exatest.history.filter((h) => h.date !== date);
    db.exatest.history.push({ date, score });
    db.exatest.history.sort((a, b) => (a.date < b.date ? -1 : 1));

    const day = getDay(db.dailyData, date);
    day.academics = { ...day.academics, exatestScore: score };
    db.dailyData[date] = day;

    await saveDb(db);
    res.json(db.exatest);
  })
);

// ---------- Stats ----------

function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const RANGE_DAYS = { '1m': 30, '3m': 90, '6m': 180, '1y': 365 };

app.get(
  '/api/stats',
  asyncRoute(async (req, res) => {
    const range = req.query.range || '3m';
    const days = RANGE_DAYS[range] || 90;
    const db = await loadDb();
    // The server's clock is UTC-based (Date#toISOString always is), which can
    // be a different calendar day than the browser's local "today" — the
    // client passes its own local date so the range actually ends on the
    // user's today instead of the server's.
    const end = req.query.end && DATE_RE.test(req.query.end) ? req.query.end : todayStr();
    const start = addDays(end, -(days - 1));

    const expensesByDate = {};
    for (const exp of db.expenses) {
      expensesByDate[exp.date] = (expensesByDate[exp.date] || 0) + (exp.amount || 0);
    }

    const out = [];
    let cursor = start;
    while (cursor <= end) {
      const completion = computeCompletion(db.settings, db.dailyData, cursor);
      const day = getDay(db.dailyData, cursor);
      out.push({
        date: cursor,
        overall: completion.overall,
        totalItems: completion.totalItems,
        completedItems: completion.completedItems,
        sections: completion.sections,
        sleep: {
          bedtime: day.sleep.bedtime,
          wakeTime: day.sleep.wakeTime,
          durationMinutes: day.sleep.durationMinutes,
        },
        hydration: {
          litersConsumed: day.hydration.litersConsumed || 0,
          targetLiters: db.settings.hydration.targetLiters,
        },
        academics: {
          revision: !!day.academics.revision,
          questionCounts: day.academics.questionCounts || {},
          exatestScore: day.academics.exatestScore || null,
        },
        expensesTotal: expensesByDate[cursor] || 0,
      });
      cursor = addDays(cursor, 1);
    }

    res.json({ range, start, end, days: out });
  })
);

app.get(
  '/api/day/:date/detail',
  asyncRoute(async (req, res) => {
    const { date } = req.params;
    if (!DATE_RE.test(date)) return res.status(400).json({ error: 'Invalid date' });
    const db = await loadDb();
    const day = getDay(db.dailyData, date);
    const completion = computeCompletion(db.settings, db.dailyData, date);
    res.json({ date, day, completion });
  })
);

// ---------- Achievements ----------

app.get(
  '/api/achievements',
  asyncRoute(async (req, res) => {
    const db = await loadDb();
    const result = getAchievements(db);
    if (result.changed) await saveDb(db);
    res.json({ list: result.list, stats: result.stats });
  })
);

module.exports = app;
