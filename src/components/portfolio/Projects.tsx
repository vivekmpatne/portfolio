import { ExternalLink, Github } from "lucide-react";
import { projects, type Project } from "@/data/projects";
import { SectionHeader } from "./About";

const statusLabel: Record<Project["status"], string> = {
  live: "Live",
  "in-progress": "In Progress",
  planned: "Planned",
};

const statusDot: Record<Project["status"], string> = {
  live: "bg-green-500",
  "in-progress": "bg-amber-500",
  planned: "bg-slate-400",
};

export function Projects() {
  const featured = projects.filter((p) => p.featured);
  const others = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeader kicker="03" title="Projects" />
      <div className="grid gap-5 md:grid-cols-2">
        {featured.map((p) => (
          <ProjectCard key={p.title} project={p} large />
        ))}
      </div>
      {others.length > 0 && (
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {others.map((p) => (
            <ProjectCard key={p.title} project={p} />
          ))}
        </div>
      )}
    </section>
  );
}

function ProjectCard({ project, large = false }: { project: Project; large?: boolean }) {
  return (
    <article
      className={`group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-foreground/30 hover:shadow-lg ${
        large ? "md:p-8" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-xl font-semibold md:text-2xl">
          {project.title}
        </h3>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
          <span className={`h-1.5 w-1.5 rounded-full ${statusDot[project.status]}`} />
          {statusLabel[project.status]}
        </span>
      </div>
      <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
        {project.description}
      </p>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {project.techStack.map((t) => (
          <span
            key={t}
            className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {project.githubUrl ? (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
          >
            <Github className="h-4 w-4" /> Code
          </a>
        ) : (
          <span className="inline-flex items-center rounded-md border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground">
            Code Coming Soon
          </span>
        )}
        {project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-opacity hover:opacity-90"
          >
            <ExternalLink className="h-4 w-4" /> Live
          </a>
        ) : (
          <span className="inline-flex items-center rounded-md border border-dashed border-border px-3 py-1.5 text-sm text-muted-foreground">
            Live Coming Soon
          </span>
        )}
      </div>
    </article>
  );
}
