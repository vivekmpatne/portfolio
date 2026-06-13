// ============================================================
// Live activity server functions
// - GitHub: GraphQL contribution calendar (requires GITHUB_TOKEN, scope: read:user)
// - LeetCode: public GraphQL (no auth)
// - Codeforces: public REST (no auth)
// All run server-side to avoid CORS + token leakage.
// ============================================================
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

type DayMap = Record<string, number>;

export type ActivityResult = {
  calendar: DayMap;
  meta: Record<string, number | string | null>;
  error?: string;
};

// Whitelist of the portfolio owner's handles. Server functions are public
// endpoints; restricting inputs prevents abuse of the server's GITHUB_TOKEN
// and stops the endpoints from acting as an open proxy for arbitrary lookups.
const ALLOWED_USERNAMES = {
  github: new Set(["vivekmpatne"]),
  leetcode: new Set(["vivekpatnem"]),
  codeforces: new Set(["vivekpatnem"]),
} as const;

const makeSchema = (allowed: ReadonlySet<string>) =>
  z.object({
    username: z.string().min(1).max(64).refine((u) => allowed.has(u), {
      message: "Username not allowed",
    }),
    year: z.number().int().min(2010).max(2100),
  });

const githubInput = makeSchema(ALLOWED_USERNAMES.github);
const leetcodeInput = makeSchema(ALLOWED_USERNAMES.leetcode);
const codeforcesInput = makeSchema(ALLOWED_USERNAMES.codeforces);

// ---------- GitHub ----------
export const getGithubActivity = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => githubInput.parse(data))
  .handler(async ({ data }): Promise<ActivityResult> => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) return { calendar: {}, meta: {}, error: "GITHUB_TOKEN not set" };

    const from = `${data.year}-01-01T00:00:00Z`;
    const to = `${data.year}-12-31T23:59:59Z`;
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

    try {
      const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "User-Agent": "lovable-portfolio",
        },
        body: JSON.stringify({ query, variables: { login: data.username, from, to } }),
      });
      if (!res.ok) return { calendar: {}, meta: {}, error: `GitHub temporarily unavailable` };
      const json: any = await res.json();
      const user = json?.data?.user;
      if (!user) return { calendar: {}, meta: {}, error: "GitHub user not found" };

      const calendar: DayMap = {};
      for (const w of user.contributionsCollection.contributionCalendar.weeks) {
        for (const d of w.contributionDays) calendar[d.date] = d.contributionCount;
      }
      return {
        calendar,
        meta: {
          totalContributions: user.contributionsCollection.contributionCalendar.totalContributions,
          repos: user.repositories.totalCount,
          followers: user.followers.totalCount,
          following: user.following.totalCount,
        },
      };
    } catch (e: any) {
      return { calendar: {}, meta: {}, error: e?.message ?? "GitHub fetch failed" };
    }
  });

// ---------- LeetCode ----------
export const getLeetcodeActivity = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => githubInput.parse(data))
  .handler(async ({ data }): Promise<ActivityResult> => {
    const query = `
      query userData($username: String!, $year: Int!) {
        matchedUser(username: $username) {
          submitStatsGlobal { acSubmissionNum { difficulty count } }
          userCalendar(year: $year) { submissionCalendar }
        }
        userContestRanking(username: $username) { rating attendedContestsCount }
      }`;

    try {
      const res = await fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; lovable-portfolio/1.0)",
          Referer: `https://leetcode.com/u/${data.username}/`,
        },
        body: JSON.stringify({ query, variables: { username: data.username, year: data.year } }),
      });
      if (!res.ok) return { calendar: {}, meta: {}, error: `LeetCode temporarily unavailable` };
      const json: any = await res.json();
      const user = json?.data?.matchedUser;
      if (!user) return { calendar: {}, meta: {}, error: "LeetCode user not found" };

      const raw = user.userCalendar?.submissionCalendar ?? "{}";
      const parsed: Record<string, number> = typeof raw === "string" ? JSON.parse(raw) : raw;
      const calendar: DayMap = {};
      for (const [ts, count] of Object.entries(parsed)) {
        const d = new Date(Number(ts) * 1000);
        if (d.getUTCFullYear() !== data.year) continue;
        const key = d.toISOString().slice(0, 10);
        calendar[key] = (calendar[key] ?? 0) + Number(count);
      }

      const ac = user.submitStatsGlobal?.acSubmissionNum ?? [];
      const byDiff = Object.fromEntries(ac.map((a: any) => [a.difficulty, a.count]));
      const contest = json?.data?.userContestRanking;

      return {
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
    } catch (e: any) {
      return { calendar: {}, meta: {}, error: e?.message ?? "LeetCode fetch failed" };
    }
  });

// ---------- Codeforces ----------
export const getCodeforcesActivity = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => githubInput.parse(data))
  .handler(async ({ data }): Promise<ActivityResult> => {
    // Codeforces' public API often returns 5xx under load. Retry transient
    // failures with exponential backoff before surfacing as unavailable.
    const fetchWithRetry = async (url: string, attempts = 3): Promise<Response | null> => {
      for (let i = 0; i < attempts; i++) {
        try {
          const r = await fetch(url, { headers: { "User-Agent": "lovable-portfolio" } });
          if (r.ok) return r;
          if (r.status < 500 && r.status !== 429) return r; // non-retryable client error
        } catch {
          /* network error — retry */
        }
        await new Promise((res) => setTimeout(res, 300 * Math.pow(2, i)));
      }
      return null;
    };

    try {
      const [statusRes, infoRes] = await Promise.all([
        fetchWithRetry(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(data.username)}`),
        fetchWithRetry(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(data.username)}`),
      ]);
      if (!statusRes || !statusRes.ok) {
        return { calendar: {}, meta: {}, error: "Codeforces temporarily unavailable" };
      }
      const status: any = await statusRes.json();
      const info: any = infoRes && infoRes.ok ? await infoRes.json() : null;

      const calendar: DayMap = {};
      for (const s of status.result ?? []) {
        const d = new Date(s.creationTimeSeconds * 1000);
        if (d.getUTCFullYear() !== data.year) continue;
        const key = d.toISOString().slice(0, 10);
        calendar[key] = (calendar[key] ?? 0) + 1;
      }

      const u = info?.result?.[0];
      return {
        calendar,
        meta: {
          rating: u?.rating ?? null,
          maxRating: u?.maxRating ?? null,
          rank: u?.rank ?? "unrated",
          maxRank: u?.maxRank ?? "unrated",
        },
      };
    } catch (e: any) {
      return { calendar: {}, meta: {}, error: "Codeforces temporarily unavailable" };
    }
  });

