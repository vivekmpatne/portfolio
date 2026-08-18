import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { profile } from "@/data/profile";
import { getActivityFeed } from "@/lib/feed.functions";

const PLATFORM_COLOR: Record<string, string> = {
  GitHub: "#6e7681",
  LeetCode: "#FFA116",
  Codeforces: "#1F8ACB",
  CodeChef: "#5B4638",
  HackerRank: "#2EC866",
  GeeksforGeeks: "#2F8D46",
  "TUF+": "#F97316",
};

function istStamp(iso: string) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${g("year")}-${g("month")}-${g("day")} ${g("hour")}:${g("minute")} IST`;
}

export function LiveLog() {
  const fetchFeed = useServerFn(getActivityFeed);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["activity-feed"],
    queryFn: () =>
      fetchFeed({
        data: {
          github: profile.codingProfiles.github.username,
          leetcode: profile.codingProfiles.leetcode.username,
          codeforces: profile.codingProfiles.codeforces.username,
        },
      }),
    refetchInterval: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const events = data?.events ?? [];

  // Auto-scroll upward like `tail -f`: keep the newest lines in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || events.length === 0) return;
    let raf = 0;
    let dir = 1;
    let paused = 0;
    const step = () => {
      if (!el.matches(":hover")) {
        if (paused > 0) {
          paused -= 1;
        } else {
          const max = el.scrollHeight - el.clientHeight;
          if (max > 2) {
            el.scrollTop += 0.35 * dir;
            if (el.scrollTop >= max - 1) {
              dir = -1;
              paused = 120;
            } else if (el.scrollTop <= 0) {
              dir = 1;
              paused = 120;
            }
          }
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [events.length]);

  return (
    <div className="mt-6">
      <div className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Live System Activity Log
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-2 font-mono text-[11px] text-muted-foreground">
          <span>~ $ tail -f /var/log/vivek/activity.log</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            live
          </span>
        </div>
        <div
          ref={scrollRef}
          className="max-h-64 space-y-1 overflow-y-auto px-4 py-3 font-mono text-[11px] leading-relaxed sm:text-xs"
        >
          {isLoading && <div className="text-muted-foreground">booting feed…</div>}
          {isError && <div className="text-muted-foreground">feed unavailable — retrying</div>}
          {events.map((e, i) => (
            <div key={i} className="flex flex-wrap gap-x-2 whitespace-pre-wrap break-words">
              <span className="text-muted-foreground">[{istStamp(e.ts)}]</span>
              <span style={{ color: PLATFORM_COLOR[e.platform] ?? "inherit" }}>
                [{e.platform}]
              </span>
              <span className={e.note ? "text-muted-foreground italic" : "text-emerald-600 dark:text-emerald-400"}>
                {e.text}
              </span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Live events from GitHub, LeetCode and Codeforces public APIs · refreshes every 5 minutes.
      </p>
    </div>
  );
}
