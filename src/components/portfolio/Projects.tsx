import { ExternalLink, Github, Sparkles } from "lucide-react";
import { projects, type Project } from "@/data/projects";
import { SectionHeader } from "./SectionHeader";

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
  const [hero, ...restFeatured] = featured;
  const others = projects.filter((p) => !p.featured);

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeader title="Projects" />

      {hero && (
        <div className="mb-5">
          <ProjectCard project={hero} variant="hero" />
        </div>
      )}

      {restFeatured.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {restFeatured.map((p) => (
            <ProjectCard key={p.title} project={p} variant="featured" />
          ))}
        </div>
      )}

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

function ProjectCard({
  project,
  variant = "default",
}: {
  project: Project;
  variant?: "default" | "featured" | "hero";
}) {
  const isHero = variant === "hero";

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-foreground/30 hover:shadow-xl ${
        isHero ? "md:grid md:grid-cols-2 md:gap-0" : ""
      }`}
    >
      {project.image && (
        <div
          className={`relative overflow-hidden border-border bg-secondary ${
            isHero ? "border-b md:border-b-0 md:border-r aspect-[16/10] md:aspect-auto" : "aspect-[16/9] border-b"
          }`}
        >
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.display = "none";
            }}
          />
        </div>
      )}

      <div className={`flex flex-1 flex-col ${isHero ? "p-7 md:p-8" : "p-6"}`}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {project.featured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-accent px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> Featured
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
            <span className={`h-1.5 w-1.5 rounded-full ${statusDot[project.status]}`} />
            {statusLabel[project.status]}
          </span>
        </div>

        <h3 className={`font-display font-semibold ${isHero ? "text-2xl md:text-3xl" : "text-xl"}`}>
          {project.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
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
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <Github className="h-4 w-4" /> Code
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-opacity hover:opacity-90"
            >
              <ExternalLink className="h-4 w-4" /> Live
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
