import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertCircle, Layers } from "lucide-react";
import { profile } from "@/data/profile";
import { getLeetcodeTopics } from "@/lib/activity.functions";

type Level = "fundamental" | "intermediate" | "advanced";
type TopicRow = { tag: string; solved: number; level: Level };

const LEVELS: Array<{ id: Level; label: string; color: string }> = [
  { id: "fundamental", label: "Fundamental", color: "#22c55e" },
  { id: "intermediate", label: "Intermediate", color: "#f59e0b" },
  { id: "advanced", label: "Advanced", color: "#ef4444" },
];

const LEVEL_COLOR: Record<Level, string> = {
  fundamental: "#22c55e",
  intermediate: "#f59e0b",
  advanced: "#ef4444",
};

export function TopicBreakdown() {
  const username = profile.codingProfiles.leetcode.username;
  const fn = useServerFn(getLeetcodeTopics);
  const [filter, setFilter] = useState<Level | "all">("all");
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["leetcode-topics", username],
    queryFn: () => fn({ data: { username } }),
    staleTime: 10 * 60_000,
    retry: 1,
  });

  const topics = (data?.topics ?? []) as TopicRow[];
  const unavailable = !isLoading && (data?.status === "unavailable" || topics.length === 0);

  const total = useMemo(() => topics.reduce((a, t) => a + t.solved, 0), [topics]);
  const filtered = useMemo(
    () => (filter === "all" ? topics : topics.filter((t) => t.level === filter)),
    [topics, filter],
  );
  const visible = showAll ? filtered : filtered.slice(0, 10);
  const max = filtered[0]?.solved ?? 1;

  const perLevel = LEVELS.map((l) => ({
    ...l,
    count: topics.filter((t) => t.level === l.id).reduce((a, t) => a + t.solved, 0),
  }));

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-500" />
          <div>
            <div className="font-display text-base font-semibold">Topic-wise DSA Breakdown</div>
            <div className="text-xs text-muted-foreground">
              {isLoading
                ? "Loading…"
                : unavailable
                  ? "Unavailable"
                  : `${total} topic-tagged solves across ${topics.length} topics — live from LeetCode`}
            </div>
          </div>
        </div>
        <div className="flex rounded-lg border border-border p-0.5 text-xs font-medium">
          {(["all", ...LEVELS.map((l) => l.id)] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => { setFilter(id as Level | "all"); setShowAll(false); }}
              className={`rounded-md px-2.5 py-1 capitalize transition-colors ${
                filter === id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Level summary */}
      {!unavailable && !isLoading && (
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          {perLevel.map((l) => (
            <div key={l.id} className="rounded-xl border border-border px-4 py-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: l.color }} />
                  {l.label}
                </span>
                <span className="tabular-nums">
                  {total ? Math.round((l.count / total) * 100) : 0}%
                </span>
              </div>
              <div className="mt-1 font-display text-2xl font-semibold tabular-nums">{l.count}</div>
            </div>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 w-full animate-pulse rounded bg-muted" />
          ))}
        </div>
      )}

      {unavailable && !isLoading && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-700 dark:text-rose-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>Topic breakdown unavailable right now.</span>
        </div>
      )}

      {!isLoading && !unavailable && (
        <>
          <div className="space-y-2.5">
            {visible.map((t) => {
              const pct = total ? (t.solved / total) * 100 : 0;
              return (
                <div key={`${t.level}-${t.tag}`} className="group">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium">{t.tag}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {t.solved} · {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-[width] duration-700"
                      style={{
                        width: `${Math.max(3, (t.solved / max) * 100)}%`,
                        background: LEVEL_COLOR[t.level],
                      }}
                      title={`${t.tag}: ${t.solved} solved (${pct.toFixed(1)}% of tagged solves)`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length > 10 && (
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="mt-4 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {showAll ? "Show top 10" : `Show all ${filtered.length} topics`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
