import { BriefcaseBusiness, GraduationCap } from "lucide-react";
import { profile } from "@/data/profile";
import { timeline } from "@/data/experience";
import { SectionHeader } from "./SectionHeader";

const timelineIcon = { experience: BriefcaseBusiness, education: GraduationCap, achievement: GraduationCap };

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <div className="grid gap-12 lg:grid-cols-[.86fr_1.14fr] lg:gap-20">
        <div>
          <SectionHeader eyebrow="The person behind the projects" title="Systems start with questions." />
          <p className="max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">{profile.bio}</p>

          <div className="mt-10 border-t border-border pt-6">
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-primary">What keeps me curious</p>
            <p className="mt-3 max-w-md font-display text-xl font-medium leading-8 tracking-tight text-foreground sm:text-2xl">Building software that connects clean interfaces to real systems.</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-6 sm:p-8">
          <div aria-hidden className="absolute -right-20 -top-28 h-64 w-64 rounded-full bg-secondary-accent/[.08] blur-[90px]" />
          <div className="relative mb-8 flex items-end justify-between gap-4 border-b border-border pb-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">Learning in practice</p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">Study meets systems.</h3>
            </div>
            <span className="hidden font-mono text-xs text-muted-foreground sm:block">01 — 02</span>
          </div>
          <ol className="relative space-y-0">
            {timeline.map((item, index) => {
              const Icon = timelineIcon[item.type];
              return (
                <li key={`${item.organization}-${item.duration}`} className="relative grid grid-cols-[42px_1fr] gap-4 pb-7 last:pb-0">
                  {index < timeline.length - 1 && <span aria-hidden className="absolute bottom-0 left-[19px] top-10 w-px bg-border" />}
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/[.08] text-primary"><Icon className="h-4 w-4" /></span>
                  <div className="min-w-0 pt-0.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h4 className="font-semibold text-foreground">{item.title}</h4>
                      <span className="font-mono text-[10px] text-muted-foreground">{item.duration}</span>
                    </div>
                    <p className="mt-1 text-xs text-secondary-accent">{item.organization}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.details}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}

export { SectionHeader } from "./SectionHeader";
