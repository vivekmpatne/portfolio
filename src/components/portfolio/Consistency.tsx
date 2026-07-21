import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Flame, Trophy, Calendar, Zap, ChevronDown, AlertCircle } from "lucide-react";
import { SiGithub, SiLeetcode, SiCodeforces, SiCodechef, SiGeeksforgeeks, SiHackerrank } from "react-icons/si";
import { profile } from "@/data/profile";
import { SectionHeader } from "./SectionHeader";
import {
  getGithubActivity,
  getLeetcodeActivity,
  getCodeforcesActivity,
  getCodechefActivity,
  getHackerrankActivity,
  getGfgActivity,
} from "@/lib/activity.functions";
import type { ActivityResult, DayMap, PlatformId } from "@/lib/activity/types";
import { PLATFORM_LABELS } from "@/lib/activity/types";
import {
  buildYearDays,
  computeStats,
  mergeCalendars,
  totalActivity,
} from "@/lib/activity/streak";

const EMPTY: ActivityResult = { calendar: {}, meta: {}, status: "unavailable", fetchedAt: null };

function intensityClass(count: number) {
  if (count === 0) return "bg-muted/60";
  if (count <= 1) return "bg-emerald-200 dark:bg-emerald-900/70";
  if (count <= 3) return "bg-emerald-400 dark:bg-emerald-700";
  if (count <= 6) return "bg-emerald-500 dark:bg-emerald-500";
  return "bg-emerald-600 dark:bg-emerald-400";
}

type SourceDef = { key: PlatformId; icon: typeof SiGithub; color: string };
const SOURCES: SourceDef[] = [
  { key: "github",     icon: SiGithub,        color: "#6e7681" },
  { key: "leetcode",   icon: SiLeetcode,      color: "#FFA116" },
  { key: "codeforces", icon: SiCodeforces,    color: "#1F8ACB" },
  { key: "codechef",   icon: SiCodechef,      color: "#5B4638" },
  { key: "gfg",        icon: SiGeeksforgeeks, color: "#2F8D46" },
  { key: "hackerrank", icon: SiHackerrank,    color: "#2EC866" },
];

export function Consistency() {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];
  const [year, setYear] = useState(currentYear);

  const { github, leetcode, codeforces, codechef, hackerrank, gfg } = profile.codingProfiles;

  const ghFn = useServerFn(getGithubActivity);
  const lcFn = useServerFn(getLeetcodeActivity);
  const cfFn = useServerFn(getCodeforcesActivity);
  const ccFn = useServerFn(getCodechefActivity);
  const hrFn = useServerFn(getHackerrankActivity);
  const gfgFn = useServerFn(getGfgActivity);

  const opts = { staleTime: 10 * 60_000, retry: 1 as const };
  const queries = useQueries({
    queries: [
      { queryKey: ["activity", "github", github.username, year],       queryFn: () => ghFn({ data: { username: github.username, year } }), ...opts },
      { queryKey: ["activity", "leetcode", leetcode.username, year],   queryFn: () => lcFn({ data: { username: leetcode.username, year } }), ...opts },
      { queryKey: ["activity", "codeforces", codeforces.username, year], queryFn: () => cfFn({ data: { username: codeforces.username, year } }), ...opts },
      { queryKey: ["activity", "codechef", codechef.username, year],   queryFn: () => ccFn({ data: { username: codechef.username, year } }), ...opts },
      { queryKey: ["activity", "hackerrank", hackerrank.username, year], queryFn: () => hrFn({ data: { username: hackerrank.username, year } }), ...opts },
      { queryKey: ["activity", "gfg", gfg.username, year],             queryFn: () => gfgFn({ data: { username: gfg.username, year } }), ...opts },
    ],
  });

  const isLoading = queries.some((q) => q.isLoading);
  const results: Record<PlatformId, ActivityResult> = {
    github:     (queries[0].data as ActivityResult | undefined) ?? EMPTY,
    leetcode:   (queries[1].data as ActivityResult | undefined) ?? EMPTY,
    codeforces: (queries[2].data as ActivityResult | undefined) ?? EMPTY,
    codechef:   (queries[3].data as ActivityResult | undefined) ?? EMPTY,
    hackerrank: (queries[4].data as ActivityResult | undefined) ?? EMPTY,
    gfg:        (queries[5].data as ActivityResult | undefined) ?? EMPTY,
  };

  const cachedPlatforms = SOURCES.filter((s) => results[s.key].status === "cached").map((s) => PLATFORM_LABELS[s.key]);
  const unavailablePlatforms = SOURCES.filter((s) => results[s.key].status === "unavailable").map((s) => PLATFORM_LABELS[s.key]);

  const merged = useMemo(
    () => mergeCalendars(SOURCES.map((s) => results[s.key].calendar)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queries.map((q) => q.dataUpdatedAt).join(",")],
  );
  const days = useMemo(() => buildYearDays(year), [year]);
  const stats = useMemo(() => computeStats(merged, year), [merged, year]);
  const totalContribs = totalActivity(merged);

  const sourceCounts: Record<PlatformId, number> = {
    github:     totalActivity(results.github.calendar),
    leetcode:   totalActivity(results.leetcode.calendar),
    codeforces: totalActivity(results.codeforces.calendar),
    codechef:   totalActivity(results.codechef.calendar),
    gfg:        totalActivity(results.gfg.calendar),
    hackerrank: totalActivity(results.hackerrank.calendar),
  };

  const grid = useMemo(() => {
    const first = new Date(`${year}-01-01T00:00:00Z`);
    const startOffset = first.getUTCDay();
    const padded: Array<string | null> = [];
    for (let i = 0; i < startOffset; i++) padded.push(null);
    padded.push(...days);
    const weeks: Array<Array<string | null>> = [];
    for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));
    const months: Array<{ label: string; col: number }> = [];
    const seen = new Set<string>();
    weeks.forEach((week, col) => {
      const firstDay = week.find((d) => d !== null) as string | undefined;
      if (!firstDay) return;
      const m = firstDay.slice(0, 7);
      if (!seen.has(m)) {
        seen.add(m);
        months.push({ label: new Date(firstDay).toLocaleString("en", { month: "short" }), col });
      }
    });
    return { weeks, months };
  }, [days, year]);

  const currentDisplay = stats.current === null ? "—" : stats.current;
  const metrics = [
    { icon: Flame,    label: "Current Streak",    value: currentDisplay,     suffix: stats.current === null ? "" : "days", color: "text-orange-500" },
    { icon: Trophy,   label: "Longest Streak",    value: stats.longest,      suffix: "days",     color: "text-amber-500" },
    { icon: Calendar, label: `Active in ${year}`, value: stats.active,       suffix: "days",     color: "text-emerald-500" },
    { icon: Zap,      label: "Total Activity",    value: totalContribs,      suffix: "contribs", color: "text-indigo-500" },
  ];

  return (
    <section id="consistency" className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeader title="Consistency Dashboard" />
      <p className="-mt-2 mb-4 max-w-2xl text-muted-foreground">
        Real engineering activity aggregated live from GitHub, LeetCode, Codeforces, CodeChef, HackerRank, and GeeksforGeeks — no manual updates.
      </p>

      {(cachedPlatforms.length > 0 || unavailablePlatforms.length > 0) && (
        <div className="mb-6 space-y-2">
          {cachedPlatforms.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Showing last known data for: {cachedPlatforms.join(", ")}.
              </span>
            </div>
          )}
          {unavailablePlatforms.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-700 dark:text-rose-400">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>Unavailable (no cached snapshot yet): {unavailablePlatforms.join(", ")}.</span>
            </div>
          )}
        </div>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="group rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:border-foreground/30 hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 ${m.color}`} />
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  {m.label}
                </span>
              </div>
              <div className="mt-3 font-display text-3xl font-semibold">
                {isLoading ? <span className="inline-block h-7 w-12 animate-pulse rounded bg-muted align-middle" /> : m.value}
                {m.suffix && <span className="ml-1.5 text-xs font-normal text-muted-foreground">{m.suffix}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-display text-base font-semibold">Engineering Activity — {year}</div>
            <div className="text-xs text-muted-foreground">
              {isLoading ? "Loading…" : `${totalContribs} total contributions across linked platforms`}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex">
              <span>Less</span>
              {[0, 1, 3, 6, 9].map((n) => (
                <span key={n} className={`h-2.5 w-2.5 rounded-sm ${intensityClass(n)}`} />
              ))}
              <span>More</span>
            </div>
            <div className="relative">
              <select
                aria-label="Select year"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="appearance-none rounded-lg border border-border bg-background px-3 py-1.5 pr-8 text-sm font-medium shadow-card focus:outline-none focus:ring-2 focus:ring-foreground/20"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="relative ml-7 h-4 text-[10px] text-muted-foreground">
              {grid.months.map((m) => (
                <span key={`${m.label}-${m.col}`} className="absolute" style={{ left: `${m.col * 14}px` }}>
                  {m.label}
                </span>
              ))}
            </div>

            <div className="flex gap-[2px]">
              <div className="mr-1 flex flex-col gap-[2px] pr-1 text-[10px] text-muted-foreground">
                {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                  <div key={i} className="flex h-3 items-center">{d}</div>
                ))}
              </div>
              {grid.weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[2px]">
                  {Array.from({ length: 7 }).map((_, di) => {
                    const date = week[di];
                    if (!date) return <div key={di} className="h-3 w-3 rounded-sm bg-transparent" />;
                    const count = merged[date] ?? 0;
                    const perPlatform: string[] = [];
                    for (const s of SOURCES) {
                      const c = results[s.key].calendar[date] ?? 0;
                      if (c) perPlatform.push(`${PLATFORM_LABELS[s.key]}: ${c}`);
                    }
                    const title = [`${date} — ${count} ${count === 1 ? "contribution" : "contributions"}`, ...perPlatform].join("\n");
                    return (
                      <div
                        key={di}
                        title={title}
                        className={`h-3 w-3 rounded-sm transition-transform hover:scale-150 ${intensityClass(count)}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity breakdown */}
      <div className="mt-6">
        <div className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Activity Sources — {year}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SOURCES.map((s) => {
            const Icon = s.icon;
            const r = results[s.key];
            const count = sourceCounts[s.key];
            return (
              <div
                key={s.key}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-card transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-card-hover"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" style={{ color: s.color }} />
                  <span className="text-sm font-medium">{PLATFORM_LABELS[s.key]}</span>
                  {r.status === "cached" && (
                    <span className="rounded-full border border-amber-500/40 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-widest text-amber-600 dark:text-amber-400">
                      cached
                    </span>
                  )}
                  {r.status === "unavailable" && (
                    <span className="rounded-full border border-rose-500/40 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-widest text-rose-600 dark:text-rose-400">
                      offline
                    </span>
                  )}
                </div>
                <span className="font-display text-base font-semibold tabular-nums">
                  {r.status === "unavailable"
                    ? <span className="text-xs font-normal text-muted-foreground">Unavailable</span>
                    : count}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          All six platforms feed the heatmap live. Last-known-good snapshots are used automatically when a source is temporarily unavailable.
        </p>
      </div>
    </section>
  );
}

// silence unused-import lint for DayMap (type re-export from types.ts is used via mergeCalendars)
export type _DayMap = DayMap;
