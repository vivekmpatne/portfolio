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
    <section id="experience" className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeader title="Experience & Education" />
      <ol className="relative ml-3 space-y-8 border-l-2 border-border pl-8">
        {timeline.map((item, i) => {
          const Icon = iconFor[item.type];
          return (
            <li key={i} className="relative">
              <span className="absolute -left-[46px] flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card shadow-card ring-4 ring-background">
                <Icon className="h-4 w-4 text-foreground" />
              </span>
              <div className="rounded-xl border border-border bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-card-hover">
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
