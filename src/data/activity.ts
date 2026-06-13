// ============================================================
// ACTIVITY DATA — Unified daily activity from LeetCode, Codeforces,
// GeeksforGeeks, and GitHub. Update by editing `activityLog` below.
// Each entry: { date: "YYYY-MM-DD", count: number }
// The heatmap aggregates all sources into a single daily count.
// ============================================================

export interface ActivityEntry {
  date: string; // ISO date YYYY-MM-DD
  count: number; // 0..n contributions that day
}

// Deterministic seeded generator so SSR + client agree exactly.
// Generates ~12 months of realistic activity. Replace with real
// logged entries any time — manual entries override generated ones.
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateYear(): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  const today = new Date("2026-06-13"); // deterministic baseline
  const rand = seededRandom(20260613);
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const day = d.getDay();
    // Weekdays more active than weekends
    const base = day === 0 || day === 6 ? 0.55 : 0.82;
    const r = rand();
    let count = 0;
    if (r < base) {
      const intensity = rand();
      if (intensity < 0.4) count = 1;
      else if (intensity < 0.7) count = 2;
      else if (intensity < 0.9) count = 4;
      else count = 6;
    }
    entries.push({
      date: d.toISOString().slice(0, 10),
      count,
    });
  }
  return entries;
}

// Manual overrides — add real days here, e.g. { date: "2026-06-13", count: 5 }
export const manualActivity: ActivityEntry[] = [];

export const activityLog: ActivityEntry[] = (() => {
  const generated = generateYear();
  const map = new Map(generated.map((e) => [e.date, e.count]));
  for (const m of manualActivity) map.set(m.date, m.count);
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, count]) => ({ date, count }));
})();

// ---- Derived stats ----
export function computeStreaks(log: ActivityEntry[]) {
  let longest = 0;
  let current = 0;
  let running = 0;
  let activeThisYear = 0;
  let totalActive = 0;
  const thisYear = log[log.length - 1]?.date.slice(0, 4);

  for (const e of log) {
    if (e.count > 0) {
      running++;
      totalActive++;
      if (e.date.startsWith(thisYear ?? "")) activeThisYear++;
      if (running > longest) longest = running;
    } else {
      running = 0;
    }
  }
  // Current streak — count from the end
  for (let i = log.length - 1; i >= 0; i--) {
    if (log[i].count > 0) current++;
    else break;
  }
  return { currentStreak: current, longestStreak: longest, activeThisYear, totalActive };
}
