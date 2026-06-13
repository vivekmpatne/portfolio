import { profile } from "@/data/profile";
import { codingProfiles } from "@/data/links";
import { SectionHeader } from "./SectionHeader";
import { LiveStats } from "./LiveStats";
import { Code2, Target } from "lucide-react";

const focusAreas = [
  "Data Structures & Algorithms",
  "Full Stack Development",
  "Problem Solving",
  "Software Engineering",
];

const languages = ["C", "C++", "Java", "JavaScript", "Python", "SQL"];

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeader title="About" />
      <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
        {profile.bio}
      </p>

      <div className="mt-10">
        <div className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Live Coding Profiles
        </div>
        <LiveStats />
      </div>

      {/* Engineering Snapshot */}
      <div className="mt-10">
        <div className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Engineering Snapshot
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
                <Code2 className="h-4 w-4" />
              </div>
              <h3 className="font-display text-base font-semibold">Languages</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map((l) => (
                <span
                  key={l}
                  className="rounded-md border border-border bg-background/80 px-2.5 py-1 text-sm shadow-card"
                >
                  {l}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
                <Target className="h-4 w-4" />
              </div>
              <h3 className="font-display text-base font-semibold">Focus Areas</h3>
            </div>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {focusAreas.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground/60" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          More Profiles
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

export { SectionHeader } from "./SectionHeader";
