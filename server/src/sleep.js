function toMinutes(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// Duration from an evening bedtime to a next-morning wake time.
function computeSleepDuration(bedtime, wakeTime) {
  const b = toMinutes(bedtime);
  const w = toMinutes(wakeTime);
  if (b == null || w == null) return null;
  let duration = w - b;
  if (duration <= 0) duration += 24 * 60;
  return duration;
}

function formatDuration(minutes) {
  if (minutes == null) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

module.exports = { computeSleepDuration, formatDuration, toMinutes };
