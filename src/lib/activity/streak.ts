// Pure, isomorphic streak / aggregation helpers.
// All dates are normalized YYYY-MM-DD in UTC to match the upstream adapters.

import type { DayMap } from "./types";

export function todayUTC(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function shiftDay(date: string, delta: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

export function buildYearDays(year: number): string[] {
  const days: string[] = [];
  const end = new Date(Date.UTC(year, 11, 31));
  for (
    let d = new Date(Date.UTC(year, 0, 1));
    d <= end;
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export function mergeCalendars(maps: DayMap[]): DayMap {
  const out: DayMap = {};
  for (const m of maps) {
    for (const [k, v] of Object.entries(m)) {
      out[k] = (out[k] ?? 0) + v;
    }
  }
  return out;
}

/**
 * Current streak semantics:
 *   - If TODAY has activity   → count backward from today.
 *   - Else if YESTERDAY has activity → count backward from yesterday
 *     (user keeps their streak during the current day before committing today).
 *   - Else → 0.
 *
 * `today` must be a normalized YYYY-MM-DD string.
 * Not meaningful for historical years — callers should hide the metric there.
 */
export function currentStreak(map: DayMap, today: string): number {
  const isActive = (d: string) => (map[d] ?? 0) > 0;
  let cursor: string;
  if (isActive(today)) {
    cursor = today;
  } else {
    const yesterday = shiftDay(today, -1);
    if (!isActive(yesterday)) return 0;
    cursor = yesterday;
  }
  let count = 0;
  while (isActive(cursor)) {
    count++;
    cursor = shiftDay(cursor, -1);
  }
  return count;
}

export function longestStreak(days: string[], map: DayMap): number {
  let longest = 0;
  let run = 0;
  for (const d of days) {
    if ((map[d] ?? 0) > 0) {
      run++;
      if (run > longest) longest = run;
    } else {
      run = 0;
    }
  }
  return longest;
}

export function activeDayCount(days: string[], map: DayMap): number {
  let n = 0;
  for (const d of days) if ((map[d] ?? 0) > 0) n++;
  return n;
}

export function totalActivity(map: DayMap): number {
  let total = 0;
  for (const v of Object.values(map)) total += v;
  return total;
}

export function computeStats(
  map: DayMap,
  year: number,
  now: Date = new Date(),
) {
  const days = buildYearDays(year);
  const today = todayUTC(now);
  const nowYear = Number(today.slice(0, 4));
  return {
    longest: longestStreak(days, map),
    active: activeDayCount(days, map),
    total: totalActivity(map),
    // Current streak is only meaningful for the current calendar year.
    // For historical years we return null so the UI can render "—".
    current: year === nowYear ? currentStreak(map, today) : null,
  };
}
