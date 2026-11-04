import { useMemo } from "react";
import { Blocks, Braces, Layers3, Wrench, type LucideIcon } from "lucide-react";
import {
  SiJavascript, SiPython, SiCplusplus, SiMysql,
  SiReact, SiRedux, SiReactrouter, SiTailwindcss, SiHtml5, SiCss,
  SiNodedotjs, SiExpress, SiJsonwebtokens, SiMongodb, SiMongoose,
  SiGit, SiGithub, SiPostman, SiVercel, SiRailway, SiLinux,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { VscVscode } from "react-icons/vsc";
import type { IconType } from "react-icons";
import { skills } from "@/data/skills";
import { SectionHeader } from "./SectionHeader";

const techIcon: Record<string, IconType> = {
  JavaScript: SiJavascript, Python: SiPython, Java: FaJava, "C++": SiCplusplus, SQL: SiMysql,
  "React.js": SiReact, Redux: SiRedux, "React Router": SiReactrouter, "Tailwind CSS": SiTailwindcss,
  HTML5: SiHtml5, CSS3: SiCss, "Node.js": SiNodedotjs, "Express.js": SiExpress,
  "JWT Auth": SiJsonwebtokens, MongoDB: SiMongodb, Mongoose: SiMongoose, Git: SiGit,
  GitHub: SiGithub, Postman: SiPostman, Vercel: SiVercel, Railway: SiRailway, Linux: SiLinux,
  "VS Code": VscVscode,
};

type SkillGroup = { title: string; note: string; icon: LucideIcon; items: string[]; tone: string };

export function Skills() {
  const groups = useMemo<SkillGroup[]>(() => [
    {
      title: "Algorithms & systems",
      note: "Reason about complexity, data, and architecture.",
      icon: Braces,
      items: [...skills.Languages, ...skills.Concepts],
      tone: "text-primary",
    },
    {
      title: "Product engineering",
      note: "Build interfaces, services, and complete web flows.",
      icon: Layers3,
      items: [...skills.Frontend, ...skills["Backend & Database"]],
      tone: "text-secondary-accent",
    },
    {
      title: "Tools & workflow",
      note: "Ship, inspect, and maintain software day to day.",
      icon: Wrench,
      items: skills["Tools & Technologies"],
      tone: "text-signal",
    },
  ], []);

  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <SectionHeader eyebrow="The toolkit" title="Think in layers. Build end to end." subtitle="A working set of skills across problem solving, product engineering, and the tools that get software shipped." />
      <div className="grid gap-4 lg:grid-cols-3">
        {groups.map((group, index) => {
          const Icon = group.icon;
          return (
            <article key={group.title} className="group relative overflow-hidden rounded-[1.6rem] border border-border bg-card p-6 transition-colors hover:border-primary/30 sm:p-7">
              <div aria-hidden className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/[.035] blur-3xl transition-colors group-hover:bg-primary/[.09]" />
              <div className="relative flex items-start justify-between gap-4">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface ${group.tone}`}><Icon className="h-5 w-5" /></span>
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground">0{index + 1}</span>
              </div>
              <h3 className="relative mt-8 font-display text-xl font-semibold tracking-tight text-foreground">{group.title}</h3>
              <p className="relative mt-2 min-h-10 text-sm leading-6 text-muted-foreground">{group.note}</p>
              <div className="relative mt-6 flex flex-wrap gap-2">
                {group.items.map((item) => {
                  const TechIcon = techIcon[item];
                  return <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs text-foreground/85 transition-colors hover:border-primary/30 hover:bg-surface">
                    {TechIcon ? <TechIcon className="h-3.5 w-3.5 text-muted-foreground" /> : <Blocks className="h-3.5 w-3.5 text-muted-foreground" />}
                    {item}
                  </span>;
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
