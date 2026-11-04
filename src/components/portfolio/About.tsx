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
    <section id="about" className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <p className="eyebrow-script mb-2 text-xl">a little about me</p>
      <SectionHeader title="Code on earth, eyes on the stars" />
      <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
        {profile.bio}
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[[`${profile.stats.problemsSolved}+`,"DSA problems solved"],["SIC IoT","Capstone shortlisted"],["RNSIT","B.E. CSE-DS ’28"],["8.35","Current CGPA"]].map(([v,l])=><div key={l} className="rounded-2xl border border-[#24201c] bg-[#141210] p-5"><strong className="display-heading text-2xl">{v}</strong><p className="mt-2 text-sm text-muted-foreground">{l}</p></div>)}
      </div>
      <div className="relative mt-8 flex items-end gap-5 overflow-hidden rounded-3xl border border-[#24201c] bg-[#12100e] p-4 sm:max-w-md">
        <div className="pointer-events-none absolute -right-6 -top-8 h-40 w-40 rounded-full bg-[#c2ad82]/20 blur-3xl" />
        <img src={profile.avatar} alt={profile.name} className="relative h-28 w-24 rounded-2xl object-cover sm:h-32 sm:w-28" />
        <div className="relative pb-1"><p className="eyebrow-script text-2xl">Vivek</p><span className="mt-2 inline-flex rounded-full border border-[#2a2723] bg-[#1c1a17] px-3 py-1 text-xs text-[#e8dec8]">RNSIT · Bengaluru</span></div>
      </div>

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
