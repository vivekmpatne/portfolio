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
  type ActivityResult,
} from "@/lib/activity.functions";

// ----- Types -----
type DayMap = Record<string, number>;
const EMPTY: ActivityResult = { calendar: {}, meta: {} };


// ----- Aggregation -----
function mergeMaps(maps: DayMap[]): DayMap {
  const out: DayMap = {};
  for (const m of maps) {
    for (const [k, v] of Object.entries(m)) out[k] = (out[k] ?? 0) + v;
  }
  return out;
}

function buildYearDays(year: number): string[] {
  const days: string[] = [];
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year, 11, 31));
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function computeStreaks(days: string[], map: DayMap) {
  let longest = 0, run = 0, totalActive = 0;
  for (const day of days) {
    if ((map[day] ?? 0) > 0) { run++; totalActive++; if (run > longest) longest = run; }
    else run = 0;
  }
  // current streak = trailing active days from today backwards (within the dataset)
  let current = 0;
  const today = new Date().toISOString().slice(0, 10);
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i] > today) continue;
    if ((map[days[i]] ?? 0) > 0) current++;
    else break;
  }
  return { longest, current, totalActive };
}

function intensityClass(count: number) {
  if (count === 0) return "bg-muted/60";
  if (count <= 1) return "bg-emerald-200 dark:bg-emerald-900/70";
  if (count <= 3) return "bg-emerald-400 dark:bg-emerald-700";
  if (count <= 6) return "bg-emerald-500 dark:bg-emerald-500";
  return "bg-emerald-600 dark:bg-emerald-400";
}

const SOURCES = [
  { key: "github",     name: "GitHub",        icon: SiGithub,        color: "#6e7681" },
  { key: "leetcode",   name: "LeetCode",      icon: SiLeetcode,      color: "#FFA116" },
  { key: "codeforces", name: "Codeforces",    icon: SiCodeforces,    color: "#1F8ACB" },
  { key: "codechef",   name: "CodeChef",      icon: SiCodechef,      color: "#5B4638" },
  { key: "gfg",        name: "GeeksforGeeks", icon: SiGeeksforgeeks, color: "#2F8D46" },
  { key: "hackerrank", name: "HackerRank",    icon: SiHackerrank,    color: "#2EC866" },
] as const;

export function Consistency() {
  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];
  const [year, setYear] = useState(currentYear);

  const { github, leetcode, codeforces } = profile.codingProfiles;

  const ghFn = useServerFn(getGithubActivity);
  const lcFn = useServerFn(getLeetcodeActivity);
  const cfFn = useServerFn(getCodeforcesActivity);

  const queries = useQueries({
    queries: [
      {
        queryKey: ["activity", "github", github.username, year],
        queryFn: () => ghFn({ data: { username: github.username, year } }),
        staleTime: 10 * 60_000,
        retry: 1,
      },
      {
        queryKey: ["activity", "leetcode", leetcode.username, year],
        queryFn: () => lcFn({ data: { username: leetcode.username, year } }),
        staleTime: 10 * 60_000,
        retry: 1,
      },
      {
        queryKey: ["activity", "codeforces", codeforces.username, year],
        queryFn: () => cfFn({ data: { username: codeforces.username, year } }),
        staleTime: 10 * 60_000,
        retry: 1,
      },
    ],
  });

  const isLoading = queries.some((q) => q.isLoading);
  const gh = (queries[0].data as ActivityResult | undefined) ?? EMPTY;
  const lc = (queries[1].data as ActivityResult | undefined) ?? EMPTY;
  const cf = (queries[2].data as ActivityResult | undefined) ?? EMPTY;
  const errors = [gh.error, lc.error, cf.error].filter(Boolean) as string[];

  const sumValues = (m: DayMap) => Object.values(m).reduce((a, b) => a + b, 0);

  const merged = useMemo(() => mergeMaps([gh.calendar, lc.calendar, cf.calendar]), [gh, lc, cf]);
  const days = useMemo(() => buildYearDays(year), [year]);
  const stats = useMemo(() => computeStreaks(days, merged), [days, merged]);

  const sourceCounts: Record<string, number> = {
    github: sumValues(gh.calendar),
    leetcode: sumValues(lc.calendar),
    codeforces: sumValues(cf.calendar),
    codechef: 0,
    gfg: 0,
    hackerrank: 0,
  };
  const totalContribs = sumValues(merged);


  // Build heatmap grid: weeks of 7 days (Sun..Sat)
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

  const metrics = [
    { icon: Flame,    label: "Current Streak",    value: stats.current,     suffix: "days",     color: "text-orange-500" },
    { icon: Trophy,   label: "Longest Streak",    value: stats.longest,     suffix: "days",     color: "text-amber-500" },
    { icon: Calendar, label: `Active in ${year}`, value: stats.totalActive, suffix: "days",     color: "text-emerald-500" },
    { icon: Zap,      label: "Total Activity",    value: totalContribs,     suffix: "contribs", color: "text-indigo-500" },
  ];

  return (
    <section id="consistency" className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeader title="Consistency Dashboard" />
      <p className="-mt-2 mb-4 max-w-2xl text-muted-foreground">
        Real engineering activity aggregated live from GitHub, LeetCode, and Codeforces — no manual updates.
      </p>
      {errors.length > 0 && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>Some sources unavailable: {errors.join(" · ")}</span>
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
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">{m.suffix}</span>
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
                    const ghC = gh.calendar[date] ?? 0;
                    const lcC = lc.calendar[date] ?? 0;
                    const cfC = cf.calendar[date] ?? 0;
                    const parts = [
                      `${date} — ${count} ${count === 1 ? "contribution" : "contributions"}`,
                      ghC ? `GitHub: ${ghC}` : null,
                      lcC ? `LeetCode: ${lcC}` : null,
                      cfC ? `Codeforces: ${cfC}` : null,
                    ].filter(Boolean);
                    return (
                      <div
                        key={di}
                        title={parts.join("\n")}
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
            const count = sourceCounts[s.key] ?? 0;
            const tracked = ["github", "leetcode", "codeforces"].includes(s.key);
            return (
              <div
                key={s.key}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-card transition-all hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-card-hover"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" style={{ color: s.color }} />
                  <span className="text-sm font-medium">{s.name}</span>
                </div>
                <span className="font-display text-base font-semibold tabular-nums">
                  {tracked ? count : <span className="text-xs font-normal text-muted-foreground">linked</span>}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          CodeChef, GeeksforGeeks, and HackerRank don't expose public activity APIs — profiles are linked above.
        </p>
      </div>
    </section>
  );
}
