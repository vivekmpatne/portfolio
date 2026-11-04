import { useEffect, useRef, useState } from "react";
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
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);
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
    enabled: active,
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setActive(true);
      observer.disconnect();
    }, { rootMargin: "160px" });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const events = data?.events ?? [];

  // Keep the decorative feed moving only while it is visible, at a modest frame rate.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || events.length === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let direction = 1;
    let pausedUntil = 0;
    let interval: number | undefined;
    let intersectsViewport = false;
    const step = () => {
      if (el.matches(":hover")) return;
      const now = Date.now();
      if (now < pausedUntil) return;
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 2) return;
      el.scrollTop += 0.7 * direction;
      if (el.scrollTop >= max - 1) {
        direction = -1;
        pausedUntil = now + 1800;
      } else if (el.scrollTop <= 0) {
        direction = 1;
        pausedUntil = now + 1800;
      }
    };
    const sync = () => {
      if (interval !== undefined) window.clearInterval(interval);
      interval = undefined;
      if (intersectsViewport && document.visibilityState === "visible") {
        interval = window.setInterval(step, 32);
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      intersectsViewport = entry.isIntersecting;
      sync();
    }, { rootMargin: "40px" });
    observer.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [events.length]);

  return (
    <div ref={rootRef} className="mt-6">
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
