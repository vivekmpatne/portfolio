import { profile } from "@/data/profile";
import { codingProfiles } from "@/data/links";
import { SectionHeader } from "./SectionHeader";
import { LiveStats } from "./LiveStats";

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

// Re-export for any legacy imports
export { SectionHeader } from "./SectionHeader";
