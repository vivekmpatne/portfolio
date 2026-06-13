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
      const [profileData, contest] = await Promise.all([
        safeFetch<any>(`https://alfa-leetcode-api.onrender.com/${profile.handles.leetcode}/solved`),
        safeFetch<any>(`https://alfa-leetcode-api.onrender.com/${profile.handles.leetcode}/contest`).catch(() => null),
      ]);
      return {
        solved: profileData?.solvedProblem ?? profile.stats.problemsSolved,
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
      const data = await safeFetch<any>(
        `https://codeforces.com/api/user.info?handles=${profile.handles.codeforces}`
      );
      const u = data?.result?.[0];
      return {
        rating: u?.rating ?? profile.stats.codeforcesRating,
        rank: u?.rank ?? profile.stats.codeforcesRank,
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
      };
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}

function StatCard({
  icon,
  label,
  primary,
  secondary,
  loading,
  brand,
}: {
  icon: React.ReactNode;
  label: string;
  primary: string | number;
  secondary: string;
  loading?: boolean;
  brand: string;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border bg-card/60 p-5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-foreground/30 hover:shadow-lg"
    >
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
      <div className="relative mt-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-7 w-20 animate-pulse rounded bg-muted" />
            <div className="h-3 w-28 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <>
            <div className="font-display text-2xl font-semibold">{primary}</div>
            <div className="mt-1 text-xs text-muted-foreground">{secondary}</div>
          </>
        )}
      </div>
    </div>
  );
}

export function LiveStats() {
  const lc = useLeetcode();
  const cf = useCodeforces();
  const gh = useGithub();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<SiLeetcode />}
        brand="#FFA116"
        label="LeetCode"
        loading={lc.isLoading}
        primary={lc.data?.rating ?? profile.stats.leetcodeRating}
        secondary={`${lc.data?.solved ?? profile.stats.problemsSolved} solved`}
      />
      <StatCard
        icon={<SiCodeforces />}
        brand="#1F8ACB"
        label="Codeforces"
        loading={cf.isLoading}
        primary={cf.data?.rating ?? profile.stats.codeforcesRating}
        secondary={String(cf.data?.rank ?? profile.stats.codeforcesRank)}
      />
      <StatCard
        icon={<SiGithub />}
        brand="#6e7681"
        label="GitHub"
        loading={gh.isLoading}
        primary={gh.data?.repos ?? profile.stats.githubRepos}
        secondary={`${gh.data?.followers ?? profile.stats.githubFollowers} followers`}
      />
      <StatCard
        icon={<SiLinkedin />}
        brand="#0A66C2"
        label="LinkedIn"
        primary={`${profile.stats.linkedinConnections}+`}
        secondary="connections"
      />
    </div>
  );
}
