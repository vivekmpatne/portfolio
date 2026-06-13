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
      <ol className="relative ml-3 space-y-8 border-l border-border pl-8">
        {timeline.map((item, i) => {
          const Icon = iconFor[item.type];
          return (
            <li key={i} className="relative">
              <span className="absolute -left-[42px] flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                  <span className="text-xs text-muted-foreground">{item.duration}</span>
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
