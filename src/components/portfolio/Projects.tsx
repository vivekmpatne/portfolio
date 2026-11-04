import { useState } from "react";
import { ArrowUpRight, Github, Play, ExternalLink } from "lucide-react";
import { projects, type Project } from "@/data/projects";
import { SectionHeader } from "./SectionHeader";

function displayTitle(project: Project) {
  if (project.id === "intelligent-water-clogging-flood-prevention") return "Smart Drain Watch";
  if (project.id === "homeos-smart-home-automation") return "HomeOS";
  return project.title;
}

function ProjectPreview({ project }: { project: Project }) {
  const [showSecondary, setShowSecondary] = useState(false);
  const image = showSecondary && project.secondaryImage ? project.secondaryImage : project.image;
  const address = project.liveUrl?.replace(/^https?:\/\//, "").split("/")[0] ?? "project preview";
  if (!image) return null;

  return (
    <div className="project-frame relative overflow-hidden rounded-2xl border border-border p-2.5 sm:p-3">
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <div className="flex h-10 items-center gap-1.5 border-b border-border bg-card px-3">
          <span className="h-2 w-2 rounded-full bg-rose-400" />
          <span className="h-2 w-2 rounded-full bg-amber-300" />
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="ml-3 min-w-0 flex-1 truncate rounded-full bg-surface px-3 py-1 font-mono text-[9px] text-muted-foreground">{address}</span>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden bg-surface sm:aspect-[16/9]">
          <img src={image} alt={`${displayTitle(project)} ${showSecondary ? project.secondaryImageLabel ?? "alternate view" : project.imageLabel ?? "preview"}`} className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-[1.025]" loading="lazy" />
          {project.secondaryImage && (
            <div className="absolute bottom-3 left-3 flex rounded-full border border-white/15 bg-background/85 p-1 backdrop-blur-md">
              {[false, true].map((secondary) => (
                <button key={String(secondary)} type="button" onClick={() => setShowSecondary(secondary)} className={`min-h-8 rounded-full px-3 text-[10px] font-medium transition-colors ${showSecondary === secondary ? "bg-primary text-primary-foreground" : "text-white/75 hover:text-white"}`}>
                  {secondary ? project.secondaryImageLabel ?? "Details" : project.imageLabel ?? "Preview"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className={`group grid overflow-hidden rounded-[1.8rem] border border-border bg-card ${project.featured ? "lg:grid-cols-[.88fr_1.12fr]" : "lg:grid-cols-[.78fr_1.22fr]"}`}>
      <div className={`flex flex-col justify-center p-6 sm:p-9 ${project.featured ? "lg:p-11" : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-primary/25 bg-primary/[.07] px-3 py-1 font-mono text-[9px] uppercase tracking-[.12em] text-primary">{project.label ?? (project.featured ? "Featured project" : "Project")}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{project.statusDetail ?? project.status}</span>
        </div>
        <p className="mt-7 font-mono text-[10px] uppercase tracking-[.19em] text-secondary-accent">0{index + 1} <span className="mx-1 text-border">/</span> {project.subtitle?.split("·")[0]?.trim() ?? "Engineering project"}</p>
        <h3 className="mt-3 font-display text-4xl font-bold tracking-[-.06em] text-foreground sm:text-5xl">{displayTitle(project)}<span className="text-primary">.</span></h3>
        {project.subtitle && <p className="mt-2 text-xs leading-5 text-muted-foreground">{project.subtitle}</p>}
        <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground">{project.description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.techStack.map((tech) => <span key={tech} className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[10px] text-foreground/80">{tech}</span>)}
        </div>

        <div className="mt-7 flex flex-wrap gap-2.5">
          {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent-gradient px-4 text-xs font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"><ExternalLink className="h-3.5 w-3.5" />{project.liveLabel ?? "Live demo"}</a>}
          {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-xs font-medium text-foreground transition-colors hover:border-primary/35"><Github className="h-3.5 w-3.5" />{project.githubLabel ?? "GitHub"}</a>}
          {project.extraRepoUrl && <a href={project.extraRepoUrl} target="_blank" rel="noopener noreferrer" aria-label={project.extraRepoLabel ?? "Additional source code"} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary"><ArrowUpRight className="h-4 w-4" /></a>}
          {project.demoVideoUrl && <a href={project.demoVideoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-xs text-muted-foreground transition-colors hover:text-foreground"><Play className="h-3.5 w-3.5" />Demo video</a>}
        </div>
      </div>

      <div className={`flex items-center p-4 sm:p-6 ${project.featured ? "lg:pl-0 lg:py-8 lg:pr-8" : "lg:pl-0 lg:py-7 lg:pr-7"}`}>
        <ProjectPreview project={project} />
      </div>
    </article>
  );
}

export function Projects() {
  const ordered = [...projects.filter((project) => project.featured), ...projects.filter((project) => !project.featured)];
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <SectionHeader eyebrow="Selected work" title="Built to work beyond the screen." subtitle="A connected-city warning system and a hands-on smart home prototype, from hardware to interface." />
      <div className="space-y-5">
        {ordered.map((project, index) => <ProjectCard key={project.id} project={project} index={index} />)}
      </div>
    </section>
  );
}
