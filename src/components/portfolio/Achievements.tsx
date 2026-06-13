import { Code2, Trophy, Award, Users } from "lucide-react";
import { profile } from "@/data/profile";
import { SectionHeader } from "./SectionHeader";
import { LiveStats } from "./LiveStats";

export const achievements = [
  { icon: Code2, value: `${profile.stats.problemsSolved}+`, label: "DSA Problems Solved", color: "text-emerald-500" },
  { icon: Trophy, value: profile.stats.leetcodeRating, label: "LeetCode Contest Rating", color: "text-amber-500" },
  { icon: Award, value: profile.stats.codeforcesRating, label: "Codeforces Rating", color: "text-sky-500" },
  { icon: Users, value: `${profile.stats.linkedinConnections}+`, label: "LinkedIn Connections", color: "text-indigo-500" },
];

export function Achievements() {
  return (
    <section id="achievements" className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeader title="Achievements" />

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {achievements.map((a) => {
          const Icon = a.icon;
          return (
            <div
              key={a.label}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-foreground/30 hover:shadow-card-hover"
            >
              <Icon className={`h-6 w-6 ${a.color}`} />
              <div className="mt-4 font-display text-3xl font-semibold">{a.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{a.label}</div>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="mb-4 font-display text-lg font-semibold">Live Coding Profiles</h3>
        <LiveStats />
      </div>
    </section>
  );
}
