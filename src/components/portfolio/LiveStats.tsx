import { useQuery } from "@tanstack/react-query";
import { SiLeetcode, SiCodeforces, SiGithub } from "react-icons/si";
import { FaLinkedin as SiLinkedin } from "react-icons/fa";
import { profile } from "@/data/profile";

async function safeFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function useLeetcode() {
  return useQuery({
    queryKey: ["lc", profile.handles.leetcode],
    queryFn: async () => {
      const [solved, contest] = await Promise.all([
        safeFetch<any>(`https://alfa-leetcode-api.onrender.com/${profile.handles.leetcode}/solved`).catch(() => null),
        safeFetch<any>(`https://alfa-leetcode-api.onrender.com/${profile.handles.leetcode}/contest`).catch(() => null),
      ]);
      return {
        solved: solved?.solvedProblem ?? profile.stats.problemsSolved,
        easy: solved?.easySolved ?? profile.stats.leetcodeEasy,
        medium: solved?.mediumSolved ?? profile.stats.leetcodeMedium,
        hard: solved?.hardSolved ?? profile.stats.leetcodeHard,
        rating: contest?.contestRating ? Math.round(contest.contestRating) : profile.stats.leetcodeRating,
      };
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

function useCodeforces() {
  return useQuery({
    queryKey: ["cf", profile.handles.codeforces],
    queryFn: async () => {
      const [info, status] = await Promise.all([
        safeFetch<any>(`https://codeforces.com/api/user.info?handles=${profile.handles.codeforces}`),
        safeFetch<any>(`https://codeforces.com/api/user.status?handle=${profile.handles.codeforces}`).catch(() => null),
      ]);
      const u = info?.result?.[0];
      let solved = 0;
      if (status?.result) {
        const set = new Set<string>();
        for (const s of status.result) {
          if (s.verdict === "OK" && s.problem) {
            set.add(`${s.problem.contestId}-${s.problem.index}`);
          }
        }
        solved = set.size;
      }
      return {
        rating: u?.rating ?? profile.stats.codeforcesRating,
        rank: u?.rank ?? profile.stats.codeforcesRank,
        solved,
      };
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

function useGithub() {
  return useQuery({
    queryKey: ["gh", profile.handles.github],
    queryFn: async () => {
      const u = await safeFetch<any>(`https://api.github.com/users/${profile.handles.github}`);
      return {
        repos: u?.public_repos ?? profile.stats.githubRepos,
        followers: u?.followers ?? profile.stats.githubFollowers,
        following: u?.following ?? profile.stats.githubFollowing,
      };
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

function Card({
  icon,
  label,
  brand,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  brand: string;
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
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
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

export function LiveStats() {
  const lc = useLeetcode();
  const cf = useCodeforces();
  const gh = useGithub();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card icon={<SiLeetcode />} brand="#FFA116" label="LeetCode">
        {lc.isLoading ? (
          <Skeleton />
        ) : (
          <>
            <div className="font-display text-2xl font-semibold">
              {lc.data?.rating ?? profile.stats.leetcodeRating}
              <span className="ml-1 text-xs font-normal text-muted-foreground">rating</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {lc.data?.solved ?? profile.stats.problemsSolved} problems solved
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-md bg-emerald-500/10 px-2 py-1 text-emerald-600 dark:text-emerald-400">
                <div className="font-semibold">{lc.data?.easy ?? 0}</div>
                <div className="opacity-70">Easy</div>
              </div>
              <div className="rounded-md bg-amber-500/10 px-2 py-1 text-amber-600 dark:text-amber-400">
                <div className="font-semibold">{lc.data?.medium ?? 0}</div>
                <div className="opacity-70">Med</div>
              </div>
              <div className="rounded-md bg-rose-500/10 px-2 py-1 text-rose-600 dark:text-rose-400">
                <div className="font-semibold">{lc.data?.hard ?? 0}</div>
                <div className="opacity-70">Hard</div>
              </div>
            </div>
          </>
        )}
      </Card>

      <Card icon={<SiCodeforces />} brand="#1F8ACB" label="Codeforces">
        {cf.isLoading ? (
          <Skeleton />
        ) : (
          <>
            <div className="font-display text-2xl font-semibold">
              {cf.data?.rating ?? profile.stats.codeforcesRating}
              <span className="ml-1 text-xs font-normal text-muted-foreground">rating</span>
            </div>
            <div className="mt-1 text-xs capitalize text-muted-foreground">
              Rank: {String(cf.data?.rank ?? profile.stats.codeforcesRank)}
            </div>
            {cf.data?.solved ? (
              <div className="mt-2 text-xs text-muted-foreground">
                {cf.data.solved} problems solved
              </div>
            ) : null}
          </>
        )}
      </Card>

      <Card icon={<SiGithub />} brand="#6e7681" label="GitHub">
        {gh.isLoading ? (
          <Skeleton />
        ) : (
          <>
            <div className="font-display text-2xl font-semibold">
              {gh.data?.repos ?? profile.stats.githubRepos}
              <span className="ml-1 text-xs font-normal text-muted-foreground">repos</span>
            </div>
            <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
              <span><span className="font-semibold text-foreground">{gh.data?.followers ?? profile.stats.githubFollowers}</span> followers</span>
              <span><span className="font-semibold text-foreground">{gh.data?.following ?? profile.stats.githubFollowing}</span> following</span>
            </div>
          </>
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
