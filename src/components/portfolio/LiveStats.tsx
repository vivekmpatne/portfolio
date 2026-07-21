import { useQueries } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiLeetcode, SiCodeforces, SiGithub } from "react-icons/si";
import { FaLinkedin as SiLinkedin } from "react-icons/fa";
import { profile } from "@/data/profile";
import {
  getGithubActivity,
  getLeetcodeActivity,
  getCodeforcesActivity,
} from "@/lib/activity.functions";
import type { ActivityResult } from "@/lib/activity/types";

function Card({
  icon,
  label,
  brand,
  cached,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  brand: string;
  cached?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-foreground/30 hover:shadow-card-hover">
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: `radial-gradient(400px circle at 50% 0%, ${brand}22, transparent 60%)` }}
      />
      <div className="relative flex items-center justify-between">
        <span className="text-2xl" style={{ color: brand }}>{icon}</span>
        <div className="flex items-center gap-2">
          {cached && (
            <span className="rounded-full border border-amber-500/40 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-widest text-amber-600 dark:text-amber-400">
              cached
            </span>
          )}
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
        </div>
      </div>
      <div className="relative mt-4">{children}</div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2">
      <div className="h-7 w-20 animate-pulse rounded bg-muted" />
      <div className="h-3 w-28 animate-pulse rounded bg-muted" />
    </div>
  );
}

const Unavailable = () => (
  <span className="text-xs font-normal text-muted-foreground">Unavailable</span>
);

export function LiveStats() {
  const year = new Date().getFullYear();
  const { github, leetcode, codeforces } = profile.codingProfiles;

  const ghFn = useServerFn(getGithubActivity);
  const lcFn = useServerFn(getLeetcodeActivity);
  const cfFn = useServerFn(getCodeforcesActivity);

  const opts = { staleTime: 10 * 60_000, retry: 1 as const };
  const [ghQ, lcQ, cfQ] = useQueries({
    queries: [
      { queryKey: ["activity", "github", github.username, year],   queryFn: () => ghFn({ data: { username: github.username, year } }), ...opts },
      { queryKey: ["activity", "leetcode", leetcode.username, year], queryFn: () => lcFn({ data: { username: leetcode.username, year } }), ...opts },
      { queryKey: ["activity", "codeforces", codeforces.username, year], queryFn: () => cfFn({ data: { username: codeforces.username, year } }), ...opts },
    ],
  });

  const gh = ghQ.data as ActivityResult | undefined;
  const lc = lcQ.data as ActivityResult | undefined;
  const cf = cfQ.data as ActivityResult | undefined;

  // Cached and fresh snapshots both carry meta; only "unavailable" means no data at all.
  const ghOk = gh && gh.status !== "unavailable";
  const lcOk = lc && lc.status !== "unavailable";
  const cfOk = cf && cf.status !== "unavailable";

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card icon={<SiLeetcode />} brand="#FFA116" label="LeetCode" cached={lc?.status === "cached"}>
        {lcQ.isLoading ? (
          <Skeleton />
        ) : lcOk ? (
          <>
            <div className="font-display text-2xl font-semibold">
              {lc!.meta.contestRating ?? <Unavailable />}
              {lc!.meta.contestRating != null && (
                <span className="ml-1 text-xs font-normal text-muted-foreground">rating</span>
              )}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {Number(lc!.meta.totalSolved ?? 0)} problems solved
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-md bg-emerald-500/10 px-2 py-1 text-emerald-600 dark:text-emerald-400">
                <div className="font-semibold">{Number(lc!.meta.easy ?? 0)}</div>
                <div className="opacity-70">Easy</div>
              </div>
              <div className="rounded-md bg-amber-500/10 px-2 py-1 text-amber-600 dark:text-amber-400">
                <div className="font-semibold">{Number(lc!.meta.medium ?? 0)}</div>
                <div className="opacity-70">Med</div>
              </div>
              <div className="rounded-md bg-rose-500/10 px-2 py-1 text-rose-600 dark:text-rose-400">
                <div className="font-semibold">{Number(lc!.meta.hard ?? 0)}</div>
                <div className="opacity-70">Hard</div>
              </div>
            </div>
          </>
        ) : (
          <Unavailable />
        )}
      </Card>

      <Card icon={<SiCodeforces />} brand="#1F8ACB" label="Codeforces" cached={cf?.status === "cached"}>
        {cfQ.isLoading ? (
          <Skeleton />
        ) : cfOk ? (
          <>
            <div className="font-display text-2xl font-semibold">
              {cf!.meta.rating ?? <Unavailable />}
              {cf!.meta.rating != null && (
                <span className="ml-1 text-xs font-normal text-muted-foreground">rating</span>
              )}
            </div>
            <div className="mt-1 text-xs capitalize text-muted-foreground">
              Rank: {String(cf!.meta.rank ?? "unrated")}
            </div>
            {cf!.meta.maxRating != null && (
              <div className="mt-2 text-xs text-muted-foreground">
                Max: {String(cf!.meta.maxRating)} ({String(cf!.meta.maxRank ?? "—")})
              </div>
            )}
          </>
        ) : (
          <Unavailable />
        )}
      </Card>

      <Card icon={<SiGithub />} brand="#6e7681" label="GitHub" cached={gh?.status === "cached"}>
        {ghQ.isLoading ? (
          <Skeleton />
        ) : ghOk ? (
          <>
            <div className="font-display text-2xl font-semibold">
              {Number(gh!.meta.repos ?? 0)}
              <span className="ml-1 text-xs font-normal text-muted-foreground">repos</span>
            </div>
            <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
              <span>
                <span className="font-semibold text-foreground">{Number(gh!.meta.followers ?? 0)}</span> followers
              </span>
              <span>
                <span className="font-semibold text-foreground">{Number(gh!.meta.following ?? 0)}</span> following
              </span>
            </div>
            {gh!.meta.totalContributions != null && (
              <div className="mt-2 text-xs text-muted-foreground">
                {Number(gh!.meta.totalContributions)} contributions in {year}
              </div>
            )}
          </>
        ) : (
          <Unavailable />
        )}
      </Card>

      <Card icon={<SiLinkedin />} brand="#0A66C2" label="LinkedIn">
        <div className="font-display text-2xl font-semibold">
          {profile.stats.linkedinConnections}+
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Professional Connections
        </div>
      </Card>
    </div>
  );
}
