import { Code2, Monitor, Server, Wrench, Brain, Terminal, type LucideIcon } from "lucide-react";
import {
  SiJavascript, SiPython, SiCplusplus, SiMysql,
  SiReact, SiRedux, SiReactrouter, SiTailwindcss, SiHtml5, SiCss,
  SiNodedotjs, SiExpress, SiJsonwebtokens, SiMongodb, SiMongoose, SiRedis,
  SiGit, SiGithub, SiPostman, SiVercel, SiRailway, SiDocker, SiKubernetes, SiLinux,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import { VscVscode } from "react-icons/vsc";
import type { IconType } from "react-icons";
import { skills } from "@/data/skills";
import { SectionHeader } from "./SectionHeader";

const categoryIcon: Record<string, LucideIcon> = {
  Languages: Code2,
  Frontend: Monitor,
  "Backend & Database": Server,
  "Tools & Technologies": Wrench,
  Concepts: Brain,
};

const techIcon: Record<string, IconType> = {
  // C: no react-icon (renders as text only)
  JavaScript: SiJavascript,
  Python: SiPython,
  Java: FaJava,
  "C++": SiCplusplus,
  SQL: SiMysql,
  "React.js": SiReact,
  React: SiReact,
  Redux: SiRedux,
  "React Router": SiReactrouter,
  "Tailwind CSS": SiTailwindcss,
  HTML5: SiHtml5,
  CSS3: SiCss,
  "Node.js": SiNodedotjs,
  "Express.js": SiExpress,
  "JWT Auth": SiJsonwebtokens,
  MongoDB: SiMongodb,
  Mongoose: SiMongoose,
  Redis: SiRedis,
  Git: SiGit,
  GitHub: SiGithub,
  Postman: SiPostman,
  Vercel: SiVercel,
  Railway: SiRailway,
  Docker: SiDocker,
  Kubernetes: SiKubernetes,
  Linux: SiLinux,
  "VS Code": VscVscode,
  "REST APIs": Terminal as unknown as IconType,
};

export function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeader title="Skills" />
      <div className="grid gap-5 md:grid-cols-2">
        {Object.entries(skills).map(([category, items]) => {
          const Icon = categoryIcon[category] ?? Code2;
          return (
            <div
              key={category}
              className="group relative rounded-2xl p-[1px] transition-all duration-300 hover:-translate-y-1"
              style={{
                background:
                  "linear-gradient(var(--card), var(--card)) padding-box, linear-gradient(135deg, transparent, transparent) border-box",
              }}
            >
              {/* Gradient border on hover */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)",
                  WebkitMask:
                    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                  padding: "1px",
                }}
              />
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-shadow duration-300 group-hover:shadow-card-hover">
                <div
                  className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(500px circle at 50% 0%, color-mix(in oklab, var(--foreground) 8%, transparent), transparent 60%)",
                  }}
                />
                <div className="relative mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background shadow-card transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">{category}</h3>
                </div>
                <div className="relative flex flex-wrap gap-2">
                  {items.map((skill) => {
                    const TechIcon = techIcon[skill];
                    return (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-sm shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:scale-105 hover:border-foreground/40 hover:bg-accent hover:shadow-card-hover"
                      >
                        {TechIcon ? <TechIcon className="h-3.5 w-3.5 text-muted-foreground" /> : null}
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
