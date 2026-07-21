// ============================================================
// Live activity server functions — registry + cache-through
//
// Each platform is implemented as an "adapter" that returns either
//   { ok: true, calendar, meta }   — legitimate success (including zeros)
//   { ok: false, error }           — upstream failed / malformed
//
// A shared `withCache` wrapper turns that into an ActivityResult:
//   ok=true  → persisted as last-known-good, returned as status:"fresh"
//   ok=false → returns persisted snapshot as status:"cached", or
//              status:"unavailable" if no snapshot was ever stored.
//
// This guarantees: a failed request NEVER destroys valid cache data,
// and a legitimate zero is still accepted (via the discriminated union).
// ============================================================
import { createServerFn } from "@tanstack/react-start";
import {
  githubInput,
  leetcodeInput,
  codeforcesInput,
  codechefInput,
  hackerrankInput,
  gfgInput,
} from "./activity-schemas";
import type {
  DayMap,
  ActivityMeta,
  ActivityResult,
  PlatformId,
} from "./activity/types";

// Re-export ActivityResult for existing importers.
export type { ActivityResult } from "./activity/types";

type FetchOk = { ok: true; calendar: DayMap; meta: ActivityMeta };
type FetchErr = { ok: false; error: string };
type FetchOutcome = FetchOk | FetchErr;

// ---------- shared cache-through wrapper ----------
async function withCache(
  platform: PlatformId,
  username: string,
  year: number,
  fresh: () => Promise<FetchOutcome>,
): Promise<ActivityResult> {
  const { readSnapshot, writeSnapshot } = await import("./activity/cache.server");
  const key = { platform, username, year };

  let outcome: FetchOutcome;
  try {
    outcome = await fresh();
  } catch (e) {
    outcome = { ok: false, error: `${platform} temporarily unavailable` };
    console.error(`[activity/${platform}] adapter threw`, e);
  }

  if (outcome.ok) {
    const now = new Date().toISOString();
    // Fire-and-forget; do not let cache write failures affect the response.
    void writeSnapshot(key, {
      calendar: outcome.calendar,
      meta: outcome.meta,
      fetchedAt: now,
    });
    return {
      calendar: outcome.calendar,
      meta: outcome.meta,
      status: "fresh",
      fetchedAt: now,
    };
  }

  const snap = await readSnapshot(key);
  if (snap) {
    return {
      calendar: snap.calendar,
      meta: snap.meta,
      status: "cached",
      fetchedAt: snap.fetchedAt,
      error: outcome.error,
    };
  }
  return {
    calendar: {},
    meta: {},
    status: "unavailable",
    fetchedAt: null,
    error: outcome.error,
  };
}

// ============================================================
// Adapters — one per platform. Only these know platform APIs.
// ============================================================

// ---------- GitHub ----------
async function fetchGithub(username: string, year: number): Promise<FetchOutcome> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return { ok: false, error: "GitHub temporarily unavailable" };

  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;
  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        followers { totalCount }
        following { totalCount }
        repositories(privacy: PUBLIC) { totalCount }
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionCount } }
          }
        }
      }
    }`;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "lovable-portfolio",
    },
    body: JSON.stringify({ query, variables: { login: username, from, to } }),
  });
  if (!res.ok) return { ok: false, error: "GitHub temporarily unavailable" };
  const json: any = await res.json();
  const user = json?.data?.user;
  if (!user) return { ok: false, error: "GitHub temporarily unavailable" };

  const calendar: DayMap = {};
  for (const w of user.contributionsCollection.contributionCalendar.weeks) {
    for (const d of w.contributionDays) calendar[d.date] = d.contributionCount;
  }
  return {
    ok: true,
    calendar,
    meta: {
      totalContributions:
        user.contributionsCollection.contributionCalendar.totalContributions,
      repos: user.repositories.totalCount,
      followers: user.followers.totalCount,
      following: user.following.totalCount,
    },
  };
}

// ---------- LeetCode ----------
async function fetchLeetcode(username: string, year: number): Promise<FetchOutcome> {
  const query = `
    query userData($username: String!, $year: Int!) {
      matchedUser(username: $username) {
        submitStatsGlobal { acSubmissionNum { difficulty count } }
        userCalendar(year: $year) { submissionCalendar }
      }
      userContestRanking(username: $username) { rating attendedContestsCount }
    }`;

  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; lovable-portfolio/1.0)",
      Referer: `https://leetcode.com/u/${username}/`,
    },
    body: JSON.stringify({ query, variables: { username, year } }),
  });
  if (!res.ok) return { ok: false, error: "LeetCode temporarily unavailable" };
  const json: any = await res.json();
  const user = json?.data?.matchedUser;
  if (!user) return { ok: false, error: "LeetCode temporarily unavailable" };

  const raw = user.userCalendar?.submissionCalendar ?? "{}";
  const parsed: Record<string, number> =
    typeof raw === "string" ? JSON.parse(raw) : raw;
  const calendar: DayMap = {};
  for (const [ts, count] of Object.entries(parsed)) {
    const d = new Date(Number(ts) * 1000);
    if (d.getUTCFullYear() !== year) continue;
    const key = d.toISOString().slice(0, 10);
    calendar[key] = (calendar[key] ?? 0) + Number(count);
  }
  const ac = user.submitStatsGlobal?.acSubmissionNum ?? [];
  const byDiff = Object.fromEntries(ac.map((a: any) => [a.difficulty, a.count]));
  const contest = json?.data?.userContestRanking;
  return {
    ok: true,
    calendar,
    meta: {
      totalSolved: byDiff.All ?? 0,
      easy: byDiff.Easy ?? 0,
      medium: byDiff.Medium ?? 0,
      hard: byDiff.Hard ?? 0,
      contestRating: contest?.rating ? Math.round(contest.rating) : null,
      contestsAttended: contest?.attendedContestsCount ?? 0,
    },
  };
}

// ---------- Codeforces ----------
async function fetchCodeforces(username: string, year: number): Promise<FetchOutcome> {
  const fetchWithRetry = async (url: string, attempts = 3): Promise<Response | null> => {
    for (let i = 0; i < attempts; i++) {
      try {
        const r = await fetch(url, { headers: { "User-Agent": "lovable-portfolio" } });
        if (r.ok) return r;
        if (r.status < 500 && r.status !== 429) return r;
      } catch { /* retry */ }
      await new Promise((res) => setTimeout(res, 300 * Math.pow(2, i)));
    }
    return null;
  };

  const [statusRes, infoRes] = await Promise.all([
    fetchWithRetry(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(username)}`),
    fetchWithRetry(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(username)}`),
  ]);
  if (!statusRes || !statusRes.ok) {
    return { ok: false, error: "Codeforces temporarily unavailable" };
  }
  const status: any = await statusRes.json();
  const info: any = infoRes && infoRes.ok ? await infoRes.json() : null;
  const calendar: DayMap = {};
  for (const s of status.result ?? []) {
    const d = new Date(s.creationTimeSeconds * 1000);
    if (d.getUTCFullYear() !== year) continue;
    const key = d.toISOString().slice(0, 10);
    calendar[key] = (calendar[key] ?? 0) + 1;
  }
  const u = info?.result?.[0];
  return {
    ok: true,
    calendar,
    meta: {
      rating: u?.rating ?? null,
      maxRating: u?.maxRating ?? null,
      rank: u?.rank ?? "unrated",
      maxRank: u?.maxRank ?? "unrated",
    },
  };
}

// ---------- CodeChef ----------
async function fetchCodechef(username: string, year: number): Promise<FetchOutcome> {
  const res = await fetch(`https://www.codechef.com/users/${encodeURIComponent(username)}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; lovable-portfolio/1.0)" },
  });
  if (!res.ok) return { ok: false, error: "CodeChef temporarily unavailable" };
  const html = await res.text();
  const m = html.match(/userDailySubmissionsStats\s*=\s*(\[[\s\S]*?\]);/);
  const calendar: DayMap = {};
  if (m) {
    const arr: Array<{ date: string; value: string | number }> = JSON.parse(m[1]);
    for (const { date, value } of arr) {
      const [y, mo, d] = date.split("-").map(Number);
      if (y !== year) continue;
      const key = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      calendar[key] = (calendar[key] ?? 0) + Number(value);
    }
  }
  const ratingMatch = html.match(/class="rating-number"[^>]*>(\d+)</);
  const starsMatch = html.match(/rating-star[^>]*>([★]+)/);
  return {
    ok: true,
    calendar,
    meta: {
      rating: ratingMatch ? Number(ratingMatch[1]) : null,
      stars: starsMatch ? starsMatch[1].length : null,
    },
  };
}

// ---------- HackerRank ----------
async function fetchHackerrank(username: string, year: number): Promise<FetchOutcome> {
  const res = await fetch(
    `https://www.hackerrank.com/rest/hackers/${encodeURIComponent(username)}/submission_histories/`,
    { headers: { "User-Agent": "Mozilla/5.0 (compatible; lovable-portfolio/1.0)" } },
  );
  if (!res.ok) return { ok: false, error: "HackerRank temporarily unavailable" };
  const json: Record<string, number> = await res.json();
  const calendar: DayMap = {};
  for (const [date, count] of Object.entries(json)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (Number(date.slice(0, 4)) !== year) continue;
    calendar[date] = (calendar[date] ?? 0) + Number(count);
  }
  return { ok: true, calendar, meta: {} };
}

// ---------- GeeksforGeeks ----------
async function fetchGfg(username: string, year: number): Promise<FetchOutcome> {
  const res = await fetch(
    `https://gfg-stats-api.vercel.app/${encodeURIComponent(username)}/heatmap`,
    { headers: { "User-Agent": "lovable-portfolio" } },
  );
  if (!res.ok) return { ok: false, error: "GeeksforGeeks temporarily unavailable" };
  const json: any = await res.json();
  const days: Array<{ date: string; count: number }> = json?.data?.dailyContributions ?? [];
  const calendar: DayMap = {};
  for (const d of days) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) continue;
    if (Number(d.date.slice(0, 4)) !== year) continue;
    calendar[d.date] = (calendar[d.date] ?? 0) + Number(d.count);
  }
  return {
    ok: true,
    calendar,
    meta: {
      totalSubmissions: json?.data?.totalSubmissions ?? null,
      totalActiveDays: json?.data?.totalActiveDays ?? null,
    },
  };
}

// ============================================================
// Server function bindings — one per platform, all cache-through
// ============================================================

export const getGithubActivity = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => githubInput.parse(data))
  .handler(({ data }) => withCache("github", data.username, data.year, () => fetchGithub(data.username, data.year)));

export const getLeetcodeActivity = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => leetcodeInput.parse(data))
  .handler(({ data }) => withCache("leetcode", data.username, data.year, () => fetchLeetcode(data.username, data.year)));

export const getCodeforcesActivity = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => codeforcesInput.parse(data))
  .handler(({ data }) => withCache("codeforces", data.username, data.year, () => fetchCodeforces(data.username, data.year)));

export const getCodechefActivity = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => codechefInput.parse(data))
  .handler(({ data }) => withCache("codechef", data.username, data.year, () => fetchCodechef(data.username, data.year)));

export const getHackerrankActivity = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => hackerrankInput.parse(data))
  .handler(({ data }) => withCache("hackerrank", data.username, data.year, () => fetchHackerrank(data.username, data.year)));

export const getGfgActivity = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => gfgInput.parse(data))
  .handler(({ data }) => withCache("gfg", data.username, data.year, () => fetchGfg(data.username, data.year)));
