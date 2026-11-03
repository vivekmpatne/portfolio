import { GraduationCap, Briefcase, Award } from "lucide-react";
import { timeline, type TimelineType } from "@/data/experience";
import { SectionHeader } from "./SectionHeader";

const iconFor: Record<TimelineType, typeof GraduationCap> = {
  education: GraduationCap,
  experience: Briefcase,
  achievement: Award,
};

export function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
      <SectionHeader title="Experience & Education" />
      <ol className="relative ml-3 space-y-8 pl-8">
        <span aria-hidden className="absolute left-0 top-0 h-full w-0.5 rounded-full bg-gradient-primary opacity-60" />
        {timeline.map((item, i) => {
          const Icon = iconFor[item.type];
          return (
            <li key={i} className="relative">
              <span className="absolute -left-[47px] flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary shadow-glow ring-4 ring-background">
                <Icon className="h-4 w-4 text-primary-foreground" />
              </span>
              <div className="rounded-2xl border border-border/80 bg-card/95 p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card-hover">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                  <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground/80">
                    {item.duration}
                  </span>
                </div>
                <div className="mt-1 text-sm font-medium text-foreground/80">
                  {item.organization}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{item.details}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
