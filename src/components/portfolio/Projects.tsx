import { useCallback, useRef, useState } from "react";
import { Award, BookOpen, ChevronLeft, ChevronRight, ExternalLink, Github, Play, Sparkles } from "lucide-react";
import { projects, type Project } from "@/data/projects";
import { SectionHeader } from "./SectionHeader";

const statusLabel: Record<Project["status"], string> = {
  live: "Live",
  "in-progress": "Building",
  planned: "Planned",
  completed: "Completed",
};

const statusDot: Record<Project["status"], string> = {
  live: "bg-green-500",
  "in-progress": "bg-amber-500",
  planned: "bg-slate-400",
  completed: "bg-cyan-500",
};

const GAP_PX = 20; // keep in sync with gap-5 below

export function Projects() {
  // Transform-based carousel: one project at a time, arrows slide the
  // next/previous card into the middle. GPU-composited translate + easing
  // makes the motion buttery smooth (no native scroll jank), and it wraps
  // around infinitely (next past the last loops back to the first).
  const ordered = [
    ...projects.filter((p) => p.featured),
    ...projects.filter((p) => !p.featured),
  ];
  const count = ordered.length;

  const [index, setIndex] = useState(0);
  const goTo = useCallback(
    (i: number) => setIndex(((i % count) + count) % count),
    [count]
  );

  // Light touch-swipe support so mobile still feels natural.
  const touchStartX = useRef<number | null>(null);

  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex items-end justify-between gap-4">
        <SectionHeader title="Projects" />
        <div className="mb-4 flex shrink-0 gap-2">
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => goTo(index - 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next project"
            onClick={() => goTo(index + 1)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className="overflow-hidden"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(dx) > 50) goTo(index + (dx < 0 ? 1 : -1));
        }}
      >
        <div
          className="flex gap-5 will-change-transform"
          style={{
            transform: `translateX(calc(-${index * 100}% - ${index * GAP_PX}px))`,
            transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {ordered.map((p, i) => (
            <div
              key={p.id}
              className={`w-full shrink-0 transition-opacity duration-500 ${
                i === index ? "opacity-100" : "opacity-40"
              }`}
              aria-hidden={i !== index}
            >
              <ProjectCard project={p} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex justify-center gap-2">
        {ordered.map((p, i) => (
          <button
            key={p.id}
            type="button"
            aria-label={`Go to ${p.title}`}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-foreground" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-foreground/30 hover:shadow-xl ${
        project.image ? "md:grid md:grid-cols-2 md:gap-0" : ""
      }`}
    >
      {project.image && (
        <div className="relative overflow-hidden border-b border-border bg-secondary aspect-[16/10] md:aspect-auto md:border-b-0 md:border-r">
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

      <div className="flex flex-1 flex-col p-7 md:p-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {project.category === "learning" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-accent px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">
              <BookOpen className="h-3 w-3" /> Learning Project
            </span>
          )}
          {project.featured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-accent px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> Featured
            </span>
          )}
          {project.label && (
            <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {project.label}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
            <span className={`h-1.5 w-1.5 rounded-full ${statusDot[project.status]}`} />
            {statusLabel[project.status]}
            {project.statusDetail ? ` — ${project.statusDetail}` : ""}
          </span>
        </div>

        <h3 className="font-display font-semibold text-2xl md:text-3xl">
          {project.title}
        </h3>
        {project.highlight && (
          <div className="mt-3 rounded-lg border border-foreground/20 bg-accent/60 px-3.5 py-2.5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Award className="h-4 w-4 shrink-0" />
              {project.highlight}
            </p>
            {project.highlightDetail && (
              <p className="mt-1 pl-6 text-xs text-muted-foreground">
                {project.highlightDetail}
              </p>
            )}
          </div>
        )}
        {project.subtitle && (
          <p className="mt-1 text-sm font-medium text-foreground/80">
            {project.subtitle}
          </p>
        )}
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
              <Github className="h-4 w-4" /> View on GitHub
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
          {project.demoVideoUrl && (
            <a
              href={project.demoVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <Play className="h-4 w-4" /> Demo Video
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
