import { skills } from "@/data/skills";
import { SectionHeader } from "./About";

export function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeader kicker="02" title="Skills" />
      <div className="space-y-8">
        {Object.entries(skills).map(([category, items]) => (
          <div key={category}>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              {category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {items.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-border bg-card px-3 py-1.5 text-sm transition-colors hover:bg-accent"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
