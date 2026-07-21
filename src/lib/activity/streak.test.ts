// Pure streak-logic tests. Run with: `bun test src/lib/activity/streak.test.ts`
// @ts-expect-error — bun:test types not shipped with @types/bun in this repo
import { describe, expect, test } from "bun:test";
import {
  currentStreak,
  longestStreak,
  activeDayCount,
  buildYearDays,
  mergeCalendars,
  computeStats,
  shiftDay,
  todayUTC,
} from "./streak";

const TODAY = "2026-07-21";
const YEST = "2026-07-20";

function seq(start: string, n: number) {
  const map: Record<string, number> = {};
  let d = start;
  for (let i = 0; i < n; i++) {
    map[d] = 1;
    d = shiftDay(d, -1);
  }
  return map;
}

describe("streak", () => {
  test("today active → streak includes today", () => {
    const m = seq(TODAY, 3);
    expect(currentStreak(m, TODAY)).toBe(3);
  });

  test("no activity today, yesterday active → streak alive through yesterday", () => {
    const m = seq(YEST, 14);
    expect(currentStreak(m, TODAY)).toBe(14);
  });

  test("adding today's activity extends streak by 1", () => {
    const m = seq(YEST, 14);
    m[TODAY] = 1;
    expect(currentStreak(m, TODAY)).toBe(15);
  });

  test("no activity today or yesterday → 0", () => {
    const m = { "2026-07-10": 3 };
    expect(currentStreak(m, TODAY)).toBe(0);
  });

  test("month boundary Jan 31 → Feb 1", () => {
    const m: Record<string, number> = { "2026-01-31": 1, "2026-02-01": 1 };
    expect(currentStreak(m, "2026-02-01")).toBe(2);
  });

  test("year boundary Dec 31 → Jan 1", () => {
    const m: Record<string, number> = { "2025-12-31": 1, "2026-01-01": 1 };
    expect(currentStreak(m, "2026-01-01")).toBe(2);
  });

  test("longest streak crosses months", () => {
    const days = buildYearDays(2026);
    const m: Record<string, number> = {};
    for (let d = new Date(Date.UTC(2026, 0, 28)); d <= new Date(Date.UTC(2026, 1, 5)); d.setUTCDate(d.getUTCDate() + 1)) {
      m[d.toISOString().slice(0, 10)] = 2;
    }
    expect(longestStreak(days, m)).toBe(9);
  });

  test("multiple platforms same day → 1 active day, counts sum", () => {
    const gh = { "2026-07-21": 3 };
    const lc = { "2026-07-21": 5 };
    const merged = mergeCalendars([gh, lc]);
    expect(merged["2026-07-21"]).toBe(8);
    expect(activeDayCount(buildYearDays(2026), merged)).toBe(1);
  });

  test("empty dataset yields zeros", () => {
    const s = computeStats({}, 2026, new Date("2026-07-21T12:00:00Z"));
    expect(s.longest).toBe(0);
    expect(s.active).toBe(0);
    expect(s.total).toBe(0);
    expect(s.current).toBe(0);
  });

  test("historical year → current streak is null", () => {
    const m = { "2024-12-31": 1 };
    const s = computeStats(m, 2024, new Date("2026-07-21T12:00:00Z"));
    expect(s.current).toBeNull();
    expect(s.active).toBe(1);
  });

  test("UTC normalization near midnight", () => {
    // 23:30 UTC on 2026-07-20 should normalize to 2026-07-20.
    const near = new Date("2026-07-20T23:30:00Z");
    expect(todayUTC(near)).toBe("2026-07-20");
  });

  test("duplicate same-day activity does not create multiple streak days", () => {
    const days = buildYearDays(2026);
    const m: Record<string, number> = { "2026-03-01": 5, "2026-03-02": 2 };
    expect(longestStreak(days, m)).toBe(2);
    expect(activeDayCount(days, m)).toBe(2);
  });
});
