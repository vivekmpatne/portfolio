import { profile } from "@/data/profile";
import { codingProfiles } from "@/data/links";

export function About() {
  const stats = [
    { label: "LeetCode Rating", value: profile.stats.leetcodeRating },
    { label: "Codeforces", value: profile.stats.codeforcesRating },
    { label: "Problems Solved", value: profile.stats.problemsSolved },
  ];

  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeader kicker="01" title="About" />
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <p className="text-lg leading-relaxed text-muted-foreground">
          {profile.bio}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border bg-card p-4 text-center"
            >
              <div className="font-display text-2xl font-semibold">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Coding Profiles
        </div>
        <div className="flex flex-wrap gap-2">
          {codingProfiles.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-foreground transition-colors hover:border-foreground/40 hover:bg-accent"
            >
              {p.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-10 flex items-end justify-between border-b border-border pb-4">
      <div>
        <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          {kicker}
        </div>
        <h2 className="mt-1 font-display text-3xl font-semibold md:text-4xl">
          {title}
        </h2>
      </div>
    </div>
  );
}
