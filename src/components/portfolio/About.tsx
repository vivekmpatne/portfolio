import { profile } from "@/data/profile";
import { codingProfiles } from "@/data/links";
import { SectionHeader } from "./SectionHeader";

const focusAreas = [
  "Data Structures & Algorithms",
  "Full Stack Development",
  "Problem Solving",
  "Software Engineering",
];

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeader title="About" />
      <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
        {profile.bio}
      </p>

      {/* Focus Areas — compact inline chips */}
      <div className="mt-8">
        <div className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Focus Areas
        </div>
        <div className="flex flex-wrap gap-2">
          {focusAreas.map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-sm text-foreground shadow-card"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/60" />
              {f}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          More Profiles
        </div>
        <div className="flex flex-wrap gap-2">
          {codingProfiles.map((p) => (
            <a
              key={p.name}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
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
