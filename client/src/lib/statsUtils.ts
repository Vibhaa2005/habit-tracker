import type { StatsDay } from '../types';

export function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${h}h ${m}m`;
}

function toClockMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

// Standard deviation of clock times, treating times after 6pm and before 6am
// as belonging to the same "night" so bedtimes near midnight don't skew wildly.
function normalizedClockMinutes(hhmm: string) {
  const mins = toClockMinutes(hhmm);
  return mins < 12 * 60 ? mins + 24 * 60 : mins;
}

export function timeConsistency(times: string[]) {
  if (times.length < 2) return null;
  const mins = times.map(normalizedClockMinutes);
  const avg = average(mins);
  const variance = average(mins.map((m) => (m - avg) ** 2));
  return Math.sqrt(variance); // minutes of stddev
}

export function longestStreakAbove(days: StatsDay[], threshold: number) {
  let longest = 0;
  let current = 0;
  for (const d of days) {
    if (d.overall >= threshold) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}

export function lastNDays(days: StatsDay[], n: number) {
  return days.slice(-n);
}

export function daysWithSleep(days: StatsDay[]) {
  return days.filter((d) => d.sleep.durationMinutes != null);
}
