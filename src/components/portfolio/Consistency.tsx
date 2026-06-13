import { useMemo } from "react";
import { Flame, Trophy, Calendar, Zap } from "lucide-react";
import { activityLog, computeStreaks } from "@/data/activity";
import { SectionHeader } from "./SectionHeader";

function intensityClass(count: number) {
  if (count === 0) return "bg-muted/60";
  if (count <= 1) return "bg-emerald-200 dark:bg-emerald-900/60";
  if (count <= 3) return "bg-emerald-400 dark:bg-emerald-700";
  if (count <= 5) return "bg-emerald-500 dark:bg-emerald-500";
  return "bg-emerald-600 dark:bg-emerald-400";
}

export function Consistency() {
  const stats = useMemo(() => computeStreaks(activityLog), []);

  // Build week columns: 53 cols x 7 rows
  const grid = useMemo(() => {
    const log = activityLog;
    if (!log.length) return { weeks: [] as Array<Array<typeof log[number] | null>>, months: [] as Array<{ label: string; col: number }> };
    const first = new Date(log[0].date);
    const startOffset = first.getDay(); // 0 Sun .. 6 Sat
    const padded: Array<typeof log[number] | null> = [];
    for (let i = 0; i < startOffset; i++) padded.push(null);
    padded.push(...log);
    const weeks: Array<Array<typeof log[number] | null>> = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }
    // Month labels — show when month changes at the first non-null day of a week
    const months: Array<{ label: string; col: number }> = [];
    const seen = new Set<string>();
    weeks.forEach((week, col) => {
      const firstDay = week.find((d) => d !== null);
      if (!firstDay) return;
      const m = firstDay.date.slice(0, 7);
      if (!seen.has(m)) {
        seen.add(m);
        const label = new Date(firstDay.date).toLocaleString("en", { month: "short" });
        months.push({ label, col });
      }
    });
    return { weeks, months };
  }, []);

  const metrics = [
    { icon: Flame, label: "Current Streak", value: `${stats.currentStreak}`, suffix: "days", color: "text-orange-500" },
    { icon: Trophy, label: "Longest Streak", value: `${stats.longestStreak}`, suffix: "days", color: "text-amber-500" },
    { icon: Calendar, label: "Active This Year", value: `${stats.activeThisYear}`, suffix: "days", color: "text-emerald-500" },
    { icon: Zap, label: "Total Active Days", value: `${stats.totalActive}`, suffix: "all-time", color: "text-indigo-500" },
  ];

  return (
    <section id="consistency" className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeader title="Consistency Dashboard" />
      <p className="-mt-2 mb-8 max-w-2xl text-muted-foreground">
        Daily learning &amp; building activity across LeetCode, Codeforces, GeeksforGeeks, and GitHub —
        unified into one engineering signal.
      </p>

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
                {m.value}
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">{m.suffix}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-medium">Unified Activity Heatmap</div>
          <div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex">
            <span>Less</span>
            {[0, 1, 3, 5, 7].map((n) => (
              <span key={n} className={`h-2.5 w-2.5 rounded-sm ${intensityClass(n)}`} />
            ))}
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="relative ml-7 h-4 text-[10px] text-muted-foreground">
              {grid.months.map((m) => (
                <span
                  key={`${m.label}-${m.col}`}
                  className="absolute"
                  style={{ left: `${m.col * 14}px` }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            <div className="flex gap-[2px]">
              {/* Day labels */}
              <div className="mr-1 flex flex-col gap-[2px] pr-1 text-[10px] text-muted-foreground">
                {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
                  <div key={i} className="flex h-3 items-center">{d}</div>
                ))}
              </div>

              {grid.weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[2px]">
                  {Array.from({ length: 7 }).map((_, di) => {
                    const cell = week[di];
                    if (!cell) {
                      return <div key={di} className="h-3 w-3 rounded-sm bg-transparent" />;
                    }
                    return (
                      <div
                        key={di}
                        title={`${cell.date}: ${cell.count} contributions`}
                        className={`h-3 w-3 rounded-sm transition-transform hover:scale-125 ${intensityClass(cell.count)}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
