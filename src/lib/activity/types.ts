// Shared, client-safe types for the activity system.
// Server adapters produce ActivityResult; UI consumes it as-is.

export type DayMap = Record<string, number>;
export type ActivityMeta = Record<string, number | string | null>;

// Freshness status:
//   fresh       — successfully fetched right now
//   cached      — upstream failed, showing last-known-good from persistent cache
//   unavailable — upstream failed AND no cache exists
export type ActivityStatus = "fresh" | "cached" | "unavailable";

export type ActivityResult = {
  calendar: DayMap;
  meta: ActivityMeta;
  status: ActivityStatus;
  fetchedAt: string | null; // ISO timestamp of the underlying data
  error?: string;           // human-readable error if upstream failed
};

export const PLATFORM_IDS = [
  "github",
  "leetcode",
  "codeforces",
  "codechef",
  "hackerrank",
  "gfg",
] as const;

export type PlatformId = (typeof PLATFORM_IDS)[number];

export const PLATFORM_LABELS: Record<PlatformId, string> = {
  github: "GitHub",
  leetcode: "LeetCode",
  codeforces: "Codeforces",
  codechef: "CodeChef",
  hackerrank: "HackerRank",
  gfg: "GeeksforGeeks",
};
